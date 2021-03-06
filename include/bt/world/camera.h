#pragma once

#include <mainframe/math/vector2.h>
#include <mainframe/math/aabb.h>

namespace bt {
	class Camera {
		bool movingMap = false;
		mainframe::math::Vector2i oldMovePos;

		bool moveDirections[4];

	public:
		mainframe::math::Vector2 location;
		mainframe::math::Vector2 zoom {0.5f, 0.5f};

		mainframe::math::Vector2 worldToScreen(const mainframe::math::Vector2& worldpos);
		mainframe::math::Vector2 screenToWorld(const mainframe::math::Vector2& screenpos);

		void hookScene(mainframe::ui::Scene& scene);
		void update();
	};
}