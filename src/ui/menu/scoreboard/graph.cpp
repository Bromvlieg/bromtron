#include <bt/ui/menu/scoreboard/graph.h>

#include <bt/misc/content.h>
#include <bt/misc/fontawesome.h>

#include <bt/app/engine.h>
#include <bt/misc/translate.h>

using namespace mainframe::ui;
using namespace mainframe::math;
using namespace mainframe::render;

namespace bt {
	Graph::Graph() {
		font = Content::getFont("text", 16);
	}

	void Graph::setLabels(const std::vector<std::string>& xLabels) {
		labels = xLabels;
		dirty = true;
	}

	void Graph::setSmooth(bool smoothMode) {
		smooth = smoothMode;
	}

	void Graph::clearDatasets() {
		datasets.clear();
	}

	void Graph::addDataset(const GraphDataset& set) {
		datasets.push_back(set);

		totalValueEntries = set.values.size();
		dirty = true;
	}

	void Graph::preRender() {
		dirty = false;

		auto& size = getSize();
		auto& game = BromTron::getGame();
		auto& stencil = game.stencil;

		std::vector<float> values; // list to keep track of current "smooth" score

		cols.clear();
		names.clear();
		verticeYMap.clear();
		verticeYMapTotal.clear();

		values.resize(datasets.size());
		cols.resize(datasets.size());
		names.resize(datasets.size());
		verticeYMap.resize(datasets.size());
		verticeYMapTotal.resize(size.x);

		// sort datasets depending on highest end score
		// before we fill in our render data
		std::sort(datasets.begin(), datasets.end(), [&](const auto& left, const auto& right) {
			auto l = left.values.back();
			auto r = right.values.back();
			if (l != 0 || r != 0) return left.values.back() > right.values.back();

			// figure out went to 0 first
			auto lf = 0;
			auto rf = 0;
			for (int i = static_cast<int>(left.values.size()) - 1; i >= 0 && (lf == 0 || rf == 0); i--) {
				if (lf == 0 && left.values[i] != 0) lf = i;
				if (rf == 0 && right.values[i] != 0) rf = i;

			}
			return lf > rf;
		});

		// init values
		for (size_t i = 0; i < values.size(); i++) {
			auto& ds = datasets[i];

			names[i] = ds.name;
			cols[i] = ds.color;
			values[i] = ds.values.front();
			verticeYMap[i].push_back(values[i]);
		}

		// progessivly scale the wave
		auto xOffsetPerValue = static_cast<float>(totalValueEntries - 1) / static_cast<float>(size.x);
		for (size_t scoreIndex = 0; scoreIndex < values.size(); scoreIndex++) {
			auto& set = datasets[scoreIndex];

			for (int x = 0; x < size.x; x++) {
				auto datasetValueIndex = static_cast<size_t>(xOffsetPerValue * x);
				float result = 0;
				if (smooth) {
					float delta = (xOffsetPerValue * x) - static_cast<float>(datasetValueIndex);

					auto target = set.values[datasetValueIndex];
					auto targetNext = set.values[datasetValueIndex + 1];
					auto lerped = target + (targetNext - target) * delta;

					result = lerped;
				} else {
					result = set.values[datasetValueIndex];
				}

				verticeYMap[scoreIndex].push_back(result);
				verticeYMapTotal[x] += result;
			}
		}

		// draw the vertices
		auto sizef = size.cast<float>();
		stencil.recordStart(true);
		stencil.pushClipping({0, 0, sizef.x - 2, sizef.y - 2});
		for (int x = 0; x < size.x - 1; x++) {
			float curYL = 0;
			float remainer = 0;
			for (size_t scoreIndex = 0; scoreIndex < verticeYMap.size(); scoreIndex++) {
				auto& map = verticeYMap[scoreIndex];
				auto valueCurrent = map[x] / verticeYMapTotal[x];
				auto lt = valueCurrent * sizef.y;
				if (lt < 1) {
					remainer += lt;
					continue;
				}

				lt += remainer;
				remainer = 0;

				// make sure last entry fills all
				if (scoreIndex == verticeYMap.size() - 1) {
					lt = sizef.y - curYL;
				}

				stencil.drawBox(
					{ x, curYL },
					{ 1, lt },
					cols[scoreIndex]
				);
				curYL += lt;
			}
		}

		// dataset names
		float curYL = 0;
		for (size_t scoreIndex = 0; scoreIndex < verticeYMap.size(); scoreIndex++) {
			auto& map = verticeYMap[scoreIndex];
			auto valueCurrent = map.front() / verticeYMapTotal.front();
			auto lt = valueCurrent * sizef.y;
			auto& col = cols[scoreIndex];

			if (lt < static_cast<float>(font->size)) break;

			float x = 10;
			stencil.drawText(*font, names[scoreIndex], Vector2{ x, curYL + lt / 2 } - offset, Colors::Black, Stencil::TextAlignment::Left, Stencil::TextAlignment::Center);
			stencil.drawText(*font, names[scoreIndex], Vector2{ x, curYL + lt / 2 } + offset, Colors::Black, Stencil::TextAlignment::Left, Stencil::TextAlignment::Center);
			stencil.drawText(*font, names[scoreIndex], Vector2{ x, curYL + lt / 2 } + offset1, Colors::Black, Stencil::TextAlignment::Left, Stencil::TextAlignment::Center);
			stencil.drawText(*font, names[scoreIndex], Vector2{ x, curYL + lt / 2 } + offset2, Colors::Black, Stencil::TextAlignment::Left, Stencil::TextAlignment::Center);
			stencil.drawText(*font, names[scoreIndex], { x, curYL + lt / 2 }, textCol, Stencil::TextAlignment::Left, Stencil::TextAlignment::Center);

			curYL += lt;
		}

		// dataset end values
		curYL = 0;
		for (size_t scoreIndex = 0; scoreIndex < verticeYMap.size(); scoreIndex++) {
			auto& map = verticeYMap[scoreIndex];
			auto valueCurrent = map.back() / verticeYMapTotal.back();
			auto lt = valueCurrent * sizef.y;
			auto& col = cols[scoreIndex];

			if (lt < static_cast<float>(font->size)) break;

			std::string scoreText = std::to_string(static_cast<int>(std::round(valueCurrent * 100))) + "%";
			float x = sizef.x - 10;
			stencil.drawText(*font, scoreText, Vector2{ x, curYL + lt / 2 } - offset, Colors::Black, Stencil::TextAlignment::Right, Stencil::TextAlignment::Center);
			stencil.drawText(*font, scoreText, Vector2{ x, curYL + lt / 2 } + offset, Colors::Black, Stencil::TextAlignment::Right, Stencil::TextAlignment::Center);
			stencil.drawText(*font, scoreText, Vector2{ x, curYL + lt / 2 } + offset1, Colors::Black, Stencil::TextAlignment::Right, Stencil::TextAlignment::Center);
			stencil.drawText(*font, scoreText, Vector2{ x, curYL + lt / 2 } + offset2, Colors::Black, Stencil::TextAlignment::Right, Stencil::TextAlignment::Center);
			stencil.drawText(*font, scoreText, { x, curYL + lt / 2 }, textCol, Stencil::TextAlignment::Right, Stencil::TextAlignment::Center);

			curYL += lt;
		}

		stencil.popClipping();
		recording = stencil.recordStop();
	}

