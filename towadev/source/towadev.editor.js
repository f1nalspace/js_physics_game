final.module("final.towadev.editor", ["final.vec", "final.game", "final.towadev", "final.towadev.map", "final.images"], function(final, vec, game, towadev, map, images){
    var Vec2 = vec.Vec2,
        TowaDev = towadev.TowaDev,
        DisplayMode = game.DisplayMode,
        State = towadev.State,
        Tiles = map.Tiles,
        Game = game.Game,
        MouseButton = game.MouseButton;

    var Mode = {
        None: 0,
        Tiles: 1,
        Entities: 2
    };

    var osdFont = {
        name: "Arial",
        size: 0.35,
        style: "normal"
    };

    function Editor(canvasId) {
        TowaDev.call(this, canvasId);
        this.autoUpdateViewport = true;
        this.displayMode = DisplayMode.None;
        this.state = State.LevelOnly;
        this.mode = Mode.Tiles;
        this.tilePen = Tiles.Placeable;
        this.mousePressed = false;
        this.modified = false;
        this.modifiedCallback = function(){};
        this.currentMapName = null;
        this.defaultMapSize = new Vec2(20, 10);
        this.initCallback = function(){};
    }
    Editor.extend(TowaDev);

    Editor.prototype.init = function(r) {
        TowaDev.prototype.init.call(this);
    };

    Editor.prototype.loaded = function(r) {
        TowaDev.prototype.loaded.call(this, r);
        this.map.resize(this.defaultMapSize.x, this.defaultMapSize.y);
        this.initCallback();
    };

    Editor.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);

        // Resources not loaded - exit
        if (this.initState < final.game.GameInitState.ResourcesLoaded) {
            return;
        }

        // Get hover tile  position by current mouse position
        if (this.mode == Mode.Tiles) {
            this.hoverTilePos.x = Math.floor(this.mouse.x / this.map.tileSize);
            this.hoverTilePos.y = Math.floor(this.mouse.y / this.map.tileSize);

            if (!this.mousePressed) {
                if (this.isMouseDown(MouseButton.Left)) {
                    if (this.map.isValid(this.hoverTilePos.x, this.hoverTilePos.y)) {
                        this.mousePressed = true;
                    }
                }
            }
            if (this.mousePressed) {
                if (!this.isMouseDown(MouseButton.Left)) {
                    this.mousePressed = false;
                } else {
                    if (this.map.isValid(this.hoverTilePos.x, this.hoverTilePos.y)) {
                        var curTile = this.map.tiles[this.hoverTilePos.y * this.map.size.x + this.hoverTilePos.x];
                        if (curTile != this.tilePen) {
                            this.map.tiles[this.hoverTilePos.y * this.map.size.x + this.hoverTilePos.x] = this.tilePen;
                            this.modified = true;
                            this.modifiedCallback();
                        }
                    }
                }
            }
        }
    };

    Editor.prototype.draw = function(r) {
        TowaDev.prototype.draw.call(this, r);

        // Draw a grid
        var mapSize = this.map.size;
        var tileSize = this.map.tileSize;
        var i;
        for (i = 0; i <= mapSize.x; i++) {
            r.strokeLine(i * tileSize, 0, i * tileSize, mapSize.y * tileSize, "rgba(0,0,0,0.35)", 0.05);
        }
        for (i = 0; i <= mapSize.y; i++) {
            r.strokeLine(0, i * tileSize, mapSize.x * tileSize, i * tileSize, "rgba(0,0,0,0.35)", 0.05);
        }

        // Draw hovered tile
        if (this.mode == Mode.Tiles) {
            if (this.map.isValid(this.hoverTilePos.x, this.hoverTilePos.y)) {
                r.strokeRect(this.hoverTilePos.x * this.map.tileSize, this.hoverTilePos.y * this.map.tileSize, this.map.tileSize, this.map.tileSize, "white");
            }
        }

        r.applyFont(osdFont);
        r.fillText(0.1, 0.1, "Map: " + (this.currentMapName != null ? this.currentMapName : "Untitled") + (this.modified ? " *" : ""), "white");
        r.fillText(0.1, 0.1 + osdFont.size, "Mode: " + this.mode, "white");
        r.fillText(0.1, 0.1 + osdFont.size * 2, "Tile: " + this.tilePen, "white");
        r.resetFont();
    };

    Editor.prototype.setMode = function(mode) {
        this.mode = mode;
    };

    Editor.prototype.setTilePen = function(tilePen) {
        this.tilePen = tilePen;
    };

    Editor.prototype.getTileTypes = function() {
        var list = [];
        for (var k in Tiles) {
            if (Tiles.hasOwnProperty(k)) {
                var v = Tiles[k];
                if (v > -1) {
                    list.push({
                        name: k,
                        value: v
                    });
                }
            }
        }
        return list;
    };

    Editor.prototype.newMap = function() {
        this.map.clear();
        this.currentMapName = null;
        this.entities.removeAll();
        this.modified = false;
        this.modifiedCallback();
    };

    Editor.prototype.loadMap = function(data, name) {
        this.map.import(data);
        this.currentMapName = name;
        this.entities.removeAll();
        this.modified = false;
        this.modifiedCallback();
    };

    Editor.prototype.exportMap = function() {
        return this.map.export();
    };

    return {
        Editor: Editor,
        Mode: Mode
    };
});

