#pragma once

#include <bt/ui/menu/base.h>
#include <bt/ui/elm/option.h>
#include <bt/app/engine.h>

namespace mainframe::ui {
	class ScrollPanel;
}

namespace bt {
	class MenuOption : public MenuBase {
		mainframe::math::Vector2i boxSize;

		std::shared_ptr<mainframe::render::Font> font;
		std::shared_ptr<mainframe::ui::ScrollPanel> pnlBack;
		std::vector<std::shared_ptr<ElmOption>> options;

		std::shared_ptr<ElmOption> selected;

	public:
		virtual void init() override;
		virtual void draw(mainframe::render::Stencil& stencil) override;

		mainframe::utils::Event<std::shared_ptr<ElmOption>> onClose;

		void show();
		std::shared_ptr<ElmOption> addOption(const std::string& icon, const std::string& text);
		virtual void recreateElements() override;
	};
}