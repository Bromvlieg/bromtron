#pragma once

#include <nlohmann/json.hpp>

namespace bt {
	class ApiOrder {
	public:
		size_t delay;
		size_t starId;
		size_t type;
		size_t ships;
	};
	void from_json(const nlohmann::json& j, ApiOrder& obj);
}