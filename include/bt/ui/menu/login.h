#pragma once

#include <bt/ui/menu/base.h>
#include <bt/app/engine.h>

namespace bt {
	class MenuLogin : public MenuBase {
		mainframe::math::Vector2i boxSize;

		mainframe::render::Font* font = nullptr;
		std::string text;
		mainframe::math::Vector2i textSize;
		std::string eventName;

		std::shared_ptr<Api::ApiHandle> apiCall;

		void initPlayer();

	public:
		virtual void init() override;
		virtual void draw(mainframe::render::Stencil& stencil) override;
		virtual void recreateElements() override;
	};
}