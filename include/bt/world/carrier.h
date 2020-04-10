#pragma once

#include <string>
#include <mainframe/math/vector2.h>
#include <mainframe/render/stencil.h>
#include <bt/api/class/map.h>

namespace bt {
	class World;
	class Player;

	class Carrier {
	public:
		size_t uid = 0;
		std::string name;
		mainframe::math::Vector2 location;

		World& world;

		std::shared_ptr<Player> owner;

		Carrier(World& w);

		void load(const ApiCarrier& star);

		void update();
		void draw(mainframe::render::Stencil& stencil);
	};
}