#include <bt/misc/content.h>
#include <stdexcept>

using Font = mainframe::render::Font;
using Texture = mainframe::render::Texture;
using TextureHandle = mainframe::render::TextureHandle;

namespace bt {
	mainframe::render::TextEngine Content::textEngine;
	std::map<std::string, Content::ContentType> Content::assets;

	auto& getLoadedTextures() {
		thread_local std::map<std::string, std::shared_ptr<Texture>> loaded;
		return loaded;
	}

	auto& getLoadedFonts() {
		thread_local std::map<std::string, std::map<float, Font*>> loaded;
		return loaded;
	}

	void Content::quit() {
		for (auto& loadedmap : getLoadedFonts()) {
			for (auto& sizemap : loadedmap.second) {
				//sizemap.second->getSharedHandle()->reset();
				//sizemap.second->tex.getSharedHandle()->reset();
			}
		}

		for (auto& loadedmap : getLoadedTextures()) {
			loadedmap.second->getSharedHandle()->reset();
		}
	}

	void Content::shutdown() {
		assets.clear();
	}

	std::shared_ptr<Texture> Content::getTexture(const std::string& asset) {
		auto& loaded = getLoadedTextures();

		auto file = std::get<std::shared_ptr<Texture>>(getAsset("textures/" + asset));

		auto iter = loaded.find(asset);
		if (iter == loaded.end()) {
			auto t = std::make_shared<Texture>();
			t->setPixels(file->getSize(), file->data());
			t->upload();
			t->unloadPixels();

			loaded[asset] = t;
		}

		return loaded[asset];
	}

	mainframe::render::Font* Content::getFont(const std::string& asset, unsigned int size) {
		auto& loaded = getLoadedFonts();

		auto file = std::get<std::string>(getAsset("fonts/" + asset));

		auto iter = loaded.find(asset);
		if (iter == loaded.end() || iter->second.find(size) == iter->second.end()) {
			loaded[asset][size] = &textEngine.loadFont("fonts/" + file + ".ttf", size);
		}

		return loaded[asset][size];
	}

	Content::ContentType Content::getAsset(const std::string& asset) {
		auto iter = assets.find(asset);
		if (iter == assets.end()) throw std::runtime_error("asset not loaded: " + asset);

		return iter->second;
	}

	void Content::loadImage(const std::string& asset) {
		assets["textures/" + asset] = std::make_shared<Texture>("textures/" + asset + ".png");
	}

	void Content::loadFont(const std::string& asset, const std::string& nicename) {
		assets["fonts/" + nicename] = asset;
	}
}