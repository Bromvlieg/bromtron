#include <bt/api/api.h>
#include <curl/curl.h>
#include <stdexcept>
#include <mainframe/utils/string.h>

namespace bt {
	namespace downloader_funcs {
		size_t write_data(void *ptr, size_t size, size_t nmemb, FILE *stream) {
			return fwrite(ptr, size, nmemb, stream);
		}

		size_t write_data_stream(unsigned char* ptr, size_t size, size_t nmemb, mainframe::networking::Packet* packet) {
			packet->write(ptr, ptr + (size * nmemb), false);
			return size * nmemb;
		}

		size_t header_callback(char* buffer, size_t size, size_t nitems, std::map<std::string, std::string>& responseheaders) {
			size_t ret = nitems * size;

			std::string line = {buffer, buffer + nitems * size};
			if (!line.empty() && line.back() == '\n') line.pop_back();
			if (!line.empty() && line.back() == '\r') line.pop_back();

			auto parts = mainframe::utils::string::split(line, ": ");
			if (parts.empty()) return ret;

			auto& key = parts[0];
			std::string value;
			if (parts.size() > 1) {
				value = line.substr(key.size() + 2);
			}

			responseheaders[key] = value;
			return ret;
		}
	}

	mainframe::utils::ringbuffer<std::weak_ptr<Api::ApiHandle>> Api::calls {64};
	Api::curldata Api::makeCurl(const std::vector<std::string> headers, const std::vector<std::string> resolvers) {
		curldata ret;
		ret.curl = curl_easy_init();
		if (ret.curl == nullptr) throw std::runtime_error("curl is nullptr");

		ret.headers = nullptr;
		for (const auto& h : headers) {
			ret.headers = curl_slist_append(ret.headers, h.c_str());
		}

		ret.resolvers = nullptr;
		for (const auto& str : resolvers) {
			ret.resolvers = curl_slist_append(ret.resolvers, str.c_str());
		}

		return ret;
	}

	int Api::handleCurl(curldata& handle, const std::string& url) {
		auto curl = handle.curl;
		curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0L);
		curl_easy_setopt(curl, CURLOPT_SSL_VERIFYHOST, 0L);
		curl_easy_setopt(curl, CURLOPT_VERBOSE, 0L);
		curl_easy_setopt(curl, CURLOPT_POSTREDIR, 0L);
		curl_easy_setopt(curl, CURLOPT_COOKIEFILE, "cookies");
		curl_easy_setopt(curl, CURLOPT_COOKIEJAR, "cookies");
		curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
		curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
		curl_easy_setopt(curl, CURLOPT_HTTPHEADER, handle.headers);
		curl_easy_setopt(curl, CURLOPT_RESOLVE, handle.resolvers);
		curl_easy_setopt(curl, CURLOPT_HEADERFUNCTION, downloader_funcs::header_callback);

