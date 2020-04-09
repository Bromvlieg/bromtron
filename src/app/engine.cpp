#include <bt/app/engine.h>
#include <bt/app/game.h>

namespace bt {
	BromTron& BromTron::engine() {
		static BromTron inst;
		return inst;
	}

	Game& BromTron::game() {
		return engine().getGame();
	}

	Api& BromTron::api() {
		return engine().getGame().api;
	}

	Game& BromTron::getGame() {
		return app;
	}
}