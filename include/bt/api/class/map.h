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

		size_t fleetSpeed = 0;
		size_t cycles = 0;
		size_t tickFragment= 0;
		size_t now = 0;
		size_t starsForVictory = 0;
		size_t turnBasedTimeout = 0;

		std::map<std::string, ApiPlayer> players;
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