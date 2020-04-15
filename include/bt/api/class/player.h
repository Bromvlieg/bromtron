#pragma once

#include <string>
#include <nlohmann/json.hpp>
#include <bt/api/class/mapresearch.h>

namespace bt {
	class ApiPlayer {
	public:
		ApiMapResearch research;

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
	void from_json(const nlohmann::json& j, ApiPlayer& obj);
}