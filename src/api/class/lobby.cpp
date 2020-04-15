#include <bt/api/class/lobby.h>

namespace bt {
	void from_json(const nlohmann::json& j, ApiLobby& obj) {
		j.at("number").get_to(obj.id);
		j.at("name").get_to(obj.name);
		j.at("status").get_to(obj.status);
		j.at("creator").get_to(obj.creator);
		j.at("version").get_to(obj.version);

		j.at("players").get_to(obj.players);
		j.at("maxPlayers").get_to(obj.playersMax);

		j.at("config").get_to(obj.conf);
	}
}