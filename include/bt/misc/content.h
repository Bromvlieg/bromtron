#pragma once

#include <mainframe/render/texture.h>
#include <mainframe/render/font.h>

#include <map>
#include <variant>

namespace bt {
	class Content {
		using ContentType = std::variant<std::string, std::shared_ptr<mainframe::render::Texture>>;

		static std::map<std::string, ContentType> assets;
		static ContentType getAsset(const std::string& asset);

	public:
		static std::shared_ptr<mainframe::render::Texture> getTexture(const std::string& asset);
		static std::shared_ptr<mainframe::render::Font> getFont(const std::string& asset, float size);

		static void loadImage(const std::string& asset);
		static void loadFont(const std::string& asset, const std::string& nicename);

		static void quit();
		static void shutdown();
	};
}