#pragma once

#include <string>
#include <vector>
#include <nlohmann/json.hpp>

namespace bt {
	class ApiLocalPlayerStats {
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
	void from_json(const nlohmann::json& j, ApiLocalPlayerStats& obj);
}