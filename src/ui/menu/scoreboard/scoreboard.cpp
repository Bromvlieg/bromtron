#include <bt/ui/menu/scoreboard/scoreboard.h>
#include <bt/ui/menu/common/option.h>
#include <bt/misc/content.h>
#include <bt/misc/fontawesome.h>

#include <bt/app/engine.h>
#include <bt/ui/elm/button.h>

#include <mainframe/ui/elms/panel.h>
#include <mainframe/ui/elms/label.h>
#include <mainframe/ui/elms/frame.h>
#include <mainframe/ui/elms/image.h>
#include <mainframe/ui/elms/textbox.h>

#include <bt/misc/translate.h>
#include <bt/misc/intelprocessor.h>

#include <filesystem>

using namespace mainframe::ui;
using namespace mainframe::math;
using namespace mainframe::render;

namespace bt {
	void MenuScoreboard::init() {
		font = Content::getFont("text", 16);
		textSize = font->getStringSize(text);
	}

	std::string read_file(std::string_view path) {
		constexpr auto read_size = std::size_t(4096);
		auto stream = std::ifstream(path.data());
		stream.exceptions(std::ios_base::badbit);

		auto out = std::string();
		auto buf = std::string(read_size, '\0');
		while (stream.read(&buf[0], read_size)) {
			out.append(buf, 0, stream.gcount());
		}
		out.append(buf, 0, stream.gcount());
		return out;
	}

	void MenuScoreboard::loadIntel(std::string mapId) {
		for (auto const& dir_entry : std::filesystem::directory_iterator{ fmt::format("saves/{}/intel", mapId) }) {
			auto contents = read_file(dir_entry.path().string());
			nlohmann::json ret = nlohmann::json::parse(contents);
			ApiIntel intel = ret;

			for (auto& entry : intel.stats) {
				auto iter = std::find_if(mapping.begin(), mapping.end(), [&](const auto& x) { return x.tick == entry.tick; });
				if (iter != mapping.end()) continue;

				mapping.push_back(entry);
			}

			fmt::print("loaded intel entry: {}\n", dir_entry.path().string());
		}

		std::sort(mapping.begin(), mapping.end(), [&](const auto& left, const auto& right) { return left.tick < right.tick; });

		refreshValues();
	}

	void MenuScoreboard::refreshValues() {
		if (mapping.empty()) return;

		auto& map = BromTron::getWorld().currentMap;

		std::vector<GraphDataset> datasets;
		for (auto& rply : mapping.front().players) {
			auto ply = BromTron::getGame().world.getPlayer(rply.uid);
			if (disabled.find(ply->uid) != disabled.end() && !disabled[ply->uid]) continue;

			datasets.push_back({ ply->name, {}, ply->color});
		}

		std::vector<std::string> labels;
		for (size_t entryIndex = 0; entryIndex < mapping.size(); entryIndex++) {
			auto& entry = mapping[entryIndex];
			labels.push_back(std::to_string(entry.tick));

			auto scores = IntelProcessor::processTick(entry);
			std::sort(scores.begin(), scores.end(), [&](const auto& left, const auto& right) { return left.plyId < right.plyId; });

			if (catType == ScoreboardCategory::losses && entryIndex > 0) {
				auto diffs = IntelProcessor::compareTick(map, mapping[entryIndex - 1], entry);
				std::sort(diffs.begin(), diffs.end(), [&](const auto& left, const auto& right) { return left.prev.uid < right.prev.uid; });

				for (size_t diffIndex = 0; diffIndex < diffs.size(); diffIndex++) {
					if (diffs[diffIndex].shipsDiff > 0) continue;
					scores[diffIndex].shipsLost = diffs[diffIndex].shipsDiff;
				}

				uiGraph->setSmooth(false);
			} else {
				uiGraph->setSmooth(true);
			}

			int iDisabledOffset = 0;
			for (size_t i = 0; i < scores.size(); i++) {
				auto& s = scores[i];
				if (disabled.find(s.plyId) != disabled.end() && !disabled[s.plyId]) {
					iDisabledOffset++;
					continue;
				}

				float val = 0;
				switch (catType) {
					case ScoreboardCategory::total: val = s.total; break;
					case ScoreboardCategory::eco: val = s.eco; break;
					case ScoreboardCategory::tech: val = s.tech; break;
					case ScoreboardCategory::power: val = s.power; break;
					case ScoreboardCategory::planets: val = s.planets; break;
					case ScoreboardCategory::losses: val = s.shipsLost; break;
					case ScoreboardCategory::produced: val = s.shipProduction; break;
				}

				datasets[i - iDisabledOffset].values.push_back(val);
			}
		}

		uiGraph->clearDatasets();
		uiGraph->setLabels(labels);
		for (auto& ds : datasets) uiGraph->addDataset(ds);
		uiGraph->refresh();
	}

	void MenuScoreboard::recreateElements() {
		this->clearChildren();

		auto& oursize = getSize();

		int selectorHight = 100;
		int playersWidth = 300;
		int spacer = 0;
		Vector2i graphSize = {
			oursize.x - playersWidth - spacer,
			oursize.y - selectorHight - spacer
		};

		uiGraph = createChild<Graph>();
		uiGraph->setPos({});
		uiGraph->setSize(graphSize);

		uiTimeSelector = createChild<TimeSelector>();
		uiTimeSelector->setPos({ 0, graphSize.y + spacer });
		uiTimeSelector->setSize({ graphSize.x, selectorHight });

		uiPlayers = createChild<PlayerList>();
		uiPlayers->setPos({ graphSize.x + spacer, 0 });
		uiPlayers->setSize({ playersWidth, graphSize.y + selectorHight + spacer });
		uiPlayers->recreateElements();

		uiPlayers->onTypeChange += [&](ScoreboardCategory type) {
			catType = type;
			refreshValues();
		};

		uiPlayers->onPlayerToggle += [&](size_t id, bool enabled) {
			disabled[id] = !enabled;
			refreshValues();
		};

		applyTheme();
	}

	void MenuScoreboard::draw(mainframe::render::Stencil& stencil) {
		auto& size = getSize();

		stencil.drawBoxOutlined(0, size, 1, Colors::Black);
		stencil.drawBox(1, size - 2, Color(0, 0, 0, 217));
	}
}
