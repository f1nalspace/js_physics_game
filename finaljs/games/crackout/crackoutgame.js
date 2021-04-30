/**
 * Crackout (Krakout-clone) based on finaljs game development framework
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.games.crackout.CrackoutGame",
    [
        "final.Vec2",
        "final.Vec2Pool",
        "final.math",
        "final.collection.List",
        "final.collection.ObjectPool",
        "final.engine.Engine",
        "final.input.Keys",
        "final.collision.ClosestPoints",
        "final.collision.Response",
        "final.collision.Intersections"
    ],
    function (final, Vec2, Vec2Pool, math, List, ObjectPool, Engine, Keys, ClosestPoints, Response, Intersections) {
        function Body() {
            this.alive = false;
            this.pos = new Vec2();
            this.vel = new Vec2();
            this.dir = new Vec2();
            this.accel = new Vec2();
            this.speed = 0;
            this.damping = 0;
            this.static = false;
            this.maxSpeed = 100000;
            this.minSpeed = 10000;
        }

        Body.prototype.init = function () {
            math.vec2Zero(this.pos);
            math.vec2Zero(this.vel);
            math.vec2Zero(this.dir);
            math.vec2Zero(this.accel);
            this.speed = 0;
            this.alive = true;
        };

        Body.prototype.addAcceleration = function (speed, dx, dy) {
            this.speed = speed;
            this.dir.x = typeof dx != "undefined" ? dx : this.dir.x;
            this.dir.y = typeof dy != "undefined" ? dy : this.dir.y;
            this.accel.x += this.speed * this.dir.x;
            this.accel.y += this.speed * this.dir.y;
        };

        Body.prototype.accelerate = function (percentage) {
            var v = math.vec2Length(this.vel);
            var n = Vec2Pool.get();
            math.vec2Normalize(n, this.vel);
            math.vec2MultScalar(this.vel, n, Math.max(Math.min(v + v * percentage, this.maxSpeed, this.minSpeed)));
        };

        Body.prototype.update = function (dt) {
            if (!this.static) {
                math.vec2AddMultScalar(this.vel, this.vel, this.accel, dt);
                math.vec2MultScalar(this.vel, this.vel, 1 - this.damping);
                math.vec2AddMultScalar(this.pos, this.pos, this.vel, dt);
            }
            math.vec2Zero(this.accel);
        };

        function AABB() {
            Body.call(this);
            this.ext = new Vec2();
        }

        AABB.extend(Body);

        AABB.prototype.draw = function (r) {
            r.fillRect(this.pos.x - this.ext.x, this.pos.y - this.ext.y, this.ext.x * 2, this.ext.y * 2, "green");
        };

        function Paddle() {
            AABB.call(this);
            this.size = 50;
            this.sizeNormal = new Vec2(1, 0);
            math.vec2Set(this.ext, this.size, 15);
            this.maxExt = new Vec2(this.size * 2, this.ext.y);
            this.minExt = new Vec2(this.size * 0.5, this.ext.y);
            this.damping = 0.1;
            this.glue = null;
            this.image = null;
            this.autoGlue = false;
        }

        Paddle.extend(AABB);

        Paddle.prototype.draw = function (r) {
            r.drawImage(this.image, this.pos.x - this.ext.x, this.pos.y - this.ext.y, this.ext.x * 2, this.ext.y * 2, 0, 0, this.image.width, this.image.height);
            //r.strokeRect(this.pos.x - this.ext.x, this.pos.y - this.ext.y, this.ext.x * 2, this.ext.y * 2, "red");
        };

        Paddle.prototype.growOrShrink = function (percent) {
            var l = math.vec2Dot(this.sizeNormal, this.ext);
            math.vec2AddMultScalar(this.ext, this.ext, this.sizeNormal, l * percent);
            this.ext.x = Math.max(Math.min(this.ext.x, this.maxExt.x), this.minExt.x);
            this.ext.y = Math.max(Math.min(this.ext.y, this.maxExt.y), this.minExt.y);
        };

        function Brick() {
            AABB.call(this);
            this.static = true;
            math.vec2Set(this.ext, 30, 10);
            this.alive = true;
            this.tile = 0;
        }

        Brick.extend(AABB);

        Brick.prototype.draw = function (r, tileset) {
            var offset = tileset.offsetMap[this.tile];
            r.drawImage(tileset.image, this.pos.x - this.ext.x, this.pos.y - this.ext.y, this.ext.x * 2, this.ext.y * 2, offset.x, offset.y, tileset.tileWidth, tileset.tileHeight);
            //r.strokeRect(this.pos.x - this.ext.x, this.pos.y - this.ext.y, this.ext.x * 2, this.ext.y * 2, "red");
        };

        function Ball() {
            Body.call(this);
            this.radius = 10;
            this.alive = false;
            this.tile = 0;
        }

        Ball.extend(Body);

        Ball.prototype.draw = function (r, tileset) {
            var offset = tileset.offsetMap[this.tile];
            r.drawImage(tileset.image, this.pos.x - this.radius, this.pos.y - this.radius, this.radius * 2, this.radius * 2, offset.x, offset.y, tileset.tileWidth, tileset.tileHeight);
            //r.fillArc(this.pos.x, this.pos.y, this.radius, "blue");
        };

        function Wall(normal, distance, length, out) {
            this.normal = normal;
            this.distance = distance;
            this.len = length;
            this.out = out || false;
        }

        Wall.prototype.draw = function (r) {
            var center = Vec2Pool.get();
            math.vec2MultScalar(center, this.normal, -this.distance);

            var tangent = Vec2Pool.get();
            math.vec2PerpRight(tangent, this.normal);

            var a = Vec2Pool.get();
            var b = Vec2Pool.get();
            math.vec2AddMultScalar(a, center, tangent, -this.len);
            math.vec2AddMultScalar(b, center, tangent, this.len);

            r.drawLine(b.x, b.y, a.x, a.y, this.out ? "red" : "yellow", 2);
        };

        var ItemType = {
            None: 0,
            PaddleExpand: 1, // Expand paddle
            PaddleShrink: 2, // Shrink paddle
            PaddleAutoGlue: 3, // When ball hits paddle always glue it
            PaddleGhost: 4, // Ball goes through paddle while in ghost mode
            BallSpawn: 5, // Spawn a new ball in a random direction
            BallAccelerate: 6, // Accelerate ball speed
            BallDecelerate: 7, // Decelerate ball speed
            AddLife: 8, // Add a life,
            IncScore: 9, // Increase score,
            getCount: function () {
                var c = 0;
                for (var k in this) {
                    if (this.hasOwnProperty(k)) {
                        c++;
                    }
                }
                return c;
            }
        };

        var ItemColors = {
        };
        ItemColors[ItemType.PaddleExpand] = "green";
        ItemColors[ItemType.PaddleShrink] = "red";
        ItemColors[ItemType.PaddleAutoGlue] = "lime";
        ItemColors[ItemType.PaddleGhost] = "rgba(255,255,255,0.25)";
        ItemColors[ItemType.BallSpawn] = "blue";
        ItemColors[ItemType.BallAccelerate] = "aqua";
        ItemColors[ItemType.BallDecelerate] = "darkblue";
        ItemColors[ItemType.IncScore] = "yellow";
        ItemColors[ItemType.AddLife] = "white";

        function Item() {
            AABB.call(this);
            math.vec2Set(this.ext, 24, 10);
            this.type = ItemType.None;
        }

        Item.extend(AABB);

        Item.prototype.draw = function (r) {
            r.strokeRect(this.pos.x - this.ext.x, this.pos.y - this.ext.y, this.ext.x * 2, this.ext.y * 2, ItemColors[this.type] || "black", 2);
        };

        function Tileset(image, tileWidth, tileHeight, margin, spacing) {
            this.image = image;
            this.tileWidth = tileWidth;
            this.tileHeight = tileHeight;
            this.margin = margin;
            this.spacing = spacing;
            this.offsetMap = [];
            var iw = Math.floor(this.image.width / this.tileWidth);
            var ih = Math.floor(this.image.height / this.tileHeight);
            for (var y = 0; y < ih; y++) {
                for (var x = 0; x < iw; x++) {
                    this.offsetMap[1 + y * iw + x] = new Vec2(this.margin + x * (this.tileWidth + this.spacing), this.margin + y * (this.tileHeight + this.spacing));
                }
            }
        }

        function CrackoutGame(canvas) {
            Engine.call(this, canvas);

            var w = this.window.getWidth();
            var h = this.window.getHeight();

            this.step = false;
            this.singleStepping = false;

            this.satAxis = [];
            for (var i = 0; i < 10; i++) {
                this.satAxis[i] = new Vec2();
            }
            this.satAxisCount = 0;

            this.balls = new ObjectPool(function () {
                var b = new Ball();
                b.tile = 1;
                return b;
            });
            this.balls.expand(10);
            this.maxBalls = 10;

            this.paddle = new Paddle();

            this.walls = [
                new Wall(new Vec2(0, -1), h * 0.45, w * 0.45, false),
                new Wall(new Vec2(0, 1), h * 0.45, w * 0.45),
                new Wall(new Vec2(-1, 0), w * 0.45, h * 0.45),
                new Wall(new Vec2(1, 0), w * 0.45, h * 0.45)
            ];
            this.wallCount = 4;

            this.bricks = new List();
            this.activeBricks = 0;

            this.items = new ObjectPool(function () {
                return new Item();
            });
            this.items.expand(100);

            this.lifes = 0;
            this.score = 0;

            this.bricksTileset = null;
            this.ballTileset = null;
            this.pipeImage = null;
            this.pipeDimensionMap = {
                topCenter: {x: 95, y: 1, w: 60, h: 30},
                topLeft: {x: 33, y: 1, w: 60, h: 30},
                topRight: {x: 157, y: 1, w: 60, h: 30},
                edgeTopLeft: {x: 1, y: 1, w: 30, h: 30},
                edgeTopRight: {x: 219, y: 1, w: 30, h: 30},
                leftMiddle: {x: 33, y: 65, w: 30, h: 60},
                rightMiddle: {x: 129, y: 65, w: 30, h: 60},
                leftTop: {x: 1, y: 65, w: 30, h: 60},
                rightTop: {x: 97, y: 65, w: 30, h: 60},
                leftBottom: {x: 65, y: 65, w: 30, h: 60},
                rightBottom: {x: 161, y: 65, w: 30, h: 60},
                bottomCenter: {x: 95, y: 33, w: 60, h: 30},
                bottomLeft: {x: 33, y: 33, w: 60, h: 30},
                bottomRight: {x: 157, y: 33, w: 60, h: 30},
                edgeBottomLeft: {x: 1, y: 33, w: 30, h: 30},
                edgeBottomRight: {x: 219, y: 33, w: 30, h: 30}
            };

            this.restartLevel();
        }

        CrackoutGame.extend(Engine);

        CrackoutGame.prototype.init = function () {
            var that = this;
            this.addResourceDependency("level", "tileset");
            this.addResource("content/images/bricktileset.png", "bricktileset", "tileset", function (key, data) {
                that.bricksTileset = new Tileset(data, 60, 20, 1, 2);
            });
            this.addResource("content/images/balltileset.png", "balltileset", "tileset", function (key, data) {
                that.ballTileset = new Tileset(data, 21, 21, 1, 2);
            });
            this.addResource("content/images/paddle.png", "paddle", "image", function (key, data) {
                that.paddle.image = data;
            });
            this.addResource("content/images/frametileset.png", "frametileset", "image", function (key, data) {
                that.pipeImage = data;
            });
            this.addResource("content/levels/level1.json", "level1", "level", function (key, xhr) {
                that.loadLevel(JSON.parse(xhr.responseText));
            });
            this.addResource("content/music/dst-4tran.ogg", "music1", "music");
            this.addResource("content/music/dst-angrymod.ogg", "music2", "music");
            this.addResource("content/sound/hitbrick.ogg", "hitbrick", "sound");
        };

        CrackoutGame.prototype.prepare = function (dt, r) {
            Engine.prototype.prepare.call(this, dt, r);
            this.audioMng.play("music2", 1, true);
        };

        CrackoutGame.prototype.loadLevel = function (map) {
            if ((map || null) == null) {
                throw new Error("No map provided!");
            }
            var brickLayer = null;
            for (var i = 0; i < map['layers'].length; i++) {
                if (map['layers'][i].name === "bricks") {
                    brickLayer = map['layers'][i];
                    break;
                }
            }
            if (brickLayer == null) {
                throw new Error("No bricks layer found!");
            }

            var topWall = this.walls[1];
            var topWallY = -topWall.normal.y * topWall.distance;

            var brickCountX = brickLayer.width;
            var brickCountY = brickLayer.height;
            var brickPaddingWidth = 6;
            var brickPaddingHeight = 6;
            var topWallPadding = 20;

            this.bricks.clear();

            var tempBrick = new Brick();

            var brickTotalWidth = (brickCountX * tempBrick.ext.x * 2) + (brickPaddingWidth * (brickCountX - 1));
            var brickTotalHeight = (brickCountY * tempBrick.ext.y * 2) + (brickPaddingHeight * (brickCountY - 1));
            var brickCenterX = 0;
            var brickCenterY = topWallY + brickTotalHeight * 0.5 + topWallPadding;

            for (var y = 0; y < brickCountY; y++) {
                for (var x = 0; x < brickCountX; x++) {
                    var tile = brickLayer.data[y * brickCountX + x];
                    if (tile > 0) {
                        var brick = new Brick();
                        brick.tile = tile;
                        math.vec2Set(brick.pos, brickCenterX + (x * brick.ext.x * 2 + brick.ext.x - brickTotalWidth * 0.5) + x * brickPaddingWidth, brickCenterY + (y * brick.ext.y * 2 + brick.ext.y - brickTotalHeight * 0.5) + y * brickPaddingHeight);
                        this.bricks.add(brick);
                    }
                }
            }

            this.activeBricks = this.bricks.size();
        };

        CrackoutGame.prototype.resetLevel = function () {
            var brickCount = this.bricks.size();
            for (var i = 0; i < brickCount; i++) {
                var brick = this.bricks.item(i);
                brick.alive = true;
            }
        };

        CrackoutGame.prototype.restartLevel = function () {
            var ballCount = this.balls.size();
            for (var i = 0; i < ballCount; i++) {
                var ball = this.balls.item(i);
                this.balls.release(ball);
            }

            var initialBall = this.balls.get();

            this.lifes = 3;
            this.score = 0;

            math.vec2Set(this.paddle.pos, 0, this.window.getHeight() * 0.4);
            math.vec2Zero(this.paddle.vel);
            this.paddle.glue = initialBall;

            this.paddle.ext.x = this.paddle.size;

            this.resetLevel();
        };

        CrackoutGame.prototype.spawnBall = function (dt) {
            if (this.balls.size() < this.maxBalls) {
                var nextInactiveBall = this.balls.get();
                math.vec2UnitRotate(nextInactiveBall.dir, math.deg2rad(math.randomRange(45, 135)));
                nextInactiveBall.addAcceleration(400 / dt);
            }
        };

        CrackoutGame.prototype.ballOut = function (dt, ball) {
            // Kill ball
            ball.alive = false;
            this.balls.release(ball);

            if (this.balls.size() == 0) {
                // Remove all active items
                for (var i = 0; i < this.items.size(); i++) {
                    var item = this.items.item(i);
                    if (item.alive) {
                        item.alive = false;
                        this.items.release(item);
                        i--;
                    }
                }

                // Last ball
                if (--this.lifes > 0) {
                    this.paddle.glue = this.balls.get();
                } else {
                    // All lifes lost - restart level
                    this.restartLevel();
                }
            }
        };

        CrackoutGame.prototype.spawnItem = function (dt, brick) {
            var type = Math.floor(Math.random() * ItemType.getCount());
            if (type > 0) {
                var item = this.items.get();
                item.type = type;
                math.vec2Clone(item.pos, brick.pos);
                item.addAcceleration(100 / dt, 0, 1);
            }
        };

        CrackoutGame.prototype.accelerateBall = function (percentage) {
            var oneBall = null;
            for (var i = 0; i < this.balls.size(); i++) {
                var ball = this.balls.item(i);
                if (ball.alive) {
                    oneBall = ball;
                    break;
                }
            }
            oneBall.accelerate(percentage);
        };

        CrackoutGame.prototype.collectItem = function (dt, item) {
            item.alive = false;
            this.items.release(item);

            switch (item.type) {
                case ItemType.PaddleExpand:
                    this.paddle.growOrShrink(0.1);
                    break;
                case ItemType.PaddleShrink:
                    this.paddle.growOrShrink(-0.15);
                    break;
                case ItemType.PaddleAutoGlue:
                    this.paddle.autoGlue = true;
                    break;
                case ItemType.IncScore:
                    this.score += 50;
                    break;
                case ItemType.AddLife:
                    this.lifes += 1;
                    break;
                case ItemType.BallSpawn:
                    this.spawnBall(dt);
                    break;
                case ItemType.BallAccelerate:
                    this.accelerateBall(0.1);
                    break;
                case ItemType.BallDecelerate:
                    this.accelerateBall(-0.1);
                    break;
            }
        };

        CrackoutGame.prototype.killBrick = function (dt, brick) {
            brick.alive = false;

            // Spawn item
            this.spawnItem(dt, brick);

            if (--this.activeBricks == 0) {
                // All bricks killed
            }
        };

        CrackoutGame.prototype.handleCirclePlaneCollision = function (dt, circle, plane) {
            var closest = Vec2Pool.get();
            ClosestPoints.closestPointOnPlaneOrHalfSpace(closest, circle.pos, plane.normal, plane.distance);

            var distanceToClosest = Vec2Pool.get();
            math.vec2Sub(distanceToClosest, closest, circle.pos);
            var distance = -math.vec2Dot(distanceToClosest, plane.normal) - circle.radius;

            var projVel = -math.vec2Dot(circle.vel, plane.normal) * dt;

            if (projVel > 0 && projVel > distance) {
                var t = distance / projVel;
                circle.pos.x += circle.vel.x * dt * t;
                circle.pos.y += circle.vel.y * dt * t;
                Response.reflectVector(circle.vel, circle.vel, plane.normal, 1, 0);
                return true;
            } else if (distance < 0) {
                circle.pos.x -= plane.normal.x * distance;
                circle.pos.y -= plane.normal.y * distance;
                Response.reflectVector(circle.vel, circle.vel, plane.normal, 1, 0);
                return true;
            }

            return false;
        };

        CrackoutGame.prototype.handleAABBPlaneCollision = function (dt, aabb, plane, restitution) {
            var closest = Vec2Pool.get();
            ClosestPoints.closestPointOnPlaneOrHalfSpace(closest, aabb.pos, plane.normal, plane.distance);

            var distanceToClosest = Vec2Pool.get();
            math.vec2Sub(distanceToClosest, closest, aabb.pos);
            var distance = -math.vec2Dot(distanceToClosest, plane.normal) - Math.abs(math.vec2Dot(aabb.ext, plane.normal));

            var projVel = -math.vec2Dot(aabb.vel, plane.normal) * dt;

            if (projVel > 0 && projVel > distance) {
                var t = distance / projVel;
                aabb.pos.x += aabb.vel.x * dt * t;
                aabb.pos.y += aabb.vel.y * dt * t;
                Response.reflectVector(aabb.vel, aabb.vel, plane.normal, restitution, 0);
                return true;
            } else if (distance < 0) {
                aabb.pos.x -= plane.normal.x * distance;
                aabb.pos.y -= plane.normal.y * distance;
                Response.reflectVector(aabb.vel, aabb.vel, plane.normal, restitution, 0);
                return true;
            }

            return false;
        };

        CrackoutGame.prototype.handleCircleAABBCollision = function (dt, circle, aabb) {
            // Get closest point on aabb
            var closest = Vec2Pool.get();
            ClosestPoints.closestPointOnAABB(closest, circle.pos, aabb.pos, aabb.ext);

            // Get distance between closest and ball center
            var circleCenterToClosest = Vec2Pool.get();
            math.vec2Sub(circleCenterToClosest, closest, circle.pos);

            // Build axis list for testing against it
            this.satAxisCount = 2;
            math.vec2Set(this.satAxis[0], 1, 0);
            math.vec2Set(this.satAxis[1], 0, 1);
            if (math.vec2LengthSquared(circleCenterToClosest) > 0) {
                math.vec2Normalize(this.satAxis[2], circleCenterToClosest);
                this.satAxisCount++;
            }

            // Relative velocity
            var relVel = Vec2Pool.get();
            if (!aabb.static) {
                math.vec2Sub(relVel, circle.vel, aabb.vel);
            } else {
                math.vec2Clone(relVel, circle.vel);
            }

            // Relative position
            var relPos = Vec2Pool.get();
            math.vec2Sub(relPos, circle.pos, aabb.pos);

            // Get smallest (greatest negative) distance and collision normal (SAT)
            var index = -1;
            var collisionDistance = null;
            var collisionNormal = Vec2Pool.get();

            for (var i = 0; i < this.satAxisCount; i++) {
                var n = this.satAxis[i];

                var d = math.vec2Dot(relPos, n);

                var projCircle = Vec2Pool.get();
                projCircle.x = -circle.radius + d;
                projCircle.y = +circle.radius + d;

                var projAABB = Vec2Pool.get();
                var p = Math.abs(math.vec2Dot(this.satAxis[0], n)) * aabb.ext.x + Math.abs(math.vec2Dot(this.satAxis[1], n)) * aabb.ext.y;
                projAABB.x = -p;
                projAABB.y = +p;

                var d0 = projAABB.x - projCircle.y;
                var d1 = projCircle.x - projAABB.y;
                var overlap = d0 > d1 ? d0 : d1;

                if (index == -1 || overlap > collisionDistance) {
                    index = i;
                    collisionDistance = overlap;
                    math.vec2Clone(collisionNormal, n);
                }
            }

            if (index > -1) {
                // Make sure the collision normal is always pushing away
                if (math.vec2Dot(collisionNormal, relPos) < 0) {
                    math.vec2MultScalar(collisionNormal, collisionNormal, -1);
                }

                if (collisionDistance < 0) {
                    // Penetration (Ball is already inside aabb)
                    circle.pos.x += -collisionNormal.x * collisionDistance;
                    circle.pos.y += -collisionNormal.y * collisionDistance;
                    Response.reflectVector(circle.vel, circle.vel, collisionNormal, 1, 0);
                    return true;
                }
            }
            return false;
        };

        CrackoutGame.prototype.handleWallCollisions = function (dt) {
            var c = this.wallCount;
            for (var i = 0; i < c; i++) {
                var wall = this.walls[i];

                // Test wall with paddle
                this.handleAABBPlaneCollision(dt, this.paddle, wall, 0);

                var j;

                // Test wall with balls
                var ballCount = this.balls.size();
                for (j = 0; j < ballCount; j++) {
                    var ball = this.balls.item(j);
                    if (ball.alive && this.paddle.glue != ball) {
                        if (this.handleCirclePlaneCollision(dt, ball, wall)) {
                            if (wall.out) {
                                this.ballOut(dt, ball);
                                break;
                            }
                        }
                    }
                }

                // Test wall with items
                for (j = 0; j < this.items.size(); j++) {
                    var item = this.items.item(j);
                    if (item.alive && wall.out) {
                        if (collision.Intersections.isAABBInHalfSpace(item.pos, item.ext, wall.normal, wall.distance)) {
                            item.alive = false;
                            this.items.release(item);
                            j--;
                        }
                    }
                }
            }
        };


        CrackoutGame.prototype.handleBallCollisions = function (dt) {
            var ballCount = this.balls.size();
            for (var j = 0; j < ballCount; j++) {
                var ball = this.balls.item(j);
                if (ball.alive && this.paddle.glue != ball) {
                    // Paddle
                    if (this.handleCircleAABBCollision(dt, ball, this.paddle)) {
                        // When ball hits paddle and auto glue is active - glue the ball on the paddle
                        if (this.paddle.glue == null && this.paddle.autoGlue) {
                            math.vec2Zero(ball.vel);
                            this.paddle.glue = ball;
                            this.paddle.autoGlue = false;
                        }
                    }

                    // Bricks
                    for (var i = 0; i < this.bricks.size(); i++) {
                        var brick = this.bricks.item(i);
                        if (brick.alive) {
                            if (this.handleCircleAABBCollision(dt, ball, brick)) {
                                this.killBrick(dt, brick);
                            }
                        }
                    }
                }
            }
        };

        CrackoutGame.prototype.handlePaddleCollisions = function (dt) {
            // Test paddle with items
            for (var i = 0; i < this.items.size(); i++) {
                var item = this.items.item(i);
                if (item.alive) {
                    if (collision.Intersections.isAABBInAABB(item.pos, item.ext, this.paddle.pos, this.paddle.ext)) {
                        i--;
                        this.collectItem(dt, item);
                    }
                }
            }
        };

        CrackoutGame.prototype.handleCollision = function (dt) {
            this.handleWallCollisions(dt);
            this.handleBallCollisions(dt);
            this.handlePaddleCollisions(dt);
        };

        CrackoutGame.prototype.gameUpdate = function (dt, w, h) {
            // Update paddle
            this.paddle.update(dt);

            var i;

            // Update ball
            for (i = 0; i < this.balls.size(); i++) {
                var ball = this.balls.item(i);
                if (ball.alive) {
                    if (this.paddle.glue != ball) {
                        ball.update(dt);
                    }
                }
            }

            // Update items
            for (i = 0; i < this.items.size(); i++) {
                var item = this.items.item(i);
                if (item.alive) {
                    item.update(dt);
                }
            }

            // Handle collisions
            this.handleCollision(dt);

            // Has paddle a glued ball - if yes, reposition the glued ball on top of the paddle
            if (this.paddle.glue != null) {
                var glueBall = this.paddle.glue;
                math.vec2Set(glueBall.pos, this.paddle.pos.x - this.paddle.ext.x - glueBall.radius - 5, this.paddle.pos.y);
            }
        };

        CrackoutGame.prototype.update = function (dt, w, h) {
            // Single step
            if (this.singleStepping && this.keyboard.isKeyDown(Keys.Enter)) {
                this.keyboard.setKeyDown(Keys.Enter, false);
                this.step = true;
            }

            // Move paddle
            if (this.keyboard.isKeyDown(Keys.Left)) {
                this.paddle.addAcceleration(100 / dt, -1, 0);
            } else if (this.keyboard.isKeyDown(Keys.Right)) {
                this.paddle.addAcceleration(100 / dt, 1, 0);
            }

            // Shoot glued ball from paddle
            if (this.keyboard.isKeyDown(Keys.Space)) {
                this.keyboard.setKeyDown(Keys.Space, false);
                if (this.paddle.glue != null) {
                    var gluedBall = this.paddle.glue;
                    gluedBall.dir.x = -1;
                    gluedBall.dir.y = 0;
                    //math.vec2UnitRotate(gluedBall.dir, math.deg2rad(math.scalarRandomRange(-45, -135)));
                    gluedBall.addAcceleration(100 / dt);
                    this.paddle.glue = null;
                }
            }

            // Game update
            if (this.step && !this.singleStepping) {
                this.step = false;
                this.gameUpdate(dt, w, h);
            } else {
                this.gameUpdate(dt, w, h);
            }
        };

        CrackoutGame.prototype.drawPipes = function (r, w, h) {
            var yFactor = 0.98;
            var xFactor = 0.995;
            var topWall = this.walls[1];
            var bottomWall = this.walls[0];
            var leftWall = this.walls[3];
            var rightWall = this.walls[2];
            var topCenter = Vec2Pool.get();
            var bottomCenter = Vec2Pool.get();
            var left = Vec2Pool.get();
            var right = Vec2Pool.get();
            math.vec2MultScalar(topCenter, topWall.normal, -topWall.distance * yFactor);
            math.vec2MultScalar(bottomCenter, bottomWall.normal, -bottomWall.distance * yFactor);
            math.vec2MultScalar(left, leftWall.normal, -leftWall.distance * xFactor);
            math.vec2MultScalar(right, rightWall.normal, -rightWall.distance * xFactor);

            // Edge dimension
            var edgeWidth = 30;
            var edgeHeight = 30;

            // Current pipe dimension for Y
            var pipeCount = 15;
            var pipeLength = topWall.len * xFactor;
            var pipeWidth = (pipeLength * 2) / pipeCount;
            var pipeCountSide = (pipeCount - 1) / 2;
            var pipeHeight = 30;

            // Draw edges
            dim = this.pipeDimensionMap["edgeTopLeft"];
            r.drawImage(this.pipeImage, topCenter.x - pipeLength - edgeWidth, topCenter.y - edgeHeight, edgeWidth, edgeHeight, dim.x, dim.y, dim.w, dim.h);
            dim = this.pipeDimensionMap["edgeTopRight"];
            r.drawImage(this.pipeImage, topCenter.x + pipeLength, topCenter.y - edgeHeight, edgeWidth, edgeHeight, dim.x, dim.y, dim.w, dim.h);
            dim = this.pipeDimensionMap["edgeBottomLeft"];
            r.drawImage(this.pipeImage, bottomCenter.x - pipeLength - edgeWidth, bottomCenter.y, edgeWidth, edgeHeight, dim.x, dim.y, dim.w, dim.h);
            dim = this.pipeDimensionMap["edgeBottomRight"];
            r.drawImage(this.pipeImage, bottomCenter.x + pipeLength, bottomCenter.y, edgeWidth, edgeHeight, dim.x, dim.y, dim.w, dim.h);

            // Draw top pipes
            var dim = this.pipeDimensionMap["topCenter"];
            r.drawImage(this.pipeImage, topCenter.x - pipeWidth * 0.5, topCenter.y - pipeHeight, pipeWidth, pipeHeight, dim.x, dim.y, dim.w, dim.h);
            for (var i = 0; i < pipeCountSide; i++) {
                dim = this.pipeDimensionMap[i % 2 == 0 ? "topLeft" : "topCenter"];
                r.drawImage(this.pipeImage, topCenter.x - pipeLength + i * pipeWidth, topCenter.y - pipeHeight, pipeWidth, pipeHeight, dim.x, dim.y, dim.w, dim.h);
                r.drawImage(this.pipeImage, topCenter.x + pipeLength - (i + 1) * pipeWidth, topCenter.y - pipeHeight, pipeWidth, pipeHeight, dim.x, dim.y, dim.w, dim.h);
            }

            // Draw bottom pipes
            r.opacity(0.1);
            dim = this.pipeDimensionMap["bottomCenter"];
            r.drawImage(this.pipeImage, bottomCenter.x - pipeWidth * 0.5, bottomCenter.y, pipeWidth, pipeHeight, dim.x, dim.y, dim.w, dim.h);
            for (var i = 0; i < pipeCountSide; i++) {
                dim = this.pipeDimensionMap[i % 2 == 0 ? "bottomLeft" : "bottomCenter"];
                r.drawImage(this.pipeImage, bottomCenter.x - pipeLength + i * pipeWidth, bottomCenter.y, pipeWidth, pipeHeight, dim.x, dim.y, dim.w, dim.h);
                r.drawImage(this.pipeImage, bottomCenter.x + pipeLength - (i + 1) * pipeWidth, bottomCenter.y, pipeWidth, pipeHeight, dim.x, dim.y, dim.w, dim.h);
            }
            r.resetOpacity();

            // Current pipe dimension for X
            pipeCount = 11;
            pipeLength = leftWall.len * yFactor;
            pipeHeight = (pipeLength * 2) / pipeCount;
            pipeCountSide = (pipeCount - 1) / 2;
            pipeWidth = 30;

            // Draw left pipes
            dim = this.pipeDimensionMap["leftMiddle"];
            r.drawImage(this.pipeImage, left.x - pipeWidth, left.y - pipeHeight * 0.5, pipeWidth, pipeHeight, dim.x, dim.y, dim.w, dim.h);
            for (var i = 0; i < pipeCountSide; i++) {
                dim = this.pipeDimensionMap[i % 2 == 0 ? "leftTop" : "leftMiddle"];
                r.drawImage(this.pipeImage, left.x - pipeWidth, left.y - pipeLength + i * pipeHeight, pipeWidth, pipeHeight, dim.x, dim.y, dim.w, dim.h);
                r.drawImage(this.pipeImage, left.x - pipeWidth, left.y + pipeLength - (i + 1) * pipeHeight, pipeWidth, pipeHeight, dim.x, dim.y, dim.w, dim.h);
            }

            // Draw right pipes
            dim = this.pipeDimensionMap["rightMiddle"];
            r.drawImage(this.pipeImage, right.x, right.y - pipeHeight * 0.5, pipeWidth, pipeHeight, dim.x, dim.y, dim.w, dim.h);
            for (var i = 0; i < pipeCountSide; i++) {
                dim = this.pipeDimensionMap[i % 2 == 0 ? "rightTop" : "rightMiddle"];
                r.drawImage(this.pipeImage, right.x, right.y - pipeLength + i * pipeHeight, pipeWidth, pipeHeight, dim.x, dim.y, dim.w, dim.h);
                r.drawImage(this.pipeImage, right.x, right.y + pipeLength - (i + 1) * pipeHeight, pipeWidth, pipeHeight, dim.x, dim.y, dim.w, dim.h);
            }
        };

        CrackoutGame.prototype.draw = function (r, dt, w, h) {
            r.clear();
            r.fillRect(0, 0, w, h, "black");

            r.push();
            r.translate(w * 0.5, h * 0.5);

            var i;

            // Draw walls/pipes
            this.drawPipes(r, w, h);

            /*
             // Draw walls
             for (i = 0; i < this.walls.length; i++) {
             this.walls[i].draw(r);
             }
             */

            // Draw paddle
            this.paddle.draw(r);

            // Draw items
            var itemCount = this.items.size();
            for (i = 0; i < itemCount; i++) {
                var item = this.items.item(i);
                item.draw(r);
            }

            // Draw bricks
            for (i = 0; i < this.bricks.size(); i++) {
                var brick = this.bricks.item(i);
                if (brick.alive) {
                    brick.draw(r, this.bricksTileset);
                }
            }

            // Draw balls
            var fastestBall = null;
            for (i = 0; i < this.balls.size(); i++) {
                var ball = this.balls.item(i);
                if (ball.alive) {
                    ball.draw(r, this.ballTileset);
                    if (fastestBall == null || ball.speed > fastestBall.speed) {
                        fastestBall = ball;
                    }
                }
            }

            r.pop();

            // OSD
            r.setFont("arial", 20, "normal");
            r.fillText(10, 10, "Lifes: " + this.lifes, "white", "left", "top");
            r.fillText(10, 30, "Score: " + this.score, "white", "left", "top");
            r.fillText(10, 50, "Active balls: " + this.balls.size(), "white", "left", "top");
            if (fastestBall != null) {
                r.fillText(10, 70, "Fastest ball speed: " + fastestBall.speed, "white", "left", "top");
            }
            r.resetFont();
        };

        return CrackoutGame;
    }
);