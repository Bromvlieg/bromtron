/*globals jQuery:true Crux: true, JSON: true console: true*/
if (!NeptunesPride) {var NeptunesPride = {};}
(function () {
NeptunesPride.Inbox = function(universe) {
    "use strict";
    var inbox =  {};
    inbox = Crux.Widget()
        .roost(Crux.crux);

    inbox.loading = false;

    inbox.messages = {};
    inbox.messages["game_diplomacy"] = null;
    inbox.messages["game_event"] = null;

    inbox.selectedMessage = null;

    inbox.filter = "game_diplomacy";

    inbox.mpp = 10; // messages per page
    inbox.page = 0;

    inbox.cpp = 15;   // comments per page

    inbox.unreadDiplomacy = 0;
    inbox.unreadEvents = 0;

    inbox.lastFetchedUnreadCount = 0;

    inbox.commentDrafts = {};
    inbox.draft = {
        to: [],
        subject: "",
        body: ""
    };

    inbox.createToList = function (message, noHyperlinks) {
        var html, i, player, aliasProperty;

        if (noHyperlinks) {
            aliasProperty = "alias";
        } else {
            aliasProperty = "hyperlinkedAlias";
        }

        html = "";
        if (message.payload.to_uids.length === universe.playerCount - 1) {
            // all players.
            html += universe.galaxy.players[message.payload.from_uid].colourBox + " ";
            html += universe.galaxy.players[message.payload.from_uid][aliasProperty] + "<br>";
            for (i = message.payload.to_uids.length - 1; i >= 0; i--) {
                player = universe.galaxy.players[message.payload.to_uids[i]];
                html += player.colourBox;
            }
            html += " All Players<br>";
        } else {

            // some players
            html += universe.galaxy.players[message.payload.from_uid].colourBox + " ";
            html += universe.galaxy.players[message.payload.from_uid][aliasProperty] + "<br>";
            for (i = message.payload.to_uids.length - 1; i >= 0; i--) {
                player = universe.galaxy.players[message.payload.to_uids[i]];
                if (player) {
                    html += player.colourBox + " " + player[aliasProperty];
                    html += "<br>";
                }
            }
        }

        return html;
    };

    //--------------------------------------------------------------------------
    inbox.onReadAll = function () {
        var i = 0, leni = 0;

        for (i = 0, leni = inbox.messages[inbox.filter].length; i < leni; i += 1) {
            inbox.messages[inbox.filter][i].status = "read";
        }

        if (inbox.filter === "game_diplomacy") {
            inbox.unreadDiplomacy = 0;
        }
        if (inbox.filter === "game_event") {
            inbox.unreadEvents = 0;
        }

        inbox.trigger("server_request", {type: "read_all_game_messages", group: inbox.filter});
        inbox.trigger("show_screen", "inbox");
    };
    inbox.onFetchUnreadCount = function (event, data) {
        // Unread counts now only fetched every 10 minutes maximum.
        if (new Date().valueOf() - inbox.lastFetchedUnreadCount > 10 * 60 * 1000) {
            inbox.lastFetchedUnreadCount = new Date().valueOf();
            inbox.trigger("server_request", {type: "fetch_unread_count"});
        }
    };

    inbox.onUnreadCount = function (event, data) {
        inbox.unreadDiplomacy = Number(data.diplomacy);
        inbox.unreadEvents = Number(data.events);
    };

    inbox.fetchMessages = function (filter) {
        if (inbox.filter !== filter) {
            inbox.filter = filter;
            inbox.messages[inbox.filter] = null;
            inbox.page = 0;
        }

        if (inbox.unreadEvents) inbox.messages["game_event"] = null;
        if (inbox.unreadDiplomacy) inbox.messages["game_diplomacy"] = null;

        if (inbox.messages[inbox.filter] !== null) {
            // 1. if we are loading, we are still waiting for the server to respond
            // 2. if messages is null then we have never requested the messages
            // 3. if messages is empty array [] then the server already told us
            //    there are no messages
            return;
        }

        inbox.trigger("server_request", {
            type            : "fetch_game_messages",
            count           : inbox.mpp,
            offset          : inbox.mpp * inbox.page,
            group           : inbox.filter
        });

        inbox.loading = true;
    };

    inbox.reloadFilter = function () {
        inbox.messages[inbox.filter] = null;
        inbox.trigger("server_request", {
            type            : "fetch_game_messages",
            count           : inbox.mpp,
            offset          : inbox.mpp * inbox.page,
            group           : inbox.filter
        });
        inbox.loading = true;
    };


    inbox.onNewMessages = function (event, data) {
        var i = 0, leni = 0;
        var m = {};

        inbox.messages[data.group] = data.messages;
        inbox.loading = false;

        for (i = 0, leni = inbox.messages[data.group].length; i < leni; i += 1) {
            m = inbox.messages[data.group][i];
            m.comments = null;
            m.commentsLoaded = false;
            m.payload.created = new Date(m.created);

            if (m.payload.to_uids) {
                m.payload.to_uids = m.payload.to_uids.split(",");
                m.payload.to_aliases = m.payload.to_aliases.split(",");
            }

            if (!inbox.commentDrafts[m.key]) {
                inbox.commentDrafts[m.key] = "";
            }
        }

        if (data.group === "game_event") {
            inbox.messages[data.group].sort(function compareTicks(a, b) {
                return b.payload.tick - a.payload.tick;
            });
        }

        if (inbox.filter == data.group) {
            // only redraw the screen if the messages we were sent were for the
            // currently visible filter
            inbox.trigger("show_screen", "inbox");
        }
    };

    inbox.onNewComments = function (event, data) {
        var i = 0, leni = 0;
        var j = 0, lenj = 0;
        var m = {};

        for (i = 0, leni = inbox.messages[inbox.filter].length; i < leni; i += 1) {
            m = inbox.messages[inbox.filter][i];
            if (m.key === data.message_key) {
                m.comments = data.messages;
                m.commentsLoaded = true;
                m.commentsLoadedTime = new Date().getTime();
                for (j = 0, lenj = m.comments.length; j < lenj; j += 1) {
                    // todo!
                    m.comments[j].player = universe.galaxy.players[m.comments[j].from_uid];
                }
            }
        }
        if (inbox.filter === "game_diplomacy") {
            inbox.trigger("show_screen", "diplomacy_detail");
        }
        inbox.trigger("scroll_to_bottom");
    };

    inbox.onMessageRead = function (event, data) {
        inbox.selectedMessage = data;
        if (inbox.selectedMessage.status !== "read") {
            inbox.updateReadCount(inbox.selectedMessage);
            inbox.selectedMessage.status = "read";
            inbox.trigger("server_request", {
                type: "read_game_message",
                message_key: inbox.selectedMessage.key
            });
            inbox.trigger("show_screen", "inbox");
        }
    };
    //--------------------------------------------------------------------------
    inbox.updateReadCount = function (message){
        if (message.group === "game_diplomacy") {
            inbox.unreadDiplomacy -= 1;
        }
        if (message.group === "game_event") {
            inbox.unreadEvents -= 1;
        }
    };
    //--------------------------------------------------------------------------
    inbox.onSelectMessage = function (event, data) {
        inbox.selectedMessage = data;

        if (inbox.selectedMessage.status !== "read") {
            inbox.updateReadCount(inbox.selectedMessage);
            inbox.selectedMessage.status = "read";
        }

        inbox.trigger("server_request", {
            type: "fetch_game_message_comments",
            message_key: inbox.selectedMessage.key,
            count: inbox.cpp,
            offset: 0
        });
        inbox.noOlderComments = false;  // there may be older comments

        if (inbox.filter === "game_diplomacy") {
            inbox.trigger("show_screen", "diplomacy_detail");
        }
        if (inbox.filter === "game_event") {
            inbox.trigger("show_screen", "inbox");
        }
    };
    inbox.onFindOlderComments = function () {
        inbox.trigger("server_request", {
            type: "fetch_game_message_comments",
            message_key: inbox.selectedMessage.key,
            count: 100,
            offset: 0
        });
        inbox.noOlderComments = true;  // there are no older comments
    };

    //--------------------------------------------------------------------------
    inbox.onPostComment = function (event, data) {
        if (!data) { return; }
        inbox.selectedMessage.comments.unshift({
            player_uid: universe.player.uid,
            body: data
        });

        inbox.trigger("server_request", {
            type: "create_game_message_comment",
            message_key: inbox.selectedMessage.key,
            body: data});

        if (inbox.filter === "game_diplomacy") {
            inbox.trigger("show_screen", "diplomacy_detail");
        }

        inbox.trigger("scroll_to_bottom");
    };

    //--------------------------------------------------------------------------
    inbox.onPageNext = function (event, data) {
      if (!inbox.messages[inbox.filter]) {
          // if there are no message we should not be advancing pages.
          return;
      }
      if (inbox.messages[inbox.filter].length < inbox.mpp) {
        // we did not receive a full page of message last time so there are
        // probably not more.
        return;
      }

      inbox.page += 1;
      inbox.messages[inbox.filter] = null;
      inbox.fetchMessages(inbox.filter);
      inbox.trigger("show_screen", "inbox");
    };
    inbox.onPageBack = function (event, data) {
      inbox.page -= 1;
      if (inbox.page < 0 ){
          inbox.page = 0;
      }

      inbox.messages[inbox.filter] = null;
      inbox.fetchMessages(inbox.filter);
      inbox.trigger("show_screen", "inbox");
    };

    //--------------------------------------------------------------------------
    inbox.onDraftSend = function () {
        var i;
        var to_uids = "";
        var to_aliases = "";
        var to_colors = "";

        // don't send emails with empty subjects or bodies.
        if (inbox.draft.subject === "") return;
        if (inbox.draft.body === "") return;
        // if (inbox.draft.to.length < 1) return;
        if (inbox.draft.to.length > 18) return;

        // make sure the sending player is in the recipient list
        // if (inbox.draft.to.indexOf(universe.player.uid) < 0){
        //     inbox.draft.to.unshift(universe.player.uid);
        // }

        for (i = 0; i < inbox.draft.to.length; i+=1 ) {
            if (universe.galaxy.players[inbox.draft.to[i]] !== universe.player) {
                to_uids += universe.galaxy.players[inbox.draft.to[i]].uid;
                to_uids += ",";

                to_aliases += universe.galaxy.players[inbox.draft.to[i]].rawAlias;
                to_aliases += ",";

                to_colors += universe.galaxy.players[inbox.draft.to[i]].color;
                to_colors += ",";
            }

        }
        // Todo: should create arrays and use array.join(",") for this. Much cleaner.
        to_uids = to_uids.slice(0, -1);
        to_aliases = to_aliases.slice(0, -1);
        to_colors = to_colors.slice(0, -1);

        inbox.trigger("server_request", {
            type: "create_game_message",
            from_color: universe.player.color,
            to_uids: to_uids,
            to_aliases: to_aliases,
            to_colors: to_colors,
            subject: inbox.draft.subject,
            body: inbox.draft.body
        });

        inbox.trigger("hide_screen");
        inbox.clearDraft();
    };
    inbox.clearDraft = function () {
        inbox.draft = {
            to: [],
            body: "",
            attachment: ""
        };
    };
    inbox.onDraftClear = function () {
        inbox.clearDraft();
        inbox.trigger("show_screen", "compose");
    };
    inbox.onDraftAddAll = function () {
        var p;
        inbox.draft.to = [];
        for (p in universe.galaxy.players) {
            if (universe.galaxy.players[p].alias !== "" &&
                    universe.galaxy.players[p].uid !== universe.player.uid &&
                    universe.galaxy.players[p].conceded === 0) {
                inbox.draft.to.push(universe.galaxy.players[p].uid);
            }
        }
        inbox.trigger("show_screen", "compose");
    };
    inbox.onAddRecipient = function (e, recipient) {
        if (inbox.draft.to.indexOf(recipient) < 0){
            inbox.draft.to.unshift(recipient);
        }
        inbox.trigger("show_screen", "compose");
    };
    inbox.onNewMessageToPlayer = function (event, player_uid) {
        inbox.clearDraft();
        if (player_uid !== universe.player.uid) {
            inbox.draft.to.push(player_uid);
        }
        inbox.trigger("show_screen", "compose");
    };

    inbox.onSetFilter = function (event, filter) {
        inbox.fetchMessages(filter);
        inbox.trigger("show_screen", "inbox");
    };

    inbox.onShowInbox = function (event, kind) {
        if (inbox.unreadEvents > inbox.unreadDiplomacy) {
            inbox.onSetFilter(null, "game_event");
        } else {
            inbox.onSetFilter(null, "game_diplomacy");
        }
    };

    inbox.hyperlinkMessage = function(msg) {
        var i, player, regex, find;
        for (i in universe.galaxy.players) {
            player = universe.galaxy.players[i];
            find  = "\\[\\[" + player.uid + "\\]\\] " + player.rawAlias;
            regex = new RegExp(find, "g");
            msg = msg.replace(regex, player.hyperlinkedBox + player.hyperlinkedRawAlias);
        }

        msg = Crux.format(msg, universe.hyperlinkedMessageInserts);
        return msg;
    };



    //--------------------------------------------------------------------------
    inbox.on("show_inbox", inbox.onShowInbox);

    inbox.on("inbox_page_next", inbox.onPageNext);
    inbox.on("inbox_page_back", inbox.onPageBack);

    inbox.on("inbox_read_message", inbox.onMessageRead);

    inbox.on("inbox_select_message", inbox.onSelectMessage);
    inbox.on("find_older_comments", inbox.onFindOlderComments);

    inbox.on("inbox_read_all", inbox.onReadAll);
    inbox.on("inboxt_post_comment", inbox.onPostComment);
    inbox.on("inbox_set_filter", inbox.onSetFilter);

    inbox.on("inbox_relaod_filter", inbox.reloadFilter);

    inbox.on("inbox_draft_send", inbox.onDraftSend);
    inbox.on("inboxt_draft_clear", inbox.onDraftClear);
    inbox.on("inboxt_draft_addall", inbox.onDraftAddAll);
    inbox.on("inbox_add_recipient", inbox.onAddRecipient);
    inbox.on("inbox_new_message_to_player", inbox.onNewMessageToPlayer);

    // server events
    inbox.on("message:new_comments", inbox.onNewComments);
    inbox.on("message:new_messages", inbox.onNewMessages);
    inbox.on("message:unread_count", inbox.onUnreadCount);


    return inbox;
};
})();
