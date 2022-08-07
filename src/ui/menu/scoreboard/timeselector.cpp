#include <bt/ui/menu/scoreboard/timeselector.h>

#include <bt/misc/content.h>
#include <bt/misc/fontawesome.h>

#include <bt/app/engine.h>
#include <bt/misc/translate.h>

using namespace mainframe::ui;
using namespace mainframe::math;
using namespace mainframe::render;

namespace bt {
	TimeSelector::TimeSelector() {
		font = Content::getFont("text", 16);
	}

	void TimeSelector::draw(Stencil& stencil) {
		auto& size = getSize();

		stencil.drawBoxOutlined(0, size, 1, Colors::Black);
		stencil.drawBox(1, size - 2, { 0.1, 0.1, 0.1, 1 });
	}
}
