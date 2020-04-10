#include <bt/ui/menu/login.h>
#include <bt/ui/menu/common/option.h>
#include <bt/misc/content.h>
#include <bt/misc/fontawesome.h>

#include <bt/app/engine.h>
#include <bt/ui/elm/button.h>

#include <mainframe/ui/elms/panel.h>
#include <mainframe/ui/elms/label.h>
#include <mainframe/ui/elms/frame.h>
#include <mainframe/ui/elms/image.h>
#include <mainframe/ui/elms/textbox.h>

#include <bt/misc/translate.h>

using namespace mainframe::ui;
using namespace mainframe::math;
using namespace mainframe::render;

namespace bt {
	void MenuLogin::init() {
		font = Content::getFont("text", 16);
		textSize = font->getStringSize(text);

		boxSize = {450, 300};

		initPlayer();
	}

	void MenuLogin::initPlayer() {
		auto& api = BromTron::api();

		apiCall = api.initPlayer([this](ApiLocalPlayer ply, const std::string& errMsg) {
			if (ply.id.empty()) {
				printf("init failed '%s'\n", errMsg.c_str());
				return;
			}

			invoke([this, ply]() {
				BromTron::game().localplayer = ply;
				remove();

				BromTron::world().loadGame(ply.gamesOpen[0]);
			});
		});
	}

	void MenuLogin::recreateElements() {
		this->clearChildren();

		auto& oursize = getSize();

		auto txtUser = createChild<Textbox>();
		auto& txtUsersize = txtUser->getSize();
		txtUser->setFont(font);
		txtUser->setText("bromvlieg");
		txtUser->resizeToContents();
		txtUser->setSize({300, 30});
		txtUser->setPos(oursize / 2 + Vector2i(-txtUsersize.x / 2, 0));

		auto txtPass = createChild<Textbox>();
		auto& txtPasssize = txtPass->getSize();
		txtPass->setFont(font);
		txtPass->setText("");
		txtPass->setMask("*");
		txtPass->resizeToContents();
		txtPass->setSize({300, 30});
		txtPass->setPos(txtUser->getPos() + Vector2i(0, txtPass->getSize().y + 20));

		auto btnmanual = createChild<Button>();
		auto& btnmanualsize = btnmanual->getSize();
		btnmanual->setFont(font);
		btnmanual->setText(Translate::key("ui.menu.login.btn"));
		btnmanual->resizeToContents();
		btnmanual->setSize(btnmanualsize + 20);
		btnmanual->setPos(oursize / 2 + Vector2i(-btnmanualsize.x / 2, boxSize.y / 2 - btnmanualsize.y - 10));

		btnmanual->onClick += [this, txtUser, txtPass]() {
			auto& api = BromTron::api();
			apiCall = api.login(txtUser->getText(), txtPass->getText(), [this, &api](bool success, const std::string& errMsg) {
				if (!success) {
					printf("login failed '%s'\n", errMsg.c_str());
					return;
				}

				initPlayer();
			});
		};

		auto btnexit = createChild<Button>();
		btnexit->setFont(font);
		btnexit->setText(Translate::key("ui.common.quit"));
		btnexit->resizeToContents();
		btnexit->setSize(btnexit->getSize() + 30);
		btnexit->setPos(oursize - btnexit->getSize() - 10);

		btnexit->onClick += [this]() {
			BromTron::game().quit();
		};

		applyTheme();
	}

	void MenuLogin::draw(mainframe::render::Stencil& stencil) {
		auto size = getSize();
		auto pos = size / 2 - boxSize / 2;

		stencil.drawBoxOutlined(pos, boxSize, 1, Colors::Black);
		stencil.drawBox(pos + 1, boxSize - 2, Color(255, 255, 255, 217));
	}
}
