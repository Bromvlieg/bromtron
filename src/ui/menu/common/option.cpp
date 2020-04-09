#include <bt/app/engine.h>
#include <bt/ui/menu/common/option.h>
#include <bt/ui/elm/button.h>
#include <bt/misc/translate.h>
#include <bt/misc/content.h>
#include <bt/misc/fontawesome.h>

#include <mainframe/ui/elms/panel.h>
#include <mainframe/ui/elms/label.h>
#include <mainframe/ui/elms/frame.h>
#include <mainframe/ui/elms/image.h>
#include <mainframe/ui/elms/scrollpanel.h>


using namespace mainframe::ui;
using namespace mainframe::math;
using namespace mainframe::render;

#undef min
#undef max

namespace bt {
	void MenuOption::show() {
		setSize(getParent<Element>()->getSize());

		init();
		MenuBase::show();
	}

	void MenuOption::recreateElements() {
		font = Content::getFont("text", 16);
		auto& oursize = getSize();

		auto btnselect = createChild<Button>();
		auto& btnselectsize = btnselect->getSize();
		btnselect->setFont(font);
		btnselect->setText(Translate::key("ui.common.select"));
		btnselect->resizeToContents();
		btnselect->setSize(btnselectsize + 20);
		btnselect->setPos(oursize / 2 + boxSize / 2 - btnselectsize - 10);

		btnselect->onClick += [this]() {
			onClose(selected);
			remove();
		};

		auto btnback = createChild<Button>();
		auto& btnbacksize = btnback->getSize();
		btnback->setFont(font);
		btnback->setText(Translate::key("ui.common.back"));
		btnback->resizeToContents();
		btnback->setSize(btnbacksize + 20);
		btnback->setPos(oursize / 2 + mainframe::math::Vector2i(-boxSize.x / 2 + 10, boxSize.y / 2 - btnbacksize.y - 10));

		btnback->onClick += [this]() {
			onClose(nullptr);
			remove();
		};

		pnlBack = createChild<mainframe::ui::ScrollPanel>();
		pnlBack->setSize(boxSize - 20 - Vector2i(0, std::max(btnbacksize.y, btnselectsize.y) + 10));
		pnlBack->setPos(getSize() / 2 - boxSize / 2 + 10);
		pnlBack->setBars(true, false);
		pnlBack->checkBars();

		applyTheme();
	}

	std::shared_ptr<ElmOption> MenuOption::addOption(const std::string& icon, const std::string& text) {
		mainframe::math::Vector2i iconsize = {128, 128};

		auto ret = pnlBack->createChild<ElmOption>();
		ret->setIcon(icon);
		ret->setText(text);
		ret->setSize(iconsize);

		auto ref = ret->getRef<ElmOption>();
		ret->onClick += [this, ref]() {
			if (selected != nullptr) {
				selected->setSelected(false);
			}

			selected = ref;
			ref->setSelected(true);
		};

		applyTheme(ret);
		options.push_back(ret);

		size_t countx = static_cast<size_t>(std::ceil(static_cast<float>(pnlBack->getSize().x) / static_cast<float>(iconsize.x)));
		size_t county = static_cast<size_t>(std::ceil(static_cast<float>(pnlBack->getSize().y) / static_cast<float>(iconsize.y)));

		size_t rows = options.size() / countx;
		int yoffset = rows > county ? 0: rows * (iconsize.y + 5) / 2;

		size_t i = 0;
		Vector2i pos;

		size_t remY = std::min(options.size() / countx, county);
		if (remY == 0) remY++;

		pos.y = pnlBack->getSize().y / 2 - (remY * (iconsize.y + 5)) / 2;

		for (size_t rowY = 0; true; rowY++) {
			size_t i = rowY * county;
			if (i > options.size()) break;

			size_t remX = std::min(options.size() - i, countx);
			pos.x = pnlBack->getSize().x / 2 - (remX * (iconsize.x + 5)) / 2;

			for (size_t index = i; index < options.size(); index++) {
				options[index]->setPos(pos);
				pos.x += iconsize.y + 5;
			}

			pos.y += iconsize.y + 5;
		}

		pnlBack->checkBars();
		return ret;

	}

	void MenuOption::init() {
		boxSize = {600, 400};

		recreateElements();
	}

	void MenuOption::draw(mainframe::render::Stencil& stencil) {
		stencil.drawBox({}, getSize(), Color(1, 1, 1, 0.4f));

		auto size = getSize();
		auto pos = size / 2 - boxSize / 2;

		stencil.drawBoxOutlined(pos, boxSize, 1, Colors::Black);
		stencil.drawBox(pos + 1, boxSize - 2, Color(1, 1, 1, 0.7f));
	}
}
