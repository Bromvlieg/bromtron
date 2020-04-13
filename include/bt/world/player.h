#pragma once

#include <string>
#include <mainframe/math/vector2.h>
#include <mainframe/math/aabb.h>
#include <mainframe/render/stencil.h>
#include <bt/api/class/map.h>
#include <bt/world/icons.h>

namespace bt {
	class Player {
	public:
		IconSheet icons;

		size_t uid = 0;
		std::string name;

		void load(const ApiMapPlayer& star);

		mainframe::math::AABB getIconAABB();

		void update();
		void draw(mainframe::render::Stencil& stencil);

		Icon icon() const { return static_cast<Icon>(uid / 8 + 1); };
	};
}