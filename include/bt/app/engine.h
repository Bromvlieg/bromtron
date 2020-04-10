#pragma once

#include <bt/app/game.h>
#include <bt/world/world.h>

namespace bt {
	class BromTron {
		Game app;

	public:
		static BromTron& engine();
		static Game& game();
		static Api& api();
		static World& world();
		Game& getGame();
	};
}