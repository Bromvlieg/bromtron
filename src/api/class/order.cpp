#include <bt/api/class/order.h>

namespace bt {
	void from_json(const nlohmann::json& j, ApiOrder& obj) {
		obj.delay = j[0];
		obj.starId = j[1];
		obj.type = j[2];
		obj.ships = j[3];
	}
}