	void Graph::refresh() {
		preRender();
	}


	void Graph::preRenderMouse(int x) {
		auto& game = BromTron::getGame();
		auto& stencil = game.stencil;
		auto& size = getSize();
		auto sizef = size.cast<float>();

		stencil.recordStart(true);
		stencil.pushClipping({ 0, 0, sizef.x - 2, sizef.y - 2 });

		stencil.drawBox({ x, 0 }, { 2, size.y }, Colors::Black);

		// dataset mouse values
		float curYL = 0;
		for (size_t scoreIndex = 0; scoreIndex < verticeYMap.size(); scoreIndex++) {
			auto& map = verticeYMap[scoreIndex];
			auto valueCurrent = map[x] / verticeYMapTotal[x];
			auto lt = valueCurrent * sizef.y;
			auto& col = cols[scoreIndex];

			if (lt < static_cast<float>(font->size)) break;

			std::string scoreText = std::to_string(static_cast<int>(std::round(valueCurrent * 100))) + "%";
			stencil.drawText(*font, scoreText, Vector2{ x + 5, curYL + lt / 2 } - offset, Colors::Black, Stencil::TextAlignment::Left, Stencil::TextAlignment::Center);
			stencil.drawText(*font, scoreText, Vector2{ x + 5, curYL + lt / 2 } + offset, Colors::Black, Stencil::TextAlignment::Left, Stencil::TextAlignment::Center);
			stencil.drawText(*font, scoreText, Vector2{ x + 5, curYL + lt / 2 } + offset1, Colors::Black, Stencil::TextAlignment::Left, Stencil::TextAlignment::Center);
			stencil.drawText(*font, scoreText, Vector2{ x + 5, curYL + lt / 2 } + offset2, Colors::Black, Stencil::TextAlignment::Left, Stencil::TextAlignment::Center);
			stencil.drawText(*font, scoreText, { x + 5, curYL + lt / 2 }, textCol, Stencil::TextAlignment::Left, Stencil::TextAlignment::Center);

			curYL += lt;
		}

		stencil.popClipping();
		recordingMouse = stencil.recordStop();
	}

	void Graph::draw(Stencil& stencil) {
		auto& size = getSize();
		if (dirty) preRender();

		auto& window = *BromTron::getGame().window;
		auto mpos = window.getMousePos();
		auto wsize = window.getSize();
		AABBi gbb = { getPosAbsolute(), size };
		if (gbb.contains(mpos) && window.getFocus()) {
			if (oldMousePos != mpos) {
				preRenderMouse(mpos.x - gbb.pos.x);
				oldMousePos = mpos;
			}
		}

		BromTron::getGame().window->getMousePos();

		stencil.drawBoxOutlined(0, size, 1, Colors::Black);
		stencil.drawBox(1, size - 2, { 0.1, 0.1, 0.1, 1 });
		stencil.drawRecording(*recording, 1);
		if (gbb.contains(mpos) && recordingMouse != nullptr) stencil.drawRecording(*recordingMouse, 1);
	}
}
