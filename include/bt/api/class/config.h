#pragma once

#include <string>
#include <vector>
#include <nlohmann/json.hpp>
#include <bt/api/class/lobbyresearch.h>
#include <bt/api/class/playerstart.h>
#include <bt/api/class/mapstart.h>
#include <bt/api/class/turn.h>

namespace bt {
	class ApiLobbyConfig {
	public:
		ApiLobbyResearch tech;
		ApiPlayerStart start;
		ApiMapStart mapgen;
		ApiLobbyTurnInfo turn;

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
	void from_json(const nlohmann::json& j, ApiLobbyConfig& obj);
}