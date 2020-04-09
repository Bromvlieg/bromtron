#pragma once

#include <bt/app/game.h>

namespace bt {
	class BromTron {
		Game app;

	public:
		static BromTron& engine();
		static Game& game();
		static Api& api();
		Game& getGame();
	};
}