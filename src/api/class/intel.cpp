#include <bt/api/class/intel.h>

namespace bt {
	void from_json(const nlohmann::json& j, ApiIntelPlayer& obj) {
		j.at("ts").get_to(obj.totalStars);
		j.at("e").get_to(obj.totalEconomy);
		j.at("i").get_to(obj.totalIndustry);
		j.at("s").get_to(obj.totalScience);
		j.at("sh").get_to(obj.totalShips);
		j.at("fl").get_to(obj.totalCarriers);
		j.at("wt").get_to(obj.weapons);
		j.at("bt").get_to(obj.banking);
		j.at("mt").get_to(obj.manufacturing);
		j.at("ht").get_to(obj.hyperspace);
		j.at("st").get_to(obj.scanning);
		j.at("gt").get_to(obj.experimentation);
		j.at("tt").get_to(obj.terraforming);

		j.at("uid").get_to(obj.uid);
	}

	void from_json(const nlohmann::json& j, ApiIntelStats& obj) {
		j.at("players").get_to(obj.players);
		j.at("tick").get_to(obj.tick);
	}

	void from_json(const nlohmann::json& j, ApiIntel& obj) {
		j.at("stats").get_to(obj.stats);
		std::sort(obj.stats.begin(), obj.stats.end(), [&](const auto& left, const auto& right) { return left.tick > right.tick; });
	}
}