#pragma once

#include <string>
#include <vector>
#include <nlohmann/json.hpp>
#include <bt/api/class/playerloggedin.h>
#include <mainframe/math/vector3.h>

namespace bt {
	class ApiCarrierOrder {
	public:
		size_t args[4];
	};
	void from_json(const nlohmann::json& j, ApiCarrierOrder& obj);

	class ApiCarrier {
	public:
		std::string name;

		size_t uid = 0;
		size_t puid = 0;
		size_t ships = 0;

		mainframe::math::Vector2 location;
		mainframe::math::Vector2 target;
		std::vector<ApiCarrierOrder> orders;

		size_t w = 0; // ??

		bool flying = false;
	};
	void from_json(const nlohmann::json& j, ApiCarrier& obj);

	class ApiStar {
	public:
		std::string name;

		size_t uid = 0;
		size_t puid = 0;

		mainframe::math::Vector2 location;

		bool visible = false;

		// below fields only present if visible
		size_t tech = 0;
		size_t economy = 0;
		size_t industry = 0;

		size_t ships = 0;
		size_t carriers = 0;
		size_t resources = 0;

		size_t nr = 0; // ??
	};
	void from_json(const nlohmann::json& j, ApiStar& obj);

	class ApiMapPlayerTech {
	public:
		size_t level;
		float value;
	};
	void from_json(const nlohmann::json& j, ApiMapPlayerTech& obj);

	class ApiMapPlayerResearch {
	public:
		ApiMapPlayerTech range;
		ApiMapPlayerTech banking;
		ApiMapPlayerTech weapons;
		ApiMapPlayerTech scanning;
		ApiMapPlayerTech manufacturing;
		ApiMapPlayerTech experimentation;
		ApiMapPlayerTech terraforming;
	};
	void from_json(const nlohmann::json& j, ApiMapPlayerResearch& obj);

	class ApiMapPlayer {
	public:
		ApiMapPlayerResearch research;

		std::string name;
		size_t huid = 0;
		size_t uid = 0;

		size_t tech = 0;
		size_t economy = 0;
		size_t industry = 0;

		size_t regard = 0;
		size_t avatar = 0;

		size_t totalStars = 0;
		size_t totalCarriers = 0;
		size_t totalShips = 0;

		size_t turnsMissed = 0;
		size_t karmaToGive = 0;

		bool ai = false;
		bool conceded = false;
		bool ready = false;
	};
	void from_json(const nlohmann::json& j, ApiMapPlayer& obj);

	class ApiMap {
	public:
		std::string id;

		size_t fleetSpeed = 0;
		size_t cycles = 0;
		size_t tickFragment= 0;
		size_t now = 0;
		size_t starsForVictory = 0;
		size_t turnBasedTimeout = 0;

		std::map<std::string, ApiMapPlayer> players;
		std::map<std::string, ApiCarrier> carriers;
		std::map<std::string, ApiStar> stars;

		bool started = false;
		bool paused = false;
		bool gameOver = false;
		bool tradeScanned = false;
		bool war = false; // ???
	};
	void from_json(const nlohmann::json& j, ApiMap& obj);
}