#pragma once

#include <string>
#include <mainframe/math/vector2.h>
#include <mainframe/render/stencil.h>
#include <bt/api/class/map.h>
#include <bt/world/player.h>

namespace bt {
	class World;

	class Star {
		int ecoBuild = 0;
		int techBuild = 0;
		int induBuild = 0;
		int resources = 0;
		int ships = 0;

	public:
		size_t uid = 0;
		std::string name;
		mainframe::math::Vector2 location;
		bool visible = false;

		int getTechCost();
		int getEconomyCost();
		int getIndustryCost();

		void buildEco();
		void buildIndu();
		void buildTech();

		int getEconomy();
		int getIndustry();
		int getTech();

		int getResources();
		void setResources(int res);

		int getShips();
		void setShips(int count);

		World& world;

		std::shared_ptr<Player> owner;

		Star(World& w);

		void load(const ApiStar& star);

		void update();
		void draw(mainframe::render::Stencil& stencil);
		void drawOwnership(mainframe::render::Stencil& stencil);
	};
}