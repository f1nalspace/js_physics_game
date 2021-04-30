(function () {
    var pi180 = Math.PI / 180;

    function Vec2(x, y) {
        this.x = x;
        this.y = y;
    }

    Vec2.prototype.zero = function () {
        this.x = 0;
        this.y = 0;
        return this;
    };

    Vec2.prototype.set = function (x, y) {
        this.x = x;
        this.y = y;
        return this;
    };

    Vec2.prototype.dot = function (v) {
        return this.x * v.x + this.y * v.y;
    };

    Vec2.prototype.sub = function (v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    };

    Vec2.prototype.add = function (v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    };

    Vec2.prototype.multScalar = function (scalar) {
        return new Vec2(this.x * scalar, this.y * scalar);
    };

    Vec2.prototype.imultScalar = function (scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    };

    Vec2.prototype.normalized = function () {
        var l = Math.sqrt(this.dot(this));
        if (l == 0) {
            l = 1;
        }
        return new Vec2(this.x / l, this.y / l);
    };

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    var keystate = [];
    canvas.addEventListener("keydown", function (e) {
        var keyCode = e.keyCode ? e.keyCode : e.which;
        keystate[keyCode] = true;
        return false;
    }, false);
    canvas.addEventListener("keyup", function (e) {
        var keyCode = e.keyCode ? e.keyCode : e.which;
        keystate[keyCode] = false;
        return false;
    }, false);

    var keys = {
        Space: 32,
        Left: 37,
        Right: 39,
        S: 83
    };

    var isKeyDown = function (key) {
        return typeof keystate[key] != "undefined" && keystate[key] == true;
    };

    var setKeyDown = function (key, value) {
        keystate[key] = value;
    };

    var w = canvas.width, h = canvas.height;

    var singleStepping = true;
    var step = false;
    var dt = 1.0 / 60.0;

    var drawVelocity = false;

    var ballDegrees = 50;
    var ballSpeed = 1000;
    var ballPos = new Vec2(0, 0);
    var ballOldPos = new Vec2(ballPos.x, ballPos.y);
    var ballVel = new Vec2(Math.cos(pi180 * ballDegrees) * ballSpeed, Math.sin(pi180 * ballDegrees) * ballSpeed);
    var ballAccel = new Vec2(0, 0);
    var ballRadius = 20;

    var paddlePos = new Vec2(0, -h * 0.4);
    var paddleOldPos = new Vec2(paddlePos.x, paddlePos.y);
    var paddleExt = new Vec2(50, 15);
    var paddleVel = new Vec2(0, 0);
    var paddleAccel = new Vec2(0, 0);
    var paddleSpeed = 3000;
    var paddleDamping = 0.9;
    var paddleRadius = 15;
    var paddleRestitution = 0.5;

    var wallBorder = 20;
    var wallTop = {
        v0: new Vec2(-w * 0.5 + wallBorder, h * 0.5 - wallBorder),
        v1: new Vec2(w * 0.5 - wallBorder, h * 0.5 - wallBorder),
        n: new Vec2(0, -1)
    };
    var wallBottom = {
        v0: new Vec2(-w * 0.5 + wallBorder, -h * 0.5 + wallBorder),
        v1: new Vec2(w * 0.5 - wallBorder, -h * 0.5 + wallBorder),
        n: new Vec2(0, 1)
    };
    var wallLeft = {
        v0: new Vec2(-w * 0.5 + wallBorder, h * 0.5 - 20),
        v1: new Vec2(-w * 0.5 + wallBorder, -h * 0.5 + 20),
        n: new Vec2(1, 0)
    };
    var wallRight = {
        v0: new Vec2(w * 0.5 - wallBorder, h * 0.5 - 20),
        v1: new Vec2(w * 0.5 - wallBorder, -h * 0.5 + 20),
        n: new Vec2(-1, 0)
    };
    var walls = [wallTop, wallBottom, wallLeft, wallRight];

    ctx.translate(w * 0.5, h * 0.5);
    ctx.scale(1, -1);

    ctx.lineWidth = 1;

    var lastTime = 0;
    var lagAccumulator = 0;

    /**
     * Line segment vs line segment intersection
     * based on http://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
     * @param p0
     * @param p1
     * @param q0
     * @param q1
     * @param tmax
     * @returns {*}
     */
    var intersectLineSegment = function (p0, p1, q0, q1, tmax) {
        var result = {
            x: null,
            y: null,
            t: 1,
            success: false
        };
        var denominator = ((q1.y - q0.y) * (p1.x - p0.x)) - ((q1.x - q0.x) * (p1.y - p0.y));
        if (denominator == 0) {
            return result;
        }
        var a = p0.y - q0.y;
        var b = p0.x - q0.x;
        var numerator1 = ((q1.x - q0.x) * a) - ((q1.y - q0.y) * b);
        var numerator2 = ((p1.x - p0.x) * a) - ((p1.y - p0.y) * b);
        a = numerator1 / denominator;
        b = numerator2 / denominator;
        if (a >= 0 && a <= tmax && b >= 0 && b <= tmax) {
            result.x = p0.x + (a * (p1.x - p0.x));
            result.y = p0.y + (a * (p1.y - p0.y));
            result.t = a;
            result.success = true;
        }
        return result;
    };

    var updatePaddle = function () {
        var prevVelX, prevVelY;

        // Apply player movement
        paddleAccel.zero();
        if (isKeyDown(keys.Left)) {
            paddleAccel.set(-1, 0).imultScalar(paddleSpeed);
        } else if (isKeyDown(keys.Right)) {
            paddleAccel.set(1, 0).imultScalar(paddleSpeed);
        }

        // Integrate paddle
        {
            paddleOldPos.x = paddlePos.x;
            paddleOldPos.y = paddlePos.y;

            prevVelX = paddleVel.x;
            prevVelY = paddleVel.y;

            paddleVel.x += paddleAccel.x * dt;
            paddleVel.y += paddleAccel.y * dt;

            paddleVel.imultScalar(paddleDamping);

            paddleAccel.zero();

            paddlePos.x += (prevVelX + paddleVel.x) * 0.5 * dt;
            paddlePos.y += (prevVelY + paddleVel.y) * 0.5 * dt;
        }

        /*
         Paddle to Wall collisions based on minkowski sum
         Swept paddle is shrinked to a line segment and paddle radius + paddle ext is added to the wall
         */
        for (var i = 2; i < 4; i++) {
            // Construct paddle line segment (Prev pos to next pos)
            var paddleSegment = {
                v0: paddleOldPos,
                v1: paddlePos
            };

            // Construct new wall line segment - but extrude line segment on paddle ext + radius based on line normal
            var wallSegment = {
                v0: walls[i].v0.add(walls[i].n.multScalar(paddleExt.x + paddleRadius)),
                v1: walls[i].v1.add(walls[i].n.multScalar(paddleExt.x + paddleRadius)),
                n: walls[i].n
            };

            // TODO: AABB-Test first to improve performance

            // TODO: Test dot product first for determination if paddle is going towards line

            // Calculate intersection point between paddle movement segment and wall segment
            var intersectionPoint = intersectLineSegment(paddleSegment.v0, paddleSegment.v1, wallSegment.v0, wallSegment.v1, 1.0);
            if (intersectionPoint.success) {
                // We want to correct the position only when the ball is going towards the line
                var n = wallSegment.n;
                var projVel = paddleVel.dot(n);
                if (projVel < 0) {
                    // Correct position
                    paddlePos.x = intersectionPoint.x;
                    paddlePos.y = intersectionPoint.y;

                    // Reflect velocity
                    paddleVel.x -= (1 + paddleRestitution) * projVel * n.x;
                }

            }
        }
    };

    var updateBall = function () {
        var prevVelX, prevVelY;

        // Integrate ball
        {
            ballOldPos.x = ballPos.x;
            ballOldPos.y = ballPos.y;

            prevVelX = ballVel.x;
            prevVelY = ballVel.y;

            ballVel.x += ballAccel.x * dt;
            ballVel.y += ballAccel.y * dt;

            ballAccel.zero();

            ballPos.x += (prevVelX + ballVel.x) * 0.5 * dt;
            ballPos.y += (prevVelY + ballVel.y) * 0.5 * dt;
        }

        var tNormal = new Vec2(0, 0);
        var maxIterations = 4;
        var tStep = 1.0;

        // TODO: Update until no collisions are found or some number of iterarions are passed
        for (var iter = 0; iter < maxIterations; iter++) {
            var tmax = 1.0;
            var tmin = 1.0;
            var tfound = false;

            /*
             Ball to Wall collisions based on minkowski sum
             Swept ball is shrinked to a line segment and ball radius is added to the wall
             */
            for (var i = 0; i < walls.length; i++) {
                // Construct circle line segment (Prev pos to next pos)
                var circleSegment = {
                    v0: ballOldPos,
                    v1: ballPos
                };

                // Construct new wall line segment - but extrude line segment on ball radius based on line normal
                var wallSegment = {
                    v0: walls[i].v0.add(walls[i].n.multScalar(ballRadius)),
                    v1: walls[i].v1.add(walls[i].n.multScalar(ballRadius)),
                    n: walls[i].n
                };

                // TODO: AABB-Test first to improve performance

                // TODO: Test dot product first for determination if ball is going towards line

                // Calculate intersection point for two line segments
                var intersectionPoint = intersectLineSegment(circleSegment.v0, circleSegment.v1, wallSegment.v0, wallSegment.v1, tmax);
                if (intersectionPoint.success) {
                    // We want to correct the position only when the ball is going towards the line
                    // Find best min T
                    if (intersectionPoint.t < tmin) {
                        tmin = intersectionPoint.t;
                        tfound = true;
                        tNormal.set(wallSegment.n.x, wallSegment.n.y);

                    }
                }
            }

            // Construct swept paddle aabb
            var startPaddleAABB = {
                min: paddlePos.sub(paddleExt),
                max: paddlePos.add(paddleExt)
            };
            var targetPaddleAABB = {
                min: paddlePos.add(paddleVel.multScalar(dt)).sub(paddleExt),
                max: paddlePos.add(paddleVel.multScalar(dt)).add(paddleExt)
            };
            var sweptPaddleAABB = {
                min: new Vec2(Math.min(startPaddleAABB.min.x, targetPaddleAABB.min.x), Math.min(startPaddleAABB.min.y, targetPaddleAABB.min.y)),
                max: new Vec2(Math.max(startPaddleAABB.max.x, targetPaddleAABB.max.x), Math.max(startPaddleAABB.max.y, targetPaddleAABB.max.y))
            };

            if (tfound) {
                var n = tNormal;
                var projVel = ballVel.dot(n);
                if (projVel < 0) {
                    // Adjust ball position based on smallest time found
                    ballPos.x -= ballVel.x * dt * (1.0 - tmin);
                    ballPos.y -= ballVel.y * dt * (1.0 - tmin);

                    // Reflect velocity
                    ballVel.x -= 2 * projVel * n.x;
                    ballVel.y -= 2 * projVel * n.y;

                    // Adjust tmax
                    tmax -= tmin; // TODO: 1.0 - tmin or tmin?
                    if (tmax < 0) {
                        // No timestep left, exit out
                        break;
                    }
                }
            } else {
                // No more collisions found - exit out
                break;
            }
        }
    };

    var updateGame = function () {
        if (isKeyDown(keys.Space)) {
            setKeyDown(keys.Space, false);
            step = true;
        }
        if (isKeyDown(keys.S)) {
            setKeyDown(keys.S, false);
            singleStepping = !singleStepping;
        }

        if ((singleStepping && step) || !singleStepping) {
            if (step) {
                step = false;
            }

            updatePaddle();
            updateBall();

        }
    };

    var updateFrame = function (now) {
        /*
         var frameTime = (now - lastTime) / 1000;
         if (frameTime > 0.25) {
         frameTime = 0.25;
         }
         lastTime = now;

         lagAccumulator += frameTime;
         while (lagAccumulator >= dt) {
         updateGame();
         lagAccumulator -= dt;
         }
         var alpha = lagAccumulator / dt;
         */
        updateGame();
        var alpha = 1.0;

        // Background
        ctx.fillStyle = "white";
        ctx.fillRect(-w * 0.5, -h * 0.5, w, h);

        // Draw walls
        ctx.beginPath();
        for (var i = 0; i < walls.length; i++) {
            ctx.moveTo(walls[i].v0.x, walls[i].v0.y);
            ctx.lineTo(walls[i].v1.x, walls[i].v1.y);
        }
        ctx.strokeStyle = "blue";
        ctx.stroke();

        // Calculate interpolated ball position
        var ballRenderX = ballOldPos.x + (ballPos.x - ballOldPos.x) * alpha;
        var ballRenderY = ballOldPos.y + (ballPos.y - ballOldPos.y) * alpha;

        // Draw ball
        ctx.beginPath();
        ctx.arc(ballRenderX, ballRenderY, ballRadius, 0, Math.PI * 2, false);
        ctx.strokeStyle = "black";
        ctx.stroke();

        if (drawVelocity) {
            // Draw ball target
            ctx.beginPath();
            ctx.arc(ballRenderX + ballVel.x * dt, ballRenderY + ballVel.y * dt, ballRadius, 0, Math.PI * 2, false);
            ctx.strokeStyle = "blue";
            ctx.stroke();
        }

        // Draw ball center
        ctx.beginPath();
        ctx.arc(ballRenderX, ballRenderY, 2, 0, Math.PI * 2, false);
        ctx.fillStyle = "black";
        ctx.fill();

        // Calculate interpolated paddle position
        var paddleRenderX = paddleOldPos.x + (paddlePos.x - paddleOldPos.x) * alpha;
        var paddleRenderY = paddleOldPos.y + (paddlePos.y - paddleOldPos.y) * alpha;
        var paddleRenderTargetX = paddleRenderX + paddleVel.x * dt;
        var paddleRenderTargetY = paddleRenderY + paddleVel.y * dt;

        // Draw paddle
        ctx.beginPath();
        ctx.rect(paddleRenderX - paddleExt.x, paddleRenderY - paddleExt.y, paddleExt.x * 2, paddleExt.y * 2);
        ctx.arc(paddleRenderX - paddleExt.x, paddleRenderY, paddleRadius, Math.PI / 2, Math.PI * 1.5, false);
        ctx.arc(paddleRenderX + paddleExt.x, paddleRenderY, paddleRadius, Math.PI * 1.5, Math.PI / 2, false);
        ctx.strokeStyle = "black";
        ctx.stroke();

        // Draw paddle target
        if (drawVelocity) {
            ctx.beginPath();
            ctx.rect(paddleRenderTargetX - paddleExt.x, paddleRenderTargetY - paddleExt.y, paddleExt.x * 2, paddleExt.y * 2);
            ctx.arc(paddleRenderTargetX - paddleExt.x, paddleRenderTargetY, paddleRadius, Math.PI / 2, Math.PI * 1.5, false);
            ctx.arc(paddleRenderTargetX + paddleExt.x, paddleRenderTargetY, paddleRadius, Math.PI * 1.5, Math.PI / 2, false);
            ctx.strokeStyle = "blue";
            ctx.stroke();
        }

        requestAnimationFrame(updateFrame);
    };

    requestAnimationFrame(updateFrame);

})();
