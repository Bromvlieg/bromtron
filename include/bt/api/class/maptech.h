#pragma once

#include <string>
#include <nlohmann/json.hpp>

namespace bt {
	class ApiMapTech {
	public:
		int level;
		float value;
	};
	void from_json(const nlohmann::json& j, ApiMapTech& obj);
}