#include <bt/world/player.h>
#include <bt/misc/content.h>

namespace bt {
	void Player::load(const ApiMapPlayer& ply) {
		name = ply.name;
		uid = ply.uid;
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