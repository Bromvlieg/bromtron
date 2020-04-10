#pragma once

#include <string>
#include <mainframe/math/vector2.h>
#include <mainframe/math/aabb.h>
#include <mainframe/render/stencil.h>
#include <bt/api/class/map.h>

namespace bt {
	class Player {
	public:
		size_t uid = 0;
		std::string name;

		void load(const ApiMapPlayer& star);

		mainframe::math::AABB getIconAABB();

		void update();
		void draw(mainframe::render::Stencil& stencil);
	};
}