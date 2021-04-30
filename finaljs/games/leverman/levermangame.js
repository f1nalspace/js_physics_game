/**
 * Crackout (Krakout-clone) based on finaljs game development framework
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.games.leverman.LevermanGame",
    [
        "final.engine.Engine",
        "final.Vec2",
        "final.input.Keys",
        "final.tilemap.TileMap",
        "final.tilemap.SimpleTileMap",
        "final.tilemap.TileTracing",
        "final.games.leverman.Player",
        "final.games.leverman.World"
    ],
    function (final, Engine, Vec2, Keys, TileMap, SimpleTileMap, TileTracing, Player, World) {
        function Bounds() {
            this.x = 0;
            this.y = 0;
            this.w = 0;
            this.h = 0;
        }

        var tileTypes = {
            None: 0,
            Solid: 1,
            PlayerStart: 2
        };

        var tileLayerNames = {
            TileSolids: "Tile Solids",
            TileEntities: "Tile Entities"
        };

        function LevermanGame(canvas) {
            Engine.call(this, canvas);
            this.map = null;
            this.tileview = new Vec2(11, 6); // How many tiles can be viewed in x and y
            this.mapBounds = new Bounds(); // Full map bounds in pixels
            this.mapArea = new Bounds(); // Actual map area in pixels
            this.viewport = new Bounds(); // Actual drawing viewport in pixels
            this.scale = 3.5; // Based on 16/9 aspect ratio
            this.player = null;
            this.mapShapes = [];
            this.world = new World();
        }

        LevermanGame.extend(Engine);

        LevermanGame.prototype.init = function (r, w, h) {
            var that = this;

            // Load map
            this.addResource("content/map.json", "map", "map", function (key, xhr) {
                that.map = TileMap.createFromObject(JSON.parse(xhr.responseText));

                // Built solid tile map
                var solidLayer = that.map.getLayerByName(tileLayerNames.TileSolids);
                var solidTileMap = new SimpleTileMap(that.map.mapSize.x, that.map.mapSize.y, that.map.tileSize.x, that.map.tileSize.y);
                for (var y = 0; y < that.map.mapSize.y; y++) {
                    for (var x = 0; x < that.map.mapSize.x; x++) {
                        var tile = solidLayer.tiles[y * that.map.mapSize.x + x];
                        solidTileMap.setSolid(x, y, tile == tileTypes.Solid ? 1 : 0);
                    }
                }

                // Create and run tile tracer to get line segment shapes
                var tileTracer = new TileTracing(solidTileMap);
                tileTracer.run();
                that.mapShapes = tileTracer.getShapes();
                solidTileMap = null; // No need to keep solid tile map
            });
        };

        LevermanGame.prototype.prepare = function (dt, r, w, h) {
            Engine.prototype.prepare.call(this, dt, r, w, h);
            var map = this.map;
            var tileWidth = map.tileSize.x;
            var tileHeight = map.tileSize.y;

            this.mapBounds.x = 0;
            this.mapBounds.y = 0;
            this.mapBounds.w = map.mapSize.x * tileWidth;
            this.mapBounds.h = map.mapSize.y * tileHeight;

            var entityLayer = map.getLayerByName(tileLayerNames.TileEntities);

            var playerStartTilePos = entityLayer.getTilePosByType(tileTypes.PlayerStart);

            this.player = new Player();
            this.player.size.set(Player.SCALE, 2 * Player.SCALE);
            this.player.pos.set(playerStartTilePos.x + 0.5, playerStartTilePos.y + 1 - this.player.size.y * 0.5 - 0.1);

            this.mapArea.w = this.tileview.x * tileWidth;
            this.mapArea.h = this.tileview.y * tileHeight;
            this.mapArea.x = 0;
            this.mapArea.y = 0;

            this.viewport.w = this.tileview.x * tileWidth * this.scale;
            this.viewport.h = this.tileview.y * tileHeight * this.scale;
            this.viewport.x = (w - this.viewport.w) * 0.5;
            this.viewport.y = (h - this.viewport.h) * 0.5;

            // Create world bodies
            this.world.setDrawScale(tileWidth * this.scale);
            for (var i = 0; i < this.mapShapes.length; i++) {
                this.world.createChain(new Vec2(0, 0), 0, false, 0, this.mapShapes[i]);
            }
            this.mapShapes = null; // We do not need map shapes anymore
            this.player.body = this.world.createBox(this.player.pos, 0, true, 1.0, new Vec2().setFrom(this.player.size).multScalar(0.5), this.player);
        };

        LevermanGame.prototype.update = function (dt, w, h) {
            var tileWidth = this.map.tileSize.x;
            var tileHeight = this.map.tileSize.y;

            // Move player
            var playerBody = this.player.body;
            var velocity = playerBody.GetLinearVelocity();
            if (this.keyboard.isKeyDown(Keys.Left)) {
                velocity.x -= 5 * dt;
                playerBody.SetLinearVelocity(velocity);
            } else if (this.keyboard.isKeyDown(Keys.Right)) {
                velocity.x += 5 * dt;
                playerBody.SetLinearVelocity(velocity);
            }
            if (this.keyboard.isKeyDown(Keys.Up)) {
                velocity.y -= 40 * dt;
                playerBody.SetLinearVelocity(velocity);
            } else if (this.keyboard.isKeyDown(Keys.Down)) {
                velocity.y += 40 * dt;
                playerBody.SetLinearVelocity(velocity);
            }

            // Step world
            this.world.step(dt);

            // Update player
            this.player.update();

            // Set map area based on player center
            this.mapArea.x = this.player.pos.x * tileWidth - this.mapArea.w * 0.5;
            this.mapArea.y = this.player.pos.y * tileHeight - this.mapArea.h * 0.5;

            // Make sure that map area offset never goes beyond map area
            this.mapArea.x = Math.max(Math.min(this.mapArea.x, this.mapBounds.x + this.mapBounds.w - this.mapArea.w), this.mapBounds.x);
            this.mapArea.y = Math.max(Math.min(this.mapArea.y, this.mapBounds.y + this.mapBounds.h - this.mapArea.h), this.mapBounds.y);
        };

        LevermanGame.prototype.drawMinimap = function (r) {
            var minimapScale = 0.5;
            var map = this.map;
            var tileWidth = map.tileSize.x * minimapScale;
            var tileHeight = map.tileSize.y * minimapScale;
            var startX = this.mapArea.x * minimapScale;
            var startY = this.mapArea.y * minimapScale;
            var player = this.player;

            var i, x, y;
            var tile;

            // Draw grid
            for (i = 0; i <= map.mapSize.x; i++) {
                r.drawLine(i * tileWidth, 0, i * tileWidth, this.map.mapSize.y * tileHeight, "white");
            }
            for (i = 0; i <= map.mapSize.y; i++) {
                r.drawLine(0, i * tileHeight, this.map.mapSize.x * tileWidth, i * tileHeight, "white");
            }

            // Draw map tiles
            for (y = 0; y < map.mapSize.y; y++) {
                for (x = 0; x < map.mapSize.x; x++) {
                    var solidLayer = map.getLayerByName(tileLayerNames.TileSolids);
                    tile = solidLayer.tiles[y * map.mapSize.x + x];
                    if (tile == tileTypes.Solid) {
                        r.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight, "white");
                    }
                }
            }

            // Draw player
            r.push();
            r.translate(player.pos.x * tileWidth, player.pos.y * tileHeight);
            r.rotate(player.angle);
            r.fillRect(-player.size.x * tileWidth * 0.5, -player.size.y * tileHeight * 0.5, player.size.x * tileWidth, player.size.y * tileHeight, "darkgreen");
            r.pop();

            // Draw map area
            r.strokeRect(startX, startY, this.mapArea.w * minimapScale, this.mapArea.h * minimapScale, "red", 2);
        };

        LevermanGame.prototype.draw = function (r, dt, w, h) {
            r.clear();
            r.fillRect(0, 0, w, h, "black");

            var map = this.map;
            var vp = this.viewport;
            var scale = this.scale;
            var area = this.mapArea;
            var tileWidth = map.tileSize.x * scale;
            var tileHeight = map.tileSize.y * scale;
            var player = this.player;
            var shapes = this.mapShapes;

            r.push();

            // Clip every pixel outside drawing viewport
            r.clipRect(vp.x, vp.y, vp.w, vp.h);

            // Draw drawing viewport
            r.strokeRect(vp.x, vp.y, vp.w, vp.h, "yellow", 2);

            // Draw map
            var tileOffsetX = Math.floor(area.x / map.tileSize.x);
            var tileOffsetY = Math.floor(area.y / map.tileSize.y);
            var solidLayer = map.getLayerByName(tileLayerNames.TileSolids);
            for (var y = 0; y <= this.tileview.y; y++) {
                for (var x = 0; x <= this.tileview.x; x++) {
                    var tileX = tileOffsetX + x;
                    var tileY = tileOffsetY + y;
                    // Skip tiles which are outside
                    if ((tileX < 0 || tileX > map.mapSize.x - 1) || (tileY < 0 || tileY > map.mapSize.y - 1)) {
                        continue;
                    }
                    var tile = solidLayer.tiles[tileY * map.mapSize.x + tileX];
                    if (tile == tileTypes.Solid) {
                        var tilePosX = vp.x + (tileX * tileWidth) - area.x * scale;
                        var tilePosY = vp.y + (tileY * tileHeight) - area.y * scale;
                        r.fillRect(tilePosX|0, tilePosY|0, tileWidth, tileHeight, "blue");
                    }
                }
            }

            // Draw world
            r.push();
            r.translate(vp.x - area.x * scale, vp.y - area.y * scale);
            this.world.draw(r);
            r.pop();

            /*
            // Draw map shapes
            for (var i = 0; i < shapes.length; i++) {
                var shape = shapes[i];
                r.drawCustom(function(c){
                    for (var j = 0; j < shape.length; j++) {
                        if (j == 0) {
                            c.moveTo(vp.x + shape[j].x * tileWidth - area.x * scale, vp.y + shape[j].y * tileHeight - area.y * scale);
                        } else {
                            c.lineTo(vp.x + shape[j].x * tileWidth - area.x * scale, vp.y + shape[j].y * tileHeight - area.y * scale);
                        }
                    }
                }, "white", 2);
            }
            */

            /*
            // Draw player
            var playerX = this.viewport.x + (player.pos.x - area.x) * scale;
            var playerY = this.viewport.y + (player.pos.y - area.y) * scale;
            r.fillRect((playerX - player.size.x * 0.5 * scale)|0, (playerY - player.size.y * 0.5 * scale)|0, player.size.x * scale, player.size.y * scale, "yellow");
            */

            r.pop();

            this.drawMinimap(r);
        };

        return LevermanGame;
    }
);