#include <bt/app/engine.h>
#include <bt/app/game.h>

namespace bt {
	BromTron& BromTron::getEngine() {
		static BromTron inst;
		return inst;
	}

	Game& BromTron::getGame() {
		return getEngine().game();
	}

	Api& BromTron::getApi() {
		return getGame().api;
	}

	World& BromTron::getWorld() {
		return getGame().world;
	}

	Camera& BromTron::getCam() {
		return getGame().camera;
	}

	Game& BromTron::game() {
		return app;
	}
}