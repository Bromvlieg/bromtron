#include <bt/app/engine.h>
#include <bt/world/camera.h>
#include <mainframe/ui/element.h>

namespace bt {
	mainframe::math::Vector2 Camera::worldToScreen(const mainframe::math::Vector2& worldpos) {
		return (worldpos * scale) * zoom + location;
	}

	mainframe::math::Vector2 Camera::screenToWorld(const mainframe::math::Vector2& screenpos) {
		return ((screenpos - location) / zoom) / scale;
	}

	mainframe::math::AABB Camera::worldToScreen(const mainframe::math::AABB& worldpos) {
		auto pos = worldToScreen(mainframe::math::Vector2(worldpos.x, worldpos.y));
		return {pos.x, pos.y, worldpos.w, worldpos.h};
		//return {pos.x, pos.y, worldpos.w * zoom.x, worldpos.h * zoom.y};
	}

	mainframe::math::AABB Camera::screenToWorld(const mainframe::math::AABB& screenpos) {
		auto pos = screenToWorld(mainframe::math::Vector2(screenpos.x, screenpos.y));
		return {pos.x, pos.y, screenpos.w, screenpos.h};
		//return {pos.x, pos.y, screenpos.w / zoom.x, screenpos.h / zoom.y};
	}

	void Camera::hook(mainframe::ui::Scene& scene) {
		location = scene.getSize() / 2;

		scene.onMouseScroll += [this](const mainframe::math::Vector2i& mousePos, const mainframe::math::Vector2i& offset) {
			auto oldworldpos = screenToWorld(mousePos);

			zoom += mainframe::math::Vector2(offset.y) / 200;
			if (zoom.x > 3) zoom = 3;
			if (zoom.x < 0.2f) zoom = 0.2f;

			auto newscreenpos = worldToScreen(oldworldpos);

			location += mousePos - newscreenpos;
		};

		scene.onMousePress += [this](const mainframe::math::Vector2i& mousePos, unsigned int button, mainframe::ui::ModifierKey mods, bool pressed) {
			movingMap = pressed;
			oldMovePos = mousePos;
		};

		scene.onMouseMove += [this](const mainframe::math::Vector2i& mousePos) {
			if (!movingMap) return;

			location += mousePos - oldMovePos;
			oldMovePos = mousePos;
		};
	}
}