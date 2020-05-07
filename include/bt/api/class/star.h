#pragma once

#include <string>
#include <mainframe/math/vector2.h>
#include <nlohmann/json.hpp>

namespace bt {
	class ApiStar {
	public:
		std::string name;

		size_t uid = 0;
		size_t puid = 0;

		mainframe::math::Vector2 location;

		bool visible = false;

		// below fields only present if visible
		size_t tech = 0;
		size_t economy = 0;
		size_t industry = 0;

		size_t ships = 0;
		size_t carriers = 0;
		size_t resources = 0;

		size_t nr = 0; // ??
	};
	void from_json(const nlohmann::json& j, ApiStar& obj);
}