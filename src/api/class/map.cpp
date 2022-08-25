#include <bt/api/class/map.h>

namespace bt {
	void from_json(const nlohmann::json& j, ApiMap& obj) {
		j.at("name").get_to(obj.name);

		j.at("admin").get_to(obj.adminUid);
		j.at("player_uid").get_to(obj.mapRequestedByPlayer);
		j.at("tick").get_to(obj.tick);
		j.at("tick_rate").get_to(obj.tickRate);
		j.at("tick_fragment").get_to(obj.tickFragment);
		j.at("now").get_to(obj.now);
		j.at("total_stars").get_to(obj.starsTotal);
		j.at("stars_for_victory").get_to(obj.starsForVictory);
		j.at("turn_based_time_out").get_to(obj.turnBasedTimeout);
		j.at("start_time").get_to(obj.startTime);
		j.at("productions").get_to(obj.productions);
		j.at("production_rate").get_to(obj.productionRate);
		j.at("production_counter").get_to(obj.productionCounter);
		j.at("trade_cost").get_to(obj.tradeCost);

		j.at("stars").get_to(obj.stars);
		j.at("fleets").get_to(obj.carriers);
		j.at("players").get_to(obj.players);

		j.at("fleet_speed").get_to(obj.fleetSpeed);

		obj.turnBased = j.at("turn_based") == 1;
		obj.started = j.at("started") == 1;
		obj.paused = j.at("paused") == 1;
		obj.gameOver = j.at("game_over") == 1;
		obj.tradeScanned = j.at("trade_scanned") == 1;
		obj.war = j.at("war") == 1;
	}

	float fixed2(float val) {
		int c = (int)(val * 100 + .5);
		return static_cast<float>(c) / 100.0f;
	}

	float ApiMap::getTotalShipsPerTick(const ApiPlayer& ply) const {
		auto construction_rate = static_cast<float>(ply.industry) * (5.0f + static_cast<float>(ply.research.manufacturing.level));
		auto spt = construction_rate / static_cast<float>(productionRate);
		if (spt != std::roundf(spt)) {
			spt = fixed2(spt);
		}

		return spt;
	}

	float ApiMap::getTotalShipsPerTick(const ApiIntelPlayer& ply) const {
		auto construction_rate = static_cast<float>(ply.totalIndustry) * (5.0f + static_cast<float>(ply.manufacturing));
		auto spt = construction_rate / static_cast<float>(productionRate);
		if (spt != std::roundf(spt)) {
			spt = fixed2(spt);
		}

		return spt;
	}
}
