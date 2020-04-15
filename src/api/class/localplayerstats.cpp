#include <bt/api/class/localplayerstats.h>

namespace bt {
	void from_json(const nlohmann::json& j, ApiLocalPlayerStats& obj) {
		j.at("karma").get_to(obj.karma);
		j.at("dollars_paid").get_to(obj.dollarsPaid);
		j.at("score").get_to(obj.score);
		j.at("games_in").get_to(obj.gamesIn);
		j.at("games_complete").get_to(obj.gamesCompleted);
		j.at("games_won").get_to(obj.gamesWon);
		j.at("games_second").get_to(obj.gamesSecond);
		j.at("games_third").get_to(obj.gamesThird);
	}
}