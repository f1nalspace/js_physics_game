function Game1() {
    finalgine.Game.call(this);

    // Increase gravity
    this.gravity.x *= 10;
    this.gravity.y *= 10;

    // Create OSD font
    this.osdFont = finalgine.createFont("Tahoma", 20);
};
Game1.inheritsFrom(finalgine.Game);

Game1.prototype.preloadAssets = function (assets) {
    assets.addLevel("LEVEL:///map1", "content/map1.json");
    assets.addImage("IMAGE:///tileset.png", "content/tileset.png");
};

Game1.prototype.initGame = function () {
    // Get and set active level
    this.activeLevel = this.getAsset("LEVEL:///map1");

    // Player
    this.playerImpulse = finalgine.Vector2(0, 0);
    this.player = new finalgine.PlatformerEntity(this, 0, 0, 16, 32, 10);
    this.addEntity(this.player);
    this.activeLevel.positionEntity(this.player, 2, 2);

    // Add boxes in spaces
    var maxBoxes = 50;
    var grid = this.activeLevel.solidGrid;
    var f = function (v) {
        return v != null ? v.isSolid : true;
    };
    var boxCount = 0;
    for (var y = 0; y < grid.length.y; y++) {
        for (var x = 0; x < grid.length.x; x++) {
            var isSolid = (grid.is(x, y, f, true) ||
                grid.is(x + 1, y, f, true) ||
                grid.is(x + 1, y + 1, f, true) ||
                grid.is(x, y + 1, f, true));
            if (isSolid) continue;

            if (boxCount < maxBoxes) {
                // There was 4 not solid tiles, these can be used to add a box to it

                // Was there already a box in that 4 solid tiles?
                var tileRect = finalgine.Rectangle(x * grid.size.x, y * grid.size.y, grid.size.x * 2, grid.size.y * 2);
                for (var i = 0; i < this.entities.length; i++) {
                    var box = this.entities[i];
                    if (box instanceof finalgine.RenderableEntity) {
                        if (tileRect.contains(box.boundingVolume.boundRect())) {
                            isSolid = true;
                            break;
                        }
                    }
                }

                if (!isSolid) {
                    var box = new finalgine.PlatformerEntity(this, 0, 0, 16, 16, 1);
                    box.applyGravity = true;
                    this.addEntity(box);
                    box.setPosition(tileRect.left() + (tileRect.w / 2), tileRect.top() + (tileRect.h / 2));
                    boxCount++;
                }
            }
        }
    }

    // Camera
    this.camera.friction.setup(0.9, 0.9);
    this.camera.lockTarget(this.player, 5);
};

Game1.prototype.updateGame = function (dt) {
    // Set player force based on key controls
    var playerSpeed = 50;
    if (this.isKeyDown(finalgine.Keys.D) || this.isKeyDown(finalgine.Keys.Right)) {
        this.playerImpulse.x = playerSpeed * this.player.mass;
    } else if (this.isKeyDown(finalgine.Keys.A) || this.isKeyDown(finalgine.Keys.Left)) {
        this.playerImpulse.x = -playerSpeed * this.player.mass;
    }
    var playerJump = 200;
    if (this.isKeyDown(finalgine.Keys.W) || this.isKeyDown(finalgine.Keys.Up)) {
        // Jump
        this.playerImpulse.y = -playerJump * this.player.mass;
    }

    // Decelerate player impulse
    this.playerImpulse.x -= this.player.vel.x * 0.3 / dt;
    this.playerImpulse.y -= this.player.vel.y * 0.3 / dt;

    // Add player impulse
    this.player.addImpulse(this.playerImpulse, dt);

    // Reset player impulse for next frame
    this.playerImpulse.zero();

    // Update base game (Handles also physics / collisions whatever)
    finalgine.Game.prototype.updateGame.call(this, dt);

    // Update camera
    this.camera.update(dt);
};

Game1.prototype.renderGame = function (r) {
    // Render base game
    finalgine.Game.prototype.renderGame.call(this, r);

    var screenRect = this.screenRect();

    // Render fonts
    var text = [
        "Entities: " + this.entities.length,
        "Level AABBs: " + this.levelAABBs.length,
        "Collision checks: " + this.collisionCount,
        "Used cells: " + this.collisionGrid.allocatedCells + " / " + this.collisionGrid.totalCells,
        "Player: " + this.player.pos.toString(),
        "Profiler:"
    ];
    for (var key in this.profiler.items) {
        var itm = this.profiler.items[key];
        text.push("\t\t\t\t" + key + ": " + itm.duration);
    }

    r.drawText(screenRect.left(), screenRect.top(), text, this.osdFont, finalgine.Colors.Blue, "left", "top");
};

// Wrap our game into a anonymous function
(function () {
    var game = new Game1();
    game.canvas = document.getElementById("gameCanvas");
    game.run();
})();
