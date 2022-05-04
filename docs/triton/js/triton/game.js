
if (!NeptunesPride) {var NeptunesPride = {};}
(function () {
NeptunesPride.Game = function(universe, inbox, npui) {
    "use strict";
    var np = Crux.Widget();
    Crux.crux.addChild(np);

    window.setInterval(function () {Crux.crux.trigger("one_second_tick"); }, 1000);

    //--------------------------------------------------------------------------
    np.trigger = function (ek, ed) {
        if (np.preTrigger(ek, ed)) {
            np.ui.trigger(ek, ed);
        }
    };
    np.preTrigger = function (ek, ed) {
        return true;
    };

    //--------------------------------------------------------------------------
    np.onShowYourEmpire = function (event, data) {
        universe.selectedPlayer = universe.player;
        np.trigger("show_screen", "empire");
        np.trigger("refresh_player_icons");

    };
    np.onSelectPlayerPreJoin = function (event, puid) {
        universe.selectedPlayer = universe.galaxy.players[puid];
        if (universe.selectedPlayer.home){
            np.trigger("map_center_slide", universe.selectedPlayer.home);
        }
        np.trigger("hide_side_menu");
        np.trigger("hide_selection_menu");
        np.trigger("hide_screen");
        np.trigger("refresh_player_icons");
    };
    np.onSelectPlayer = function (event, puid, forceMapCenter) {
        var alreadySelected = false;

        if (npui.showingScreen === "diplomacy_detail" ||
                npui.showingScreen === "compose" ) {
                    np.trigger("insert_star_name", "[[" + puid + "]] " + universe.galaxy.players[puid].alias);
                return;
        }

        if (forceMapCenter === true) {
            alreadySelected = forceMapCenter;
        }

        if (universe.selectedPlayer === universe.galaxy.players[puid]){
            alreadySelected = true;
        }
        universe.selectedPlayer = universe.galaxy.players[puid];
        np.trigger("refresh_player_icons");
        np.trigger("show_screen", "empire");

        if (alreadySelected) {
            if (universe.selectedPlayer.home){
                np.trigger("map_center_slide", universe.selectedPlayer.home);
            }
        }

        np.trigger("hide_side_menu");
        np.trigger("hide_selection_menu");
    };

    np.onSelectFleet = function (event, data) {
        if (!universe.player) {return;}
        universe.selectFleet(data.fleet);
        np.trigger("show_screen", "fleet");
        np.trigger("refresh_player_icons");
        np.trigger("hide_selection_menu");
        np.trigger("map_refresh");
    };
    np.onShowFleetPath = function (event, fleet) {
        universe.selectFleet(fleet);
        np.trigger("refresh_player_icons");
        np.trigger("map_refresh");
    };

    np.onSelectStar = function (event, data) {
        if (!universe.player) {return;}
        universe.selectStar(data.star);
        np.trigger("show_screen", "star");
        np.trigger("refresh_player_icons");
        np.trigger("hide_selection_menu");
    };

    np.onShowStarUid = function (event, uid) {
        var star = universe.galaxy.stars[uid];
        universe.selectStar(star);
        np.trigger("map_center_slide", star);
        if (npui.width < 640) {
            np.trigger("hide_screen");
        }
    };
    np.onShowStarScreenUid = function (event, uid) {
        var star = universe.galaxy.stars[uid];
        universe.selectStar(star);
        np.trigger("show_screen", "star");
        np.trigger("map_center_slide", star);
    };

    np.onShowFleetUid = function (event, uid) {
        var fleet = universe.galaxy.fleets[uid];
        universe.selectFleet(fleet);
        np.trigger("map_center_slide", fleet);
        if (npui.width < 640) {
            np.trigger("hide_screen");
        }
    };
    np.onShowFleetScreenUid = function (event, uid) {
        var fleet = universe.galaxy.fleets[uid];
        universe.selectFleet(fleet);
        np.trigger("show_screen", "fleet");
        np.trigger("map_center_slide", fleet);
    };

    np.onShowPlayerUid = function (event, uid) {
        universe.selectPlayer(universe.galaxy.players[uid]);
        if (universe.selectedPlayer.home) {
            np.trigger("map_center_slide", universe.selectedPlayer.home);
        }
        np.trigger("show_screen", "empire");
    };
    np.onShowStar = function (event, data) {
        np.onSelectStar(event, data);
        np.trigger("hide_screen");
        np.trigger("map_center_slide", data.star);
    };

    //--------------------------------------------------------------------------
    np.onUpgradeEconomy = function (event, data) {
        if (!universe.selectedStar) return;

        np.trigger("server_request", {type: "batched_order", order: "upgrade_economy," + universe.selectedStar.uid + "," + universe.selectedStar.uce});
        universe.upgradeEconomy();
        np.trigger("refresh_interface");
        np.trigger("map_rebuild");
        np.trigger("play_sound", "ok");
    };
    np.onUpgradeIndustry = function (event, data) {
        if (!universe.selectedStar) return;

        np.trigger("server_request", {type: "batched_order", order: "upgrade_industry," + universe.selectedStar.uid + "," + universe.selectedStar.uci});
        universe.upgradeIndustry();
        np.trigger("refresh_interface");
        np.trigger("map_rebuild");
        np.trigger("play_sound", "ok");
    };
    np.onUpgradeScience = function (event, data) {
        if (!universe.selectedStar) return;

        np.trigger("server_request", {type: "batched_order", order: "upgrade_science," + universe.selectedStar.uid + "," + universe.selectedStar.ucs});
        universe.upgradeScience();
        np.trigger("refresh_interface");
        np.trigger("map_rebuild");
        np.trigger("play_sound", "ok");
    };
    np.onBulkUpgrade = function (event, data) {
        if (!universe.player) return;

        var amount = data.amount;
        var kind = data.kind;
        var max = 5000;
        var star;
        var infBought = 0;

        if (amount > universe.player.cash) return;
        while (amount > 0 && max > 0) {
            max -= 1;
            star = universe.findCheapestUpgrade(kind);
            if (kind === "economy") {
                if (star.uce > amount) {
                    amount = 0;
                    continue;
                }
                amount -= star.uce;
                np.trigger("server_request", {type: "batched_order", order: "upgrade_economy," + star.uid + "," + star.uce});
                universe.upgradeEconomy(star);
                infBought += 1;
            }
            if (kind === "industry") {
                if (star.uci > amount) {
                    amount = 0;
                    continue;
                }
                amount -= star.uci;
                np.trigger("server_request", {type: "batched_order", order: "upgrade_industry," + star.uid + "," + star.uci});
                universe.upgradeIndustry(star);
                infBought += 1;
            }
            if (kind === "science") {
                if (star.ucs > amount) {
                    amount = 0;
                    continue;
                }
                amount -= star.ucs;
                np.trigger("server_request", {type: "batched_order", order: "upgrade_science," + star.uid + "," + star.ucs});
                universe.upgradeScience(star);
                infBought += 1;
            }
        }
        np.trigger("refresh_interface");
        np.trigger("map_rebuild");
        np.trigger("play_sound", "ok");

        var values = {
                "amount": infBought,
                "localised_kind": Crux.localise(kind)
            };
        var screenConfig = {
            message: "notification_bulk_upgrade",
            messageTemplateData: values,
            notification: true
        };
        np.trigger("show_screen",  ["confirm", screenConfig]);

    };
    np.onBuyWarpGate = function (event, data) {
        if (!universe.selectedStar) return;

        np.trigger("server_request", {type: "batched_order", order: "buy_warp_gate," + universe.selectedStar.uid + "," + universe.selectedStar.ucg});
        universe.buyWarpGate();
        np.trigger("refresh_interface");
        np.trigger("map_rebuild");
        np.trigger("play_sound", "ok");
    };
    np.onDestroyWarpGate = function (event, data) {
        if (!universe.selectedStar) return;

        np.trigger("server_request", {type: "batched_order", order: "destroy_warp_gate," + universe.selectedStar.uid + "," + universe.selectedStar.ucg});
        universe.destroyWarpGate();
        np.trigger("map_rebuild");
        np.trigger("refresh_interface");
        np.trigger("play_sound", "ok");
    };

    np.onAbandonStar = function () {
        if (!universe.selectedStar) return;
        universe.abandonStar();
        np.trigger("server_request", {type: "order", order: "abandon_star," + universe.selectedStar.uid});

        np.trigger("refresh_interface");
        np.trigger("map_rebuild");
        np.trigger("play_sound", "ok");

    };

    //--------------------------------------------------------------------------
    np.onDeclareWar = function (event, data) {
        if (!universe.selectedPlayer) return;

        universe.player.countdown_to_war[universe.selectedPlayer.uid] = 24;
        np.trigger("server_request", {type: "order", order: "declare_war," + universe.selectedPlayer.uid});
        np.trigger("refresh_interface");
    };
    np.onUnRequestPeace = function (event, data) {
        if (!universe.selectedPlayer) return;

        universe.player.war[universe.selectedPlayer.uid] = 3;
        np.trigger("server_request", {type: "order", order: "unrequest_peace," + universe.selectedPlayer.uid});
        np.trigger("refresh_interface");
    };
    np.onRequestPeace = function (event, data) {
        if (!universe.selectedPlayer) return;
        if (universe.player.cash < 150) return;

        universe.player.cash -= 150;
        universe.player.war[universe.selectedPlayer.uid] = 2;

        np.trigger("server_request", {type: "order", order: "request_peace," + universe.selectedPlayer.uid});
        np.trigger("refresh_interface");
    };
    np.onAcceptPeace = function (event, data) {
        if (!universe.selectedPlayer) return;

        universe.player.war[universe.selectedPlayer.uid] = 0;

        np.trigger("server_request", {type: "order", order: "accept_peace," + universe.selectedPlayer.uid});
        np.trigger("refresh_interface");
    };

    //--------------------------------------------------------------------------
    np.onRenameFleet = function (event, name) {
        name = np.validateFleetStarName(name);
        if (!name) {
            return;
        }
        universe.selectedFleet.n = name;
        np.trigger("map_refresh");
        np.trigger("show_screen", "fleet");
        np.trigger("server_request", {type: "order", order: "rename_fleet," + universe.selectedFleet.uid + "," + name});
    };
    np.onRenameStar = function (event, name) {
        name = np.validateFleetStarName(name);
        if (!name) {
            return;
        }
        universe.selectedStar.n = name;
        np.trigger("map_refresh");
        np.trigger("show_screen", "star");
        np.trigger("server_request", {type: "order", order: "rename_star," + universe.selectedStar.uid + "," + name});
    };

    //--------------------------------------------------------------------------
    np.onStarDirectoryEconomy = function (event, data) {
        universe.selectStar(universe.galaxy.stars[data]);
        np.onUpgradeEconomy();
        np.trigger("refresh_interface");
        np.trigger("map_refresh");
    };

    np.onStarDirectoryIndustry = function (event, data) {
        universe.selectStar(universe.galaxy.stars[data]);
        np.onUpgradeIndustry();
        np.trigger("refresh_interface");
        np.trigger("map_refresh");
    };

    np.onStarDirectoryScience = function (event, data) {
        universe.selectStar(universe.galaxy.stars[data]);
        np.onUpgradeScience();
        np.trigger("refresh_interface");
        np.trigger("map_refresh");
    };
    np.onStarDirectoryRowHHilight = function (e, d) {
        universe.StarDirRowHilight = Number(d);
        np.trigger("refresh_interface");
    };

    //--------------------------------------------------------------------------
    np.onShareTech = function (event, data) {
        var targetPlayer = data.targetPlayer;
        var name = data.techName;
        var price = (targetPlayer.tech[name].level + 1) * universe.galaxy.trade_cost;
        if (universe.player.cash >= price) {
            targetPlayer.tech[name].level += 1;
            universe.player.cash -= price;
            np.trigger("server_request", {type: "order", order: "share_tech," + targetPlayer.uid + "," + name});
            universe.selectPlayer(targetPlayer);
            np.trigger("refresh_interface");
        }
    };
    np.onSendMoney = function (event, data) {
        var targetPlayer = data.targetPlayer;
        var amount = data.amount;
        if (universe.player.cash >= amount) {
            universe.player.cash -= Number(amount);
            targetPlayer.cash += Number(amount);
            np.trigger("server_request", {type: "order", order: "send_money," + targetPlayer.uid + "," + amount});
            universe.selectPlayer(targetPlayer);
            np.trigger("refresh_interface");
        }
    };
    np.onGiveStar = function (event, data) {
        var targetPlayer = data.targetPlayer;
        var starUid = data.starUid;

        targetPlayer.total_stars += 1;
        universe.player.total_stars -= 1;

        var star = universe.galaxy.stars[starUid];

        if (universe.player.cash < star.nr * 10) { return; }
        universe.player.cash -= star.nr * 10;

        star.puid =  targetPlayer.uid;
        star.player = targetPlayer;
        star.qualifiedAlias = targetPlayer.qualifiedAlias;
        star.hyperlinkedAlias = targetPlayer.hyperlinkedAlias;
        star.colourBox = targetPlayer.colourBox;
        star.owned = false;

        var fleet, i;
        for (i = star.fleetsInOrbit.length - 1; i >= 0; i--) {
            fleet = star.fleetsInOrbit[i];
            fleet.puid = star.puid;
            fleet.player = star.player;
            fleet.qualifiedAlias = targetPlayer.qualifiedAlias;
            fleet.hyperlinkedAlias = targetPlayer.hyperlinkedAlias;
            fleet.colourBox = targetPlayer.colourBox;
            star.owned = false;
        }
        np.trigger("server_request", {type: "order", order: "give_star," + targetPlayer.uid + "," + starUid});
        universe.selectPlayer(targetPlayer);
        np.trigger("map_rebuild");
    };

    //--------------------------------------------------------------------------
    np.onSelectAndGatherAllShips = function (event, star) {
        universe.selectStar(star);
        np.onGatherAllShips();
        np.trigger("show_selection_menu");
    };
    np.onGatherAllShips = function () {
        var i, fleet, ts = 0;
        var star = universe.selectedStar;
        for (i = star.fleetsInOrbit.length - 1; i >= 0; i--) {
            fleet = star.fleetsInOrbit[i];
            if (star.player.uid != fleet.player.uid) continue;
            ts += fleet.st - 1;
            fleet.st = 1;
        }
        star.st += ts;
        np.trigger("server_request", {type: "order", order: "gather_all_ships," + star.uid});
        np.trigger("refresh_interface");
        np.trigger("play_sound", "ok");
    };
    //--------------------------------------------------------------------------
    np.onAwardKarma = function (event) {
        if (universe.player.karma_to_give > 0) {
            universe.player.karma_to_give -= 1;
            universe.playerAchievements[universe.selectedPlayer.uid].karma += 1;
            np.trigger("server_request", {type: "order", order: "award_karma," + universe.selectedPlayer.uid});
            np.trigger("refresh_interface");
            np.trigger("play_sound", "ok");
        }
    };
    //--------------------------------------------------------------------------
    np.onEditWaypointKeyboard = function (event, data) {
        if (universe.editMode === "edit_waypoints") {
            np.onCancelFleetOrders();
            return;
        }

        if (universe.selectedFleet && universe.selectedFleet.player === universe.player) {
            np.onStartEditWaypoints(null, {fleet:universe.selectedFleet});
            return;
        }

        var i, fleet;


        if (universe.selectedStar && universe.selectedStar.player === universe.player) {
            if (universe.selectedStar.fleetsInOrbit.length){
                for (i = universe.selectedStar.fleetsInOrbit.length - 1; i >= 0; i--) {
                    fleet = universe.selectedStar.fleetsInOrbit[i];
                    if (!fleet.path.length ) {
                        np.onStartEditWaypoints(null, {fleet:fleet});
                        return;
                    }
                }
            }
        }

        if (universe.selectedStar && universe.selectedStar.player === universe.player) {
            if (universe.selectedStar.fleetsInOrbit.length){
                np.onStartEditWaypoints(null, {fleet:universe.selectedStar.fleetsInOrbit[0]});
                return;
            }
        }
    };
    np.onStartEditWaypoints = function (event, data) {
        var i;
        universe.editMode = "edit_waypoints";
        universe.interfaceSettings.showWaypointChoices = true;
        universe.selectFleet(data.fleet);
        universe.createOldOrders();
        universe.calcWaypoints();
        np.trigger("hide_screen");
        np.trigger("hide_selection_menu");
        np.trigger("show_fleet_order_confirm");
        np.trigger("map_rebuild");
        np.trigger("play_sound", "alt_open");
    };
    np.onAddWaypoint = function (event, wp) {
        universe.addFleetWaypoint(wp);
        universe.calcWaypoints();
        np.trigger("map_rebuild");
        np.trigger("show_fleet_order_confirm");
        np.trigger("play_sound", "add");
    };
    np.onRemoveWaypoint = function (event, data) {
        universe.removeFleetWaypoint();
        universe.calcWaypoints();
        np.trigger("show_fleet_order_confirm");
        np.trigger("map_rebuild");
        np.trigger("play_sound", "subtract");
    };
    np.onClearWaypoints = function (event, data) {
        universe.clearFleetWaypoints();
        universe.calcWaypoints();

        np.trigger("show_fleet_order_confirm");
        np.trigger("map_rebuild");
        np.trigger("play_sound", "subtract");
    };

    np.onSubmitFleetOrdersEdit = function () {
        universe.askForLooping = false;
        np.onSubmitFleetOrders();
        np.trigger("show_screen", "fleet");
    };
    np.onSubmitFleetOrdersTestLoop = function () {
        np.onSubmitFleetOrders();
        if (universe.askForLooping) {
            universe.askForLooping = false;
            np.trigger("hide_screen");
            var screenConfig = {
                message: "confirm_auto_loop",
                eventKind: "loop_submit_fleet_orders",
                eventData: {fleet: universe.selectedFleet},
                cancelEventKind: "submit_fleet_orders",
                cancelEventData: {fleet: universe.selectedFleet},
                yesNoLabels: true
            };
            np.trigger("show_screen",  ["confirm", screenConfig]);
            return;
        }
    };
    np.onLoopSubmitFleetOrders = function (event, data) {
        universe.selectFleet(data.fleet);
        universe.selectedFleet.loop = true;
        np.onSubmitFleetOrders();
    };

    np.onSubmitFleetOrders = function () {
        var fleet = universe.selectedFleet;
        var orderDelays = [];
        var orderTarget = [];
        var orderAction = [];
        var orderAmount = [];

        var loop = 0;
        if (fleet.loop) {
            loop = 1;
        }

        var i = 0, ii = 0;
        for (i = 0, ii = fleet.orders.length; i < ii; i += 1) {
            orderDelays.push(fleet.orders[i][0]);
            orderTarget.push(fleet.orders[i][1]);
            orderAction.push(fleet.orders[i][2]);
            orderAmount.push(fleet.orders[i][3]);
        }
        if (orderDelays.length) {
            np.trigger("server_request", {type: "order",
                    order: "add_fleet_orders," +
                        fleet.uid + "," +
                        orderDelays.join("_") + "," +
                        orderTarget.join("_") + "," +
                        orderAction.join("_") + "," +
                        orderAmount.join("_") + "," +
                        loop
                   });

        } else {
            fleet.loop = false;
            np.trigger("server_request", {type: "order",
                    order: "clear_fleet_orders," + fleet.uid});
        }

        universe.waypoints = [];
        universe.editMode = "normal";
        fleet.oldOrders = null;
        fleet.oldPath = null;
        universe.interfaceSettings.showWaypointChoices = false;
        np.trigger("hide_fleet_order_confirm");

        if (!npui.showingScreen) {
            np.trigger("show_selection_menu");
        }

        np.trigger("map_rebuild");
        np.trigger("play_sound", "ok");
    };
    np.onCancelFleetOrders = function () {
        if (universe.editMode !== "edit_waypoints") {
            return;
        }
        var i, p;
        universe.waypoints = [];
        universe.editMode = "normal";

        universe.interfaceSettings.showWaypointChoices = false;
        if (!universe.selectedFleet) {
            return;
        }
        universe.restoreOldOrders();
        universe.calcFleetEta(universe.selectedFleet);

        np.trigger("hide_fleet_order_confirm");
        np.trigger("map_rebuild");
        np.trigger("play_sound", "cancel");
    };

    //--------------------------------------------------------------------------
    np.onLoopFleetOrders = function () {
        universe.selectedFleet.loop = 1;
        np.trigger("server_request", {type: "order", order: "loop_fleet_orders," + universe.selectedFleet.uid + ",1"});
        np.trigger("show_screen", "fleet");
        np.trigger("map_rebuild");
        np.trigger("play_sound", "ok");
    };
    np.onLoopFleetOrdersOff = function () {
        universe.selectedFleet.loop = 0;
        np.trigger("server_request", {type: "order", order: "loop_fleet_orders," + universe.selectedFleet.uid + ",0"});
        np.trigger("show_screen", "fleet");
        np.trigger("map_rebuild");
        np.trigger("play_sound", "ok");
    };

    //--------------------------------------------------------------------------
    np.onShipTransfer = function (event, data) {
        if (universe.selectedFleet.player.uid !== universe.selectedFleet.orbiting.player.uid) return;
        universe.shipTransfer(data.star, data.fleet);
        np.trigger("server_request", {type: "order", order: "ship_transfer," + universe.selectedFleet.uid + "," + data.fleet });
        np.trigger("hide_screen");
        if (!npui.showingScreen) {
            np.trigger("show_selection_menu");
        }
        np.trigger("play_sound", "ok");
    };
    np.onNewFleet = function (event, data) {
        if (universe.player.cash < 25) { return; }
        universe.player.cash -= 25;
        universe.selectedStar.st -= data.strength;
        np.trigger("server_request", {type: "order", order: "new_fleet," + universe.selectedStar.uid + "," + data.strength });
        np.trigger("map_refresh");
        np.trigger("hide_screen");
        np.trigger("play_sound", "ok");
        universe.selectNone();
    };

    //--------------------------------------------------------------------------
    np.onChangeResearch = function (event, data) {
        universe.player.researching = data;
        np.trigger("server_request", {type: "order", order: "change_research," + data });
        np.trigger("refresh_interface");
        np.trigger("play_sound", "ok");
    };
    np.onChangeResearchNext = function (event, data) {
        universe.player.researching_next = data;
        np.trigger("server_request", {type: "order", order: "change_research_next," + data });
        np.trigger("refresh_interface");
        np.trigger("play_sound", "ok");
    };

    //--------------------------------------------------------------------------
    np.onMapMiddleClicked = function (event, data) {
        var ps = universe.seekSelection(data.x, data.y);
        if (!ps[0]) return;
        if (npui.showingScreen === "diplomacy_detail" ||
                npui.showingScreen === "compose" ) {
            if (ps[0].player) {
                np.trigger("insert_star_name", "[[" + ps[0].player.uid + "]] " + ps[0].player.alias);
                return;
            }
        }

        if (ps[0].player) {
            universe.selectPlayer(ps[0].player);
            np.trigger("show_screen", "empire");
            np.trigger("ripple_star", ps[0]);
            np.trigger("play_sound","map_clicked");
            return;
        }

    };

    //--------------------------------------------------------------------------
    np.onMapClicked = function (event, data) {
        var i = 0, leni = 0;
        var j = 0, lenj = 0;
        var waypointClicked = false;

        var ps = universe.seekSelection(data.x, data.y);

        if (universe.editMode === "edit_waypoints") {
            for (i = 0, leni = ps.length; i < leni; i += 1) {
                for (j = 0, lenj = universe.waypoints.length; j < lenj; j += 1) {
                    if (ps[i] === universe.waypoints[j]) {
                        np.trigger("add_waypoint", universe.waypoints[j]);
                        waypointClicked = true;
                    }
                }
            }
            return;
        }

        if (universe.editMode == "ruler") {
            if (ps[0]) {
                universe.updateRuler(ps[0]);
                universe.selectStar(ps[0]);
                np.trigger("ripple_star", ps[0]);
                np.trigger("play_sound","map_clicked");
                np.trigger("show_ruler_toolbar");
            }
            return;
        }

        if (universe.selectionModifier && ps[0] && ps[0].player) {
            universe.selectPlayer(ps[0].player);
            np.trigger("show_screen", "empire");
            np.trigger("ripple_star", ps[0]);
            np.trigger("play_sound","map_clicked");
            return;
        }

        if (ps.length > 0) {
            if (npui.showingScreen === "diplomacy_detail" ||
                    npui.showingScreen === "compose" ) {
                np.trigger("insert_star_name", "[[" + ps[0].n + "]]");
                return;
            }
            if (ps[0].kind === "star") {
                if (universe.selectedStar === ps[0] && npui.selectionMenu){
                    np.trigger("show_screen", "star");
                    return;
                } else {
                    universe.selectStar(ps[0]);
                }
            }
            if (ps[0].kind === "fleet") {
                if (universe.selectedFleet === ps[0] && npui.selectionMenu){
                    np.trigger("show_screen", "fleet");
                    return;
                } else {
                    universe.selectFleet(ps[0]);
                }
            }

            // for some reason. when hiding the screen, after a full universe report causes the map to jump. something
            // is wrong with deltaX and Y that is passed to map.moveDelta(). Could be the event, or perhaps the map.oldX
            // and Y. I suspect its the event??? Giving up for now as this is very minor issue.
            np.trigger("hide_screen");

            np.trigger("show_selection_menu");
            np.trigger("play_sound","selection_open");
            np.trigger("refresh_build_inf_toolbar");

            np.trigger("special_ripple_star", ps[0]);

            return;
        }

        universe.selectNone();
        if (npui.showingScreen === "star" || npui.showingScreen === "fleet" || npui.showingScreen === "ship_transfer"){
            np.trigger("hide_screen");
        }

        np.trigger("hide_side_menu");
        np.trigger("hide_selection_menu");
        np.trigger("refresh_build_inf_toolbar");
        np.trigger("hide_fleet_order_confirm");
    };

    //--------------------------------------------------------------------------
    np.onLeaveGame = function () {
        np.trigger("server_request", {type: "leave_game"});
    };
    np.onPostLeaveGame = function () {
        np.trigger("browse_to", "/");
    };
    np.onJoinGame = function (event) {
        np.trigger("server_request", {
            type: "join_game",
            pos: universe.joinGamePos,
            alias: universe.joinGameAlias,
            avatar: universe.joinGameAvatar,
            pass: universe.joinGamePassword
        });
        universe.joinGamePassword = "";
        universe.joinGameAlias = "";

        np.trigger("hide_screen");
        np.trigger("hide_warning");
    };
    np.onPostJoinGame = function (event, newGalaxy) {
        universe.addGalaxy(newGalaxy);
        universe.selectStar(universe.player.home);

        np.trigger("refresh_interface");
        np.trigger("rebuild_player_icons");

        np.trigger("hide_screen");
        np.trigger("hide_warning");

        np.trigger("map_rebuild");
        if (NeptunesPride.gameConfig.darkGalaxy === 1){
            np.trigger("map_center", universe.player.home);
        } else {
            np.trigger("map_center_slide", universe.player.home);
        }
        np.onFetchPlayerAchievements();

        np.trigger("show_screen", "leaderboard");
    };

    //--------------------------------------------------------------------------
    np.onNewFleetResponse = function (event, newFleet) {
        universe.expandFleetData(newFleet);
        universe.galaxy.fleets[newFleet.uid] = newFleet;
        np.trigger("refresh_interface");
        np.trigger("map_rebuild");
        np.trigger("start_edit_waypoints", {fleet:newFleet});
    };
    //--------------------------------------------------------------------------

    np.testForNag = function () {
        var now = new Date().getTime();
        var minAccountAge = 7 * 24 * 60 * 60 * 1000;
        var minLastNag = 56 * 60 * 60 * 1000;
        if (now - NeptunesPride.account.created.getTime() > minAccountAge) {
            if (!NeptunesPride.account.premium) {
                if (now - NeptunesPride.account.nagged.getTime() > minLastNag) {
                    np.trigger("server_request", {type: "nag"});
                    window.setTimeout(function() {np.trigger("show_nag");}, 1000);
                    NeptunesPride.account.nagged = new Date();
                }
            }
        }
    };

    np.onFullUniverse = function (event, newGalaxy) {
        np.testForNag();
        np.onResetEditMode();

        var interfaceRequired = false;

        if (universe.showingError) {
            np.trigger("hide_warning");
        }

        if (universe.galaxy === null) {
            interfaceRequired = true;
        }

        universe.addGalaxy(newGalaxy);
        np.trigger("map_rebuild");

        if (interfaceRequired) {
            np.trigger("build_interface");
            np.trigger("show_screen", "leaderboard");
            if (universe.player && universe.player.home) {
                np.trigger("map_center", universe.player.home);
            } else {
                np.trigger("map_center", {
                    x: universe.centerX,
                    y: universe.centerY
                });
            }
            // now that we have an interface, remove the built in loading screen.
            jQuery("#loadingArea").remove();
        }

        if (!interfaceRequired) {
            np.trigger("refresh_interface");
        }

        if (!universe.player) {
            if (universe.openPlayerPositions > 0) {
                np.trigger("show_warning", "warning_not_in_game");
            }
        }

        if (universe.galaxy.game_over) {
            np.trigger("show_screen", "leaderboard");
        }

        np.onFetchPlayerAchievements();
        inbox.onFetchUnreadCount();

    };

    //--------------------------------------------------------------------------
    np.onError = function (event, error) {
        console.log("FAILED ORDER: ", error);
        universe.showingError = true;
        universe.loading = false;
        universe.outstandingRequests = 0;
        np.trigger("hide_screen");
        np.trigger("show_warning", "failed_order_" + error);
    };

    np.onAPICode = function (event, note) {
        universe.loading = false;
        universe.outstandingRequests = 0;
        np.trigger("hide_screen");

        var screenConfig = {
            message: "new_api_code",
            messageTemplateData: {note: note},
            eventKind: "",
            eventData: {},
            notification: true
        };
        np.trigger("show_screen",  ["confirm", screenConfig]);

    };
    np.onOK = function (event, data) {
        //console.log(data);
    };
    //--------------------------------------------------------------------------
    np.onServerResponseError = function (reponse) {
        console.log("FAILED REQUEST: ", reponse.responseText);
        universe.showingError = true;
        universe.loading = false;
        universe.outstandingRequests = 0;
        np.trigger("hide_screen");
        np.trigger("show_warning", "server_communication_error");
    };
    np.onServerResponse = function (response) {
        console.log(response)
        if (!response || !response.event) {
            np.onServerResponseError(response);
            return;
        }
        //console.log("server response:" + response.event);
        np.trigger(response.event, response.report);
        universe.outstandingRequests -= 1;
        if (universe.outstandingRequests <= 0) {
            universe.outstandingRequests = 0;
            universe.loading = false;
            np.trigger("update_status");
        }
    };

    //--------------------------------------------------------------------------
    universe.batchedRequests = [];
    universe.batchedRequestTimeout = 0;
    np.sendBatchedRequests = function(async) {
        if (async === undefined) async = true;
        if (!universe.batchedRequests.length) return;
        np.serverRequest({type: "batched_orders", order: universe.batchedRequests.join("/")}, async);
        universe.batchedRequests = [];
        universe.batchedRequestTimeout = 0;
        universe.outstandingRequests += 1;
        universe.loading = true;
    };
    np.onUnloaded = function () {
        np.sendBatchedRequests(false);
    };
    np.onServerRequest = function (event, data) {
        if (data.type === "batched_order"){
            universe.batchedRequests.push(data.order);
            universe.batchedRequestTimeout = 5;
        } else {
            np.serverRequest(data);
            universe.outstandingRequests += 1;
            universe.loading = true;
            np.trigger("update_status");
        }
    };
    np.serverRequest = function (data, async) {
        var comLink = {};
        var url = "", requestVars = {};
        var property = "";

        if (async === undefined) async = true;

        url = "/trequest/" + data.type;
        requestVars = {};

        for (property in data) {
            requestVars[property] = data[property];
        }

        requestVars.version = NeptunesPride.version;
        requestVars.game_number = NeptunesPride.gameNumber;

        comLink = jQuery.ajax({ type: 'POST',
                                url: url,
                                async: async,
                                data: requestVars,
                                success: np.onServerResponse,
                                error: np.onServerResponseError,
                                dataType: "json"});
    };

    //--------------------------------------------------------------------------
    np.onBrowseTo = function (e, url) {
        window.location.href = url;
    };

    np.onStartRuler = function () {
        if (universe.editMode === "edit_waypoints") {
            np.onCancelFleetOrders();
        }

        universe.selectNone();
        universe.initRuler();

        if (universe.editMode === "ruler") {
            np.onEndRuler();
            return;
        }

        // Change to allow the ruler to start on a selected star OR fleet.
        if (universe.selectedStar) {
            universe.updateRuler(universe.selectedStar);
        } else if (universe.selectedFleet) {
            universe.updateRuler(universe.selectedFleet);
        }

        np.onResetEditMode();
        universe.editMode = "ruler";
        universe.interfaceSettings.showRuler = true;
        np.trigger("show_ruler_toolbar");
        np.trigger("map_refresh");
        np.trigger("hide_screen");
        np.trigger("hide_side_menu");
        np.trigger("hide_selection_menu");
        np.trigger("play_sound", "alt_open");
    };
    np.onResetRuler = function () {
        universe.initRuler();
        np.trigger("show_ruler_toolbar");
        np.trigger("map_refresh");
    };
    np.onEndRuler = function () {
        if (universe.editMode != "ruler") return;
        universe.editMode = "normal";
        np.trigger("hide_ruler_toolbar");
        np.trigger("map_refresh");
    };
    np.onStartQuickUpgrade = function () {
        if (universe.editMode === "quick_upgrade") {
            np.onEndQuickUpgrade();
            return;
        }
        np.onResetEditMode();

        universe.editMode = "quick_upgrade";
        universe.interfaceSettings.showQuickUpgrade = true;
        universe.interfaceSettings.showBasicInfo = false;

        np.trigger("show_build_inf_toolbar");
        np.trigger("map_refresh");
        np.trigger("hide_screen");
        np.trigger("hide_side_menu");
        np.trigger("hide_selection_menu");
        np.trigger("play_sound", "alt_open");
    };
    np.onEndQuickUpgrade = function () {
        universe.editMode = "normal";
        universe.interfaceSettings.showBasicInfo = true;
        universe.interfaceSettings.showQuickUpgrade = false;
        np.trigger("hide_build_inf_toolbar");
        np.trigger("map_refresh");
    };
    np.onResetEditMode = function () {
        if (universe.editMode === "normal") {
            return;
        }
        if (universe.editMode === "edit_waypoints") {
            np.onCancelFleetOrders();
        }
        if (universe.editMode === "quick_upgrade") {
            np.onEndQuickUpgrade();
        }
        if (universe.editMode === "ruler") {
            np.onEndRuler();
        }
    };

    //--------------------------------------------------------------------------
    np.onOneSecondTick = function () {
        if (!universe.galaxy) return;
        if (!universe.player) return;

        if (universe.batchedRequestTimeout > 0) {
            universe.batchedRequestTimeout -= 1;
        }
        if (universe.batchedRequests.length && universe.batchedRequestTimeout === 0){
            np.sendBatchedRequests();
        }
    };

    //--------------------------------------------------------------------------
    np.onTurnReady = function () {
        universe.player.ready = 1;
        np.trigger("server_request", {type: "order", order: "force_ready"});
        np.trigger("refresh_interface");
        np.trigger("play_sound", "ok");
    };

    //--------------------------------------------------------------------------
    np.onStarDirSort = function (event, name) {
        if (universe.starDirectory.sortBy === name) {
            universe.starDirectory.invert *= -1;
        }
        if (universe.starDirectory.invert > 0) {
            np.trigger("play_sound", "add");
        } else {
            np.trigger("play_sound", "subtract");
        }
        universe.StarDirRowHilight = undefined;
        universe.starDirectory.sortBy = name;
        np.trigger("show_screen", "star_dir");

    };
    np.onStarDirFilter = function (event, name) {
        universe.starDirectory.filter = name;
        universe.StarDirRowHilight = undefined;
        np.trigger("show_screen", "star_dir");
    };

    //--------------------------------------------------------------------------
    np.onFleetDirSort = function (event, name) {
        if (universe.fleetDirectory.sortBy === name) {
            universe.fleetDirectory.invert *= -1;
        }
        if (universe.fleetDirectory.invert > 0) {
            np.trigger("play_sound", "add");
        } else {
            np.trigger("play_sound", "subtract");
        }

        universe.fleetDirectory.sortBy = name;
        np.trigger("show_screen", "fleet_dir");
    };
    np.onFleetDirFilter = function (event, name) {
        universe.fleetDirectory.filter = name;
        np.trigger("show_screen", "fleet_dir");
    };

    np.onShipDirSort = function (event, name) {
        if (universe.shipDirectory.sortBy === name) {
            universe.shipDirectory.invert *= -1;
        }
        if (universe.shipDirectory.invert > 0) {
            np.trigger("play_sound", "add");
        } else {
            np.trigger("play_sound", "subtract");
        }

        universe.shipDirectory.sortBy = name;
        np.trigger("show_screen", "ship_dir");
    };
    np.onShipDirFilter = function (event, name) {
        universe.shipDirectory.filter = name;
        np.trigger("show_screen", "ship_dir");
    };

    //--------------------------------------------------------------------------
    np.onShowHelp = function (event, kind) {
        universe.helpKind = kind;
        universe.helpHTML = "";
        function onHelpRequestSuccess (response) {
            universe.helpHTML = response;
            np.trigger("show_screen", "help");
        }

        function onHelpRequestFail (error) {
            console.log("Help Request Fail", error);
        }

        jQuery.ajax({ type: 'GET',
            url: "/html/help/" + kind + ".html",
            success: onHelpRequestSuccess,
            error: onHelpRequestFail,
            dataType: "html"});

        np.trigger("play_sound", "alt_open");
        np.trigger("show_screen", "help");
    };

    //--------------------------------------------------------------------------
    np.onFetchPlayerAchievements = function () {
        if (NeptunesPride.gameConfig.anonymity === 1) return;
        if (universe.playerAchievements !== null) return;
        np.trigger("server_request", {type: "fetch_player_achievements", game_number: NeptunesPride.gameNumber});
    };

    np.onNewPlayerAchievements = function (event, data) {
        universe.playerAchievements = data;
        np.trigger("refresh_interface");
    };

    //--------------------------------------------------------------------------
    // Intel
    //--------------------------------------------------------------------------
    np.onIntelPlayerFilterChange = function (event, id) {
        var index = universe.intelPlayerToChart.indexOf(id);
        if (index >= 0) {
            universe.intelPlayerToChart.splice(index, 1);
        } else {
            universe.intelPlayerToChart.push(id);
        }

        if (!universe.intelPlayerToChart.length) {
            universe.intelPlayerToChart.push(universe.player.uid);
        }
        np.onIntelSelectionChange(null, universe.intelDataType);

    };

    np.onIntelPlayerFilterAll = function (event, id) {
        var p;
        universe.intelPlayerToChart = [];
        for (p in universe.galaxy.players){
            universe.intelPlayerToChart.push(Number(p));
        }
        np.onIntelSelectionChange(null, universe.intelDataType);

    };

    np.onIntelPlayerFilterNone = function (event, id) {
        universe.intelPlayerToChart = [universe.player.uid];
        np.onIntelSelectionChange(null, universe.intelDataType);
    };

    np.onIntelSelectionChange = function (event, dt) {
        if (!universe.intelDataFull) return;
        var i, j;

        universe.intelDataType = dt;
        universe.IntelChartOptions.colors = [];

        var constructionArray = [];
        for (i = 0; i < universe.intelDataFull.length; i+=1) {
            var snapshot = universe.intelDataFull[i];
            var row = [];
            var activePlayersData = null;
            row.push(snapshot.tick);
            for (j = 0; j < snapshot.players.length; j+=1) {
                var player = snapshot.players[j];
                if (universe.intelPlayerToChart.indexOf(player.uid) >= 0) {
                    if (player.uid === universe.player.uid) {
                        activePlayersData = player[universe.intelDataType];
                    } else {
                        row.push(player[universe.intelDataType]);
                        universe.IntelChartOptions.colors.push(universe.playerColors[universe.galaxy.players[player.uid].colorIndex]);
                    }
                }
            }
            if (activePlayersData !== null) {
                row.push(activePlayersData);
                universe.IntelChartOptions.colors.push("#FFFFFF");
            }
            constructionArray.push(row);
        }

        // sort the data based on the first element of each array, the tick
        // the data from the sever seems to become unsorted as a js object
        constructionArray.sort(function(a, b){
            return a[0] - b[0];
        });

        // add player name labels
        var activePlayerAlias = null;
        constructionArray.unshift(['']);
        for (i = 0; i < universe.playerCount; i+=1) {
            if (universe.intelPlayerToChart.indexOf(universe.galaxy.players[i].uid) >= 0) {
                if (universe.galaxy.players[i] === universe.player) {
                    activePlayerAlias = universe.player.alias;
                } else {
                    constructionArray[0].push(universe.galaxy.players[i].alias);
                }
            }
        }
        if (activePlayerAlias){
            constructionArray[0].push(activePlayerAlias);
        }

        universe.intelData = google.visualization.arrayToDataTable(constructionArray);
        np.trigger("show_screen", "intel");
    };
    np.onIntelDataRecieved = function (event, data) {
        universe.intelDataRequestPending = false;
        universe.intelDataRecievedTime = new Date().getTime();
        if (data.stats.length) {
            universe.intelDataFull = data.stats;
            np.onIntelSelectionChange(null, universe.intelDataType);
        } else {
            universe.intelDataNone = true;
            np.trigger("show_screen", "intel");
        }
    };
    np.onRequestIntelData = function () {
        if (universe.intelDataRequestPending) { return; }

        // Intel data discarded if 3 hours old.
        if (universe.intelDataRecievedTime) {
            var now = new Date().getTime();
            if (now > universe.intelDataRecievedTime + 1000*60*60*3) {
                universe.intelData = null;
            }
        }

        if (!universe.intelData) {
            universe.intelDataRequestPending = true;
            np.trigger("server_request", {type: "intel_data"});
        }
    };

    np.onShowIntel = function (event, puid) {
        if (!universe.player) return;

        if (!universe.intelDataFull) {
            np.onRequestIntelData();
        }

        universe.intelPlayerToChart = [];
        universe.intelPlayerToChart.push(universe.player.uid);
        if (puid !== universe.player.uid) {
            universe.intelPlayerToChart.push(puid);
        }

        np.onIntelSelectionChange(null, universe.intelDataType);
    };

    //--------------------------------------------------------------------------
    np.onToggleFleetNavEtaDetail = function () {
        if (universe.interfaceSettings.showFleetNavEtaDetail) {
            universe.interfaceSettings.showFleetNavEtaDetail = false;
        } else {
            universe.interfaceSettings.showFleetNavEtaDetail = true;
        }
        np.trigger("show_screen", "fleet");
    };

    //--------------------------------------------------------------------------
    np.onRestoreConcededPlayer = function (event, puid) {
        np.trigger("server_request", {type: "order", order: "restore_conceded_player," + puid});
        np.trigger("show_screen", "options");
    };

    np.onSelectPlayerForGift = function (event, data) {
        var screenConfig = {
            name: "select_player",
            body: "select_player_for_gift",
            returnScreen: "leaderboard",
            selectionEvent: "select_player_for_gift_selected",
            playerFilter: []
        };

        np.trigger("show_screen", ["select_player", screenConfig]);
    };
    np.onSelectPlayerForGiftSelected = function (event, data) {
        var player  = universe.galaxy.players[data];
        universe.selectPlayer(player);
        np.trigger("show_screen", "buy_gift");
    };

    np.onSelectPlayerForPremiumGift = function (event, data) {
        var screenConfig = {
            name: "select_player",
            body: "select_player_for_gift",
            returnScreen: "leaderboard",
            selectionEvent: "select_player_for_premium_gift_selected",
            playerFilter: []
        };

        np.trigger("show_screen", ["select_player", screenConfig]);
    };
    np.onSelectPlayerForPremiumGiftSelected = function (event, data) {
        var player  = universe.galaxy.players[data];
        universe.selectPlayer(player);
        np.trigger("show_screen", "buy_premium_gift");
    };

    //--------------------------------------------------------------------------
    universe.colorBlindHelper = false;
    np.toggleColourBlindHelp = function () {
        if (universe.empireNameHelper) {
            universe.empireNameHelper = false;
        }
        if (universe.colorBlindHelper) {
            universe.colorBlindHelper  = false;
        } else {
            universe.colorBlindHelper = true;
        }
        np.trigger("map_refresh");
        np.trigger("rebuild_player_icons");
    };


    //--------------------------------------------------------------------------
    np.validateFleetStarName = function (name) {
        function invalid(){
            np.trigger("hide_screen");
            var screenConfig = {
                message: "notification_bad_fleet_star_name",
                eventKind: "",
                eventData: {},
                notification: true
            };
            np.trigger("show_screen",  ["confirm", screenConfig]);
            return "";
        }

        name = name.trim();
        name = name.replace(/[^a-z0-9_ ]/gi, '');

        if (/^\d+$/.test(name)){
            // may not be numbers only.
            return invalid();
        }
        if (name.length < 3 || name.length > 24){
            return invalid();
        }
        var p;
        for (p in universe.galaxy.stars){
            if (universe.galaxy.stars[p].n == name){
                return invalid();
            }
        }
        for (p in universe.galaxy.fleets){
            if (universe.galaxy.fleets[p].n == name){
                return invalid();
            }
        }
        return name;
    };

    //--------------------------------------------------------------------------

    if (universe.movieMode) {
        np.smootScrollTarget = 0;
        np.smoothScroll = function (e, direction) {
            e.preventDefault();
            Crux.createAnim(np, "smootScrollTarget", np.smootScrollTarget, np.smootScrollTarget + 256 * direction, 500);
        };
        np.draw = function () {
            window.scroll(0, np.smootScrollTarget);
        };
        Crux.tickCallbacks.push(np.draw);
    }

    np.onScreenShotMiniMap = function () {
        np.trigger("map_center", {x:0, y:0});
        npui.status.hide();
        npui.playerIcons.hide();
        if (npui.tmContainer){
            npui.tmContainer.hide();
        }
    };

    np.onBuyGift = function (e, item) {
        np.trigger("server_request", {type: "buy_gift", kind: item.icon, puid: item.puid});

        NeptunesPride.account.credits -= item.amount;

        var achievements, key;
        if (universe.playerAchievements) {
            achievements = universe.playerAchievements[item.puid];
        }
        for (key in npui.badgeFileNames) {
            if (npui.badgeFileNames[key] === item.icon) {
                achievements.badges += key;
            }
        }

        var screenConfig = {
            message: "notification_gift_purchase",
            messageTemplateData: item,
            eventKind: "show_screen",
            eventData: "empire",
            notification: true
        };
        np.trigger("show_screen",  ["confirm", screenConfig]);

    };

    //--------------------------------------------------------------------------
    // Sounds
    //--------------------------------------------------------------------------

   if (universe.interfaceSettings.audio) {
        np.soundFormats = {
            formats: ["ogg", "mp3"],
            preload: true,
            autoplay: false,
            loop: false,
            volume: 50
        };
        np.sounds = {};
        np.sounds["screen_open"] = new buzz.sound("/sounds/Button_10", np.soundFormats);
        np.sounds["selection_open"] = new buzz.sound("/sounds/Button_11", np.soundFormats);
        np.sounds["alt_open"] = new buzz.sound("/sounds/Button_26", np.soundFormats);
        np.sounds["ok"] = new buzz.sound("/sounds/Chirp_08", np.soundFormats);
        np.sounds["cancel"] = new buzz.sound("/sounds/Click_77", np.soundFormats);
        np.sounds["add"] = new buzz.sound("/sounds/Button_02", np.soundFormats);
        np.sounds["subtract"] = new buzz.sound("/sounds/Button_03", np.soundFormats);
        np.sounds["zoom"] = new buzz.sound("/sounds/Rollover_22", np.soundFormats);
    }

    np.onPlaySound = function (even, sound) {
        if (np.sounds[sound]){
            np.sounds[sound].stop();
            np.sounds[sound].play();
        }
    };

    //--------------------------------------------------------------------------
    // Keyboard Shortcuts
    //--------------------------------------------------------------------------

    Mousetrap.bind(["="], function () {np.trigger("zoom_in");});
    Mousetrap.bind(["-"], function () {np.trigger("zoom_out");});
    Mousetrap.bind(["z", "Z"], function () {np.trigger("zoom_minimap");});
    Mousetrap.bind(["0"], function () {np.trigger("zoom_minimap");});

    Mousetrap.bind(["w", "W"], function () {np.trigger("edit_waypoint_keyboard");});

    Mousetrap.bind(["q", "Q"], function () {np.trigger("start_quick_upgrade");});
    Mousetrap.bind(["v", "V"], function () {np.trigger("start_ruler");});
    Mousetrap.bind(["h", "H"], function () {np.trigger("select_player", [universe.player.uid, true]);});

    Mousetrap.bind(["g", "G"], function () {np.trigger("show_screen", "intel");});

    Mousetrap.bind(["s", "S"], function () {np.trigger("show_screen", "star_dir");});
    Mousetrap.bind(["f", "F"], function () {np.trigger("show_screen", "fleet_dir");});

    Mousetrap.bind(["l", "L"], function () {np.trigger("show_screen", "leaderboard");});

    Mousetrap.bind(["c", "C"], function () {np.trigger("show_screen", "combat_calculator");});

    Mousetrap.bind(["n", "N"], function () {np.trigger("show_screen", "compose");});
    Mousetrap.bind(["i", "I"], function () {np.trigger("show_screen", "inbox");});

    Mousetrap.bind(["o", "O"], function () {np.trigger("show_screen", "options");});
    Mousetrap.bind(["t", "T"], function () {np.trigger("show_screen", "tech");});
    Mousetrap.bind(["r", "R"], function () {np.trigger("show_screen", "tech");});

    Mousetrap.bind(["left"], function () {np.trigger("key_left");});
    Mousetrap.bind(["right"], function () {np.trigger("key_right");});

    Mousetrap.bind(["down"], function () {universe.defaultFleetOrderOverride = 2; }, "keydown");
    Mousetrap.bind(["down"], function () {universe.defaultFleetOrderOverride = 0; }, "keyup");

    Mousetrap.bind(["up"], function () {universe.defaultFleetOrderOverride = 1; }, "keydown");
    Mousetrap.bind(["up"], function () {universe.defaultFleetOrderOverride = 0; }, "keyup");

    universe.selectionModifier = false;
    Mousetrap.bind(["alt"], function () {universe.selectionModifier = true; }, "keydown");
    Mousetrap.bind(["alt"], function () {universe.selectionModifier = false; }, "keyup");
    jQuery(window).blur(function() { universe.selectionModifier = false; });

    Mousetrap.bind(["b", "B"], np.toggleColourBlindHelp);

    Mousetrap.bind(["u"], function () {
        window.location.href = document.getElementsByTagName("canvas")[0].toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
    });


    if (universe.movieMode) {
        Mousetrap.bind(["down"], function (e) {np.smoothScroll(e, 1);});
        Mousetrap.bind(["up"], function (e) {np.smoothScroll(e, -1);});
    }

    Mousetrap.bind("esc", function () {
        np.trigger("hide_screen");
        np.trigger("cancel_fleet_orders");
        np.trigger("end_ruler");
    });

    //--------------------------------------------------------------------------
    // internal events.
    //--------------------------------------------------------------------------

    if (universe.interfaceSettings.audio) {
        np.on("play_sound", np.onPlaySound);
    }

    np.on("select_player", np.onSelectPlayer);
    np.on("select_player_pre_join", np.onSelectPlayerPreJoin);

    np.on("select_player_for_gift", np.onSelectPlayerForGift);
    np.on("select_player_for_gift_selected", np.onSelectPlayerForGiftSelected);

    np.on("select_player_for_premium_gift", np.onSelectPlayerForPremiumGift);
    np.on("select_player_for_premium_gift_selected", np.onSelectPlayerForPremiumGiftSelected);


    np.on("select_star", np.onSelectStar);
    np.on("show_star", np.onShowStar);
    np.on("select_fleet", np.onSelectFleet);

    np.on("show_fleet_path", np.onShowFleetPath);


    np.on("show_star_uid", np.onShowStarUid);
    np.on("show_star_screen_uid", np.onShowStarScreenUid);

    np.on("show_fleet_uid", np.onShowFleetUid);
    np.on("show_fleet_screen_uid", np.onShowFleetScreenUid);

    np.on("show_player_uid", np.onShowPlayerUid);
    np.on("show_your_empire", np.onShowYourEmpire);

    np.on("join_game", np.onJoinGame);

    np.on("leave_game", np.onLeaveGame);

    np.on("upgrade_economy", np.onUpgradeEconomy);
    np.on("upgrade_industry", np.onUpgradeIndustry);
    np.on("upgrade_science", np.onUpgradeScience);
    np.on("bulk_upgrade", np.onBulkUpgrade);

    np.on("buy_warp_gate", np.onBuyWarpGate);
    np.on("destroy_warp_gate", np.onDestroyWarpGate);

    np.on("abandon_star", np.onAbandonStar);

    np.on("declare_war", np.onDeclareWar);
    np.on("request_peace", np.onRequestPeace);
    np.on("unrequest_peace", np.onUnRequestPeace);
    np.on("accept_peace", np.onAcceptPeace);

    np.on("star_dir_upgrade_e", np.onStarDirectoryEconomy);
    np.on("star_dir_upgrade_i", np.onStarDirectoryIndustry);
    np.on("star_dir_upgrade_s", np.onStarDirectoryScience);
    np.on("star_dir_row_hilight", np.onStarDirectoryRowHHilight);

    np.on("share_tech", np.onShareTech);
    np.on("send_money", np.onSendMoney);
    np.on("give_star", np.onGiveStar);

    np.on("buy_gift", np.onBuyGift);

    np.on("toggle_fleet_nav_eta_detail", np.onToggleFleetNavEtaDetail);

    np.on("select_gather_all_ships", np.onSelectAndGatherAllShips);
    np.on("gather_all_ships", np.onGatherAllShips);

    np.on("award_karma", np.onAwardKarma);

    np.on("ship_transfer", np.onShipTransfer);
    np.on("new_fleet", np.onNewFleet);

    np.on("map_clicked", np.onMapClicked);
    np.on("map_middle_clicked", np.onMapMiddleClicked);

    np.on("reset_edit_mode", np.onResetEditMode);

    np.on("edit_waypoint_keyboard", np.onEditWaypointKeyboard);
    np.on("start_edit_waypoints", np.onStartEditWaypoints);
    np.on("add_waypoint", np.onAddWaypoint);
    np.on("remove_waypoint", np.onRemoveWaypoint);
    np.on("clear_waypoints", np.onClearWaypoints);

    np.on("submit_fleet_orders", np.onSubmitFleetOrders);
    np.on("submit_fleet_orders_edit", np.onSubmitFleetOrdersEdit);
    np.on("submit_fleet_orders_test_loop", np.onSubmitFleetOrdersTestLoop);

    np.on("loop_submit_fleet_orders", np.onLoopSubmitFleetOrders);

    np.on("cancel_fleet_orders", np.onCancelFleetOrders);

    np.on("loop_fleet_orders", np.onLoopFleetOrders);
    np.on("loop_fleet_orders_off", np.onLoopFleetOrdersOff);

    np.on("start_quick_upgrade", np.onStartQuickUpgrade);
    np.on("end_quick_upgrade", np.onEndQuickUpgrade);

    np.on("start_ruler", np.onStartRuler);
    np.on("reset_ruler", np.onResetRuler);
    np.on("end_ruler", np.onEndRuler);

    np.on("change_research", np.onChangeResearch);
    np.on("change_research_next", np.onChangeResearchNext);

    np.on("star_dir_sort" , np.onStarDirSort);
    np.on("star_dir_filter" , np.onStarDirFilter);

    np.on("fleet_dir_sort" , np.onFleetDirSort);
    np.on("fleet_dir_filter" , np.onFleetDirFilter);

    np.on("ship_dir_sort" , np.onShipDirSort);
    np.on("ship_dir_filter" , np.onShipDirFilter);

    np.on("rename_fleet" , np.onRenameFleet);
    np.on("rename_star" , np.onRenameStar);


    np.on("show_help" , np.onShowHelp);

    np.on("one_second_tick", np.onOneSecondTick);

    np.on("turn_ready", np.onTurnReady);

    np.on("restore_conceded_player", np.onRestoreConcededPlayer);

    np.on("browse_to", np.onBrowseTo);

    np.on("intel_selection_change", np.onIntelSelectionChange);
    np.on("intel_player_filter_change", np.onIntelPlayerFilterChange);
    np.on("intel_player_filter_all", np.onIntelPlayerFilterAll);
    np.on("intel_player_filter_none", np.onIntelPlayerFilterNone);
    np.on("intel_request", np.onRequestIntelData);

    np.on("show_intel", np.onShowIntel);

    //--------------------------------------------------------------------------
    np.on("server_request", np.onServerRequest);

    //--------------------------------------------------------------------------
    // server responses
    //--------------------------------------------------------------------------
    np.on("order:post_join_game", np.onPostJoinGame);
    np.on("order:post_leave_game", np.onPostLeaveGame);
    np.on("order:new_fleet", np.onNewFleetResponse);
    np.on("order:full_universe", np.onFullUniverse);
    np.on("order:ok", np.onOK);
    np.on("order:redirect", np.onBrowseTo);
    np.on("order:player_achievements", np.onNewPlayerAchievements);
    np.on("order:intel_data", np.onIntelDataRecieved);

    np.on("order:error", np.onError);
    np.on("order:api_code", np.onAPICode);

    window.addEventListener("unload", np.onUnloaded, false);
    window.addEventListener("pagehide", np.onUnloaded, false);
    return np;

};
})();

