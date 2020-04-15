#pragma once

#include <string>
#include <mainframe/math/vector2.h>
#include <mainframe/render/stencil.h>
#include <bt/api/class/map.h>

namespace bt {
	class World;
	class Player;
	class Star;

	enum class OrderType {
		none,
		collectAll,
		dropAll,
		collect,
		drop,
		collectAllBut,
		dropAllBut,
		garrison
	};

	class Order {
	public:
		OrderType type = OrderType::none;
		std::shared_ptr<Star> star;
		size_t delay = 0;
		size_t ships = 0;
	};

	class Carrier {
	public:
		std::vector<Order> orders;
		size_t uid = 0;
		std::shared_ptr<Star> star;
		std::string name;
		mainframe::math::Vector2 location;

		World& world;

		std::shared_ptr<Player> owner;

		Carrier(World& w);

		void load(const ApiCarrier& star);

		void update();
		void draw(mainframe::render::Stencil& stencil);
		void drawOwnership(mainframe::render::Stencil& stencil);
	};
}