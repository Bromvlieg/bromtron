/*globals jQuery:true, Crux: true, Hammer: true*/
// jshint esversion: 6
if (!NeptunesPride) {var NeptunesPride = {};}
(function () {
NeptunesPride.Map = function(npui, universe) {
    "use strict";
    var map = {};

    map = Crux.Widget();
    map.ui.off();
    map.ui.css('background-color', '#000000');
    map.pos(0, 0);

    map.canvas = jQuery("<canvas></canvas>");
    map.ui.append(map.canvas);
    map.context = map.canvas[0].getContext("2d");

    if (!map.context.setLineDash) {
        map.context.setLineDash = function (){};
    }



    // add support for retina displays where the canvas must be rendered
    // at a higher resolution than the actual web sites pixel dimensions.
    map.pixelRatio = window.devicePixelRatio || 1;

    map.context.lineCap = "round";

    map.viewportMask = {x: 0, y: 0, w: 0, h: 0};

    map.sx = 0;
    map.sy = 0;
    map.scale = 500 * map.pixelRatio;

    map.scaleStop = 5;
    map.scaleStops = [50, 75, 100, 200, 300, 400, 500, 600, 700, 900, 1100, 1300, 1500, 2000];

    if (universe.interfaceSettings.mapZoom) {
        map.scaleTarget = Number(universe.interfaceSettings.mapZoom);
        for (var i = map.scaleStops.length - 1; i >= 0; i--) {
            if (map.scaleStops[i] >= map.scaleTarget) {
                map.scaleStop = i;
            }
        }
    } else {
        map.scaleTarget = map.scaleStops[map.scaleStop];
    }

    map.miniMapEnabled = false;

    map.scanRangeBob = 0;
    map.tickCount = 0;

    map.width = universe.mapWidth;
    map.height = universe.mapHeight;

    map.viewportWidth = 0;
    map.viewportHeight = 0;

    map.maxScrollX = 0;
    map.maxScrollY = 0;

    map.oldX = 0;
    map.oldY = 0;
    map.deltaX = 0;
    map.deltaY = 0;

    map.dragging = false;

    map.rangeRotation = 0;
    map.scanRotation = 0;
    map.waypointOriginScale = 0.5;

    map.ripples = [];

    map.ringSrc = document.getElementById("img_star_rings");
    map.starBgSrc1 = document.getElementById("neb1");
    map.starBgSrc2 = document.getElementById("neb2");
    map.starBgSrc3 = document.getElementById("neb1");
    map.starBgSrc4 = document.getElementById("neb3");

    map.starSrc = document.getElementById("img_stars");
    map.haloSrc = document.getElementById("img_halo");
    map.rippleSrc = document.getElementById("img_ripple");
    map.fleetRangeSrc = document.getElementById("img_fleet_range");
    map.scanningRangeSrc = document.getElementById("img_scanning_range");
    map.fleetWaypointSrc = document.getElementById("img_fleet_waypoint");
    map.fleetWaypointNextSrc = document.getElementById("img_fleet_waypoint_next");
    map.selectionRingSrc = document.getElementById("img_selection_ring");

    map.sortedStarSprites = [];
    map.sortedStarYPos = [];

    map.sortedFleetSprites = [];
    map.sortedFleetYPos = [];

    map.nebularSprites = [];

    map.scanningRangeSprite = {};
    map.fleetRangeSprite = {};
    map.selectionRingSprite = {};

    //--------------------------------------------------------------------------
    // Sprite Creation
    //--------------------------------------------------------------------------
    map.createSpritesOwnershipRings = function () {
        var i, j, p, sprite, sx, row, col;

        map.ownership_rings = [];


        for (i in universe.galaxy.fleets) {
            row = Math.floor(universe.galaxy.fleets[i].puid / 8);
            col = Math.floor(universe.galaxy.fleets[i].puid % 8);
            if (!universe.galaxy.fleets[i].orbiting) {
                universe.galaxy.fleets[i].spriteOwner = {
                    ox: 0,
                    oy: 0,
                    width: 64,
                    height: 64,
                    pivotX: 32,
                    pivotY: 32,
                    rotation: 0,
                    scale: 1 * map.pixelRatio,
                    image: map.starSrc,
                    spriteX: row * 64,
                    spriteY: col * 64 + 64,
                    visible: true};
            }

        }
    };
    map.createSpritesNebular = function () {
        map.nebularSprites = [];
        if (!universe.interfaceSettings.showNebular) return;

        var i, star, sprite;
        var neb;
        var neb_count = 0;
        var neb_choice = 1;


        for (i in universe.galaxy.stars) {
            star = universe.galaxy.stars[i];
            neb_count += 1;
            if (neb_count > 6) {
                neb_count = 0;
                neb_choice += 1;

                if (neb_choice > 6) { neb_choice = 0; }
                if (neb_choice === 0) { neb = map.starBgSrc2; }
                if (neb_choice === 1) { neb = map.starBgSrc1; }
                if (neb_choice === 2) { neb = map.starBgSrc2; }
                if (neb_choice === 3) { neb = map.starBgSrc3; }
                if (neb_choice === 4) { neb = map.starBgSrc4; }
                if (neb_choice === 5) { neb = map.starBgSrc2; }
                if (neb_choice === 6) { neb = map.starBgSrc1; }

                sprite = {worldX: star.x, worldY: star.y, starscreenX: 0, screenY: 0, width: 640, height: 640, pivotX: 320, pivotY: 320, rotation: star.x * 360, scale: 0.5, image: neb, spriteX: 0, spriteY: 0, visible: true};
                map.nebularSprites.push(sprite);

                sprite.bgz = 1.125 - ((star.n.length - 3) / 10);
                if (sprite.bgz < 0.875) sprite.bgz = 0.875;
            }
        }
    };
    map.createSpritesFleets = function () {
        var i, j, r, sprite, fleet, fleetj, inRange, fleetSprites, row, col;

        map.sortedFleetSprites = [];
        map.sortedFleetYPos = [];

        // add a show strength property.
        // this is used so that overlapping fleets can have strength numbers combined.
        for (i in universe.galaxy.fleets) {
            fleet = universe.galaxy.fleets[i];
            fleet.showStrength = true;
        }

        for (i in universe.galaxy.fleets) {
            fleet = universe.galaxy.fleets[i];
            fleetSprites = {};

            fleetSprites.worldX = fleet.x;
            fleetSprites.worldY = fleet.y;
            fleetSprites.screenX = map.worldToScreenX(fleetSprites.worldX);
            fleetSprites.screenY = map.worldToScreenY(fleetSprites.worldY);

            map.sortedFleetSprites.push(fleetSprites);
            map.sortedFleetYPos.push(fleetSprites.worldY);

            fleetSprites.visible = true;
            fleetSprites.strength = fleet.st;
            fleetSprites.showStrength = fleet.showStrength;
            fleetSprites.loop = fleet.loop;

            if (fleet.orbiting) fleetSprites.showStrength = false;

            fleetSprites.name = fleet.n;
            fleetSprites.colorName = "";
            fleetSprites.playerAlias = "";
            if (fleet.player) fleetSprites.colorName = fleet.player.colorName;
            if (fleet.player) fleetSprites.playerAlias = fleet.player.alias;


            fleetSprites.fleet = null;
            fleetSprites.ownership = null;

            if (!fleet.orbiting) {
                // rotation
                r = map.calcFleetAngle(fleet);
                fleetSprites.fleet = {width: 64, height: 64, pivotX: 32, pivotY: 32, rotation: r, scale: 0.75 * map.pixelRatio, image: map.starSrc, spriteX: 128, spriteY: 0};

                // ownership
                if (fleet.puid >= 0){
                    row = Math.floor(fleet.puid / 8);
                    col = Math.floor(fleet.puid % 8);
                    fleetSprites.ownership = {width: 64, height: 64, pivotX: 32, pivotY: 32, rotation: 0, scale: 1 * map.pixelRatio, image: map.starSrc, spriteX: row * 64, spriteY: col * 64 + 64};
                }
            }

            // look at all other fleets and if they are very close, add their strength to mine
            // and don't show my strength
            for (j in universe.galaxy.fleets) {
                fleetj = universe.galaxy.fleets[j];
                if (fleet.orbiting) continue;
                if (fleetj.orbiting) continue;
                if (fleet === fleetj) continue;
                if (fleet.puid !== fleetj.puid) continue;
                if (universe.isInRange(fleet, fleetj, 0.0125)) {
                    fleetSprites.strength += fleetj.st;
                    fleetj.showStrength = false;
                }
            }


        }

        map.sortedFleetSprites.sort(function(a, b) { return a.worldY - b.worldY; });
        map.sortedFleetYPos.sort(function(a, b) { return a - b; });
    };
    map.createSpritesStars = function () {
        var i, sprite, star, starSprites, row, col, puid;
        var j, jj, rotation, have_added_angle_0;
        // stars

        map.sortedStarSprites = [];
        map.sortedStarYPos = [];

        for (i in universe.galaxy.stars) {
            star = universe.galaxy.stars[i];

            starSprites = {};

            starSprites.uid = star.uid;
            starSprites.worldX = star.x;
            starSprites.worldY = star.y;
            starSprites.screenX = map.worldToScreenX(starSprites.worldX);
            starSprites.screenY = map.worldToScreenY(starSprites.worldY);

            starSprites.visible = true;
            //sprites
            starSprites.star = null; // mandatory
            starSprites.resources = null;
            starSprites.ownership = null;
            starSprites.alliedOwnership = null;
            starSprites.gate = null;
            starSprites.fleets = [];
            starSprites.waypoint = null;
            starSprites.waypointGate = null;
            starSprites.waypointNext = null;

            starSprites.name = star.n;
            starSprites.colorName = "";
            starSprites.playerAlias = "";
            starSprites.puid = -1;
            starSprites.totalDefenses = star.totalDefenses;

            starSprites.showInf = false;
            starSprites.inf = "";

            starSprites.showQuickUpgrade = false;
            starSprites.quickUpgrade = "";

            if (star.player) {
                starSprites.colorName = star.player.colorName;
                starSprites.playerAlias = star.player.alias;
            }

            if (universe.player) {
                starSprites.showInf = (star.v > 0 && star.puid >= 0) || (star.puid === universe.player.uid);
                starSprites.inf = star.e + "  " + star.i + "  " + star.s;

                starSprites.showQuickUpgrade = (star.v > 0 && star.puid === universe.player.uid);
                starSprites.quickUpgrade = star.uce + "  " + star.uci + "  " + star.ucs;
            }

            map.sortedStarSprites.push(starSprites);
            map.sortedStarYPos.push(starSprites.worldY);

            // star sprite
            starSprites.star = {width: 64, height: 64, pivotX: 32, pivotY: 32, rotation: 0, scale: 1 * map.pixelRatio, image: map.starSrc, spriteX: 0, spriteY: 0, visibleWaypoint: false};
            if (star.v === "0") {
                // scanned or not
                starSprites.star.spriteX = 64;
            }

            // this pushes down text out of the way of the waypoint sprite.
            if (universe.waypoints.indexOf(star) >= 0) {
                starSprites.visibleWaypoint = true;
                starSprites.waypoint = {width: 128, height: 128, pivotX: 64, pivotY: 64, rotation: 0, scale: 0.5 * map.pixelRatio, image: map.fleetWaypointSrc, spriteX: 0, spriteY: 0 };

                // gate
                if (star.ga) {
                    starSprites.waypointGate = {width: 128, height: 128, pivotX: 64, pivotY: 64, rotation: 0, scale: 0.3 * map.pixelRatio, image: map.fleetWaypointSrc, spriteX: 0, spriteY: 0 };
                }

                if (universe.selectedFleet && universe.selectedFleet.lastStar === star) {
                    starSprites.waypointNext = {width: 128, height: 128, pivotX: 64, pivotY: 64, rotation: 0, scale: 1 * map.pixelRatio, image: map.fleetWaypointNextSrc, spriteX: 0, spriteY: 0};
                }

            }

            // resources
            if (universe.galaxy.stars[i].r > 0) {
                starSprites.resources = {width: 128, height: 128, pivotX: 64, pivotY: 64, rotation: 0, scale: ((universe.galaxy.stars[i].nr + 12) / 48) * map.pixelRatio, image: map.haloSrc, spriteX: 0, spriteY: 0};
            }

            // ownership
            if (star.puid >= 0){
                starSprites.puid = star.puid;
                row = Math.floor(star.puid / 8);
                col = Math.floor(star.puid % 8);
                starSprites.ownership = {width: 64, height: 64, pivotX: 32, pivotY: 32, rotation: 0, scale: 1 * map.pixelRatio, image: map.starSrc, spriteX: row * 64, spriteY: col * 64 + 64};
            }

            if (star.alliedDefenders.length) {
                starSprites.alliedOwnership = [];
                for (j = 0; j < star.alliedDefenders.length; j+=1) {
                    puid = star.alliedDefenders[j];
                    row = Math.floor(puid / 8);
                    col = Math.floor(puid % 8);
                    starSprites.alliedOwnership.push({width: 64, height: 64, pivotX: 0- (j*16), pivotY: 8, rotation: 0, scale: 0.5 * map.pixelRatio, image: map.starSrc, spriteX: row * 64, spriteY: col * 64 + 64});
                }
            }

            // warp gates
            if (star.ga == 1) {
                starSprites.gate = {width: 64, height: 64, pivotX: 32, pivotY: 32, rotation: 0, scale: 1 * map.pixelRatio, image: map.starSrc, spriteX: 64*8, spriteY: col * 64 + 64};
            }

            if (star.fleetsInOrbit.length) {
                have_added_angle_0 = false;
                for (j = 0, jj = star.fleetsInOrbit.length; j < jj; j+=1) {
                    rotation = map.calcFleetAngle(star.fleetsInOrbit[j]);
                    if (rotation === 0 && !have_added_angle_0) {
                        have_added_angle_0 = true;
                        starSprites.fleets.push({loop:star.fleetsInOrbit[j].loop, width: 64, height: 64, pivotX: 32, pivotY: 32, rotation: 0, scale: 0.75 * map.pixelRatio, image: map.starSrc, spriteX: 128, spriteY: 0});
                    }
                    if (rotation !== 0){
                        starSprites.fleets.push({loop:star.fleetsInOrbit[j].loop, width: 64, height: 64, pivotX: 32, pivotY: 32, rotation: rotation, scale: 0.75 * map.pixelRatio, image: map.starSrc, spriteX: 128, spriteY: 0});
                    }
                }
            }

        }

        map.sortedStarSprites.sort(function(a, b) { return a.worldY - b.worldY; });
        map.sortedStarYPos.sort(function(a, b) { return a - b; });
    };
    map.createEssentialSprites = function () {
        map.rippleSprite = {
            screenX: 0,
            screenY: 0,
            width: 128,
            height: 128,
            pivotX: 64,
            pivotY: 64,
            rotation: 0,
            scale: 0,
            image: map.rippleSrc,
            spriteX: 0,
            spriteY: 0,
            visible: true
        };

        map.scanningRangeSprite = {
            screenX: 0,
            screenY: 0,
            width: 576,
            height: 576,
            pivotX: 288,
            pivotY: 288,
            rotation: map.scanRotation,
            scale: 1,
            image: map.scanningRangeSrc,
            spriteX: 0,
            spriteY: 0,
            visible: true
        };

        map.fleetRangeSprite = {
            screenX:0,
            screenY: 0,
            width: 576,
            height: 576,
            pivotX: 288,
            pivotY: 288,
            rotation: map.rangeRotation,
            scale: 0,
            image: map.fleetRangeSrc,
            spriteX: 0,
            spriteY: 0
        };

        map.selectionRingSprite = {
            screenX: 0,
            screenY: 0,
            width: 128,
            height: 128,
            pivotX: 64,
            pivotY: 64,
            rotation: 0.5,
            scale: 0.5 * map.pixelRatio * map.scale / 250,
            image: map.selectionRingSrc,
            spriteX: 0,
            spriteY: 0
        };
    };
    map.createSprites = function () {
        if (!universe.galaxy.stars) {
            return;
        }
        map.createEssentialSprites();

        map.createSpritesStars();
        map.createSpritesFleets();
        map.createSpritesNebular();
        //map.createSpritesOwnershipRings();

        Crux.drawReqired = true;
    };

    //--------------------------------------------------------------------------
    // visibility
    //--------------------------------------------------------------------------
    map.calcWorldViewport = function () {
        map.worldViewport = {};
        map.worldViewport.left = map.screenToWorldX(-64);
        map.worldViewport.right = map.screenToWorldX(map.viewportWidth + 64);
        map.worldViewport.top = map.screenToWorldY(-64);
        map.worldViewport.bottom = map.screenToWorldY(map.viewportHeight + 64);
    };
    map.calcVisibleRange = function () {
        function bisectWithoutAccessor(a, x, lo, hi) {
            if (arguments.length < 3) lo = 0;
            if (arguments.length < 4) hi = a.length;
            while (lo < hi) {
                var mid = (lo + hi) >> 1;
                if (x < a[mid]) hi = mid;
                else lo = mid + 1;
            }
            return lo;
        }

        map.startVisisbleStarIndex = bisectWithoutAccessor(map.sortedStarYPos, map.worldViewport.top);
        map.endVisisbleStarIndex = bisectWithoutAccessor(map.sortedStarYPos, map.worldViewport.bottom);

        map.startVisisbleFleetIndex = bisectWithoutAccessor(map.sortedFleetYPos, map.worldViewport.top);
        map.endVisisbleFleetIndex = bisectWithoutAccessor(map.sortedFleetYPos, map.worldViewport.bottom);
    };
    map.calcVisibleStarsAndFleets = function () {
        var i, ii;
        for (i = map.startVisisbleStarIndex, ii = map.endVisisbleStarIndex; i < ii; i+=1) {
            map.sortedStarSprites[i].visible = true;
            if (map.sortedStarSprites[i].worldX < map.worldViewport.left || map.sortedStarSprites[i].worldX > map.worldViewport.right) {
                map.sortedStarSprites[i].visible = false;
            }
        }
        for (i = map.startVisisbleFleetIndex, ii = map.endVisisbleFleetIndex; i < ii; i+=1) {
            map.sortedFleetSprites[i].visible = true;
            if (map.sortedFleetSprites[i].worldX < map.worldViewport.left || map.sortedFleetSprites[i].worldX > map.worldViewport.right) {
                map.sortedFleetSprites[i].visible = false;
            }
        }
    };

    //--------------------------------------------------------------------------
    // Positions
    //--------------------------------------------------------------------------
    map.updateSpritePositions = function () {
        var i,ii, j, jj, ripple;
        var starSprite, fleetSprite;
        var tx, ty;

        var scaleFactor = (map.scale / 400);
        if (scaleFactor < 0.35) scaleFactor = 0.35;
        if (scaleFactor > 1) scaleFactor = 1;
        scaleFactor *= map.pixelRatio;

        for (i = map.startVisisbleStarIndex, ii = map.endVisisbleStarIndex; i < ii; i+=1) {
            starSprite = map.sortedStarSprites[i];
            if(!starSprite.visible) continue;
            starSprite.screenX = map.worldToScreenX(starSprite.worldX);
            starSprite.screenY = map.worldToScreenY(starSprite.worldY);

            starSprite.star.scale = 0.75 * scaleFactor;

            if (starSprite.ownership) {
                starSprite.ownership.scale = scaleFactor;
            }
            if (starSprite.alliedOwnership) {
                for (j = 0; j < starSprite.alliedOwnership.length; j+=1) {
                    starSprite.alliedOwnership[j].scale = scaleFactor / 2;
                }
            }

            if (starSprite.gate) {
                starSprite.gate.scale = 2.5 * scaleFactor;
            }

            for (j = 0, jj = starSprite.fleets.length; j < jj; j+=1) {
                starSprite.fleets[j].scale = 0.65 * scaleFactor;
                if (starSprite.fleets[j].loop) {
                    starSprite.fleets[j].scale *= 0.75;
                }
            }

        }
        for (i = 0, ii = map.nebularSprites.length; i < ii; i+=1) {
            map.nebularSprites[i].screenX = map.worldToScreenX(map.nebularSprites[i].worldX) * map.nebularSprites[i].bgz;
            map.nebularSprites[i].screenY = map.worldToScreenY(map.nebularSprites[i].worldY) * map.nebularSprites[i].bgz;
            map.nebularSprites[i].scale = (map.scale / 400) * map.pixelRatio;

        }

        for (i = map.startVisisbleFleetIndex, ii = map.endVisisbleFleetIndex; i < ii; i+=1) {
            fleetSprite = map.sortedFleetSprites[i];
            if (!fleetSprite.visible) continue;

            fleetSprite.screenX = map.worldToScreenX(fleetSprite.worldX);
            fleetSprite.screenY = map.worldToScreenY(fleetSprite.worldY);

            if (!fleetSprite.fleet) continue;
            fleetSprite.fleet.scale = 0.65 * scaleFactor;
            if (fleetSprite.loop) {
                fleetSprite.fleet.scale *= 0.75;
            }

            if (fleetSprite.ownership) {
                fleetSprite.ownership.scale = scaleFactor;
                if (fleetSprite.loop) {
                    fleetSprite.ownership.scale *= 0.75;
                }
            }
        }
    };

    //--------------------------------------------------------------------------
    // Drawing
    //--------------------------------------------------------------------------
    map.drawSprite = function (sprite) {
        map.context.save();
        map.context.translate(sprite.screenX, sprite.screenY);
        map.context.rotate(sprite.rotation);
        map.context.scale(sprite.scale, sprite.scale);
        map.context.drawImage(sprite.image, sprite.spriteX, sprite.spriteY, sprite.width, sprite.height, -sprite.pivotX, -sprite.pivotY, sprite.width , sprite.height);
        map.context.restore();
    };

    map.debugDrawNeighbours = function (star_uid){
        var i, ii, target, item;
        var star = universe.galaxy.stars[star_uid];
        map.context.globalAlpha = 1;
        map.context.strokeStyle = "rgba(255, 128, 255, 0.25)";
        map.context.lineWidth = 2;
        // neighbours
        for (i = 0, ii = star.nh.length; i < ii; i+=1) {
            target = universe.galaxy.stars[star.nh[i]];
            map.context.beginPath();
            map.context.moveTo(map.worldToScreenX(star.x), map.worldToScreenY(star.y));
            map.context.lineTo(map.worldToScreenX(target.x), map.worldToScreenY(target.y));
            map.context.stroke();
        }
        // front line
        var texts = [];
        texts.push("IDEAL: " + star.ideal);
        texts.push("DEFICIT: " + star.deficit);

        map.context.font = (12 * map.pixelRatio) + "px OpenSansRegular, sans-serif";
        map.context.fillStyle = "#FF8888";
        map.context.textAlign = "left";
        map.context.textBaseline = "middle";

        for (i = 0; i < texts.length; i+=1) {
            item = texts[i];
            map.context.fillText(item, map.worldToScreenX(star.x) + (24 * map.pixelRatio), map.worldToScreenY(star.y) + ((i * 14) * map.pixelRatio));
        }

    };

    map.drawStars = function () {
        var i, ii, j, star;
        function draw(sprite) {
            // TODO: test the speed difference using save restore and inverse scale
            //map.context.save();
            map.context.scale(sprite.scale, sprite.scale);
            map.context.drawImage(sprite.image, sprite.spriteX, sprite.spriteY, sprite.width, sprite.height, -sprite.pivotX, -sprite.pivotY, sprite.width , sprite.height);
            map.context.scale(1/sprite.scale, 1/sprite.scale);
            //map.context.restore();
        }

        for (i = map.startVisisbleStarIndex, ii = map.endVisisbleStarIndex; i < ii; i+=1) {
            star = map.sortedStarSprites[i];
            // map.debugDrawNeighbours(star.uid);
            if (star.visible){
                map.context.save();
                map.context.translate(star.screenX, star.screenY);
                if (star.resources && !map.miniMapEnabled && map.scale > 375) {
                    draw(star.resources);
                }
                if (star.gate) draw(star.gate);
                if (star.star) draw(star.star);
                if (star.ownership) draw(star.ownership);
                if (star.alliedOwnership) {
                    for (j = 0; j < star.alliedOwnership.length; j+=1) {
                        draw(star.alliedOwnership[j]);
                    }
                }
                if (star.waypoint) draw(star.waypoint);
                if (star.waypointGate) draw(star.waypointGate);
                if (star.waypointNext) {
                    star.waypointNext.scale = map.waypointOriginScale;
                    draw(star.waypointNext);
                }
                map.context.restore();
            }
        }
    };
    map.drawNebular = function () {
        var i, ii;
        for (i = 0, ii = map.nebularSprites.length; i < ii; i+=1) {
            map.drawSprite(map.nebularSprites[i]);
        }
    };
    map.drawRipples = function () {
        var i, ripple;
        for (i = map.ripples.length - 1; i >= 0; i--) {
            ripple = map.ripples[i];
            map.rippleSprite.scale = (ripple.radius / 64) * map.pixelRatio;
            map.rippleSprite.screenX = map.worldToScreenX(ripple.worldX);
            map.rippleSprite.screenY = map.worldToScreenY(ripple.worldY);
            map.context.globalAlpha = ripple.alpha;
            map.drawSprite(map.rippleSprite);
            map.context.globalAlpha = 1;
        }
    };
    map.drawFleets = function () {
        var i, ii, fleetSprite;
        function draw(sprite) {
            // TODO: test the speed difference using save restore and inverse scale and rotation.
            //map.context.save();
            map.context.scale(sprite.scale, sprite.scale);
            map.context.rotate(sprite.rotation);
            map.context.drawImage(sprite.image, sprite.spriteX, sprite.spriteY, sprite.width, sprite.height, -sprite.pivotX, -sprite.pivotY, sprite.width , sprite.height);
            map.context.rotate(-sprite.rotation);
            map.context.scale(1/sprite.scale, 1/sprite.scale);
            //map.context.restore();
        }

        for (i = map.startVisisbleFleetIndex, ii = map.endVisisbleFleetIndex; i < ii; i+=1) {
            fleetSprite = map.sortedFleetSprites[i];
            if (!fleetSprite.fleet) continue;
            if (!fleetSprite.visible) continue;
            map.context.save();
            map.context.translate(fleetSprite.screenX, fleetSprite.screenY);
            draw(fleetSprite.ownership);
            draw(fleetSprite.fleet);
            map.context.restore();

        }
    };
    map.drawFleetPath = function () {
        var i, j, p, fleet;
        for (i in universe.galaxy.fleets) {
            fleet = universe.galaxy.fleets[i];
            var a = 0.5, lw = 4;

            if (!fleet.orbiting && fleet.path.length) {
                // in the pipe
                a = 0.75;
                lw = 12;
                if (fleet === universe.selectedFleet) {
                    a = 0.75;
                    lw = 16;
                }
                map.context.globalAlpha = a;
                map.context.strokeStyle = "rgba(255, 255, 255, 0.35)";
                map.context.lineWidth = lw * map.pixelRatio;
                map.context.beginPath();
                map.context.moveTo(map.worldToScreenX(fleet.x), map.worldToScreenY(fleet.y));
                map.context.lineTo(map.worldToScreenX(fleet.path[0].x), map.worldToScreenY(fleet.path[0].y));
                map.context.stroke();
            }

            a = 0.5;
            lw = 4;
            if (fleet === universe.selectedFleet) {
                a = 0.75;
                lw = 8;
            }

           if (fleet.loop) {
                map.context.setLineDash([5, 10]);
            }
            map.context.globalAlpha = a;
            map.context.strokeStyle = fleet.player.color;
            map.context.lineWidth = lw * map.pixelRatio;
            map.context.beginPath();
            map.context.moveTo(map.worldToScreenX(fleet.x), map.worldToScreenY(fleet.y));

            for (j = 0; j < fleet.path.length; j += 1) {
                map.context.lineTo(map.worldToScreenX(fleet.path[j].x), map.worldToScreenY(fleet.path[j].y));
            }
            map.context.stroke();
            map.context.globalAlpha = 1;
            map.context.setLineDash([]);
        }
        if  (universe.selectedFleet) {
            // a white line for the selected fleet.
            map.context.setLineDash([3, 6]);
            map.context.globalAlpha = 1;
            map.context.strokeStyle = "#FFFFFF";
            map.context.lineWidth = 3 * map.pixelRatio;
            map.context.beginPath();
            map.context.moveTo(map.worldToScreenX(universe.selectedFleet.x), map.worldToScreenY(universe.selectedFleet.y));

            for (j = 0; j < universe.selectedFleet.path.length; j += 1) {
                map.context.lineTo(map.worldToScreenX(universe.selectedFleet.path[j].x), map.worldToScreenY(universe.selectedFleet.path[j].y));
            }
            map.context.stroke();
            map.context.setLineDash([]);

        }
    };

    map.drawOrbitingFleets = function () {
        var i, ii, j, jj, star;
        function draw(sprite) {
            // TODO: test the speed difference using save restore and inverse scale
            //map.context.save();
            map.context.scale(sprite.scale, sprite.scale);
            map.context.rotate(sprite.rotation);
            map.context.drawImage(sprite.image, sprite.spriteX, sprite.spriteY, sprite.width, sprite.height, -sprite.pivotX, -sprite.pivotY, sprite.width , sprite.height);
            map.context.rotate(-sprite.rotation);
            map.context.scale(1/sprite.scale, 1/sprite.scale);
            //map.context.restore();
        }

        for (i = map.startVisisbleStarIndex, ii = map.endVisisbleStarIndex; i < ii; i+=1) {
            star = map.sortedStarSprites[i];
            if (! star.visible) continue;
            map.context.save();
            map.context.translate(star.screenX, star.screenY);

            for (j = 0, jj = star.fleets.length; j < jj; j+=1) {
                draw(star.fleets[j]);
            }
            map.context.restore();

        }
    };

    map.drawScanningRange = function () {
        if (!universe.selectedStar) return;
        if (!universe.selectedStar.player) return;
        if (map.scale < 150) return;

        map.scanningRangeSprite.screenX = map.worldToScreenX(universe.selectedStar.x);
        map.scanningRangeSprite.screenY = map.worldToScreenY(universe.selectedStar.y);
        map.scanningRangeSprite.scale = universe.selectedStar.player.tech.scanning.value * map.scale * map.pixelRatio / 250;

        map.drawSprite(map.scanningRangeSprite);
    };
    map.drawFleetRange = function () {
        if (!universe.selectedFleet) { return; }
        if (!universe.selectedFleet.lastStar) { return; }
        if (universe.editMode !== "edit_waypoints") { return; }

        map.fleetRangeSprite.screenX = map.worldToScreenX(universe.selectedFleet.lastStar.x);
        map.fleetRangeSprite.screenY = map.worldToScreenY(universe.selectedFleet.lastStar.y);
        map.fleetRangeSprite.scale = (universe.player.tech.propulsion.value + 0.0125) * map.scale * map.pixelRatio / 250;

        map.drawSprite(map.fleetRangeSprite);
    };
    map.drawStarFleetRange = function () {
        if (!universe.selectedStar) { return;}
        if (!universe.selectedStar.player) { return; }
        if (map.scale < 150) { return; }

        map.fleetRangeSprite.screenX = map.worldToScreenX(universe.selectedStar.x);
        map.fleetRangeSprite.screenY = map.worldToScreenY(universe.selectedStar.y);
        map.fleetRangeSprite.scale = (universe.selectedStar.player.tech.propulsion.value + 0.0125) * map.scale * map.pixelRatio / 250;

        map.drawSprite(map.fleetRangeSprite);
    };
    map.drawSelectionRing = function () {
        if (universe.selectedSpaceObject) {
            map.selectionRingSprite.scale = 0.5 * map.pixelRatio * map.scale / 250;
            map.selectionRingSprite.screenX = map.worldToScreenX(universe.selectedSpaceObject.x);
            map.selectionRingSprite.screenY = map.worldToScreenY(universe.selectedSpaceObject.y);
            map.drawSprite(map.selectionRingSprite);
        }
    };


    map.drawRuler = function () {
        var i;
        var numStars = universe.ruler.stars.length;
        if (numStars < 2) return;

        var minAlpha = 0.3, maxAlpha = 0.6, alphaStep = 0.05;

        // Draw backwards to make it easier to step off the alpha
        var alpha = maxAlpha;
        for (i = numStars - 1; i > 0; i--) {
            map.context.strokeStyle = "rgba(255, 255, 255, " + alpha + ")";
            map.context.lineWidth = 8 * map.pixelRatio;
            map.context.beginPath();
            var x1 = map.worldToScreenX(universe.ruler.stars[i].x);
            var y1 = map.worldToScreenY(universe.ruler.stars[i].y);
            var x2 = map.worldToScreenX(universe.ruler.stars[i - 1].x);
            var y2 = map.worldToScreenY(universe.ruler.stars[i - 1].y);
            map.context.moveTo(x1, y1);
            map.context.lineTo(x2, y2);
            map.context.stroke();

            alpha = Math.max(minAlpha, alpha - alphaStep);
        }
    };
    map.drawText = function () {
        var sprite, labelString, s, f, star, fleet;
        var labelY = 0, labelX = 0;
        var offsetY = 0;
        var i, ii, starSprite, fleetSprite;

        var lineHeight = 16 * map.pixelRatio;
        var largeOffset = 38 * map.pixelRatio;
        var smallOffset = 28 * map.pixelRatio;

        // todo: this needs refactoring so that the labelY increments for each star or fleet,
        // ie so that it only increments if it needs to.
        map.context.font = (14 * map.pixelRatio) + "px OpenSansRegular, sans-serif";
        map.context.textAlign = "center";
        map.context.fillStyle = "#FDF0DC";
        map.context.textBaseline = 'middle';

        if (universe.interfaceSettings.mapGraphics === "high") {
            map.context.shadowColor = "#000000";
            map.context.shadowOffsetX = 2;
            map.context.shadowOffsetY = 2;
            map.context.shadowBlur = 2;
        }

        if (universe.colorBlindHelper) {
            map.context.fillStyle = "#000000";
            map.context.globalAlpha = 0.5;

            for (i = map.startVisisbleStarIndex, ii = map.endVisisbleStarIndex; i < ii; i+=1) {
                starSprite = map.sortedStarSprites[i];
                if (!starSprite.visible) continue;
                map.context.fillRect(
                    starSprite.screenX - (48 * map.pixelRatio),
                    starSprite.screenY - (12 * map.pixelRatio),
                    96 * map.pixelRatio,
                    24 * map.pixelRatio);
            }

            for (i = map.startVisisbleFleetIndex, ii = map.endVisisbleFleetIndex; i < ii; i+=1) {
                fleetSprite = map.sortedFleetSprites[i];
                if (!fleetSprite.visible) continue;
                map.context.fillRect(fleetSprite.screenX - (48 * map.pixelRatio), fleetSprite.screenY - (12 * map.pixelRatio), 96 * map.pixelRatio, (24 * map.pixelRatio));
            }

            map.context.globalAlpha = 1;
            map.context.fillStyle = "#FDF0DC";
            for (i = map.startVisisbleStarIndex, ii = map.endVisisbleStarIndex; i < ii; i+=1) {
                starSprite = map.sortedStarSprites[i];
                if (!starSprite.visible) continue;
                map.context.fillText(starSprite.colorName, starSprite.screenX, starSprite.screenY);
            }

            for (i = map.startVisisbleFleetIndex, ii = map.endVisisbleFleetIndex; i < ii; i+=1) {
                fleetSprite = map.sortedFleetSprites[i];
                if (!fleetSprite.visible) continue;
                map.context.fillText(fleetSprite.colorName, fleetSprite.screenX, fleetSprite.screenY);
            }
        } // colour blind helper

        for (i = map.startVisisbleFleetIndex, ii = map.endVisisbleFleetIndex; i < ii; i+=1) {
            fleetSprite = map.sortedFleetSprites[i];
            if (!fleetSprite.visible) continue;
            if (!fleetSprite.showStrength) continue;
            if (map.scale < universe.interfaceSettings.textZoomShips) continue;
            map.context.fillText(fleetSprite.strength, fleetSprite.screenX + labelX, fleetSprite.screenY + smallOffset);
        }


        for (i = map.startVisisbleStarIndex, ii = map.endVisisbleStarIndex; i < ii; i+=1) {
            starSprite = map.sortedStarSprites[i];
            if (!starSprite.visible) continue;
            labelY = 0;
            offsetY = (starSprite.visibleWaypoint && universe.interfaceSettings.showWaypointChoices) ? largeOffset : smallOffset;

            if (universe.interfaceSettings.showBasicInfo) {
                if (map.scale >= universe.interfaceSettings.textZoomStarNames ) {

                    map.context.fillText(starSprite.name, starSprite.screenX + labelX, starSprite.screenY + offsetY + labelY);
                    labelY += lineHeight;
                }

                if (map.scale >= universe.interfaceSettings.textZoomShips &&
                        starSprite.totalDefenses) {

                    map.context.fillText(starSprite.totalDefenses, starSprite.screenX + labelX, starSprite.screenY + offsetY + labelY);
                    labelY += lineHeight;
                }

            }

            if (universe.interfaceSettings.showStarInfrastructure &&
                    universe.player &&
                    map.scale >= universe.interfaceSettings.textZoomInf &&
                    starSprite.showInf) {

                map.context.fillText(starSprite.inf, starSprite.screenX + labelX, starSprite.screenY - offsetY);
            }

            if (map.scale > universe.interfaceSettings.textZoomStarPlayerNames &&
                    starSprite.playerAlias) {

                map.context.fillText(starSprite.playerAlias, starSprite.screenX + labelX, starSprite.screenY + offsetY + labelY);
                labelY += lineHeight;
            }

            if (universe.interfaceSettings.showQuickUpgrade &&
                    universe.player &&
                    map.scale >= universe.interfaceSettings.textZoomShips &&
                    starSprite.showQuickUpgrade) {

                map.context.fillText(starSprite.quickUpgrade, starSprite.screenX + labelX, starSprite.screenY + labelY  + (28 * map.pixelRatio));
            }
        }

        if (universe.interfaceSettings.mapGraphics === "high") {
            map.context.shadowColor = null;
            map.context.shadowOffsetX = 0;
            map.context.shadowOffsetY = 0;
            map.context.shadowBlur = 0;
        }
    };


    map.draw = function () {

        map.context.lineCap = "round";
        if (map.scale !==  map.scaleTarget) {
            map.zoom(map.scaleTarget - map.scale);
        }

        map.calcWorldViewport();
        map.calcVisibleRange();
        map.calcVisibleStarsAndFleets();

        map.updateSpritePositions();

        map.context.fillStyle = "#000000";
        map.context.globalAlpha = 1;
        map.context.fillRect(0, 0, map.viewportMask.w, map.viewportMask.h);

        if (!map.miniMapEnabled) {
            map.drawNebular();
        }
        map.drawSelectionRing();

        if (universe.interfaceSettings.showRipples && !map.miniMapEnabled) {
           map.drawRipples();
        }

        map.drawStars();

        map.drawScanningRange();
        map.drawStarFleetRange();

        if (universe.interfaceSettings.showFleets && !map.miniMapEnabled) {
            map.drawFleetRange();
            map.drawFleetPath();
            map.drawOrbitingFleets();
            map.drawFleets();
        }

        if (universe.editMode === "ruler") {
            map.drawRuler();
        }

        map.drawText();

        map.context.globalAlpha = 1;
    };

    //--------------------------------------------------------------------------
    // Zooming and Sliding
    //--------------------------------------------------------------------------
    map.pinchZoom = function (scale, centerX, centerY) {
        var preScaleX, preScaleY, postScaleX, postScaleY, diffX, diffY;

        preScaleX = (map.sx - centerX) / map.scale;
        preScaleY = (map.sy - centerY) / map.scale;

        map.scale = scale;
        map.scaleTarget = map.scale;

        postScaleX = (map.sx - centerX) / map.scale;
        postScaleY = (map.sy - centerY) / map.scale;

        diffX = postScaleX - preScaleX ;
        diffY = postScaleY - preScaleY;

        map.sx -= Math.round(diffX  * map.scale);
        map.sy -= Math.round(diffY  * map.scale);

        if (isNaN(map.sx)) {
            map.sx = 0;
            map.sy = 0;
        }
    };
    map.onPinchZoom = function (e) {
        if (e.type == "pinchstart") {
            map.pinchStartScale = map.scale;
        }
        var targetScale = map.pinchStartScale * e.scale;
        if (targetScale < 50 * map.pixelRatio){
            return;
        }
        if (targetScale > 2000 * map.pixelRatio){
            return;
        }
        map.pinchZoom(targetScale, e.center.x , e.center.y );
    };

    var mc = new Hammer.Manager(map.canvas[0]);
    mc.add(new Hammer.Pinch());
    mc.on("pinchstart", map.onPinchZoom);
    mc.on("pinchout", map.onPinchZoom);
    mc.on("pinchin", map.onPinchZoom);

    //--------------------------------------------------------------------------
    // Zooming and Sliding
    //--------------------------------------------------------------------------
    map.zoom = function (amount) {
        var preScaleX, preScaleY, postScaleX, postScaleY, diffX, diffY;

        preScaleX = (map.sx - map.viewportWidth / map.pixelRatio / 2) / map.scale;
        preScaleY = (map.sy - map.viewportHeight / map.pixelRatio / 2) / map.scale;

        map.scale += amount;

        if (map.scale < 200) {
            map.miniMapEnabled = true;
        } else {
            map.miniMapEnabled = false;
        }

        postScaleX = (map.sx - map.viewportWidth / map.pixelRatio / 2) / map.scale;
        postScaleY = (map.sy - map.viewportHeight / map.pixelRatio / 2) / map.scale;

        diffX = postScaleX - preScaleX ;
        diffY = postScaleY - preScaleY;

        map.sx -= diffX  * map.scale;
        map.sy -= diffY  * map.scale;
    };
    map.onZoomIn = function (event, data) {
        if (map.zooming) return;

        map.scaleStop += 1;
        if (map.scaleStop > map.scaleStops.length - 1){
            map.scaleStop = map.scaleStops.length - 1;
            return;
        }


        map.zooming = true;
        Crux.createAnim(map, "scaleTarget", map.scaleTarget, map.scaleStops[map.scaleStop], 250, {onComplete:map.onZoomComplete});
    };
    map.onZoomOut = function (event, data) {
        if (map.zooming) return;

        map.scaleStop -= 1;
        if (map.scaleStop < 0){
            map.scaleStop = 0;
            return;
        }

        map.zooming = true;
        Crux.createAnim(map, "scaleTarget", map.scaleTarget, map.scaleStops[map.scaleStop], 250, {onComplete:map.onZoomComplete});
    };

    map.onZoomComplete = function () {
        map.zooming = false;
        universe.setInterfaceSetting("mapZoom",  map.scaleStops[map.scaleStop]);
    };
    map.onZoomMinimap = function (event, data) {
        if (!map.miniMapEnabled) {
            Crux.createAnim(map, "scaleTarget", map.scaleTarget, map.scaleStops[0], 500);
            map.miniMapEnabled = true;
        } else {
            map.scaleStop = 3;
            Crux.createAnim(map, "scaleTarget", map.scaleTarget, map.scaleStops[map.scaleStop], 500);
            map.miniMapEnabled = false;
        }
    };

    map.onCenter = function (event, data) {
        map.centerPointInMap(data.x, data.y);
        map.onMapRefresh();
    };
    map.centerPointInMap = function (cx, cy) {
        cx *= map.scale;
        cy *= map.scale;

        map.sx = -cx + (map.viewportWidth / map.pixelRatio / 2);
        map.sy = -cy + (map.viewportWidth / map.pixelRatio / 2);
    };
    map.onCenterSlide = function (event, data) {
        map.trigger("play_sound", "zoom");
        map.slideCenterPointInMap(data.x, data.y);
    };
    map.slideCenterPointInMap = function (cx, cy) {
        var tx, ty, ax, ay;
        var offset = 0;

        if (universe.interfaceSettings.screenPos === "right") {
            offset = -480;
        }
        if (universe.interfaceSettings.screenPos === "left") {
            offset = +480;
        }

        cx *= map.scale;
        cy *= map.scale;
        tx = Math.round(-cx + ((map.viewportWidth + offset)/ map.pixelRatio / 2));
        ty = Math.round(-cy + ((map.viewportHeight) / map.pixelRatio / 3));


        ax = Crux.createAnim(map, "sx", map.sx, tx, 1000);
        ay = Crux.createAnim(map, "sy", map.sy, ty, 1000);
    };

    //--------------------------------------------------------------------------
    // Coordinates
    //--------------------------------------------------------------------------
    map.worldToScreenX = function (x) {
        return (x * map.scale + map.sx) * map.pixelRatio;
    };
    map.worldToScreenY = function (y) {
        return (y * map.scale + map.sy) * map.pixelRatio;
    };
    map.worldToScreenScale = function (s) {
        return (s * map.scale) * map.pixelRatio;
    };
    map.screenToWorldX = function (x) {
        return ((x/map.pixelRatio)- map.sx) /map.scale ;
    };
    map.screenToWorldY = function (y) {
        return ((y/map.pixelRatio) - map.sy) /map.scale ;
    };
    map.screenToWorldScale = function (s) {
        return (s/map.pixelRatio)/map.scale ;
    };

    //--------------------------------------------------------------------------
    // Move and Touch Events
    //--------------------------------------------------------------------------
    map.moveDelta = function () {
        map.sx -= map.deltaX;
        map.sy -= map.deltaY;
        Crux.drawReqired = true;
    };
    map.onMouseMove = function (event) {
        event.pageX -= npui.map.x;
        event.pageY -= npui.map.y;
        if (map.dragging) {
            map.deltaX = map.oldX - event.pageX;
            map.deltaY = map.oldY - event.pageY;
            map.oldX = event.pageX;
            map.oldY = event.pageY;
            map.moveDelta();
        }
    };
    map.onMouseUp = function (event) {
        map.dragging = false;
    };
    map.onMouseDown = function (event) {
        if (map.ignoreMouseEvents) return;

        if (event.target !== map.canvas[0]) {
            return;
        }

        // get the global position of the map
        var gx = map.ui.offset().left;
        var gy = map.ui.offset().top;

        var event_kind = "map_clicked";
        if (event.which === 2 || event.which === 3) {
            event_kind = "map_middle_clicked";
        }

        npui.ui.trigger(event_kind,  {
            x: (event.pageX - map.sx - gx) / map.scale,
            y: (event.pageY - map.sy - gy) / map.scale
        });

        map.dragging = true;
        map.oldX = event.pageX - map.x;
        map.oldY = event.pageY - map.y;
        map.one("mouseup", map.onMouseUp);
    };
    map.onTouchUp = function (event) {
        map.dragging = false;
    };
    map.onTouchDown = function (event) {
        var orig, ex, ey, gx, gy;

        orig = event.originalEvent;
        if (orig.target !== map.canvas[0]) return;

        map.ignoreMouseEvents = true;

        // get the global position of the map
        gx = map.ui.offset().left;
        gy = map.ui.offset().top;

        ex = orig.touches[0].pageX - npui.map.x;
        ey = orig.touches[0].pageY - npui.map.y;

        npui.ui.trigger("map_clicked",  {
            x: (orig.touches[0].pageX - map.sx - gx) / map.scale,
            y: (orig.touches[0].pageY - map.sy - gy) / map.scale
        });

        map.dragging = true;
        map.oldX = ex;
        map.oldY = ey;
        map.ui.one("touchend", map.onTouchUp);
    };
    map.onTouchMove = function (event) {
        var ex, ey, orig;

        orig = event.originalEvent;
        if (orig.target !== map.canvas[0])  return;

        // should prevent default browser behaviour for scroll and zoom and what not.
        event.preventDefault();

        if (map.dragging) {
            ex = orig.touches[0].pageX - npui.map.x;
            ey = orig.touches[0].pageY - npui.map.y;

            map.deltaX = map.oldX - ex;
            map.deltaY = map.oldY - ey;
            map.oldX = ex;
            map.oldY = ey;
            map.moveDelta();
        }
        return;
    };
    map.onMouseWheel = function (event) {
        if (event.target !== map.canvas[0]) {return;}
        if (event.originalEvent.deltaY < 0) {
            map.onZoomIn();
        }
        if (event.originalEvent.deltaY > 0) {
            map.onZoomOut();
        }
        event.preventDefault();
    };

    //--------------------------------------------------------------------------
    // Ripples
    //--------------------------------------------------------------------------
    map.createRipple = function (x, y, color, thickness, sr, er, duration) {
        var ripple = {worldX: x, worldY: y, radius: 0, alpha: 1};
        var animRadius = Crux.createAnim(ripple, "radius", sr, er, duration, {onComplete:map.rippleComplete});
        var animAlpha = Crux.createAnim(ripple, "alpha", 1, 0, duration);

        animRadius.ease = Crux.easeOutQuad;
        animAlpha.ease = Crux.easeOutQuad;

        map.ripples.push(ripple);
    };
    map.rippleComplete = function (ripple) {
        var i = map.ripples.indexOf(ripple);
        if (i >= 0) {
            map.ripples.splice(i, 1);
        }
    };
    map.onRippleStar = function (event, star) {
        map.createRipple(star.x, star.y, "255,0,0", 8, 26, 100, 2000);
    };
    map.onSpecialRippleStar = function (event, star) {

        Crux.createAnim(map.fleetRangeSprite, "rotation", 0.25, 0, 500).ease = Crux.easeOutQuad;
        Crux.createAnim(map.scanningRangeSprite, "rotation", -0.25, 0, 500).ease = Crux.easeOutQuad;
        Crux.createAnim(map.selectionRingSprite, "rotation", -0.25, 0, 500).ease = Crux.easeOutQuad;
    };
    map.onRippleFleet = function (event, fleet) {
        map.createRipple(fleet.x, fleet.y, "0,255,0", 8, 26, 100, 2000);
    };
    map.onRippleUpgrade = function (event) {
        map.createRipple(universe.selectedStar.x, universe.selectedStar.y, "64,64,64", 12, 26, 200, 4000);
    };
    map.onAddWaypoint = function (event) {
        Crux.createAnim(map, "waypointOriginScale", 0.5, 1, 250).ease = Crux.easeOutQuad;
    };

    //--------------------------------------------------------------------------
    // Setup and Initialization
    //--------------------------------------------------------------------------
    map.oldW = 0;
    map.oldH = 0;
    map.layout = function () {
        var w = npui.width;
        var h = npui.height;

        // I pad throwing extra resize events.
        if (map.oldW === w && map.oldH === h) return;

        map.oldW = w;
        map.oldH = h;

        npui.map.size(w * map.pixelRatio, h * map.pixelRatio);

        npui.map.addStyle("fixed");

        map.canvas.width = w * map.pixelRatio;
        map.canvas.height = h * map.pixelRatio;

        map.canvas[0].style.width = w + 'px';
        map.canvas[0].style.height = h + 'px';

        Crux.drawReqired = true;
    };
    map.close = function () {
        Crux.tickCallbacks.splice(Crux.tickCallbacks.indexOf(map.draw), 1);
    };
    map.size = function (w, h) {
        map.viewportWidth = w;
        map.viewportHeight = h;
        map.maxScrollX = map.width - map.viewportWidth;
        map.maxScrollY = map.height - map.viewportHeight;
        map.canvas.attr("width", w);
        map.canvas.attr("height", h);
        map.viewportMask = {x: 0, y: 0, w: w, h: h};
    };
    map.onOneSecondTick = function () {
        // do nothing for now.
    };
    map.onMapRefresh = function () {
        Crux.drawReqired = true;
    };


    //--------------------------------------------------------------------------
    map.calcFleetAngle = function (fleet) {
        var r;
        if (fleet.path[0]) {
            r = map.lookAngle(fleet.x, fleet.y, fleet.path[0].x, fleet.path[0].y) + 90;
        } else {
            if ((fleet.x === fleet.lx && fleet.y === fleet.ly) || fleet.orbiting !== null){
                r = 0;
            } else {
                r = map.lookAngle(fleet.x, fleet.y, fleet.lx, fleet.ly) - 90;
            }
        }
        return (Math.PI * r) / 180;
    } ;

    map.lookAngle = function (p1x, p1y, p2x, p2y) {
        //returns an angle in deg when point 1 is 'looking at' point 2
        var r_x, r_y, angle;

        r_x = p2x - p1x;
        r_y = p2y - p1y;

        angle = 0;

        if (r_x === 0) {
            if (r_y > 0) {
                angle = 90;
            } else {
                angle = 270;
            }
            return angle;
        }

        if (r_y === 0) {
            if (r_x > 0) {
                angle = 0;
            } else {
                angle = 180;
            }
            return angle;
        }

        angle = Math.atan(r_y / r_x) * 180 / Math.PI;

        if (r_x < 0) {
            angle += 180;
        } else if (r_y < 0 && r_x > 0) {
            angle += 360;
        }

        return angle;
    };

    //--------------------------------------------------------------------------
    // map event handlers
    map.on("mousemove", map.onMouseMove);
    map.on("mousedown", map.onMouseDown);

    // prevent the context menu when clicking around the map.
    map.on("contextmenu", function (event){
        if (event.target !== map.canvas[0]) return true;
        return false;
    });

    // to prevent fake mouse events created by touch devices.
    map.ignoreMouseEvents = false;

    map.on("touchmove", map.onTouchMove);
    map.on("touchstart", map.onTouchDown);

    map.on("wheel", map.onMouseWheel);

    map.on("zoom_in", map.onZoomIn);
    map.on("zoom_out", map.onZoomOut);
    map.on("zoom_minimap", map.onZoomMinimap);

    map.on("map_center", map.onCenter);
    map.on("map_center_slide", map.onCenterSlide);

    map.on("ripple_star", map.onRippleStar);
    map.on("ripple_fleet", map.onRippleFleet);
    map.on("ripple_waypoint", map.onRippleWaypoint);
    map.on("special_ripple_star", map.onSpecialRippleStar);


    map.on("add_waypoint", map.onAddWaypoint);

    map.on("upgrade_economy", map.onRippleUpgrade);
    map.on("upgrade_industry", map.onRippleUpgrade);
    map.on("upgrade_science", map.onRippleUpgrade);

    map.on("one_second_tick", map.onOneSecondTick);

    map.on("map_rebuild", map.createSprites);
    map.on("map_refresh", map.onMapRefresh);




    map.createSprites();
    Crux.tickCallbacks.push(map.draw);

    return map;
};
})();