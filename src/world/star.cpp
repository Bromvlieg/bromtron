#include <bt/world/star.h>
#include <bt/world/world.h>
#include <bt/misc/content.h>
#include <bt/app/engine.h>

namespace bt {
	Star::Star(World& w) : world(w) {

	}

	void Star::load(const ApiStar& star) {
		owner = world.getPlayer(star.puid);

		name = star.name;
		uid = star.uid;
		location = star.location;
		visible = star.visible;

		resources = star.resourcesNatural;
		ecoBuild = star.economy;
		techBuild = star.tech;
		induBuild = star.industry;
		ships = star.ships;
	}

	void Star::buildEco() {
		ecoBuild++;
	}

	void Star::buildIndu() {
		induBuild++;
	}

	void Star::buildTech() {
		techBuild++;
	}


	int Star::getEconomy() {
		return ecoBuild;
	}

	int Star::getIndustry() {
		return induBuild;
	}

	int Star::getTech() {
		return techBuild;
	}

	int Star::getResources() {
		return resources + (owner != nullptr ? owner->tech.terraforming.level * 5 : 0);
	}

	void Star::setResources(int res) {
		resources = res;
	}

	int Star::getShips() {
		return resources;
	}

	void Star::setShips(int count) {
		ships = count;
	}

	int Star::getTechCost() {
		float cost = 20.0f;

		cost *= static_cast<float>(world.config.start.techCost);
		cost *= static_cast<float>(techBuild) + 1;
		cost /= static_cast<float>(getResources()) / 100.0f;

		return static_cast<int>(std::floor(cost));
	}

	int Star::getEconomyCost() {
		float cost = 2.5f;

		cost *= static_cast<float>(world.config.start.economyCost);
		cost *= static_cast<float>(ecoBuild) + 1;
		cost /= static_cast<float>(getResources()) / 100.0f;

		return static_cast<int>(std::floor(cost));

	}

	int Star::getIndustryCost() {
		float cost = 5.0f;

		cost *= static_cast<float>(world.config.start.industryCost);
		cost *= static_cast<float>(induBuild) + 1;
		cost /= static_cast<float>(getResources()) / 100.0f;

		return static_cast<int>(std::floor(cost));
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