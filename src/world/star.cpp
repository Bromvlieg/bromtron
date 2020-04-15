#include <bt/world/star.h>
#include <bt/world/world.h>
#include <bt/misc/content.h>
#include <bt/app/engine.h>

namespace bt {
	Star::Star(World& w) : world(w) {

	}

	void Star::load(const ApiStar& star) {
		name = star.name;
		uid = star.uid;
		location = star.location;
		visible = star.visible;
		owner = world.getPlayer(star.puid);
	}

	void Star::update() {

	}

	void Star::draw(mainframe::render::Stencil& stencil) {
		auto& game = BromTron::getGame();
		auto& conf = game.config.ui;
		auto spos = game.camera.worldToScreen(location);

		stencil.drawRecording(game.world.icons.getIcon(visible ? Icon::starVisible : Icon::starHidden), spos - conf.iconStarSize / 2, conf.iconStarSize / conf.iconSheetSize);
	}

	void Star::drawOwnership(mainframe::render::Stencil& stencil) {
		if (owner == nullptr) return;

		auto& game = BromTron::getGame();
		auto& conf = game.config.ui;
		auto spos = game.camera.worldToScreen(location);

		stencil.drawRecording(owner->icons.getIcon(owner->icon()), spos - conf.iconStarRingSize / 2, conf.iconStarRingSize / conf.iconSheetSize);
	}
}