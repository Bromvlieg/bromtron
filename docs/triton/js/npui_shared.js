/*globals Crux: true, console: true, jQuery:true */
if (!NeptunesPride) {var NeptunesPride = {};}
(function () {

"use strict";
NeptunesPride.SharedInterface = function (npui) {
    // extends the npui object with shared constructors
    npui.BadgeIcon = function (filename, count, small) {
        var ebi = Crux.Widget();
        if (small === undefined) small = false;

        if (small) {
            Crux.Image("/images/badges_small/" + filename + ".png", "abs")
                .grid(0.25, 0.25, 2.5, 2.5)
                .roost(ebi);

            Crux.Clickable("show_screen", "buy_gift")
                .grid(0.25, 0.25, 2.5, 2.5)
                .tt("badge_" + filename)
                .roost(ebi);

        } else {
            Crux.Image("/images/badges/" + filename + ".png", "abs")
                .grid(0, 0, 6, 6)
                .roost(ebi);

            Crux.Clickable("show_screen", "buy_gift")
                .grid(0, 0, 6, 6)
                .tt("badge_" + filename)
                .roost(ebi);
        }

        if (count > 1 && ! small) {
            Crux.Image("/images/badges/counter.png", "abs")
                .grid(0, 0, 6, 6)
                .roost(ebi);

            Crux.Text("","txt_center txt_tiny", "abs")
                .rawHTML(count)
                .pos(51 , 64)
                .size(32, 32)
                .roost(ebi);
        }

        return ebi;
    };
    npui.groupBadges = function (badgesString) {
        if (!badgesString) badgesString = "";
        var groupedBadges = {};
        var i;
        for (i = badgesString.length - 1; i >= 0; i--) {
            var bchar = badgesString.charAt(i);
            if (groupedBadges.hasOwnProperty(bchar)){
                groupedBadges[bchar] += 1;
            } else {
                groupedBadges[bchar] = 1;
            }
        }
        return groupedBadges;
    };

    npui.badgeFileNames = {
        "A": "honour",
        "B": "lifetime",
        "C": "tourney_win",
        "D": "tourney_join",
        "E": "bullseye",
        "F": "bullseye",

        "G": "wolf",
        "H": "pirate",
        "I": "wordsmith",
        "J": "lucky",
        "K": "cheesy",
        "L": "strategic",
        "M": "badass",
        "N": "lionheart",
        "O": "ironborn",
        "P": "gun",
        "Q": "conquest",
        "R": "command",
        "S": "strange",
        "T": "nerd",
        "U": "magic",
        "V": "toxic",
        "W": "wizard",
        "X": "rat",
        "Y": "science",
        "Z": "merit",

        "1": "trek",
        "2": "rebel",
        "3": "empire",

        "4": "proteus",
        "5": "flambeau",
    };
    
    npui.SharedBadges = function (badgesString, showText) {
        var badges = Crux.Widget("rel col_base rel");
        badges.size(480);

        Crux.Text("badges", "section_title col_black rel")
            .size(480, 48)
            .roost(badges);

        Crux.IconButton("icon-help", "show_help", "badges")
            .grid(27, 0, 3, 3)
            .roost(badges);

        var groupedBadges = npui.groupBadges(badgesString);

        if (badgesString === "") {
            Crux.Text("badges_none", "pad12 txt_center rel")
                .size(480)
                .roost(badges);
        } else {
            badges.bg = Crux.Widget("rel")
                .size(480)
                .roost(badges);

            var x = -6, y = 0.5;
            var prop, badgeCount;
            for (prop in groupedBadges) {
                badgeCount = groupedBadges[prop];
                x += 6;
                if (x > 26) {
                    y += 6;
                    x = -0;
                }
                npui.BadgeIcon(npui.badgeFileNames[prop], badgeCount, false)
                    .grid(x, y, 6, 6)
                    .roost(badges.bg);
            }
            badges.bg.size(480, y*16 + 96+16);
        }

        if (showText) {
            Crux.Text("badges_body", "pad12 rel col_black")
                .size(480)
                .roost(badges);
        }
        return badges;
    };

    npui.SmallBadgeRow = function (badgesString) {
        var sbr = Crux.Widget("");

        var groupedBadges = npui.groupBadges(badgesString);
        var prop, badgeCount, x=27;
        var inc = 15 / Object.keys(groupedBadges).length;
        if (inc > 2) {
            inc = 2;
        }
        for (prop in groupedBadges) {
            badgeCount = groupedBadges[prop];
            npui.BadgeIcon(npui.badgeFileNames[prop], badgeCount, true)
                .grid(x, 0, 3, 3)
                .roost(sbr);
            x -= inc;
        }

        return sbr;
    };

    npui.SharedAchievements = function (pa) {
        var achievements = Crux.Widget("rel col_base")
            .size(480, 144);

        Crux.Text("achievements", "rel section_title col_black")
            .size(480, 48)
            .roost(achievements);

        Crux.IconButton("icon-help", "show_help", "achievements")
            .grid(27, 0, 3, 3)
            .roost(achievements);

        npui.SharedAchievementsBody(pa).roost(achievements);

        return achievements;
    };

    npui.SharedAchievementsBody = function (pa) {
        var sab = Crux.Widget("rel col_base")
            .size(480, 96);

        Crux.BlockValueBig("victories", "icon-award-inline", pa.games_won, "col_accent")
            .grid(0, 0, 10, 6)
            .roost(sab);

        Crux.BlockValueBig("rank", "icon-star-inline", pa.score, "col_base")
            .grid(10, 0, 10, 6)
            .roost(sab);

        Crux.BlockValueBig("renown", "icon-heart-inline", pa.karma, "col_accent")
            .grid(20, 0, 10, 6)
            .roost(sab);

        return sab;
    };

    npui.CustomSettingsTable = function (gameConfig, adminPlayer) {
        var cst = Crux.Widget("rel");

        if (adminPlayer && gameConfig.anonymity === 0) {
            Crux.Text("custom_settings_intro", "pad12 col_accent txt_center rel")
                .format({creator:adminPlayer.hyperlinkedAlias})
                .roost(cst);
        } else {
            if (gameConfig.non_default_settings.length) {
                Crux.Text("custom_settings_intro_no_admin", "pad12 col_accent txt_center rel")
                    .roost(cst);
            } else {
                Crux.Text("custom_settings_intro_standard", "pad12 col_accent txt_center rel")
                    .roost(cst);
            }
        }

        var i = 0;
        var prop = "";
        var localisedValue = "";
        var val = 0;

        var allSettings = [
                "-",
                "starsForVictory",
                "playerType",
                "alliances",
                "anonymity",
                "turnBased",
                "tickRate",
                "turnJumpTicks",
                "turnTime",
                "-",
                "buildGates",
                "randomGates",
                "darkGalaxy",
                "starfield",
                "starScatter",
                "-",
                "starsPerPlayer",
                "homeStarDistance",
                "naturalResources",
                "productionTicks",
                "-",
                "startingStars",
                "startingCash",
                "startingShips",
                "-",
                "startingInfEconomy",
                "startingInfIndustry",
                "startingInfScience",
                "-",
                "developmentCostEconomy",
                "developmentCostIndustry",
                "developmentCostScience",
                "-",
                "tradeCost",
                "tradeScanned",
                "-",
                "researchCostTerraforming",
                "researchCostExperimentation",
                "researchCostScanning",
                "researchCostHyperspace",
                "researchCostManufacturing",
                "researchCostBanking",
                "researchCostWeapons",
                "-",
                "startingTechTerraforming",
                "startingTechExperimentation",
                "startingTechScanning",
                "startingTechHyperspace",
                "startingTechManufacturing",
                "startingTechBanking",
                "startingTechWeapons",
        ];

        if (gameConfig.turnBased) {
            allSettings.splice(allSettings.indexOf("tickRate"), 1);
        } else {
            allSettings.splice(allSettings.indexOf("turnJumpTicks"), 1);
            allSettings.splice(allSettings.indexOf("turnTime"), 1);
        }

        var html = "<table class='custom_settings'>";

        for (i = 0; i < allSettings.length; i+=1) {
            prop = allSettings[i];
            if (prop === "-"){
                html += "<tr><td class='col_black'></td><td class='col_black'></td></tr>";
                continue;
            }

            val = gameConfig[prop];

            if (prop.substring(0, 12) === "startingTech") {
                localisedValue = Crux.localise("cgs_startingTech") + val;
            } else if (prop.substring(0, 12) === "researchCost") {
                localisedValue = Crux.localise("cgs_researchCost_" + val);
            } else if (prop.substring(0, 15) === "developmentCost"){
                localisedValue = Crux.localise("cgs_developmentCost_" + val);
            } else if (prop.substring(0, 11) === "startingInf"){
                localisedValue = val;
            } else if (prop === "startingStars"){
                localisedValue = val;
            } else if (prop === "players"){
                localisedValue = val;
            } else {
                localisedValue = Crux.localise("cgs_" + prop + "_" + val);
            }

            var stl = "";
            if (gameConfig.non_default_settings.indexOf(prop) >= 0){
                stl = "txt_warn_bad";
            }

            html += "<tr><td>" + Crux.localise("cgs_" + prop) + "</td><td class='" + stl + "'>" + localisedValue + "</td></tr>";
        }

        html += "</table>";
        Crux.Text("", "rel col_base")
            .size(480)
            .rawHTML(html)
            .roost(cst);


        return cst;
    };

};
})();
