#include <bt/app/engine.h>
#include <bt/world/camera.h>
#include <mainframe/ui/element.h>
#include <glfw/glfw3.h>

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

	void Camera::update() {
		float speed = 25.0f;

		if (moveDirections[0]) location.y += speed;
		if (moveDirections[1]) location.x -= speed;
		if (moveDirections[2]) location.y -= speed;
		if (moveDirections[3]) location.x += speed;
	}

	void Camera::hook(mainframe::ui::Scene& scene) {
		location = scene.getSize() / 2;

		scene.onMouseScroll += [this](const mainframe::math::Vector2i& mousePos, const mainframe::math::Vector2i& offset) {
			auto oldworldpos = screenToWorld(mousePos);

			zoom += zoom * 0.9f * mainframe::math::Vector2(static_cast<float>(offset.y) / 100);
			if (zoom.x > 5) zoom = 5;
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

		scene.onKeyPress += [this](unsigned int key, unsigned int scancode, mainframe::ui::ModifierKey mods, unsigned int action) {
			if (key == GLFW_KEY_W) moveDirections[0] = action == 1;
			if (key == GLFW_KEY_D) moveDirections[1] = action == 1;
			if (key == GLFW_KEY_S) moveDirections[2] = action == 1;
			if (key == GLFW_KEY_A) moveDirections[3] = action == 1;
		};
	}
}