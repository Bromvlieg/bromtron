#include <bt/ui/elm/option.h>
#include <bt/misc/content.h>


namespace bt {
	void ElmOption::setIcon(const std::string& str) {
		icon = str;
		fontIcon->addChars(str);
	}

	ElmOption::ElmOption() {
		setFont(Content::getFont("text", 17));
		setIconFont(Content::getFont("fa-solid", 38));
	}

	mainframe::render::Font* ElmOption::getIconFont() {
		return fontIcon;
	}

	void ElmOption::setIconFont(mainframe::render::Font* font) {
		fontIcon = font;
	}

	void ElmOption::setSelected(bool sel) {
		selected = sel;
	}

	const mainframe::render::Color& ElmOption::getSelectedBackColor() {
		return selectBackColor;
	}

	const mainframe::render::Color& ElmOption::getSelectedBorderColor() {
		return selectBorderColor;
	}

	void ElmOption::setSelectedBackColor(const mainframe::render::Color& col) {
		selectBackColor = col;
	}

	void ElmOption::setSelectedBorderColor(const mainframe::render::Color& col) {
		selectBorderColor = col;
	}

	void ElmOption::draw(mainframe::render::Stencil& stencil) {
		auto bsize = getBorderSize();

		stencil.drawBoxOutlined({}, getSize(), static_cast<float>(bsize), selected ? getSelectedBorderColor() : getBorderColor());
		stencil.drawBox(static_cast<float>(bsize), getSize() - bsize * 2, selected ? getSelectedBackColor() : getBackColor());

		if (icon.empty()) {
			drawText(stencil);
			return;
		}

		stencil.drawText(*fontIcon, icon, getSize() / 2 - mainframe::math::Vector2i(0, getSize().y / 5), getColor(), mainframe::render::Stencil::TextAlignment::Center, mainframe::render::Stencil::TextAlignment::Center);

		stencil.pushOffset({0, getSize().y / 4});
		drawText(stencil);
		stencil.popOffset();
	}
}