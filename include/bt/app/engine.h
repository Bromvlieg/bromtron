#pragma once

#include <bt/app/game.h>
#include <bt/world/world.h>

namespace bt {
	class BromTron {
		Game app;
		Game& game();

	public:
		static BromTron& getEngine();
		static Game& getGame();
		static Api& getApi();
		static World& getWorld();
		static Camera& getCam();
		static Config& getConfig();
	};
}