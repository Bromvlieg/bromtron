/*globals Crux: true, console: true, store: true*/
if (!NeptunesPride) {var NeptunesPride = {};}
(function () {
NeptunesPride.Universe = function () {
    "use strict";
    var universe;

    universe = {};
    universe.galaxy = null;
    universe.playerAchievements = null;

    universe.outstandingRequests = 0;
    universe.loading = false;

    // the logged in player
    universe.player = null;

    universe.selectedStar = null;
    universe.selectedFleet = null;
    universe.selectedPlayer = null;
    universe.selectedSpaceObject = null;

    universe.waypoints = [];

    universe.editMode = "normal";

    // misc
    universe.playerCount = 0;
    universe.openPlayerPositions = 0;
    universe.filledPlayerPositions = 0;

    universe.hyperlinkedMessageInserts = {};

    // time
    universe.now = 0;
    universe.locTimeCorrection = 0;

    // intel screen
    universe.intelDataRequestPending = false;
    universe.intelDataType = "ts";
    universe.intelPlayerToChart = [];
    universe.intelData = null;
    universe.intelDataNone = false;
    universe.intelDataFull = null;
    universe.intelDataRecievedTime = null;
    universe.IntelChartOptions = {
        lineWidth: 3,
        "backgroundColor": {fill:"#000000"},
        "chartArea" : {left: 0, top:0, width: 480, height: 256},
        "fontSize": 14,
        "fontName": "OpenSansRegular",
        "hAxis":{
            gridlines: {color: '#2C3273', count: 4},
            textPosition: "in",
            textStyle :   {color: "SeaShell", fontName: "OpenSansRegular", fontSize: 14},
            baselineColor: '#2C3273'

        },
        "vAxis":{
            gridlines: {color: '#2C3273', count: 4},
            textPosition: "in",
            textStyle:   {color: "SeaShell", fontName: "OpenSansRegular", fontSize: 14},
            baselineColor: '#2C3273'

        },
        "legend":{
            position: "none"
        },
        "colors": [],
        'width':480,
        'height':256};


    universe.movieMode = false;

    // joining a game
    universe.joinGamePos = -1;
    universe.joinGameAlias = "";
    universe.joinGameAvatar = -1;
    universe.joinGamePassword = "";

    universe.joinGameSelectedAvatarIndex = 0;
    universe.joinGameAvatarChoices = [38, 33, 34, 32, 36, 50, 31, 26, 30, 44, 23, 16, 999];
    universe.joinGamePremiumAvatars = [31, 26, 30, 44, 23, 16, 999];


    universe.defaultFleetOrderOverride = 0;
    universe.askForLooping = false;

    //--------------------------------------------------------------------------
    universe.addGalaxy = function (galaxy) {
        var player, star, fleet, i, ii, j;
        universe.galaxy = galaxy;

        if (Number(universe.galaxy.player_uid) !== -1) {
            universe.player = universe.galaxy.players[universe.galaxy.player_uid];
            universe.player.scannedPlayers = [];
        } else {
            universe.player = null;
        }

        if (universe.selectedPlayer) {
            universe.selectedPlayer = universe.galaxy.players[universe.selectedPlayer.uid];
        } else {
            universe.selectedPlayer = universe.player;
        }

        if (Number(universe.galaxy.admin) !== -1) {
            universe.adminPlayer = universe.galaxy.players[universe.galaxy.admin];
        } else {
            universe.adminPlayer = null;
        }

        // time
        universe.now = new Date(universe.galaxy.now);
        universe.locTimeCorrection = universe.now.valueOf() - new Date().valueOf();

        universe.galaxy.turnDue = null;
        if (universe.galaxy.turn_based_time_out > 0) {
            universe.galaxy.turnDue = new Date(universe.galaxy.turn_based_time_out);
        }

        // all players
        universe.playerCount = 0;
        universe.openPlayerPositions = 0;
        universe.filledPlayerPositions = 0;

        for (i in universe.galaxy.players) {
            universe.expandPlayerData(universe.galaxy.players[i]);
        }

        for (i in universe.galaxy.stars) {
            universe.expandStarData(universe.galaxy.stars[i]);
        }
        for (i in universe.galaxy.fleets) {
            universe.expandFleetData(universe.galaxy.fleets[i]);
        }

        // stars again
        for (i in universe.galaxy.stars) {
            star = universe.galaxy.stars[i];
            star.totalDefenses = star.st;
            star.victoryBonus = 0;
            star.uce = universe.calcUCE(star);
            star.uci = universe.calcUCI(star);
            star.ucs = universe.calcUCS(star);
            star.ucg = universe.calcUCG(star);

            for (j = star.fleetsInOrbit.length - 1; j >= 0; j--) {
                star.totalDefenses += universe.galaxy.stars[i].fleetsInOrbit[j].st;
            }

        }

        if (universe.player && NeptunesPride.gameConfig.tradeScanned) {
            for (i in universe.galaxy.stars) {
                star = universe.galaxy.stars[i];
                if (!star.player) continue;
                if (star.v > 0 && universe.isDrectlyScanned(star)) {
                    if (universe.player.scannedPlayers.indexOf(star.puid) < 0) {
                        universe.player.scannedPlayers.push(star.puid);
                    }
                }
            }
        }

        // new selected objects
        if (universe.selectedStar) {
            universe.selectedStar = universe.galaxy.stars[universe.selectedStar.uid];
        }

        if (universe.selectedFleet) {
            if (universe.selectedFleet.oldPath) {
                // we must be editing this fleets path right now.
                // lets not stomp on our new path data.
                var newFleet = universe.galaxy.fleets[universe.selectedFleet.uid];
                var oldFleet = universe.selectedFleet;
                newFleet.oldPath = newFleet.path;
                newFleet.path = [];
                for (j=0; j < oldFleet.path.length; j+=1) {
                    // we have to recreate the array here otherwise we'll carry
                    // references to stars in the old galaxy data.
                    newFleet.path.push(universe.galaxy.stars[oldFleet.path[j].uid]);
                }
            }
            universe.selectedFleet = universe.galaxy.fleets[universe.selectedFleet.uid];
        }


        if (universe.selectedSpaceObject){
            if (universe.selectedSpaceObject.kind === "fleet") {
                universe.selectedSpaceObject = universe.selectedFleet;
            }
            if (universe.selectedSpaceObject.kind === "star") {
                universe.selectedSpaceObject = universe.selectedStar;
            }
        }

        if (universe.editMode === "edit_waypoints") {
            universe.calcWaypoints();
        }

        // show the players stats if not showing any.
        if (!universe.intelPlayerToChart.length) {
            if (universe.player) {
                universe.intelPlayerToChart.push(universe.player.uid);
            }
        }

        if (universe.player) {
            universe.calcPlayerTotalInf();
        }
        universe.initRuler();
        universe.calcCenterOfGalaxy();
    };

    universe.calcPlayerTotalInf = function (){
        var star, i;

        universe.player.total_economy = 0;
        universe.player.total_industry = 0;
        universe.player.total_science = 0;

        for (i in universe.galaxy.stars) {
            star = universe.galaxy.stars[i];
            if (star.player === universe.player) {
                universe.player.total_economy += star.e;
                universe.player.total_industry += star.i;
                universe.player.total_science += star.s;
            }
        }
    };

    //--------------------------------------------------------------------------
    universe.expandPlayerData = function(player) {
        player.kind = "player";
        player.home = universe.galaxy.stars[player.huid];
        if (!player.home) {
            // in a dark galaxy you might not be able to see your home.
            // instead, find the best star for the player.
            player.home = universe.findBestStar(player);
        }
        player.colorIndex = Math.floor(player.uid % 8);
        player.shapeIndex = Math.floor(player.uid / 8);
        player.color = universe.playerColors[player.colorIndex];
        player.colorName = universe.playerColorNames[player.colorIndex];
        player.colourBox = "<span class='playericon_font pc_" + player.colorIndex + "'>"+player.shapeIndex+"</span>";

        universe.playerCount += 1;

        player.rawAlias = player.alias;
        if (player.alias === "") {
            player.hyperlinkedAlias = "an open player position";
            player.qualifiedAlias = "an open player position";
            universe.openPlayerPositions += 1;
        } else {
            if (!universe.galaxy.game_over){
                if (player.conceded === 1) {
                    player.alias += " (QUIT)";
                }
                if (player.conceded === 2) {
                    player.alias += " (AFK)";
                }
                if (player.conceded === 3) {
                    player.alias += " (KO)";
                }
                if (player.conceded > 0) {
                    player.avatar = 0;
                }

            }

            player.hyperlinkedAlias = '<a onClick="Crux.crux.trigger(\'show_player_uid\', \'' + player.uid + '\' )">' + player.alias + '</a>';
            player.hyperlinkedRawAlias = '<a onClick="Crux.crux.trigger(\'show_player_uid\', \'' + player.uid + '\' )">' + player.rawAlias + '</a>';
            player.hyperlinkedBox = '<a onClick="Crux.crux.trigger(\'show_player_uid\', \'' + player.uid + '\' )">' + "<span class='playericon_font pc_" + player.colorIndex + "'>"+player.shapeIndex+"</span>" + '</a>';
            player.qualifiedAlias = player.alias;
            universe.filledPlayerPositions += 1;

        }
        player.shipsPerTick = universe.calcShipsPerTickTotal(player);

        universe.hyperlinkedMessageInserts[player.uid] = player.hyperlinkedBox + player.hyperlinkedRawAlias;
    };
    universe.expandStarData = function(star){
        star.kind = "star";
        star.fleetsInOrbit = [];
        star.alliedDefenders = [];
        star.player = universe.galaxy.players[star.puid];
        if (star.player) {
            star.qualifiedAlias = star.player.qualifiedAlias;
            star.hyperlinkedAlias = star.player.hyperlinkedAlias;
            star.colourBox = star.player.colourBox;
            star.shipsPerTick = universe.calcShipsPerTick(star);
        } else {
            star.qualifiedAlias = "";
        }

        star.owned = false;
        if (universe.galaxy.player_uid === star.puid) {
            star.owned = true;
        }

        if (star.v === "0") {
            // if this star is cloaked or outside scanning range.
            star.st = 0;
            star.e  = 0;
            star.i  = 0;
            star.s  = 0;

            star.uce  = 0;
            star.uci  = 0;
            star.ucs  = 0;

            star.c  = 0;
            star.g  = 0;
            star.r  = 0;
            star.nr  = 0;
        }

        star.n = star.n.replace(/[^a-z0-9_ ]/gi, '_');
        star.hyperlinkedName = "<a onClick='Crux.crux.trigger(\"show_star_uid\", \"" + star.uid + "\")'>" + star.n + "</a>";
        universe.hyperlinkedMessageInserts[star.n] = star.hyperlinkedName;
    };
    universe.expandFleetData = function(fleet) {
        var star;
        fleet.kind = "fleet";
        fleet.warpSpeed = fleet.w;
        fleet.player = universe.galaxy.players[fleet.puid];
        fleet.orders = fleet.o;
        fleet.loop = fleet.l;

        if (fleet.player) {
            fleet.qualifiedAlias = fleet.player.qualifiedAlias;
            fleet.hyperlinkedAlias = fleet.player.hyperlinkedAlias;
            fleet.colourBox = fleet.player.colourBox;
        } else {
            fleet.qualifiedAlias = "";
        }
        fleet.orbiting = null;
        if (fleet.ouid) {
            fleet.orbiting = universe.galaxy.stars[fleet.ouid];
            if (fleet.orbiting) {
                star = universe.galaxy.stars[fleet.ouid];
                star.fleetsInOrbit.push(fleet);
                if (fleet.puid !== star.puid) {
                    // the player of the fleet and star are different, must be
                    // ally helping defend.
                    if (star.alliedDefenders.indexOf(fleet.puid) < 0) {
                        star.alliedDefenders.push(fleet.puid);
                    }
                }
            }
        }

        fleet.path = [];
        var order, i, ii;
        for (i = 0, ii = fleet.orders.length; i < ii; i+=1) {
            order = fleet.orders[i];
            if (universe.galaxy.stars[order[1]]){
                fleet.path.push(universe.galaxy.stars[order[1]]);
            } else {
                fleet.unScannedStarInPath = true;
                break;
            }
        }

        fleet.owned = false;
        if (universe.galaxy.player_uid === fleet.puid) {
            fleet.owned = true;
        }

        fleet.lastStar = null;
        universe.calcFleetEta(fleet);
    };

    //--------------------------------------------------------------------------
    universe.calcCenterOfGalaxy = function(){
        var min_x = 1000;
        var min_y = 1000;
        var max_x = -1000;
        var max_y = -1000;
        var p, s;
        for (p in universe.galaxy.stars) {
            s = universe.galaxy.stars[p];
            s.x = Number(s.x);
            s.y = Number(s.y);
            if (s.x < min_x) min_x = s.x;
            if (s.y < min_y) min_y = s.y;
            if (s.x > max_x) max_x = s.x;
            if (s.y > max_y) max_y = s.y;
        }
        universe.centerX = (max_x + min_x) / 2.0;
        universe.centerY = (max_y + min_y) / 2.0;
    };


    //--------------------------------------------------------------------------
    universe.selectFleet = function (fleet) {
        universe.selectedPlayer = fleet.player;
        universe.selectedFleet = fleet;
        universe.selectedSpaceObject = fleet;
        universe.selectedStar = null;
    };
    universe.selectStar = function (star) {
        universe.selectedPlayer = star.player;
        universe.selectedStar = star;
        universe.selectedSpaceObject = star;
        universe.selectedFleet = null;
    };
    universe.selectPlayer = function (player) {
        universe.selectedPlayer = player;
        universe.selectedStar = null;
        universe.selectedSpaceObject = null;
        universe.selectedFleet = null;
    };
    universe.selectNone = function (star) {
        universe.selectedPlayer = null;
        universe.selectedStar = null;
        universe.selectedSpaceObject = null;
        universe.selectedFleet = null;
    };
    //--------------------------------------------------------------------------
    universe.seekSelection = function (x, y) {
        var posibleSelections, i;
        posibleSelections = [];
        if (universe.interfaceSettings.showStars) {
            for (i in universe.galaxy.stars) {
                if ((universe.galaxy.stars[i].x > x - 0.04) &&
                        (universe.galaxy.stars[i].x < x + 0.04) &&
                        (universe.galaxy.stars[i].y > y - 0.04) &&
                        (universe.galaxy.stars[i].y < y + 0.04)) {
                    posibleSelections.push(universe.galaxy.stars[i]);
                }
            }
        }
        if (universe.interfaceSettings.showFleets) {
            for (i in universe.galaxy.fleets) {
                if ((universe.galaxy.fleets[i].x > x - 0.04) &&
                        (universe.galaxy.fleets[i].x < x + 0.04) &&
                        (universe.galaxy.fleets[i].y > y - 0.04) &&
                        (universe.galaxy.fleets[i].y < y + 0.04)) {
                    posibleSelections.push(universe.galaxy.fleets[i]);
                }
            }
        }
        universe.possibleSelections = posibleSelections;
        return posibleSelections;
    };

    universe.isInRange = function (u1, u2, range) {
        var dx, dy, dist;
        dx = Math.abs(u1.x - u2.x);
        dy = Math.abs(u1.y - u2.y);
        dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= range) {
            return true;
        }
        return false;
    };
    universe.isSameLocation = function (u1, u2) {
        if (u1.x === u2.x  && u1.y === u2.y) {
            return true;
        }
        return false;
    };


    //--------------------------------------------------------------------------

    universe.findBestStar = function (player) {
        var s, star, best;
        for (s in universe.galaxy.stars) {
            star = universe.galaxy.stars[s];
            if (star.puid !== player.uid) continue;
            if (best === undefined) best = star;
            if (star.r > best.r) best = star;
        }
        return best;
    };
    universe.findCheapestUpgrade = function (kind) {
        var s, star, cheapest;
        for (s in universe.galaxy.stars) {
            star = universe.galaxy.stars[s];
            if (star.player !== universe.player) continue;

            if (cheapest === undefined) cheapest = star;
            if (kind === "economy") {
                if (star.uce < cheapest.uce) cheapest = star;
            }
            if (kind === "industry") {
                if (star.uci < cheapest.uci) cheapest = star;
            }
            if (kind === "science") {
                if (star.ucs < cheapest.ucs) cheapest = star;
            }
        }
        return cheapest;
    };
    //--------------------------------------------------------------------------
    universe.upgradeEconomy = function (star) {
        if (star === undefined) star = universe.selectedStar;
        if (!star) return;
        universe.player.cash -= star.uce;
        star.uce = 0;
        star.e += 1;
        star.uce = universe.calcUCE(star);
        universe.player.total_economy += 1;
    };
    universe.upgradeIndustry = function (star) {
        if (star === undefined) star = universe.selectedStar;
        if (!star) return;
        universe.player.cash -= star.uci;
        star.uci = 0;
        star.i += 1;
        star.uci = universe.calcUCI(star);
        universe.player.total_industry += 1;
        star.shipsPerTick = universe.calcShipsPerTick(star);
        universe.player.shipsPerTick = universe.calcShipsPerTickTotal(universe.player);
    };
    universe.upgradeScience = function (star) {
        if (star === undefined) star = universe.selectedStar;
        if (!star) return;
        universe.player.cash -= star.ucs;
        star.ucs = 0;
        star.s += 1;
        star.ucs = universe.calcUCS(star);
        universe.player.total_science += 1;
    };
    universe.buyWarpGate = function (star) {
        if (star === undefined) star = universe.selectedStar;
        if (!star) return;
        universe.player.cash -= star.ucg;
        star.ucg = 0;
        star.ga = 1;
    };
    universe.destroyWarpGate = function (star) {
        if (star === undefined) star = universe.selectedStar;
        if (!star) return;
        star.ga = 0;
        star.ucg = universe.calcUCG(star);
    };
    universe.abandonStar = function (star) {
        if (star === undefined) star = universe.selectedStar;
        if (!star) return;

        star.player.stars_abandoned += 1;

        star.strength = 0;
        star.puid = -1;
        star.player = undefined;
        star.owned = false;
        star.spriteOwner = undefined;
    };

    //--------------------------------------------------------------------------
    universe.calcUCE = function (star) {
        if (star.player !== universe.player) return 0;
        return Math.floor((2.5 * NeptunesPride.gameConfig.developmentCostEconomy * (star.e + 1)) / (star.r / 100));
    };
    universe.calcUCI = function (star) {
        if (star.player !== universe.player) return 0;
        return Math.floor((5 * NeptunesPride.gameConfig.developmentCostIndustry * (star.i + 1)) / (star.r / 100));
    };
    universe.calcUCS = function (star) {
        if (star.player !== universe.player) return 0;
        return Math.floor((20 * NeptunesPride.gameConfig.developmentCostScience * (star.s + 1)) / (star.r / 100));
    };
    universe.calcUCG = function (star) {
        if (star.player !== universe.player) return 0;
        if (star.ga) return 0;
        if (NeptunesPride.gameConfig.buildGates === 0) return 0;
        return Math.floor((100 * NeptunesPride.gameConfig.buildGates) / (star.r / 100));
    };
    universe.calcShipsPerTick = function (star) {
        var construction_rate = star.i * (5 + star.player.tech.manufacturing.level);
        var spt = construction_rate / universe.galaxy.production_rate;
        if (spt !== Math.round(spt)) {
            spt = spt.toFixed(2);
        }
        return spt;
    };
    universe.calcShipsPerTickTotal = function (player) {
        var construction_rate = player.total_industry * (5 + player.tech.manufacturing.level);
        var spt = construction_rate / universe.galaxy.production_rate;
        if (spt !== Math.round(spt)) {
            spt = spt.toFixed(2);
        }
        return spt;
    };

    //--------------------------------------------------------------------------
    universe.shipTransfer = function (starStrength, fleetStrength) {
        universe.selectedFleet.st = fleetStrength;
        universe.selectedFleet.orbiting.st = starStrength;
    };
    //--------------------------------------------------------------------------

    universe.distance = function (x1, y1, x2, y2) {
        var dist = Math.sqrt(
            ((x1-x2) * (x1-x2)) +
            ((y1-y2) * (y1-y2)));
        return dist;
    };
    universe.starDistance = function (s1, s2) {
        return universe.distance(s1.x, s1.y, s2.x, s2.y);
    };
    universe.calcFleetEta = function (fleet) {
        var dist, i, node, origin, useWarpSpeed;
        var speed = universe.galaxy.fleet_speed;
        var warpSpeed = universe.galaxy.fleet_speed * 3;

        fleet.eta = 0;
        fleet.etaFirst = 0;
        if (fleet.path.length > 0) {
            fleet.eta += 1;

            origin = fleet;
            useWarpSpeed = false;
            if (fleet.orbiting) {
                origin = fleet.orbiting;
                fleet.eta += fleet.orders[0][0];
            }
            dist = universe.distance(origin.x, origin.y, fleet.path[0].x, fleet.path[0].y);

            if (origin.kind === "star"){
                if (universe.starsGated(origin, fleet.path[0])) {
                    useWarpSpeed = true;
                }
            }

            if (fleet.warpSpeed || useWarpSpeed){
                fleet.eta += Math.floor(dist / warpSpeed);
            } else {
                fleet.eta += Math.floor(dist / speed);
            }

            fleet.etaFirst = fleet.eta;
            fleet.orders[0][4] = fleet.eta;

            if (fleet.path.length > 1) {
                for (i = 0; i < fleet.path.length-1; i += 1) {
                    dist = universe.distance(fleet.path[i].x, fleet.path[i].y, fleet.path[i+1].x, fleet.path[i+1].y);

                    if (universe.starsGated(fleet.path[i], fleet.path[i+1])) {
                        fleet.eta += Math.floor(dist / warpSpeed);
                    } else {
                        fleet.eta += Math.floor(dist / speed);
                    }
                    fleet.eta += 1;
                    fleet.eta += fleet.orders[i+1][0]; // delay
                    fleet.orders[i+1][4] = fleet.eta;
                }
            }
        }
    };

    universe.starsGated = function (s1, s2) {
        if (s1.ga !== 1 || s2.ga !== 1){
            return false;
        }

        return true;
    };
    universe.areStarsEnemies = function (s1, s2) {
        if (!s1.player || !s2.player) {
            return true;
        }

        if (s1.puid === s2.puid) {
            return false;
        }

        if (s1.puid === universe.player.uid) {
            if (universe.player.war[s2.puid] === 0) {
                return false;
            }
        }
        if (s2.puid === universe.player.uid) {
            if (universe.player.war[s1.puid] === 0) {
                return false;
            }
        }

        return true;
    };

    universe.isDrectlyScanned = function (target) {
        var uid, star, dist;
        if (target.player === universe.player) return true;
        for (uid in universe.galaxy.stars) {
            star = universe.galaxy.stars[uid];
            if (star.player !== universe.player) continue;
            dist = universe.starDistance(target, star);
            if (dist <= universe.player.tech.scanning.value) return true;
        }
    };

    universe.calcWaypoints = function () {
        var ls, i;
        universe.waypoints = [];

        // the last star in this fleets path... or the star it orbits.
        ls = universe.selectedFleet.orbiting;
        if (universe.selectedFleet.path.length) {
            ls = universe.selectedFleet.path[universe.selectedFleet.path.length - 1];
        }
        universe.selectedFleet.lastStar = ls;

        if (!ls && !universe.selectedFleet.unScannedStarInPath) {
            // special code to allow fleets stuck in space to be given orders.
            // this should be removed once player have a chance to use it.
            ls = universe.selectedFleet;
        }

        if (!ls) return;

        universe.waypoints.push(universe.selectedFleet.lastStar);
        for (i in universe.galaxy.stars) {
            if (universe.isInRange(universe.galaxy.stars[i], ls, universe.player.tech.propulsion.value)) {
                if (universe.galaxy.stars[i] !== ls) {
                    universe.waypoints.push(universe.galaxy.stars[i]);
                }
            }
        }
    };

    universe.createOldOrders = function () {
        // deep copy of the order array.
        var i, ii;
        universe.selectedFleet.oldOrders = [];
        for (i = 0, ii = universe.selectedFleet.orders.length; i < ii; i+=1) {
            universe.selectedFleet.oldOrders.push([
                universe.selectedFleet.orders[i][0],    // Delay
                universe.selectedFleet.orders[i][1],    // Target
                universe.selectedFleet.orders[i][2],    // Action
                universe.selectedFleet.orders[i][3],    // Value
                universe.selectedFleet.orders[i][4]     // ETA - local only.
                ]);
        }

        universe.selectedFleet.oldPath = [];
        for (i = 0, ii = universe.selectedFleet.path.length; i < ii; i+=1) {
            universe.selectedFleet.oldPath.push(universe.selectedFleet.path[i]);
        }

        universe.selectedFleet.oldLoop = universe.selectedFleet.loop;
    };

    universe.ordersLoopable = function () {
        var fleet = universe.selectedFleet;
        if (fleet.orders.length <= 1) {
            return false;
        }
        if (fleet.orbiting) {
            if (fleet.orbiting.uid === fleet.orders[fleet.orders.length-1][1]){
                return true;
            }
        }

        var firstStar = universe.galaxy.stars[fleet.orders[0][1]];
        var lastStar = universe.galaxy.stars[fleet.orders[fleet.orders.length-1][1]];
        if (!firstStar || !lastStar) {
            return false;
        }
        if (universe.isInRange(firstStar, lastStar, universe.player.tech.propulsion.value)) {
            return true;
        }
        return false;
    };

    universe.restoreOldOrders = function () {
        universe.selectedFleet.orders = universe.selectedFleet.oldOrders;
        universe.selectedFleet.path = universe.selectedFleet.oldPath;
        universe.selectedFleet.loop = universe.selectedFleet.oldLoop;
    };

    universe.addFleetWaypoint = function (wp) {
        var fleet = universe.selectedFleet;
        if (fleet.orders.length > 18) { return; }
        var action, amount;

        if (universe.defaultFleetOrderOverride) {
            action = universe.defaultFleetOrderOverride;
            amount = 0;
        } else {
            action = Number(universe.interfaceSettings.defaultFleetAction);
            amount = Number(universe.interfaceSettings.defaultFleetAmount);
        }


        fleet.orders.push([0, wp.uid, action, amount]);
        fleet.path.push(wp);
        universe.calcFleetEta(fleet);

        if (!universe.ordersLoopable()) {
            fleet.loop = false;
        }

        if (fleet.orbiting && fleet.orders.length > 1) {
            if (fleet.orbiting.uid === fleet.orders[fleet.orders.length-1][1]){
                // if the last order target is the same as where I am, loop.
                // fleet.loop = true;
                universe.askForLooping = true;
            }
        }
    };
    universe.removeFleetWaypoint = function () {
        var fleet = universe.selectedFleet;
        if (fleet.orbiting) {
            fleet.orders.pop();
            fleet.path.pop();
        } else {
            if (fleet.path.length > 1) {
                fleet.orders.pop();
                fleet.path.pop();
            }
        }
        universe.calcFleetEta(fleet);
        fleet.loop = false;
    };
    universe.clearFleetWaypoints = function () {
        var fleet = universe.selectedFleet;
        var first;
        if (fleet.orbiting) {
            fleet.orders = [];
            fleet.path = [];
        } else {
            if (fleet.path.length > 1) {
                first = fleet.path[0];
                fleet.path = [];
                fleet.path.push(first);

                first = fleet.orders[0];
                fleet.orders = [];
                fleet.orders.push(first);
            }
        }
        universe.calcFleetEta(fleet);
        fleet.loop = false;
    };

    universe.onlyPlayerJoined = function () {
        if (universe.player && universe.openPlayerPositions === universe.playerCount - 1) {
            return true;
        }
        return false;
    };

    universe.lastPlayerActiveAndWinning = function () {
        var player, property;
        var sortedPlayers = [];
        var activePlayers = [];

        for (property in universe.galaxy.players) {
            player = universe.galaxy.players[property];
            if (player.conceded === 0) {
                activePlayers.push(player);
            }
            sortedPlayers.push(player);
        }

        sortedPlayers.sort(function compareNumbers(a, b) {
            return b.total_stars - a.total_stars;
        });

        if (universe.player === sortedPlayers[0] && activePlayers.length === 1) {
            return true;
        }
        return false;

    };

    //--------------------------------------------------------------------------
    universe.initRuler = function () {
        universe.ruler = {};
        universe.ruler.stars = [];
        universe.ruler.eta = 0;
        universe.ruler.baseEta = 0;
        universe.ruler.gateEta = 0;
        universe.ruler.gate = true;
        universe.ruler.totalDist = 0;
        universe.ruler.ly = "0.0";
        universe.ruler.hsRequired = 0;
    };
    // Provide a helper function to determine if two items represent a gated flight between a
    // fleet and a star.
    universe.isGatedFlight = function (fleet, star) {
        if (fleet.kind !== "fleet" || star.kind !== "star") return false;
        return (fleet.warpSpeed === 1 && fleet.path.length > 0 && fleet.path[0].uid === star.uid);
    };

    universe.updateRuler = function (star) {
        // If the "star" is a fleet and it is orbiting a star, use the orbited star.
        if (star === universe.ruler.stars[universe.ruler.stars.length -1]) return;

        if (star.kind === "fleet" && star.orbiting) {
            universe.ruler.stars.push(star.orbiting);
        } else {
            universe.ruler.stars.push(star);
        }

        var numStars = universe.ruler.stars.length;
        if (numStars < 2) return;

        var starA = universe.ruler.stars[numStars - 2];
        var starB = universe.ruler.stars[numStars - 1];

        var dist = universe.distance(starA.x, starA.y, starB.x, starB.y);
        var speed = universe.galaxy.fleet_speed;

        var baseEta = Math.floor(dist / speed) + 1;
        var gateEta = Math.floor(dist / (3 * speed)) + 1;

        universe.ruler.baseEta += baseEta;

        // Check whether the distance should be gated. This is the case if starA and starB are gated
        // or if one of the stars is a fleet travelling at warp to the other star.
        var eta = baseEta;
        var gated = false;
        if (universe.starsGated(starA, starB) || universe.isGatedFlight(starA, starB) || universe.isGatedFlight(starB, starA)) {
            gated = true;
            eta = gateEta;
        }

        universe.ruler.eta += eta;

        // Add up the gatedEta. This will now always represent the time if the stars are gated
        // regardless of whether they actually are. The only caveat is if one of the stars is a
        // fleet and we haven't decided it's a gated case. In that case, we have to add the ungated
        // eta, since you can't build a warp gate on a carrier.
        if (!gated && (starA.kind === "fleet" || starB.kind === "fleet")) {
            universe.ruler.gateEta += eta;
        } else {
            universe.ruler.gateEta += gateEta;
        }

        universe.ruler.totalDist += dist;

        var ly = (8 * universe.ruler.totalDist);
        universe.ruler.ly = (Math.round(ly * 1000) / 1000).toFixed(3);

        // Hyperspace required will be the max hyperspace required along the entire route.
        universe.ruler.hsRequired = Math.max(universe.ruler.hsRequired, Math.floor(8 * dist) - 2, 1);
    };

    //--------------------------------------------------------------------------
    universe.validateAlias = function (name) {
        name = name.trim();
        name = name.replace(/[^a-z0-9 ]/gi, '');

        if (name.length < 3 || name.length > 24){
            return "";
        }

        // test if in use.
        var p;
        for (p in universe.players){
            if (universe.galaxy.players[p].alias == name){
                return "";
            }
        }

        // test if numbers only.
        if (/^\d+$/.test(name)){
            return "";
        }

        return name;
    };


    //--------------------------------------------------------------------------
    universe.timeToProduction = function () {
        var tr = universe.galaxy.production_rate - universe.galaxy.production_counter;
        return universe.timeToTick(tr);
    };
    universe.timeToTick = function (tick, wholeTime) {
        var ms_since_data = 0;
        var tf = universe.galaxy.tick_fragment;
        var ltc = universe.locTimeCorrection;

        if (!universe.galaxy.paused) {
            ms_since_data = new Date().valueOf() - universe.now.valueOf();
        }

        if (wholeTime || universe.galaxy.turn_based) {
            ms_since_data = 0;
            tf = 0;
            ltc = 0;
        }

        var ms_remaining = (tick * 1000 * 60 * universe.galaxy.tick_rate) -
                (tf * 1000 * 60  * universe.galaxy.tick_rate) -
                ms_since_data - ltc ;

        if (ms_remaining < 0) {
            return "0s";
        }

        return Crux.formatTime(ms_remaining, true, true);
    };

    //--------------------------------------------------------------------------
    universe.describeTickRate = function () {
        // todo: this should be localized
        if (NeptunesPride.gameConfig.tickRate == 120) {
            return "every 2 hours";
        }
        if (NeptunesPride.gameConfig.tickRate == 60) {
            return "every hour";
        }
        if (NeptunesPride.gameConfig.tickRate == 30) {
            return "every 30 minutes";
        }
        if (NeptunesPride.gameConfig.tickRate == 15) {
            return "every 15 minutes";
        }
    };
    universe.describeProductionRate = function () {
        // todo: this should be localized
        return "every " + NeptunesPride.gameConfig.tickRate / 2.5 + " hours";

    };

    //--------------------------------------------------------------------------
    universe.initDirectorySettings = function () {
        universe.starDirectory = {};
        universe.starDirectory.sortBy = "uci";
        universe.starDirectory.filter = "my_stars";
        universe.starDirectory.invert = 1;

        universe.fleetDirectory = {};
        universe.fleetDirectory.sortBy = "st";
        universe.fleetDirectory.filter = "my_fleets";
        universe.fleetDirectory.invert = -1;

        universe.shipDirectory = {};
        universe.shipDirectory.sortBy = "st";
        universe.shipDirectory.filter = "my_ships";
        universe.shipDirectory.invert = -1;


    };

    //--------------------------------------------------------------------------
    universe.getInterfaceSettings = function () {
        if (store.enabled) {
            var is = store.get(universe.storageName);
            if (is) {
                for (var prop in is) {
                    universe.interfaceSettings[prop] = is[prop];
                }
            }
            // these setting should always be false when a page loads.
            universe.interfaceSettings.showQuickUpgrade = false;
            universe.interfaceSettings.showBasicInfo = true;
        }

    };
    universe.setInterfaceSetting = function (name, value) {
        if (name === "mapGraphics") {
            if (value === "low") {
                universe.interfaceSettings.showNebular = false;
                universe.interfaceSettings.showRipples = false;
            }
            if (value === "medium") {
                universe.interfaceSettings.showNebular = true;
                universe.interfaceSettings.showRipples = true;
            }
            if (value === "high") {
                universe.interfaceSettings.showNebular = true;
                universe.interfaceSettings.showRipples = true;
            }
        }
        universe.interfaceSettings[name] = value;
        if (store.enabled) {
            store.set(universe.storageName, universe.interfaceSettings);
        }

    };
    universe.initInterfaceSettings = function () {
        universe.interfaceSettings = {};
        universe.interfaceSettings.showBasicInfo = true;
        universe.interfaceSettings.showStarInfrastructure = true;
        universe.interfaceSettings.showWaypointChoices = false;
        universe.interfaceSettings.showNebular = true;
        universe.interfaceSettings.showRipples = true;
        universe.interfaceSettings.showFleets = true;
        universe.interfaceSettings.showStars = true;
        universe.interfaceSettings.showQuickUpgrade = false;

        universe.interfaceSettings.allowBuyGalaxyScreen = false;

        universe.interfaceSettings.audio = false;

        universe.interfaceSettings.screenPos = "left";
        universe.interfaceSettings.sideMenuPin = false;
        universe.interfaceSettings.mapGraphics = "medium";

        universe.interfaceSettings.textZoomShips = "250";
        universe.interfaceSettings.textZoomStarNames = "450";
        universe.interfaceSettings.textZoomInf = "550";
        universe.interfaceSettings.textZoomStarPlayerNames = "750";

        universe.interfaceSettings.mapZoom = "500";

        universe.interfaceSettings.showFirstTimePlayer = true;

        universe.interfaceSettings.showFleetNavEtaDetail = false;

        universe.interfaceSettings.defaultFleetAction = "1";
        universe.interfaceSettings.defaultFleetAmount = "0";

        universe.storageName = "NP2InterfaceV-8-5-13:" + NeptunesPride.version;
        universe.getInterfaceSettings();
    };

    // Note: These colors also listed in the css file. We should only have these
    // values in one place. It would be nice to have them in the player class on
    // the server.
    universe.playerColors = [];
    universe.playerColors.push("#0000ff");
    universe.playerColors.push("#009fdf");
    universe.playerColors.push("#40c000");
    universe.playerColors.push("#ffc000");
    universe.playerColors.push("#df5f00");
    universe.playerColors.push("#c00000");
    universe.playerColors.push("#c000c0");
    universe.playerColors.push("#6000c0");

    universe.playerColorNames = [];
    universe.playerColorNames.push("BLUE");
    universe.playerColorNames.push("CYAN");
    universe.playerColorNames.push("GREEN");
    universe.playerColorNames.push("YELLOW");
    universe.playerColorNames.push("ORANGE");
    universe.playerColorNames.push("RED");
    universe.playerColorNames.push("PINK");
    universe.playerColorNames.push("PURPLE");

    //--------------------------------------------------------------------------
    universe.initInterfaceSettings();
    universe.initDirectorySettings();
    return universe;
};
})();
