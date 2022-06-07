#pragma once

#include <mainframe/ui/element.h>
#include <bt/world/player.h>

namespace bt {
	class PlayerList : public mainframe::ui::Element {
		mainframe::render::Font* font = nullptr;

	public:
		PlayerList();

		void setPlayers(const std::vector<Player>& players);

		virtual void draw(mainframe::render::Stencil& stencil) override;
	};
}
