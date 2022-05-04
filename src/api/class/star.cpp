#include <bt/api/class/star.h>

namespace bt {
	void from_json(const nlohmann::json& j, ApiStar& obj) {
		obj.visible = j.at("v") == "1";

		j.at("n").get_to(obj.name);

		j.at("uid").get_to(obj.uid);
		j.at("puid").get_to(obj.puid);

		obj.location = {
			std::stof(j.at("x").get<std::string>()),
			std::stof(j.at("y").get<std::string>())
		};

		if (!obj.visible) return;
		j.at("r").get_to(obj.resources);
		j.at("c").get_to(obj.carriers);

		j.at("i").get_to(obj.industry);
		j.at("s").get_to(obj.tech);
		j.at("e").get_to(obj.economy);

		j.at("st").get_to(obj.ships);
		j.at("nr").get_to(obj.resourcesNatural);
	}
}