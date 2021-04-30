(function (root, factory) {
    root.fs = root.fs || {};
    root.fs.cout = factory(root.Box2D);
}(this, function (Box2D) {
    "use strict";

    var b2Vec2 = Box2D.Common.Math.b2Vec2
        , b2BodyDef = Box2D.Dynamics.b2BodyDef
        , b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef
        , b2Body = Box2D.Dynamics.b2Body
        , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
        , b2Fixture = Box2D.Dynamics.b2Fixture
        , b2World = Box2D.Dynamics.b2World
        , b2MassData = Box2D.Collision.Shapes.b2MassData
        , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
        , b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
        , b2DebugDraw = Box2D.Dynamics.b2DebugDraw
        , b2Shape = Box2D.Collision.Shapes.b2Shape
        , b2Math = Box2D.Common.Math.b2Math
        , b2Settings = Box2D.Common.b2Settings
        , b2Mat22 = Box2D.Common.Math.b2Mat22
        , b2Transform = Box2D.Common.Math.b2Transform
        ;

    var rad2deg = 180 / Math.PI;
    var deg2rad = Math.PI / 180;

    var keystate = [];
    var keys = {
        Space: 32,
        Left: 37,
        Right: 39
    };

    function isKeyDown(key) {
        return typeof keystate[key] != "undefined" && keystate[key] === true;
    }

    function setKeyDown(key, value) {
        keystate[key] = value;
    }

    function Crashout(_ctx, w, h, _drawScale, gameW, gameH) {
        var ctx = _ctx;

        // Allow more penetration
        b2Settings.b2_velocityThreshold = 0.1;

        var world = new b2World(new b2Vec2(0, 0), true);
        world.SetContinuousPhysics(true);

        var drawScale = _drawScale;
        var velIterations = 10;
        var posIterations = 10;

        var halfWidth = gameW * 0.5;
        var halfHeight = gameH * 0.5;
        var wallDepth = 0.25;
        var top = -halfHeight;
        var bottom = halfHeight;
        var left = -halfWidth;
        var right = halfWidth;
        var sideHalfExtend = wallDepth;
        var visibleSideHalfHeight = halfHeight - wallDepth + 1;
        var endBottom = top + visibleSideHalfHeight * 2 + wallDepth * 4;

        var brickPadding = 0.4;
        var brickCols = 9;
        var brickRows = 8;
        var brickWidth = halfWidth * 2 / (brickCols + 2);
        var brickDimensionX = brickWidth * brickCols;
        var brickHeight = 0.45;
        var brickCount = brickRows * brickCols;
        var brickActive = 0;
        var totalBrickActive = 0;

        var gameStarted = false;
        var gameNextLevel = false;
        var level = [];
        var numLevel = 0;
        var lives = 10;
        var score = 0;
        var scoreBrickHit = 5;
        var brickMinScore = 10;
        var brickMaxScore = 100;
        var brickMaxDuration = 5000; // Removed in a timeframe of a few seconds will get 100% score

        var ballRadius = 0.3;
        var paddleWidth = 2;
        var paddleHeight = 0.4;
        var paddleLineY = bottom - paddleHeight;

        var tmpVertices = new Vector_a2j_Number(64);

        var osdFont = "normal 30px arial";
        var osdFontBig = "normal 60px arial";
        var osdFontMedium = "normal 20px arial";
        var osdFontSmall = "normal 10px arial";

        var paddle = null;
        var paddleJoint = null;
        var ball = null;
        var theEnd = null;
        var bricks = new Array(brickCount);

        function Brick() {
            this.body = null;
            this.lastXF = new b2Transform();
            this.isHit = false;
            this.hitTime = 0;
            this.dead = false;
        }

        Brick.prototype.update = function (dt) {
            if (this.isHit) {
                var g = new b2Vec2(0, 10);
                g.Multiply(this.body.GetMass());
                this.body.ApplyForce(g, this.body.GetWorldCenter());
            }
        };

        Brick.prototype.hit = function () {
            var body = this.body;
            if (!this.isHit) {
                body.SetType(b2Body.b2_dynamicBody);
                this.hitTime = new Date().getTime();
                this.isHit = true;
            }
        };

        function Ball(radius) {
            this.body = null;
            this.lastXF = new b2Transform();
            this.radius = radius;
            this.speed = 8;
            this.isOut = false;
            this.isGlued = true;
            this.startDirection = -90;
            this.spreadAngle = 30;
            this.angleTolerance = 2.5;
            this.angleCorrection = 15;
        }

        var squaredAngles = [0, 90, 180, 270, 360];

        Ball.prototype.update = function (dt) {
            var body = this.body;

            // Do nothing when ball is glued
            if (this.isGlued) {
                return;
            }

            // Move ball to start when it was out
            if (this.isOut) {
                this.isOut = false;
                this.reset();
                return;
            }

            // Get direction from velocity
            var vel = body.GetLinearVelocity();
            var dir = new b2Vec2(vel.x, vel.y);
            dir.Normalize();

            // Get angle from direction and correct it when too squared
            var a = Math.atan2(dir.y, dir.x);
            var deg = rad2deg * a;
            for (var i = 0; i < squaredAngles.length; i++) {
                if (Math.abs(deg) > squaredAngles[i] - this.angleTolerance && Math.abs(deg) < squaredAngles[i] + this.angleTolerance) {
                    // Angle is too square - correct it once
                    deg += (Math.abs(deg) - squaredAngles[i] > 0 ? 1 : -1) * this.angleCorrection;
                    a = deg2rad * deg;
                    break;
                }
            }
            dir.x = Math.cos(a);
            dir.y = Math.sin(a);

            // Set fixed velocity for the new direction with the actual speed
            dir.Multiply(this.speed);
            body.SetLinearVelocity(dir);
        };

        Ball.prototype.reset = function () {
            this.body.SetPositionAndAngle(new b2Vec2(0, paddleLineY - paddleHeight * 0.5 - ballRadius * 2), 0);
            this.body.SetLinearVelocity(new b2Vec2(0, 0));
            this.body.SetAngularVelocity(0);
            this.isGlued = true;
        };

        Ball.prototype.start = function () {
            this.isGlued = false;
            var body = this.body;
            var newDeg = this.startDirection + (Math.random() > 0.5 ? 1 : -1) * Math.random() * this.spreadAngle;
            var newAng = deg2rad * newDeg;
            var newDir = new b2Vec2(Math.cos(newAng), Math.sin(newAng));
            body.ApplyImpulse(new b2Vec2(newDir.x * this.speed, newDir.y * this.speed), body.GetWorldCenter());
        };

        Ball.prototype.setToPaddle = function (paddle) {
            var pos = paddle.body.GetPosition();
            this.body.SetPositionAndAngle(new b2Vec2(pos.x, paddleLineY - paddleHeight * 0.5 - ballRadius * 2), 0);
        };

        function Paddle() {
            this.body = null;
            this.lastXF = new b2Transform();
            this.speed = 50;
        }

        Paddle.prototype.move = function (amount) {
            var impulse = new b2Vec2(amount * this.speed, 0);
            this.body.ApplyImpulse(impulse, this.body.GetWorldCenter());
        };

        Paddle.prototype.reset = function () {
            this.body.SetPositionAndAngle(new b2Vec2(0, 0), this.body.GetAngle());
        };

        function TheEnd() {
            this.body = null;
        }

        function setRandomLevel() {
            var lvl = level;
            var halfWidth = (brickCols - 1) / 2;
            var x, y;
            for (y = brickRows - 1; y > 0; y--) {
                var randomHalfWidth = Math.random() * halfWidth;
                for (x = 0; x < brickCols; x++) {
                    lvl[y * brickCols + x] = 0;
                }
                var xstart = Math.random() > 0.5 ? Math.min(halfWidth, Math.round(halfWidth - randomHalfWidth)) : 0;
                for (x = xstart; x < randomHalfWidth; x++) {
                    lvl[y * brickCols + x] = 1;
                    lvl[(y + 1) * brickCols + (-x - 1)] = lvl[y * brickCols + x];
                }
                if (Math.random() > 0.5) {
                    lvl[y * brickCols + halfWidth] = 1;
                }
            }
        }

        function initGame(doRestart) {
            var bodyDef = new b2BodyDef();
            var fixDef = new b2FixtureDef();
            var body;

            brickActive = 0;
            totalBrickActive = 0;

            if (typeof doRestart == "undefined" || doRestart == true) {
                // Game over or game starts the first time
                numLevel = 0;
                lives = 10;
                score = 0;
                gameStarted = false;
                gameNextLevel = false;
            } else {
                gameNextLevel = true;
            }

            // Create new level
            numLevel++;
            setRandomLevel();

            // Create default fixture
            fixDef.density = 1;
            fixDef.friction = 0;
            fixDef.restitution = 0;

            // Create borders
            bodyDef.type = b2Body.b2_staticBody;
            bodyDef.position.x = 0;
            bodyDef.position.y = top + wallDepth;
            fixDef.shape = new b2PolygonShape;
            fixDef.shape.SetAsBox(halfWidth, wallDepth);
            world.CreateBody(bodyDef).CreateFixture(fixDef);

            bodyDef.position.x = left + wallDepth;
            bodyDef.position.y = top + visibleSideHalfHeight + wallDepth * 2;
            fixDef.shape = new b2PolygonShape;
            fixDef.shape.SetAsBox(wallDepth, visibleSideHalfHeight);
            world.CreateBody(bodyDef).CreateFixture(fixDef);

            bodyDef.position.x = right - wallDepth;
            bodyDef.position.y = top + visibleSideHalfHeight + wallDepth * 2;
            fixDef.shape = new b2PolygonShape;
            fixDef.shape.SetAsBox(wallDepth, visibleSideHalfHeight);
            world.CreateBody(bodyDef).CreateFixture(fixDef);

            bodyDef.position.x = 0;
            bodyDef.position.y = endBottom - wallDepth;
            fixDef.shape = new b2PolygonShape;
            fixDef.shape.SetAsBox(halfWidth, wallDepth);
            body = world.CreateBody(bodyDef);
            body.CreateFixture(fixDef);
            theEnd = new TheEnd();
            theEnd.body = body;
            body.SetUserData(theEnd);

            // Create bricks
            fixDef.density = 1;
            fixDef.friction = 0.1;
            fixDef.restitution = 0.5;
            fixDef.filter.maskBits = 0xFFFF;
            bodyDef.type = b2Body.b2_staticBody;
            for (var y = 0; y < brickRows; y++) {
                for (var x = 0; x < brickCols; x++) {
                    var d = level[y * brickCols + x];
                    if (d > 0) {
                        fixDef.shape = new b2PolygonShape;
                        fixDef.shape.SetAsBox(brickWidth * 0.4, brickHeight * 0.5);
                        bodyDef.position.x = 0 + brickWidth * 0.5 - brickDimensionX * 0.5 + x * brickWidth;
                        bodyDef.position.y = top + brickHeight * 1.5 + brickHeight + y * (brickHeight + brickPadding);
                        body = world.CreateBody(bodyDef);
                        body.CreateFixture(fixDef);
                        var brick = bricks[y * brickCols + x] = new Brick();
                        brick.body = body;
                        brick.lastXF.Set(body.GetTransform());
                        body.SetUserData(brick);
                        brickActive++;
                        totalBrickActive++;
                    } else {
                        bricks[y * brickCols + x] = null;
                    }
                }
            }

            // Create paddle limiter
            fixDef.density = 1;
            fixDef.friction = 1;
            fixDef.restitution = 0;
            fixDef.filter.maskBits = 0x0000; // No not collide
            bodyDef.type = b2Body.b2_staticBody;
            bodyDef.position.x = 0;
            bodyDef.position.y = paddleLineY;
            fixDef.shape = new b2PolygonShape;
            fixDef.shape.SetAsBox(0.1, 0.1);
            var paddleLimiterBody = world.CreateBody(bodyDef);
            paddleLimiterBody.CreateFixture(fixDef);
            paddleLimiterBody.SetUserData("PaddleLimiter");

            // Create paddle
            fixDef.density = 20;
            fixDef.friction = 0;
            fixDef.restitution = 0;
            fixDef.filter.maskBits = 0xFFFF;
            bodyDef.type = b2Body.b2_dynamicBody;
            bodyDef.position.x = 0;
            bodyDef.position.y = paddleLineY;
            fixDef.shape = new b2PolygonShape;

            var paddleHalfWidth = paddleWidth * 0.5;
            var paddleHalfHeight = paddleHeight * 0.5;
            fixDef.shape.SetAsBox(paddleHalfWidth, paddleHalfHeight);
            var paddleVerts = [
                new b2Vec2(paddleHalfWidth, paddleHalfHeight),
                new b2Vec2(-paddleHalfWidth, paddleHalfHeight),
                new b2Vec2(-paddleHalfWidth + paddleHalfWidth * 0.4, -paddleHalfHeight),
                new b2Vec2(paddleHalfWidth - paddleHalfWidth * 0.4, -paddleHalfHeight)
            ];
            fixDef.shape.SetAsVector(paddleVerts, paddleVerts.length);

            body = world.CreateBody(bodyDef);
            body.CreateFixture(fixDef);
            body.SetLinearDamping(10);
            paddle = new Paddle();
            paddle.body = body;
            paddle.lastXF.Set(body.GetTransform());
            body.SetUserData(paddle);

            // Create paddle to limiter join (restrict to x-axis)
            var jointDef = new b2PrismaticJointDef;
            var worldAxis = new b2Vec2(1, 0);
            jointDef.collideConnected = true;
            jointDef.Initialize(body, paddleLimiterBody, body.GetWorldCenter(), worldAxis);
            paddleJoint = world.CreateJoint(jointDef);

            // Create ball
            fixDef.filter.maskBits = 0xFFFF;
            fixDef.density = 1;
            fixDef.friction = 0;
            fixDef.restitution = 1;
            bodyDef.type = b2Body.b2_dynamicBody;
            bodyDef.position.x = 0;
            bodyDef.position.y = paddleLineY - paddleHeight * 0.5 - ballRadius * 2;
            fixDef.shape = new b2CircleShape;
            fixDef.shape.SetRadius(ballRadius);
            body = world.CreateBody(bodyDef);
            body.CreateFixture(fixDef);
            body.SetLinearDamping(0);
            ball = new Ball(ballRadius);
            ball.body = body;
            ball.lastXF.Set(body.GetTransform());
            body.SetUserData(ball);

            // Reset ball and start it
            ball.reset();
        }


        function resetGame(doRestart) {
            var bodies = [];
            for (var b = world.m_bodyList; b; b = b.m_next) {
                bodies.push(b);
            }
            world.DestroyJoint(paddleJoint);
            paddleJoint = null;
            for (var i = 0; i < bodies.length; i++) {
                world.DestroyBody(bodies[i]);
            }
            paddle = null;
            bricks = new Array(brickCount);
            ball = null;
            theEnd = null;

            initGame(doRestart);
        }

        function handleBallCollision(ball, other, contact) {
            if (other instanceof Brick) {
                other.hit();
                score += scoreBrickHit;
            }
        }

        function handleEndCollision(other) {
            if (other instanceof Ball && !other.isOut) {
                other.isOut = true;
                lives--;
            } else if (other instanceof Brick && !other.dead) {
                other.dead = true;
                var duration = new Date().getTime() - other.hitTime;
                var scoreRange = brickMaxScore - brickMinScore;
                var scoreToIncrease = brickMinScore + Math.round(Math.min(scoreRange / brickMaxDuration * duration, scoreRange));
                score += Math.round(scoreToIncrease / 5) * 5;
            }
        }

        function getPreferedType(typeA, typeB, check) {
            var t = null;
            if (typeA instanceof check) {
                t = typeA;
            }
            if (typeB instanceof check) {
                t = typeB;
            }
            return t
        }

        function getOtherType(typeA, typeB, check) {
            var t = null;
            if (!(typeA instanceof check)) {
                t = typeA;
            }
            if (!(typeB instanceof check)) {
                t = typeB;
            }
            return t;
        }

        world.SetContactListener({
            BeginContact: function (contact) {
                var bodyUserDataA = contact.GetFixtureA().GetBody().GetUserData();
                var bodyUserDataB = contact.GetFixtureB().GetBody().GetUserData();
                if (bodyUserDataA != null && bodyUserDataB != null) {
                    var ball = getPreferedType(bodyUserDataA, bodyUserDataB, Ball);
                    var other = getOtherType(bodyUserDataA, bodyUserDataB, Ball);
                    if (ball != null && other != null) {
                        handleBallCollision(ball, other, contact);
                    }
                }
            },
            EndContact: function (contact) {
            },
            PreSolve: function (contact, oldManifold) {
                var bodyUserDataA = contact.GetFixtureA().GetBody().GetUserData();
                var bodyUserDataB = contact.GetFixtureB().GetBody().GetUserData();
                if (bodyUserDataA != null && bodyUserDataB != null) {
                    var end = getPreferedType(bodyUserDataA, bodyUserDataB, TheEnd);
                    var other;
                    if (end != null) {
                        other = getOtherType(bodyUserDataA, bodyUserDataB, TheEnd);
                        contact.SetEnabled(false);
                        handleEndCollision(other);
                    }
                }
            },
            PostSolve: function (contact, impulse) {

            }
        });

        function handleInput(dt) {
            if (isKeyDown(keys.Left)) {
                paddle.move(-1);
            } else if (isKeyDown(keys.Right)) {
                paddle.move(1);
            }
            if (isKeyDown(keys.Space) && ball.isGlued) {
                setKeyDown(keys.Space, false);
                if (!gameStarted) {
                    gameStarted = true;
                }
                if (gameNextLevel) {
                    gameNextLevel = false;
                }
                ball.start();
            }
        }

        function update(dt) {
            // Game lost
            if (lives <= 0) {
                resetGame(true);
            }

            // Handle input
            handleInput(dt);

            // Update ball
            ball.update(dt);
            if (ball.isGlued) {
                ball.setToPaddle(paddle);
            }

            var i;

            // Update bricks
            for (i = 0; i < brickCount; i++) {
                if (bricks[i] != null && !bricks[i].dead) {
                    bricks[i].update(dt);
                }
            }

            // World step
            world.Step(dt, velIterations, posIterations);
            world.ClearForces();

            // Kill dead bricks
            for (i = 0; i < brickCount; i++) {
                if (bricks[i] != null) {
                    if (bricks[i].dead && bricks[i].body != null) {
                        world.DestroyBody(bricks[i].body);
                        bricks[i].body = null;
                        brickActive--;
                    }
                }
            }

            // next level when all active bricks are dead
            if (totalBrickActive > 0 && brickActive <= 0) {
                resetGame(false);
            }

            // Update last transformations
            ball.lastXF.Set(ball.body.GetTransform());
            paddle.lastXF.Set(paddle.body.GetTransform());
            for (i = 0; i < brickCount; i++) {
                if (bricks[i] != null && bricks[i].body != null) {
                    bricks[i].lastXF.Set(bricks[i].body.GetTransform());
                }
            }
        }

        function drawPolygon(vertices, vertexCount, color) {
            if (!vertexCount) return;
            ctx.beginPath();
            ctx.moveTo(vertices[0].x * drawScale, vertices[0].y * drawScale);
            for (var i = 1; i < vertexCount; i++) {
                ctx.lineTo(vertices[i].x * drawScale, vertices[i].y * drawScale);
            }
            ctx.lineTo(vertices[0].x * drawScale, vertices[0].y * drawScale);
            ctx.closePath();

            ctx.strokeStyle = "rgb(200,200,200)";
            ctx.fillStyle = color;
            ctx.fill();
            ctx.stroke();
        }

        function drawCircle(center, radius, axis, color) {
            ctx.beginPath();
            ctx.arc(center.x * drawScale, center.y * drawScale, radius * drawScale, 0, Math.PI * 2, false);
            //ctx.moveTo(center.x * drawScale, center.y * drawScale);
            //ctx.lineTo(center.x * drawScale + axis.x * radius * drawScale, center.y * drawScale + axis.y * radius * drawScale);
            ctx.strokeStyle = "rgb(100,100,100)";
            ctx.fillStyle = color;
            ctx.fill();
            ctx.stroke();
        }

        function drawOutlineText(x, y, text, strokeColor, fillColor) {
            ctx.strokeStyle = strokeColor;
            ctx.strokeText(text, x, y);
            ctx.fillStyle = fillColor;
            ctx.fillText(text, x, y);
        }

        function drawShape(shape, xf, color) {
            switch (shape.m_type) {
                case b2Shape.e_circleShape:
                {
                    var circle = ((shape instanceof b2CircleShape ? shape : null));
                    var center = b2Math.MulX(xf, circle.m_p);
                    var radius = circle.m_radius;
                    var axis = xf.R.col1;
                    drawCircle(center, radius, axis, color);
                    break;
                }

                case b2Shape.e_polygonShape:
                {
                    var i = 0;
                    var poly = ((shape instanceof b2PolygonShape ? shape : null));
                    var vertexCount = parseInt(poly.GetVertexCount());
                    var localVertices = poly.GetVertices();
                    for (i = 0;
                         i < vertexCount; ++i) {
                        tmpVertices[i] = b2Math.MulX(xf, localVertices[i]);
                    }
                    drawPolygon(tmpVertices, vertexCount, color);
                    break;
                }
            }
        }

        function drawOSD() {
            ctx.lineWidth = 2;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            if (ball.isGlued) {
                if (!gameStarted) {
                    ctx.font = osdFontBig;
                    ctx.shadowBlur = 20;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                    ctx.shadowColor = "yellow";
                    drawOutlineText(0, -h * 0.45, "crashout", "yellow", "black");
                    ctx.shadowBlur = 0;
                    ctx.font = osdFont;
                    drawOutlineText(0, h * 0.1, "Press the 'Spacebar' to start the ball", "black", "yellow");
                    ctx.font = osdFontMedium;
                    drawOutlineText(0, h * 0.4, "Use 'Arrow Keys' to move the paddle!", "black", "yellow");
                } else {
                    if (gameNextLevel) {
                        ctx.font = osdFontBig;
                        ctx.shadowBlur = 20;
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 0;
                        ctx.shadowColor = "yellow";
                        drawOutlineText(0, -h * 0.1, "well done!", "green", "black");
                        ctx.shadowBlur = 0;
                    }
                    ctx.font = osdFontMedium;
                    drawOutlineText(ball.body.GetPosition().x * drawScale * 0.5, h * 0.6, "Press the 'Spacebar' to start the ball", "black", "yellow");
                }
            }

            // Top
            ctx.lineWidth = 1.5;
            ctx.font = osdFontSmall;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            drawOutlineText((left + wallDepth*0.5) * drawScale, (top + wallDepth) * drawScale, "Lives: " + lives, "black", "yellow");
            ctx.textAlign = "center";
            drawOutlineText(0, (top + wallDepth) * drawScale, "Level: " + numLevel, "black", "yellow");
            ctx.textAlign = "right";
            drawOutlineText((right - wallDepth*0.5) * drawScale, (top + wallDepth) * drawScale, "Score: " + score, "black", "yellow");
            ctx.lineWidth = 1;
        }

        function lerpTransform(currentTransform, lastTransform, alpha) {
            var position = currentTransform.position;
            var lastPosition = lastTransform.position;
            var angle = currentTransform.GetAngle();
            var lastAngle = lastTransform.GetAngle();

            var newPosition = new b2Vec2(lastPosition.x + (position.x - lastPosition.x) * alpha, lastPosition.y + (position.y - lastPosition.y) * alpha);

            var newRotation = new b2Mat22();
            newRotation.Set(lastAngle + (angle - lastAngle) * alpha);

            return new b2Transform(newPosition, newRotation);
        }

        function draw(alpha) {
            for (var b = world.m_bodyList; b; b = b.m_next) {
                var userData = b.GetUserData();
                if (userData === "PaddleLimiter") {
                    continue;
                }
                var xf = userData != null && userData.lastXF != null ? lerpTransform(b.m_xf, userData.lastXF, alpha) : b.m_xf;
                for (var f = b.GetFixtureList(); f; f = f.m_next) {
                    var s = f.GetShape();
                    var isTheEnd = userData != null && userData instanceof TheEnd;
                    drawShape(s, xf, isTheEnd ? "grey" : "white");
                }
            }
            drawOSD();
        }

        return {
            init: initGame,
            update: update,
            draw: draw
        };
    }

    var alreadyRunning = false;
    var runIt = function () {
        if (alreadyRunning) {
            return;
        }

        alreadyRunning = true;

        var canvasWidth = 640;
        var canvasHeight = 320;
        var targetFactor = 0.5;

        var htmlBody = document.getElementsByTagName("body")[0];
        var div = document.createElement("div");
        htmlBody.appendChild(div);

        function resizeCanvas() {
            var windowWidth = window.innerWidth;
            var windowHeight = window.innerHeight;

            var xf = windowWidth / canvasWidth;
            var yf = windowHeight / canvasHeight;
            var scaleFactor = Math.min(xf, yf);
            var sx = canvasWidth * scaleFactor * targetFactor;
            var sy = canvasHeight * scaleFactor * targetFactor;
            var tx = 0 + (windowWidth * 0.5 - sx * 0.5);
            var ty = 0 + (windowHeight * 0.5 - sy * 0.5);

            div.style.width = sx + "px";
            div.style.height = sy + "px";
            div.style.left = tx + "px";
            div.style.top = ty + "px";

        }

        div.style.width = canvasWidth + "px";
        div.style.height = canvasHeight + "px";
        div.style.background = "green";
        div.style.position = "fixed";
        div.style.left = (window.innerWidth * 0.5 - canvasWidth * 0.5) + "px";
        div.style.top = (window.innerHeight * 0.5 - canvasHeight * 0.5) + "px";
        div.style.paddingLeft = "0px";
        div.style.paddingTop = "0px";
        div.style.boxShadow = "0px 0px 2em black";

        window.addEventListener("resize", function (e) {
            resizeCanvas();
        }, false);

        var canvas = document.createElement("canvas");
        canvas.id = "cout";
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.tabIndex = 1;
        div.appendChild(canvas);

        resizeCanvas();

        canvas.focus();

        canvas.addEventListener("keydown", function (e) {
            keystate[e.keyCode ? e.keyCode : e.which] = true;
            return false;
        });
        canvas.addEventListener("keyup", function (e) {
            keystate[e.keyCode ? e.keyCode : e.which] = false;
            return false;
        });


        var w = canvas.width * 0.5, h = canvas.height * 0.5;
        var ctx = canvas.getContext("2d");
        ctx.setTransform(1, 0, 0, 1, w, h);

        var gameScale = 30;
        var gameWidth = w * 2 / gameScale;
        var gameHeight = h * 2 / gameScale;
        var cout = new Crashout(ctx, w, h, gameScale, gameWidth, gameHeight);
        var dt = 1 / 60;
        var last = 0;
        var oneSec = 1 / 1000;
        var accum = 0;
        var loop = function (msecs) {
            requestAnimationFrame(loop);
            var now = msecs !== undefined ? msecs : 0;
            var delta = (now - last) * oneSec;
            if (delta > 0.25) {
                delta = 0.25;
            }
            last = now;
            accum += delta;
            while (accum >= dt) {
                cout.update(dt);
                accum -= dt;
            }

            var alpha = accum / dt;

            ctx.clearRect(-w, -h, w * 2, h * 2);
            ctx.fillStyle = "grey";
            ctx.fillRect(-w, -h, w * 2, h * 2);
            cout.draw(alpha);

            //ctx.strokeStyle = "lime";
            //ctx.strokeRect(-gameWidth * 0.5 * gameScale, -gameHeight * 0.5 * gameScale, gameWidth * gameScale, gameHeight * gameScale);
        };
        cout.init(0);
        requestAnimationFrame(loop);
    };

    return runIt;
}));