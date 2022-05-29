#pragma once

#include <string>
#include <vector>
#include <nlohmann/json.hpp>
#include <bt/api/class/player.h>
#include <bt/api/class/star.h>
#include <bt/api/class/carrier.h>
#include <mainframe/math/vector3.h>

namespace bt {
	class ApiMap {
	public:
		std::string id;
		std::string name;

		size_t tick = 0;
		size_t tickRate = 0;
		size_t tickFragment= 0;
		size_t now = 0;
		size_t turnBasedTimeout = 0;
		size_t starsForVictory = 0;
		size_t starsTotal = 0;
		size_t tradeCost = 0;
		size_t startTime = 0;
		size_t productions = 0;
		size_t productionRate = 0;
		size_t productionCounter = 0;
		size_t mapRequestedByPlayer = 0;
		size_t adminUid = 0;

		float fleetSpeed = 0;

		std::map<std::string, ApiPlayer> players;
		std::map<std::string, ApiCarrier> carriers;
		std::map<std::string, ApiStar> stars;

		bool turnBased = false;
		bool started = false;
		bool paused = false;
		bool gameOver = false;
		bool tradeScanned = false;
		bool war = false; // ???
	};
	void from_json(const nlohmann::json& j, ApiMap& obj);
}