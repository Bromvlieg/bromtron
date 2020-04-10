#include <bt/app/engine.h>
#include <fmt/printf.h>

int main(int argc, char* argv[]) {
	auto w = std::make_unique<mainframe::game::Window>();
	if (!w->create(1920, 1080, "Bromtron")) {
		fmt::print("Failed to create window\n");
		return -1;
	}

	auto& game = bt::BromTron::game();
	game.setWindow(w);
	game.setFPS(75);

	game.init();
	game.run();

	return 0;
}