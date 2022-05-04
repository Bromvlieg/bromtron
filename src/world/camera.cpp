#include <bt/app/engine.h>
#include <bt/world/camera.h>
#include <mainframe/ui/element.h>

namespace bt {
	mainframe::math::Vector2 Camera::worldToScreen(const mainframe::math::Vector2& worldpos) {
		return (worldpos * BromTron::getConfig().world.scale) * zoom + location;
	}

	mainframe::math::Vector2 Camera::screenToWorld(const mainframe::math::Vector2& screenpos) {
		return ((screenpos - location) / zoom) / BromTron::getConfig().world.scale;
	}

	void Camera::update() {
		auto& conf = BromTron::getConfig().camera;

		if (moveDirections[0]) location.y += conf.moveSpeed;
		if (moveDirections[1]) location.x -= conf.moveSpeed;
		if (moveDirections[2]) location.y -= conf.moveSpeed;
		if (moveDirections[3]) location.x += conf.moveSpeed;
	}

	void Camera::hookScene(mainframe::ui::Scene& scene) {
		location = scene.getSize() / 2;

		scene.onMouseScroll += [this](const mainframe::math::Vector2i& mousePos, const mainframe::math::Vector2i& offset) {
			auto& conf = BromTron::getConfig().camera;

			auto oldworldpos = screenToWorld(mousePos);

			float scrollStrength = static_cast<float>(offset.y);
			zoom += zoom * conf.zoomSpeed * mainframe::math::Vector2(scrollStrength / conf.zoomScrollScale);
			if (zoom.x > conf.zoomMax) zoom = conf.zoomMax;
			if (zoom.x < conf.zoomMin) zoom = conf.zoomMin;

			auto newscreenpos = worldToScreen(oldworldpos);

			location += mousePos - newscreenpos;
		};

		scene.onMousePress += [this](const mainframe::math::Vector2i& mousePos, unsigned int button, mainframe::ui::ModifierKey mods, mainframe::ui::MouseState state) {
			movingMap = state == mainframe::ui::MouseState::active;
			oldMovePos = mousePos;
		};

		scene.onMouseMove += [this](const mainframe::math::Vector2i& mousePos) {
			if (!movingMap) return;

			location += mousePos - oldMovePos;
			oldMovePos = mousePos;
		};

		scene.onKeyPress += [this](unsigned int key, unsigned int scancode, mainframe::ui::ModifierKey mods, mainframe::ui::KeyState action) {
			auto& mapping = BromTron::getConfig().mapping;

			KeyMapping comboPressed = {key, mods};
			if (action >= mainframe::ui::KeyState::active) {
				// to start moving a press combo must match
				if (comboPressed == mapping.camMoveUp) moveDirections[0] = true;
				if (comboPressed == mapping.camMoveRight) moveDirections[1] = true;
				if (comboPressed == mapping.camMoveDown) moveDirections[2] = true;
				if (comboPressed == mapping.camMoveLeft) moveDirections[3] = true;
			} else {
				// to end moving, only listen to prevent camera movement from getting stuck
				if (comboPressed.key == mapping.camMoveUp.key) moveDirections[0] = false;
				if (comboPressed.key == mapping.camMoveRight.key) moveDirections[1] = false;
				if (comboPressed.key == mapping.camMoveDown.key) moveDirections[2] = false;
				if (comboPressed.key == mapping.camMoveLeft.key) moveDirections[3] = false;
			}
		};
	}
}