#include <bt/app/game.h>
#include <bt/ui/menu/base.h>
#include <mainframe/ui/elms/panel.h>
#include <mainframe/ui/elms/label.h>
#include <mainframe/ui/elms/frame.h>
#include <mainframe/ui/elms/button.h>
#include <mainframe/ui/elms/image.h>
#include <bt/misc/content.h>
#include <bt/misc/translate.h>

using namespace mainframe::game;
using namespace mainframe::render;
using namespace mainframe::math;
using namespace mainframe::ui;

namespace bt {
	void Game::init() {
		Translate::load("data/translations.json");

		Content::loadImage("fleet_range");
		Content::loadImage("fleet_waypoint");
		Content::loadImage("fleet_waypoint_next");
		Content::loadImage("halo");
		Content::loadImage("halo2");
		Content::loadImage("owner_rings_48");
		Content::loadImage("stars");
		Content::loadImage("scanning_range");
		Content::loadImage("selection_ring");

		Content::loadFont("VeraMono", "text");
		Content::loadFont("VeraMono", "textSmall");

		Content::loadFont("fa-solid-900", "fa-solid");
		Content::loadFont("fa-regular-400", "fa-regular");
		Content::loadFont("fa-brands-400", "fa-brands");

		api.setEndpoint("https://np.ironhelmet.com/");
		api.startThread();

		MenuBase::initMenus(*this);
		MenuBase::switchMenu(Menus::login);
	}

	void bt::Game::setWindow(std::unique_ptr<Window>& w) {
		window = std::move(w);

		stencil.setWindowSize(window->getSize());
		scene->setWindow(*window);

		camera.hook(*scene);
	}

	void Game::draw() {
		auto wsize = Vector2(stencil.getWindowSize());
		stencil.drawPolygon({
			{
				{{0, 0},		{0, 0}, {0.2f, 0.0f, 0.0f}},
				{{wsize.x, 0},	{1, 0}, {0.0f, 0.2f, 0.0f}},
				{{0, wsize.y},	{0, 1}, {0.0f, 0.0f, 0.2f}},
				{wsize,			{1, 1}, {0.2f, 0.0f, 0.2f}}
			},
			{
				0, 1, 2,
				1, 2, 3
			}
		});

		world.draw(stencil);
		scene->draw(stencil);

		stencil.draw();
		window->swapBuffer();
	}

	void Game::tick() {
		Window::pollEvents();
	}

	void Game::quit() {
		api.stopThread();
		Engine::quit();
		window->close();
	}

	void Game::update() {
		scene->update();
		camera.update();

		world.update();

		if (window->getShouldClose()) {
			quit();
		}
	}
}
