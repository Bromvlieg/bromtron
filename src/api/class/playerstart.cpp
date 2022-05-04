#include <bt/api/class/playerstart.h>

namespace bt {
	void from_json(const nlohmann::json& j, ApiPlayerStart& obj) {
		j.at("startingStars").get_to(obj.stars);
		j.at("startingCash").get_to(obj.money);
		j.at("startingShips").get_to(obj.ships);

		j.at("developmentCostScience").get_to(obj.techCost);
		j.at("developmentCostEconomy").get_to(obj.economyCost);
		j.at("developmentCostIndustry").get_to(obj.industryCost);

		j.at("startingInfScience").get_to(obj.buildTech);
		j.at("startingInfEconomy").get_to(obj.buildEconomy);
		j.at("startingInfIndustry").get_to(obj.buildIndustry);
	}
}