#include <bt/api/class/carrier.h>

namespace bt {
	void from_json(const nlohmann::json& j, ApiCarrier& obj) {
		j.at("n").get_to(obj.name);
		j.at("uid").get_to(obj.uid);
		j.at("puid").get_to(obj.puid);
		j.at("st").get_to(obj.ships);

		obj.location = {std::stof(j.at("x").get<std::string>()), std::stof(j.at("y").get<std::string>())};
		obj.target = {std::stof(j.at("lx").get<std::string>()), std::stof(j.at("ly").get<std::string>())};

		j.at("o").get_to(obj.orders);
		if (j.find("ouid") != j.end()) j.at("ouid").get_to(obj.ouid);
	}
}