#include <bt/api/api.h>

namespace bt {
	std::shared_ptr<Api::ApiHandle> Api::getMap(const std::string& mapId, CallbackMap callback) {
		std::map<std::string, std::string> data;
		data["type"] = "order";
		data["order"] = "full_universe_report";
		data["version"] = ""; // empty ????
		data["game_number"] = mapId;

		return call("trequest/order", data, [mapId, callback](bool success, const nlohmann::json& ret) {
			if (!success) {
				callback({}, ret);
				return;

			}

			ApiMap retmap = ret;
			retmap.id = mapId;

			callback(retmap, "");
		});
	}
}