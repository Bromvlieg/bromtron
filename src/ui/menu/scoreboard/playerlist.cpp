#include <bt/ui/menu/scoreboard/playerlist.h>

#include <mainframe/ui/elms/panel.h>
#include <mainframe/ui/elms/button.h>

#include <bt/misc/content.h>
#include <bt/misc/fontawesome.h>

#include <bt/app/engine.h>
#include <bt/misc/translate.h>

using namespace mainframe::ui;
using namespace mainframe::math;
using namespace mainframe::render;

namespace bt {
	PlayerList::PlayerList() {
		font = Content::getFont("text", 16);
	}

	void PlayerList::draw(Stencil& stencil) {
		auto& size = getSize();

		stencil.drawBoxOutlined(0, size, 1, Colors::Black);
		stencil.drawBox(1, size - 2, {0.1, 0.1, 0.1, 1});
	}

	void PlayerEnabledPanel::draw(Stencil& stencil) {
		auto& size = getSize();

		stencil.drawBoxOutlined(0, size, 1, Colors::Black);
		stencil.drawBox(1, size - 2, enabled ? Colors::Green : Colors::Red);
	}

	void PlayerColorPanel::draw(Stencil& stencil) {
		auto& size = getSize();

		stencil.drawBoxOutlined(0, size, 1, Colors::Black);
		stencil.drawBox(1, size - 2, color);
	}

	void PlayerList::recreateElements() {
		auto& size = getSize();

		auto btnTotal = createChild<Button>();
		btnTotal->setPos({ 5, 5 });
		btnTotal->setSize({ size.x - 10, 20 });
		btnTotal->setFont(font);
		btnTotal->setText("score: total");
		btnTotal->onClick += [&]() { onTypeChange(ScoreboardCategory::total); };

		auto btnEco = createChild<Button>();
		btnEco->setPos({ btnTotal->getPos().x, btnTotal->getPos().y + btnTotal->getSize().y + 5 });
		btnEco->setSize({ size.x - 10, 20 });
		btnEco->setFont(font);
		btnEco->setText("score: eco");
		btnEco->onClick += [&]() { onTypeChange(ScoreboardCategory::eco); };

		auto btnTech = createChild<Button>();
		btnTech->setPos({ btnEco->getPos().x, btnEco->getPos().y + btnEco->getSize().y + 5 });
		btnTech->setSize({ size.x - 10, 20 });
		btnTech->setFont(font);
		btnTech->setText("score: tech");
		btnTech->onClick += [&]() { onTypeChange(ScoreboardCategory::tech); };

		auto btnPower = createChild<Button>();
		btnPower->setPos({ btnTech->getPos().x, btnTech->getPos().y + btnTech->getSize().y + 5 });
		btnPower->setSize({ size.x - 10, 20 });
		btnPower->setFont(font);
		btnPower->setText("score: power");
		btnPower->onClick += [&]() { onTypeChange(ScoreboardCategory::power); };

		auto btnPlanets = createChild<Button>();
		btnPlanets->setPos({ btnPower->getPos().x, btnPower->getPos().y + btnPower->getSize().y + 5 });
		btnPlanets->setSize({ size.x - 10, 20 });
		btnPlanets->setFont(font);
		btnPlanets->setText("score: planets");
		btnPlanets->onClick += [&]() { onTypeChange(ScoreboardCategory::planets); };

		auto btnProduced = createChild<Button>();
		btnProduced->setPos({ btnPlanets->getPos().x, btnPlanets->getPos().y + btnPlanets->getSize().y + 5 });
		btnProduced->setSize({ size.x - 10, 20 });
		btnProduced->setFont(font);
		btnProduced->setText("score: ship production");
		btnProduced->onClick += [&]() { onTypeChange(ScoreboardCategory::produced); };

		auto btnWar = createChild<Button>();
		btnWar->setPos({ btnProduced->getPos().x, btnProduced->getPos().y + btnProduced->getSize().y + 5 });
		btnWar->setSize({ size.x - 10, 20 });
		btnWar->setFont(font);
		btnWar->setText("ships lost in war");
		btnWar->onClick += [&]() { onTypeChange(ScoreboardCategory::losses); };

		auto plys = BromTron::getWorld().getPlayers();
		int curY = btnWar->getPos().y + btnWar->getSize().y + 20;
		for (auto& ply : plys) {
			auto pnlPly = createChild<PlayerEnabledPanel>();
			pnlPly->setPos({ btnWar->getPos().x, curY });
			pnlPly->setSize({ 20, 20 });
			pnlPly->enabled = true;

			auto pnlColorPly = createChild<PlayerColorPanel>();
			pnlColorPly->setPos({ pnlPly->getPos().x + pnlPly->getSize().x + 5, curY });
			pnlColorPly->setSize({ 20, 20 });
			pnlColorPly->color = ply->color;

			auto btnPly = createChild<Button>();
			btnPly->setPos({ pnlColorPly->getPos().x + pnlColorPly->getSize().x + 5, curY });
			btnPly->setSize({ size.x - 10 - pnlPly->getSize().x - 5 - pnlColorPly->getSize().x - 5, 20});
			btnPly->setFont(font);
			btnPly->setText(ply->name);

			auto uid = ply->uid;
			auto pnlPlyPtr = pnlPly.get();
			btnPly->onClick += [this, uid, pnlPlyPtr]() {
				onPlayerToggle(uid, pnlPlyPtr->enabled);
				pnlPlyPtr->enabled = !pnlPlyPtr->enabled;
			};

			curY += 5 + btnPly->getSize().y;
		}
	}
}
