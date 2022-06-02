#include <bt/api/api.h>
#include <filesystem>
#include <fmt/format.h>
#include <iostream>
#include <fstream>

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

			auto savefolder = fmt::format("saves/{}", retmap.id);
			auto savename = fmt::format("{}/{}.json", savefolder, retmap.tick);

			if (!std::filesystem::is_directory(savefolder)) {
				std::filesystem::create_directories(savefolder);
			}

			std::ofstream out(savename);
			out << ret.dump(2);
			out.close();

			callback(retmap, "");
		});
	}

	std::shared_ptr<Api::ApiHandle> Api::getIntel(const std::string& mapId, CallbackIntel callback) {
		std::map<std::string, std::string> data;
		data["type"] = "intel_data";
		data["version"] = ""; // empty ????
		data["game_number"] = mapId;

		return call("trequest/intel_data", data, [mapId, callback](bool success, const nlohmann::json& ret) {
			if (!success) {
				callback({}, ret);
				return;

			}

			ApiIntel intel = ret;

			size_t startTick = 0;
			size_t endTick = 0;

			if (!intel.stats.empty()) {
				startTick = intel.stats.front().tick;
				endTick = intel.stats.back().tick;
			}

			auto savefolder = fmt::format("saves/{}/intel", mapId);
			auto savename = fmt::format("{}/{}-{}.json", savefolder, startTick, endTick);

			if (!std::filesystem::is_directory(savefolder)) {
				std::filesystem::create_directories(savefolder);
			}

			std::ofstream out(savename);
			out << ret.dump(2);
			out.close();

			callback(intel, "");
		});
	}
}
