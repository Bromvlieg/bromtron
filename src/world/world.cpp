#include <bt/world/world.h>
#include <bt/app/engine.h>

namespace bt {
	void World::syncStars(const std::map<std::string, ApiStar> starlst) {
		for (auto& pair : starlst) {
			auto& star = pair.second;
			auto ourstar = getStar(star.uid);

			if (ourstar != nullptr) {
				ourstar->load(star);
				continue;
			}

			ourstar = std::make_shared<Star>(*this);
			ourstar->load(star);

			lock.lock();
			stars.push_back(ourstar);
			lock.unlock();
		}
	}

	void World::syncCarriers(const std::map<std::string, ApiCarrier> carrierlst) {
		lock.lock();

		std::vector<std::shared_ptr<Carrier>> newcarriers;
		for (auto& ourcarrier : carriers) {
			bool dead = true;

			for (auto& pair : carrierlst) {
				auto& carrier = pair.second;

				if (carrier.uid != ourcarrier->uid) continue;

				dead = false;
				break;
			}

			if (!dead) {
				newcarriers.push_back(ourcarrier);
			}
		}

		carriers = newcarriers;
		lock.unlock();

		for (auto& pair : carrierlst) {
			auto& carrier = pair.second;
			auto ourcarrier = getCarrier(carrier.uid);

			if (ourcarrier != nullptr) {
				ourcarrier->load(carrier);
				continue;
			}

			ourcarrier = std::make_shared<Carrier>(*this);
			ourcarrier->load(carrier);

			lock.lock();
			carriers.push_back(ourcarrier);
			lock.unlock();
		}
	}

	void World::syncPlayers(const std::map<std::string, ApiMapPlayer> playerlst) {
		for (auto& pair : playerlst) {
			auto& ply = pair.second;
			auto ourply = getPlayer(ply.uid);

			if (ourply != nullptr) {
				ourply->load(ply);
				continue;
			}

			ourply = std::make_shared<Player>();
			ourply->load(ply);

			lock.lock();
			players.push_back(ourply);
			lock.unlock();
		}
	}

	std::shared_ptr<Star> World::getStar(size_t uid) {
		const std::lock_guard<std::mutex> lockguard(lock);

		for (auto& star : stars) {
			if (star->uid != uid) continue;

			return star;
		}

		return {};
	}

	std::shared_ptr<Player> World::getPlayer(size_t uid) {
		const std::lock_guard<std::mutex> lockguard(lock);

		for (auto& ply : players) {
			if (ply->uid != uid) continue;

			return ply;
		}

		return {};
	}

	std::shared_ptr<Carrier> World::getCarrier(size_t uid) {
		const std::lock_guard<std::mutex> lockguard(lock);

		for (auto& carrier : carriers) {
			if (carrier->uid != uid) continue;

			return carrier;
		}

		return {};
	}

	void World::loadGame(const ApiPlayerGame& lobby) {
		auto& api = BromTron::api();

		apiCallLoadGame = api.getMap(lobby.id, [this](ApiMap& map, const std::string& errMsg) {
			syncPlayers(map.players);
			syncStars(map.stars);
			syncCarriers(map.carriers);

			for (auto& p : map.players) {
				auto& ply = p.second;

				printf("ply '%s', uid %d, hud %d, \n", ply.name.c_str(), ply.uid, ply.huid);
			}

			printf("done loading :)\n");
		});
	}

	void World::update() {
		lock.lock();
		auto tmpStars = stars;
		auto tmpCarriers = carriers;
		lock.unlock();

		for (auto& obj : tmpStars) obj->update();
		for (auto& obj : tmpCarriers) obj->update();
	}

	void World::draw(mainframe::render::Stencil& stencil) {
		lock.lock();
		auto tmpStars = stars;
		auto tmpCarriers = carriers;
		lock.unlock();

		for (auto& obj : tmpStars) obj->draw(stencil);
		for (auto& obj : tmpCarriers) obj->draw(stencil);
	}

	mainframe::math::Vector2 World::worldToScreen(const mainframe::math::Vector2& worldpos) {
		return (worldpos * scale) * zoom + center;
	}

	mainframe::math::Vector2 World::screenToWorld(const mainframe::math::Vector2& screenpos) {
		return ((screenpos - center) / zoom) / scale;
	}

	mainframe::math::AABB World::worldToScreen(const mainframe::math::AABB& worldpos) {
		auto pos = worldToScreen(mainframe::math::Vector2(worldpos.x, worldpos.y));
		return {pos.x, pos.y, worldpos.w, worldpos.h};
		//return {pos.x, pos.y, worldpos.w * zoom.x, worldpos.h * zoom.y};
	}

	mainframe::math::AABB World::screenToWorld(const mainframe::math::AABB& screenpos) {
		auto pos = screenToWorld(mainframe::math::Vector2(screenpos.x, screenpos.y));
		return {pos.x, pos.y, screenpos.w, screenpos.h};
		//return {pos.x, pos.y, screenpos.w / zoom.x, screenpos.h / zoom.y};
	}
}