		// abort if connection is too slow / unstable
		curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT, 5L);
		curl_easy_setopt(curl, CURLOPT_LOW_SPEED_TIME, 10L); // 60 seconds
		curl_easy_setopt(curl, CURLOPT_LOW_SPEED_LIMIT, 30L); // ^ more than 30 bytes per second in that time

		CURLcode ret = curl_easy_perform(curl);

		curl_easy_cleanup(curl);
		if (handle.form != nullptr) curl_formfree(handle.form);
		if (handle.headers != nullptr) curl_slist_free_all(handle.headers);
		if (handle.resolvers != nullptr) curl_slist_free_all(handle.resolvers);

		return static_cast<int>(ret);
	}

	void Api::doCalls() {
		while (calls.available()) {
			auto ref = calls.pop();

			std::string path;
			std::string data;
			std::vector<std::string> headers;

			{
				auto inst = ref.lock();
				if (inst == nullptr) continue;

				path = inst->path;
				data = inst->data;
				headers = inst->headers;
			}

			printf("calling DO api: %s\n", path.c_str());

			mainframe::networking::Packet buffer;
			std::map<std::string, std::string> retheaders;
			if (!download(path, buffer, data, retheaders, headers)) {
				auto inst = ref.lock();
				if (inst == nullptr) continue;

				printf("calling DO api, FAIL 1: %s\n", path.c_str());
				inst->ptr->call(false, "connection to api failed");
				continue;
			}

			nlohmann::json ret;
			try {
				ret = nlohmann::json::parse(buffer.readAllString());
			} catch (const std::exception&) {
				auto inst = ref.lock();
				if (inst == nullptr) continue;

				printf("calling DO api, FAIL 2: %s\n", path.c_str());
				inst->ptr->call(false, "malformed response");
				continue;
			}

			std::string command;
			nlohmann::json value;
			if (ret.is_array()) {
				command = ret[0];
				value = ret[1];
			} else {
				command = ret["event"];
				value = ret["report"];
			}

			if (command == "meta:login_success") {
				if (retheaders.find("Set-Cookie") != retheaders.end()) {
					setCookie(retheaders["Set-Cookie"]);
					printf("updated login cookie\n");
				}
			}

			auto inst = ref.lock();
			if (inst == nullptr) continue;

			printf("calling DO api, SUCCESS: %s\n", path.c_str());

			bool success = true;
			if (command == "meta:error") { success = false; }
			if (command == "meta:login_required") { success = false; value = "Login required"; } // when not error `value` is set to empty object, we expect a string

			inst->ptr->call(success, value);
		}
	}

	std::shared_ptr<Api::ApiHandle> Api::call(const std::string& path, const nlohmann::json& data, CallbackType::Func callback) {
		auto ret = std::make_shared<ApiHandle>();
		ret->data = data.dump();
		ret->path = endpoint + path;
		ret->ptr = callbacks.add(callback);
		ret->headers = {
			"Accept: application/json",
			"Content-Type: application/json",
			"cookie: " + cookie
		};

		printf("calling ADD api   JSON: %s\n", ret->path.c_str());
		calls.push(ret);
		return ret;
	}

	std::shared_ptr<Api::ApiHandle> Api::call(const std::string& path, const std::map<std::string, std::string>& data, CallbackType::Func callback) {
		std::string postdata;

		for (auto& pair : data) {
			if (!postdata.empty()) postdata += "&";

			if (pair.second.empty()) {
				postdata += pair.first;
				continue;
			}

			postdata += pair.first + "=" + pair.second;
		}

		auto ret = std::make_shared<ApiHandle>();
		ret->data = postdata;
		ret->path = endpoint + path;
		ret->ptr = callbacks.add(callback);
		ret->headers = {
			"Accept: application/json",
			"Content-Type: application/x-www-form-urlencoded; charset=UTF-8",
			"cookie: " + cookie
		};

		printf("calling ADD api URLENC: %s\n", ret->path.c_str());
		calls.push(ret);
		return ret;
	}

	void Api::startThread() {
		if (runThread) return;

		runThread = true;
		workerThread = new std::thread([this]() {
			mainframe::utils::thread::setName("api thread");

			while (runThread) {
				Api::doCalls();
				std::this_thread::sleep_for(std::chrono::milliseconds(1));
			}
		});
	}

	void Api::stopThread() {
		if (!runThread) return;
		runThread = false;

		if (workerThread->joinable()) workerThread->join();
		workerThread = nullptr;
	}

	void Api::setEndpoint(const std::string& url) {
		endpoint = url;
	}

	void Api::setCookie(const std::string& cookie_) {
		cookie = cookie_;
	}

	bool Api::download(const std::string& url, const std::string& localpath, const std::vector<std::string> headers) {
		FILE* fp = fopen(localpath.c_str(), "wb");
		if (fp == nullptr) throw std::runtime_error("failed to open file: " + localpath);

		curldata handle;
		try {
			handle = makeCurl();
		} catch (...){
			fclose(fp);
			throw;
		}

		auto curl = handle.curl;

		curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, downloader_funcs::write_data);
		curl_easy_setopt(curl, CURLOPT_WRITEDATA, fp);

		int res = handleCurl(handle, url);
		fclose(fp);

		if (res == CURLE_OK) return true;

		remove(localpath.c_str());
		return false;
	}

	bool Api::download(const std::string& url, mainframe::networking::Packet& buffer, std::string body, std::map<std::string, std::string>& responseheaders, const std::vector<std::string> headers, const std::string& user, const std::string& pass, const std::vector<std::string> resolvers, const std::string& method) {
		auto handle = makeCurl(headers);
		auto curl = handle.curl;

		if (!user.empty()) curl_easy_setopt(curl, CURLOPT_USERNAME, user.c_str());
		if (!pass.empty()) curl_easy_setopt(curl, CURLOPT_PASSWORD, pass.c_str());
		if (!method.empty()) curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, method.c_str());

		curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, downloader_funcs::write_data_stream);
		curl_easy_setopt(curl, CURLOPT_WRITEDATA, &buffer);
		curl_easy_setopt(curl, CURLOPT_HEADERDATA, &responseheaders);
		if (!body.empty()) curl_easy_setopt(curl, CURLOPT_POSTFIELDS, body.c_str());

		if (handleCurl(handle, url) == CURLE_OK) {
			// switch from read to write
			buffer.seek(buffer.begin());
			return true;
		}

		return false;
	}

	bool Api::download(const std::string& url, mainframe::networking::Packet& buffer, curl_httppost* body, std::map<std::string, std::string>& responseheaders, const std::vector<std::string> headers, const std::string& user, const std::string& pass, const std::vector<std::string> resolvers, const std::string& method) {
		auto handle = makeCurl(headers, resolvers);
		auto curl = handle.curl;

		if (!user.empty()) curl_easy_setopt(curl, CURLOPT_USERNAME, user.c_str());
		if (!pass.empty()) curl_easy_setopt(curl, CURLOPT_PASSWORD, pass.c_str());
		if (!method.empty()) curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, method.c_str());

		curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, downloader_funcs::write_data_stream);
		curl_easy_setopt(curl, CURLOPT_WRITEDATA, &buffer);
		curl_easy_setopt(curl, CURLOPT_HEADERDATA, &responseheaders);
		if (body) curl_easy_setopt(curl, CURLOPT_HTTPPOST, body);

		auto ret = handleCurl(handle, url);
		if (ret == CURLE_OK) {
			// switch from read to write
			buffer.seek(buffer.begin());
			return true;
		}

		return false;
	}
}
