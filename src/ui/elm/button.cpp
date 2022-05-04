#include <bt/ui/elm/button.h>

using TextAlignment = mainframe::render::Stencil::TextAlignment;

namespace bt {
	Button::Button() {
		setAlignment(TextAlignment::Center, TextAlignment::Center);
	}

	void Button::setText(const std::string& text) {
		mainframe::ui::Button::setText(text);
		generateLines();
	}

	void Button::setSize(const mainframe::math::Vector2i& size_) {
		mainframe::ui::Button::setSize(size_);
		generateLines();
	}

	void Button::generateLines() {
		lines.clear();
		sizes.clear();

		auto font = getFont();
		auto strrem = getText();
		auto size = font->getStringSize(strrem);
		auto maxW = getSize().x + getBorderSize();

		// the easy way out
		if (size.x < maxW) {
			lines.push_back(strrem);
			sizes.push_back(size);
			return;
		}

		while (size.x >= maxW) {
			int found = -1;

			for (size_t i = strrem.size() - 1; i > 0; i--) {
				if (strrem[i] == ' ') {
					std::string part = strrem.substr(0, i);
					auto partsize = font->getStringSize(part);

					if (partsize.x < maxW) {
						found = i;
						lines.push_back(part);
						sizes.push_back(partsize);
						break;
					}
				}
			}

			// just cut it off when there's no space found.... gotta do something right?
			bool iscut = false;
			if (found == -1) {
				for (size_t i = strrem.size() - 1; i > 0; i--) {
					std::string part = strrem.substr(0, i);
					auto partsize = font->getStringSize(part);

					if (partsize.x < maxW) {
						found = i - 1;
						lines.push_back(part);
						sizes.push_back(partsize);
						break;
					}
				}
			}

			// FINE, HAVE IT YOUR WAY.
			if (found == -1) {
				lines.push_back(strrem);
				sizes.push_back(size);

				strrem.clear();
				break;
			}

			strrem = strrem.substr(found + 1);
			size = font->getStringSize(strrem);
		}

		// add final part
		if (strrem.size() > 0) {
			lines.push_back(strrem);
			sizes.push_back(size);
		}
	}

	void Button::drawBg(mainframe::render::Stencil& stencil) {
		auto bsize = getBorderSize();

		stencil.drawBoxOutlined({}, getSize(), static_cast<float>(bsize), getBorderColor());
		stencil.drawBox(static_cast<float>(bsize), getSize() - bsize * 2, getBackColor());

	}

	void Button::drawText(mainframe::render::Stencil& stencil) {
		auto size = getSize();
		auto start = size / 2;
		auto font = getFont();

		start.y -= lines.size() * font->getLineHeight() / 2;

		for (size_t i = 0; i < lines.size(); i++) {
			auto& curpart = lines[i];
			auto& cursize = sizes[i];

			stencil.drawText(*getFont(), curpart, start - mainframe::math::Vector2i(cursize.x / 2, 0), getColor());
			start.y += font->getLineHeight() + font->lineGap();
		}
	}

	void Button::draw(mainframe::render::Stencil& stencil) {
		drawBg(stencil);
		drawText(stencil);
	}
}