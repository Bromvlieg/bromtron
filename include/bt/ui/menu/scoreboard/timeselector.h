#pragma once

#include <mainframe/ui/element.h>

namespace bt {
	class TimeSelector : public mainframe::ui::Element {
		mainframe::render::Font* font = nullptr;

	public:
		TimeSelector();

		virtual void draw(mainframe::render::Stencil& stencil) override;
	};
}
