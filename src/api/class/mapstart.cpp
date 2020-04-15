#include <bt/api/class/mapstart.h>

namespace bt {
	void from_json(const nlohmann::json& j, ApiMapStart& obj) {
		j.at("starsPerPlayer").get_to(obj.resources);
		j.at("tickRate").get_to(obj.starsPerPlayer);
		j.at("customStarfield").get_to(obj.customStarfield);
		j.at("starScatter").get_to(obj.starscatter);
		j.at("starfield").get_to(obj.starfield);

		if (j.at("randomGates") == 1) obj.randomGates = true;
	}
}