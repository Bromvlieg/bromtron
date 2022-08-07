#define NOMINMAX

#include <bt/misc/intelprocessor.h>
#include <bt/misc/texttable.h>
#include <bt/app/engine.h>
#include <fmt/printf.h>
#include <algorithm>
#include <filesystem>
#include <fmt/format.h>
#include <iostream>
#include <fstream>

using namespace mainframe::math;
using namespace mainframe::render;

namespace bt {

	int attackTillLost(const ApiIntelPlayer& attacker, const ApiIntelPlayer& defender, int ships) {
		auto awt = attacker.weapons;
		auto dwt = defender.weapons + 1;

		auto ds = 0;
		auto as = ships;

		while (as > 0) {
			as -= dwt;
			if (as <= dwt) {
				return ds;
			}

			ds += awt;
		}
	}

	int defendTillLost(const ApiIntelPlayer& attacker, const ApiIntelPlayer& defender, int ships) {
		auto awt = attacker.weapons;
		auto dwt = defender.weapons + 1;

		auto ds = ships;
		auto as = 0;

		while (as > 0) {
			as += dwt;

			if (ds <= awt) return as;
			ds -= awt;
		}
	}

	std::vector<int> sumUpRecursive(const std::vector<int>& numbers, int target, const std::vector<int>& partial, int margin) {
		int s = 0;
		std::string joined;
		for (auto x : partial) {
			s += x;
			joined += fmt::format("{}{} ", joined.empty() ? "" : ",", x);
		}

		if (std::fabs(s - target) <= margin) {
			//fmt::print("sum({}) == {}\n", joined, target);
			return partial;
		}

		if (s >= target)
			return {};

		for (size_t i = 0; i < numbers.size(); i++) {
			std::vector<int> remaining;
			auto n = numbers[i];
			for (size_t j = i + 1; j < numbers.size(); j++) remaining.push_back(numbers[j]);

			std::vector<int> partial_rec;
			partial_rec.push_back(n);

			auto ret = sumUpRecursive(remaining, target, partial_rec, margin);
			if (!ret.empty()) return ret;
		}

		return {};
	}

	std::vector<int> sumUp(const std::vector<int>& numbers, int target, int margin) {
		return sumUpRecursive(numbers, target, {}, margin);
	}

	void IntelProcessor::process(const ApiMap& map, ApiIntel& intel) {
		if (intel.stats.size() < 2) return;

		auto latestTick = intel.stats[0];
		auto scores = processTick(latestTick);
		//compareTick(map, latestTick, intel.stats[1]);


		printf("\n\nTICK %lld\n", latestTick.tick);
		printScores(scores);
		printf("\ndone loading\n");
	}

	std::vector<calcScore> IntelProcessor::processTick(ApiIntelStats& stats) {
		std::vector<calcScore> scores;

		float maxTech = 0;
		float maxEco = 0;
		float maxPower = 0;
		float maxPlanets = 0;

		auto& game = BromTron::getGame();
		for (auto& ply : stats.players) {
			float techscore = 0;
			techscore += ply.totalScience * 3;
			techscore += ply.banking * 1;
			techscore += ply.experimentation * 1;
			techscore += ply.manufacturing * 2;
			techscore += ply.hyperspace * 1;
			techscore += ply.scanning * 1;
			techscore += ply.terraforming * 2;
			techscore += ply.weapons * 2;

			float powerscore = 0;
			powerscore += static_cast<float>(ply.totalShips) * static_cast<float>(ply.weapons) * 0.10f;
			powerscore += static_cast<float>(ply.totalIndustry) * (static_cast<float>(ply.manufacturing) * 0.10f);

			float ecoscore = 0;
			ecoscore += static_cast<float>(ply.totalEconomy) + (static_cast<float>(ply.banking) / 4.00f);
			ecoscore += static_cast<float>(ply.terraforming) * (static_cast<float>(ply.totalStars) * 1.5f);

			// GG
			if (ply.totalStars == 0) {
				ecoscore = 0;
				techscore = 0;
				powerscore = 0;
			}

			if (ecoscore > maxEco) maxEco = ecoscore;
			if (techscore > maxTech) maxTech = techscore;
			if (powerscore > maxPower) maxPower = powerscore;
			if (static_cast<float>(ply.totalStars) > maxPlanets) maxPlanets = static_cast<float>(ply.totalStars);

			auto gamePly = game.world.getPlayer(ply.uid);

			scores.push_back({
				techscore,
				powerscore,
				ecoscore,
				static_cast<float>(ply.totalStars),
				0,
				0,
				game.world.currentMap.getTotalShipsPerTick(ply),
				gamePly->name,
				gamePly->uid
			});
		}

		for (auto& s : scores) {
			s.total = (
					s.tech / maxTech +
					s.eco / maxEco +
					s.power / maxPower
				) * s.planets / maxPlanets;
		}

		return scores;
	}

	void IntelProcessor::printScores(std::vector<calcScore> scores) {
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

		std::cout << tableAll;
		std::cout << tableTotal;
	}

