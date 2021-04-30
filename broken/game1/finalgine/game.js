var finalgine = finalgine || {};

finalgine.Game = function (screenRes, scaleMode) {
    finalgine.GameEngine.call(this, screenRes, scaleMode);
    this.entities = [];
    this.gravity = finalgine.Vector2(0.0, 9.81);
    this.activeLevel = null;
    this.camera = new finalgine.Camera();
    this.levelAABBs = [];
    this.collisionGrid = null;
    this.collisionCount = 0;
};
finalgine.Game.inheritsFrom(finalgine.GameEngine);

finalgine.Game.prototype.updateLevelAABBs = function() {
	this.levelAABBs = [];
	this.collisionGrid = null;
	if (this.activeLevel != null) {
		var startTime = window.performance.now(); 
				
		var tilemap = this.activeLevel.solidGrid.clone();
		var tileLength = tilemap.length;
		var tileSize = tilemap.size;

		var isSolidFunc = function(tile) {
			if (tile != null) {
				return tile.isSolid;
			} else {
				return false;
			}
		};

	    for (var y = 0; y < tileLength.y; y++) {
	        for (var x = 0; x < tileLength.x; x++) {
	        	if (tilemap.is(x, y, isSolidFunc, false)) {
	        		var currentTile = finalgine.Vector2(x, y);
	        		var currentTileSpan = finalgine.Vector2(0, 0);

					var canMoveRight = true;
					var canMoveBottom = true;
					while (canMoveRight || canMoveBottom) {
						if (canMoveRight) {
							for (var y1 = currentTile.y; y1 <= currentTile.y + currentTileSpan.y; y1++) {
								if (!tilemap.is(currentTile.x + currentTileSpan.x + 1, y1, isSolidFunc, false)) {
									canMoveRight = false;
									break;
								}
							}
							if (canMoveRight) {
								currentTileSpan.x = currentTileSpan.x + 1;
							}
						}
						if (canMoveBottom) {
							for (var x1 = currentTile.x; x1 <= currentTile.x + currentTileSpan.x; x1++) {
								if (!tilemap.is(x1, currentTile.y + currentTileSpan.y + 1, isSolidFunc, false)) {
									canMoveBottom = false;
									break;
								}
							}
							if (canMoveBottom) {
								currentTileSpan.y = currentTileSpan.y + 1;
							}
						}
					}

					// Remove solid flags from tilemap
					for (var y2 = currentTile.y; y2 <= currentTile.y + currentTileSpan.y; y2++) {
						for (var x2 = currentTile.x; x2 <= currentTile.x + currentTileSpan.x; x2++) {
							tilemap.set(x2, y2, null);
						}
					}

					// Create final tile rectangle
                    var r = {
                        x:currentTile.x,
                        y:currentTile.y,
                        w:currentTileSpan.x,
                        h:currentTileSpan.y,
                        toString: function() {
                            return this.x + ", " + this.y + " (" + this.w + ", " + this.h + ")";
                        }
                    };

                    // Create final position and scale
					var p = finalgine.Vector2(r.x * tileSize.x, r.y * tileSize.y);
					var s = finalgine.Vector2((currentTileSpan.x + 1) * tileSize.x, (currentTileSpan.y + 1) * tileSize.y);

					// Create final aabb
					var aabb = finalgine.AABB(p.add(s.mul(0.5)), s);

                    // We don´t want to create an entire physics entity for that tile
                    // therefore we create a simplified version from it
                    var tilePhysics = {
                        isStatic:function () {
                            return true;
                        },
                        boundingVolume:aabb,
                        pos:aabb.center,
                        prevPos:finalgine.Vector2(aabb.center),
                        vel:finalgine.Vector2(0, 0),
                        invMass:0.0,
                        getVelocity: function() {
                        	return finalgine.Vector2(0, 0);
                        },
                        boundRect: function() {
                        	return this.boundingVolume.boundRect();
                        },
                        addImpulse: function() {

                        }
                    };

					this.levelAABBs.push(tilePhysics);
	        	}
	        }
	    }
	    
	    var finalTime = window.performance.now() - startTime;
	    finalgine.Log.info("Created " + this.levelAABBs.length + " level aabbs in " + finalTime + " msecs.");

		// Create collision tree
		var levelSize = this.activeLevel.solidGrid.getSize();
		var levelPos = finalgine.Vector2(0.0, 0.0);
        var levelRect = finalgine.Rectangle(levelPos.x, levelPos.y, levelSize.x, levelSize.y);
        this.collisionGrid = new finalgine.IndexGrid(levelRect, finalgine.Vector2(tileSize.x, tileSize.y));

	}
};

