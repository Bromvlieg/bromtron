#define NOMINMAX

#include <bt/world/world.h>
#include <bt/app/engine.h>
#include <bt/misc/texttable.h>
#include <bt/misc/intelprocessor.h>
#include <fmt/printf.h>
#include <algorithm>
#include <filesystem>
#include <fmt/format.h>
#include <iostream>
#include <fstream>
#include <bt/ui/menu/scoreboard/scoreboard.h>

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

	std::vector<std::shared_ptr<Player>> World::getPlayers() {
		const std::lock_guard<std::mutex> lockguard(lock); 
		return players;
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

	void World::loadGame(const ApiLobby& lobby) {
		auto& game = BromTron::getGame();
		icons.setStyle(game.config.ui.iconSheetSize, mainframe::render::Colors::White, game.stencil);
		iconsShadows.setStyle(game.config.ui.iconSheetSize, mainframe::render::Colors::Black, game.stencil);

		apiCallLoadGame = game.api.getMap(lobby.id, [&game, this, lobby](ApiMap map, const std::string& errMsg) {
			BromTron::getGame().scene->invoke([this, &game, map, errMsg, lobby]() {
				config = lobby.conf;
				currentMap = map;

				syncPlayers(map.players);
				syncStars(map.stars);
				syncCarriers(map.carriers);

				for (auto& p : map.players) {
					auto& ply = p.second;
					printf("ply '%s', uid %lld, hud %lld, skipped turns %lld \n", ply.name.c_str(), ply.uid, ply.huid, ply.turnsMissed);
				}

				apiCallIntel = game.api.getIntel(lobby.id, [this, &game, map, lobby](ApiIntel intel, const std::string& errMsg) {
					IntelProcessor::process(map, intel);

					BromTron::getGame().scene->invoke([this, &game, map, errMsg, lobby]() {
						auto scoreboard = BromTron::getGame().scene->createChild<MenuScoreboard>();
						scoreboard->init();
						scoreboard->setSize({ 1920, 1080 });
						scoreboard->recreateElements();
						scoreboard->loadIntel(map.id);
						scoreboard->show();
					});
				});
			});
		});
	}
}
