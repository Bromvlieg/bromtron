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
		int tech = 0;
		int economy = 0;
		int industry = 0;

		int ships = 0;
		int carriers = 0;
		int resources = 0;

		int resourcesNatural = 0;
	};
	void from_json(const nlohmann::json& j, ApiStar& obj);
}