finalgine.Game.prototype.startGame = function() {
	// Update level aabbs and create collision tree
	this.updateLevelAABBs();
};

finalgine.Game.prototype.addEntity = function (entity) {
    this.entities.push(entity);
};

finalgine.Game.prototype.renderGame = function (r) {
    this.profiler.start("Render Game");

    // Clear black
    var s = this.screenRect();
    r.fillRect(s.left(), s.top(), s.w, s.h, finalgine.Colors.Black);

    // Save matrix
    r.push();

    // Set camera transformation
    r.translate(this.camera.pos.x, this.camera.pos.y);
    r.scale(this.camera.zoom.x, this.camera.zoom.y);

    // Draw collision grid
    if (this.collisionGrid != null) {
        this.collisionGrid.draw(r, finalgine.Colors.White, finalgine.Colors.Green, 0.2);
    }

    // Draw level
    if (this.activeLevel != null) {
        this.drawLevel(this.activeLevel, r);
    }

    // Draw entities
    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        entity.render(r);
    }

    // Revoke matrix
    r.pop();

    this.profiler.stop("Render Game");
};

finalgine.Game.prototype.beforeUpdate = function(dt) {
    this.profiler.start("Before Update");

    // Reset entity forces
    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        if (entity instanceof finalgine.PhysicsEntity) {
            entity.resetImpulse();
        }
    }

    this.profiler.stop("Before Update");
};

finalgine.Game.prototype.updateGame = function (dt) {
    this.profiler.start("Update Game");

    // Reset statistics
    this.collisionCount = 0;

    // Clear collision grid
    this.collisionGrid.clear();

    // Add level aabb´s to collision tree
    for (var i in this.levelAABBs) {
        this.collisionGrid.insert(this.levelAABBs[i], this.levelAABBs[i].boundRect());
    }

    // Add entities to collision tree
    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        if (entity instanceof finalgine.PhysicsEntity) {
            this.collisionGrid.insert(entity, entity.velocityRect());
        }
    }

    //-------------------------------------------------------
    // Add internal forces like gravity
    //-------------------------------------------------------
    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        if (entity instanceof finalgine.PhysicsEntity) {
            if (entity.applyGravity) {
                entity.addImpulse(entity.gravity.mul(entity.mass), dt);
            }
        }
    }

    //-------------------------------------------------------
    // Resolve collisions
    //-------------------------------------------------------
    this.profiler.start("Collisions");
    if (this.activeLevel != null) {
        for (var i = 0; i < this.entities.length; i++) {
            var entity = this.entities[i];
            if (entity instanceof finalgine.PhysicsEntity) {
                this.resolveCollisions(entity, dt);
            }
        }
    }
    this.profiler.stop("Collisions");

    //-------------------------------------------------------
    // Integrate
    //-------------------------------------------------------
    this.profiler.start("Integration");
    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        if (entity instanceof finalgine.MovableEntity) {
            entity.update(dt);
        }
    }
    this.profiler.stop("Integration");

    this.profiler.stop("Update Game");
};

finalgine.Game.prototype.resolveCollisions = function(entity, frametime) {
    var lst = this.collisionGrid.retrieve(entity, entity.velocityRect());
    for (var i in lst) {
    	// We do not want to collide with ourself
    	if (lst[i] !== entity) {
	        var enemy = lst[i];
	
	        // Now we can check the enemy and the entity
	        this.collisionCount++;
	        finalgine.collide(entity, enemy, frametime);
    	}
    }
};

finalgine.Game.prototype.drawLevel = function (level, r) {
    var screenRect = this.screenRect();
    var tileSize = level.solidGrid.size;
    var tileLength = level.solidGrid.length;
    var drawedTiles = 0;
    var rect;
    for (var y = 0; y < tileLength.y; y++) {
        for (var x = 0; x < tileLength.x; x++) {
            var tile = level.solidGrid.get(x, y);
            rect = tile.boundingVolume.boundRect();
            var transformedRect = rect.mul(this.camera.zoom).add(this.camera.pos);
            if (screenRect.contains(transformedRect)) {
                if (tile.isSolid) {
                    r.fillRect(rect.left(), rect.top(), rect.w, rect.h, [1.0, 1.0, 1.0]);
                }
                drawedTiles++;
            }
        }
    }
};
