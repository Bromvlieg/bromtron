#include <bt/api/class/mapresearch.h>

namespace bt {
	void from_json(const nlohmann::json& j, ApiMapResearch& obj) {
		j.at("weapons").get_to(obj.weapons);
		j.at("banking").get_to(obj.banking);
		j.at("propulsion").get_to(obj.range);
		j.at("research").get_to(obj.experimentation);
		j.at("terraforming").get_to(obj.terraforming);
		j.at("manufacturing").get_to(obj.manufacturing);
		j.at("scanning").get_to(obj.scanning);
	}
}