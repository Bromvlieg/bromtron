#include <bt/ui/menu/scoreboard/scoreboard.h>
#include <bt/ui/menu/common/option.h>
#include <bt/misc/content.h>
#include <bt/misc/fontawesome.h>

#include <bt/app/engine.h>
#include <bt/ui/elm/button.h>

#include <mainframe/ui/elms/panel.h>
#include <mainframe/ui/elms/label.h>
#include <mainframe/ui/elms/frame.h>
#include <mainframe/ui/elms/image.h>
#include <mainframe/ui/elms/textbox.h>

#include <bt/misc/translate.h>

#include <filesystem>

using namespace mainframe::ui;
using namespace mainframe::math;
using namespace mainframe::render;

namespace bt {
	void MenuScoreboard::init() {
		font = Content::getFont("text", 16);
		textSize = font->getStringSize(text);
	}

	void MenuScoreboard::loadIntel() {
		//for (auto const& dir_entry : std::filesystem::directory_iterator{ fmt::format("saves/{}/intel") }) {
		//	std::cout << dir_entry << '\n';
		//}
	}

	void MenuScoreboard::recreateElements() {
		this->clearChildren();

		auto& oursize = getSize();

		int selectorHight = 50;
		int playersWidth = 100;
		int spacer = 5;
		Vector2i graphSize = {
			oursize.x - playersWidth - spacer,
			oursize.y - selectorHight - spacer
		};

		uiGraph = createChild<Graph>();
		uiGraph->setPos({});
		uiGraph->setSize(graphSize);

		uiTimeSelector = createChild<TimeSelector>();
		uiTimeSelector->setPos({ 0, graphSize.y + spacer });
		uiTimeSelector->setSize({ graphSize.x, selectorHight });

		uiPlayers = createChild<PlayerList>();
		uiPlayers->setPos({ graphSize.x + spacer, 0 });
		uiPlayers->setSize({ playersWidth, graphSize.y + selectorHight + spacer });

		applyTheme();
	}

	void MenuScoreboard::draw(mainframe::render::Stencil& stencil) {
		auto& size = getSize();

		stencil.drawBoxOutlined(0, size, 1, Colors::Black);
		stencil.drawBox(1, size - 2, Color(0, 0, 0, 217));
	}
}
