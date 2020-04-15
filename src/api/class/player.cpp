#include <bt/api/class/player.h>

namespace bt {
	void from_json(const nlohmann::json& j, ApiPlayer& obj) {
		j.at("alias").get_to(obj.name);
		j.at("uid").get_to(obj.uid);

		j.at("total_industry").get_to(obj.industry);
		j.at("total_economy").get_to(obj.economy);
		j.at("total_science").get_to(obj.tech);

		j.at("regard").get_to(obj.regard);
		j.at("avatar").get_to(obj.avatar);
		j.at("huid").get_to(obj.huid);

		j.at("total_stars").get_to(obj.totalStars);
		j.at("total_fleets").get_to(obj.totalCarriers);
		j.at("total_strength").get_to(obj.totalShips);

		j.at("missed_turns").get_to(obj.turnsMissed);
		j.at("karma_to_give").get_to(obj.karmaToGive);

		j.at("tech").get_to(obj.research);

		obj.ai = j.at("ai") == 1;
		obj.conceded = j.at("conceded") == 1;
		obj.ready = j.at("ready") == 1;
	}
}