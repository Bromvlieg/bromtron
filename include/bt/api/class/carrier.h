#pragma once

#include <string>
#include <vector>
#include <mainframe/math/vector2.h>
#include <nlohmann/json.hpp>
#include <bt/api/class/order.h>

namespace bt {
	class ApiCarrier {
	public:
		std::string name;

		size_t uid = 0;
		size_t puid = 0;
		size_t ouid = 0;
		size_t ships = 0;

		mainframe::math::Vector2 location;
		mainframe::math::Vector2 target;
		std::vector<ApiOrder> orders;

		bool visible = false;
	};
	void from_json(const nlohmann::json& j, ApiCarrier& obj);
}