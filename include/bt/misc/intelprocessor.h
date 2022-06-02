#pragma once

#include <bt/api/class/intel.h>
#include <bt/api/class/map.h>

namespace bt {
	class IntelProcessor {
	public:
		static void processTick(ApiMap& map, ApiIntelStats& stats);
		static void process(ApiMap& map, ApiIntel& intel);
		static void compareTick(ApiMap& map, ApiIntelStats& statsA, ApiIntelStats& statsB);
	};
}
