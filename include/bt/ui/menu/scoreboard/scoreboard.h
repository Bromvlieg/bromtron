#pragma once

#include <bt/ui/menu/base.h>
#include <bt/ui/menu/scoreboard/graph.h>
#include <bt/ui/menu/scoreboard/playerlist.h>
#include <bt/ui/menu/scoreboard/timeselector.h>
#include <bt/app/engine.h>

namespace bt {
	class MenuScoreboard : public MenuBase {
		mainframe::render::Font* font = nullptr;
		std::string text;
		mainframe::math::Vector2i textSize;
		std::string eventName;

		std::shared_ptr<Api::ApiHandle> apiCall;

		std::shared_ptr<Graph> uiGraph;
		std::shared_ptr<PlayerList> uiPlayers;
		std::shared_ptr<TimeSelector> uiTimeSelector;

		ScoreboardCategory catType = ScoreboardCategory::total;
		std::map<size_t, bool> disabled;
		std::vector<ApiIntelStats> mapping;

		void refreshValues();

	public:
		void loadIntel(std::string mapId);

		virtual void init() override;
		virtual void draw(mainframe::render::Stencil& stencil) override;
		virtual void recreateElements() override;
	};
}
