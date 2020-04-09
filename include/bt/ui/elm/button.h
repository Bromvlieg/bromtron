#pragma once

#include <mainframe/ui/elms/button.h>

namespace bt {
	class Button : public mainframe::ui::Button {
		std::vector<std::string> lines;
		std::vector<mainframe::math::Vector2i> sizes;

	public:
		Button();

		void generateLines();

		virtual void setSize(const mainframe::math::Vector2i& size_) override;
		virtual void setText(const std::string& text) override;
		virtual void draw(mainframe::render::Stencil& stencil) override;

		void drawBg(mainframe::render::Stencil& stencil);
		void drawText(mainframe::render::Stencil& stencil);

	};
}