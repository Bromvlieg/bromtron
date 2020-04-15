#include <bt/api/class/map.h>

namespace bt {
	void from_json(const nlohmann::json& j, ApiCarrierOrder& obj) {
		obj.delay = j[0];
		obj.starId = j[1];
		obj.type = j[2];
		obj.ships = j[3];
	}

	void from_json(const nlohmann::json& j, ApiCarrier& obj) {
		j.at("n").get_to(obj.name);
		j.at("uid").get_to(obj.uid);
		j.at("puid").get_to(obj.puid);
		j.at("st").get_to(obj.ships);

		obj.location = {std::stof(j.at("x").get<std::string>()), std::stof(j.at("y").get<std::string>())};
		obj.target = {std::stof(j.at("lx").get<std::string>()), std::stof(j.at("ly").get<std::string>())};

		j.at("o").get_to(obj.orders);
		if (j.find("ouid") != j.end()) j.at("ouid").get_to(obj.ouid);
	}

	void from_json(const nlohmann::json& j, ApiStar& obj) {
		obj.visible = j.at("v") == "1";

		j.at("n").get_to(obj.name);

		j.at("uid").get_to(obj.uid);
		j.at("puid").get_to(obj.puid);
		obj.location = {std::stof(j.at("x").get<std::string>()), std::stof(j.at("y").get<std::string>())};

		if (!obj.visible) return;
		j.at("r").get_to(obj.resources);
		j.at("c").get_to(obj.carriers);

		j.at("i").get_to(obj.industry);
		j.at("s").get_to(obj.tech);
		j.at("e").get_to(obj.economy);

		j.at("st").get_to(obj.ships);
		j.at("nr").get_to(obj.nr);
	}

	void from_json(const nlohmann::json& j, ApiMapPlayerTech& obj) {
		j.at("level").get_to(obj.level);
		j.at("value").get_to(obj.value);
	}

	void from_json(const nlohmann::json& j, ApiMapPlayerResearch& obj) {
		j.at("weapons").get_to(obj.weapons);
		j.at("banking").get_to(obj.banking);
		j.at("propulsion").get_to(obj.range);
		j.at("research").get_to(obj.experimentation);
		j.at("terraforming").get_to(obj.terraforming);
		j.at("manufacturing").get_to(obj.manufacturing);
		j.at("scanning").get_to(obj.scanning);
	}

	void from_json(const nlohmann::json& j, ApiMapPlayer& obj) {
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

	void from_json(const nlohmann::json& j, ApiMap& obj) {
		j.at("fleet_speed").get_to(obj.fleetSpeed);
		j.at("productions").get_to(obj.cycles);
		j.at("tick_fragment").get_to(obj.tickFragment);
		j.at("now").get_to(obj.now);
		j.at("stars_for_victory").get_to(obj.starsForVictory);

		j.at("stars").get_to(obj.stars);
		j.at("fleets").get_to(obj.carriers);
		j.at("players").get_to(obj.players);

		obj.started = j.at("started") == 1;
		obj.paused = j.at("paused") == 1;
		obj.gameOver = j.at("game_over") == 1;
		obj.tradeScanned = j.at("trade_scanned") == 1;
		obj.war = j.at("war") == 1;
	}
}