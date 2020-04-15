#pragma once

#include <string>
#include <vector>
#include <nlohmann/json.hpp>
#include <bt/api/class/lobby.h>
#include <bt/api/class/localplayerstats.h>

namespace bt {
	class ApiLocalPlayer {
	public:
		size_t localAccount = 0;
		size_t avatar = 0;

		std::string id;
		std::string username;
		std::string email;
		std::string badges;

		std::string subscriptionDate;

		bool allowEmails = false;
		bool emailVerified = false;
		bool hasPassword = false;

		ApiLocalPlayerStats stats;

		std::vector<ApiLobby> gamesCompleted;
		std::vector<ApiLobby> gamesOpen;
		std::vector<ApiLobby> gamesCreated;
	};
	void from_json(const nlohmann::json& j, ApiLocalPlayer& obj);
}