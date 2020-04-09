#pragma once

#include <vector>
#include <memory>

#include <bt/api/class/playerloggedin.h>
#include <mainframe/render/stencil.h>

namespace bt {
	class Carrier;
	class Star;

	class World {
		std::vector<std::shared_ptr<Carrier>> carriers;
		std::vector<std::shared_ptr<Star>> stars;

	public:
		void loadMap(ApiPlayerGame& lobby);

		void update();
		void draw(mainframe::render::Stencil& stencil) ;
	};
}