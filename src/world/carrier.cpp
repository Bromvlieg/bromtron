#include <bt/world/carrier.h>
#include <bt/misc/content.h>
#include <bt/world/world.h>
#include <bt/world/player.h>
#include <bt/world/star.h>
#include <mainframe/numbers/pi.h>
#include <bt/app/engine.h>

namespace bt {
	Carrier::Carrier(World& w) : world(w) {

	}

	void Carrier::load(const ApiCarrier& carrier) {
		name = carrier.name;
		uid = carrier.uid;
		location = carrier.location;
		owner = world.getPlayer(carrier.puid);
		star = world.getStar(carrier.ouid);

		for (auto& order : carrier.orders) {
			orders.push_back({
				static_cast<OrderType>(order.type),
				world.getStar(order.starId),
				order.ships,
				order.delay
			});
		}
	}

	void Carrier::update() {

	}

	void Carrier::draw(mainframe::render::Stencil& stencil) {
		auto& game = BromTron::getGame();
		auto& conf = game.config.ui;

		auto spos = BromTron::getCam().worldToScreen(location);

		Order* currentOrder = !orders.empty() ? &orders.front() : nullptr;
		mainframe::math::Vector2 oldPos = spos;
		for (auto& order : orders) {
			auto starpos = BromTron::getCam().worldToScreen(order.star->location);

			mainframe::render::Color backcol = {0.9f, 0.9f, 0.9f, 0.6f};
			stencil.drawLine(oldPos, starpos, conf.iconCarrierSize / 4, backcol);

			auto plycol = owner->color;
			plycol.a = 0.6f;
			stencil.drawLine(oldPos, starpos, conf.iconCarrierSize / 8, plycol);

			oldPos = starpos;
		}

		float angle = currentOrder == nullptr ? 0 : location.angle(currentOrder->star->location) - mainframe::numbers::pi<float> / 4;

		stencil.drawRecording(game.world.iconsShadows.getIcon(Icon::carrier), spos - conf.iconCarrierSize * conf.iconCarrierShadowScale / 2, conf.iconCarrierSize * conf.iconCarrierShadowScale / conf.iconSheetSize, angle, conf.iconCarrierSize * conf.iconCarrierShadowScale / 2);
		stencil.drawRecording(game.world.icons.getIcon(Icon::carrier), spos - conf.iconCarrierSize / 2, conf.iconCarrierSize / conf.iconSheetSize, angle, conf.iconCarrierSize / 2);
	}

	void Carrier::drawOwnership(mainframe::render::Stencil& stencil) {
		auto& game = BromTron::getGame();
		auto& conf = game.config.ui;

		auto spos = BromTron::getCam().worldToScreen(location);

		stencil.drawRecording(owner->icons.getIcon(owner->icon()), spos - conf.iconCarrierRingSize / 2, conf.iconCarrierRingSize / conf.iconSheetSize);
	}
}