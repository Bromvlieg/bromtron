#pragma once

#include <string>
#include <vector>
#include <nlohmann/json.hpp>

namespace bt {
	class ApiPlayerLoggedInStats {
	public:
		size_t dollarsPaid = 0;
		size_t karma = 0;
		size_t score = 0;

		size_t gamesIn = 0;
		size_t gamesWon = 0;
		size_t gamesCompleted = 0;
		size_t gamesSecond = 0;
		size_t gamesThird = 0;
	};
	void from_json(const nlohmann::json& j, ApiPlayerLoggedInStats& obj);

	class ApiPlayerGameResearchTech {
	public:
		size_t cost;
		size_t start;
		size_t max;
		size_t trade;
	};

	class ApiPlayerGameResearch {
	public:
		ApiPlayerGameResearchTech range;
		ApiPlayerGameResearchTech banking;
		ApiPlayerGameResearchTech weapons;
		ApiPlayerGameResearchTech scanning;
		ApiPlayerGameResearchTech manufacturing;
		ApiPlayerGameResearchTech experimentation;
		ApiPlayerGameResearchTech terraforming;
	};
	void from_json(const nlohmann::json& j, ApiPlayerGameResearch& obj);

	class ApiPlayerGameStartPlayerInfo {
	public:
		size_t stars = 0;
		size_t money = 0;
		size_t ships = 0;

		size_t tech = 0;
		size_t economy = 0;
		size_t industry = 0;

		size_t buildTech = 0;
		size_t buildEconomy = 0;
		size_t buildIndustry = 0;
	};
	void from_json(const nlohmann::json& j, ApiPlayerGameStartPlayerInfo& obj);

	class ApiPlayerGameStartInfo {
	public:
		size_t resources = 0;
		size_t starsPerPlayer = 0;

		bool randomGates = false;

		std::string starfield;
		std::string starscatter;
		std::string customStarfield;
	};
	void from_json(const nlohmann::json& j, ApiPlayerGameStartInfo& obj);

	class ApiPlayerGameStartTurnInfo {
	public:
		size_t cycle = 0; // amount of ticks per cycle
		size_t tickRate = 0; // minutes per tick
		size_t ticksPerTurn = 0;
		size_t turnTimer = 0; // max minutes per turn

		bool turnBased = false;
	};
	void from_json(const nlohmann::json& j, ApiPlayerGameStartTurnInfo& obj);

	class ApiPlayerGameConfig {
	public:
		ApiPlayerGameResearch tech;
		ApiPlayerGameStartPlayerInfo start;
		ApiPlayerGameStartInfo mapgen;
		ApiPlayerGameStartTurnInfo turn;

		std::string name;
		std::string desc;
		std::string version;
		std::string adminUserId;

		bool mirror = false;
		bool anonymity = false;
		bool allies = false;
		bool passworded = false;
		bool stargatesEnabled = false;
		bool tradeScanned = false;

		size_t darkGalaxy = 0;
		size_t starsForVictory = 0;
		size_t playerType = 0;
	};
	void from_json(const nlohmann::json& j, ApiPlayerGameConfig& obj);

	class ApiPlayerGame {
	public:
		std::string id;
		std::string name;
		std::string status;
		std::string creator;
		std::string version;

		size_t players = 0;
		size_t playersMax = 0;

		ApiPlayerGameConfig conf;
	};
	void from_json(const nlohmann::json& j, ApiPlayerGame& obj);

	class ApiLocalPlayer {
	public:
		size_t localAccount = 0;
		size_t avatar = 0;

		std::string id;
		std::string username;
		std::string email;
		std::string badges;

		std::string subscriptionDate;

		bool allowEmails = false;
		bool emailVerified = false;
		bool hasPassword = false;

		ApiPlayerLoggedInStats stats;

		std::vector<ApiPlayerGame> gamesCompleted;
		std::vector<ApiPlayerGame> gamesOpen;
		std::vector<ApiPlayerGame> gamesCreated;
	};
	void from_json(const nlohmann::json& j, ApiLocalPlayer& obj);
}