#pragma once

#include <mainframe/utils/string.h>

#include <string>
#include <map>
#include <nlohmann/json.hpp>
#include <fmt/format.h>

namespace bt {
	class Translate {
		static nlohmann::json mapping;

	public:
		template <typename... Args>
		static std::string key(const std::string& key, Args&&... args) {
			auto parts = mainframe::utils::string::split(key, ".");

			nlohmann::json* cur = &mapping;
			for (auto& part : parts) {
				if (!cur->is_object())
					return key;

				auto iter = cur->find(part);
				if (iter == cur->end() || iter->is_null()) return key;

				cur = &*iter;
			}

			if (!cur->is_string())
				return key;

			return fmt::format(cur->get<std::string>(), std::move(args)...);
		}

		static std::string currency(int64_t value) {
			static const char currencySymbol = '€';
			static const char currencySymbolDecimals = ',';
			static const char currencySymbolThousands = '.';

			int64_t euros = value;
			int64_t cents = value % 100;
			euros -= cents;
			euros /= 100;

			std::string negative = euros < 0 || cents < 0 ? "-" : "";
			if (euros < 0) euros *= -1;
			if (cents < 0) cents *= -1;

			return fmt::format("{}{}{}{: >2}", negative, euros, currencySymbolDecimals, cents);
		}

		static void load(const std::string& file);
	};
}