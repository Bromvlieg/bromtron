#pragma once

#include <string>
#include <nlohmann/json.hpp>
#include <bt/api/class/maptech.h>

namespace bt {
	class ApiMapResearch {
	public:
		ApiMapTech range;
		ApiMapTech banking;
		ApiMapTech weapons;
		ApiMapTech scanning;
		ApiMapTech manufacturing;
		ApiMapTech experimentation;
		ApiMapTech terraforming;
	};
	void from_json(const nlohmann::json& j, ApiMapResearch& obj);
}