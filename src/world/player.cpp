#include <bt/world/player.h>
#include <bt/misc/content.h>
#include <bt/app/engine.h>

namespace bt {
	std::vector<mainframe::render::Color> Player::Colors = {
		mainframe::render::Color(0.0f, 0.2f, 0.8f), // blue
		mainframe::render::Color(0.0f, 0.8f, 0.9f), // cyan
		mainframe::render::Color(0.3f, 0.7f, 0.4f), // green
		mainframe::render::Color(0.9f, 1.0f, 0.3f), // yellow
		mainframe::render::Color(0.9f, 0.5f, 0.1f), // orange
		mainframe::render::Color(0.9f, 0.0f, 0.0f), // red
		mainframe::render::Color(1.0f, 0.2f, 0.6f), // pink
		mainframe::render::Color(0.8f, 0.1f, 1.0f), // purple
	};

	void Player::load(const ApiPlayer& ply) {
		name = ply.name;
		uid = ply.uid;

		auto& conf = BromTron::getConfig().ui;

		color = Colors[uid - uid / 8 * 8];
		icons.setStyle(conf.iconSheetSize, color, BromTron::getGame().stencil);
	}

	void Player::update() {

	}

	void Player::draw(mainframe::render::Stencil& stencil) {

	}
}