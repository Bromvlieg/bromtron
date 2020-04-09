#include <bt/ui/menu/base.h>
#include <bt/ui/menu/login.h>

#include <bt/ui/elm/button.h>
#include <bt/ui/elm/option.h>

using namespace mainframe::render;

namespace bt {
	std::map<Menus, std::shared_ptr<MenuBase>>& MenuBase::getMenus() {
		thread_local std::map<Menus, std::shared_ptr<MenuBase>> menus;
		return menus;
	}

	std::shared_ptr<MenuBase>& MenuBase::getCurrentMenu() {
		thread_local std::shared_ptr<MenuBase> menu;
		return menu;
	}

	std::shared_ptr<MenuBase>& MenuBase::getMenu(Menus menu) {
		return getMenus()[menu];
	}

	void MenuBase::switchMenu(Menus menu) {
		auto& m = getCurrentMenu();
		if (m != nullptr) m->hide();

		m = getMenu(menu);
		if (m == nullptr) return;

		m->show();
	}

	void MenuBase::initMenus(Game& game) {
		auto& menus = getMenus();

		menus[Menus::login] = game.scene->createChild<MenuLogin>();

		for (auto& pair : menus) {
			auto& menu = *pair.second;

			menu.setSize(game.stencil.getWindowSize());
			menu.init();
			menu.recreateElements();
		}
	}

	void MenuBase::destroyMenus() {
		auto& menus = getMenus();

		for (auto& pair : menus) {
			pair.second->remove();
		}

		getMenus().clear();
	}

	MenuBase::MenuBase() {
		hide();
	}

	void MenuBase::applyTheme(std::shared_ptr<mainframe::ui::Element> elm) {
		applyThemeTest<Button>(elm);
		applyThemeTest<ElmOption>(elm);

		for (auto& e : elm->getChildren()) {
			applyTheme(e);
		}
	}

	void MenuBase::applyTheme() {
		for (auto& elm : getChildren()) {
			applyTheme(elm);
		}
	}

	void MenuBase::applyTheme(Button& elm) {
		elm.setBackColor({0, 0.55f, 0.72f});
		elm.setHoverColor({0, 0.4f, 132});
		elm.setBorderColor({0, 0.44f, 0.60f});
		elm.setColor({Colors::White});
	}

	void MenuBase::applyTheme(ElmOption& elm) {
		elm.setSelectedBackColor(elm.getBackColor() + 0.2f);
		elm.setSelectedBorderColor({0, 0, 0.40f});
	}
}