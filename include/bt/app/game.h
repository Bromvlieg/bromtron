#pragma once

#include <mainframe/game/engine.h>
#include <mainframe/game/window.h>
#include <mainframe/render/font.h>
#include <mainframe/render/stencil.h>
#include <mainframe/ui/scene.h>
#include <bt/api/api.h>
#include <bt/world/camera.h>
#include <bt/world/world.h>
#include <bt/misc/config.h>

namespace bt {
	class Game : public mainframe::game::Engine {
		using Font = mainframe::render::Font;
		using Window = mainframe::game::Window;
		using Texture = mainframe::render::Texture;
		using Stencil = mainframe::render::Stencil;
		using Scene = mainframe::ui::Scene;

		std::shared_ptr<Font> font = std::make_shared<Font>("fonts/VeraMono.ttf", 15.0f);
		std::shared_ptr<Font> fontSmall = std::make_shared<Font>("fonts/VeraMono.ttf", 13.0f);
		Texture tex = Texture("textures/test.png");

	public:
		std::shared_ptr<Scene> scene = Scene::create();
		std::unique_ptr<Window> window;
		Stencil stencil;
		Api api;
		World world;
		Camera camera;
		Config config;
		ApiLocalPlayer localplayer;

		virtual void init() override;

		virtual void draw() override;
		virtual void tick() override;
		virtual void quit() override;
		virtual void update() override;

		void setWindow(std::unique_ptr<Window>& w);
	};
}