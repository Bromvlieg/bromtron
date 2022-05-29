#include <bt/world/world.h>
#include <bt/app/engine.h>
#include <bt/misc/texttable.h>

using namespace mainframe::math;
using namespace mainframe::render;

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

	void World::syncPlayers(const std::map<std::string, ApiPlayer> playerlst) {
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
		size_t planets = 0;
		float total = 0;
		std::string name;
	};


	void World::loadGame(const ApiLobby& lobby) {
		auto& game = BromTron::getGame();
		icons.setStyle(game.config.ui.iconSheetSize, mainframe::render::Colors::White, game.stencil);
		iconsShadows.setStyle(game.config.ui.iconSheetSize, mainframe::render::Colors::Black, game.stencil);

		apiCallLoadGame = game.api.getMap(lobby.id, [this, lobby](ApiMap map, const std::string& errMsg) {
			BromTron::getGame().scene->invoke([this, map, errMsg, lobby]() {
				config = lobby.conf;

				syncPlayers(map.players);
				syncStars(map.stars);
				syncCarriers(map.carriers);

				std::vector<calcScore> scores;

				float maxTech = 0;
				float maxEco = 0;
				float maxPower = 0;
				float maxPlanets = 0;

				for (auto& p : map.players) {
					auto& ply = p.second;

					size_t techscore = 0;
					techscore += ply.tech * 3;
					techscore += ply.research.banking.level * 1;
					techscore += ply.research.experimentation.level * 1;
					techscore += ply.research.manufacturing.level * 2;
					techscore += ply.research.range.level * 1;
					techscore += ply.research.scanning.level * 1;
					techscore += ply.research.terraforming.level * 2;
					techscore += ply.research.weapons.level * 2;

					size_t powerscore = 0;
					powerscore += static_cast<size_t>(static_cast<float>(ply.totalShips) * static_cast<float>(ply.research.weapons.level) * 0.25f);
					powerscore += static_cast<size_t>(static_cast<float>(ply.industry) * (static_cast<float>(ply.research.terraforming.level) / 3.0f));


					size_t ecoscore = 0;
					ecoscore += static_cast<size_t>(static_cast<float>(ply.economy) + (static_cast<float>(ply.research.banking.level) / 4.00f));

					if (static_cast<float>(ecoscore) > maxEco) maxEco = static_cast<float>(ecoscore);
					if (static_cast<float>(techscore) > maxTech) maxTech = static_cast<float>(techscore);
					if (static_cast<float>(powerscore) > maxPower) maxPower = static_cast<float>(powerscore);
					if (static_cast<float>(ply.totalStars) > maxPlanets) maxPlanets = static_cast<float>(ply.totalStars);

					scores.push_back({
						techscore,
						powerscore,
						ecoscore,
						ply.totalStars,
						0.0f,
						ply.name
					});

					printf("ply '%s', uid %lld, hud %lld, skipped turns %lld \n", ply.name.c_str(), ply.uid, ply.huid, ply.turnsMissed);
				}

				for (auto& s : scores) {
					s.total = static_cast<float>(s.tech) / maxTech +
						static_cast<float>(s.eco) / maxEco +
						static_cast<float>(s.power) / maxPower +
						static_cast<float>(s.planets) / maxPlanets;
				}


				TextTable tableAll('-', '|', '+');
				tableAll.setAlignment(2, TextTable::Alignment::RIGHT);
				tableAll.add("");
				tableAll.add("technology ranking");
				tableAll.add("");
				tableAll.add("");
				tableAll.add("");
				tableAll.add("economy ranking");
				tableAll.add("");
				tableAll.add("");
				tableAll.add("");
				tableAll.add("military ranking");
				tableAll.add("");
				tableAll.endOfRow();

				tableAll.add("nr");
				tableAll.add("name");
				tableAll.add("score");
				tableAll.add("");
				tableAll.add("nr");
				tableAll.add("name");
				tableAll.add("score");
				tableAll.add("");
				tableAll.add("nr");
				tableAll.add("name");
				tableAll.add("score");
				tableAll.endOfRow();

				TextTable tableTotal('-', '|', '+');
				tableTotal.setAlignment(2, TextTable::Alignment::RIGHT);
				tableTotal.add("total score ranking");
				tableTotal.add("name");
				tableTotal.add("combined");
				tableTotal.add("eco");
				tableTotal.add("tech");
				tableTotal.add("power");
				tableTotal.add("planets");
				tableTotal.endOfRow();

				auto scoresTech = scores;
				auto scoresEco = scores;
				auto scoresPwr = scores;
				std::sort(scoresTech.begin(), scoresTech.end(), [&](const auto& left, const auto& right) { return left.tech > right.tech; });
				std::sort(scoresEco.begin(), scoresEco.end(), [&](const auto& left, const auto& right) { return left.eco > right.eco; });
				std::sort(scoresPwr.begin(), scoresPwr.end(), [&](const auto& left, const auto& right) { return left.power > right.power; });

				for (size_t i = 0; i < scores.size(); i++) {
					auto& st = scoresTech[i];
					auto& se = scoresEco[i];
					auto& sp = scoresPwr[i];

					tableAll.add(std::to_string(i + 1));
					tableAll.add(st.name.c_str());
					tableAll.add(std::to_string(st.tech));

					tableAll.add("---");
					tableAll.add(std::to_string(i + 1));
					tableAll.add(se.name.c_str());
					tableAll.add(std::to_string(se.eco));

					tableAll.add("---");
					tableAll.add(std::to_string(i + 1));
					tableAll.add(sp.name.c_str());
					tableAll.add(std::to_string(sp.power));

					tableAll.endOfRow();
				}

				std::sort(scores.begin(), scores.end(), [&](const auto& left, const auto& right) { return left.total > right.total; });
				for (size_t i = 0; i < scores.size(); i++) {
					auto& s = scores[i];
					tableTotal.add(std::to_string(i));
					tableTotal.add(s.name.c_str());
					tableTotal.add(std::to_string(s.total));
					tableTotal.add(std::to_string(s.eco));
					tableTotal.add(std::to_string(s.tech));
					tableTotal.add(std::to_string(s.power));
					tableTotal.add(std::to_string(s.planets));
					tableTotal.endOfRow();
				}

				printf("\n\nTICK %lld\n", map.tick);
				std::cout << tableAll;
				std::cout << tableTotal;
				printf("\ndone loading\n");
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

		auto& game = BromTron::getGame();
		
		mainframe::math::Vector2 up = game.camera.worldToScreen({ 0, -10 }).clampVec({}, stencil.getWindowSize());
		mainframe::math::Vector2 left = game.camera.worldToScreen({-10, 0}).clampVec({}, stencil.getWindowSize());

		auto& conf = game.config.ui;
		auto width = 3.0f;
		stencil.drawBox({up.x, 0}, Vector2(width, stencil.getWindowSize().y), Colors::DarkGray);
		stencil.drawBox({0, left.y}, Vector2(stencil.getWindowSize().x, width), Colors::DarkGray);

		for (auto& obj : tmpStars) obj->draw(stencil);
		for (auto& obj : tmpCarriers) obj->draw(stencil);

		for (auto& obj : tmpStars) obj->drawOwnership(stencil);
		for (auto& obj : tmpCarriers) obj->drawOwnership(stencil);
	}
}