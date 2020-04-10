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
		return game().api;
	}

	World& BromTron::world() {
		return game().world;
	}

	Camera& BromTron::cam() {
		return game().camera;
	}

	Game& BromTron::getGame() {
		return app;
	}
}