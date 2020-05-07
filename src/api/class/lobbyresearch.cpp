#include <bt/api/class/lobbyresearch.h>

namespace bt {
	void from_json_research(const nlohmann::json& j, ApiLobbyTech& tech, const std::string& key) {
		j.at("researchCost" + key).get_to(tech.cost);
		j.at("startingTech" + key).get_to(tech.start);
		j.at("tradeCost").get_to(tech.trade);
	}

	void from_json(const nlohmann::json& j, ApiLobbyResearch& obj) {
		from_json_research(j, obj.weapons, "Weapons");
		from_json_research(j, obj.banking, "Banking");
		from_json_research(j, obj.range, "Hyperspace");
		from_json_research(j, obj.scanning, "Scanning");
		from_json_research(j, obj.experimentation, "Experimentation");
		from_json_research(j, obj.terraforming, "Terraforming");
		from_json_research(j, obj.manufacturing, "Manufacturing");
	}
}