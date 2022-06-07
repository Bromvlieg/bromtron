#pragma once

#include <mainframe/ui/element.h>
#include <bt/world/player.h>

namespace bt {
	class PlayerPanel : public mainframe::ui::Element {
		mainframe::render::Font* font = nullptr;

	public:
		PlayerPanel();

		void setPlayer(Player& player);
		virtual void draw(mainframe::render::Stencil& stencil) override;
	};
}
