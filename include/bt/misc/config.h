#pragma once

#include <mainframe/utils/string.h>
#include <mainframe/ui/modifierkey.h>

#include <string>
#include <map>
#include <nlohmann/json.hpp>
#include <fmt/format.h>

namespace bt {
	class KeyMapping {
	public:
		size_t key = 0;
		mainframe::ui::ModifierKey modifier;

		bool operator==(const KeyMapping& other);
		bool operator!=(const KeyMapping& other);
	};

	class ConfigKeymapping {
	public:
		KeyMapping camMoveUp = {87, mainframe::ui::ModifierKey::none};
		KeyMapping camMoveDown = {83, mainframe::ui::ModifierKey::none};
		KeyMapping camMoveLeft = {65, mainframe::ui::ModifierKey::none};
		KeyMapping camMoveRight = {68, mainframe::ui::ModifierKey::none};
	};

	class ConfigWorld {
	public:
		float scale = 200;
	};

	class ConfigCamera {
	public:
		float zoomMin = 0.2f;
		float zoomMax = 5.0f;
		float zoomSpeed = 0.92f;
		float zoomScrollScale = 100.0f;

		float moveSpeed = 25.0f;
	};

	class ConfigUI {
	public:
		float iconSheetSize = 128.0f;
		float iconStarSize = 16.0f;
		float iconStarRingSize = 26.0f;
		float iconCarrierSize = 16.0f;
		float iconCarrierRingSize = 26.0f;
		float iconCarrierShadowScale = 1.3f;
	};

	class Config {
	public:
		ConfigUI ui;
		ConfigWorld world;
		ConfigCamera camera;
		ConfigKeymapping mapping;
	};
}