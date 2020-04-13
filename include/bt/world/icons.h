#pragma once

#include <string>
#include <mainframe/math/vector2.h>
#include <mainframe/math/aabb.h>
#include <mainframe/render/stencil.h>
#include <map>

namespace bt {
	enum class Icon {
		none,
		circle,
		square,
		hexagon,
		triangle,
		plus,
		diamond,
		star,
		longcircle,
		starHidden,
		starVisible,
		carrier,
		selected,
		glow
	};

	class IconSheet {
		std::map<Icon, std::shared_ptr<mainframe::render::Stencil::Recording>> recordings;
		std::map<Icon, mainframe::math::AABB> offsets;

		float borderSize = 0;

		void generateIconCircle(mainframe::render::Stencil& stencil, float size, const mainframe::render::Color& col);
		void generateIconSquare(mainframe::render::Stencil& stencil, float size, const mainframe::render::Color& col);
		void generateIconhexagon(mainframe::render::Stencil& stencil, float size, const mainframe::render::Color& col);
		void generateIconTriangle(mainframe::render::Stencil& stencil, float size, const mainframe::render::Color& col);
		void generateIconPlus(mainframe::render::Stencil& stencil, float size, const mainframe::render::Color& col);
		void generateIconDiamond(mainframe::render::Stencil& stencil, float size, const mainframe::render::Color& col);
		void generateIconStar(mainframe::render::Stencil& stencil, float size, const mainframe::render::Color& col);
		void generateIconLongCircle(mainframe::render::Stencil& stencil, float size, const mainframe::render::Color& col);

	public:
		void setStyle(size_t size, const mainframe::render::Color& col, mainframe::render::Stencil& stencil);
		const mainframe::render::Stencil::Recording& getIcon(Icon icon);
	};
}