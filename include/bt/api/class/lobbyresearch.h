#pragma once

#include <bt/api/class/lobbytech.h>
#include <nlohmann/json.hpp>

namespace bt {
	class ApiLobbyResearch {
	public:
		ApiLobbyTech range;
		ApiLobbyTech banking;
		ApiLobbyTech weapons;
		ApiLobbyTech scanning;
		ApiLobbyTech manufacturing;
		ApiLobbyTech experimentation;
		ApiLobbyTech terraforming;
	};
	void from_json(const nlohmann::json& j, ApiLobbyResearch& obj);
}