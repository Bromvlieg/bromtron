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

	void Graph::refresh() {
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

		switch (style) {
			case GraphStyle::wave: preRenderWave(); break;
			case GraphStyle::line: preRenderLine(); break;
		}
	}

	void Graph::refreshMouse(int x) {
		switch (style) {
			case GraphStyle::wave: preRenderMouseWave(x); break;
			case GraphStyle::line: preRenderMouseLine(x); break;
		}
	}

	void Graph::draw(Stencil& stencil) {
		auto& size = getSize();
		if (dirty) refresh();

		auto& window = *BromTron::getGame().window;
		auto mpos = window.getMousePos();
		auto wsize = window.getSize();
		AABBi gbb = { getPosAbsolute(), size };
		if (gbb.contains(mpos)/* && window.getFocus()*/) {
			if (oldMousePos != mpos) {
				refreshMouse(mpos.x - gbb.pos.x);
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
