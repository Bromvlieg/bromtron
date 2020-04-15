#include <bt/world/icons.h>
#include <mainframe/numbers/pi.h>

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

	void IconSheet::generateStarVisible(mainframe::render::Stencil& stencil, float size, const mainframe::render::Color& col) {
		stencil.recordStart(true);

		auto radius = size / 2;
		auto targetPos = mainframe::math::Vector2() + radius;
		float roundness = 64;

		float space = mainframe::numbers::pi<float> / roundness * 2.0f;

		mainframe::render::Color shadowBeginColor {0.7f, 0.7f, 0};
		mainframe::render::Color shadowEndColor {1.0f, 1.0f, 0, 0};

		mainframe::render::Color centerColor {0.1f, 0.1f, 0.1f};
		mainframe::render::Color edgeColor {0, 0, 0};
		edgeColor.r *= 0.8f;
		edgeColor.g *= 0.8f;
		edgeColor.b *= 0.8f;

		// shadow
		for (float i = 0; i < roundness;) {
			mainframe::math::Vector2 b = targetPos + mainframe::math::Vector2::cosSin(space * i) * radius;
			mainframe::math::Vector2 c = targetPos + mainframe::math::Vector2::cosSin(space * ++i) * radius;

			stencil.drawTriangle(
				targetPos, {}, shadowBeginColor,
				b, {}, shadowEndColor,
				c, {}, shadowEndColor);
		}


		// main
		radius *= 0.75f;
		for (float i = 0; i < roundness;) {
			mainframe::math::Vector2 b = targetPos + mainframe::math::Vector2::cosSin(space * i) * radius;
			mainframe::math::Vector2 c = targetPos + mainframe::math::Vector2::cosSin(space * ++i) * radius;

			stencil.drawTriangle(
				targetPos, {}, col,
				b, {}, edgeColor,
				c, {}, edgeColor);
		}

		stencil.draw();
		recordings[Icon::starVisible] = stencil.recordStop();
	}

	void IconSheet::generateStarHidden(mainframe::render::Stencil& stencil, float size, const mainframe::render::Color& col) {
		stencil.recordStart(true);

		auto radius = size / 2;
		auto targetPos = mainframe::math::Vector2() + radius;
		float roundness = 64;

		float space = mainframe::numbers::pi<float> / roundness * 2.0f;

		mainframe::render::Color shadowBeginColor {0.7f, 0.7f, 0};
		mainframe::render::Color shadowEndColor {1.0f, 1.0f, 0, 0};

		mainframe::render::Color centerColor = col;
		centerColor.r *= 0.5f;
		centerColor.g *= 0.5f;
		centerColor.b *= 0.5f;

		mainframe::render::Color edgeColor = centerColor;
		edgeColor.r *= 0.8f;
		edgeColor.g *= 0.8f;
		edgeColor.b *= 0.8f;

		// shadow
		for (float i = 0; i < roundness;) {
			mainframe::math::Vector2 b = targetPos + mainframe::math::Vector2::cosSin(space * i) * radius;
			mainframe::math::Vector2 c = targetPos + mainframe::math::Vector2::cosSin(space * ++i) * radius;

			stencil.drawTriangle(
				targetPos, {}, shadowBeginColor,
				b, {}, shadowEndColor,
				c, {}, shadowEndColor);
		}


		// main
		radius *= 0.75f;
		for (float i = 0; i < roundness;) {
			mainframe::math::Vector2 b = targetPos + mainframe::math::Vector2::cosSin(space * i) * radius;
			mainframe::math::Vector2 c = targetPos + mainframe::math::Vector2::cosSin(space * ++i) * radius;

			stencil.drawTriangle(
				targetPos, {}, centerColor,
				b, {}, edgeColor,
				c, {}, edgeColor);
		}

		stencil.draw();
		recordings[Icon::starHidden] = stencil.recordStop();
	}

	void IconSheet::generateIconCarrier(mainframe::render::Stencil& stencil, float size, const mainframe::render::Color& col) {
		stencil.recordStart(true);


		// front
		stencil.drawPolygon({
			{
				{{size / 2, 0},				{0.5f, 0},		  col},
				{{size - size * 0.364f, size * 0.621f},	{1.0f - 0.364f, 0.621f}, col},
				{{size * 0.364f, size * 0.621f},	{0.364f, 0.621f}, col}
			},
			{
				0, 1, 2
			}
		});

		// right
		stencil.drawPolygon({
			{
				{{size - size * 0.364f, size * 0.621f},				{0.5f, 0},		  col},
				{{size - size * 0.108f, size * 0.864f},	{1.0f - 0.108f, 0.621f}, col},
				{{size - size * 0.364f, size * 0.864f},	{0.108f, 0.621f}, col}
			},
			{
				0, 1, 2
			}
		});

		// left
		stencil.drawPolygon({
			{
				{{size * 0.364f, size * 0.621f},				{0.5f, 0},		  col},
				{{size * 0.364f, size * 0.864f},	{0.108f, 0.621f}, col},
				{{size * 0.108f, size * 0.864f},	{1.0f - 0.108f, 0.621f}, col}
			},
			{
				0, 1, 2
			}
		});

		// bottom
		stencil.drawPolygon({
			{
				{{size * 0.405f, size * 0.864f},				{0.5f, 0},		  col},
				{{size - size * 0.405f, size * 0.864f},	{0.108f, 0.621f}, col},
				{{size / 2, size},	{1.0f - 0.108f, 0.621f}, col}
			},
			{
				0, 1, 2
			}
		});

		// body
		stencil.drawBox({size * 0.364f, size * 0.621f}, {size * 0.272f, size * 0.243f}, col);

		stencil.draw();
		recordings[Icon::carrier] = stencil.recordStop();
	}


	void IconSheet::setStyle(float size, const mainframe::render::Color& col, mainframe::render::Stencil& stencil) {
		recordings.clear();
		borderSize = size / 8.0f;

		generateIconPlus(stencil, size, col);
		generateIconCircle(stencil, size, col);
		generateIconSquare(stencil, size, col);
		generateIconhexagon(stencil, size, col);
		generateIconTriangle(stencil, size, col);
		generateIconPlus(stencil, size, col);
		generateIconDiamond(stencil, size, col);
		generateIconStar(stencil, size, col);
		generateIconLongCircle(stencil, size, col);
		generateIconCarrier(stencil, size, col);
		generateStarHidden(stencil, size, col);
		generateStarVisible(stencil, size, col);
	}

	const mainframe::render::Stencil::Recording& IconSheet::getIcon(Icon icon) {
		return *recordings[icon];
	}
}