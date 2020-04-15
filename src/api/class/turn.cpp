#include <bt/api/class/turn.h>

namespace bt {
	void from_json(const nlohmann::json& j, ApiLobbyTurnInfo& obj) {
		j.at("productionTicks").get_to(obj.cycle);
		j.at("tickRate").get_to(obj.tickRate);
		j.at("turnJumpTicks").get_to(obj.ticksPerTurn);
		j.at("turnTime").get_to(obj.turnTimer);

		if (j.at("turnBased") == 1) obj.turnBased = true;
	}
}