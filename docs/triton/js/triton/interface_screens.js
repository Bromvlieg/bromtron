/*globals addthis: true,  Crux: true console: true*/
if (!NeptunesPride) {var NeptunesPride = {};}
(function () {
NeptunesPride.InterfaceScreens =  function (npui, universe, inbox) {
    "use strict";

    // -------------------------------------------------------------------------
    // Other
    // -------------------------------------------------------------------------
    npui.GiftItem = function (item) {
        var gi = Crux.Widget("rel")
            .size(480);

        Crux.Widget("rel col_base")
            .size(480, 16)
            .roost(gi);

        gi.icon = Crux.Image("../images/badges/" + item.icon + ".png", "abs")
            .grid(0.25, 1, 6, 6)
            .roost(gi);

        gi.body = Crux.Text("gift_desc_" + item.icon , "rel txt_selectable")
            .size(384-24)
            .pos(96+12)
            .roost(gi);

        gi.buyNowBg = Crux.Widget("rel")
            .size(480, 52)
            .roost(gi);

        gi.buyNowButton = Crux.Button("buy_now", "buy_gift", item)
            .grid(20,0,10,3)
            .roost(gi.buyNowBg);

        if (item.amount > NeptunesPride.account.credits) {
            gi.buyNowButton.disable();
        }
        Crux.Widget("rel col_accent")
            .size(480, 4)
            .roost(gi);

        return gi;
    };
    npui.BuyGiftScreen = function () {
        var buy = npui.Screen("gift_heading")
            .size(480);

        Crux.Text("gift_intro", "rel pad12 col_accent txt_center")
            .format({player: universe.selectedPlayer.colourBox + universe.selectedPlayer.hyperlinkedAlias})
            .size(480)
            .roost(buy);

        npui.GalacticCreditBalance().roost(buy);

        var i;
        var items = [
            {icon: "trek",      amount: 1},
            {icon: "rebel",     amount: 1},
            {icon: "empire",    amount: 1},

            // {icon: "toxic",     amount: 10},
            {icon: "wolf",      amount: 5},

            {icon: "pirate",    amount: 5},
            {icon: "wordsmith", amount: 2},
            {icon: "lucky",     amount: 2},
            {icon: "ironborn",  amount: 2},
            {icon: "strange",   amount: 2},


            {icon: "cheesy",    amount: 1},
            {icon: "strategic", amount: 1},
            {icon: "badass",    amount: 1},
            {icon: "lionheart", amount: 1},
            {icon: "gun",       amount: 1},
            {icon: "command",   amount: 1},
            {icon: "science",   amount: 1},
            {icon: "nerd",      amount: 1},
            {icon: "merit",     amount: 1},


        ];

        for (i = items.length - 1; i >= 0; i--) {
            items[i].puid = universe.selectedPlayer.uid;
            npui.GiftItem(items[i]).roost(buy);
        }

        return buy;
    };
    npui.GalacticCreditBalance = function () {
        var creditBalance = Crux.Widget("rel col_black")
            .size(480);

        creditBalance.bg = Crux.Widget("rel")
            .size(480, 48)
            .roost(creditBalance);

        Crux.Text("galactic_credit_balance", "pad12")
            .format({x: NeptunesPride.account.credits})
            .size(480, 48)
            .roost(creditBalance.bg);

        Crux.Button("buy_credits", "browse_to", "../#buy_credits")
            .addStyle("col_google_red")
            .grid(20, 0, 10, 3)
            .roost(creditBalance);

        if (NeptunesPride.account.credits <= 0) {
            Crux.Text("need_credits","rel pad12 col_accent txt_center")
                .size(480)
                .roost(creditBalance);
        }

        return creditBalance;
    };
    npui.BuyPremiumGiftScreen = function () {
        var buy = npui.Screen("gift_premium_heading")
            .size(480);

        Crux.Text("gift_premium_intro", "rel pad12 col_accent txt_center")
            .format({player: universe.selectedPlayer.colourBox + universe.selectedPlayer.hyperlinkedAlias})
            .size(480)
            .roost(buy);

        npui.GalacticCreditBalance().roost(buy);


        var i;
        var items = [
            {icon: "1_month",  amount: 5},
            {icon: "3_month",  amount: 12},
            {icon: "12_month", amount: 24},
            {icon: "lifetime", amount: 48}
        ];

        for (i = items.length - 1; i >= 0; i--) {
            items[i].puid = universe.selectedPlayer.uid;
            npui.GiftItem(items[i]).roost(buy);
        }

        Crux.Text("gift_premium_footer", "rel pad12 col_accent txt_center")
            .size(480)
            .roost(buy);

        return buy;
    };

    npui.BulkUpgradeScreen = function () {
        var bus = npui.Screen("bulk_upgrade_heading")
            .size(480);

        if (!universe.player) return;

        var bg = Crux.Widget("rel col_accent")
            .grid(0, 0, 30, 11)
            .roost(bus);

        Crux.Text("bulk_upgrade_intro", "pad12")
            .grid(0, 0.5, 20, 9)
            .roost(bg);

        bus.amount = Crux.TextInput("single", "", "number")
            .grid(20, 1, 10, 3)
            .setValue(universe.player.cash)
            .roost(bg);

        var selections = {
            "economy": Crux.localise("economy"),
            "industry": Crux.localise("industry"),
            "science": Crux.localise("science")};

        bus.infKind = Crux.DropDown("e", selections)
            .grid(20, 4, 10, 3)
            .roost(bg);

        bus.buy = Crux.Button("buy_cheapest", "pre_bulk_upgrade")
            .grid(20, 7, 10, 3)
            .roost(bg);

        Crux.Widget("rel")
            .grid(0, 0, 30, 1)
            .roost(bus);

        bus.onPreBulkUpgrade = function () {
            var values = {
                    "amount": bus.amount.getValue(),
                    "kind":bus.infKind.getValue(),
                    "localised_kind": Crux.localise(bus.infKind.getValue())
                };
            var screenConfig = {
                message: "sure_you_want_bulk_upgrade",
                messageTemplateData: values,
                eventKind: "bulk_upgrade",
                eventData: values
            };
            bus.trigger("show_screen", ["confirm", screenConfig]);

        };
        bus.on("pre_bulk_upgrade", bus.onPreBulkUpgrade);

        return bus;
    };

    // -------------------------------------------------------------------------
    npui.HelpScreen = function () {
        var prop, star, i;
        var help = npui.Screen("triton_codex")
            .size(480);

        Crux.IconButton("icon-help", "show_help", "index")
            .grid(24.5, 0, 3, 3)
            .roost(help);

        help.postRoost = function () {
            // capture anchor clicks and convert them to internal events and p
            $('a').click(function (event) {
                var url = $(this).attr('href').split('/');
                if (url[1] === "help") {
                    event.preventDefault();
                    help.trigger('show_help', url[url.length-1]);
                    return false;
                } else {
                    return true;
                }
            });
        };

        if (!universe.helpHTML) {
            Crux.Text("loading", "rel pad12 txt_selectable txt_center col_accent")
                .roost(help);
            return help;
        }

        Crux.Text("", "help rel pad12 txt_selectable col_accent")
            .rawHTML(universe.helpHTML)
            .roost(help);

        help.footer = Crux.Widget("rel col_black")
            .size(480, 48)
            .roost(help);

        Crux.Button("help_index", "show_help", "index")
            .grid(20, 0, 10, 3)
            .roost(help.footer);

        return help;
    };

    // -------------------------------------------------------------------------
    npui.DirectoryTabs = function (active) {
        var dir = Crux.Widget("rel")
            .size(480, 48);

        Crux.Widget("col_accent_light")
            .grid(0, 2.5, 30, 0.5)
            .roost(dir);

        dir.starTab = Crux.Tab("stars", "show_screen", "star_dir")
            .grid(0, -0.5, 10, 3)
            .roost(dir);

        dir.fleetTab = Crux.Tab("fleets", "show_screen", "fleet_dir")
            .grid(10, -0.5, 10, 3)
            .roost(dir);

        dir.shipTab = Crux.Tab("ships", "show_screen", "ship_dir")
            .grid(20, -0.5, 10, 3)
            .roost(dir);

        if (active === "fleet") {
            dir.fleetTab.activate();
        }
        if (active === "star") {
            dir.starTab.activate();
        }
        if (active === "ship") {
            dir.shipTab.activate();
        }

        return dir;
    };
    npui.FleetDirectory = function () {
        var prop, star, i;
        var starDir = npui.Screen("galaxy")
            .size(480);

        npui.DirectoryTabs("fleet")
            .roost(starDir);

        var filterText = "filter_show_mine_fleets";
        if (universe.fleetDirectory.filter === "my_fleets") {
            filterText = "filter_show_all_fleets";
        }

        Crux.Text(filterText, "rel pad12 col_accent")
            .roost(starDir);

        var sortedFleets = [];
        for (prop in universe.galaxy.fleets) {
            if (universe.fleetDirectory.filter === "my_fleets") {
                if (universe.galaxy.fleets[prop].player === universe.player) {
                    sortedFleets.push(universe.galaxy.fleets[prop]);
                }
            } else {
                sortedFleets.push(universe.galaxy.fleets[prop]);
            }
        }

        if (universe.fleetDirectory.sortBy === "name") {
            sortedFleets.sort(function (a, b) {
                var result = -1;
                if (a.n < b.n) {
                    result = 1;
                }
                result *= universe.fleetDirectory.invert;
                return result;
            });
        }

        if (universe.fleetDirectory.sortBy === "st" ||
            universe.fleetDirectory.sortBy === "puid" ||
            universe.fleetDirectory.sortBy === "etaFirst" ||
            universe.fleetDirectory.sortBy === "eta") {
            sortedFleets.sort(function (a, b) {
                var result = b[universe.fleetDirectory.sortBy] - a[universe.fleetDirectory.sortBy];
                if (result === 0) {
                    result = 1;
                    if (a.n < b.n) {
                        result = -1;
                    }
                }
                result *= universe.fleetDirectory.invert;
                return result;
            });
        }

        if (universe.fleetDirectory.sortBy === "w") {
            sortedFleets.sort(function (a, b) {
                var result = b.path.length - a.path.length;
                if (result === 0) {
                    result = 1;
                    if (a.n < b.n) {
                        result = -1;
                    }
                }
                result *= universe.fleetDirectory.invert;
                return result;
            });
        }

        var html = "<table class='star_directory'>";
        html += "<tr><td><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'puid\')\">P</a></td>";
        html += "<td class='star_directory_name'><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'name\')\">Name</a></td>";
        html += "<td></td>";
        html += "<td><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'st\')\">Ships</a></td>";
        html += "<td><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'w\')\">W</a></td>";
        html += "<td><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'etaFirst\')\">ETA</a></td>";
        html += "<td><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'eta\')\">Total ETA</a></td>";
        html += "</tr>";

        for (i = sortedFleets.length - 1; i >= 0; i--) {
            var clickEvent = "";
            html += "<tr>";
            html += "<td>";

            if (sortedFleets[i].player) {
                html += sortedFleets[i].player.colourBox;
            }
            html += "</td>";

            clickEvent = 'Crux.crux.trigger(\'show_fleet_screen_uid\' , \'' + sortedFleets[i].uid + '\' )';
            html += '<td class="star_directory_name"> <a onClick=\"' + clickEvent + '\"> ' + sortedFleets[i].n + ' </a> </td>';

            clickEvent = 'Crux.crux.trigger(\'show_fleet_uid\' , \'' + sortedFleets[i].uid + '\' )';
            html += '<td> <a onClick=\"' + clickEvent + '\" class="ic-eye">&#59146;</a> </td>';

            html += "<td> " + sortedFleets[i].st + "</td>";

            html += "<td> " + sortedFleets[i].path.length;
            if (sortedFleets[i].loop){
                html += " <span class='icon-loop'></span>";
            }
            html += "</td>";

            html += "<td> " + universe.timeToTick(sortedFleets[i].etaFirst, true) + "</td>";
            html += "<td> " + universe.timeToTick(sortedFleets[i].eta, true) + "</td>";

            html += "</tr>";
        }
        html += "</table>";

        Crux.Text("", "rel")
            .rawHTML(html)
            .roost(starDir);

        return starDir;
    };
    npui.StarDirectory = function () {
        var prop, star, i;
        var starDir = npui.Screen("galaxy")
            .size(480);

        universe.rawExportStar = [];
        universe.rawExportStars = "";

        npui.DirectoryTabs("star")
            .roost(starDir);

        // ---------------------------------------------------------------------
        var ugh = Crux.Widget("rel pad12 col_base")
            .size(480,48)
            .roost(starDir);

        Crux.IconButton("icon-dollar", "show_screen", "bulk_upgrade")
            .grid(27, 0, 3, 3)
            .roost(ugh);

        var bgsSelections = {
            "off": "Disable Upgrades",
            "on": "Enable Upgrades"};

        var bgsChoice = "on";
        if (!universe.interfaceSettings.allowBuyGalaxyScreen){
            bgsChoice = "off";
        }

        starDir.allowBuyGalaxyScreen = Crux.DropDown(bgsChoice, bgsSelections, "setting_change")
            .grid(15.5, 0, 12, 3)
            .roost(ugh);

        starDir.onSettingChange = function () {
            if (starDir.allowBuyGalaxyScreen.getValue() === "on"){
                universe.setInterfaceSetting("allowBuyGalaxyScreen", true);
            } else {
                universe.setInterfaceSetting("allowBuyGalaxyScreen", false);
            }
            starDir.trigger("refresh_interface");
        };
        starDir.on("setting_change", starDir.onSettingChange);
        // ---------------------------------------------------------------------


        var filterText = "filter_show_mine";
        if (universe.starDirectory.filter === "my_stars") {
            filterText = "filter_show_all";
        }

        Crux.Text(filterText, "rel pad12 col_accent")
            .roost(starDir);

        var sortedStars = [];
        for (prop in universe.galaxy.stars) {
            if (universe.starDirectory.filter === "my_stars") {
                if ( universe.galaxy.stars[prop].player === universe.player ) {
                    sortedStars.push(universe.galaxy.stars[prop]);
                }
            } else {
                sortedStars.push(universe.galaxy.stars[prop]);
            }
        }

        if (universe.starDirectory.sortBy === "name") {
            sortedStars.sort(function (a, b) {
                var result = -1;
                if (a.n < b.n) {
                    result = 1;
                }
                result *= universe.starDirectory.invert;
                return result;
            });
        }

        if (universe.starDirectory.sortBy === "uce" ||
            universe.starDirectory.sortBy === "uci" ||
            universe.starDirectory.sortBy === "ucs" ||
            universe.starDirectory.sortBy === "puid"   ||
            universe.starDirectory.sortBy === "e"   ||
            universe.starDirectory.sortBy === "i"   ||
            universe.starDirectory.sortBy === "s"
            ) {

            sortedStars.sort(function (a, b) {
                var result = b[universe.starDirectory.sortBy] - a[universe.starDirectory.sortBy];
                if (result === 0) {
                    result = 1;
                    if (a.n < b.n) {
                        result = -1;
                    }
                }
                result *= universe.starDirectory.invert;
                return result;
            });
        }

        var html = "<table class='star_directory'>";
        html += "<tr><td><a onClick=\"Crux.crux.trigger(\'star_dir_sort\', \'puid\')\">P</a></td>";
        html += "<td class='star_directory_name'><a onClick=\"Crux.crux.trigger(\'star_dir_sort\', \'name\')\">Name</a></td>";
        html += "<td></td>";
        html += "<td><a onClick=\"Crux.crux.trigger(\'star_dir_sort\', \'e\')\">E</a></td>";
        html += "<td><a onClick=\"Crux.crux.trigger(\'star_dir_sort\', \'i\')\">I</a></td>";
        html += "<td><a onClick=\"Crux.crux.trigger(\'star_dir_sort\', \'s\')\">S</a></td>";
        html += "<td><a onClick=\"Crux.crux.trigger(\'star_dir_sort\', \'uce\')\">$ E</a></td>";
        html += "<td><a onClick=\"Crux.crux.trigger(\'star_dir_sort\', \'uci\')\">$ I</a></td>";
        html += "<td><a onClick=\"Crux.crux.trigger(\'star_dir_sort\', \'ucs\')\">$ S</a></td>";
        html += "</tr>";
        for (i = sortedStars.length - 1; i >= 0; i--) {
            star = sortedStars[i];

            // a very quick way to provide the star data to a player who
            // wanted CVS export of the star data.
            // data can be accessed from console via
            // window.NeptunesPride.universe.rawExportStars
            universe.rawExportStar = [];
            universe.rawExportStar.push(star.r);
            universe.rawExportStar.push(star.n);
            universe.rawExportStar.push(star.e);
            universe.rawExportStar.push(star.i);
            universe.rawExportStar.push(star.s);
            universe.rawExportStar.push(star.uce);
            universe.rawExportStar.push(star.uci);
            universe.rawExportStar.push(star.ucs);
            universe.rawExportStar.push(star.st);
            universe.rawExportStar.push(star.totalDefenses);
            universe.rawExportStars += universe.rawExportStar.join(",") + "\n";

            var clickEvent = "";

            html += "<tr>";

            html += "<td>";

            if (sortedStars[i].player) {
                html += sortedStars[i].player.colourBox;
            }
            html += "</td>";

            clickEvent = 'Crux.crux.trigger(\'show_star_screen_uid\' , \'' + sortedStars[i].uid + '\' )';
            html += '<td class="star_directory_name"> <a onClick=\"' + clickEvent + '\"> ' + sortedStars[i].n + ' </a> </td>';

            clickEvent = 'Crux.crux.trigger(\'show_star_uid\' , \'' + sortedStars[i].uid + '\' ); Crux.crux.trigger(\'star_dir_row_hilight\' , \'' + i + '\' )';
            if (universe.StarDirRowHilight === i){
                html += '<td> <a onClick=\"' + clickEvent + '\" class="ic-eye txt_warn_bad">&#59146;</a> </td>';
            } else {
                html += '<td> <a onClick=\"' + clickEvent + '\" class="ic-eye">&#59146;</a> </td>';
            }

            html += "<td> " + sortedStars[i].e + "</td>";
            html += "<td> " + sortedStars[i].i + "</td>";
            html += "<td> " + sortedStars[i].s + "</td>";

            if (universe.player.conceded > 0) {
                universe.interfaceSettings.allowBuyGalaxyScreen = false;
            }

            if (sortedStars[i].player === universe.player && universe.player.cash >= sortedStars[i].uce && universe.interfaceSettings.allowBuyGalaxyScreen) {
                html += "<td> <a  onClick=\"event.preventDefault();Crux.crux.trigger(\'star_dir_upgrade_e\', \'" + sortedStars[i].uid + "\')\"  >$" + sortedStars[i].uce + "</a></td>";
            } else {
                html += "<td> $" + sortedStars[i].uce + "</td>";
            }

            if (sortedStars[i].player === universe.player && universe.player.cash >= sortedStars[i].uci && universe.interfaceSettings.allowBuyGalaxyScreen) {
                html += "<td> <a  onClick=\"event.preventDefault();Crux.crux.trigger(\'star_dir_upgrade_i\', \'" + sortedStars[i].uid + "\')\"  >$" + sortedStars[i].uci + "</a></td>";
            } else {
                html += "<td> $" + sortedStars[i].uci + "</td>";
            }

            if (sortedStars[i].player === universe.player && universe.player.cash >= sortedStars[i].ucs && universe.interfaceSettings.allowBuyGalaxyScreen) {
                html += "<td> <a  onClick=\"event.preventDefault();Crux.crux.trigger(\'star_dir_upgrade_s\', \'" + sortedStars[i].uid + "\')\"  >$" + sortedStars[i].ucs + "</a></td>";
            } else {
                html += "<td> $" + sortedStars[i].ucs + "</td>";
            }

            html += "</tr>";
        }
        html += "</table>";

        Crux.Text("", "rel")
            .rawHTML(html)
            .roost(starDir);


        return starDir;
    };
    npui.ShipDirectory = function () {
        var prop, star, i;
        var starDir = npui.Screen("galaxy")
            .size(480);

        npui.DirectoryTabs("ship")
            .roost(starDir);

        var filterText = "filter_show_mine_ships";
        if (universe.shipDirectory.filter === "my_ships") {
            filterText = "filter_show_all_ships";
        }

        Crux.Text(filterText, "rel pad12 col_accent")
            .roost(starDir);

        var sortedShips = [];
        for (prop in universe.galaxy.fleets) {
            if (universe.shipDirectory.filter === "my_ships") {
                if (universe.galaxy.fleets[prop].player === universe.player) {
                    sortedShips.push(universe.galaxy.fleets[prop]);
                }
            } else {
                sortedShips.push(universe.galaxy.fleets[prop]);
            }
        }
        for (prop in universe.galaxy.stars) {
            if (universe.shipDirectory.filter === "my_ships") {
                if (universe.galaxy.stars[prop].player === universe.player) {
                    sortedShips.push(universe.galaxy.stars[prop]);
                }
            } else {
                sortedShips.push(universe.galaxy.stars[prop]);
            }
        }

        if (universe.shipDirectory.sortBy === "name") {
            sortedShips.sort(function (a, b) {
                var result = -1;
                if (a.n < b.n) {
                    result = 1;
                }
                result *= universe.shipDirectory.invert;
                return result;
            });
        }

        if (universe.shipDirectory.sortBy === "st" ||
            universe.shipDirectory.sortBy === "puid") {
            sortedShips.sort(function (a, b) {
                var result = b[universe.shipDirectory.sortBy] - a[universe.shipDirectory.sortBy];
                if (result === 0) {
                    result = 1;
                    if (a.n < b.n) {
                        result = -1;
                    }
                }
                result *= universe.shipDirectory.invert;
                return result;
            });
        }

        var html = "<table class='star_directory'>";
        html += "<tr><td><a onClick=\"Crux.crux.trigger(\'ship_dir_sort\', \'puid\')\">P</a></td>";

        html += "<td class='star_directory_name'><a onClick=\"Crux.crux.trigger(\'ship_dir_sort\', \'name\')\">Name</a></td>";
        html += "<td></td>";
        html += "<td></td>";
        html += "<td><a onClick=\"Crux.crux.trigger(\'ship_dir_sort\', \'st\')\">Ships</a></td>";
        html += "</tr>";

        for (i = sortedShips.length - 1; i >= 0; i--) {
            var clickEvent = "";
            html += "<tr>";
            html += "<td>";

            if (sortedShips[i].player) {
                html += sortedShips[i].player.colourBox;
            }
            html += "</td>";

            if (sortedShips[i].kind === "fleet") {
                clickEvent = 'Crux.crux.trigger(\'show_fleet_screen_uid\' , \'' + sortedShips[i].uid + '\' )';
                html += '<td class="star_directory_name"> <a onClick=\"' + clickEvent + '\"> ' + sortedShips[i].n + ' </a> </td>';

                clickEvent = 'Crux.crux.trigger(\'show_fleet_uid\' , \'' + sortedShips[i].uid + '\' )';
                html += '<td> <a onClick=\"' + clickEvent + '\" class="ic-eye">&#59146;</a> </td>';
                html += "<td> <span class=icon-rocket></span></td>";

                html += "<td> " + sortedShips[i].st + "</td>";
            } else {
                clickEvent = 'Crux.crux.trigger(\'show_star_screen_uid\' , \'' + sortedShips[i].uid + '\' )';
                html += '<td class="star_directory_name"> <a onClick=\"' + clickEvent + '\"> ' + sortedShips[i].n + ' </a> </td>';

                clickEvent = 'Crux.crux.trigger(\'show_star_uid\' , \'' + sortedShips[i].uid + '\' )';
                html += '<td> <a onClick=\"' + clickEvent + '\" class="ic-eye">&#59146;</a> </td>';

                html += "<td> <span class=icon-star-1></span></td>";
                html += "<td> " + sortedShips[i].st + "</td>";

            }


            html += "</tr>";
        }
        html += "</table>";

        Crux.Text("", "rel")
            .rawHTML(html)
            .roost(starDir);

        return starDir;
    };

    npui.CombatCalc = function () {
        var prop, star, i;
        var combatCalc = npui.Screen("combat_calculator")
            .size(480, 480);

        Crux.Widget("rel")
            .size(480,480 - 48)
            .roost(combatCalc);

        var s = 10;
        var ws = 1;
        var ds = 1;
        var l = 1;

        if (universe.selectedSpaceObject) {
            s = universe.selectedSpaceObject.st;
            if (universe.selectedSpaceObject.kind === "star") {
                s = universe.selectedSpaceObject.totalDefenses;
            }
            if (universe.selectedSpaceObject.player) {
                ws = universe.selectedSpaceObject.player.tech.weapons.value;
            }
        }

        Crux.Text("defender_weapon_tech", "pad12 col_accent")
            .grid(0, 3, 30, 3)
            .roost(combatCalc);

        Crux.Text("defender_ships", "pad12 col_accent")
            .grid(0, 6, 30, 3)
            .roost(combatCalc);

        Crux.Text("defender_ships_bonus", "pad12 col_accent")
            .grid(0, 9, 30, 3)
            .roost(combatCalc);


        Crux.Widget("col_black")
            .grid(0, 12, 30, 0.5)
            .roost(combatCalc);


        Crux.Text("attacker_weapon_tech", "pad12 col_accent")
            .grid(0, 13.5, 30, 3)
            .roost(combatCalc);

        Crux.Text("attacker_ships", "pad12 col_accent")
            .grid(0, 16.5, 30, 3)
            .roost(combatCalc);

        Crux.Widget("col_black")
            .grid(0, 19.5, 30, 0.5)
            .roost(combatCalc);

        combatCalc.dwt = Crux.TextInput("single", "", "number")
            .setText(ws)
            .grid(20, 3, 10, 3)
            .roost(combatCalc);
        combatCalc.ds = Crux.TextInput("single", "", "number")
            .setText(s)
            .grid(20, 6, 10, 3)
            .roost(combatCalc);

        Crux.Text("", "pad4 col_base rad4 txt_center")
            .grid(20, 9, 10, 3)
            .inset(8)
            .rawHTML("+1 Weapons")
            .roost(combatCalc);

        combatCalc.awt = Crux.TextInput("single", "", "number")
            .setText(ws)
            .grid(20, 13.5, 10, 3)
            .roost(combatCalc);
        combatCalc.as = Crux.TextInput("single", "", "number")
            .setText(s)
            .grid(20, 16.5, 10, 3)
            .roost(combatCalc);

        Crux.Button("fight", "pre_calculate_combat")
            .grid(20, 21, 10, 3)
            .roost(combatCalc);

        combatCalc.result = Crux.Text("", "pad12 col_accent txt_center")
            .grid(0, 25, 30, 3)
            .rawHTML("")
            .roost(combatCalc);

        combatCalc.onPreCalcCombat = function () {
            var dwt = combatCalc.dwt.getText();
            var ds = combatCalc.ds.getText();
            var awt = combatCalc.awt.getText();
            var as = combatCalc.as.getText();

            if (ds === 0 || as === 0) {
                combatCalc.result.update("combat_calc_no_combat");
                return;
            }

            dwt += 1; // defender bonus
            var winner = "";
            while (!winner) {
                as -= dwt;
                if (as <= 0){
                    winner = "defender";
                    break;
                }
                ds -= awt;
                if (ds <= 0) {
                    winner = "attacker";
                    break;
                }
            }

            var td = {};
            td.as = as;
            td.ds = ds;
            if (winner == "attacker") {
                combatCalc.result.updateFormat("combat_calc_win_attack", td);
            } else {
                combatCalc.result.updateFormat("combat_calc_win_defend", td);
            }

        };
        combatCalc.on("pre_calculate_combat", combatCalc.onPreCalcCombat);

        return combatCalc;
    };

    // -------------------------------------------------------------------------
    // Intel
    // -------------------------------------------------------------------------
    npui.IntelDataSelection = function () {
        var intelDataSelection = Crux.Widget("rel col_accent")
            .size(480, 48);

        var selections = {
            "ts": "Total Stars",
            "e": "Total Economy",
            "i": "Total Industry",
            "s": "Total Science",
            "sh": "Total Ships",
            "fl": "Total Carriers",
            "wt": "Weapons",
            "bt": "Banking",
            "mt": "Manufacturing",
            "ht": "Hyperspace",
            "st": "Scanning",
            "gt": "Experimentation",
            "tt": "Terraforming"};

        intelDataSelection.dataType = Crux.DropDown(universe.intelDataType, selections, "intel_selection_change")
            .grid(10, 0, 20, 3)
            .roost(intelDataSelection);

        return intelDataSelection;
    };
    npui.IntelFooter = function () {
        var intelFooter = Crux.Widget("rel")
            .size(480, 92);

        Crux.Button("all", "intel_player_filter_all")
            .grid(0.5, 0.5, 5, 3)
            .roost(intelFooter);

        Crux.Button("none", "intel_player_filter_none")
            .grid(5.5, 0.5, 5, 3)
            .roost(intelFooter);

        var bg = Crux.Widget("rel")
            .size(256)
            .pos(196, 2)
            .roost(intelFooter);

        var xPos = -2, yPos = 1;
        var index = 0;


        if (universe.playerCount < 8) {
            xPos += (16 - (universe.playerCount * 2))  / 2;
        }

        while (index < universe.playerCount) {
            xPos += 2;
            if (xPos >= 16) {
                xPos = 0;
                yPos += 2;
                if (universe.playerCount - index < 8) {
                    xPos += (16 - ((universe.playerCount - index) * 2))  / 2;
                }

            }
            var player = universe.galaxy.players[index];
            var c = Crux.Clickable("intel_player_filter_change", player.uid)
                .grid(xPos, yPos, 2, 2)
                .roost(bg);

            if (universe.intelPlayerToChart.indexOf(player.uid) >= 0 ){
                Crux.Widget("col_accent rad4")
                .grid(0, 0, 2, 2)
                .roost(c);
            }

            Crux.Widget("pci_32_" + player.uid )
                .grid(0, 0, 2, 2)
                .roost(c);


            index += 1;
        }

        var larger = 0;

        intelFooter.size(480, (yPos * 16) + 48);
        return intelFooter;
    };
    npui.IntelChart = function () {
        var intelChart = Crux.Widget("rel")
            .size(480, 256);

        var chart = new google.visualization.LineChart(intelChart.ui[0]);
        chart.draw(universe.intelData, universe.IntelChartOptions);

        return intelChart;
    };
    npui.Intel = function () {
        var intel = npui.Screen("intel");

        npui.IntelDataSelection()
            .roost(intel);

        if (universe.intelDataNone) {
            Crux.Text("no_intel_data", "rel pad12 col_black txt_center")
                .size(480, 0)
                .roost(intel);
        } else {
            if (universe.intelData) {
                npui.IntelChart()
                    .roost(intel);
            } else {
                Crux.Text("loading", "rel pad12 col_black txt_center")
                    .size(480, 0)
                    .roost(intel);
            }
            npui.trigger("intel_request");
        }

        npui.IntelFooter()
            .roost(intel);

        return intel;
    };

    // -------------------------------------------------------------------------
    // Fleet
    // -------------------------------------------------------------------------
    npui.NewFleetScreen = function (star) {
        universe.selectStar(star);

        var newFleetScreen = npui.Screen("new_fleet")
            .size(480, 344);

        newFleetScreen.footerRequired = false;

        var totalStrength = universe.selectedStar.st;

        if (totalStrength <= 0 ) {
            return newFleetScreen;
        }
        if (universe.player.cash < 25 ) {
            return newFleetScreen;
        }

        Crux.Text("new_fleet_body","pad12 col_black txt_center rel")
            .size(480)
            .roost(newFleetScreen);

        var bg = Crux.Widget("rel col_black")
            .size(480, 248)
            .roost(newFleetScreen);

        Crux.Widget("col_accent")
            .grid(10, 0, 20, 15)
            .roost(bg);

        Crux.Text("", "txt_center")
            .rawHTML(universe.selectedStar.n)
            .grid(10, 1, 10, 3)
            .roost(bg);

        Crux.Text("new_carrier", "txt_center")
            .grid(20, 1, 10, 3)
            .roost(bg);

        newFleetScreen.starSt = Crux.TextInput("single", "", "number")
            .grid(10, 3, 10, 3)
            .setText(0)
            .roost(bg);

        newFleetScreen.fleetSt = Crux.TextInput("single", "", "number")
            .grid(20, 3, 10, 3)
            .setText(universe.selectedStar.st)
            .roost(bg);

        newFleetScreen.starSt.eventKind = "new_fleet_star_change";
        newFleetScreen.fleetSt.eventKind = "new_fleet_fleet_change";

        newFleetScreen.noneBtn = Crux.Button("min", "new_fleet_none")
            .grid(10, 6, 5, 3)
            .roost(bg);

        newFleetScreen.lessBtn = Crux.IconButton("icon-left-open", "new_fleet_less")
            .grid(17, 6, 3, 3)
            .roost(bg);

        newFleetScreen.moreBtn = Crux.IconButton("icon-right-open", "new_fleet_more")
            .grid(20, 6, 3, 3)
            .roost(bg);

        newFleetScreen.allBtn = Crux.Button("max", "new_fleet_all")
            .grid(25, 6, 5, 3)
            .roost(bg);

        Crux.Widget("col_black")
            .grid(0,11,30,3)
            .roost(bg);

        newFleetScreen.subBtn = Crux.Button("new_fleet_for_25", "new_fleet_submit")
            .grid(17, 11, 13, 3)
            .roost(bg);

        Crux.Image("../images/tech_dock.jpg", "abs")
            .grid(0, 0, 10, 15)
            .roost(bg);

        newFleetScreen.onSubmit = function () {
            newFleetScreen.trigger("new_fleet", {strength: newFleetScreen.fleetSt.getText()});
        };

        newFleetScreen.onNone = function () {
            newFleetScreen.fleetSt.setText(1);
            newFleetScreen.starSt.setText(totalStrength - 1);
        };

        newFleetScreen.onLess = function () {
            if (newFleetScreen.fleetSt.getText() > 1) {
                newFleetScreen.starSt.setText(newFleetScreen.starSt.getText() + 1);
                newFleetScreen.fleetSt.setText(newFleetScreen.fleetSt.getText() - 1);
            }
        };

        newFleetScreen.onMore = function () {
            if (newFleetScreen.starSt.getText() > 0) {
                newFleetScreen.starSt.setText(newFleetScreen.starSt.getText() - 1);
                newFleetScreen.fleetSt.setText(newFleetScreen.fleetSt.getText() + 1);
            }
        };

        newFleetScreen.onAll = function () {
            newFleetScreen.fleetSt.setText(totalStrength);
            newFleetScreen.starSt.setText(0);
            newFleetScreen.subBtn.enable();
        };

        newFleetScreen.onStarChange = function () {
            if (newFleetScreen.starSt.getText() > totalStrength - 1 ||
                    newFleetScreen.starSt.getText() < 0) {
                    newFleetScreen.subBtn.disable();
            } else {
                newFleetScreen.fleetSt.setText(totalStrength - newFleetScreen.starSt.getText());
                newFleetScreen.subBtn.enable();
            }
        };

        newFleetScreen.onFleetChange = function () {
            if (newFleetScreen.fleetSt.getText() > totalStrength ||
                    newFleetScreen.fleetSt.getText() < 1) {
                    newFleetScreen.subBtn.disable();
            } else {
                newFleetScreen.starSt.setText(totalStrength - newFleetScreen.fleetSt.getText());
                newFleetScreen.subBtn.enable();
            }
        };

        newFleetScreen.on("new_fleet_submit", newFleetScreen.onSubmit);

        newFleetScreen.on("new_fleet_star_change", newFleetScreen.onStarChange);
        newFleetScreen.on("new_fleet_fleet_change", newFleetScreen.onFleetChange);

        newFleetScreen.on("new_fleet_none", newFleetScreen.onNone);
        newFleetScreen.on("new_fleet_less", newFleetScreen.onLess);
        newFleetScreen.on("new_fleet_more", newFleetScreen.onMore);
        newFleetScreen.on("new_fleet_all", newFleetScreen.onAll);

        return newFleetScreen;
    };
    npui.ShipTransferScreen = function () {
        var shipTransferScreen = npui.Screen("ship_transfer")
            .size(480, 368);
        shipTransferScreen.footerRequired = false;

        var totalStrength = universe.selectedFleet.orbiting.st + universe.selectedFleet.st;

        if (totalStrength <= 0 ) {
            return shipTransferScreen;
        }

        Crux.Text("ship_transfer_body","pad12 col_black txt_center rel")
            .size(480)
            .roost(shipTransferScreen);

        var bg = Crux.Widget("rel col_black")
            .size(480, 288-32)
            .roost(shipTransferScreen);

        Crux.Widget("col_accent")
            .grid(10, 0, 20, 15)
            .roost(bg);

        Crux.Text("star_name", "txt_center")
            .rawHTML(universe.selectedFleet.orbiting.n)
            .grid(10, 1, 10, 3)
            .roost(bg);

        Crux.Text("fleet_name", "txt_center")
            .rawHTML(universe.selectedFleet.n)
            .grid(20, 1, 10, 3)
            .roost(bg);

        shipTransferScreen.starSt = Crux.TextInput("single", "", "number")
            .grid(10, 3, 10, 3)
            .setText(0)
            .roost(bg);

        shipTransferScreen.fleetSt = Crux.TextInput("single", "", "number")
            .grid(20, 3, 10, 3)
            .setText(universe.selectedFleet.st + universe.selectedFleet.orbiting.st)
            .roost(bg);

        shipTransferScreen.starSt.eventKind = "ship_transfer_star_change";
        shipTransferScreen.fleetSt.eventKind = "ship_transfer_fleet_change";

        shipTransferScreen.noneBtn = Crux.Button("min", "ship_transfer_none")
            .grid(10, 6, 5, 3)
            .roost(bg);

        shipTransferScreen.lessBtn = Crux.IconButton("icon-left-open", "ship_transfer_less")
            .grid(17, 6, 3, 3)
            .roost(bg);

        shipTransferScreen.moreBtn = Crux.IconButton("icon-right-open", "ship_transfer_more")
            .grid(20, 6, 3, 3)
            .roost(bg);

        shipTransferScreen.allBtn = Crux.Button("max", "ship_transfer_all")
            .grid(25, 6, 5, 3)
            .roost(bg);

        Crux.Widget("col_black")
            .grid(0, 11, 30, 3)
            .roost(bg);

        shipTransferScreen.subBtn = Crux.Button("transfer", "ship_transfer_submit")
            .grid(17, 11, 10.5, 3)
            .roost(bg);

        Crux.IconButton("icon-plus-circled", "ship_transfer_submit_dispatch")
            .grid(27, 11, 3, 3)
            .roost(bg);

        Crux.Image("../images/tech_shields.jpg", "abs")
            .grid(0, 0, 10, 15)
            .roost(bg);

        shipTransferScreen.onStarChange = function () {
            if (shipTransferScreen.starSt.getText() > totalStrength - 1 ||
                    shipTransferScreen.starSt.getText() < 0) {
                shipTransferScreen.subBtn.disable();
            } else {
                shipTransferScreen.fleetSt.setText(totalStrength - shipTransferScreen.starSt.getText());
                shipTransferScreen.subBtn.enable();
            }
        };

        shipTransferScreen.onFleetChange = function () {
            if (shipTransferScreen.fleetSt.getText() > totalStrength ||
                    shipTransferScreen.fleetSt.getText() < 1) {
                shipTransferScreen.subBtn.disable();
            } else {
                shipTransferScreen.starSt.setText(totalStrength - shipTransferScreen.fleetSt.getText());
                shipTransferScreen.subBtn.enable();
            }
        };

        shipTransferScreen.onNone = function () {
            shipTransferScreen.fleetSt.setText(1);
            shipTransferScreen.starSt.setText(totalStrength - 1);
            shipTransferScreen.subBtn.enable();
        };

        shipTransferScreen.onLess = function () {
            if (shipTransferScreen.fleetSt.getText() > 1) {
                shipTransferScreen.starSt.setText(shipTransferScreen.starSt.getText() + 1);
                shipTransferScreen.fleetSt.setText(shipTransferScreen.fleetSt.getText() - 1);
            }
        };

        shipTransferScreen.onMore = function () {
            if (shipTransferScreen.starSt.getText() > 0) {
                shipTransferScreen.starSt.setText(shipTransferScreen.starSt.getText() - 1);
                shipTransferScreen.fleetSt.setText(shipTransferScreen.fleetSt.getText() + 1);
            }
        };

        shipTransferScreen.onAll = function () {
            shipTransferScreen.fleetSt.setText(totalStrength);
            shipTransferScreen.starSt.setText(0);
            shipTransferScreen.subBtn.enable();
        };

        shipTransferScreen.onSubmit = function () {
            shipTransferScreen.trigger("ship_transfer", {star: shipTransferScreen.starSt.getText(), fleet: shipTransferScreen.fleetSt.getText()});
        };

        shipTransferScreen.onSubmitDispatch = function () {
            shipTransferScreen.onSubmit();
            npui.trigger("start_edit_waypoints", {fleet: universe.selectedFleet});
        };


        shipTransferScreen.on("ship_transfer_submit_dispatch", shipTransferScreen.onSubmitDispatch);
        shipTransferScreen.on("ship_transfer_submit", shipTransferScreen.onSubmit);

        shipTransferScreen.on("ship_transfer_star_change", shipTransferScreen.onStarChange);
        shipTransferScreen.on("ship_transfer_fleet_change", shipTransferScreen.onFleetChange);

        shipTransferScreen.on("ship_transfer_none", shipTransferScreen.onNone);
        shipTransferScreen.on("ship_transfer_less", shipTransferScreen.onLess);
        shipTransferScreen.on("ship_transfer_more", shipTransferScreen.onMore);
        shipTransferScreen.on("ship_transfer_all", shipTransferScreen.onAll);

        return shipTransferScreen;
    };
    npui.EditFleetOrder = function (screenConfig) {
        var efo = npui.Screen("edit_fleet_order")
            .size(480);

        Crux.Image("../images/joingame_01.jpg", "rel img_black_cap")
            .size(480, 96)
            .roost(efo);

        efo.bg = Crux.Widget("rel col_accent")
            .size(480, 112)
            .roost(efo);

        efo.screenConfig = screenConfig;

        efo.fleet = universe.galaxy.fleets[screenConfig.fleet];
        efo.order = efo.fleet.orders[screenConfig.order];

        var delay = efo.order[0];
        var target = universe.galaxy.stars[efo.order[1]].n;
        var action = efo.order[2];
        var amount = efo.order[3];

        Crux.Text("delay", "txt_center")
            .grid(0, 1.5, 5, 3)
            .roost(efo.bg);

        efo.delay = Crux.TextInput("single", "efo_setting_change", "number")
            .grid(0, 3, 5, 3)
            .setValue(delay)
            .roost(efo.bg);

        Crux.Text("destination", "txt_center")
            .grid(5, 1.5, 10, 3)
            .roost(efo.bg);

        Crux.Text("", "rad4 pad4 col_black txt_center")
            .grid(5, 3, 10, 3)
            .nudge(0, 6, 0, -12)
            .rawHTML(target)
            .roost(efo.bg);

        Crux.Text("action", "txt_center")
            .grid(15, 1.5, 10, 3)
            .roost(efo.bg);

        var action_selections = {
            "0": "Do Nothing",
            "1": "Collect All",
            "2": "Drop All",
            "3": "Collect",
            "4": "Drop",
            "5": "Collect All But",
            "6": "Drop All But",
            "7": "Garrison Star" };

        efo.action = Crux.DropDown(String(action), action_selections, "efo_setting_change_action")
            .grid(15, 3, 10, 3)
            .roost(efo.bg);

        Crux.Text("ships", "txt_center")
            .grid(25, 1.5, 5, 3)
            .roost(efo.bg);

        efo.amountDisabled = Crux.Widget("col_base rad4")
            .grid(25, 3, 5, 3)
            .inset(6)
            .roost(efo.bg);

        efo.amount = Crux.TextInput("single", "efo_setting_change", "number")
            .setValue(Number(amount))
            .grid(25, 3, 5, 3)
            .roost(efo.bg);

        efo.OKbg = Crux.Widget("rel col_black")
            .size(480, 48)
            .roost(efo);

        Crux.Button("ok", "efo_ok")
            .grid(20, 0, 10, 3)
            .roost(efo.OKbg);

        efo.last = Crux.IconButton("icon-left-open", "fleet_order_last")
            .grid(0, 0, 3, 3)
            .roost(efo.OKbg);

        efo.next = Crux.IconButton("icon-right-open", "fleet_order_next")
            .grid(2.5, 0, 3, 3)
            .roost(efo.OKbg);



        efo.onFleetOrderLast = function () {
            var index = Number(efo.screenConfig.order) - 1;
            if (index < 0) {
                index = efo.fleet.orders.length -1;
            }
            efo.trigger("ripple_star", universe.galaxy.stars[efo.fleet.orders[index][1]]);
            efo.trigger("show_screen", ["edit_order", {order:[[index]], fleet:[[efo.fleet.uid]] }]);
        };

        efo.onFleetOrderNext = function () {
            var index = Number(efo.screenConfig.order) + 1;
            if (index >= efo.fleet.orders.length) {
                index = 0;
            }
            efo.trigger("ripple_star", universe.galaxy.stars[efo.fleet.orders[index][1]]);
            efo.trigger("show_screen", ["edit_order", {order:[[index]], fleet:[[efo.fleet.uid]] }]);
        };

        efo.onOK = function () {
            npui.trigger("select_fleet", {fleet:efo.fleet});
            npui.trigger("show_screen", "fleet");
            npui.trigger("submit_fleet_orders");
        };

        efo.ordersThatRequireAmount = [3, 4, 5, 6, 7];
        efo.onSettingsChange = function () {
            if (efo.ordersThatRequireAmount.indexOf(Number(efo.action.getValue())) < 0) {
                efo.amount.hide();
            } else {
                efo.amount.show();
            }

            efo.order[0] = Number(efo.delay.getValue());
            efo.order[2] = Number(efo.action.getValue());
            efo.order[3] = Number(efo.amount.getValue());

            universe.calcFleetEta(efo.fleet);
        };

        efo.onSettingsChangeAction = function () {
            if (efo.ordersThatRequireAmount.indexOf(Number(efo.action.getValue())) >= 0) {
                efo.amount.setValue(1);

            } else {
                efo.amount.setValue(0);
            }
            efo.onSettingsChange();
        };

        // finalise the set-up of the dialogue.
        efo.onSettingsChange();

        efo.on("efo_setting_change", efo.onSettingsChange);
        efo.on("efo_setting_change_action", efo.onSettingsChangeAction);


        efo.on("efo_ok", efo.onOK);

        efo.on("fleet_order_last", efo.onFleetOrderLast);
        efo.on("fleet_order_next", efo.onFleetOrderNext);
        return efo;
    };


    npui.FLeetNavOrderHeading = function () {
        var fno = Crux.Widget("rel col_accent")
            .size(480, 48);

        Crux.Text("delay", "txt_center pad12")
            .grid(0,0,4,3)
            .roost(fno);

        Crux.Text("destination", " pad12")
            .grid(4,0,8,3)
            .roost(fno);

        var lable = "action";
        if (universe.interfaceSettings.showFleetNavEtaDetail) {
            lable = "eta";
        }
        Crux.Text(lable, "pad12")
            .grid(14,0,14,3)
            .roost(fno);

        lable = "show_eta";
        if (universe.interfaceSettings.showFleetNavEtaDetail) {
            lable = "show_action";
        }
        Crux.Text(lable, "pad12 txt_right")
            .grid(20,0,10,3)
            .roost(fno);

        return fno;
    };
    npui.FleetNavOrder = function (order, index) {
        var fno = Crux.Widget("rel")
            .size(480, 32);

        var delay = order[0];
        var targetStar = universe.galaxy.stars[order[1]];
        if (targetStar === undefined){
            Crux.Text("target_star_unscanned", "rel txt_center pad12")
                .grid(0,0,30,3)
                .roost(fno);
            return fno;
        }

        var target = targetStar.n;
        if (universe.selectedFleet.orbiting === targetStar) {
            target += " *";
        }
        var action = Crux.localise("do_nothing");
        var eta = universe.timeToTick(order[4]);

        if (order[2] === 1) {
            action = Crux.localise("collect_all_ships");
        }

        if (order[2] === 2) {
            action = Crux.localise("drop_all_ships");
        }
        if (order[2] === 3) {
            action = Crux.format(Crux.localise("collect_x_ships"), {amount:order[3]});
        }
        if (order[2] === 4) {
            action = Crux.format(Crux.localise("drop_x_ships"), {amount:order[3]});
        }
        if (order[2] === 5) {
            action = Crux.format(Crux.localise("collect_all_but_x_ships"), {amount:order[3]});
        }
        if (order[2] === 6) {
            action = Crux.format(Crux.localise("drop_all_but_x_ships"), {amount:order[3]});
        }
        if (order[2] === 7) {
            action = Crux.format(Crux.localise("garrison_star_x"), {amount:order[3]});
        }

        if (index === 0 && !universe.selectedFleet.orbiting) {
            Crux.Text("", "txt_center pad12")
                .grid(0,0,4,3)
                .rawHTML("-")
                .roost(fno);
        } else {
            Crux.Text("", "txt_center pad12")
                .grid(0,0,4,3)
                .rawHTML(delay)
                .roost(fno);
        }

        Crux.Text("", " pad12 txt_ellipsis")
            .grid(4,0,8,3)
            .rawHTML(target)
            .roost(fno);

        if (universe.interfaceSettings.showFleetNavEtaDetail) {
            action = eta;
        }
        Crux.Text("", "pad12")
            .grid(14,0,14,3)
            .rawHTML(action)
            .roost(fno);

        if (universe.selectedFleet.player === universe.player) {
            Crux.Text("edit_fleet_order_link", "pad12 txt_right")
                .grid(25,0,5,3)
                .format({index:index, fuid:universe.selectedFleet.uid})
                .roost(fno);
        }

        return fno;
    };
    npui.FleetNav = function () {
        var fleetNav = Crux.Widget("rel col_base")
            .size(480);

        var fleet = universe.selectedFleet;
        var i, ii, order;
        var td = {};

        Crux.Text("navigation", "rel section_title col_black")
            .grid(0, 0, 30, 3)
            .roost(fleetNav);

        if (fleet.orbiting) {
            td["orbiting"] = fleet.orbiting.n;

            Crux.Text("orbiting", "rel pad12 col_base")
                .format(td)
                .roost(fleetNav);

            if (fleet.player === universe.player && fleet.orbiting.player) {
                Crux.Button("ship_transfer", "show_screen", "ship_transfer")
                    .grid(20, 3, 10, 3)
                    .roost(fleetNav);
            }
        }

        var pathArray = [];

        if (!fleet.orders.length) {
            if (fleet.orbiting) {
                Crux.Text("path_empty", "rel pad12 col_accent")
                    .roost(fleetNav);
            } else {
                Crux.Text("path_unknown", "rel pad12 col_accent")
                    .roost(fleetNav);
            }
        } else {

            npui.FLeetNavOrderHeading()
                .roost(fleetNav);

            for (i = 0, ii = fleet.orders.length; i < ii; i+=1) {
                npui.FleetNavOrder(fleet.orders[i], i)
                    .roost(fleetNav);
            }

            Crux.Widget("rel")
                .size(480, 16)
                .roost(fleetNav);

            if (fleet.puid === universe.player.uid) {
                fleetNav.loopingBlock = Crux.Widget("rel col_accent")
                    .size(480, 48)
                    .roost(fleetNav);
                if (fleet.loop) {
                    Crux.Text("looping_enabled", "pad12")
                        .roost(fleetNav.loopingBlock);
                    Crux.Button("disable_looping", "loop_fleet_orders_off")
                        .grid(20, 0, 10, 3)
                        .roost(fleetNav.loopingBlock);
                } else {
                    Crux.Text("looping_disabled", "pad12")
                        .roost(fleetNav.loopingBlock);
                    var loopingBtn = Crux.Button("enable_looping", "loop_fleet_orders")
                        .grid(20, 0, 10, 3)
                        .disable()
                        .roost(fleetNav.loopingBlock);

                    if (universe.ordersLoopable()) {
                        loopingBtn.enable();
                    }
                }
            } else {
                fleetNav.loopingBlock = Crux.Widget("rel col_accent")
                    .size(480, 16)
                    .roost(fleetNav);

            }
        }

        fleetNav.etaBlock = Crux.Widget("rel col_base")
            .size(480, 48)
            .roost(fleetNav);

        fleetNav.eta = Crux.Text("total_eta", "pad12")
            .roost(fleetNav.etaBlock);

        if (fleet.player === universe.player) {
            Crux.Button("edit_waypoints", "start_edit_waypoints", {fleet: fleet})
                .grid(20, 0, 10, 3)
                .roost(fleetNav.etaBlock);
        }

        fleetNav.onOneSecondTick = function () {
            if (!fleet) { return; }

            if (fleet.path.length === 0) {
                fleetNav.eta.hide();
            } else {
                fleetNav.eta.show();
            }

            if (fleet.path.length && fleetNav.eta) {
                if (fleet.path.length > 1) {
                    fleetNav.eta.updateFormat("total_eta", {
                        etaFirst: universe.timeToTick(fleet.etaFirst),
                        eta: universe.timeToTick(fleet.eta)
                    });
                } else {
                    fleetNav.eta.updateFormat("total_eta_single", {
                        etaFirst: universe.timeToTick(fleet.etaFirst)
                    });
                }
            }
        };

        fleetNav.onOneSecondTick(); // call now to finish layout.
        fleetNav.on("one_second_tick", fleetNav.onOneSecondTick);

        return fleetNav;
    };
    npui.FleetPremium = function () {
        var fleetPremium = Crux.Widget("rel col_base")
            .size(480);
        var i, s;

        Crux.Text("premium_features", "rel premium_section_title col_black")
            .grid(0, 0, 30, 3)
            .roost(fleetPremium);

        if (NeptunesPride.account.premium) {
            fleetPremium.bg = Crux.Widget("rel col_accent")
                .grid(0, 0, 30, 5.5)
                .roost(fleetPremium);

            Crux.Text("rename_fleet_body", "pad12")
                .grid(0, 0, 30, 3)
                .roost(fleetPremium.bg);

            fleetPremium.renameText = Crux.TextInput("single")
                .grid(0, 2.5, 20, 3)
                .roost(fleetPremium.bg);

            Crux.Button("rename", "pre_rename_fleet")
                .grid(20, 2.5, 10, 3)
                .roost(fleetPremium.bg);
        }

        if (!NeptunesPride.account.premium) {
            Crux.Text("premium_features_fleet_body", "rel pad12 premium_body")
                .size(480)
                .roost(fleetPremium);
        }

        fleetPremium.onPreRenameFleet = function () {
            npui.trigger("rename_fleet", fleetPremium.renameText.getValue());
        };
        fleetPremium.on("pre_rename_fleet", fleetPremium.onPreRenameFleet);

        return fleetPremium;
    };
    npui.FleetStatus = function () {
        var fleetStatus = Crux.Widget("rel col_base")
            .size(480, 48);

        Crux.Text("ships", "screen_subtitle col_accent")
            .grid(0,0,30,3)
            .roost(fleetStatus);

        Crux.Text("", "screen_subtitle icon-rocket-inline txt_right")
            .grid(0,0,30,3)
            .rawHTML(universe.selectedFleet.st)
            .roost(fleetStatus);

        return fleetStatus;
    };
    npui.FleetInspector = function () {
        var fleetInspector = npui.Screen();
        fleetInspector.heading.rawHTML(universe.selectedFleet.n);

        Crux.IconButton("icon-help", "show_help", "fleets")
            .grid(24.5, 0, 3, 3)
            .roost(fleetInspector);

        Crux.IconButton("icon-doc-text", "show_screen", "combat_calculator")
            .grid(22, 0, 3, 3)
            .roost(fleetInspector);

        var fleetKind = "my_fleet";
        if (universe.selectedFleet.player !== universe.player) {
            fleetKind = "enemy_fleet";
        }

        Crux.Text(fleetKind, "rel pad12 col_black txt_center")
            .format({
                colourBox: universe.selectedFleet.colourBox,
                hyperlinkedAlias: universe.selectedFleet.hyperlinkedAlias})
            .roost(fleetInspector);

        npui.FleetStatus()
            .roost(fleetInspector);

        npui.FleetNav()
            .roost(fleetInspector);

        if (universe.selectedFleet.player === universe.player){
            npui.FleetPremium()
                .roost(fleetInspector);
        }

        npui.PlayerPanel(universe.selectedFleet.player, true)
            .roost(fleetInspector);

        return fleetInspector;
    };

    // -------------------------------------------------------------------------
    // Stars
    // -------------------------------------------------------------------------
    npui.StarPremium = function () {
        var starPremium = Crux.Widget("rel col_base")
            .size(480);
        var i, s;

        Crux.Text("premium_features", "rel premium_section_title col_black")
            .grid(0, 0, 30, 3)
            .roost(starPremium);

        if (NeptunesPride.account.premium) {
            starPremium.bg = Crux.Widget("rel col_accent")
                .grid(0, 0, 30, 5.5)
                .roost(starPremium);

            Crux.Text("rename_star_body", "pad12")
                .grid(0, 0, 30, 3)
                .roost(starPremium.bg);

            starPremium.renameText = Crux.TextInput("single")
                .grid(0, 2.5, 20, 3)
                .roost(starPremium.bg);

            Crux.Button("rename", "pre_rename_star")
                .grid(20, 2.5, 10, 3)
                .roost(starPremium.bg);
        }

        if (!NeptunesPride.account.premium) {
            Crux.Text("premium_features_star_body", "rel pad12 premium_body")
                .size(480)
                .roost(starPremium);
        }
        starPremium.onPreRenameStar = function () {
            npui.trigger("rename_star", starPremium.renameText.getValue());
        };
        starPremium.on("pre_rename_star", starPremium.onPreRenameStar);

        return starPremium;
    };
    npui.StarInfStatus = function (showButtons) {
        var starInfStatus = Crux.Widget("rel  col_base")
                .size(480, 200-8-48);
        var btn;
        if (showButtons) {
            starInfStatus.size(480, 200-8);
        }

        Crux.Widget("col_accent")
            .grid(0, 6, 30, 3)
            .roost(starInfStatus);

        Crux.Text("infrastructure", "section_title col_black")
            .grid(0, 0, 30, 3)
            .roost(starInfStatus);

        Crux.BlockValueBig("economy", "icon-dollar-inline", universe.selectedStar.e, "col_accent")
            .grid(0, 3, 10, 6)
            .roost(starInfStatus);

        Crux.BlockValueBig("industry", "icon-tools-inline", universe.selectedStar.i, "col_base")
            .grid(10, 3, 10, 6)
            .roost(starInfStatus);

        Crux.BlockValueBig("science", "icon-graduation-cap-inline", universe.selectedStar.s, "col_accent")
            .grid(20, 3, 10, 6)
            .roost(starInfStatus);

        if (showButtons) {
            if (universe.selectedStar.uce > 0) {
                btn = Crux.Button("upgrade_for_x", "upgrade_economy")
                    .grid(0, 9, 10, 3)
                    .format({cost: String(universe.selectedStar.uce)})
                    .roost(starInfStatus);
                if (universe.player.cash - universe.selectedStar.uce < 0) {
                    btn.disable();
                }
            }

            Crux.Widget("col_accent")
                .grid(10, 9, 10, 3)
                .roost(starInfStatus);

            if (universe.selectedStar.uci > 0) {
                btn = Crux.Button("upgrade_for_x", "upgrade_industry")
                    .grid(10, 9, 10, 3)
                    .format({cost: String(universe.selectedStar.uci)})
                    .roost(starInfStatus);
                if (universe.player.cash - universe.selectedStar.uci < 0) {
                    btn.disable();
                }
            }

            if (universe.selectedStar.ucs > 0) {
                btn = Crux.Button("upgrade_for_x", "upgrade_science")
                    .grid(20, 9, 10, 3)
                    .format({cost: String(universe.selectedStar.ucs)})
                    .roost(starInfStatus);
                if (universe.player.cash - universe.selectedStar.ucs < 0) {
                    btn.disable();
                }
            }

        }
        return starInfStatus;
    };
    npui.StarGateStatus = function (showButtons) {
        var starGateStatus = Crux.Widget("rel col_accent")
            .size(480, 72);

        var btn, screenConfig;

        function withGate () {
            Crux.Text("warp_gate_body_with", "pad12")
                .grid(0, 0, 20, 3)
                .roost(starGateStatus);

            screenConfig = {
                message: "sure_you_want_to_destroy_warpgate",
                messageTemplateData: {star_name: universe.selectedStar.n},
                eventKind: "destroy_warp_gate",
                eventData: {}
            };
            btn = Crux.Button("destroy_gate", "show_screen", ["confirm", screenConfig])
                .grid(20, 1.5, 10, 3)
                .format({cost: String(universe.selectedStar.ucg)})
                .roost(starGateStatus);
        }

        function withoutGate() {
            Crux.Text("warp_gate_body_without", "pad12")
                .grid(0, 0, 20, 3)
                .roost(starGateStatus);

            if (universe.selectedStar.ucg > 0 && showButtons) {
                screenConfig = {
                    message: "sure_you_want_to_buy_warpgate",
                    messageTemplateData: {
                        cost: universe.selectedStar.ucg,
                        star_name: universe.selectedStar.n},
                    eventKind: "buy_warp_gate",
                    eventData: {}
                };
                btn = Crux.Button("upgrade_for_x", "show_screen", ["confirm", screenConfig])
                    .grid(20, 1.5, 10, 3)
                    .format({cost: String(universe.selectedStar.ucg)})
                    .roost(starGateStatus);

                if (universe.player.cash - universe.selectedStar.ucg < 0) {
                    btn.disable();
                }
            }
        }

        if (universe.selectedStar.ga > 0 ){
            withGate();
        } else {
            withoutGate();
        }

        return starGateStatus;
    };
    npui.ShipConstructionRate = function () {
        var scr = Crux.Widget("rel col_base")
            .size(480, 48);
        Crux.Text("ships_per_hour", "txt_center pad12")
            .format({sph:universe.selectedStar.shipsPerTick, tr:universe.describeTickRate()})
            .grid(0, 0, 30, 3)
            .roost(scr);

        return scr;
    };
    npui.StarDefStatus = function (showNewFleet) {
        var starDefStatus = Crux.Widget("rel  col_black")
                .size(480, 128);
        var str, td;

        Crux.Text("ships", "pad12 col_accent")
            .grid(0,0,30,3)
            .roost(starDefStatus);

        Crux.Text("", "pad12 icon-rocket-inline txt_right")
            .grid(0,0,30,3)
            .rawHTML(universe.selectedStar.st)
            .roost(starDefStatus);

        Crux.Text("natural_resources", "pad12 col_base" )
            .grid(0, 3, 30, 3)
            .roost(starDefStatus);

        Crux.Text("", "txt_right pad12 icon-globe-inline")
            .grid(0, 3, 30, 3)
            .rawHTML(  universe.selectedStar.nr  )
            .roost(starDefStatus);

        Crux.Text("terraformed_resources", "pad12 col_base" )
            .grid(0, 5, 30, 3)
            .roost(starDefStatus);

        Crux.Text("", "txt_right pad12 icon-globe-inline")
            .grid(0, 5, 30, 3)
            .rawHTML(universe.selectedStar.r)
            .roost(starDefStatus);

        return starDefStatus;
    };
    npui.StarResStatus = function (showResources, showNewFleet) {
        var starResStatus = Crux.Widget("rel col_black")
            .size(480, 96+8);
        var res, str, td;

        if (showResources) {
            res = universe.selectedStar.r;
            str = universe.selectedStar.st;
            td = universe.selectedStar.totalDefenses;
        } else {
            res = "&#63; &#63;";
            str = "&#63; &#63;";
            td = "&#63;";
        }

        if (universe.selectedStar.r === 0) {
            res = "&#63; &#63;";
        }

        Crux.BlockValueBig("resources", "icon-globe-inline", res, "col_base")
            .grid(0, 0, 10, 6)
            .roost(starResStatus);

        Crux.Text("resources_body", "pad12 col_accent")
            .grid(10,0,20,6)
            .roost(starResStatus);

        return starResStatus;
    };
    npui.StarBuildFleet = function () {
        var bf = Crux.Widget("rel col_accent")
            .size(480, 72);

        Crux.Text("carrier_body", "pad12")
            .grid(0, 0, 20, 6)
            .roost(bf);

        var nfb = Crux.Button("upgrade_for_x", "show_screen", ["new_fleet", universe.selectedStar] )
            .grid(20, 1.5, 10, 3)
            .format({cost: 25})
            .roost(bf);

        if (universe.selectedStar.st === 0 || universe.player.cash < 25) {
            nfb.disable();
        }

        return bf;
    };
    npui.StarAbandon = function () {
        var aban = Crux.Widget("rel col_accent")
            .size(480, 72);

        Crux.Text("abandon_star_body", "pad12")
            .grid(0, 0, 20, 6)
            .roost(aban);

        var screenConfig = {
            message: "sure_you_want_to_abandon_star",
            messageTemplateData: {star_name: universe.selectedStar.n},
            eventKind: "abandon_star",
            eventData: {}
        };

        aban.btn = Crux.Button("abandon_star", "show_screen", ["confirm", screenConfig])
            .grid(20, 1.5, 10, 3)
            .roost(aban);

        if (universe.player.stars_abandoned > 0) {
            aban.btn.disable();
        }

        return aban;
    };
    npui.StarInspector = function () {
        var starInspector = npui.Screen();
        starInspector.heading.rawHTML(universe.selectedStar.n);

        Crux.IconButton("icon-help", "show_help", "stars")
            .grid(24.5, 0, 3, 3)
            .roost(starInspector);

        Crux.IconButton("icon-doc-text", "show_screen", "combat_calculator")
            .grid(22, 0, 3, 3)
            .roost(starInspector);

        var starKind = "unscanned_star";
        if (!universe.selectedStar.player) {
            starKind = "unclaimed_star";
        } else {
            starKind = "enemy_star";
            if (universe.selectedStar.v === "0") {
                starKind = "unscanned_enemy";
            }
        }

        if (universe.selectedStar.owned) {
           starKind = "my_star";
        }
        // subtitle
        starInspector.intro = Crux.Widget("rel")
            .roost(starInspector);

        Crux.Text(starKind, "pad12 rel col_black txt_center")
            .format(universe.selectedStar)
            .roost(starInspector.intro);

        if (starKind === "unclaimed_star") {
            npui.StarResStatus(true, false)
                .roost(starInspector);
            starInspector.footerRequired = false;
        }

        if (starKind === "unscanned_enemy"){
            npui.StarResStatus(true, false)
                .roost(starInspector);

            npui.PlayerPanel(universe.selectedStar.player, true)
                .roost(starInspector);

        }

        if (starKind === "enemy_star") {
            npui.StarDefStatus(false)
                .roost(starInspector);

            npui.StarInfStatus(false)
                .roost(starInspector);

            Crux.Widget("rel col_black")
                .size(480, 8)
                .roost(starInspector);

            npui.ShipConstructionRate()
                .roost(starInspector);

            if (universe.selectedStar.ga > 0) {
                Crux.Widget("rel col_black")
                    .size(480, 8)
                    .roost(starInspector);
                Crux.Text("has_warp_gate","rel col_accent pad12 txt_center")
                    .size(480, 48)
                    .roost(starInspector);

            }

            npui.PlayerPanel(universe.selectedStar.player, true)
                .roost(starInspector);
        }

        if (starKind === "my_star") {
            npui.StarDefStatus(true)
                .roost(starInspector);

            npui.StarInfStatus(true)
                .roost(starInspector);

            Crux.Widget("rel col_black")
                .size(480, 8)
                .roost(starInspector);

            npui.ShipConstructionRate()
                .roost(starInspector);

            Crux.Widget("rel col_black")
                .size(480, 8)
                .roost(starInspector);

            npui.StarBuildFleet()
                .roost(starInspector);

            if (NeptunesPride.gameConfig.buildGates !== 0) {
                Crux.Widget("rel col_black")
                    .size(480, 8)
                    .roost(starInspector);

                npui.StarGateStatus(true)
                    .roost(starInspector);
            } else {
                if (universe.selectedStar.ga > 0) {
                    Crux.Widget("rel col_black")
                        .size(480, 8)
                        .roost(starInspector);
                    Crux.Text("has_warp_gate","rel col_accent pad12 txt_center")
                        .size(480, 48)
                        .roost(starInspector);
                }
            }

            Crux.Widget("rel col_black")
                .size(480, 8)
                .roost(starInspector);

            npui.StarAbandon()
                .roost(starInspector);

            npui.StarPremium()
                .roost(starInspector);

            npui.PlayerPanel(universe.selectedStar.player, true)
                .roost(starInspector);
        }

        return starInspector;
    };

    // -------------------------------------------------------------------------
    // Options Screen
    // -------------------------------------------------------------------------
    npui.OptionsAdminActions = function () {
        var optionsAdminActions = Crux.Widget();

        if (universe.galaxy.turn_based) {
            Crux.Button("force_turn", "server_request", {type: "order", order: "force_turn"})
                .grid(10, 3, 10, 3)
                .roost(optionsAdminActions);

        } else {
            Crux.Button("jump_6_hours", "server_request", {type: "order", order: "force_ticks, 6"})
                .grid(10, 3, 10, 3)
                .roost(optionsAdminActions);

            Crux.Button("jump_1_hour", "server_request", {type: "order", order: "force_ticks, 1"})
                .grid(10, 6, 10, 3)
                .roost(optionsAdminActions);
        }

        if (universe.galaxy.started) {
            Crux.Button("toggle_pause", "server_request", {type: "order", order: "toggle_pause_game"})
                .grid(20, 3, 10, 3)
                .roost(optionsAdminActions);
        }

        if (!universe.galaxy.started){
            Crux.Button("force_start", "server_request", {type: "order", order: "force_start"})
                .grid(20, 3, 10, 3)
                .roost(optionsAdminActions);
        }
        var pf = [];
        for (var p in universe.galaxy.players) {
            if (universe.galaxy.players[p].conceded === 0 || universe.galaxy.players[p].conceded === 1) {
                pf.push(universe.galaxy.players[p].uid);
            }
        }

        var restoreScreenConfig = {
            name: "restore_player",
            body: "restore_player_select_body",
            returnScreen: "options",
            selectionEvent: "restore_conceded_player",
            playerFilter: pf
        };

        Crux.Button("restore_player", "show_screen", ["select_player", restoreScreenConfig])
            .grid(10, 15, 10, 3)
            .roost(optionsAdminActions);


        var deleteScreenConfig = {
            message: "sure_you_want_to_delete",
            messageTemplateData: null,
            eventKind: "server_request",
            eventData: {type: "delete_game"}
        };

        Crux.Button("delete_game", "show_screen", ["confirm", deleteScreenConfig])
            .grid(20, 15, 10, 3)
            .roost(optionsAdminActions);


        return optionsAdminActions;
    };
    npui.OptionsGameAdmin = function () {
        var optionsGameAdmin = Crux.Widget("rel")
            .size(480, 288);

        Crux.Text("game_admin", "section_title col_black")
            .grid(0, 0, 30, 3)
            .roost(optionsGameAdmin);

        Crux.Image("../images/tech_blastoff.jpg", "abs")
            .grid(0, 3, 10, 15)
            .roost(optionsGameAdmin);

        if (universe.adminPlayer === universe.player) {
            npui.OptionsAdminActions()
                .roost(optionsGameAdmin);

        } else  {
            Crux.Text("game_admin_none","pad8")
                .grid(10, 3, 20, 6)
                .roost(optionsGameAdmin);
        }

        return optionsGameAdmin;
    };
    npui.OptionsMap = function () {
        var optionsMap = Crux.Widget("rel")
            .size(480, 288);

        Crux.Text("interface", "section_title col_black")
            .grid(0, 0, 30, 3)
            .roost(optionsMap);


        // ---------------------------------------------------------------------
        Crux.Image("../images/tech_asteroids.jpg", "rel")
            .grid(0, 3, 10, 15)
            .roost(optionsMap);

        Crux.Text("map_graphics", "pad12 col_accent" )
            .grid(10, 3, 20, 3)
            .roost(optionsMap);

        var gSelections = {
            "low": "Low",
            "medium": "Medium",
            "high": "High"};

        optionsMap.graphics = Crux.DropDown(universe.interfaceSettings.mapGraphics, gSelections, "setting_change_map")
            .grid(20, 3, 10, 3)
            .roost(optionsMap);

        // ---------------------------------------------------------------------
        Crux.Text("main_menu", "pad12 col_base" )
            .grid(10, 6, 20, 3)
            .roost(optionsMap);

        var mpSelections = {
            "dd": "Drop Down",
            "d": "Docked"};

        var mpChoice = "dd";
        if (universe.interfaceSettings.sideMenuPin){
            mpChoice = "d";
        }

        optionsMap.menuPin = Crux.DropDown(mpChoice, mpSelections, "setting_change")
            .grid(20, 6, 10, 3)
            .roost(optionsMap);

        // ---------------------------------------------------------------------
        Crux.Text("ui_pos", "pad12 col_accent" )
            .grid(10, 9, 20, 3)
            .roost(optionsMap);

        var uiSelections = {
            "left": "Left",
            "center": "Center",
            "right": "Right"};

        optionsMap.uiPos = Crux.DropDown(universe.interfaceSettings.screenPos, uiSelections, "setting_change")
            .grid(20, 9, 10, 3)
            .roost(optionsMap);

        // ---------------------------------------------------------------------
        Crux.Text("buy_galaxy_screen", "pad12 col_base")
            .grid(10, 12, 20, 3)
            .roost(optionsMap);

        var bgsSelections = {
            "off": "No Upgrades",
            "on": "Allow Upgrades"};

        var bgsChoice = "on";
        if (!universe.interfaceSettings.allowBuyGalaxyScreen){
            bgsChoice = "off";
        }

        optionsMap.allowBuyGalaxyScreen = Crux.DropDown(bgsChoice, bgsSelections, "setting_change")
            .grid(20, 12, 10, 3)
            .roost(optionsMap);

        // ---------------------------------------------------------------------
        Crux.Text("audio", "pad12 col_accent")
            .grid(10, 15, 20, 3)
            .roost(optionsMap);

        var audioSelections = {
            "off": "Audio Off",
            "on": "Audio On"};

        var audioChoice = "on";
        if (!universe.interfaceSettings.audio){
            audioChoice = "off";
        }

        optionsMap.audio = Crux.DropDown(audioChoice, audioSelections, "setting_change")
            .grid(20, 15, 10, 3)
            .roost(optionsMap);

        // ---------------------------------------------------------------------

        optionsMap.onSettingsChangeMap = function () {
            universe.setInterfaceSetting("mapGraphics", optionsMap.graphics.getValue());
            npui.trigger("map_refresh");
        };

        optionsMap.onSettingsChange = function () {
            universe.setInterfaceSetting("screenPos", optionsMap.uiPos.getValue());
            if (optionsMap.menuPin.getValue() === "d"){
                universe.setInterfaceSetting ("sideMenuPin", true);
            } else {
                universe.setInterfaceSetting ("sideMenuPin", false);
            }
            if (optionsMap.allowBuyGalaxyScreen.getValue() === "on"){
                universe.setInterfaceSetting ("allowBuyGalaxyScreen", true);
            } else {
                universe.setInterfaceSetting ("allowBuyGalaxyScreen", false);
            }

            if (optionsMap.audio.getValue() === "on"){
                universe.setInterfaceSetting ("audio", true);
            } else {
                universe.setInterfaceSetting ("audio", false);
            }
            npui.trigger("layout");
        };

        optionsMap.on("setting_change", optionsMap.onSettingsChange);
        optionsMap.on("setting_change_map", optionsMap.onSettingsChangeMap);

        return optionsMap;
    };
    npui.OptionsFleet = function () {
        var optionsFleet = Crux.Widget("rel")
            .size(480, 288);

        Crux.Text("carrier", "section_title col_black")
            .grid(0, 0, 30, 3)
            .roost(optionsFleet);

        Crux.Image("../images/tech_scramble.jpg", "abs")
            .grid(0, 3, 10, 15)
            .roost(optionsFleet);

        // ---------------------------------------------------------------------
        Crux.Text("default_action", "pad12 col_accent" )
            .grid(10, 3, 20, 3)
            .roost(optionsFleet);

        var actionSelection = {
            "0": "Do Nothing",
            "1": "Collect All",
            "2": "Drop All",
            "3": "Collect",
            "4": "Drop",
            "5": "Collect All But",
            "6": "Drop All But",
            "7": "Garrison Star" };

        optionsFleet.action = Crux.DropDown(universe.interfaceSettings.defaultFleetAction, actionSelection, "setting_change")
            .grid(20, 3, 10, 3)
            .roost(optionsFleet);

        // ---------------------------------------------------------------------
        Crux.Text("default_amount", "pad12 col_base" )
            .grid(10, 6, 20, 3)
            .roost(optionsFleet);

        optionsFleet.amountDisabled = Crux.Widget("col_grey rad4")
            .grid(20, 6, 10, 3)
            .inset(6)
            .roost(optionsFleet);

        optionsFleet.amount = Crux.TextInput("single", "setting_change", "number")
            .setValue(universe.interfaceSettings.defaultFleetAmount)
            .grid(20, 6, 10, 3)
            .roost(optionsFleet);

        // ---------------------------------------------------------------------
        optionsFleet.onSettingsChange = function () {
            universe.setInterfaceSetting("defaultFleetAction", optionsFleet.action.getValue());
            universe.setInterfaceSetting("defaultFleetAmount", optionsFleet.amount.getValue());
            optionsFleet.checkAmountVis();
        };
        optionsFleet.checkAmountVis = function () {
            if (optionsFleet.action.getValue() < 3) {
                universe.setInterfaceSetting("defaultFleetAmount", 0);
                optionsFleet.amount.hide();
            } else {
                optionsFleet.amount.show();
            }
        };
        optionsFleet.checkAmountVis();

        optionsFleet.on("setting_change", optionsFleet.onSettingsChange);

        return optionsFleet;
    };
    npui.OptionsMapText = function () {
        var optionsMap = Crux.Widget("rel")
            .size(480, 288);

        Crux.Text("map", "section_title col_black")
            .grid(0, 0, 30, 3)
            .roost(optionsMap);

        Crux.Text("map_intro", "pad12 col_accent txt_center")
            .grid(0, 3, 30, 3)
            .roost(optionsMap);

        Crux.Image("../images/tech_espionage.jpg", "abs")
            .grid(0, 6, 10, 15)
            .roost(optionsMap);

        var distanceSelections = {
            "150": "150",
            "250": "250",
            "350": "350",
            "450": "450",
            "550": "550",
            "650": "650",
            "750": "750",
            "950": "950",
            "1100": "1150",
            "1350": "1350",
            "1550": "1550"
        };

        // ---------------------------------------------------------------------
        Crux.Text("zoom_ship_count", "pad12 col_base" )
            .grid(10, 6, 20, 3)
            .roost(optionsMap);

        optionsMap.textZoomShips = Crux.DropDown(universe.interfaceSettings.textZoomShips, distanceSelections, "setting_change_map")
            .grid(20, 6, 10, 3)
            .roost(optionsMap);

        // ---------------------------------------------------------------------
        Crux.Text("zoom_star_names", "pad12 col_accent" )
            .grid(10, 9, 20, 3)
            .roost(optionsMap);

        optionsMap.textZoomStarNames = Crux.DropDown(universe.interfaceSettings.textZoomStarNames, distanceSelections, "setting_change_map")
            .grid(20, 9, 10, 3)
            .roost(optionsMap);

        // ---------------------------------------------------------------------
        Crux.Text("zoom_star_inf", "pad12 col_base" )
            .grid(10, 12, 20, 3)
            .roost(optionsMap);

        optionsMap.textZoomInf = Crux.DropDown(universe.interfaceSettings.textZoomInf, distanceSelections, "setting_change_map")
            .grid(20, 12, 10, 3)
            .roost(optionsMap);

        // ---------------------------------------------------------------------
        Crux.Text("zoom_star_player_names", "pad12 col_accent" )
            .grid(10, 15, 20, 3)
            .roost(optionsMap);

        optionsMap.textZoomStarPlayerNames = Crux.DropDown(universe.interfaceSettings.textZoomStarPlayerNames, distanceSelections, "setting_change_map")
            .grid(20, 15, 10, 3)
            .roost(optionsMap);

        // ---------------------------------------------------------------------

        optionsMap.onSettingsChangeMap = function () {
            universe.setInterfaceSetting("textZoomShips", optionsMap.textZoomShips.getValue());
            universe.setInterfaceSetting("textZoomStarNames", optionsMap.textZoomStarNames.getValue());
            universe.setInterfaceSetting("textZoomInf", optionsMap.textZoomInf.getValue());
            universe.setInterfaceSetting("textZoomStarPlayerNames", optionsMap.textZoomStarPlayerNames.getValue());
            npui.trigger("map_refresh");
        };

        optionsMap.on("setting_change", optionsMap.onSettingsChange);
        optionsMap.on("setting_change_map", optionsMap.onSettingsChangeMap);

        return optionsMap;
    };
    npui.OptionsAPI = function () {
        var widget = Crux.Widget("rel")
            .size(480, 288);

        Crux.Text("API", "section_title col_black")
            .grid(0, 0, 30, 3)
            .roost(widget);

        Crux.Image("../images/tech_scanning.jpg", "abs")
            .grid(0, 3, 10, 15)
            .roost(widget);

        // ---------------------------------------------------------------------
        Crux.Text("external_api_intro", "pad12" )
            .grid(10, 3, 20, 6)
            .format({x:universe.player.api_code})
            .roost(widget);

        Crux.Button("generate", "server_request", {type: "order", order: "generate_api_code"})
            .grid(20, 15, 10, 3)
            .roost(widget);

        return widget;
    };
    npui.OptionsScreen = function () {
        var optionsScreen = npui.Screen("options");

        Crux.IconButton("icon-help", "show_help", "options")
            .grid(24.5, 0, 3, 3)
            .roost(optionsScreen);

        npui.OptionsMap()
            .roost(optionsScreen);

        npui.OptionsMapText()
            .roost(optionsScreen);

        npui.OptionsFleet()
            .roost(optionsScreen);

        npui.OptionsGameAdmin()
            .roost(optionsScreen);

        if (universe.player) {
            npui.OptionsAPI()
                .roost(optionsScreen);
        }

        return optionsScreen;
    };

    // -------------------------------------------------------------------------
    // User Created Games Related
    // -------------------------------------------------------------------------
    npui.CustomSettingsScreen = function () {
        var customSettings = npui.Screen("custom_settings");

        npui.CustomSettingsTable(NeptunesPride.gameConfig, universe.adminPlayer)
            .roost(customSettings);

        return customSettings;
    };

    // -------------------------------------------------------------------------
    // Empire (Galaxy Screen)
    // -------------------------------------------------------------------------
    npui.EmpireWar = function(player){
        var empireWar = Crux.Widget("rel")
            .size(480, 96);

        Crux.Text("formal_alliance", "section_title col_black")
            .grid(0, 0, 30, 3)
            .roost(empireWar);

        Crux.IconButton("icon-help", "show_help", "alliances")
            .grid(27, 0, 3, 3)
            .roost(empireWar);

        var warStatus = universe.player.war[player.uid];
        var countDownToWar = universe.player.countdown_to_war[player.uid];
        var screenConfig;

        if (countDownToWar > 0) {
            Crux.Text("war_count_down", "pad12")
                .format({time: universe.timeToTick(countDownToWar)})
                .grid(0, 3, 30, 3)
                .roost(empireWar);

            return empireWar;
        }


        if (warStatus === 0) {
            Crux.Text("war_at_peace", "pad12")
                .grid(0, 3, 30, 3)
                .roost(empireWar);

            screenConfig = {
                message: "confirm_declare_war",
                eventKind: "declare_war",
                returnScreen: "empire"
            };

            Crux.Button("war_declare_war_button", "show_screen",  ["confirm", screenConfig])
                .grid(20, 3, 10, 3)
                .roost(empireWar);
        }

        if (warStatus === 1) {
            Crux.Text("war_peace_requested", "pad12")
                .grid(0, 3, 30, 3)
                .roost(empireWar);

            screenConfig = {
                message: "confirm_accept_peace",
                eventKind: "accept_peace",
                returnScreen: "empire"
            };

            Crux.Button("war_accept_peace_button", "show_screen",  ["confirm", screenConfig])
                .grid(20, 3, 10, 3)
                .roost(empireWar);
        }

        if (warStatus === 2) {
            Crux.Text("war_requested_peace", "pad12")
                .grid(0, 3, 30, 3)
                .roost(empireWar);

            screenConfig = {
                message: "confirm_declare_war",
                eventKind: "unrequest_peace",
                returnScreen: "empire"
            };

            Crux.Button("war_unrequest_peace_button", "show_screen",  ["confirm", screenConfig])
                .grid(20, 3, 10, 3)
                .roost(empireWar);
        }

        if (warStatus === 3) {
            Crux.Text("war_at_war", "pad12")
                .grid(0, 3, 30, 3)
                .roost(empireWar);

            screenConfig = {
                message: "confirm_request_peace",
                eventKind: "request_peace",
                returnScreen: "empire"
            };

            empireWar.rqb = Crux.Button("war_request_peace_button", "show_screen",  ["confirm", screenConfig])
                .grid(15, 3, 15, 3)
                .roost(empireWar);

            if (universe.player.cash < 150) {
                empireWar.rqb.disable();
            }
        }


        return empireWar;
    };

    npui.EmpireRegard = function (player) {
        var empireRegard = Crux.Widget("rel")
            .size(480);

        Crux.Widget("rel col_black")
            .size(480, 8)
            .roost(empireRegard);

        var html = "regard_neutral";
        if (player.regard > 0) {
            html = "regard_ally";
        }
        if (player.regard < 0) {
            html = "regard_enemy";
        }
        Crux.Text(html, "rel pad12 txt_center")
            .format({x:player.regard})
            .roost(empireRegard);

        if (player.regard < 8 && player.total_economy > 1) {
            Crux.Text("regard_footer", "rel pad12 txt_center txt_tiny")
                .format({x:player.total_economy * 5})
                .roost(empireRegard);
        }

        return empireRegard;
    };

    npui.EmpireInf = function (player) {
        var empireInf = Crux.Widget("rel");

        if (player !== universe.player) {
            empireInf.size(480, 192);
        } else {
            empireInf.size(480, 144);
        }

        Crux.Text("infrastructure", "section_title col_black")
            .grid(0, 0, 30, 3)
            .roost(empireInf);


        Crux.BlockValueBig("total_economy", "icon-dollar-inline", player.total_economy, "col_accent")
            .grid(0, 3, 10, 6)
            .roost(empireInf);

        Crux.BlockValueBig("total_industry", "icon-tools-inline", player.total_industry, "col_base")
            .grid(10, 3, 10, 6)
            .roost(empireInf);

        Crux.BlockValueBig("total_science", "icon-graduation-cap-inline", player.total_science, "col_accent")
            .grid(20, 3, 10, 6)
            .roost(empireInf);

        if (player !== universe.player) {
            Crux.BlockValue("yours", universe.player.total_economy, "col_base")
                .grid(0, 9, 10, 3)
                .roost(empireInf);

            Crux.BlockValue("yours", universe.player.total_industry, "col_accent")
                .grid(10, 9, 10, 3)
                .roost(empireInf);

            Crux.BlockValue("yours", universe.player.total_science, "col_base")
                .grid(20, 9, 10, 3)
                .roost(empireInf);
        }

        return empireInf;
    };
    npui.EmpireScience = function (player) {
        var empireScience = Crux.Widget("rel")
            .size(480, 192);

        Crux.Text("technology", "section_title col_black")
            .grid(0, 0, 30, 3)
            .roost(empireScience);

        // your levels
        Crux.Text("you", "txt_center pad12")
            .grid(25, 0, 5, 3)
            .roost(empireScience);

        var p, y = 3, val="";
        for (p in player.tech) {
            // show no value if this is me.
            if (player === universe.player) {
                val = "";
            } else {
                val = player.tech[p].level;
            }
            Crux.BlockValue("tech_" + p, val, "")
                .grid(0, y, 25, 3)
                .roost(empireScience);
            y += 2;
        }

        y = 3;
        var warning = "";
        for (p in player.tech) {
            if (player.tech[p].level === universe.player.tech[p].level) {
                warning = "";
            }
            if (player.tech[p].level < universe.player.tech[p].level) {
                warning = "txt_warn_good";
            }
            if (player.tech[p].level > universe.player.tech[p].level) {
                warning = "txt_warn_bad";
            }

            Crux.Text("", "txt_center pad12 " + warning)
                .grid(25, y, 5, 3)
                .rawHTML(universe.player.tech[p].level)
                .roost(empireScience);
            y += 2;
        }

        y += 1;

        empireScience.size(480, y * 16);
        return empireScience;
    };
    npui.EmpireTrade = function (player) {
        var p, lvl;
        var empireTrade = Crux.Widget("rel")
            .size(480, 240);

        var techToTrade = {};
        for (p in player.tech) {
            if (player.tech[p].level < universe.player.tech[p].level) {
                techToTrade[p] = Crux.localise("tech_" + p);
                lvl = player.tech[p].level + 1;
                techToTrade[p] += " ( " + lvl + " - $" + (universe.galaxy.trade_cost * lvl) + " )";
            }
        }

        Crux.Text("trade", "section_title col_black")
            .grid(0, 0, 30, 3)
            .roost(empireTrade);

        Crux.IconButton("icon-help", "show_help", "trade")
            .grid(27, 0, 3, 3)
            .roost(empireTrade);

        if (NeptunesPride.gameConfig.tradeScanned && universe.player.scannedPlayers.indexOf(player.uid) < 0) {
            Crux.Text("trade_scan_required", "pad12 col_base txt_center")
                .grid(0, 3, 30, 3)
                .roost(empireTrade);

            empireTrade.size(480, 128);
            return empireTrade;
        }


        // ---------------------------------------------------------------------
        Crux.Text("trade_tech_body", "pad12")
            .grid(0, 3, 30, 3)
            .format({cost: universe.galaxy.trade_cost})
            .roost(empireTrade);

        empireTrade.techSelection = Crux.DropDown("", techToTrade, "trade_tech_selected")
            .grid(0, 5.5, 20, 3)
            .roost(empireTrade);

        empireTrade.sendTech = Crux.Button("share_tech", "pre_trade_tech")
            .grid(20, 5.5, 10, 3)
            .disable()
            .roost(empireTrade);

        // ---------------------------------------------------------------------
        Crux.Widget("col_accent")
            .grid(0, 9, 30, 6)
            .roost(empireTrade);

        Crux.Text("trade_money_body", "pad12")
            .grid(0, 9, 30, 3)
            .format({"amount": universe.player.cash})
            .roost(empireTrade);

        empireTrade.moneyToSend = Crux.TextInput("single", "money_changed", "number")
            .grid(0, 11.5, 20, 3)
            .setText(0)
            .roost(empireTrade);

        empireTrade.sendMoney = Crux.Button("send_money", "pre_send_money")
            .grid(20, 11.5, 10, 3)
            .disable()
            .roost(empireTrade);


        empireTrade.onTradeTechSelected = function () {
            var techName = empireTrade.techSelection.getValue();
            if (!techName) return;

            var price = (universe.selectedPlayer.tech[techName].level + 1) * universe.galaxy.trade_cost;
            if (universe.player.cash >= price) {
                empireTrade.sendTech.enable();
            } else {
                empireTrade.sendTech.disable();
            }
        };
        empireTrade.onTradeTechSelected(); // call to validate setup.

        empireTrade.onMoneyChanged = function () {
            if (empireTrade.moneyToSend.getValue() <= universe.player.cash &&
                empireTrade.moneyToSend.getValue() > 0) {
                empireTrade.sendMoney.enable();
            } else {
                empireTrade.sendMoney.disable();
            }
        };

        empireTrade.onPreTradeTech = function () {
            var tech = empireTrade.techSelection.getValue();
            var price = (universe.selectedPlayer.tech[tech].level + 1) * universe.galaxy.trade_cost;
            npui.trigger("hide_screen");
            var screenConfig = {
                message: "confirm_trade_tech",
                messageTemplateData: {
                    price: price,
                    tech: Crux.localise("tech_" + tech),
                    alias: player.colourBox + player.hyperlinkedRawAlias},
                eventKind: "share_tech",
                eventData: {
                    targetPlayer: player,
                    techName: tech
                },
                notification: false,
                returnScreen: "empire",
            };
            npui.trigger("show_screen",  ["confirm", screenConfig]);
        };


        empireTrade.onPreSendMoney = function () {
            var amount = empireTrade.moneyToSend.getValue();
            empireTrade.trigger("send_money", {
                targetPlayer: player,
                amount: amount
            });
        };

        empireTrade.on("trade_tech_selected", empireTrade.onTradeTechSelected);
        empireTrade.on("pre_trade_tech", empireTrade.onPreTradeTech);

        empireTrade.on("money_changed", empireTrade.onMoneyChanged);
        empireTrade.on("pre_send_money", empireTrade.onPreSendMoney);

        return empireTrade;
    };
    npui.EmpireAchievements = function (player, pa) {
        var achievements = Crux.Widget("rel col_base");

        if (universe.player && player !== universe.player) {
            achievements.size(480, 192+8);
        } else {
            achievements.size(480, 144);
        }

        npui.SharedAchievements(pa).roost(achievements);

        if (universe.player && player !== universe.player) {
            Crux.Widget("col_black")
                .grid(0, 9, 30, 3)
                .roost(achievements);

            Crux.Text("renown_points_remaining", "pad12")
                .format({rp:universe.player.karma_to_give})
                .grid(0, 9, 20, 3)
                .roost(achievements);

            if (universe.player.karma_to_give > 0 ) {
                Crux.Button("award_renown", "award_karma")
                    .grid(20, 9, 10, 3)
                    .roost(achievements);

            Crux.Widget("col_base")
                .grid(0, 12, 30, 0.5)
                .roost(achievements);

            }
        }

        return achievements;
    };

    npui.EmpireScreen = function () {
        var empireScreen = npui.Screen("empire_overview");
        var player = universe.selectedPlayer;

        Crux.IconButton("icon-help", "show_help", "diplomacy")
            .grid(24.5, 0, 3, 3)
            .roost(empireScreen);


        Crux.IconButton("icon-right-open", "key_right", "diplomacy")
            .grid(24.5 - 2.5, 0, 3, 3)
            .roost(empireScreen);

        Crux.IconButton("icon-left-open", "key_left", "diplomacy")
            .grid(24.5 - 2.5 - 2.5, 0, 3, 3)
            .roost(empireScreen);


        npui.PlayerPanel(player)
            .roost(empireScreen);

        if (universe.player) {
            if (player.ai && player.regard !== undefined) {
                npui.EmpireRegard(player)
                    .roost(empireScreen);
            }

            npui.EmpireInf(player)
                .roost(empireScreen);

            npui.EmpireScience(player)
                .roost(empireScreen);

            if (player != universe.player &&
                    universe.player.conceded === 0 && // i'm still in
                    player.conceded !== 3 && // knocked out
                    universe.galaxy.started // the game started
                    ) {
                npui.EmpireTrade(player)
                    .roost(empireScreen);
            }

            if (player != universe.player && NeptunesPride.gameConfig.alliances) {
                npui.EmpireWar(player)
                    .roost(empireScreen);
            }
        }

        var myAchievements = null;
        if (universe.playerAchievements) {
            myAchievements = universe.playerAchievements[player.uid];
        }

        if (myAchievements) {
            npui.EmpireAchievements(player, myAchievements)
                .roost(empireScreen);

            npui.SharedBadges(myAchievements.badges, true)
                .roost(empireScreen);
        }


        empireScreen.onLastEmpire = function () {
            var uid = universe.selectedPlayer.uid - 1;
            if (uid < 0) {
                uid = universe.playerCount - 1;
            }
            npui.trigger("select_player", uid);
        };
        empireScreen.onNextEmpire = function () {
            var uid = universe.selectedPlayer.uid + 1;
            if (uid > universe.playerCount - 1) {
                uid = 0;
            }
            npui.trigger("select_player", uid);
        };

        empireScreen.on("key_left", empireScreen.onLastEmpire);
        empireScreen.on("key_right", empireScreen.onNextEmpire);

        return empireScreen;
    };

    // -------------------------------------------------------------------------
    // Join Screen
    // -------------------------------------------------------------------------
    npui.LeaderboardIntro = function () {
        var lbi = Crux.Widget("rel");

        if (NeptunesPride.gameConfig.turnBased) {
            Crux.Text("tbg_settings", "rel pad12 txt_center col_accent")
                .format({
                    deadline: NeptunesPride.gameConfig.turnTime,
                    jump:NeptunesPride.gameConfig.turnJumpTicks
                })
                .roost(lbi);
        }

        if (NeptunesPride.gameConfig.description !== ""){
            Crux.Text("", "rel pad12 txt_center col_accent")
                .rawHTML(NeptunesPride.gameConfig.description)
                .roost(lbi);
        }

        if (NeptunesPride.gameConfig.non_default_settings.length > 0){
            Crux.Text("this_game_has_custom_settings", "rel pad12 txt_center col_base")
                .roost(lbi);
        }

        return lbi;
    };
    npui.JoinPlayer = function (player) {
        var joinPlayer = Crux.Widget("rel")
            .size(480, 56);

        joinPlayer.player = player;

        Crux.Widget("col_black")
            .grid(0, 0, 30, 3)
            .roost(joinPlayer);

        Crux.Widget("pci_48_" + player.uid )
            .grid(0, 0, 3, 3)
            .roost(joinPlayer);

        Crux.Image("../images/avatars/160/" + player.avatar + ".jpg", "abs")
            .grid(3, 0, 3, 3)
            .roost(joinPlayer);

        if (player.alias) {
            Crux.Text("", "section_title")
                .grid(6, 0, 25, 3)
                .rawHTML(player.alias)
                .roost(joinPlayer);

            Crux.IconButton("icon-eye", "select_player", player.uid)
                .grid(27, 0, 3, 3)
                .roost(joinPlayer);

        } else {

            Crux.IconButton("icon-eye", "select_player_pre_join", player.uid)
                .grid(17.5, 0, 3, 3)
                .roost(joinPlayer);

            Crux.Button("join", "pre_join_game", joinPlayer.player.uid)
                .grid(20, 0, 10, 3)
                .roost(joinPlayer);
        }

        joinPlayer.onPreJoinGame = function () {
            universe.joinGamePos = joinPlayer.player.uid;
            npui.trigger("join_game");
        };

        joinPlayer.on("pre_join_game", joinPlayer.onPreJoinGame, joinPlayer);
        return joinPlayer;
    };

    npui.AvatarSelector = function (index) {
        var avatarSelector = Crux.Widget("col_accent")
            .size(160, 224);

        Crux.Image("../images/avatars/160/" + index + ".jpg", "abs")
            .grid(0, 0, 10, 10)
            .roost(avatarSelector);

        Crux.Text("select_avatar", "pad12 txt_center col_black")
            .grid(0, 10, 10, 3)
            .format({index: index})
            .roost(avatarSelector);

        return avatarSelector;
    };

    npui.JoinGameBodySelectAnyAvatar = function () {
        var jgbcal = Crux.Widget("rel")
            .size(480);

        Crux.Text("select_avatar_heading", "rel txt_center pad12 col_accent")
            .size(480, 48)
            .roost(jgbcal);

        Crux.Widget("rel col_black")
            .size(480, 8)
            .roost(jgbcal);

        var bg = Crux.Widget("rel col_black")
            .size(480, 392)
            .roost(jgbcal);

        var i = 1;
        var r = 0, c = 0;
        while (i < 49) {
            npui.AvatarSelector(i)
                .grid(c * 10, (r * 14), 10, 10)
                .roost(bg);
            c += 1;
            if (c === 3) { r += 1; c = 0; }
            i += 1;
        }

        bg.size(480, r * 14 * 16);

        jgbcal.onSelectAvatar = function (e, index) {
            universe.joinGameAvatar = index;
            npui.trigger("show_screen", "join_game");
        };

        jgbcal.on("select_avatar", jgbcal.onSelectAvatar);
        return jgbcal;
    };
    npui.JoinGameBodyChooseAlias = function () {
        var jgbcal = Crux.Widget("rel")
            .size(480);

        Crux.Text("choose_alias_heading", "rel txt_center pad12 col_accent")
            .size(480)
            .roost(jgbcal);

        var bg = Crux.Widget("rel col_black")
            .size(480, 392)
            .roost(jgbcal);

        Crux.Text("choose_alias_body", "txt_center pad12")
            .grid(0, 0.5, 30, 4)
            .roost(bg);

        jgbcal.alias = Crux.TextInput("single")
            .grid(5, 7, 20, 3)
            .setValue(NeptunesPride.account.alias)
            .roost(bg);
        jgbcal.alias.node.css("text-align", "center");

        Crux.Text("choose_alias_rules", "txt_center pad12")
            .grid(0, 10, 30, 3)
            .roost(bg);

        jgbcal.select = Crux.Button("select", "join_game_select_alias")
            .grid(10, 14.5, 10, 3)
            .roost(bg);

        jgbcal.image = Crux.Image("../images/joingame_03.jpg", "abs")
            .grid(0, 18, 30, 6)
            .roost(bg);

        jgbcal.onSelectAlias = function () {
            var alias = jgbcal.alias.getValue();
            alias = universe.validateAlias(alias);
            if (alias) {
                universe.joinGameAlias = alias;
                npui.trigger("show_screen", "join_game");
            } else {
                npui.trigger("hide_screen");
                var screenConfig = {
                    message: "notification_bad_alias",
                    eventKind: "show_screen",
                    eventData: "join_game",
                    notification: true
                };
                npui.trigger("show_screen",  ["confirm", screenConfig]);
            }
        };

        jgbcal.on("join_game_select_alias", jgbcal.onSelectAlias);
        return jgbcal;
    };
    npui.JoinGameBodyChooseAvatar = function () {
        var jgbcav = Crux.Widget("rel")
            .size(480);

        Crux.Text("choose_avatar_heading", "rel txt_center pad12 col_accent")
            .size(480)
            .roost(jgbcav);

        var bg = Crux.Widget("rel col_black")
            .size(480, 392)
            .roost(jgbcav);

        jgbcav.last = Crux.IconButton("icon-left-open", "join_game_last_avatar")
            .grid(0.25, 21, 3, 3)
            .roost(bg);

        jgbcav.next = Crux.IconButton("icon-right-open", "join_game_next_avatar")
            .grid(27, 21, 3, 3)
            .roost(bg);

        jgbcav.select = Crux.Button("select", "join_game_select_avatar")
            .grid(10, 21, 10, 3)
            .roost(bg);

        jgbcav.ppo = Crux.Text("join_game_ppo", "pad12 txt_center")
            .grid(3, 21, 24, 3)
            .roost(bg);

        jgbcav.image = null;
        jgbcav.description = null;
        jgbcav.updateAvatarSelection = function () {
            var a = universe.joinGameAvatarChoices[universe.joinGameSelectedAvatarIndex];
            if (!NeptunesPride.account.premium && universe.joinGamePremiumAvatars.indexOf(a) >= 0) {
                jgbcav.select.hide();
                jgbcav.ppo.show();
            } else {
                jgbcav.select.show();
                jgbcav.ppo.hide();
            }

            if (jgbcav.image) {
                jgbcav.removeChild(jgbcav.image);
            }
            if (jgbcav.description) {
                jgbcav.removeChild(jgbcav.description);
            }
            jgbcav.image = Crux.Image("../images/avatars/240x320/" + a + ".jpg", "asb")
                .grid(0, 0.5, 15, 20)
                .roost(bg);

            jgbcav.description = Crux.Text("avatar_description_" + a, "pad12 col_base")
                .grid(15, 0.5, 15, 20)
                .roost(bg);
        };
        jgbcav.updateAvatarSelection();

        jgbcav.onLastAvatar = function (){
            universe.joinGameSelectedAvatarIndex -= 1;
            if (universe.joinGameSelectedAvatarIndex < 0) {
                universe.joinGameSelectedAvatarIndex = universe.joinGameAvatarChoices.length-1;
            }
            jgbcav.updateAvatarSelection();
        };
        jgbcav.onNextAvatar = function (){
            universe.joinGameSelectedAvatarIndex += 1;
            if (universe.joinGameSelectedAvatarIndex >= universe.joinGameAvatarChoices.length) {
                universe.joinGameSelectedAvatarIndex = 0;
            }
            jgbcav.updateAvatarSelection();
        };

        jgbcav.onSelectAvatar = function (){
            universe.joinGameAvatar = universe.joinGameAvatarChoices[universe.joinGameSelectedAvatarIndex];
            npui.trigger("show_screen", "join_game");
        };

        jgbcav.on("join_game_last_avatar", jgbcav.onLastAvatar);
        jgbcav.on("join_game_next_avatar", jgbcav.onNextAvatar);
        jgbcav.on("join_game_select_avatar", jgbcav.onSelectAvatar);
        return jgbcav;
    };
    npui.JoinGameBodyChooseLocation = function () {
        var jgbcl = Crux.Widget("rel")
            .size(480);

        Crux.Text("choose_location_heading", "rel txt_center pad12 col_accent")
            .size(480)
            .roost(jgbcl);

        Crux.Widget("rel")
            .size(480, 16)
            .roost(jgbcl);

        var p;
        for (p in universe.galaxy.players) {
                npui.JoinPlayer(universe.galaxy.players[p])
                    .roost(jgbcl);
        }

        return jgbcl;
    };
    npui.JoinGameBodyChoosePassword = function () {
        var jgbcpw = Crux.Widget("rel")
            .size(480);

        Crux.Text("choose_password_heading", "rel txt_center pad12 col_accent")
            .size(480, 48)
            .roost(jgbcpw);

        var bg = Crux.Widget("rel col_black")
            .size(480, 172)
            .roost(jgbcpw);

        Crux.Text("choose_password_body", "txt_center pad12")
            .grid(0, 0.5, 30, 4)
            .roost(bg);

        jgbcpw.pw = Crux.TextInput("single")
            .grid(5, 3.5, 20, 3)
            .roost(bg);
        jgbcpw.pw.node.css("text-align", "center");

        jgbcpw.select = Crux.Button("select", "join_game_select_password")
            .grid(10, 7, 10, 3)
            .roost(bg);

        jgbcpw.onSelectPassword = function () {
            universe.joinGamePassword = jgbcpw.pw.getValue();
            npui.trigger("show_screen", "join_game");
        };

        jgbcpw.on("join_game_select_password", jgbcpw.onSelectPassword);
        return jgbcpw;
    };

    npui.JoinGameScreen = function () {
        var joinGameScreen = npui.Screen("join_game_title");
        var p;

        if (universe.openPlayerPositions === 0) {
            Crux.Text("game_full", "txt_center col_accent pad12 rel")
                .format({game_number: NeptunesPride.gameNumber})
                .roost(joinGameScreen);

            Crux.Button("main_menu", "browse_to", "/")
                .addStyle("rel mar12")
                .size(160, 48-12)
                .pos(160-12)
                .roost(joinGameScreen);

            return joinGameScreen;
        }

        Crux.Widget("rel col_black")
            .size(480, 8)
            .roost(joinGameScreen);

        npui.LeaderboardIntro()
            .roost(joinGameScreen);

        if (NeptunesPride.gameConfig.playerType && universe.openPlayerPositions){
            Crux.Text("warning_premium_players_only", "txt_center col_warning pad12 rel")
                .format({game_number: NeptunesPride.gameNumber})
                .roost(joinGameScreen);
        }


        if (!universe.galaxy.paused && !universe.openPlayerPositions) {
            Crux.Text("this_game_has_started", "txt_center col_warning pad12 rel")
                .format({game_number: NeptunesPride.gameNumber})
                .roost(joinGameScreen);
        }

        function selectBody () {
            if (universe.joinGamePassword === "" && NeptunesPride.gameConfig.password !== "") {
                return npui.JoinGameBodyChoosePassword();
            }
            if (universe.joinGameAvatar < 0 ) {
                return npui.JoinGameBodyChooseAvatar();
            }

            if (universe.joinGameAvatar === 999) {
                return npui.JoinGameBodySelectAnyAvatar();
            }

            if (universe.joinGameAlias === "") {
                return npui.JoinGameBodyChooseAlias();
            }
            return npui.JoinGameBodyChooseLocation();
        }
        joinGameScreen.addChild(selectBody());

        Crux.Text("simple_social", "rel")
            .size(480, 176)
            .format({
                    url:"http://np.ironhelmet.com/game/" + NeptunesPride.gameNumber,
                    game_number: NeptunesPride.gameNumber
                })
            .roost(joinGameScreen);

        return joinGameScreen;
    };

    // -------------------------------------------------------------------------
    // Leaderboard
    // -------------------------------------------------------------------------
    npui.LeaderboardLeaveGame = function () {
        var ocd = Crux.Widget("rel col_accent")
            .size(480, 48);

            var screenConfig = {
                message: "sure_you_want_to_leave_game",
                messageTemplateData: null,
                eventKind: "leave_game",
                eventData: {}
            };

            Crux.Text ("leave_game_body", "pad12")
                .grid(0,0,30,3)
                .roost(ocd);

            Crux.Button("leave_game", "show_screen", ["confirm", screenConfig])
                .grid(20, 0, 10, 3)
                .roost(ocd);

        return ocd;
    };
    npui.LeaderboardConcedeDefeat = function () {
        var ocd = Crux.Widget("rel col_accent")
            .size(480, 48);

            if (universe.player.conceded === 0){

                if (universe.lastPlayerActiveAndWinning()){
                    Crux.Text ("accept_victory_body", "pad12")
                        .grid(0,0,30,3)
                        .roost(ocd);

                    Crux.Button("accept_victory", "server_request", {type: "order", order: "concede_defeat"})
                        .grid(20, 0, 10, 3)
                        .roost(ocd);

                } else {
                    var screenConfig = {
                        message: "sure_you_want_to_concede_defeat",
                        messageTemplateData: null,
                        eventKind: "server_request",
                        eventData: {type: "order", order: "concede_defeat"}
                    };

                    Crux.Text ("concede_defeat_body", "pad12")
                        .grid(0,0,30,3)
                        .roost(ocd);

                    Crux.Button("concede_defeat", "show_screen", ["confirm", screenConfig])
                        .grid(20, 0, 10, 3)
                        .roost(ocd);
                }

            }

        return ocd;
    };
    npui.LeaderboardPlayer = function (player) {
        var ysize = 48;
        var myAchievements;
        if (universe.playerAchievements) {
            if (universe.playerAchievements[player.uid]) {
                myAchievements = universe.playerAchievements[player.uid];
                if (myAchievements.true_alias) {
                    ysize = 96;
                }
            }
        }

        var leaderboardPlayer = Crux.Widget("rel player_cell")
            .size(480, ysize);

        Crux.Widget("col_black")
            .grid(0, 0, 30, 3)
            .roost(leaderboardPlayer);

        Crux.Widget("pci_48_" + player.uid )
            .grid(0, 0, 3, 3)
            .roost(leaderboardPlayer);

        Crux.Image("../images/avatars/160/" + player.avatar + ".jpg", "abs")
            .grid(3, 0, 3, 3)
            .roost(leaderboardPlayer);

        var html = player.alias;
        var style = "section_title txt_ellipsis";
        if (universe.galaxy.turn_based === 1 && universe.galaxy.game_over === 0){
            if (player.ready === 1 && player.conceded === 0) {

                style = "premium_section_title txt_ellipsis icon-ok-inline";
            }
        }

        Crux.Text("", style)
            .grid(6, 0, 16, 3)
            .rawHTML(html)
            .roost(leaderboardPlayer);

        if (ysize === 96) {
            Crux.Text("true_alias", "txt_ellipsis pad12")
                .grid(4, 3, 26, 3)
                .format({alias: myAchievements.true_alias})
                .roost(leaderboardPlayer);
        }

        Crux.Text("x_stars", "txt_right pad12")
            .format({count:player.total_stars})
            .grid(21,0,6,3)
            .roost(leaderboardPlayer);

        Crux.IconButton("icon-eye", "select_player", [player.uid, true])
            .grid(27, 0, 3, 3)
            .roost(leaderboardPlayer);


        return leaderboardPlayer;
    };
    npui.LeaderboardScreen = function () {
        var leaderboardScreen = npui.Screen("leaderboard");

        var opc = 0, apc = 0, ypos = 0;
        var templateData;
        var player = {};
        var property = "";

        var sortedPlayers = [];
        var afkPlayers = [];
        var html = "";
        for (property in universe.galaxy.players) {
            if (universe.galaxy.players[property].alias === "") {
                opc += 1;
            } else {
                apc += 1;
                if (universe.galaxy.players[property].conceded === 2) {
                    html = universe.galaxy.players[property].hyperlinkedBox + universe.galaxy.players[property].hyperlinkedAlias;
                    html += " (" + universe.galaxy.players[property].total_stars + ")";
                    if (universe.playerAchievements && universe.playerAchievements[property] &&  universe.playerAchievements[property].true_alias) {
                        html += " " + universe.playerAchievements[property].true_alias;
                    }

                    afkPlayers.push(html);
                } else {
                    sortedPlayers.push(universe.galaxy.players[property]);
                }
            }
        }

        sortedPlayers.sort(function compareNumbers(a, b) {
            if (b.total_stars === a.total_stars) {
                return b.total_strength - a.total_strength;
            }
            return b.total_stars - a.total_stars;
        });

        Crux.Text("", "rel pad12 txt_center col_black  section_title")
            .rawHTML(NeptunesPride.gameConfig.name)
            .roost(leaderboardScreen);

        if (opc && !universe.galaxy.game_over) {
            Crux.Widget("rel")
                .size(480, 8)
                .roost(leaderboardScreen);

            Crux.Text("leaderboard_open", "txt_center col_accent pad12 rel")
                .format({open: opc})
                .roost(leaderboardScreen);

            Crux.Text("simple_social", "rel")
                .size(480, 176)
                .format({
                    url:"http://np.ironhelmet.com/game/" + NeptunesPride.gameNumber,
                    game_number: NeptunesPride.gameNumber
                })
                .roost(leaderboardScreen);

            Crux.Widget("rel col_black")
                .size(480, 8)
                .roost(leaderboardScreen);
        }


        npui.LeaderboardIntro()
            .roost(leaderboardScreen);

        if (universe.galaxy.game_over) {
            Crux.Text("game_over", "txt_center col_accent rel pad12")
                .roost(leaderboardScreen);
        } else {
            Crux.Text("leaderboard_heading", "txt_center col_accent rel pad12")
                .format({
                    productions: universe.galaxy.productions,
                    tick: universe.galaxy.tick,
                    victory: universe.galaxy.stars_for_victory,
                    totalStars: universe.galaxy.total_stars })
                .roost(leaderboardScreen);
        }

        Crux.Widget("rel")
            .size(480, 16)
            .roost(leaderboardScreen);

        for (property in sortedPlayers) {
            npui.LeaderboardPlayer(sortedPlayers[property])
                .roost(leaderboardScreen);
        }

        if (afkPlayers.length) {
            var afkPlayerNames = afkPlayers.join(", ");
            Crux.Text("afk_player_list", "rel pad12 txt_center")
                .format({names: afkPlayerNames})
                .size(480)
                .roost(leaderboardScreen);
        }

        if (universe.galaxy.started) {
            npui.LeaderboardConcedeDefeat()
                .roost(leaderboardScreen);
        } else {
            npui.LeaderboardLeaveGame()
                .roost(leaderboardScreen);
        }

        if (universe.galaxy.game_over) {
            Crux.Text("simple_social_game_over")
                .size(480, 128 - 8)
                .addStyle("col_accent")
                .format({
                    url:"http://np.ironhelmet.com/game/" + NeptunesPride.gameNumber,
                    game_number: NeptunesPride.gameNumber
                })
                .roost(leaderboardScreen);
        }

        return leaderboardScreen;
    };

    // -------------------------------------------------------------------------
    // Technology
    // -------------------------------------------------------------------------
    npui.TechRow = function (tech, name) {
        var techRow = Crux.Widget("rel  col_accent")
            .size(480, 48*6);

        var html, element;

        Crux.Text("tech_" + name, "section_title col_black rel")
            .grid(0, 0, 30, 3)
            .roost(techRow);

        Crux.Image("../images/tech_" + name + ".jpg", "abs")
            .size(160, 240)
            .roost(techRow);

        Crux.Text("tech_description_" + name, "col_accent pad12")
            .grid(10, 3, 20, 15)
            .format({tr:universe.describeTickRate(), pr:universe.describeProductionRate()})
            .roost(techRow);

        if (universe.player.researching === name) {
            Crux.Text("active", "txt_right pad12")
                .grid(20, 0, 10, 3)
                .roost(techRow);

        } else if (universe.player.researching_next === name) {
            Crux.Text("research_next", "txt_right pad12")
                .grid(20, 0, 10, 3)
                .roost(techRow);
        }

        if (tech.brr === 0){
            Crux.Text("unavailable_this_game", "txt_right pad12")
                .grid(20, 0, 10, 3)
                .roost(techRow);
        }



        return techRow;
    };
    npui.TechNowSelection = function () {
        var p;
        var techNow = Crux.Widget("rel  col_accent")
            .size(480, 96);

        Crux.Text("research_now", "pad12")
            .roost(techNow);

        var selections = {};
        for (p in universe.player.tech) {
            if (universe.player.tech[p].brr > 0){
                selections[p] = Crux.localise("tech_" + p);
            }
        }

        Crux.DropDown(universe.player.researching, selections, "change_research")
            .grid(15,0,15,3)
            .roost(techNow);

        // TODO: This logic should be in Universe.
        var tech = universe.player.tech[universe.player.researching];
        var nextLevel = Number(tech.level) * Number(tech.brr);
        var pointsRequired = nextLevel - Number(tech.research);

        if (universe.player.total_science === 0){
            techNow.ticks = 0;
        } else {
            techNow.ticks = pointsRequired / universe.player.total_science;
            techNow.ticks = Math.ceil(techNow.ticks);
        }

        var eta = universe.timeToTick(techNow.ticks);
        techNow.eta = Crux.BlockValue("current_research_eta", eta, "col_base")
            .grid(0, 3, 30, 3)
            .roost(techNow);

        techNow.onTick = function () {
            techNow.eta.value.rawHTML(universe.timeToTick(techNow.ticks));
        };

        techNow.on("one_second_tick", techNow.onTick);

        return techNow;
    };
    npui.TechNextSelection = function () {
        var p;
        var techNow = Crux.Widget("rel  col_accent")
            .size(480, 48);

        Crux.Text("research_next", "pad12")
            .roost(techNow);

        var selections = {};
        for (p in universe.player.tech) {
            if (universe.player.tech[p].brr > 0) {
                selections[p] = Crux.localise("tech_" + p);
            }
        }

        Crux.DropDown(universe.player.researching_next, selections, "change_research_next")
            .grid(15,0,15,3)
            .roost(techNow);

        return techNow;
    };

    npui.TechSummary = function () {
        var p, html;
        var techNow = Crux.Widget("rel  col_base")
            .size(480);

        Crux.Text("tech_summary", "section_title col_black rel")
            .grid(0, 0, 30, 3)
            .roost(techNow);

        var bg = Crux.Widget("rel")
            .roost(techNow);

        var yPos = 0;
        for (p in universe.player.tech) {
            var tech = universe.player.tech[p];
            if (universe.player.tech[p].brr > 0){
                Crux.Text("tech_" + p, "pad12")
                    .grid(0, yPos, 30, 2)
                    .roost(bg);

                Crux.Text("level_x", "pad12")
                    .format({x:tech.level})
                    .grid(14, yPos, 6, 2)
                    .roost(bg);

                html = tech.research + " of " + (Number(tech.level) * Number(tech.brr));
                Crux.Text("", "txt_right pad12")
                    .rawHTML(html)
                    .grid(20, yPos, 10, 2)
                    .roost(bg);

                yPos += 2;
            }
        }
        bg.size(480, yPos * 16);


        Crux.Widget("rel")
            .size(480, 16)
            .roost(techNow);

        return techNow;
    };
    npui.TechScreen = function () {
        var techScreen = npui.Screen("research");
        var p;


        Crux.IconButton("icon-help", "show_help", "tech")
            .grid(24.5, 0, 3, 3)
            .roost(techScreen);

        Crux.Text("tech_intro", "col_black rel pad12 txt_center")
            .format({tr:universe.describeTickRate()})
            .roost(techScreen);


        techScreen.f1 = Crux.Widget("rel")
            .size(480, 48)
            .roost(techScreen);

        Crux.BlockValue("total_science", universe.player.total_science, "")
            .grid(0, 0, 30, 3)
            .roost(techScreen.f1);

        npui.TechNowSelection()
            .roost(techScreen);

        npui.TechNextSelection()
            .roost(techScreen);

        npui.TechSummary()
            .roost(techScreen);

        for (p in universe.player.tech) {
            npui.TechRow(universe.player.tech[p], p)
                .roost(techScreen);
        }

        return techScreen;
    };

    // -------------------------------------------------------------------------
    // Diplomacy
    // -------------------------------------------------------------------------
    npui.InboxTabs = function () {
        var inboxTabs = Crux.Widget("rel")
            .size(480, 48);

        inboxTabs.tickCount = 0;

        Crux.Widget("col_accent_light")
            .grid(0, 2.5, 30, 0.5)
            .roost(inboxTabs);

        inboxTabs.diplomacyTab = Crux.Tab("diplomacy", "inbox_set_filter", "game_diplomacy")
            .grid(0, -0.5, 10, 3)
            .roost(inboxTabs);

        inboxTabs.eventTab = Crux.Tab("events", "inbox_set_filter", "game_event")
            .grid(10, -0.5, 10, 3)
            .roost(inboxTabs);

        if (inbox.filter === "game_diplomacy") {
            inboxTabs.diplomacyTab.activate();
        }
        if (inbox.filter === "game_event") {
            inboxTabs.eventTab.activate();
        }


        inboxTabs.onOneSecondTick = function () {
            inboxTabs.tickCount += 1;
            if (inbox.unreadDiplomacy > 0) {
                if (inboxTabs.tickCount % 2) {
                    inboxTabs.diplomacyTab.label.updateFormat("diplomacy_c", {count: inbox.unreadDiplomacy});
                } else {
                    inboxTabs.diplomacyTab.label.update("diplomacy");
                }
            }
            if (inbox.unreadEvents > 0) {
                if (inboxTabs.tickCount % 2) {
                    inboxTabs.eventTab.label.updateFormat("events_c", {count: inbox.unreadEvents});
                } else {
                    inboxTabs.eventTab.label.update("events");
                }
            }

        };
       inboxTabs.on("one_second_tick", inboxTabs.onOneSecondTick);

       return inboxTabs;
    };
    npui.InboxNewMessageButton = function () {
        var inboxNewMessageButton = Crux.Widget("rel col_black")
            .size(480, 48);

        Crux.IconButton("icon-mail", "show_screen", "compose")
            .grid(0, 0, 3, 3)
            .roost(inboxNewMessageButton);

        Crux.IconButton("icon-loop", "inbox_relaod_filter")
            .grid(2.5, 0, 3, 3)
            .roost(inboxNewMessageButton);

        Crux.Button("read_all", "inbox_read_all")
            .grid(20, 0, 10, 3)
            .roost(inboxNewMessageButton);

        return inboxNewMessageButton;
    };
    npui.InboxEventHeader = function () {
        var inboxEventHeader = Crux.Widget("rel col_black")
            .size(480);


        Crux.Text("event_header", "pad12 rel")
            .roost(inboxEventHeader);

        Crux.Button("read_all", "inbox_read_all")
            .grid(20, 0, 10, 3)
            .roost(inboxEventHeader);

        return inboxEventHeader;
    };
    npui.InboxBackButton = function () {
        var inboxBackButton = Crux.Widget("rel col_accent")
            .size(480, 48);

        Crux.Button("back", "show_screen", "inbox")
            .grid(0, 0, 10, 3)
            .roost(inboxBackButton);

        return inboxBackButton;
    };
    npui.InboxScreen = function () {
        var inboxScreen = {};

        inboxScreen = npui.Screen("inbox");

        var i = 0, leni = 0;
        var message = {};
        var alt = false;

        npui.InboxTabs()
            .roost(inboxScreen);

        if (inbox.filter === "game_diplomacy") {
            npui.InboxNewMessageButton()
                .roost(inboxScreen);
        }

        if (inbox.filter === "game_event") {
            npui.InboxEventHeader()
                .roost(inboxScreen);
        }

        if (inbox.loading) {
            Crux.Text("loading", "rel txt_center pad12")
                .size(480, 48)
                .roost(inboxScreen);
        }

        if (!inbox.loading && inbox.messages[inbox.filter] !== null) {
            if (inbox.messages[inbox.filter].length === 0) {
                Crux.Text("no_messages", "rel txt_center pad12")
                    .size(480, 48)
                    .roost(inboxScreen);
            }
        }

        if (!inbox.loading && inbox.messages[inbox.filter]) {
            for (i = 0, leni = inbox.messages[inbox.filter].length; i < leni; i += 1) {
                message = inbox.messages[inbox.filter][i];
                if (alt) {
                    alt = false;
                } else {
                    alt = true;
                }

                if (inbox.filter === "game_diplomacy") {
                    npui.InboxRow(message.payload.subject, message, alt)
                        .roost(inboxScreen);
                }
                if (inbox.filter === "game_event") {
                    npui.InboxRowEvent(message, alt)
                        .roost(inboxScreen);
                }
            }
        }

        npui.InboxScreenFooter()
            .roost(inboxScreen);

        return inboxScreen;
    };

    // -------------------------------------------------------------------------
    npui.InboxRow = function (label, message, alt) {
        var inboxRow = Crux.Clickable("inbox_select_message", message)
            .addStyle("rel minh72");

        var html = "";

        if (alt) {
            inboxRow.configStyles("click_row_up", "click_row_down", "click_row_hover", "click_row_disabled");
        } else {
            inboxRow.configStyles("click_row_up_alt", "click_row_down", "click_row_hover", "click_row_disabled");
        }

        var player = universe.galaxy.players[message.payload.from_uid];
        if (player) {
            Crux.Image("../images/avatars/160/" + player.avatar + ".jpg", "abs")
                .grid(0, 0.75, 3, 3)
                .roost(inboxRow);

            html = Crux.formatDate(new Date(message.created));
            if (message.status === "unread") {
                html += "<br><span class='txt_anchor'>" + Crux.localise("unread_comments") + "</span>";
            }

            Crux.Text("", "pad12 txt_right txt_tiny txt_em")
                .grid(0,0,30,0)
                .rawHTML(html)
                .roost(inboxRow);

            Crux.Text("fromto", "pad12")
                .size(96)
                .pos(48)
                .roost(inboxRow);

            var subjectStyle = "";
            if (message.status === "unread") {
                subjectStyle = "txt_anchor";
            }
            html = inbox.createToList(message, true) + "<br><span class='" + subjectStyle  + "'>" + label + "</span>";
            inboxRow.label = Crux.Text("", "pad12 rel")
                .rawHTML(html)
                .size(384)
                .pos(96)
                .roost(inboxRow);

        } else {
            var col = "col_black";
            if (message.status === "unread") {
                col = "col_unread";
            }

            Crux.Widget(col + " pad8")
                .pos(0, 12)
                .size(48, 48)
                .roost(inboxRow);

            Crux.Text("", "txt_center pad8 button_text")
                .rawHTML(message.payload.tick)
                .pos(0, 16)
                .size(48, 48)
                .roost(inboxRow);

            inboxRow.label = Crux.Text("", "pad12 rel")
            .rawHTML(label)
            .size(432)
            .pos(48)
            .roost(inboxRow);
        }

        return inboxRow;
    };
    npui.InboxRowEvent = function (message, alt) {
        var giver, receiver, prop;
        var inboxRowEvent = Crux.Clickable("inbox_read_message", message)
            .addStyle("rel minh72");

        var template, templateData;
        if (alt) {
            inboxRowEvent.configStyles("click_row_up", "click_row_down", "click_row_hover", "click_row_disabled");
        } else {
            inboxRowEvent.configStyles("click_row_up_alt", "click_row_down", "click_row_hover", "click_row_disabled");
        }

        template = "message_event_" + message.payload.template;
        templateData = message.payload;
        templateData.creationTime = Crux.formatDate(new Date(message.created));

        //-----------------------------------------------------------------------
        if (message.payload.template === "ai_chat: enemy_of_enemy_is_friend") {
            templateData["aiColour"] = universe.galaxy.players[message.payload.from_puid].colourBox;
            templateData["aiAlias"] = universe.galaxy.players[message.payload.from_puid].hyperlinkedAlias;
            inboxRowEvent.body = Crux.Text("", "rel pad12")
                .size(432)
                .pos(48)
                .roost(inboxRowEvent);
            inboxRowEvent.body.updateFormat(template, templateData);
        }

        //-----------------------------------------------------------------------
        if (message.payload.template === "production_new") {
            templateData["localised_tech_name"] = Crux.localise("tech_" + message.payload.tech_name);
            if (message.payload.tech_points === 0) {
                template = "message_event_production_new_no_tech";
            }
            inboxRowEvent.body = Crux.Text("", "rel pad12")
                .size(432)
                .pos(48)
                .roost(inboxRowEvent);
            inboxRowEvent.body.updateFormat(template, templateData);
        }

        //-----------------------------------------------------------------------
        if (message.payload.template === "tech_up") {
            templateData["tech_name"] = Crux.localise("tech_" + message.payload.tech);
            templateData["tech_desc"] = Crux.localise("tech_description_" + message.payload.tech);
            template = "message_event_tech_up";
            inboxRowEvent.body = Crux.Text("", "rel pad12")
                .size(432)
                .pos(48)
                .roost(inboxRowEvent);
            inboxRowEvent.body.updateFormat(template, templateData);
        }

        //-----------------------------------------------------------------------
        if (message.payload.template === "tech_up_exp") {
            templateData["tech_name"] = Crux.localise("tech_" + message.payload.tech);
            if (message.payload.points === 0) {
                template = "message_event_tech_up_exp_disabled";
            } else {
                template = "message_event_tech_up_exp";
            }
            inboxRowEvent.body = Crux.Text("", "rel pad12")
                .size(432)
                .pos(48)
                .roost(inboxRowEvent);
            inboxRowEvent.body.updateFormat(template, templateData);
        }

        //-----------------------------------------------------------------------
        if (message.payload.template === "peace_requested") {
            templateData["fromColour"] = universe.galaxy.players[message.payload.from_puid].colourBox;
            templateData["toColour"] = universe.galaxy.players[message.payload.to_puid].colourBox;
            templateData["fromAlias"] = universe.galaxy.players[message.payload.from_puid].hyperlinkedAlias;
            templateData["toAlias"] = universe.galaxy.players[message.payload.to_puid].hyperlinkedAlias;
            if (universe.player.uid === message.payload.from_puid) {
                template = "message_event_" + message.payload.template + "_giver";
            } else {
                template = "message_event_" + message.payload.template + "_receiver";
            }
            inboxRowEvent.body = Crux.Text("", "rel pad12")
                .size(432)
                .pos(48)
                .roost(inboxRowEvent);
            inboxRowEvent.body.updateFormat(template, templateData);
        }

        //-----------------------------------------------------------------------
        if (message.payload.template === "peace_accepted") {
            templateData["fromColour"] = universe.galaxy.players[message.payload.from_puid].colourBox;
            templateData["toColour"] = universe.galaxy.players[message.payload.to_puid].colourBox;
            templateData["fromAlias"] = universe.galaxy.players[message.payload.from_puid].hyperlinkedAlias;
            templateData["toAlias"] = universe.galaxy.players[message.payload.to_puid].hyperlinkedAlias;
            if (universe.player.uid === message.payload.from_puid) {
                template = "message_event_" + message.payload.template + "_giver";
            } else {
                template = "message_event_" + message.payload.template + "_receiver";
            }
            inboxRowEvent.body = Crux.Text("", "rel pad12")
                .size(432)
                .pos(48)
                .roost(inboxRowEvent);
            inboxRowEvent.body.updateFormat(template, templateData);
        }

        //-----------------------------------------------------------------------
        if (message.payload.template === "war_declared") {
            templateData["attackerColour"] = universe.galaxy.players[message.payload.attacker].colourBox;
            templateData["defenderColour"] = universe.galaxy.players[message.payload.defender].colourBox;
            templateData["attackerAlias"] = universe.galaxy.players[message.payload.attacker].hyperlinkedAlias;
            templateData["defenderAlias"] = universe.galaxy.players[message.payload.defender].hyperlinkedAlias;
            template = "message_event_" + message.payload.template;
            inboxRowEvent.body = Crux.Text("", "rel pad12")
                .size(432)
                .pos(48)
                .roost(inboxRowEvent);
            inboxRowEvent.body.updateFormat(template, templateData);
        }

        //-----------------------------------------------------------------------
        if (message.payload.template === "goodbye_to_player_inactivity" ||
            message.payload.template === "goodbye_to_player_defeated" ||
            message.payload.template === "accept_victory" ||
            message.payload.template === "goodbye_to_player") {

            templateData["colour"] = universe.galaxy.players[message.payload.uid].colourBox;
            templateData["name"] = universe.galaxy.players[message.payload.uid].hyperlinkedAlias;
            template = "message_event_" + message.payload.template;

            inboxRowEvent.body = Crux.Text("", "rel pad12")
                .size(432)
                .pos(48)
                .roost(inboxRowEvent);
            inboxRowEvent.body.updateFormat(template, templateData);
        }

        //-----------------------------------------------------------------------
        if (message.payload.template === "star_given") {
            giver = universe.galaxy.players[message.payload.from_puid];
            receiver = universe.galaxy.players[message.payload.to_puid];
            templateData["display_name"] = "unknown";
            if (message.payload.star_name){
                templateData["display_name"] = message.payload.star_name;
            }
            if (universe.galaxy.stars[message.payload.suid]){
                templateData["display_name"] = universe.galaxy.stars[message.payload.suid].hyperlinkedName;
            }
            templateData["giverName"] = giver.alias;
            templateData["giverColour"] = giver.colourBox;
            templateData["giverUid"] = giver.uid;
            templateData["receiverName"] = receiver.alias;
            templateData["receiverColour"] = receiver.colourBox;
            templateData["receiverUid"] = receiver.uid;
            if (universe.player === giver) {
                template = "message_event_star_given_giver";
            } else {
                template = "message_event_star_given_receiver";
            }
            inboxRowEvent.body = Crux.Text("", "rel pad12")
                .size(432)
                .pos(48)
                .roost(inboxRowEvent);
            inboxRowEvent.body.updateFormat(template, templateData);
        }

        //-----------------------------------------------------------------------
        if (message.payload.template === "shared_technology") {
            giver = universe.galaxy.players[message.payload.from_puid];
            receiver = universe.galaxy.players[message.payload.to_puid];
            templateData["display_name"] = Crux.localise("tech_" + message.payload.name);
            templateData["giverName"] = giver.hyperlinkedAlias;
            templateData["giverColour"] = giver.colourBox;
            templateData["giverUid"] = giver.uid;
            templateData["receiverName"] = receiver.hyperlinkedAlias;
            templateData["receiverColour"] = receiver.colourBox;
            templateData["receiverUid"] = receiver.uid;

            if (message.payload.price !== undefined) {
                templateData["level"] = message.payload.level;
                templateData["price"] = message.payload.price;
                if (universe.player === giver) {
                    template = "message_event_shared_technology_giver_new";
                } else {
                    template = "message_event_shared_technology_receiver_new";
                }
            } else {
                if (universe.player === giver) {
                    template = "message_event_shared_technology_giver";
                } else {
                    template = "message_event_shared_technology_receiver";
                }
            }
            inboxRowEvent.body = Crux.Text("", "rel pad12")
                .size(432)
                .pos(48)
                .roost(inboxRowEvent);
            inboxRowEvent.body.updateFormat(template, templateData);
        }

        //-----------------------------------------------------------------------
        if (message.payload.template === "money_sent") {
            giver = universe.galaxy.players[message.payload.from_puid];
            receiver = universe.galaxy.players[message.payload.to_puid];
            templateData["giverName"] = giver.alias;
            templateData["giverColour"] = giver.colourBox;
            templateData["giverUid"] = giver.uid;
            templateData["receiverName"] = receiver.alias;
            templateData["receiverColour"] = receiver.colourBox;
            templateData["receiverUid"] = receiver.uid;
            templateData["amount"] = message.payload.amount;
            if (universe.player === giver) {
                template = "message_event_money_giver";
            } else {
                template = "message_event_money_receiver";
            }

            inboxRowEvent.body = Crux.Text("", "rel pad12")
                .size(432)
                .pos(48)
                .roost(inboxRowEvent);
            inboxRowEvent.body.updateFormat(template, templateData);
        }

        //-----------------------------------------------------------------------
        if (message.payload.template === "combat") {
            inboxRowEvent.body = npui.CombatEventBody(message)
                .roost(inboxRowEvent);
        }
        //-----------------------------------------------------------------------
        if (message.payload.template === "combat_mk_ii") {
            inboxRowEvent.body = npui.CombatMkIIEventBody(message)
                .roost(inboxRowEvent);
        }

        var col = "col_black";
        if (message.status === "unread") {
            col = "col_unread";
        }

        Crux.Widget(col + " pad8")
            .pos(0, 12)
            .size(48, 48)
            .roost(inboxRowEvent);

        Crux.Text("", "txt_center pad8 button_text")
            .rawHTML(message.payload.tick)
            .pos(0, 16)
            .size(48, 48)
            .roost(inboxRowEvent);


        return inboxRowEvent;
    };

    npui.CombatMkIIEventBody = function (message)  {
        var widget = Crux.Widget("rel");
        var prop, template;

        function expandFleet(fleet) {
            return {
                kind:       "Carrier",
                name:        fleet.n,
                icon:       "<div class='icon-rocket'></div>",
                colour:      universe.galaxy.players[fleet.puid].colourBox,
                player:      universe.galaxy.players[fleet.puid].hyperlinkedAlias,
                shipsStart:  fleet.ss,
                shipsEnd:    fleet.es,
                weaponSkill: fleet.w,
                shipsLost:   fleet.ss - fleet.es,
            };
        }
        function addPlayer(fighter) {
            if (templateData.players[fighter.puid] === undefined){
                templateData.players[fighter.puid] = {
                    colour:     universe.galaxy.players[fighter.puid].colourBox,
                    alias:      universe.galaxy.players[fighter.puid].hyperlinkedAlias,
                    shipsStart: fighter.ss,
                    shipsEnd:   fighter.es};
            } else {
                templateData.players[fighter.puid].shipsStart += fighter.ss;
                templateData.players[fighter.puid].shipsEnd += fighter.es;
            }
        }

        var templateData = {};

        templateData.tick = message.payload.tick;
        templateData.players = {};
        templateData.star = {};
        templateData.defenders = {};
        templateData.attackers = {};

        var star = message.payload.star;
        templateData.star.uid = star.uid;
        templateData.star.kind = "Star";
        templateData.star.icon = "<div class='icon-star-1'></div>";
        templateData.star.colour = universe.galaxy.players[star.puid].colourBox;
        templateData.star.player = universe.galaxy.players[star.puid].hyperlinkedAlias;
        templateData.star.name = star.name;
        templateData.star.shipsStart = star.ss;
        templateData.star.shipsEnd = star.es;
        templateData.star.weaponSkill = star.w;
        templateData.star.shipsLost = star.ss - star.es;
        addPlayer(star);

        if (universe.galaxy.stars[star.uid]) {
            template = "message_event_combat_scanned";
        } else {
            template = "message_event_combat_unscanned";
        }
        widget.body = Crux.Text(template, "rel pad12")
            .size(432)
            .pos(48)
            .format(templateData.star)
            .roost(widget);

        for (prop in message.payload.attackers) {
            var attacker = message.payload.attackers[prop];
            templateData.attackers[prop] = expandFleet(attacker);
            addPlayer(attacker);
        }

        for (prop in message.payload.defenders) {
            var defender = message.payload.defenders[prop];
            templateData.defenders[prop] = expandFleet(defender);
            addPlayer(defender);
        }

        // for (prop in templateData.players) {
        //     Crux.Text("message_event_combat_players", "rel pad12")
        //         .size(432)
        //         .pos(48)
        //         .format(templateData.players[prop])
        //         .roost(widget);
        // }

        // the combat summary table.
        // table test.
        var rowTemplate = "<tr><td>[[icon]]</td><td>[[colour]]</td><td>[[player]]</td><td>[[shipsStart]]</td><td>[[shipsLost]]</td><td>[[shipsEnd]]</td></tr>";

        // defender table
        var table;
        table = "<table class='combat_result'>";
        table += "<tr><td></td><td></td><td></td><td>Before</td><td>Lost</td><td>After</td></tr>";
        table += "<tr><td colspan='6' style='text-align:left' class='combat_result_teams_heading'>Defenders: Weapons " + (message.payload.dw -1) + " (+1)</td></tr>";
        table += Crux.format(rowTemplate, templateData.star);
        for (prop in templateData.defenders) {
            table += Crux.format(rowTemplate, templateData.defenders[prop]);
        }

        table += "<tr><td colspan='6' style='text-align:left' class='combat_result_teams_heading'>Attackers: Weapons " + message.payload.aw + "</td></tr>";
        for (prop in templateData.attackers) {
            table += Crux.format(rowTemplate, templateData.attackers[prop]);
        }
        table += "</table>";

        Crux.Text("", "rel")
            .size(400-12)
            .pos(48+12)
            .rawHTML(table)
            .format(templateData)
            .roost(widget);

        templateData.alias = universe.galaxy.players[message.payload.looter].hyperlinkedAlias;
        templateData.loot = message.payload.loot;
        if (message.payload.loot > 0) {
            Crux.Text("message_event_combatmkii_loot", "rel pad12")
                .size(432)
                .pos(48)
                .format(templateData)
                .roost(widget);
        }

        Crux.Widget("rel")
            .size(432, 16)
            .roost(widget);


        return widget;
    };
    npui.CombatEventBody = function (message) {
        var widget = Crux.Widget("rel");
        var prop, template;
        var templateData = {};
        templateData.tick = message.payload.tick;

        var cPlayers = {};
        templateData.star = {};
        var star = message.payload.st;

        templateData.star.uid = star.uid;
        templateData.star.kind = "Star";
        templateData.star.colour = universe.galaxy.players[star.puid].colourBox;
        templateData.star.player = universe.galaxy.players[star.puid].hyperlinkedAlias;
        templateData.star.shipsStart = star.ss;
        templateData.star.shipsEnd = star.es;
        templateData.star.weaponSkill = star.w;
        templateData.star.name = star.name;

        if (universe.galaxy.stars[star.uid]) {
            // todo: we can delete this after a few weeks when all combat events have star names.
            templateData.star.name = universe.galaxy.stars[star.uid].n;
        }

        templateData.defender = universe.galaxy.players[star.puid].hyperlinkedAlias;
        templateData.winner = universe.galaxy.players[message.payload.w].hyperlinkedAlias;

        templateData.salvage = message.payload.s;

        cPlayers[star.puid] = {
            colour:universe.galaxy.players[star.puid].colourBox,
            alias:universe.galaxy.players[star.puid].hyperlinkedAlias,
            shipsStart:star.ss,
            shipsEnd:star.es};

        templateData.fleets = {};
        for (prop in message.payload.f) {
            var fleet = message.payload.f[prop];
            templateData.fleets[prop] = {
                kind:"Carrier",
                name:fleet.n,
                colour: universe.galaxy.players[fleet.puid].colourBox,
                player:universe.galaxy.players[fleet.puid].hyperlinkedAlias,
                shipsStart:fleet.ss,
                shipsEnd:fleet.es,
                weaponSkill:fleet.w
            };

            if (cPlayers[fleet.puid] === undefined){
                cPlayers[fleet.puid] = {
                    colour:universe.galaxy.players[fleet.puid].colourBox,
                    alias:universe.galaxy.players[fleet.puid].hyperlinkedAlias,
                    shipsStart:fleet.ss,
                    shipsEnd:fleet.es};
            } else {
                cPlayers[fleet.puid].shipsStart += fleet.ss;
                cPlayers[fleet.puid].shipsEnd += fleet.es;
            }
        }

        if (universe.galaxy.stars[star.uid]) {
            template = "message_event_combat_scanned";
        } else {
            template = "message_event_combat_unscanned";
        }
        widget.body = Crux.Text(template, "rel pad12")
            .size(432)
            .pos(48)
            .format(templateData.star)
            .roost(widget);

        for (var puid in cPlayers) {
            Crux.Text("message_event_combat_players", "rel pad12")
                .size(432)
                .pos(48)
                .format(cPlayers[puid])
                .roost(widget);
        }

        Crux.Text("message_event_combat_end", "rel pad12")
            .size(432)
            .pos(48)
            .format(templateData)
            .roost(widget);

        // table test.
        var table = "<table class='combat_result'>";
        var rowTemplate = "<tr><td>[[colour]]</td><td>[[kind]]</td><td>[[shipsStart]] Ships</td><td>[[weaponSkill]]</td><td>[[shipsEnd]] Ships</td></tr>";
        table += "<tr><td>&nbsp;</td><td>Unit</td><td>Before</td><td>Tech</td><td>After</td></tr>";
        table += Crux.format(rowTemplate,
                    templateData.star);
        for (prop in templateData.fleets) {
            table += Crux.format(rowTemplate,
                    templateData.fleets[prop]);
        }
        table += "</table>";

        Crux.Text("", "rel")
            .size(432)
            .pos(48)
            .rawHTML(table)
            .format(templateData)
            .roost(widget);

        Crux.Widget("rel")
            .size(480, 16)
            .roost(widget);

        return widget;
    };
    npui.InboxScreenFooter = function () {
        var inboxScreenFooter = Crux.Widget("rel")
            .size(480, 48 + 8);

        Crux.Widget("col_black")
            .grid(0, 0, 30, 0.5)
            .roost(inboxScreenFooter);

        inboxScreenFooter.back = Crux.Button("back", "inbox_page_back")
            .grid(18, 0.5, 5, 3)
            .roost(inboxScreenFooter);

        inboxScreenFooter.next = Crux.Button("next", "inbox_page_next")
            .grid(22.5, 0.5, 5, 3)
            .roost(inboxScreenFooter);

        screen.closeButton = Crux.IconButton("icon-cancel", "hide_screen")
            .grid(27, 0.5, 3, 3)
            .roost(inboxScreenFooter);


        if (inbox.page === 0) {
            inboxScreenFooter.back.disable();
        }

        inboxScreenFooter.next.disable();
        if (inbox.messages[inbox.filter] !== null){
            if (inbox.messages[inbox.filter].length === inbox.mpp) {
                inboxScreenFooter.next.enable();
            }
        }
        return inboxScreenFooter;
    };
    npui.DiplomacyDetailScreen = function () {
        var diplomacyDetailScreen = npui.Screen("diplomacy");
        var message = inbox.selectedMessage;
        var i, leni, html, player;

        npui.InboxBackButton()
            .roost(diplomacyDetailScreen);

        var msg = Crux.Widget("rel")
            .roost(diplomacyDetailScreen);

        var sendingPlayer = universe.galaxy.players[message.payload.from_uid];

        var btn = Crux.Clickable("select_player", sendingPlayer.uid)
            .roost(msg);

        Crux.Image("../images/avatars/160/" + sendingPlayer.avatar + ".jpg", "abs")
            .grid(0, 0.75, 3, 3)
            .roost(btn);

        Crux.Text("fromto", "pad12")
            .size(96)
            .pos(48)
            .roost(msg);

        html = inbox.createToList(message);
        Crux.Text("", "pad12 rel minh72")
            .size(384)
            .pos(96)
            .rawHTML(html)
            .roost(msg);

        Crux.Text("", "pad12 txt_right txt_tiny txt_em")
            .grid(20, 0, 10, 0)
            .rawHTML(Crux.formatDate(new Date(message.created)))
            .roost(msg);

        Crux.Text("", "pad12 col_accent rel txt_selectable")
            .size(432)
            .pos(48)
            .rawHTML(message.payload.subject)
            .roost(msg);

        html = message.payload.body.replace(/\n/g, '<br>');
        html = inbox.hyperlinkMessage(html);
        Crux.Text("", "pad12 rel txt_selectable")
            .size(432)
            .pos(48)

            .rawHTML(html)
            .roost(msg);

        Crux.Widget("rel col_grey")
            .size(480,8)
            .roost(msg);

        if (!message.commentsLoaded) {
            Crux.Text("loading_comments", "col_accent txt_center pad12 rel")
                .size(480, 48)
                .roost(diplomacyDetailScreen);
        } else {
            if (!inbox.noOlderComments && inbox.selectedMessage.comments.length === inbox.cpp) {
                // there may be more comments on the server.
                Crux.Text("inbox_load_older_comments", "col_black txt_center pad12 rel")
                    .size(480, 48)
                    .roost(diplomacyDetailScreen);
            }
        }


        if (message.comments) {
            for (i = inbox.selectedMessage.comments.length-1;  i >= 0; i -= 1) {
                npui.MessageComment(inbox.selectedMessage.comments[i], i)
                    .roost(diplomacyDetailScreen);
            }
        }

        npui.NewMessageCommentBox()
            .roost(diplomacyDetailScreen);

        return diplomacyDetailScreen;
    };

    npui.NewMessageCommentBox = function () {
        var widget = Crux.Widget("rel")
            .size(480, 240);

        widget.comment = Crux.TextInput("multi", "comment_box_change")
            .grid(0, 0.25, 30, 12)
            .setText(inbox.commentDrafts[inbox.selectedMessage.key])
            .focus()
            .roost(widget);

        widget.send = Crux.Button("send", "pre_inboxt_post_comment")
            .grid(20, 12, 10, 3)
            .roost(widget);

        Crux.Button("back", "show_screen", "inbox")
            .grid(0, 12, 10, 3)
            .roost(widget);

        widget.onChange = function () {
            inbox.commentDrafts[inbox.selectedMessage.key] = widget.comment.getText();
        };

        widget.onPrePostComment = function () {
            inbox.commentDrafts[inbox.selectedMessage.key] = "";
            var comment =  widget.comment.getText();
            widget.comment.setText("");
            widget.trigger("inboxt_post_comment", comment);
        };

        widget.onInsertStarName = function (event, starName) {
            widget.comment.insert(starName);
        };

        widget.on("pre_inboxt_post_comment", widget.onPrePostComment);
        widget.on("comment_box_change", widget.onChange);
        widget.on("insert_star_name", widget.onInsertStarName);

        return widget;
    };
    npui.MessageComment = function (comment, i) {
        var messageComment = Crux.Widget("rel minh72");

        if (i % 2 === 0) {
            messageComment.addStyle("col_accent");
        }

        Crux.Text("", "pad12 txt_right txt_tiny txt_em")
            .grid(20, 0, 10, 0)
            .rawHTML(Crux.formatDate(new Date(comment.created)))
            .roost(messageComment);

        var player = universe.galaxy.players[comment.player_uid];

        var btn = Crux.Clickable("select_player", player.uid)
            .roost(messageComment);

        Crux.Image("../images/avatars/160/" + player.avatar + ".jpg", "abs")
            .grid(0, 0.75, 3, 3)
            .roost(btn);

        var html =  player.colourBox + " " + player.hyperlinkedAlias + "<br>";
        html += comment.body.replace(/\n/g, '<br />');

        html = inbox.hyperlinkMessage(html);

        messageComment.comment = Crux.Text("comment", "rel pad12 txt_selectable")
            .size(416)
            .pos(48)
            .format({message: html})
            .roost(messageComment);

        return messageComment;
    };

    // -------------------------------------------------------------------------
    npui.ComposeDiplomacyScreen = function () {
        var widget = npui.Screen("new_message");
        var i, player, html;


        Crux.Text("", "pad12")
            .rawHTML("To: ")
            .grid(0, 3, 3, 3)
            .roost(widget);

        var pf = [universe.player.uid];
        for (i = inbox.draft.to.length - 1; i >= 0; i--) {
            pf.push(inbox.draft.to[i]);
        }

        if (pf.length !== universe.filledPlayerPositions && pf.length <= 18) {
            var screenConfig = {
                name: "select_player",
                body: "compose_select_player_body",
                returnScreen: "compose",
                selectionEvent: "inbox_add_recipient",
                playerFilter: pf
            };

            Crux.Button("", "show_screen", ["select_player", screenConfig])
                .grid(21.5, 3, 3, 3)
                .rawHTML("+")
                .roost(widget);

            var  allBtn = Crux.Button("all", "inboxt_draft_addall")
                    .grid(24, 3, 6, 3)
                    .roost(widget);

            if (universe.playerCount > 18) {
                // you can't add all players in games with more than 8 players
                allBtn.disable();
            }
        }

        html = "";
        for (i = inbox.draft.to.length - 1; i >= 0; i--) {
            player = universe.galaxy.players[inbox.draft.to[i]];
            html += player.colourBox + player.qualifiedAlias;
            html += "<br>";
        }
        if (html === "") html = "<br>";

        widget.to = Crux.Text("", "rel pad12")
            .size(272)
            .pos(48, 0)
            .rawHTML(html)
            .roost(widget);

        widget.bc = Crux.Widget("rel")
            .size(480, 368)
            .pos(0)
            .roost(widget);

        widget.subject = Crux.TextInput("single")
            .grid(0,0,30,3)
            .setText(inbox.draft.subject)
            .roost(widget.bc);

        widget.body = Crux.TextInput("multi")
            .grid(0, 3, 30, 12)
            .setText(inbox.draft.body)
            .roost(widget.bc);

        widget.send = Crux.Button("send", "inbox_draft_send")
            .grid(20, 15, 10, 3)
            .disable()
            .roost(widget.bc);

        widget.clear = Crux.Button("clear", "inboxt_draft_clear")
            .grid(0, 15, 10, 3)
            .roost(widget.bc);

        Crux.Widget("col_accent")
            .grid(0, 18.5, 30, 0.5)
            .roost(widget.bc);

        Crux.Widget("col_black")
            .grid(0, 19, 30, 4)
            .roost(widget.bc);

        Crux.Text("compose_footer","txt_center txt_small pad8")
            .grid(0, 19, 30, 4)
            .roost(widget.bc);

        widget.onChange = function () {
            inbox.draft.body = widget.body.getText();
            inbox.draft.subject = widget.subject.getText();
            widget.validate();
        };

        widget.validate = function () {
            if (inbox.draft.subject !== "" &&
                    inbox.draft.body !== "") {
                widget.send.enable();
            } else {
                widget.send.disable();
            }
        };
        widget.validate();

        widget.onInsertStarName = function (event, starName) {
            widget.body.insert(starName);
        };

        widget.body.node.on("keyup", widget.onChange);
        widget.subject.node.on("keyup", widget.onChange);

        widget.on("insert_star_name", widget.onInsertStarName);

        return widget;
    };


};
})();
