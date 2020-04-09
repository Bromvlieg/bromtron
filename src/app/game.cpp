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

		Content::loadImage("test");
		Content::loadFont("VeraMono", "text");
		Content::loadFont("VeraMono", "textSmall");
		Content::loadFont("fa-solid-900", "fa-solid");
		Content::loadFont("fa-regular-400", "fa-regular");
		Content::loadFont("fa-brands-400", "fa-brands");

		api.setEndpoint("https://np.ironhelmet.com/");
		api.startThread();

		MenuBase::initMenus(*this);
		MenuBase::switchMenu(Menus::login);

		/*
		auto frame = scene->createChild<Frame>();
		frame->setSize(window->getSize() / 2);
		frame->setPos(window->getSize() / 2 - frame->getSize() / 2);
		frame->setFont(fontSmall);
		frame->setText("Test frame");
		frame->resizeToContents();

		auto lbl = frame->createChild<Label>();
		lbl->setPos({20, 20});
		lbl->setFont(font);
		lbl->setText("Some basic menu elements");
		lbl->resizeToContents();

		auto btn = frame->createChild<Button>();
		btn->setPos(lbl->getPos() + Vector2i(0, lbl->getSize().y + 5));
		btn->setFont(font);
		btn->setText("Press me!");
		btn->resizeToContents();
		btn->setSize(btn->getSize() * 2);
		btn->onClick += [btn]() {
			btn->setText(":0");
			btn->setBorderColor(Colors::Red);
		};

		auto img = frame->createChild<Image>();
		img->setPos(btn->getPos() + Vector2i(0, btn->getSize().y + 5));
		img->setSize(tex.getSize());
		img->setImage(tex);
		*/
	}

	void bt::Game::setWindow(std::unique_ptr<Window>& w) {
		window = std::move(w);

		stencil.setWindowSize(window->getSize());
		scene->setWindow(*window);
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

		scene->draw(stencil);
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

		if (window->getShouldClose()) {
			quit();
		}
	}
}
