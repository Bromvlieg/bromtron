#include <bt/api/class/maptech.h>

namespace bt {
	void from_json(const nlohmann::json& j, ApiMapTech& obj) {
		j.at("level").get_to(obj.level);
		j.at("value").get_to(obj.value);
	}
}