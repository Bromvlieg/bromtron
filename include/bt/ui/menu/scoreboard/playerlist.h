#pragma once

#include <mainframe/ui/element.h>
#include <bt/world/player.h>
#include <bt/misc/scoreboardcategory.h>

namespace bt {
	class PlayerList : public mainframe::ui::Element {
		mainframe::render::Font* font = nullptr;

	public:
		PlayerList();

		mainframe::utils::Event<size_t, bool> onPlayerToggle;
		mainframe::utils::Event<ScoreboardCategory> onTypeChange;

		void setPlayers(const std::vector<Player>& players);

		void recreateElements();
		virtual void draw(mainframe::render::Stencil& stencil) override;
	};

	class PlayerEnabledPanel : public mainframe::ui::Element {
	public:
		bool enabled = true;
		virtual void draw(mainframe::render::Stencil& stencil) override;
	};

	class PlayerColorPanel : public mainframe::ui::Element {
	public:
		mainframe::render::Color color;
		virtual void draw(mainframe::render::Stencil& stencil) override;
	};
}
