/*globals jQuery:true, Crux: true */
if (!NeptunesPride) {var NeptunesPride = {};}
(function () {
NeptunesPride.Interface = function (universe, inbox) {
    "use strict";

    var npui = Crux.Widget()
        .style("fullscreen")
        .roost(Crux.crux);

    //--------------------------------------------------------------------------
    // UI Elements
    //--------------------------------------------------------------------------
    npui.Screen = function (title, subTitle) {
        var screen = Crux.Widget("rel col_base no_overflow");
        screen.size(480, 0);
        screen.yOffset = npui.screenTop;

        screen.footerRequired = true;

        screen.bg = Crux.Widget("rel")
            .size(480, 48)
            .roost(screen);

        screen.heading = Crux.Text(title, "screen_title")
            .roost(screen.bg);

        screen.closeButton = Crux.IconButton("icon-cancel", "hide_screen")
            .grid(27, 0, 3, 3)
            .roost(screen.bg);

        screen.roost = function (mum) {
            // override roost to ensure a footer is always added.
            if (screen.footerRequired) {
                screen.addFooter();
            }
            mum.addChild(screen);
            screen.postRoost();
            return screen;
        };

        screen.addFooter = function () {
            screen.footer = Crux.Widget("rel")
                .roost(screen);

            Crux.Widget("col_accent rel")
                .size(480, 8)
                .roost(screen.footer);

            // this area allows the windows to be scrolled an additional 48 px.
            Crux.Widget("col_black rel")
                .size(480, 8)
                .roost(screen.footer);

        };

        return screen;
    };
    npui.SelectPlayerScreen = function (screenConfig) {
        var selectPlayerScreen = npui.Screen("select_player");
        var p, el, player;

        Crux.Button("cancel", "show_screen", screenConfig.returnScreen)
            .grid(20,0,10,3)
            .roost(selectPlayerScreen);

        Crux.Text(screenConfig.body, "pad12 col_grey rel")
            .roost(selectPlayerScreen);

        for (p in universe.galaxy.players) {
            player = universe.galaxy.players[p];
            if (player.alias !== "" &&
                    screenConfig.playerFilter.indexOf(player.uid) < 0) {

                el = npui.PlayerNameIconRow(universe.galaxy.players[p])
                    .roost(selectPlayerScreen);

                el.addStyle("player_cell");

                Crux.Button("select", screenConfig.selectionEvent, player.uid)
                    .grid(20,0,10,3)
                    .roost(el);
            }
        }

        selectPlayerScreen.addFooter();
        return selectPlayerScreen;
    };
    npui.PlayerNameIconRow = function (player) {
        var playerNameIconRow = Crux.Widget("rel col_black")
            .size(480, 48);

        npui.PlayerIcon(player, true)
            .roost(playerNameIconRow);

        Crux.Text("", "section_title")
            .grid(6, 0, 21, 3)
            .rawHTML(player.alias)
            .roost(playerNameIconRow);

        return playerNameIconRow;
    };
    npui.PlayerPanel = function (player, showEmpire) {
        var playerPanel = Crux.Widget("rel")
            .size(480, 264-8 + 48);

        var heading = "player";
        if (universe.playerAchievements && NeptunesPride.gameConfig.anonymity === 0){
            if (universe.playerAchievements[player.uid]){
                if (universe.playerAchievements[player.uid].premium === "premium") {
                    heading = "premium_player";
                }
                if (universe.playerAchievements[player.uid].premium === "lifetime") {
                    heading = "lifetime_premium_player";
                }

            }
        }

        Crux.Text(heading, "section_title col_black")
            .grid(0, 0, 30, 3)
            .roost(playerPanel);

        if (player.ai) {
            Crux.Text("ai_admin", "txt_right pad12")
                .grid(0, 0, 30, 3)
                .roost(playerPanel);
        }

        Crux.Image("../images/avatars/160/" + player.avatar + ".jpg", "abs")
            .grid(0, 6, 10, 10)
            .roost(playerPanel);

        Crux.Widget("pci_48_" + player.uid )
            .grid(7, 13, 3, 3)
            .roost(playerPanel);

        Crux.Widget("col_accent")
            .grid(0, 3, 30, 3)
            .roost(playerPanel);

        Crux.Text("", "screen_subtitle")
            .grid(0, 3, 30, 3)
            .rawHTML(player.qualifiedAlias)
            .roost(playerPanel);

        var myAchievements;
        if (universe.playerAchievements) {
            myAchievements = universe.playerAchievements[player.uid];
        }
        if (myAchievements) {
            npui.SmallBadgeRow(myAchievements.badges)
                .grid(0, 3, 30, 3)
                .roost(playerPanel);
        }


        Crux.Widget("col_black")
            .grid(10, 6, 20, 3)
            .roost(playerPanel);

        Crux.Text ("you", "pad12 txt_center")
            .grid(25, 6, 5, 3)
            .roost(playerPanel);

        // Labels
        Crux.Text("total_stars", "pad8")
            .grid(10, 9, 15, 3)
            .roost(playerPanel);

        Crux.Text("total_fleets", "pad8")
            .grid(10, 11, 15, 3)
            .roost(playerPanel);

        Crux.Text("total_ships", "pad8")
            .grid(10, 13, 15, 3)
            .roost(playerPanel);

        Crux.Text("new_ships", "pad8")
            .grid(10, 15, 15, 3)
            .roost(playerPanel);

        // This players stats
        if (player !== universe.player) {
            Crux.Text("", "pad8 txt_center")
                .grid(20, 9, 5, 3)
                .rawHTML(player.total_stars)
                .roost(playerPanel);

            Crux.Text("", "pad8 txt_center")
                .grid(20, 11, 5, 3)
                .rawHTML(player.total_fleets)
                .roost(playerPanel);

            Crux.Text("", "pad8 txt_center")
                .grid(20, 13, 5, 3)
                .rawHTML(player.total_strength)
                .roost(playerPanel);

            Crux.Text("",  "pad8 txt_center")
                .grid(20, 15, 5, 3)
                .rawHTML(player.shipsPerTick)
                .roost(playerPanel);
        }

        function selectHilightStyle(p1, p2) {
            p1 = Number(p1);
            p2 = Number(p2);
            if (p1 < p2) return " txt_warn_bad";
            if (p1 > p2) return " txt_warn_good";
            return "";
        }

        // Your stats
        if (universe.player) {

            Crux.Text("", "pad8 txt_center " + selectHilightStyle(universe.player.total_stars, player.total_stars))
                .grid(25, 9, 5, 3)
                .rawHTML(universe.player.total_stars)
                .roost(playerPanel);

            Crux.Text("", "pad8 txt_center" + selectHilightStyle(universe.player.total_fleets, player.total_fleets))
                .grid(25, 11, 5, 3)
                .rawHTML(universe.player.total_fleets)
                .roost(playerPanel);

            Crux.Text("", "pad8 txt_center" + selectHilightStyle(universe.player.total_strength, player.total_strength))
                .grid(25, 13, 5, 3)
                .rawHTML(universe.player.total_strength)
                .roost(playerPanel);

            Crux.Text("",  "pad8 txt_center" + selectHilightStyle(universe.player.shipsPerTick, player.shipsPerTick))
                .grid(25, 15, 5, 3)
                .rawHTML(universe.player.shipsPerTick)
                .roost(playerPanel);
        }




        Crux.Widget("col_accent")
            .grid(0, 16, 10, 3)
            .roost(playerPanel);

        if (universe.player) {
            var msgBtn = Crux.IconButton("icon-mail", "inbox_new_message_to_player", player.uid)
                .grid(0, 16, 3, 3)
                .disable()
                .roost(playerPanel);
            if (player !== universe.player && player.alias) {
                msgBtn.enable();
            }

            Crux.IconButton("icon-chart-line", "show_intel", player.uid)
                .grid(2.5, 16, 3, 3)
                .roost(playerPanel);

            if (showEmpire) {
                Crux.IconButton("icon-eye", "show_screen", "empire")
                    .grid(7, 16, 3, 3)
                    .roost(playerPanel);
            }
        }

        return playerPanel;
    };

    //--------------------------------------------------------------------------
    npui.ConfirmScreen = function (screenConfig) {
        var heading = "are_you_sure";
        if (screenConfig.notification){
            heading = "attention";
        }

        var confirmScreen = npui.Screen(heading);

        var bdy = Crux.Text(screenConfig.message, "rel pad12 txt_center col_accent txt_selectable")
            .size(480)
            .roost(confirmScreen);

        if (screenConfig.messageTemplateData) {
            bdy.format(screenConfig.messageTemplateData);
        }

        var bg = Crux.Widget("rel col_body")
            .size(480, 80)
            .roost(confirmScreen);

        var okLabel = "ok";
        var cancelLabel = "cancel";
        if (screenConfig.yesNoLabels) {
            okLabel = "yes";
            cancelLabel = "no";
        }

        if (screenConfig.notification) {
            Crux.Button(okLabel, "pre_confirm_ok")
                .grid(10, 1, 10, 3)
                .roost(bg);
        } else {
            Crux.Button(cancelLabel, "pre_confirm_cancel")
                .grid(5, 1, 10, 3)
                .roost(bg);

            Crux.Button(okLabel, "pre_confirm_ok")
                .grid(15, 1, 10, 3)
                .roost(bg);
        }
        confirmScreen.onPreCancel = function () {
            npui.trigger("hide_screen");
            if (screenConfig.returnScreen) {
                npui.trigger("show_screen", screenConfig.returnScreen);
            }
            if (screenConfig.cancelEventKind) {
                npui.trigger(screenConfig.cancelEventKind, screenConfig.cancelEventData);
            }
        };

        confirmScreen.onPreOk = function () {
            npui.trigger("hide_screen");
            npui.trigger("play_sound", "ok");
            if (screenConfig.eventKind) {
                npui.trigger(screenConfig.eventKind, screenConfig.eventData);
            }
            if (screenConfig.returnScreen) {
                npui.trigger("show_screen", screenConfig.returnScreen);
            }
        };
        confirmScreen.on("pre_confirm_ok", confirmScreen.onPreOk);
        confirmScreen.on("pre_confirm_cancel", confirmScreen.onPreCancel);
        return confirmScreen;
    };
    //--------------------------------------------------------------------------
    npui.FleetOrderConfirm = function () {
        var fleetOrderConfirm = Crux.Widget("selmenu_cell col_accent");
        fleetOrderConfirm.size(480);
        fleetOrderConfirm.yOffset = npui.screenTop;

        var i, path = [], pathString = "", templateData = {}, html;

        console.log("selected Fleet orders! ", universe.selectedFleet)

        for (i = 0; i < universe.selectedFleet.path.length; i++) {
            var star = universe.galaxy.stars[universe.selectedFleet.orders[i][1]];
            if (!star) {
                path.push("(?)");
                continue;
            }

            html = "&nbsp;"+star.n;
            if (universe.selectedFleet.orders[i][2] === 0) {
                html += " <b><em>!</em></b>";
            }

            if (universe.selectedFleet.orders[i][2] === 1) {
                // collect all is the default and does not need an icon.
                // html += " <span class='icon-up-open'></span>";
            }

            if (universe.selectedFleet.orders[i][2] === 2) {
                html += " <em><span class='icon-down-open'></span></em>";
            }

            if (universe.selectedFleet.orders[i][2] === 3) {
                html += " <em><span class='icon-up-open'></span>" + universe.selectedFleet.orders[i][3]+ "</em>";
            }

            if (universe.selectedFleet.orders[i][2] === 4) {
                html += " <em><span class='icon-down-open'></span>" + universe.selectedFleet.orders[i][3]+ "</em>";
            }

            if (universe.selectedFleet.orders[i][2] === 5) {
                html += "<em>" + universe.selectedFleet.orders[i][3] + "<span class='icon-up-open'></span></em> " ;
            }

            if (universe.selectedFleet.orders[i][2] === 6) {
                html += " <em>" + universe.selectedFleet.orders[i][3] + "<span class='icon-down-open'></span> </em>" ;
            }

            if (universe.selectedFleet.orders[i][2] === 7) {
                html += " <em><span class='icon-light-up'></span>" + universe.selectedFleet.orders[i][3] + "</em>";
            }
            path.push(html);
        }

        pathString = path.join(", ");
        if (universe.selectedFleet.loop){
            pathString += " <em><span class='icon-loop'></span></em>";
        }

        templateData["path"] = pathString;

        Crux.Text("path", "rel pad12 minh72")
            .size(432)
            .format(templateData)
            .roost(fleetOrderConfirm);

        Crux.IconButton("icon-cancel", "cancel_fleet_orders")
            .grid(27,0,3,3)
            .roost(fleetOrderConfirm);


        fleetOrderConfirm.bg = Crux.Widget("col_base")
            .size(480, 48)
            .roost(fleetOrderConfirm);

       fleetOrderConfirm.eta =  Crux.Text("", "pad12")
            .grid(0,0,30,3)
            .roost(fleetOrderConfirm.bg);

        Crux.IconButton("icon-minus-circled", "remove_waypoint")
            .grid(17.5-5,0,3,3)
            .roost(fleetOrderConfirm.bg);

        Crux.IconButton("icon-cancel-circled", "clear_waypoints")
            .grid(17.5-2.5,0,3,3)
            .roost(fleetOrderConfirm.bg);

        Crux.Button("save", "submit_fleet_orders_test_loop")
            .grid(17.5, 0, 5, 3)
            .roost(fleetOrderConfirm.bg);

        Crux.Button("save_edit", "submit_fleet_orders_edit")
            .grid(22, 0, 8, 3)
            .roost(fleetOrderConfirm.bg);

        fleetOrderConfirm.onOneSecondTick = function () {
                if (universe.selectedFleet.path.length === 0) {
                    fleetOrderConfirm.eta.hide();
                } else {
                    fleetOrderConfirm.eta.show();
                }

                fleetOrderConfirm.eta.updateFormat("total_eta_single", {
                    etaFirst: universe.timeToTick(universe.selectedFleet.eta)
                });

        };
        fleetOrderConfirm.onOneSecondTick();
        fleetOrderConfirm.on("one_second_tick", fleetOrderConfirm.onOneSecondTick);

        return fleetOrderConfirm;
    };
    npui.SelectionMenu = function () {
        var el, i, row;
        var selectionMenu = Crux.Widget();
        selectionMenu.yOffset = npui.screenTop;

        selectionMenu.size(480, (universe.possibleSelections.length * 3.5 * Crux.gridSize) + 8);

        if (!universe.player) {
            return selectionMenu;
        }

        selectionMenu.rows = [];
        for (i = universe.possibleSelections.length - 1; i >= 0; i--) {
            row = Crux.Widget("col_base selmenu_cell anim_fast")
                .size(480, 48)
                .roost(selectionMenu);

            selectionMenu.rows.push(row);

            if (universe.possibleSelections[i].player) {
                Crux.Widget("bgpc_" + universe.possibleSelections[i].player.colorIndex)
                    .grid(0, 0, 0.5, 3)
                    .roost(row);
            }

            if (universe.possibleSelections[i].kind === "fleet") {
                var fleet = universe.possibleSelections[i];

                var btn = Crux.Clickable("show_fleet_path", fleet)
                    .grid(7.5, 0, 12.5, 3)
                    .roost(row);

                Crux.Text("", "pad12")
                    .grid(0, 0, 12.5, 3)
                    .rawHTML(fleet.n)
                    .roost(btn);

                Crux.Text("", "pad12 txt_center col_accent")
                    .grid(3.75, 0, 3.75, 3)
                    .rawHTML(fleet.st)
                    .roost(row);

                Crux.Text("", "pad12 icon_button icon-rocket")
                    .grid(0.5, 0, 3, 3)
                    .rawHTML("")
                    .roost(row);

                if (fleet.player === universe.player) {
                    var pl = fleet.path.length;
                    if (fleet.loop){
                        pl += " <span class='icon-loop'></span>";
                    }
                    if (fleet.path.length){
                        Crux.Text("", "pad12 txt_right")
                            .rawHTML(pl)
                            .grid(16, 0, 4, 3)
                            .roost(row);
                    }

                    if (fleet.orbiting && fleet.orbiting.player){
                        if (fleet.orbiting.player.uid === universe.player.uid) {
                            Crux.IconButton("icon-down-open", "show_ship_transfer", {fleet: fleet})
                                .grid(19.5, 0, 3, 3)
                                .roost(row);
                        }
                    }

                    Crux.IconButton("icon-plus-circled", "start_edit_waypoints", {fleet: fleet})
                        .grid(22, 0, 3, 3)
                        .roost(row);

                }

                Crux.Button("view")
                    .grid(24.5, 0, 5.5, 3)
                    .click("select_fleet", {fleet: fleet})
                    .roost(row);

            }

            if (universe.possibleSelections[i].kind === "star") {
                var star = universe.possibleSelections[i];
                Crux.Text("", "pad12")
                    .grid(7.5, 0, 12.5, 3)
                    .rawHTML(star.n)
                    .roost(row);

                Crux.Text("", "pad12 txt_center col_accent")
                    .grid(3.75, 0, 3.75, 3)
                    .rawHTML(star.st)
                    .roost(row);

                Crux.Text("", "pad12 icon_button icon-star-1")
                    .grid(0.5, 0, 18, 3)
                    .rawHTML("")
                    .roost(row);

                if (universe.player.cash >= 25 && star.st > 0 && universe.player === star.player) {
                    Crux.IconButton("icon-rocket", "show_screen", ["new_fleet", star])
                        .grid(22, 0, 3, 3)
                        .roost(row);
                }

                if (universe.player === star.player && star.fleetsInOrbit.length > 0) {
                    Crux.IconButton("icon-up-open", "select_gather_all_ships", star)
                        .grid(19.5, 0, 3, 3)
                        .roost(row);
                }

                Crux.Button("view")
                    .grid(24.5, 0, 5.5, 3)
                    .click("select_star", {star: star})
                    .roost(row);
            }
        }

        selectionMenu.animate = function () {
            var ypos = 0;
            var row;
            for (i = selectionMenu.rows.length - 1; i >= 0; i--) {
                row = selectionMenu. rows[i];
                row.pos(0, ypos);
                ypos += 52;
            }
        };
        window.setTimeout(selectionMenu.animate, 1);

        return selectionMenu;
    };
    //--------------------------------------------------------------------------
    npui.PlayerIcon = function (player, horizontal) {
        var playerIcon = Crux.Clickable("select_player", player.uid)
            .size(60,60);

        if (horizontal) {
            Crux.Widget("col_black")
                .grid(0, 0, 3, 3)
                .roost(playerIcon);

            Crux.Widget("pci_48_" + player.uid )
                .grid(0, 0, 3, 3)
                .roost(playerIcon);

            Crux.Image("../images/avatars/160/" + player.avatar + ".jpg", "abs")
                .grid(3, 0, 3, 3)
                .roost(playerIcon);

        } else {
            // vertical
            Crux.Widget("bgpc_" + player.colorIndex)
                .grid(0, 3.75, 3.75, 0.5)
                .roost(playerIcon);

            Crux.Image("../images/avatars/160/" + player.avatar + ".jpg", "abs")
                .grid(0, 0, 3.75, 3.75)
                .roost(playerIcon);

            if (universe.colorBlindHelper) {
                Crux.Text("", "txt_center txt_tiny col_black")
                    .grid(0, 2, 3.75, 1.75)
                    .rawHTML(player.colorName)
                    .roost(playerIcon);
            }
            if (universe.empireNameHelper) {
                Crux.Text("", "txt_center txt_tiny col_black no_overflow")
                    .grid(0, 2, 3.75, 1.75)
                    .rawHTML(player.alias)
                    .roost(playerIcon);
            }

        }

        return playerIcon;
    };
    npui.PlayerIcons = function () {
        var playerIcons = Crux.Widget();
        playerIcons.yOffset = 48;

        Crux.Widget("col_black")
            .grid(0, 0, 30, 4.75)
            .roost(playerIcons);

        var icon, i, p;

        playerIcons.width = 480;
        playerIcons.size(playerIcons.width, 48);

        playerIcons.icons = [];

        playerIcons.addIcon = function (player, xpos) {
            icon = npui.PlayerIcon(player);
            icon.pos(xpos, 0);
            icon.style("clickable anim_fast col_accent rad4");

            icon.selected = false;
            icon.uid = player.uid;

            playerIcons.addChild(icon);
            playerIcons.icons.push(icon);
        };

        i = 0;
        var xOffset = (480 - (NeptunesPride.gameConfig.players * 60))/2;

        if (universe.galaxy.players) {
            for (p in universe.galaxy.players) {
                playerIcons.addIcon(universe.galaxy.players[p], xOffset + (i * 60));
                i += 1;
            }
        }

        playerIcons.refresh = function () {
            if (universe.galaxy.players) {
                for (i = 0; i < playerIcons.icons.length; i += 1) {
                    if (playerIcons.icons[i].selected) {
                        playerIcons.icons[i].nudge(0, -8);
                        playerIcons.icons[i].selected = false;
                    }
                }
                for (i = 0; i < playerIcons.icons.length; i += 1) {
                    if (universe.selectedPlayer) {
                        if (universe.selectedPlayer.uid === playerIcons.icons[i].uid) {
                            if (!playerIcons.icons[i].selected) {
                                playerIcons.icons[i].nudge(0, 8);
                                playerIcons.icons[i].selected = true;
                            }
                        }
                    }
                }
            }
            return playerIcons;
        };

        if (universe.playerCount > 8) {
            playerIcons.hide();
        }
        return playerIcons;
    };

    //--------------------------------------------------------------------------
    npui.RulerToolbar = function () {
        var rulerToolbar = Crux.Widget("col_grey");
        rulerToolbar.grid(0,0,30,6);
        rulerToolbar.width = 480;
        rulerToolbar.yOffset = npui.screenTop;


        Crux.IconButton("icon-help", "show_help", "ruler")
            .grid(24.5, 0, 3, 3)
            .roost(rulerToolbar);

        Crux.Button("reset", "reset_ruler", "")
            .grid(19, 0, 6, 3)
            .roost(rulerToolbar);

        Crux.Text("ruler_toolbar_heading", "screen_title")
            .grid(0, 0, 15, 3)
            .format({eta: universe.timeToTick(universe.ruler.eta, true)})
            .roost(rulerToolbar);

        Crux.IconButton("icon-cancel", "end_ruler")
            .grid(27,0,3,3)
            .roost(rulerToolbar);

        Crux.Widget("col_base")
            .grid(0, 3, 30, 3)
            .roost(rulerToolbar);

        Crux.Text("ruler_toolbar_eta", "pad12")
            .grid(0, 3, 30, 3)
            .format({eta: universe.timeToTick(universe.ruler.eta, true)})
            .roost(rulerToolbar);

        Crux.Text("ruler_toolbar_range", "pad12 txt_center")
            .grid(0, 3, 30, 3)
            .format({range: universe.ruler.ly})
            .roost(rulerToolbar);

        Crux.Text("ruler_toolbar_tech", "pad12 txt_right")
            .grid(0, 3, 30, 3)
            .format({hs:universe.ruler.hsRequired})
            .roost(rulerToolbar);


        Crux.Text("total_without_gates", "pad12  col_accent ")
            .format({gateEta: universe.timeToTick(universe.ruler.baseEta, true)})
            .grid(0, 6, 30, 3)
            .roost(rulerToolbar);

        Crux.Text("total_with_gates", "pad12  txt_right")
            .format({gateEta: universe.timeToTick(universe.ruler.gateEta, true)})
            .grid(0, 6, 30, 3)
            .roost(rulerToolbar);


        return rulerToolbar;
    };
    npui.BuildInfToolbar = function () {
        var buildInfToolbar = Crux.Widget("col_grey");
        buildInfToolbar.grid(0,0,30,3);
        buildInfToolbar.width = 480;
        buildInfToolbar.yOffset = npui.screenTop;


        Crux.IconButton("icon-cancel", "end_quick_upgrade")
            .grid(27,0,3,3)
            .roost(buildInfToolbar);

        buildInfToolbar.heading = Crux.Text("quick_upgrade", "screen_title")
            .grid(0,0,27,3)
            .roost(buildInfToolbar);

        buildInfToolbar.instructions = Crux.Text("select_star_to_upgrade", "col_base pad12")
            .hide()
            .grid(0,3,30,3)
            .roost(buildInfToolbar);

        buildInfToolbar.bg = Crux.Widget("col_base")
            .grid(0,3,30,3)
            .roost(buildInfToolbar);

        var col = "col_accent";
        if (universe.player) {
            col = "bgpc_" + universe.player.colorIndex;
        }

        buildInfToolbar.colourIndicator = Crux.Widget(col)
            .grid(0, 0, 0.5, 3)
            .roost(buildInfToolbar.bg);

       Crux.Text("", "pad12 entypo icon-light-up")
            .grid(0.5, 0, 3, 3)
            .rawHTML("")
            .roost(buildInfToolbar.bg);

        buildInfToolbar.starName = Crux.Text("", "pad12")
            .grid(2.5,0,27,3)
            .roost(buildInfToolbar.bg);

        // upgrade buttons
        buildInfToolbar.ueb = Crux.IconButton("icon-dollar", "upgrade_economy")
            .grid(12,0,3,3)
            .roost(buildInfToolbar.bg);

        buildInfToolbar.uebl = Crux.Text("","pad12")
            .grid(14.25,0,3,3)
            .roost(buildInfToolbar.bg);

        buildInfToolbar.uib = Crux.IconButton("icon-tools", "upgrade_industry")
            .grid(18,0,3,3)
            .roost(buildInfToolbar.bg);

        buildInfToolbar.uibl = Crux.Text("","pad12")
            .grid(20.25,0,3,3)
            .roost(buildInfToolbar.bg);

        buildInfToolbar.usb = Crux.IconButton("icon-graduation-cap", "upgrade_science")
            .grid(24,0,3,3)
            .roost(buildInfToolbar.bg);

        buildInfToolbar.usbl = Crux.Text("","pad12")
            .grid(26.25,0,3,3)
            .roost(buildInfToolbar.bg);

        buildInfToolbar.refresh = function () {
            if (!universe.player) return;
            if (universe.editMode !== "quick_upgrade") {
                return;
            }

            if (!universe.selectedStar) {
                buildInfToolbar.bg.hide();
                buildInfToolbar.instructions.show();
                return;
            }

            if (universe.selectedStar.player !== universe.player){
                buildInfToolbar.bg.hide();
                buildInfToolbar.instructions.show();
                return;
            }

            buildInfToolbar.instructions.hide();

            buildInfToolbar.starName.rawHTML(universe.selectedStar.n);

            buildInfToolbar.ueb.enable();
            buildInfToolbar.uib.enable();
            buildInfToolbar.usb.enable();
            if (universe.player.cash - universe.selectedStar.uce < 0) {
                buildInfToolbar.ueb.disable();
            }
            if (universe.player.cash - universe.selectedStar.uci < 0) {
                buildInfToolbar.uib.disable();
            }
            if (universe.player.cash - universe.selectedStar.ucs < 0) {
                buildInfToolbar.usb.disable();
            }

            buildInfToolbar.ueb.show();
            buildInfToolbar.uib.show();
            buildInfToolbar.usb.show();

            if (universe.selectedStar.uce <= 0) {
                buildInfToolbar.ueb.hide();
            }
            if (universe.selectedStar.uci <= 0) {
                buildInfToolbar.uib.hide();
            }
            if (universe.selectedStar.ucs <= 0) {
                buildInfToolbar.usb.hide();
            }

            buildInfToolbar.uebl.rawHTML("$" + universe.selectedStar.uce);
            buildInfToolbar.uibl.rawHTML("$" + universe.selectedStar.uci);
            buildInfToolbar.usbl.rawHTML("$" + universe.selectedStar.ucs);
            buildInfToolbar.bg.show();
        };

        return buildInfToolbar;
    };
    //--------------------------------------------------------------------------
    npui.Status = function () {
        var status = Crux.Widget();
        status.size(480, 48);
        status.yOffset = 0;

        Crux.Widget("col_black")
            .grid(0, 0, 30, 3.5)
            .roost(status);

        Crux.Widget("col_base")
            .grid(0, 0, 30, 3)
            .roost(status);

        status.menuBtn = Crux.IconButton("icon-menu", "show_side_menu")
            .grid(0, 0, 3, 3)
            .roost(status);

        status.info = Crux.Text("status", "txt_center pad12")
            .grid(3, 0, 24, 3)
            .roost(status);

        status.inboxIconButton = Crux.IconButton("icon-mail", "show_inbox")
            .grid(27, 0, 3, 3)
            .roost(status);

        status.inboxButton = Crux.Text("1", "txt_center col_warning rad4")
            .grid(-0.25, -0.25, 2, 2)
            .nudge(12, 12, -8, -8)
            .roost(status.inboxIconButton);

        status.warning = Crux.Text("", "col_warning  txt_center pad12")
            .size(480)
            .pos(0, npui.screenTop)
            .roost(status);
        status.warning.hide();

        if (universe.interfaceSettings.showFirstTimePlayer) {
            status.ftpWarning = Crux.Widget()
                .size(480)
                .pos(0, npui.screenTop)
                .roost(status);

            if (universe.galaxy.turn_based) {
                status.ftpWarning.pos(0, npui.screenTop + 84);
            }

            Crux.Text("first_time_player", "rel col_base pad12")
                .roost(status.ftpWarning);

            Crux.IconButton("icon-cancel", "hide_ftp_warning")
                .grid(27, 0, 3, 3)
                .roost(status.ftpWarning);
        }


        status.onShow = function () {
            status.show();
        };

        status.onHide = function () {
            status.hide();
        };

        status.tickCount = 0;
        status.onOneSecondTick = function () {
            if (npui.sideMenu) {
                if (npui.sideMenu.pinned){
                    status.menuBtn.disable();
                } else {
                    status.menuBtn.enable();
                }
            }

            status.tickCount += 1;
            var tc = Number(inbox.unreadDiplomacy) +
                Number(inbox.unreadEvents);
            if (tc > 0 && status.tickCount % 2) {
                status.inboxButton.show();
                status.inboxButton.rawHTML(tc);
            } else {
                status.inboxButton.hide();
                status.inboxButton.rawHTML("");
            }

            if (universe.loading) {
                status.info.update("loading");
                return;
            }

            if (universe.galaxy.paused) {
                if (universe.player) {
                    status.info.update("inspector_info_player_paused");
                    status.info.format({
                        cash: universe.player.cash
                    });
                    return;
                } else {
                    status.info.update("paused");
                    return;
                }

            }

            if (universe.player) {
                status.info.update("inspector_info_player");
                status.info.format({
                    nextProduction: universe.timeToProduction,
                    cash: universe.player.cash
                });
            } else {
                status.info.update("inspector_info");
                status.info.format({
                    nextProduction: universe.timeToProduction
                });

            }


        };
        status.onOneSecondTick(); // call now to finish layout.

        status.onShowWarning = function (event, id) {
            console.log(id);
            if (Crux.templates[id]){
                status.warning.update(id);
            } else {
                status.warning.update("failed_order");
            }
            status.warning.show();
        };

        status.onHideWarning = function () {
            status.warning.hide();
        };

        status.onHideFTPWarning = function () {
            status.ftpWarning.hide();
            universe.setInterfaceSetting("showFirstTimePlayer", false);

        };

        status.onClick = function (e) {
            inbox.trigger("server_request", {type: "order", order:"full_universe_report"});
        };

        status.on("one_second_tick", status.onOneSecondTick);
        status.on("update_status", status.onOneSecondTick);
        status.on("show_warning", status.onShowWarning);
        status.on("hide_warning", status.onHideWarning);
        status.on("hide_ftp_warning", status.onHideFTPWarning);

        status.info.on("click", status.onClick, status.info);

        return status;
    };
    //--------------------------------------------------------------------------
    npui.TurnManager = function () {
        var turnManager = Crux.Widget("col_accent anim_mid")
            .size(480, 48);

        turnManager.yOffset = npui.screenTop;

        if (universe.galaxy.turnDue === null) {
            Crux.Text("game_not_started", "pad12 txt_right")
                .grid(10,0,20,0)
                .roost(turnManager);
        } else {
            if (universe.galaxy.paused) {
                Crux.Text("paused", "pad12 txt_right")
                    .grid(10,0,20,0)
                    .roost(turnManager);
            } else {
                Crux.Text("turn_deadline", "pad12 txt_right")
                    .grid(10,0,20,0)
                    .format({time:Crux.formatDate(universe.galaxy.turnDue)})
                    .roost(turnManager);
            }
        }

        turnManager.missedWarning = Crux.Text("missed_turns", "pad12 txt_warn_bad txt_center")
            .grid(0,3,30,0)
            .hide()
            .roost(turnManager);

            var screenConfig = {
                message: "sure_you_want_to_submit_turn",
                messageTemplateData: {},
                eventKind: "turn_ready",
                eventData: {}
            };

        turnManager.submitBtn = Crux.Button("submit_turn", "show_screen", ["confirm", screenConfig])
            .grid(0,0,10,3)
            .roost(turnManager);

        turnManager.onOneSecondTick = function () {
            if (!universe.player) {
                return;
            }
            if (universe.player.ready === 1) {
                turnManager.submitBtn.update("submitted");
                turnManager.submitBtn.disable();
            }
            if (universe.player.missed_turns && universe.player.ready !== 1) {
                turnManager.missedWarning.show();
                turnManager.missedWarning.format({turns:universe.player.missed_turns});
            } else {
                turnManager.missedWarning.hide();
            }

        };
        // run right away to init button
        turnManager.onOneSecondTick();

        turnManager.on("turn_ready", turnManager.onOneSecondTick);
        turnManager.on("one_second_tick", turnManager.onOneSecondTick);
        return turnManager;
    };
    //--------------------------------------------------------------------------
    npui.SideMenuToolBar = function () {
        var smt = Crux.Widget("rel")
            .size(172, 104);

        Crux.IconButton("icon-compass", "zoom_minimap")
            .grid(0, 0.5, 3, 3)
            .roost(smt);

        Crux.IconButton("icon-zoom-in", "zoom_in")
            .grid(2.5, 0.5, 3, 3)
            .roost(smt);

        Crux.IconButton("icon-zoom-out", "zoom_out")
            .grid(5, 0.5, 3, 3)
            .roost(smt);

        if (universe.player) {
            Crux.IconButton("icon-home", "select_player", [universe.player.uid, true])
                .grid(7.5, 0.5, 3, 3)
                .roost(smt);
        }


        Crux.IconButton("icon-myspace", "start_ruler")
            .grid(0, 3, 3, 3)
            .roost(smt);

        Crux.IconButton("icon-flash", "start_quick_upgrade")
            .grid(2.5, 3, 3, 3)
            .roost(smt);

        Crux.IconButton("icon-dollar", "show_screen", "bulk_upgrade")
            .grid(5, 3, 3, 3)
            .roost(smt);

        return smt;
    };
    npui.SideMenuItem = function (icon, label, event, data) {
        var smi = Crux.Clickable(event, data)
            .addStyle("rel side_menu_item")
            .configStyles("side_menu_item_up", "side_menu_item_down", "side_menu_item_hover", "side_menu_item_disabled")
            .size(172, 40);

        Crux.Text("", "pad12 txt_center")
            .addStyle(icon)
            .grid(0, -0.25, 3, 2.5)
            .rawHTML("")
            .roost(smi);

        Crux.Text(label, "pad12")
            .grid(2, -0.25, 8, 2.5)
            .roost(smi);

        return smi;
    };
    npui.SideMenu = function () {
        var sideMenu = Crux.Widget("col_accent side_menu")
            .size(172, 0);

        sideMenu.pinned = false;
        sideMenu.rows = 11;
        npui.sideMenuItemSize = 40;

        sideMenu.spacer = Crux.Widget("rel")
            .size(160, 48)
            .roost(sideMenu);

        sideMenu.showBtn = Crux.IconButton("icon-menu", "hide_side_menu")
            .grid(0,0,3,3)
            .roost(sideMenu);

        npui.SideMenuToolBar()
            .roost(sideMenu);

        npui.SideMenuItem("icon-users", "leaderboard", "show_screen", "leaderboard")
            .roost(sideMenu);

        npui.SideMenuItem("icon-beaker", "research", "show_screen", "tech")
            .roost(sideMenu);

        npui.SideMenuItem("icon-star-1", "galaxy", "show_screen", "star_dir")
            .roost(sideMenu);

        npui.SideMenuItem("icon-chart-line", "intel", "show_screen", "intel")
            .roost(sideMenu);

        npui.SideMenuItem("icon-cog-1", "options", "show_screen", "options")
            .roost(sideMenu);

        npui.SideMenuItem("icon-help", "help", "show_help", "index")
            .roost(sideMenu);

        npui.SideMenuItem("icon-left-open", "main_menu", "browse_to", "/")
            .roost(sideMenu);

        sideMenu.pin = function () {
            sideMenu.show();
            sideMenu.showBtn.hide();
            sideMenu.spacer.hide();
            sideMenu.pinned = true;
            sideMenu.addStyle("fixed");
        };

        sideMenu.unPin = function () {
            sideMenu.pinned = false;
            sideMenu.showBtn.show();
            sideMenu.spacer.show();
            sideMenu.removeStyle("fixed");
            sideMenu.hide();
        };


        sideMenu.onPopUp = function () {
            if (sideMenu.pinned) return;
            sideMenu.show();
            sideMenu.trigger("play_sound", "selection_open");
            sideMenu.trigger("hide_section_menu");
            sideMenu.trigger("hide_screen");
            sideMenu.trigger("cancel_fleet_orders");

        };

        sideMenu.onPopDown = function () {
            if (sideMenu.pinned) return;
            sideMenu.hide();
        };

        sideMenu.on("show_side_menu", sideMenu.onPopUp);
        sideMenu.on("hide_side_menu", sideMenu.onPopDown);

        sideMenu.on("unpin_side_menu", sideMenu.unPin);

        return sideMenu;
    };

    //--------------------------------------------------------------------------
    // event handlers
    //--------------------------------------------------------------------------
    npui.onShowFleetOrderConfirm = function () {
        if (npui.fleetOrderConfirm) {
            npui.removeChild(npui.fleetOrderConfirm);
        }
        npui.fleetOrderConfirm = npui.FleetOrderConfirm();
        npui.addChild(npui.fleetOrderConfirm);
        npui.layoutElement(npui.fleetOrderConfirm);
    };
    npui.onHideFleetOrderConfirm = function (event, data) {
        if (npui.fleetOrderConfirm) {
            npui.removeChild(npui.fleetOrderConfirm);
            npui.fleetOrderConfirm = null;
        }
    };
    npui.onShowSelectionMenu = function (event, data) {
        if (universe.editMode !== "normal") {
            return;
        }
        npui.sideMenu.onPopDown();

        if (npui.selectionMenu) {
            npui.selectionMenuContainer.removeChild(npui.selectionMenu);
        }
        npui.selectionMenu = npui.SelectionMenu();
        npui.selectionMenuContainer.addChild(npui.selectionMenu);
        npui.layoutElement(npui.selectionMenu);

    };
    npui.onHideSelectionMenu = function (event, data) {
        if (npui.selectionMenu) {
            npui.selectionMenuContainer.removeChild(npui.selectionMenu);
            npui.selectionMenu = null;
        }
    };
    npui.onShowShipTransfer = function (event, data) {
        npui.trigger("select_fleet", data);
        npui.trigger("show_screen", "ship_transfer");
    };
    npui.onScrollToBottom = function () {
        jQuery(window).scrollTop(document.body.scrollHeight);
    };
    npui.onScrollToTop = function () {
        jQuery(window).scrollTop(0);
    };
    npui.onShowBuildInfToolbar = function () {
        if (npui.buildInfToolbar && universe.player) {
            npui.buildInfToolbar.show();
            npui.buildInfToolbar.refresh();
        }
    };
    npui.onHideBuildInfToolbar = function () {
        if (npui.buildInfToolbar) {
            npui.buildInfToolbar.hide();
        }
    };
    npui.onShowRulerToolbar = function () {
        if (npui.rulerToolbar) {
            npui.onHideRulerToolbar();
        }
        npui.rulerToolbar = npui.RulerToolbar().roost(npui.rulerToolbarContainer);
        npui.layoutElement(npui.rulerToolbar);
    };
    npui.onHideRulerToolbar = function () {
        npui.rulerToolbarContainer.removeChild(npui.rulerToolbar);
        npui.rulerToolbar = null;
    };
    npui.refreshTurnManager = function () {
        if (!universe.galaxy.turn_based) return;
        if (npui.turnManager) {
            npui.tmContainer.removeChild(npui.turnManager);
            npui.turnManager = null;
        }
        npui.turnManager = npui.TurnManager().roost(npui.tmContainer);
        npui.layoutElement(npui.turnManager);
    };


    // -------------------------------------------------------------------------
    npui.NagScreen = function () {
        var ns = Crux.Widget("col_black")
            .pos(0,0)
            .size(npui.width, npui.height);

        ns.bg = Crux.Widget("col_base rad12 side_menu")
            .size(480, 480 )
            .pos((npui.width / 2) - 240, 32)
            .roost(ns);

        Crux.Image("/images/joingame_07.jpg", "abs img_black_cap")
            .grid(0, 2, 30, 12)
            .roost(ns.bg);

        var randInt = Math.round(Math.random() * 5 );
        Crux.Text("nag_body_" + randInt, "txt_center pad12")
            .grid(1, 15, 28, 6)
            .roost(ns.bg);

        Crux.Button("go_premium_today", "browse_to", "/#buy_premium")
            .grid(5, 21, 20, 3)
            .addStyle("col_google_red")
            .roost(ns.bg);

        Crux.Button("not_today_thanks", "hide_nag")
            .grid(5, 24, 20, 3)
            .roost(ns.bg);

        ns.layout = function () {
            ns.size(npui.width, npui.height);
            ns.bg.pos((npui.width / 2) - 240, 32);
        };


        return ns;
    };
    npui.onShowNagScreen = function () {
        npui.nagScreen = npui.NagScreen().roost(npui.nagContainer);
    };
    npui.onHideNagScreen = function () {
        if (npui.nagScreen) {
            npui.nagContainer.removeChild(npui.nagScreen);
        }
    };

    // -------------------------------------------------------------------------
    npui.onShowScreen = function (event, screenName, screenConfig) {
        var scroll = 0;
        if (npui.showingScreen === screenName) {
            scroll = jQuery(window).scrollTop();
        } else {
            jQuery(window).scrollTop(0);
            npui.trigger("play_sound", "screen_open");
        }

        npui.onHideScreen(null, true);
        npui.onHideSelectionMenu();

        npui.trigger("hide_side_menu");
        npui.trigger("reset_edit_mode");

        npui.showingScreen = screenName;
        npui.screenConfig = screenConfig;

        // the player has quit this game and is inly able to see game over screen
        // note: I haven't built the game over screen yet but I will need to
        // show who has quit early, even if the game is not yet won
        if (universe.player && universe.player.conceded > 0 ){
                if ( screenName === "star" ||
                        screenName === "fleet" ||
                        screenName === "ship_transfer" ||
                        screenName === "new_fleet"){
                    npui.showingScreen = "leaderboard";
                }
        }

        // the player is not in this game yet the only window they are allowed
        // to see is the join game window.(and a few others)
        if (!universe.player &&
                screenName !== "confirm" &&
                screenName !== "game_password" &&
                screenName !== "custom_settings" &&
                screenName !== "empire" &&
                screenName !== "help") {
            npui.showingScreen = "join_game";
        }

        var screens = {
            "main_menu": npui.MainMenuScreen,
            "compose": npui.ComposeDiplomacyScreen,

            "inbox": npui.InboxScreen,

            "diplomacy_detail": npui.DiplomacyDetailScreen,

            "join_game": npui.JoinGameScreen,
            "empire": npui.EmpireScreen,
            "leaderboard": npui.LeaderboardScreen,
            "options": npui.OptionsScreen,
            "tech":  npui.TechScreen,

            "star": npui.StarInspector,
            "fleet": npui.FleetInspector,

            "edit_order": npui.EditFleetOrder,

            "bulk_upgrade": npui.BulkUpgradeScreen,

            "ship_transfer": npui.ShipTransferScreen,
            "new_fleet": npui.NewFleetScreen,

            "star_dir": npui.StarDirectory,
            "fleet_dir": npui.FleetDirectory,
            "ship_dir": npui.ShipDirectory,

            "combat_calculator": npui.CombatCalc,

            "custom_settings": npui.CustomSettingsScreen,

            "confirm": npui.ConfirmScreen,

            "help": npui.HelpScreen,

            "select_player": npui.SelectPlayerScreen,

            "buy_gift": npui.BuyGiftScreen,
            "buy_premium_gift": npui.BuyPremiumGiftScreen,

            "intel": npui.Intel
        };

        npui.activeScreen = screens[npui.showingScreen](screenConfig);

        if (npui.activeScreen) {
            npui.activeScreen.roost(npui.screenContainer);
            npui.layoutElement(npui.activeScreen);
        }

        jQuery(window).scrollTop(scroll);
    };
    npui.onHideScreen = function (event, quiet) {
        if (npui.activeScreen) {
            if (quiet === undefined){
                npui.onScrollToTop();
                npui.trigger("play_sound", "cancel");
            }
            npui.screenContainer.removeChild(npui.activeScreen);
        }
        npui.activeScreen = null;
        npui.showingScreen = "";
    };

    // -------------------------------------------------------------------------
    npui.onRefreshInterface = function () {
        npui.playerIcons.refresh();
        npui.buildInfToolbar.refresh();
        npui.refreshTurnManager();
        if (npui.showingScreen){
            npui.onShowScreen(null, npui.showingScreen, npui.screenConfig);
        }
    };
    npui.onRefreshPlayerIcons = function () {
        npui.playerIcons.refresh();
    };
    npui.onRefreshBuildInf = function () {
        if (universe.editMode === "quick_upgrade") {
            npui.buildInfToolbar.refresh();
        }
    };
    npui.onRebuildPlayerIcons = function () {
        if (npui.playerIcons) {
            npui.removeChild(npui.playerIcons);
        }
        npui.playerIcons = npui.PlayerIcons()
            .roost(npui.playerIconsContainer);

        npui.layoutElement(npui.playerIcons);
    };
    npui.onBuildInterface = function () {
        npui.map = NeptunesPride.Map(npui, universe)
            .roost(npui);

        npui.screenTop = 124;
        if (universe.playerCount > 8){
            npui.screenTop = 56;
        }

        if (universe.interfaceSettings.screenPos === "right") {
            jQuery("html")
                .css("overflow-y", "scroll")
                .css("overflow", "-moz-scrollbars-vertical");
        }

        if (universe.galaxy.turn_based){
            npui.tmContainer = Crux.Widget()
                .size(1,1)
                .roost(npui);

            npui.turnManager = npui.TurnManager()
                .roost(npui.tmContainer);
        }

        npui.status = npui.Status()
            .roost(npui);

        npui.screenContainer = Crux.Widget()
            .size(1,1)
            .roost(npui);

        npui.playerIconsContainer = Crux.Widget()
            .size(1,1)
            .roost(npui);


        npui.playerIcons = npui.PlayerIcons()
            .roost(npui.playerIconsContainer);

        npui.buildInfToolbar = npui.BuildInfToolbar()
            .hide()
            .roost(npui);

        npui.rulerToolbarContainer = Crux.Widget()
            .size(1,1)
            .roost(npui);

        npui.selectionMenuContainer = Crux.Widget()
            .size(1,1)
            .roost(npui);

        npui.sideMenu = npui.SideMenu()
            .roost(npui);

        npui.nagContainer = Crux.Widget()
            .size(1,1)
            .roost(npui);

        jQuery(window).on("resize", npui.layout);
        npui.layout();

        npui.onRefreshInterface();
    };

    npui.onSetLayoutPos = function (e, pos) {
        universe.interfaceSettings.screenPos = pos;
        npui.layout();
    };

    npui.layoutElement = function (element) {
        var yOffset = 0;
        if (element.yOffset === "bottom") {
            yOffset = npui.height - element.h;
        } else {
            yOffset = element.yOffset;
        }

        if (universe.interfaceSettings.screenPos === "center") {
            element.pos(((npui.width) / 2) - ((element.w) / 2), yOffset);
        }
        if (universe.interfaceSettings.screenPos === "right") {
            element.pos(npui.width - element.w, yOffset);
        }
        if (universe.interfaceSettings.screenPos === "left") {
            var xoff = 0;
            if (npui.sideMenu.pinned) {
                xoff = npui.sideMenu.w;
            }
            element.pos(xoff, yOffset);
        }
    };

    npui.layout = function () {
        npui.width = jQuery(window).width();
        npui.height = jQuery(window).height();

        if (universe.movieMode) {
            npui.width = 640;
            npui.height = 480;
            Crux.crux.pos(256 - window.screenX, 256 - window.screenY);
        }

        if (universe.interfaceSettings.sideMenuPin) {
            npui.sideMenu.pin();
        } else {
            npui.sideMenu.unPin();
        }

        npui.layoutElement(npui.status);
        npui.layoutElement(npui.playerIcons);
        npui.layoutElement(npui.buildInfToolbar);

        if (npui.rulerToolbar) {
            npui.layoutElement(npui.rulerToolbar);
        }

        if (npui.sideMenu.pinned){
            npui.sideMenu.size(npui.sideMenu.w, npui.height);
            npui.sideMenu.pos(0, 0);
        } else {
            npui.sideMenu.size(npui.sideMenu.w, npui.sideMenu.rows * npui.sideMenuItemSize);
            npui.sideMenu.pos(npui.status.x, npui.status.y);

        }

        if (npui.activeScreen) {
            npui.layoutElement(npui.activeScreen);
        }
        if (universe.galaxy.turn_based){
            npui.layoutElement(npui.turnManager);
        }

        if (npui.selectionMenu) {
            npui.layoutElement(npui.selectionMenu);
        }

        if (npui.fleetOrderConfirm) {
            npui.layoutElement(npui.fleetOrderConfirm);
        }

        if (npui.nagScreen) {
            npui.nagScreen.layout();
        }

        npui.map.layout();

        if (universe.movieMode) {
            npui.width = 640;
            npui.height = 480;
            Crux.crux.pos(256 - window.screenX, 256 - window.screenY);
            npui.map.pos(256 - window.screenX, 256 - window.screenY);
        }
    };

    //--------------------------------------------------------------------------
    // event handlers
    //--------------------------------------------------------------------------

    npui.on("layout", npui.layout);

    npui.on("show_screen", npui.onShowScreen);
    npui.on("hide_screen", npui.onHideScreen);

    npui.on("show_fleet_order_confirm", npui.onShowFleetOrderConfirm);
    npui.on("hide_fleet_order_confirm", npui.onHideFleetOrderConfirm);

    npui.on("show_selection_menu", npui.onShowSelectionMenu);
    npui.on("hide_selection_menu", npui.onHideSelectionMenu);

    npui.on("refresh_interface", npui.onRefreshInterface);

    npui.on("refresh_player_icons", npui.onRefreshPlayerIcons);
    npui.on("build_interface", npui.onBuildInterface);

    npui.on("rebuild_player_icons", npui.onRebuildPlayerIcons);

    npui.on("show_ship_transfer", npui.onShowShipTransfer);

    npui.on("scroll_to_bottom", npui.onScrollToBottom);
    npui.on("scroll_to_top", npui.onScrollToTop);

    npui.on("show_build_inf_toolbar", npui.onShowBuildInfToolbar);
    npui.on("hide_build_inf_toolbar", npui.onHideBuildInfToolbar);
    npui.on("refresh_build_inf_toolbar", npui.onRefreshBuildInf);

    npui.on("show_ruler_toolbar", npui.onShowRulerToolbar);
    npui.on("hide_ruler_toolbar", npui.onHideRulerToolbar);

    npui.on("show_nag", npui.onShowNagScreen);
    npui.on("hide_nag", npui.onHideNagScreen);

    //--------------------------------------------------------------------------
    // INIT
    //--------------------------------------------------------------------------

    npui.activeScreen = null;
    npui.showingScreen = "";

    return npui;

};
})();
