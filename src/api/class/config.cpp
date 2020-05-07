#include <bt/api/class/config.h>

namespace bt {
	void from_json(const nlohmann::json& j, ApiLobbyConfig& obj) {
		j.get_to(obj.tech);
		j.get_to(obj.start);
		j.get_to(obj.mapgen);
		j.get_to(obj.turn);

		j.at("name").get_to(obj.name);
		j.at("description").get_to(obj.desc);
		j.at("version").get_to(obj.version);
		j.at("adminUserId").get_to(obj.adminUserId);

		if (j.at("mirror") == 1) obj.mirror = true;
		if (j.at("anonymity") == 1) obj.anonymity = true;
		if (j.at("alliances") == 1) obj.allies = true;
		if (j.at("password") == "password") obj.passworded = 1;
		if (j.at("buildGates") == 1) obj.stargatesEnabled = true;
		if (j.at("tradeScanned") == 1) obj.tradeScanned = true;

		j.at("darkGalaxy").get_to(obj.darkGalaxy);
		j.at("starsForVictory").get_to(obj.starsForVictory);
		j.at("playerType").get_to(obj.playerType);
	}
}