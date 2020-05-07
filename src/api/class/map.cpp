#include <bt/api/class/map.h>

namespace bt {
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