	std::vector<PlayerDiff> IntelProcessor::compareTick(const ApiMap& map, ApiIntelStats& statsA, ApiIntelStats& statsB, bool printInfo) {
		auto& game = BromTron::getGame();

		TextTable tableWar('-', '|', '+');
		if (printInfo) {
			tableWar.setAlignment(2, TextTable::Alignment::RIGHT);
			tableWar.add("name");
			tableWar.add("war");
			tableWar.add("ship counter");
			tableWar.add("total ships");
			tableWar.add("tech+");
			tableWar.endOfRow();
		}

		std::vector<PlayerDiff> diffs;
		for (size_t i = 0; i < statsB.players.size(); i++) {
			auto& plyNow = statsA.players[i];
			auto& plyPrev = statsB.players[i];

			PlayerDiff diff;
			diff.next = plyNow;
			diff.prev = plyPrev;

			auto shipsBuild = static_cast<int>(map.getTotalShipsPerTick(plyNow) * (static_cast<float>(statsA.tick) - static_cast<float>(statsB.tick)));
			auto estimatedShips = plyPrev.totalShips + shipsBuild;
			diff.shipsDiff = estimatedShips - plyNow.totalShips;

			if (printInfo) {
				auto plyNowGame = game.world.getPlayer(plyNow.uid);
				tableWar.add(plyNowGame->name);
				tableWar.add(diff.shipsDiff > 0 ? "YES" : "no");
				tableWar.add(diff.shipsDiff != 0 ? std::to_string(diff.shipsDiff * -1) : std::string());
				tableWar.add(std::to_string(plyNow.totalShips));
				tableWar.add(plyNow.manufacturing > plyPrev.manufacturing > 0 ? "YES" : "no");
				tableWar.endOfRow();
			}

			diffs.push_back(diff);
		}

		std::sort(diffs.begin(), diffs.end(), [&](const auto& left, const auto& right) { return left.shipsDiff < right.shipsDiff; });

		if (printInfo) {
			std::cout << tableWar;
		}

		TextTable tableFighting('-', '|', '+');
		if (printInfo) {
			tableFighting.add("attacker");
			tableFighting.add("fleet");
			tableFighting.add("defender");
			tableFighting.endOfRow();
		}

		// exact matches
		/*
		std::vector<PlayerDiff*> exactMatches;
		for (auto& diff1 : diffs) {
			auto& ourPly = diff1.next;
			if (diff1.shipsDiff <= 0) continue;

			int matches = 0;
			for (auto& diff2 : diffs) {
				auto& theirPly = diff2.next;
				if (theirPly.uid == ourPly.uid) continue;
				if (diff2.shipsDiff <= 0) continue;

				// skip if we're already detected we're being attacked
				if (std::find(diff1.maybeWar.begin(), diff1.maybeWar.end(), theirPly.uid) != diff1.maybeWar.end()) continue;

				// check we can map it to an attack
				auto shipsDestroyed = attackTillLost(ourPly, theirPly, diff1.shipsDiff); // did we attack them

				if (std::fabs(shipsDestroyed - diff2.shipsDiff) <= 1) {
					if (printInfo) {
						tableFighting.add(ourPly.name + (matches > 0 ? "^?^" : ""));
						tableFighting.add(std::to_string(diff1.shipsDiff));
						tableFighting.add(theirPly.name);
						tableFighting.endOfRow();
					}

					diff1.maybeWar.push_back(theirPly.uid);
					exactMatches.push_back(&diff2);
					matches++;
				}
			}

			if (matches == 0) continue;
			diff1.shipsDiff = 0;
		}
		for (auto& match : exactMatches) match->shipsDiff = 0;
		*/

		// multiple vs 1 person
		bool foundThing = true;
		while (foundThing) {
			foundThing = false;

			for (auto& diff1 : diffs) {
				auto& ourPly = diff1.next;
				if (diff1.shipsDiff <= 0) continue;

				std::vector<int> ships;
				int margin = 0;
				std::vector<PlayerDiff*> diffsPushed;
				for (auto& diff2 : diffs) {
					auto& theirPly = diff2.next;
					if (theirPly.uid == ourPly.uid) continue;
					if (diff2.shipsDiff <= 0) continue;

					// skip if we're already detected we're being attacked
					if (std::find(diff2.maybeWar.begin(), diff2.maybeWar.end(), ourPly.uid) != diff2.maybeWar.end()) continue;

					// did they attack us
					auto shipsDestroyed1 = attackTillLost(theirPly, ourPly, diff2.shipsDiff);
					auto shipsDestroyed2 = defendTillLost(theirPly, ourPly, diff2.shipsDiff);

					if (shipsDestroyed1 > 0) {
						ships.push_back(shipsDestroyed1);
						diffsPushed.push_back(&diff2);
					}

					if (shipsDestroyed2 > 0) {
						ships.push_back(shipsDestroyed2);
						diffsPushed.push_back(&diff2);
					}

					if (ourPly.weapons > margin) margin = ourPly.weapons;
					if (theirPly.weapons > margin) margin = theirPly.weapons;
				}

				auto sumUpResult = sumUp(ships, diff1.shipsDiff, 1);
				if (sumUpResult.empty()) continue;

				for (auto val : sumUpResult) {
					auto itr = std::find(ships.begin(), ships.end(), val);
					if (itr == ships.end()) continue;

					size_t index = std::distance(ships.begin(), itr);
					auto& diff2 = *diffsPushed[index];

					if (printInfo) {
						auto plyDiff2Game = game.world.getPlayer(diff2.next.uid);
						auto ourPlyGame = game.world.getPlayer(ourPly.uid);

						tableFighting.add(plyDiff2Game->name);
						tableFighting.add(std::to_string(*itr));
						tableFighting.add(ourPlyGame->name);
						tableFighting.endOfRow();
					}

					diff2.shipsDiff -= *itr;
					diff2.maybeWar.push_back(ourPly.uid);

					*itr = 0;
				}

				diff1.shipsDiff = 0;
				foundThing = true;
			}
		}

		if (printInfo) {
			for (auto& diff : diffs) {
				if (diff.shipsDiff <= 0) continue;

				auto ourPlyGame = game.world.getPlayer(diff.next.uid);

				tableFighting.add("");
				tableFighting.add(std::to_string(diff.shipsDiff));
				tableFighting.add(ourPlyGame->name);
				tableFighting.endOfRow();

				//diff.shipsDiff = 0;
			}

			std::cout << tableFighting;
		}
		return diffs;
	}
}
