#pragma once

#include <bt/ui/elm/button.h>

namespace bt {
	class ElmOption : public Button {
		std::string icon;
		mainframe::render::Font* fontIcon = nullptr;
		void* ptr = nullptr;
		bool selected = false;

		mainframe::render::Color selectBackColor;
		mainframe::render::Color selectBorderColor;

	public:
		template<class T>
		void setUserObject(T& val) { ptr = &val; };

		template<class T>
		T* getUserObject() { return reinterpret_cast<T*>(ptr); }

		void setIconFont(mainframe::render::Font* font);
		mainframe::render::Font* getIconFont();
		void setIcon(const std::string& str);
		void setSelected(bool sel);
		bool getSelected();

		const mainframe::render::Color& getSelectedBackColor();
		const mainframe::render::Color& getSelectedBorderColor();

		void setSelectedBackColor(const mainframe::render::Color& col);
		void setSelectedBorderColor(const mainframe::render::Color& col);

		virtual void draw(mainframe::render::Stencil& stencil) override;

		ElmOption();
	};
}