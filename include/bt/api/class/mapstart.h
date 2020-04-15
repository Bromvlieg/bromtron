#pragma once

#include <string>
#include <nlohmann/json.hpp>

namespace bt {
	class ApiMapStart {
	public:
		size_t resources = 0;
		size_t starsPerPlayer = 0;

		bool randomGates = false;

		std::string starfield;
		std::string starscatter;
		std::string customStarfield;
	};
	void from_json(const nlohmann::json& j, ApiMapStart& obj);
}