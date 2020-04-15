#pragma once

#include <mainframe/utils/string.h>

#include <string>
#include <map>
#include <nlohmann/json.hpp>
#include <fmt/format.h>

namespace bt {
	class ConfigKeymapping {
	public:
		size_t camMoveUp = 87;
		size_t camMoveDown = 83;
		size_t camMoveLeft = 65;
		size_t camMoveRight = 68;
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
		float iconStarSize = 26.0f;
		float iconStarRingSize = 42.0f;
		float iconCarrierSize = 26.0f;
		float iconCarrierRingSize = 42.0f;
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