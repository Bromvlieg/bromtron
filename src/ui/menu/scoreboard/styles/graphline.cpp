#include <bt/ui/menu/scoreboard/graph.h>

#include <bt/misc/content.h>
#include <bt/misc/fontawesome.h>

#include <bt/app/engine.h>
#include <bt/misc/translate.h>

using namespace mainframe::ui;
using namespace mainframe::math;
using namespace mainframe::render;

namespace bt {
	void Graph::preRenderLine() {
		dirty = false;

		auto& game = BromTron::getGame();
		auto& stencil = game.stencil;

		auto& size = getSize();
		auto sizef = size.cast<float>();

		cols.clear();
		names.clear();
		verticeYMap.clear();
		verticeYMapTotal.clear();

		// figure out highest number
		float maxValue = 0;
		for (auto& dataset : datasets) {
			for (auto value : dataset.values) {
				if (value > maxValue) {
					maxValue = value;
				}
			}
		}

		// draw lines
		stencil.recordStart(true);
		stencil.pushClipping({ 0, 0, sizef.x - 2, sizef.y - 2 });
		int bottom = size.y;
		auto xOffsetPerValue = static_cast<float>(size.x) / static_cast<float>(totalValueEntries - 1);
		for (auto& dataset : datasets) {
			float curX = 0;

			for (size_t i = 0; i + 1 < dataset.values.size(); i++) {
				auto& current = dataset.values[i];
				auto& next = dataset.values[i + 1];

				float currentScaled = current / maxValue * static_cast<float>(size.y);
				float nextScaled = next / maxValue * static_cast<float>(size.y);

				stencil.drawLine(
					{ static_cast<int>(curX), bottom - static_cast<int>(currentScaled) },
					{ static_cast<int>(curX) + xOffsetPerValue, bottom - static_cast<int>(nextScaled) },
					1,
					dataset.color
				);

				curX += xOffsetPerValue;
			}
		}

		stencil.popClipping();
		recording = stencil.recordStop();
	}

	struct GraphLineYText {
		std::string name;
		float value = 0;
		std::string text;
	};

	void Graph::preRenderMouseLine(int x) {
		auto& game = BromTron::getGame();
		auto& stencil = game.stencil;
		auto& size = getSize();
		auto sizef = size.cast<float>();
		auto xOffsetPerValue = static_cast<float>(totalValueEntries - 1) / static_cast<float>(size.x);
		auto pixelsOffsetPerValue = static_cast<float>(size.x) / static_cast<float>(totalValueEntries - 1);

		auto valueIndex = static_cast<size_t>((static_cast<float>(x) + pixelsOffsetPerValue * 0.5) * xOffsetPerValue);
		auto valueX = static_cast<size_t>(valueIndex * pixelsOffsetPerValue);

		stencil.recordStart(true);
		stencil.pushClipping({ 0, 0, sizef.x - 2, sizef.y - 2 });

		auto lineWidth = 2;
		stencil.drawBox({ valueX - lineWidth / 2, 0 }, { lineWidth, size.y }, Colors::Black);

		std::vector< GraphLineYText> vals;
		vals.reserve(datasets.front().values.size());

		// create sorting map
		for (auto& dataset : datasets) {
			auto valueCurrent = dataset.values[valueIndex];
			if (valueCurrent == 0) continue;

			std::string scoreText = dataset.name + ": " + std::to_string(static_cast<int>(std::round(valueCurrent)));
			vals.push_back({dataset.name, valueCurrent, scoreText });
		}
		std::sort(vals.begin(), vals.end(), [&](const auto& left, const auto& right) { return left.value > right.value; });

		bool drawLeft = false;
		for (auto& dataset : vals) {
			auto tsize = font->getStringSize(dataset.text);
			if (valueX + 5 + tsize.x >= size.x) {
				drawLeft = true;
				break;
			}
		}


		// draw sorted map
		int bottom = size.y;
		int spacing = 2;
		int y = spacing;
		for (auto& dataset : vals) {
			std::string scoreText = dataset.name + ": " + std::to_string(static_cast<int>(std::round(dataset.value)));
			auto offset = drawLeft ? -5 : 5;
			auto align = drawLeft ? mainframe::render::Stencil::TextAlignment::Right : mainframe::render::Stencil::TextAlignment::Left;
			stencil.drawText(*font, scoreText, Vector2{ valueX + offset, y } - offset, Colors::Black, align);
			stencil.drawText(*font, scoreText, Vector2{ valueX + offset, y } + offset, Colors::Black, align);
			stencil.drawText(*font, scoreText, Vector2{ valueX + offset, y } + offset1, Colors::Black, align);
			stencil.drawText(*font, scoreText, Vector2{ valueX + offset, y } + offset2, Colors::Black, align);
			stencil.drawText(*font, scoreText, { valueX + offset, y }, textCol, align);

			y += font->size + spacing;
		}

		stencil.popClipping();
		recordingMouse = stencil.recordStop();
	}
}
