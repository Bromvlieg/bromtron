#pragma once

#include <bt/ui/menu/base.h>
#include <bt/app/engine.h>
#include <bt/ui/elm/button.h>

namespace bt {
	class MenuIngame : public MenuBase {
		std::shared_ptr<Api::ApiHandle> apiCall;

		std::shared_ptr<Button> btnMail;

	public:
		virtual bool hitTest(const mainframe::math::Vector2i& mousePos);
		virtual void init() override;
		virtual void recreateElements() override;
	};
}