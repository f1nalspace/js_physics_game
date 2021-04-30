/**
 * Created by final on 15.01.2014.
 */
fm.ns("fm.world.SideScrollingWorld");
fm.req("fm.entity.Entity");
fm.req("fm.geometry.Vec2");
fm.req("fm.geometry.math");
fm.req("fm.collections.Hashmap");
fm.req("fm.gfx.Viewport");
fm.req("fm.map.Map");
fm.req("fm.game.Game");
fm.req("fm.geometry.AABB");
fm.req("fm.physics.collisions");
fm.req("fm.physics.Contact");
fm.req("fm.physics.ContactSolver");

(function (world, entity, Vec2, vmath, AABB, physics) {
    function SideScrollingWorld(game, map) {
        var that = this;
        this.game = game;
        this.gravity = Vec2(0, 9.81 * 20);
        this.map = map;
        this.entities = new fm.collections.Hashmap();
        this.viewport = new fm.gfx.Viewport(0, 0, game.canvas.width, game.canvas.height);
        this.viewport.setBounds(0, 0, map.size[0] * 128, map.size[1] * 128);
        this.aabb1 = new AABB(Vec2(), Vec2());
        this.aabb2 = new AABB(Vec2(), Vec2());
        this.contact = new physics.Contact();
        this.solver = new physics.ContactSolver();
        this.solver.contactCallback = function (bodyA, bodyB, normal, dt) {
            that.collisionContact(bodyA, bodyB, normal, dt);
        };
        this.relOffset = Vec2();
        this.entityCollisionCallback = function (entityA, entityB, normal, dt) {
        };
    }

    SideScrollingWorld.prototype.addEntity = function (entity) {
        this.entities.put(entity.id, entity);
    };

    SideScrollingWorld.prototype.removeEntity = function (entity) {
        this.entities.remove(entity.id);
    };

    SideScrollingWorld.prototype.isInternalEdge = function (tiles, mapSize, tx, ty, normal) {
        var nextTileX = tx + normal[0];
        var nextTileY = ty + normal[1];
        var index = nextTileY * mapSize[0] + nextTileX;
        if (index >= 0 && index < tiles.length && nextTileX >= 0 && nextTileX < mapSize[0] && nextTileY >= 0 && nextTileY < mapSize[1]) {
            return tiles[index] !== -1;
        }
        return false;
    };

    /**
     * Will be called when an collision contact is resolved
     * @param bodyA {object} Entity A
     * @param bodyB {object|null} Entity B or null when tile map collision
     * @param normal {Vec2}
     */
    SideScrollingWorld.prototype.collisionContact = function (bodyA, bodyB, normal, dt) {
        // Tile > Entity collision contact
        var entity = bodyA;
        if (entity instanceof fm.entity.MoveableEntity && normal != null) {
            if (normal[1] < 0) {
                // Entity lands on ground - reset jump count and set on ground flag
                entity.jumpCount = 0;
                entity.onGround = true;
            }
        }

        if (bodyB != null) {
            // Entity collision
            this.entityCollisionCallback(bodyA, bodyB, normal, dt);
        }
    };

    SideScrollingWorld.prototype.handleEntityMapCollision = function (entity, dt) {
        var map = this.map;

        // Get aabb for entity
        var aabbA = this.aabb1;
        var contact = this.contact;
        var relOffset = this.relOffset;
        entity.getSweptAABB(aabbA, dt);

        for (var i = 0; i < map.layers.length; i++) {
            var collisionLayer = map.layers[i].layer;
            if (!collisionLayer.solid) {
                continue;
            }

            var tileSize = collisionLayer.tileSize;
            var mapSize = collisionLayer.size;
            var tiles = collisionLayer.tiles;

            // Calculate tile range for this collision layer
            var tx1 = Math.floor(aabbA.min[0] / tileSize);
            var ty1 = Math.floor(aabbA.min[1] / tileSize);
            var tx2 = Math.ceil(aabbA.max[0] / tileSize);
            var ty2 = Math.ceil(aabbA.max[1] / tileSize);

            // Create contacts
            for (var y = ty1; y <= ty2; y++) {
                for (var x = tx1; x <= tx2; x++) {
                    var index = y * mapSize[0] + x;
                    if (index >= 0 && index < tiles.length && x >= 0 && x < mapSize[0] && y >= 0 && y < mapSize[1]) {
                        var tile = tiles[index];
                        if (tile !== -1) {

                            // TODO: Get aabb from tile
                            var aabbB = new AABB(Vec2(), Vec2());
                            aabbB.min[0] = x * tileSize;
                            aabbB.min[1] = y * tileSize;
                            aabbB.max[0] = x * tileSize + tileSize;
                            aabbB.max[1] = y * tileSize + tileSize;

                            // Get relative offset
                            relOffset[0] = aabbB.getCenterX() - aabbA.getCenterX();
                            relOffset[1] = aabbB.getCenterY() - aabbA.getCenterY();

                            // Get and add contact for aabb A (entity) and aabb B (tile)
                            physics.collisions.getContactAABBvsAABB(contact, aabbA, aabbB, relOffset);

                            // Add only contacts to the solver which are not internal edges
                            if (!this.isInternalEdge(tiles, mapSize, x, y, contact.normal)) {
                                this.solver.addContact(entity, null, contact.normal, contact.distance, aabbB);
                            }
                        }
                    }
                }
            }
        }
    };

    SideScrollingWorld.prototype.resolveEntityCollision = function (entityA, entityB, dt) {
        var contact = this.contact;
        var relOffset = this.relOffset;
        entityA.getSweptAABB(this.aabb1, dt);
        entityB.getSweptAABB(this.aabb2, dt);
        if (physics.collisions.isIntersectionAABBvsAABB(this.aabb1, this.aabb2)) {
            // There is definitily an overlap between this entities - collision is a fact
            // But we want only contacts when at least one entity allows resolve of collision
            if (entityA.handleEntityCollisions.has(entity.EntityCollisionFlag.SourceResolve) ||
                entityB.handleEntityCollisions.has(entity.EntityCollisionFlag.TargetResolve)) {
                // Get relative offset
                relOffset[0] = this.aabb2.getCenterX() - this.aabb1.getCenterX();
                relOffset[1] = this.aabb2.getCenterY() - this.aabb1.getCenterY();

                // Get and add contact for both entities
                physics.collisions.getContactAABBvsAABB(contact, this.aabb1, this.aabb2, relOffset);
                this.solver.addContact(entityA, entityB, contact.normal, contact.distance, null);
            } else {
                // Handle collision
                this.collisionContact(entityA, entityB, null);
            }
        }
    };


    SideScrollingWorld.prototype.preCollision = function () {

        var v = this.entities.values;
        v.forEach(function (entity) {
            if (entity instanceof fm.entity.MoveableEntity && entity.handleMapCollisions) {
                entity.onGroundLast = entity.onGround;
                entity.onGround = false;
            }
        });
    };

    SideScrollingWorld.prototype.resolveCollisions = function (dt) {
        // Reset contact solver
        this.solver.reset();

        // Pre collision
        this.preCollision();

        // First resolve collisions against other entities
        // Also ensure that only one unique collision pair are tested!
        var that = this;
        var v = this.entities.values;
        v.forEach(function (sourceEntity) {
            // Only entities which handle source collisions - collisions against other entities are allowed to test against
            if (sourceEntity.alive &&
                sourceEntity instanceof fm.entity.MoveableEntity &&
                sourceEntity.handleEntityCollisions.has(fm.entity.EntityCollisionFlag.Source)) {
                v.forEach(function (targetEntity) {
                    // Only entities which handle at least target collisions are allowed to test against
                    if (targetEntity != sourceEntity &&
                        targetEntity.alive &&
                        targetEntity instanceof fm.entity.MoveableEntity &&
                        targetEntity.handleEntityCollisions.has(fm.entity.EntityCollisionFlag.Target)) {
                        that.resolveEntityCollision(sourceEntity, targetEntity, dt);
                    }
                });
            }

        });

        // Second resolve collisions for entities against map
        v.forEach(function (entity) {
            if (entity.alive && entity instanceof fm.entity.MoveableEntity && entity.handleMapCollisions) {
                that.handleEntityMapCollision(entity, dt);
            }
        });

        // Solve contacts
        this.solver.solve(dt);
    };

    SideScrollingWorld.prototype.update = function (dt) {
        var that = this;

        // Update map (lights)
        this.map.update(dt);

        var v = this.entities.values;

        // Apply gravity to all entities which accepts gravity
        v.forEach(function (entity) {
            if (entity.alive && entity instanceof fm.entity.MoveableEntity && entity.acceptGravity) {
                vmath.vec2AddMultScalar(entity.vel, entity.vel, that.gravity, dt);
            }
        });

        // Resolve collisions
        that.resolveCollisions(dt);

        // Update entities (Updates sprite animations, integration etc.)
        v.forEach(function (entity) {
            if (entity.alive) {
                entity.update(dt);
            }
        });

    };

    SideScrollingWorld.prototype.render = function (r) {
        r.push();
        r.translate((r.getWidth() * 0.5 - this.viewport.getWidth() * 0.5) - this.viewport.getOffsetX(), (r.getHeight() * 0.5 - this.viewport.getHeight() * 0.5) - this.viewport.getOffsetY());

        // Render map
        this.map.render(r, this.viewport);

        // Render entities
        var that = this;
        var v = this.entities.values;
        v.forEach(function (entity) {
            if (entity.alive && entity instanceof fm.entity.RenderableEntity) {
                if (that.map.canBeSeen(entity.pos[0], entity.pos[1])) {
                    entity.render(r, that.map.getLightValueAt(entity.pos[0], entity.pos[1]));
                }
            }
        });

        r.pop();
    };

    SideScrollingWorld.prototype.renderDebugEntityBounds = function (r, entity, dt) {
        var map = this.map;

        // Get aabb for entity
        var aabbA = this.aabb1;
        entity.getSweptAABB(aabbA, dt);

        for (var i = 0; i < map.layers.length; i++) {
            var collisionLayer = map.layers[i].layer;
            if (!collisionLayer.solid) {
                continue;
            }

            var tileSize = collisionLayer.tileSize;

            // Calculate tile range for this collision layer
            var tx1 = Math.floor(aabbA.min[0] / tileSize);
            var ty1 = Math.floor(aabbA.min[1] / tileSize);
            var tx2 = Math.ceil(aabbA.max[0] / tileSize);
            var ty2 = Math.ceil(aabbA.max[1] / tileSize);

            var eX = tx2 * tileSize - tx1 * tileSize;
            var eY = ty2 * tileSize - ty1 * tileSize;
            //r.strokeRect(tx1 * tileSize, ty1 * tileSize, eX, eY, "aqua", 2);
        }

        r.strokeRect(aabbA.min[0], aabbA.min[1], aabbA.max[0] - aabbA.min[0], aabbA.max[1] - aabbA.min[1], "blue", 2);
    };

    SideScrollingWorld.prototype.renderDebug = function (r) {
        r.push();
        r.translate((r.getWidth() * 0.5 - this.viewport.getWidth() * 0.5) - this.viewport.getOffsetX(), (r.getHeight() * 0.5 - this.viewport.getHeight() * 0.5) - this.viewport.getOffsetY());

        // Draw viewport
        r.strokeRect(this.viewport.bounds[0], this.viewport.bounds[1], this.viewport.bounds[2], this.viewport.bounds[3], "lime", 1);
        r.strokeRect(this.viewport.view[0], this.viewport.view[1], this.viewport.view[2], this.viewport.view[3], "white", 1);

        // Draw entity bounds
        var that = this;
        var v = this.entities.values;
        v.forEach(function (entity) {
            if (entity.alive && entity instanceof fm.entity.RenderableEntity) {
                if (that.map.canBeSeen(entity.pos[0], entity.pos[1])) {
                    that.renderDebugEntityBounds(r, entity, 1 / 60);
                }
            }
        });

        // Draw contacts
        for (var i = 0; i < this.solver.contactCount; i++) {
            var contact = this.solver.contacts[i];
            if (contact.tileAABB != null) {
                var ta = contact.tileAABB;
                var eX = (ta.max[0] - ta.min[0]) * 0.5;
                var eY = (ta.max[1] - ta.min[1]) * 0.5;
                r.strokeRect(ta.min[0], ta.min[1], eX * 2, eY * 2, "purple", 2);

                var cx = (ta.min[0] + eX) + contact.normal[0] * eX;
                var cy = (ta.min[1] + eY) + contact.normal[1] * eX;
                r.drawLine(cx, cy, cx + contact.normal[0] * contact.distance, cy + contact.normal[1] * contact.distance, "red", 2);
            }
        }

        r.pop();
    };

    world.SideScrollingWorld = SideScrollingWorld;
})(fm.world, fm.entity, fm.geometry.Vec2, fm.geometry.math, fm.geometry.AABB, fm.physics);