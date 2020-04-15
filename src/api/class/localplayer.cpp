#include <bt/api/class/localplayer.h>

namespace bt {
	void from_json(const nlohmann::json& j, ApiLocalPlayer& obj) {
		j.get_to(obj.stats);

		j.at("user_id").get_to(obj.id);
		j.at("avatar").get_to(obj.avatar);
		j.at("badges").get_to(obj.badges);
		j.at("alias").get_to(obj.username);
		j.at("user_email").get_to(obj.email);

		j.at("allow_email").get_to(obj.allowEmails);
		j.at("has_password").get_to(obj.hasPassword);
		j.at("local_account").get_to(obj.localAccount);
		j.at("email_verified").get_to(obj.emailVerified);
		j.at("subscribed_until").get_to(obj.subscriptionDate);

		j.at("open_games").get_to(obj.gamesOpen);
		j.at("owned_games").get_to(obj.gamesCreated);
		j.at("complete_games").get_to(obj.gamesCompleted);
	}
}