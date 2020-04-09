#include <bt/api/api.h>

namespace bt {
	std::shared_ptr<Api::ApiHandle> Api::login(const std::string& user, const std::string& pass, CallbackBasic callback) {
		std::map<std::string, std::string> data;
		data["type"] = "login";
		data["alias"] = user;
		data["password"] = pass;

		return call("arequest/login", data, [callback](bool success, const nlohmann::json& ret) {
			callback(success, success ? "" : ret);
		});
	}

	std::shared_ptr<Api::ApiHandle> Api::initPlayer(CallbackInitPlayer callback) {
		std::map<std::string, std::string> data;
		data["type"] = "init_player";

		return call("mrequest/init_player", data, [callback](bool success, const nlohmann::json& ret) {
			if (!success) {
				callback({}, ret);
				return;

			}

			callback(ret, "");
		});
	}
}