#pragma once

#include <mainframe/ui/element.h>
#include <bt/app/game.h>
#include <map>

namespace bt {
	class Button;
	class ElmOption;

	enum class Menus {
		none,
		login
	};

	class MenuBase : public mainframe::ui::Element {

	public:
		static void switchMenu(Menus menu);
		static std::shared_ptr<MenuBase>& getCurrentMenu();
		static std::shared_ptr<MenuBase>& getMenu(Menus menu);
		static std::map<Menus, std::shared_ptr<MenuBase>>& getMenus();
		static void initMenus(Game& game);
		static void destroyMenus();

		MenuBase();

		virtual void init() = 0;
		virtual void recreateElements() = 0;

		void applyTheme();
		void applyTheme(std::shared_ptr<mainframe::ui::Element> elm);
		void applyTheme(Button& elm);
		void applyTheme(ElmOption& elm);


		template<class T>
		void applyThemeTest(std::shared_ptr<mainframe::ui::Element>& elm) {
			auto ptrcast = std::dynamic_pointer_cast<T>(elm);
			if (ptrcast != nullptr) applyTheme(*ptrcast);
		}
	};
}