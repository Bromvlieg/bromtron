#pragma once

#include <mainframe/ui/element.h>

namespace bt {
	class Graph : public mainframe::ui::Element {
		mainframe::render::Font* font = nullptr;

	public:
		Graph();

		virtual void draw(mainframe::render::Stencil& stencil) override;
	};
}
