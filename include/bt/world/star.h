#pragma once

#include <string>
#include <mainframe/math/vector2.h>
#include <mainframe/render/stencil.h>
#include <bt/api/class/map.h>
#include <bt/world/player.h>

namespace bt {
	class World;

	class Star {
	public:
		size_t uid = 0;
		std::string name;
		mainframe::math::Vector2 location;
		bool visible = false;

		World& world;

		std::shared_ptr<Player> owner;

		Star(World& w);

		void load(const ApiStar& star);

		void update();
		void draw(mainframe::render::Stencil& stencil);
	};
}