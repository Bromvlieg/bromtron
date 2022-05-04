#include <bt/ui/menu/ingame.h>
#include <bt/app/engine.h>

using namespace mainframe::ui;
using namespace mainframe::math;
using namespace mainframe::render;

namespace bt {
	void MenuIngame::init() {

	}

	void MenuIngame::recreateElements() {
		this->clearChildren();

		auto& oursize = getSize();
		applyTheme();
	}
}
