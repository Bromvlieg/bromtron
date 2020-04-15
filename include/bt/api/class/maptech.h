#pragma once

#include <string>
#include <nlohmann/json.hpp>

namespace bt {
	class ApiMapTech {
	public:
		size_t level;
		float value;
	};
	void from_json(const nlohmann::json& j, ApiMapTech& obj);
}