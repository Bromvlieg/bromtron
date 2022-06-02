#pragma once

#include <string>
#include <vector>
#include <nlohmann/json.hpp>
#include <bt/api/class/player.h>
#include <bt/api/class/star.h>
#include <bt/api/class/carrier.h>
#include <mainframe/math/vector3.h>

namespace bt {
	class ApiIntelPlayer {
	public:
		size_t totalStars = 0;
		size_t totalEconomy = 0;
		size_t totalIndustry = 0;
		size_t totalScience = 0;
		size_t totalShips = 0;
		size_t totalCarriers = 0;
		size_t weapons = 0;
		size_t banking = 0;
		size_t manufacturing = 0;
		size_t hyperspace = 0; 
		size_t scanning = 0;
		size_t experimentation = 0;
		size_t terraforming = 0;
		size_t uid = 0;
	};

	class ApiIntelStats {
	public:
		std::vector<ApiIntelPlayer> players;
		size_t tick = 0;
	};

	class ApiIntel {
	public:
		std::vector<ApiIntelStats> stats;
	};

	void from_json(const nlohmann::json& j, ApiIntel& obj);
	void from_json(const nlohmann::json& j, ApiIntelPlayer& obj);
	void from_json(const nlohmann::json& j, ApiIntelStats& obj);
}