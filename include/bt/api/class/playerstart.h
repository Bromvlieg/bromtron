#pragma once

#include <string>
#include <nlohmann/json.hpp>

namespace bt {
	class ApiPlayerStart {
	public:
		size_t stars = 0;
		size_t money = 0;
		size_t ships = 0;

		size_t tech = 0;
		size_t economy = 0;
		size_t industry = 0;

		size_t buildTech = 0;
		size_t buildEconomy = 0;
		size_t buildIndustry = 0;
	};
	void from_json(const nlohmann::json& j, ApiPlayerStart& obj);
}