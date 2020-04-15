#pragma once

#include <nlohmann/json.hpp>

namespace bt {
	class ApiLobbyTurnInfo {
	public:
		size_t cycle = 0; // amount of ticks per cycle
		size_t tickRate = 0; // minutes per tick
		size_t ticksPerTurn = 0;
		size_t turnTimer = 0; // max minutes per turn

		bool turnBased = false;
	};
	void from_json(const nlohmann::json& j, ApiLobbyTurnInfo& obj);
}