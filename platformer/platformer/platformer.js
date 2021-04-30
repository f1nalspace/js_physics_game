/**
 * Created by final on 08.01.2014.
 */
fm.ns("fm.app.platformer");
fm.req("fm.game.Game");
fm.req("fm.entity.Entity");
fm.req("fm.geometry.math");
fm.req("fm.gfx.Tileset");
fm.req("fm.gfx.Spritesheet");
fm.req("fm.map.Map");
fm.req("fm.app.platformer.Player");
fm.req("fm.app.platformer.Collectable");
fm.req("fm.app.platformer.MoveableBox");
fm.req("fm.app.platformer.Jumppad");
fm.req("fm.app.platformer.PlayerController");
fm.req("fm.world.SideScrollingWorld");

(function (platformer, game, entity, vmath, gfx, pf, Vec2, map) {
    var tileSize = 32;

    function Platformer(canvas) {
        game.Game.call(this, canvas);
        this.audio = new fm.audio.Audio();
        this.player = null;
        this.playerController = null;
        this.world = null;
        this.tilesets = [];
        this.debugEnabled = false;
    }

    Platformer.extends(game.Game);

    Platformer.prototype.toggleDebug = function() {
        this.debugEnabled = !this.debugEnabled;
    };

    Platformer.prototype.loadContent = function (r) {
        var deps = fm.app.platformer.resources.dependencies;
        for (var k in deps) {
        	if (deps.hasOwnProperty(k)) {
        		this.addResourceDependency(k, deps[k]);
        	}
        }
        
        var items = fm.app.platformer.resources.items;
        for (var i = 0; i < items.length; i++) {
        	var item = items[i];
        	if (item.category == "audio") {
        		this.loadAudio(item);
        	} else if (item.category == "texture") {
        		this.loadTexture(item, r);
        	} else if (item.category == "tileset") {
        		this.loadTileset(item, r);
        	} else if (item.category == "map") {
        		this.loadMap(item);
        	} else {
        		fm.log("Unknown resource type: '" + item.category + "'");
        	}
        }
    };
    
    Platformer.prototype.loadAudio = function(item) {
    	var that = this;
    	this.addResource(item.file, item.name, function (key, data, ret) {
			ret(that.audio.add(key, data, item.volume));
		}, "audio");
    };
    
    Platformer.prototype.loadTexture = function(item, r) {
    	this.addResource(item.file, item.name, function (key, data, ret) {
            var spritesheet = new fm.gfx.Spritesheet();
            spritesheet.init(item.width, item.height, r.loadTexture(data));
            ret(spritesheet);
        }, "texture");
    };
    
    Platformer.prototype.loadTileset = function(item, r) {
    	var that = this;
    	this.addResource(item.file, item.name, function (key, data, ret) {
            var json = JSON.parse(data.responseText);
            var img = new Image();
            var tileset = new gfx.Tileset();
            img.onload = function() {
            	tileset.init(r, item.name, img, tileSize, json.animations);
            	that.tilesets.push(tileset);
            	ret(tileset);
            };
            img.src = "data:image/png;base64," + json.data;
        }, "tileset");
    };
    
    Platformer.prototype.loadMap = function(item) {
    	var that = this;
    	this.addResource(item.file, item.name, function (key, data, ret) {
            var m = new map.Map();
            var t = item.tileObjectMappings;
            for (var k in t) {
            	if (t.hasOwnProperty(k)) {
            		m.addTileObjectMapping(t[k].tileset, t[k].mappings);
            	}
            }
            m.initFromJson(that.resMng, data);
            ret(m);
        }, "map");
    };

    /**
     * Places the given entity to the objects bottom or top position position
     * @param object [object]
     * @param entity [object]
     */
    Platformer.prototype.placeObject = function(object, entity) {
        var x = object.pos[0] * object.layer.tileSize + entity.size[0] * 0.5;
        var y = (object.pos[1] + 1) * object.layer.tileSize - entity.size[1] * 0.5;
        vmath.vec2Set(entity.pos, x, y);
    };

    Platformer.prototype.entityCollision = function(entityA, entityB, normal, dt) {
        if (entityA instanceof platformer.Player) {
            if (entityB instanceof platformer.Collectable) {
                entityB.alive = false;

                // TODO: 3 diamond types: blue, green, red (1, 5, 10)
                entityA.score += 1;
            } else if (entityB instanceof platformer.Jumppad && normal[1] < 0) {
                entityA.vel[1] -= entityB.power;
            }
        }
    };

    Platformer.prototype.init = function () {
        var that = this;

        var map = this.resMng.get("map:00");

        this.world = new fm.world.SideScrollingWorld(this, map);
        this.world.entityCollisionCallback = this.entityCollision.bind(this);

        // Create player, place it to the player spawn and add it to the world
        this.player = new pf.Player();
        this.player.sheet = this.resMng.get("spritesheet:player");
        vmath.vec2Set(this.player.dir, 1, 0);
        vmath.vec2Set(this.player.size, 24, 48);
        this.placeObject(map.getObjectsByType("PlayerSpawn")[0], this.player);
        this.world.addEntity(this.player);

        // Create player controller
        this.playerController = new platformer.PlayerController(this, this.player);

        // Set world viewport target to player position vector
        this.world.viewport.target = this.player.pos;

        var brightWhite = new fm.gfx.LightValue(1.0, 1.0, 1.0, 1.0);
        var dimBlue = new fm.gfx.LightValue(0.0, 0.0, 1.0, 0.1);

        // player light
        // FIXME: Use player position as reference vector - no need to update pos all the time, just add a position vector to the light
        this.playerLight = new fm.map.Light(this.player.pos[0], this.player.pos[1], 128, brightWhite);
        map.addLight(this.playerLight);

        // deco light
        var decoLight = new fm.map.Light(this.player.pos[0], this.player.pos[1], 128, brightWhite.dim(2));
        decoLight.flicker([0.02, 0.5], [0.2, 5]);
        map.addLight(decoLight);
        var torch = new fm.map.Light(this.player.pos[0] + 128, this.player.pos[1] + 256, 128, new fm.gfx.LightValue(0.91, 0.53, 0.22, 0.7));
        torch.resize();
        map.addLight(torch);
        map.ambientLight = dimBlue;

        // add other objects to world from map
        var diamondObjects = map.getObjectsByType("Diamond");
        diamondObjects.forEach(function(diamondObject){
            var diamond = new platformer.Collectable(diamondObject.tile);
            that.placeObject(diamondObject, diamond);
            that.world.addEntity(diamond);
        });

        var jumppadObjects = map.getObjectsByType("Jumppad");
        jumppadObjects.forEach(function(jumppadObject){
            var jumppad = new platformer.Jumppad(jumppadObject.tile);
            that.placeObject(jumppadObject, jumppad);
            that.world.addEntity(jumppad);
        });

        var boxObjects = map.getObjectsByType("Box");
        boxObjects.forEach(function(boxObject){
            var box = new platformer.MoveableBox(boxObject.tile);
            that.placeObject(boxObject, box);
            that.world.addEntity(box);
        });

        this.audio.setPlaylist(['music:ambient-00']);
        //this.audio.playJukebox();
    };

    Platformer.prototype.update = function (dt) {
        game.Game.prototype.update.call(this, dt);
        this.playerController.update(dt);
        this.world.update(dt);
        this.world.viewport.update(dt);
        this.audio.update();
        for (var i = 0; i < this.tilesets.length; i++) {
        	this.tilesets[i].update(dt);
        }

        // move light to player
        this.playerLight.setPos(this.player.pos[0], this.player.pos[1]);
    };

    var osdFont = {
        name: "arial",
        size: 20,
        style: "normal"
    };
    Platformer.prototype.drawOSD = function (r) {
        r.setFont(osdFont);
        r.fillText(0, 0, "Score: " + this.player.score, "white", "left", "top");
        r.fillText(0, 20, "Contacts: " + this.world.solver.contactCount, "white", "left", "top");
        r.resetFont();
    };

    Platformer.prototype.draw = function (r) {
        game.Game.prototype.draw.call(this, r);
        this.world.render(r);
        if (this.debugEnabled) {
            this.world.renderDebug(r);
        }
        this.drawOSD(r);
    };

    platformer.Platformer = Platformer;
})(fm.app.platformer, fm.game, fm.entity, fm.geometry.math, fm.gfx, fm.app.platformer, fm.geometry.Vec2, fm.map);
