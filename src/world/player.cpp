#include <bt/world/player.h>
#include <bt/misc/content.h>
#include <bt/app/engine.h>

namespace bt {
	void Player::load(const ApiMapPlayer& ply) {
		name = ply.name;
		uid = ply.uid;

		mainframe::render::Color cols[] = {
			mainframe::render::Color(0.0f, 0.2f, 0.8f), // blue
			mainframe::render::Color(0.0f, 0.8f, 0.9f), // cyan
			mainframe::render::Color(0.3f, 0.7f, 0.4f), // green
			mainframe::render::Color(0.9f, 1.f, 0.3f), // yellow
			mainframe::render::Color(0.9f, 0.5f, 0.1f), // orange
			mainframe::render::Color(0.9f, 0.0f, 0.0f), // red
			mainframe::render::Color(1.0f, 0.2f, 0.6f), // pink
			mainframe::render::Color(0.8f, 0.1f, 1.0f), // purple
		};

		size_t colindex = uid - uid / 8 * 8;
		icons.setStyle(32, cols[colindex], BromTron::game().stencil);
	}

	void Player::update() {

	}

	void Player::draw(mainframe::render::Stencil& stencil) {

	}

	mainframe::math::AABB Player::getIconAABB() {
		auto tex = Content::getTexture("stars");

		mainframe::math::Vector2 sizeicon = 1.0f / 9.0f;

		mainframe::math::Vector2 offset;
		offset.x = std::floor(uid / 8);
		offset.y = uid - offset.x * 8;

		offset.y++; // first row is star and carrier

		mainframe::math::AABB ret;
		ret.x = offset.x * sizeicon.x;
		ret.y = offset.y * sizeicon.y;
		ret.w = sizeicon.x;
		ret.h = sizeicon.y;

		return ret;
	}
}