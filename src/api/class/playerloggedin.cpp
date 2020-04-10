#include <bt/api/class/playerloggedin.h>

namespace bt {
	void from_json_research(const nlohmann::json& j, ApiPlayerGameResearchTech& tech, const std::string& key) {
		j.at("researchCost" + key).get_to(tech.cost);
		j.at("startingTech" + key).get_to(tech.start);
		j.at("tradeCost").get_to(tech.trade);
	}

	void from_json(const nlohmann::json& j, ApiPlayerGameResearch& obj) {
		from_json_research(j, obj.weapons, "Weapons");
		from_json_research(j, obj.banking, "Banking");
		from_json_research(j, obj.range, "Hyperspace");
		from_json_research(j, obj.scanning, "Scanning");
		from_json_research(j, obj.experimentation, "Experimentation");
		from_json_research(j, obj.terraforming, "Terraforming");
		from_json_research(j, obj.manufacturing, "Manufacturing");
	}

	void from_json(const nlohmann::json& j, ApiPlayerGameStartInfo& obj) {
		j.at("starsPerPlayer").get_to(obj.resources);
		j.at("tickRate").get_to(obj.starsPerPlayer);
		j.at("customStarfield").get_to(obj.customStarfield);
		j.at("starScatter").get_to(obj.starscatter);
		j.at("starfield").get_to(obj.starfield);

		if (j.at("randomGates") == 1) obj.randomGates = true;
	}

	void from_json(const nlohmann::json& j, ApiPlayerGameStartPlayerInfo& obj) {
		j.at("startingStars").get_to(obj.stars);
		j.at("startingCash").get_to(obj.money);
		j.at("startingShips").get_to(obj.ships);

		j.at("developmentCostScience").get_to(obj.tech);
		j.at("developmentCostEconomy").get_to(obj.economy);
		j.at("developmentCostIndustry").get_to(obj.industry);

		j.at("startingInfScience").get_to(obj.buildTech);
		j.at("startingInfEconomy").get_to(obj.buildEconomy);
		j.at("startingInfIndustry").get_to(obj.buildIndustry);
	}

	void from_json(const nlohmann::json& j, ApiPlayerGameStartTurnInfo& obj) {
		j.at("productionTicks").get_to(obj.cycle);
		j.at("tickRate").get_to(obj.tickRate);
		j.at("turnJumpTicks").get_to(obj.ticksPerTurn);
		j.at("turnTime").get_to(obj.turnTimer);

		if (j.at("turnBased") == 1) obj.turnBased = true;
	}

	void from_json(const nlohmann::json& j, ApiPlayerGameConfig& obj) {
		j.get_to(obj.tech);
		j.get_to(obj.start);
		j.get_to(obj.mapgen);
		j.get_to(obj.turn);

		j.at("name").get_to(obj.name);
		j.at("description").get_to(obj.desc);
		j.at("version").get_to(obj.version);
		j.at("adminUserId").get_to(obj.adminUserId);

		if (j.at("mirror") == 1) obj.mirror = true;
		if (j.at("anonymity") == 1) obj.anonymity = true;
		if (j.at("alliances") == 1) obj.allies = true;
		if (j.at("password") == "password") obj.passworded = 1;
		if (j.at("buildGates") == 1) obj.stargatesEnabled = true;
		if (j.at("tradeScanned") == 1) obj.tradeScanned = true;

		j.at("darkGalaxy").get_to(obj.darkGalaxy);
		j.at("starsForVictory").get_to(obj.starsForVictory);
		j.at("playerType").get_to(obj.playerType);

	}

	void from_json(const nlohmann::json& j, ApiPlayerGame& obj) {
		j.at("number").get_to(obj.id);
		j.at("name").get_to(obj.name);
		j.at("status").get_to(obj.status);
		j.at("creator").get_to(obj.creator);
		j.at("version").get_to(obj.version);

		j.at("players").get_to(obj.players);
		j.at("maxPlayers").get_to(obj.playersMax);

		j.at("config").get_to(obj.conf);
	}

	void from_json(const nlohmann::json& j, ApiPlayerLoggedInStats& obj) {
		j.at("karma").get_to(obj.karma);
		j.at("dollars_paid").get_to(obj.dollarsPaid);
		j.at("score").get_to(obj.score);
		j.at("games_in").get_to(obj.gamesIn);
		j.at("games_complete").get_to(obj.gamesCompleted);
		j.at("games_won").get_to(obj.gamesWon);
		j.at("games_second").get_to(obj.gamesSecond);
		j.at("games_third").get_to(obj.gamesThird);
	}

	void from_json(const nlohmann::json& j, ApiLocalPlayer& obj) {
		j.get_to(obj.stats);

		j.at("user_id").get_to(obj.id);
		j.at("avatar").get_to(obj.avatar);
		j.at("badges").get_to(obj.badges);
		j.at("alias").get_to(obj.username);
		j.at("user_email").get_to(obj.email);

		j.at("allow_email").get_to(obj.allowEmails);
		j.at("has_password").get_to(obj.hasPassword);
		j.at("local_account").get_to(obj.localAccount);
		j.at("email_verified").get_to(obj.emailVerified);
		j.at("subscribed_until").get_to(obj.subscriptionDate);

		j.at("open_games").get_to(obj.gamesOpen);
		j.at("owned_games").get_to(obj.gamesCreated);
		j.at("complete_games").get_to(obj.gamesCompleted);
	}
}