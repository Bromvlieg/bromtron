#pragma once

#include <vector>
#include <memory>

#include <mainframe/render/stencil.h>

#include <bt/api/api.h>
#include <bt/api/class/playerloggedin.h>

#include <bt/world/star.h>
#include <bt/world/player.h>
#include <bt/world/carrier.h>

namespace bt {
	class World {
		std::mutex lock;

		std::vector<std::shared_ptr<Carrier>> carriers;
		std::vector<std::shared_ptr<Star>> stars;
		std::vector<std::shared_ptr<Player>> players;

		std::shared_ptr<Api::ApiHandle> apiCallLoadGame;

		void syncStars(const std::map<std::string, ApiStar> starlst);
		void syncPlayers(const std::map<std::string, ApiMapPlayer> playerlst);
		void syncCarriers(const std::map<std::string, ApiCarrier> carrierst);

	public:
		std::shared_ptr<Star> getStar(size_t uid);
		std::shared_ptr<Player> getPlayer(size_t uid);
		std::shared_ptr<Carrier> getCarrier(size_t uid);

		void loadGame(const ApiPlayerGame& lobby);

		void update();
		void draw(mainframe::render::Stencil& stencil);
	};
}