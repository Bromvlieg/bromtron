#include <bt/world/carrier.h>
#include <bt/misc/content.h>
#include <bt/world/world.h>
#include <bt/world/player.h>
#include <bt/app/engine.h>

namespace bt {
	Carrier::Carrier(World& w) : world(w) {

	}

	void Carrier::load(const ApiCarrier& carrier) {
		name = carrier.name;
		uid = carrier.uid;
		location = carrier.location;
		owner = world.getPlayer(carrier.puid);
	}

	void Carrier::update() {

	}

	void Carrier::draw(mainframe::render::Stencil& stencil) {
		auto& cam = BromTron::getCam();
		auto spos = cam.worldToScreen(location);
		mainframe::math::Vector2 ssize = {32, 32};

		auto tex = Content::getTexture("stars");
		mainframe::math::AABB icon = {1.0f / 9.0f * 2, 0, 1.0f / 9.0f, 1.0f / 9.0f};

		stencil.drawTexture(
			spos - ssize / 2,
			ssize,
			*tex,
			mainframe::render::Colors::White,
			{icon.x, icon.y},
			{icon.x + icon.w, icon.y + icon.h}
		);

		if (owner == nullptr) return;
		stencil.drawRecording(owner->icons.getIcon(owner->icon()), spos - 16);
	}
}