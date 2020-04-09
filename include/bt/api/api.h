#pragma once

#include <string>
#include <fstream>
#include <vector>
#include <map>
#include <mutex>
#include <mainframe/networking/packet.h>
#include <mainframe/utils/eventnamed.hpp>
#include <mainframe/utils/ringbuffer.hpp>
#include <mainframe/utils/thread.h>
#include <curl/curl.h>
#include <nlohmann/json.hpp>
#include <bt/api/class/playerloggedin.h>

namespace bt {
	namespace downloader_funcs {
		size_t write_data(void* ptr, size_t size, size_t nmemb, FILE* stream);
		size_t write_data_stream(unsigned char* ptr, size_t size, size_t nmemb, mainframe::networking::Packet* packet);
	}

	class Api {
	public:
		using CallbackType = mainframe::utils::EventNamed<bool, nlohmann::json>;

		struct ApiHandle {
			std::shared_ptr<CallbackType::EventScoped> ptr;
			std::string data;
			std::string path;
			std::vector<std::string> headers;
		};

	private:
		CallbackType callbacks;

		struct curldata {
			CURL* curl = nullptr;
			curl_slist* headers = nullptr;
			curl_slist* resolvers = nullptr;
			curl_httppost* form = nullptr;
		};

		std::string endpoint;
		std::string cookie;
		bool runThread = false;
		std::thread* workerThread = nullptr;

		static curldata makeCurl(const std::vector<std::string> headers = {}, const std::vector<std::string> resolvers = {});
		static int handleCurl(curldata& handle, const std::string& url);
		static bool download(const std::string& url, const std::string& localpath, const std::vector<std::string> headers = {});
		static bool download(const std::string& url, mainframe::networking::Packet& buffer, std::string body, std::map<std::string, std::string>& responseheaders, const std::vector<std::string> headers = {}, const std::string& user = "", const std::string& pass = "", const std::vector<std::string> resolvers = {}, const std::string& method = "");
		static bool download(const std::string& url, mainframe::networking::Packet& buffer, curl_httppost* body, std::map<std::string, std::string>& responseheaders, const std::vector<std::string> headers = {}, const std::string& user = "", const std::string& pass = "", const std::vector<std::string> resolvers = {}, const std::string& method = "");

		static mainframe::utils::ringbuffer<std::weak_ptr<ApiHandle>> calls;

	public:
		void doCalls();
		std::shared_ptr<ApiHandle> call(const std::string& path, const nlohmann::json& data, CallbackType::Func callback);
		std::shared_ptr<ApiHandle> call(const std::string& path, const std::map<std::string, std::string>& data, CallbackType::Func callback);
		void setEndpoint(const std::string& url);
		void setCookie(const std::string& cookie_);

		void startThread();
		void stopThread();


		using CallbackBasic = mainframe::utils::EventNamed<bool, const std::string&>::Func;
		std::shared_ptr<ApiHandle> login(const std::string& user, const std::string& pass, CallbackBasic callback);

		using CallbackInitPlayer = mainframe::utils::EventNamed<ApiLocalPlayer, const std::string&>::Func;
		std::shared_ptr<ApiHandle> initPlayer(CallbackInitPlayer callback);
	};
}