#pragma once

#include <mainframe/ui/element.h>

namespace bt {
	enum class GraphStyle {
		wave,
		line
	};

	struct GraphDataset {
		std::string name;
		std::vector<float> values;
		mainframe::render::Color color;
	};

	struct GraphDatasetRender {
		float value;
		float valueNext;
		mainframe::render::Color color;
	};

	class Graph : public mainframe::ui::Element {
		mainframe::render::Font* font = nullptr;

		std::vector<std::string> labels;
		std::vector<GraphDataset> datasets;
		GraphStyle style = GraphStyle::line;
		bool dirty = false;
		bool smooth = false;
		size_t totalValueEntries = 0;
		std::shared_ptr<mainframe::render::Stencil::Recording> recording;
		std::shared_ptr<mainframe::render::Stencil::Recording> recordingMouse;

		mainframe::math::Vector2i oldMousePos = -1;
		std::vector<mainframe::render::Color> cols; // list of colors in order of drawing
		std::vector<std::string> names; // list of each name in order of drawing
		std::vector<std::vector<float>> verticeYMap; // map of each point for each player per x vertice
		std::vector<float> verticeYMapTotal; // map for each highest point per x vertice

		mainframe::render::Color textCol = { 0.9f, 0.9f, 0.9f };
		mainframe::math::Vector2 offset = 1;
		mainframe::math::Vector2 offset1 = { 0, 1 };
		mainframe::math::Vector2 offset2 = { 1, 0 };

		void preRenderWave();
		void preRenderMouseWave(int x);

		void preRenderLine();
		void preRenderMouseLine(int x);

	public:
		Graph();

		void refresh();
		void refreshMouse(int x);
		void clearDatasets();

		void setSmooth(bool smoothMode);
		void setLabels(const std::vector<std::string>& xLabels);
		void addDataset(const GraphDataset& set);
		virtual void draw(mainframe::render::Stencil& stencil) override;
	};
}
