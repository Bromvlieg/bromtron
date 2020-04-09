#include <bt/misc/translate.h>
#include <stdexcept>

#include <mainframe/networking/packet.h>

namespace bt {
	nlohmann::json Translate::mapping;

	void Translate::load(const std::string& file) {
		mainframe::networking::Packet p;
		p.writeFromFile(file);

		if (p.empty()) return;
		mapping = nlohmann::json::parse(p.readAllString());
	}
}