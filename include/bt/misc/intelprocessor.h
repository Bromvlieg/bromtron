#pragma once

#include <bt/api/class/intel.h>
#include <bt/api/class/map.h>

namespace bt {
	struct calcScore {
		float tech = 0;
		float power = 0;
		float eco = 0;
		float planets = 0;
		float total = 0;
		float shipsLost = 0;
		float shipProduction = 0;
		std::string name;
		size_t plyId;
	};

	struct PlayerDiff {
		ApiIntelPlayer prev;
		ApiIntelPlayer next;
		std::vector<size_t> maybeWar;
		int shipsDiff = 0;
	};

	class IntelProcessor {
	public:
		static std::vector<calcScore> processTick(ApiIntelStats& stats);
		static void process(const ApiMap& map, ApiIntel& intel);
		static std::vector<PlayerDiff> compareTick(const ApiMap& map, ApiIntelStats& statsA, ApiIntelStats& statsB, bool printInfo = false);
		static void printScores(std::vector<calcScore> scores);
	};
}
