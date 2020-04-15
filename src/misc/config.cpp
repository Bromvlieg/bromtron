#include <bt/misc/config.h>

namespace bt {
	bool KeyMapping::operator==(const KeyMapping& other) {
		return key == other.key && modifier == other.modifier;
	}

	bool KeyMapping::operator!=(const KeyMapping& other) {
		return !(*this == other);
	}
}