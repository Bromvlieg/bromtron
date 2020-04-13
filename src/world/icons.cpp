#include <bt/world/icons.h>

namespace bt {
	void IconSheet::generateIconPlus(mainframe::render::Stencil& stencil, float size, const mainframe::render::Color& col) {
		float cornerspace = size / 4;

		stencil.recordStart(true);

		// top
		stencil.drawBox({cornerspace, 0}, {size - cornerspace * 2, borderSize}, col); // main
		stencil.drawBox({cornerspace, borderSize}, {borderSize, cornerspace}, col); // top left - down
		stencil.drawBox({size - cornerspace - borderSize, borderSize}, {borderSize, cornerspace}, col); // top right - down

		// bottom
		stencil.drawBox({cornerspace, size - borderSize}, {size - cornerspace * 2, borderSize}, col); // main
		stencil.drawBox({cornerspace, size - cornerspace - borderSize}, {borderSize, cornerspace}, col); // left - up
		stencil.drawBox({size - cornerspace - borderSize, size - cornerspace - borderSize}, {borderSize, cornerspace}, col); // right - up

		// left
		stencil.drawBox({0, cornerspace}, {borderSize, size - cornerspace * 2}, col); // main
		stencil.drawBox({borderSize, cornerspace}, {cornerspace, borderSize}, col); // top - right
		stencil.drawBox({borderSize, size - cornerspace - borderSize}, {cornerspace, borderSize}, col); // bottom - right

		// right
		stencil.drawBox({size - borderSize, cornerspace}, {borderSize, size - cornerspace * 2}, col); // main
		stencil.drawBox({size - borderSize - cornerspace, cornerspace}, {cornerspace, borderSize}, col); // top - right
		stencil.drawBox({size - borderSize - cornerspace, size - cornerspace - borderSize}, {cornerspace, borderSize}, col); // bottom - right

		stencil.draw();
		recordings[Icon::plus] = stencil.recordStop();
	}

	void IconSheet::generateIconCircle(mainframe::render::Stencil& stencil, float size, const mainframe::render::Color& col) {
		stencil.recordStart(true);

		stencil.drawCircleOutlined(0, size, 48, borderSize, col);

		stencil.draw();
		recordings[Icon::circle] = stencil.recordStop();
	}

	void IconSheet::generateIconSquare(mainframe::render::Stencil& stencil, float size, const mainframe::render::Color& col) {
		stencil.recordStart(true);

		stencil.drawBoxOutlined(0, size, borderSize, col);

		stencil.draw();
		recordings[Icon::square] = stencil.recordStop();
	}

	void IconSheet::generateIconhexagon(mainframe::render::Stencil& stencil, float size, const mainframe::render::Color& col) {
		stencil.recordStart(true);

		stencil.drawCircleOutlined(0, size, 6, borderSize, col);

		stencil.draw();
		recordings[Icon::hexagon] = stencil.recordStop();
	}

	void IconSheet::generateIconTriangle(mainframe::render::Stencil& stencil, float size, const mainframe::render::Color& col) {
		stencil.recordStart(true);

		stencil.drawCircleOutlined(0, size, 3, borderSize, col);

		stencil.draw();
		recordings[Icon::triangle] = stencil.recordStop();
	}

	void IconSheet::generateIconDiamond(mainframe::render::Stencil& stencil, float size, const mainframe::render::Color& col) {
		stencil.recordStart(true);

		stencil.drawCircleOutlined(0, size, 4, borderSize, col);

		stencil.draw();
		recordings[Icon::diamond] = stencil.recordStop();
	}

	void IconSheet::generateIconStar(mainframe::render::Stencil& stencil, float size, const mainframe::render::Color& col) {

	}

	void IconSheet::generateIconLongCircle(mainframe::render::Stencil& stencil, float size, const mainframe::render::Color& col) {

	}


	void IconSheet::setStyle(size_t size, const mainframe::render::Color& col, mainframe::render::Stencil& stencil) {
		recordings.clear();
		borderSize = static_cast<float>(size) / 8.0f;

		generateIconPlus(stencil, size, col);
		generateIconCircle(stencil, size, col);
		generateIconSquare(stencil, size, col);
		generateIconhexagon(stencil, size, col);
		generateIconTriangle(stencil, size, col);
		generateIconPlus(stencil, size, col);
		generateIconDiamond(stencil, size, col);
		generateIconStar(stencil, size, col);
		generateIconLongCircle(stencil, size, col);
	}

	const mainframe::render::Stencil::Recording& IconSheet::getIcon(Icon icon) {
		return *recordings[icon];
	}
}