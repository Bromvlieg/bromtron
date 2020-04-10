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
		auto& cam = BromTron::cam();
		auto spos = cam.worldToScreen(location);
		mainframe::math::Vector2 ssize = {64, 64};

		auto tex = Content::getTexture("stars");
		mainframe::math::AABB icon = {1.0f / 9.0f, 0, 1.0f / 9.0f, 1.0f / 9.0f};
		if (visible) icon.x = 0;

		stencil.drawTexture(
			spos - ssize / 2,
			ssize,
			*tex,
			mainframe::render::Colors::White,
			{icon.x, icon.y},
			{icon.x + icon.w, icon.y + icon.h}
		);

		if (owner == nullptr) return;

		icon = owner->getIconAABB();
		stencil.drawTexture(
			spos - ssize / 2,
			ssize,
			*tex,
			mainframe::render::Colors::White,
			{icon.x, icon.y},
			{icon.x + icon.w, icon.y + icon.h}
		);
	}
}