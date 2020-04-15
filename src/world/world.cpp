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

	struct calcScore {
		size_t tech = 0;
		size_t power = 0;
		size_t eco = 0;
		float total = 0;
		std::string name;
	};

	void World::loadGame(const ApiPlayerGame& lobby) {
		auto& api = BromTron::getApi();

		apiCallLoadGame = api.getMap(lobby.id, [this](ApiMap& map, const std::string& errMsg) {
			BromTron::getGame().scene->invoke([this, map, errMsg]() {
				syncPlayers(map.players);
				syncStars(map.stars);
				syncCarriers(map.carriers);

				std::vector<calcScore> scores;

				float maxTech = 0;
				float maxEco = 0;
				float maxPower = 0;

				for (auto& p : map.players) {
					auto& ply = p.second;

					size_t techscore = 0;
					techscore += ply.tech * 5;
					techscore += ply.research.banking.level * 1;
					techscore += ply.research.experimentation.level * 1;
					techscore += ply.research.manufacturing.level * 2;
					techscore += ply.research.range.level * 1;
					techscore += ply.research.scanning.level * 1;
					techscore += ply.research.terraforming.level * 2;
					techscore += ply.research.weapons.level * 2;

					size_t powerscore = 0;
					powerscore += static_cast<size_t>(static_cast<float>(ply.totalShips)* static_cast<float>(ply.research.weapons.level) * 0.25f);
					powerscore += static_cast<size_t>(static_cast<float>(ply.industry)* (static_cast<float>(ply.research.terraforming.level) / 3.0f));


					size_t ecoscore = 0;
					ecoscore += static_cast<size_t>(static_cast<float>(ply.economy)* (static_cast<float>(ply.research.banking.level) / 4.00f));

					if (static_cast<float>(ecoscore) > maxEco) maxEco = static_cast<float>(ecoscore);
					if (static_cast<float>(techscore) > maxTech) maxTech = static_cast<float>(techscore);
					if (static_cast<float>(powerscore) > maxPower) maxPower = static_cast<float>(powerscore);

					scores.push_back({
						techscore,
						powerscore,
						ecoscore,
						0.0f,
						ply.name});

					printf("ply '%s', uid %d, hud %d, \n", ply.name.c_str(), ply.uid, ply.huid);
				}

				for (auto& s : scores) {
					s.total = static_cast<float>(s.tech) / maxTech +
						static_cast<float>(s.eco) / maxEco +
						static_cast<float>(s.power) / maxPower;
				}

				printf("\ntech\n");
				std::sort(scores.begin(), scores.end(), [&](const auto& left, const auto& right) {
					return left.tech > right.tech;
				});

				for (auto& s : scores) {
					printf("ply '%s' with %d\n", s.name.c_str(), s.tech);
				}


				printf("\neconomy\n");
				std::sort(scores.begin(), scores.end(), [&](const auto& left, const auto& right) {
					return left.eco > right.eco;
				});
				for (auto& s : scores) {
					printf("ply '%s' with %d\n", s.name.c_str(), s.eco);
				}

				printf("\npower\n");
				std::sort(scores.begin(), scores.end(), [&](const auto& left, const auto& right) {
					return left.power > right.power;
				});

				for (auto& s : scores) {
					printf("ply '%s' with %d\n", s.name.c_str(), s.power);
				}

				printf("\ntotal\n");
				std::sort(scores.begin(), scores.end(), [&](const auto& left, const auto& right) {
					return left.total > right.total;
				});

				for (auto& s : scores) {
					printf("ply '%s' with %f\n", s.name.c_str(), s.total);
				}


				printf("done loading :)\n");
			});
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
}