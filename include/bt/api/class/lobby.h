#pragma once

#include <string>
#include <vector>
#include <nlohmann/json.hpp>
#include <bt/api/class/config.h>

namespace bt {
	class ApiLobby{
	public:
		std::string id;
		std::string name;
		std::string status;
		std::string creator;
		std::string version;

		size_t players = 0;
		size_t playersMax = 0;

		ApiLobbyConfig conf;
	};
	void from_json(const nlohmann::json& j, ApiLobby& obj);
}