"use strict";
final.module("final.demos.physics.PhysicsDemo",
    [
        "final.Vec2",
        "final.math",
        "final.skeleton.SampleApp",
        "final.input.Keys",
        "final.physics.shapes.Shape",
        "final.physics.Body",
        "final.physics.PhysicsEngine",
        "final.input.MouseButton"
    ],
    function (final, Vec2, math, SampleApp, Keys, Shape, Body, PhysicsEngine, MouseButton) {
        var samples = {
            Simple: 0,
            RestitutionCircles: 1,
            FrictionCircles: 2,
            StackingCircles1: 3,
            StackingCircles2: 4,
            StackingCircles3: 5,
            StackingCircles4: 6,
            CircleRain: 7,
            FourWins: 8
        };

        function FourWins(physics) {
            this.physics = physics;
            this.radius = 40;
            this.chipFriction = 0.01;
            this.chipRestitution = 0.25;
            this.chipDensity = 1;
            this.planeFriction = 0.01;

            this.rowCount = 7;
            this.colCount = 6;
            this.cellSizeX = this.radius * 2 * 1.1;
            this.cellSizeY = this.radius * 2 * 1.0;
            this.dimensionX = this.cellSizeX * this.rowCount;
            this.dimensionY = this.cellSizeY * this.colCount;

            this.left = -this.dimensionX * 0.5;
            this.right = this.dimensionX * 0.5;
            this.bottom = this.dimensionY * 0.5;
            this.top = -this.dimensionY * 0.5;

            this.waitDuration = 1000;
            this.curPlayer = "blue";
            this.curTime = Date.now() + this.waitDuration;
        }

        FourWins.prototype.isValidPos = function(pos) {
            if (pos.x < this.left + this.radius) return false;
            if (pos.x > this.right - this.radius) return false;
            if (pos.y > this.top - this.radius) return false;
            if (Date.now() - this.curTime < this.waitDuration) return false;
            return true;
        };

        FourWins.prototype.togglePlayer = function(){
            if (this.curPlayer == "blue") {
                this.curPlayer = "red";
            } else if (this.curPlayer == "red") {
                this.curPlayer = "blue";
            }
            this.curTime = Date.now();
        };

        FourWins.prototype.place = function(pos){
            if (!this.isValidPos(pos)) return;
            var world = this.physics.getWorld();
            var circle = world.addCircle(this.radius, this.chipDensity, this.chipRestitution, this.chipFriction);
            circle.color = this.curPlayer;
            math.vec2Clone(circle.position, pos);
            this.togglePlayer();
        };

        function PhysicsDemo(canvas) {
            SampleApp.call(this, canvas);
            this.registerSample(samples.Simple, "Simple");
            this.registerSample(samples.RestitutionCircles, "Restitution with circles (Different restitution)");
            this.registerSample(samples.FrictionCircles, "Friction with circles (Different frictions)");
            this.registerSample(samples.StackingCircles1, "Stacking circles (No restitution, Equal mass)");
            this.registerSample(samples.StackingCircles2, "Stacking circles (No restitution, Different mass)");
            this.registerSample(samples.StackingCircles3, "Stacking circles (Different restitution, Equal mass)");
            this.registerSample(samples.StackingCircles4, "Stacking circles (Different restitution, Different mass)");
            this.registerSample(samples.CircleRain, "Circle rain");
            this.registerSample(samples.FourWins, "Four wins");
            this.setSample(samples.CircleRain);
            this.physics = new PhysicsEngine();
            this.mouseDown = false;
            this.nextPos = new Vec2();
            this.nextRadius = 10 + Math.random() * 50;
            this.paused = false;
            this.fourWins = new FourWins(this.physics);
            this.profilerEnabled = true;
        }

        PhysicsDemo.extend(SampleApp);

        PhysicsDemo.prototype.loadSample = function (id, w, h) {
            var world = this.physics.getWorld();
            world.clear();

            var circle, halfspace, restitution, friction, density, i, j;
            var radius = 20;

            switch (id) {
                case samples.Simple:
                    density = 1;

                    halfspace = world.addHalfSpace(new Vec2(0, -1), 500);
                    math.vec2MultScalar(halfspace.position, halfspace.shape.normal, -200);

                    circle = world.addCircle(radius * 4, 0);
                    math.vec2Set(circle.position, 0, 0);

                    circle = world.addCircle(radius, density);
                    math.vec2Set(circle.position, 1, -150);

                    line = world.addLineSegment(180, 0, 0);
                    line.orientation = math.deg2rad(90);
                    math.vec2Set(line.position, 400, 0);

                    line = world.addLineSegment(180, 0, 0);
                    line.orientation = math.deg2rad(90);
                    math.vec2Set(line.position, -400, 0);

                    break;

                case samples.RestitutionCircles:
                    density = 1;

                    halfspace = world.addHalfSpace(new Vec2(0, -1), 500);
                    math.vec2MultScalar(halfspace.position, halfspace.shape.normal, -200);

                    circle = world.addCircle(radius, density, 0);
                    math.vec2Set(circle.position, -200, 0);

                    circle = world.addCircle(radius, density, 0.25);
                    math.vec2Set(circle.position, -125, 0);

                    circle = world.addCircle(radius, density, 0.4);
                    math.vec2Set(circle.position, -50, 0);

                    circle = world.addCircle(radius, density, 0.5);
                    math.vec2Set(circle.position, 25, 0);

                    circle = world.addCircle(radius, density, 0.65);
                    math.vec2Set(circle.position, 100, 0);

                    circle = world.addCircle(radius, density, 0.8);
                    math.vec2Set(circle.position, 175, 0);

                    circle = world.addCircle(radius, density, 0.9);
                    math.vec2Set(circle.position, 250, 0);

                    break;

                case samples.FrictionCircles:
                    density = 1;
                    restitution = 0;
                    friction = 0.2;
                    var offsetX = -250;
                    var offsetY = -200;

                    halfspace = world.addHalfSpace(new Vec2(0, -1), 500);
                    math.vec2MultScalar(halfspace.position, halfspace.shape.normal, -200);

                    line = world.addLineSegment(300, 0, 0, friction);
                    line.orientation = math.deg2rad(190);
                    math.vec2Set(line.position, -200, -100);

                    line = world.addLineSegment(350, 0, 0, friction);
                    line.orientation = math.deg2rad(-190);
                    math.vec2Set(line.position, 200, 50);

                    line = world.addLineSegment(50, 0, 0, friction);
                    line.orientation = math.deg2rad(90);
                    math.vec2Set(line.position, -150, 60);

                    circle = world.addCircle(radius, density, 0, 0.75);
                    math.vec2Set(circle.position, offsetX + -200, offsetY + 0);

                    circle = world.addCircle(radius, density, 0, 0.5);
                    math.vec2Set(circle.position, offsetX + -125, offsetY + 0);

                    circle = world.addCircle(radius, density, 0, 0.35);
                    math.vec2Set(circle.position, offsetX + -50, offsetY + 0);

                    circle = world.addCircle(radius, density, 0, 0.1);
                    math.vec2Set(circle.position, offsetX + 25, offsetY + 0);

                    circle = world.addCircle(radius, density, 0, 0.0);
                    math.vec2Set(circle.position, offsetX + 100, offsetY + 0);

                    break;

                case samples.StackingCircles1:
                case samples.StackingCircles2:
                case samples.StackingCircles3:
                case samples.StackingCircles4:
                    friction = 0.2;

                    halfspace = world.addHalfSpace(new Vec2(0, -1), 500);
                    math.vec2MultScalar(halfspace.position, halfspace.shape.normal, -200);

                    line = world.addLineSegment(200, 0, 0, friction);
                    line.orientation = math.deg2rad(90);
                    math.vec2Set(line.position, -500, 0);

                    line = world.addLineSegment(200, 0, 0, friction);
                    line.orientation = math.deg2rad(90);
                    math.vec2Set(line.position, 500, 0);

                    var countX = 6;
                    var countY = 10;
                    var pad = 1.3;
                    var halfSize = radius * pad * 2 * countY * 0.5;
                    var wPad = radius * 4;
                    var halfWidth = (((radius * 2) * countX) + wPad * (countX-1)) * 0.5 - radius;
                    for (j = 0; j < countX; j++) {
                        for (i = 0; i < countY; i++) {
                            restitution = 0;
                            density = 1;
                            if (id == samples.StackingCircles2) {
                                density = (i + 1) * 20;
                            } else if (id == samples.StackingCircles3) {
                                restitution = 1 - math.clamp((i + 1) / countY, 0, 1);
                            } else if (id == samples.StackingCircles4) {
                                density = (i + 1) * 20;
                                restitution = 1 - math.clamp((i + 1) / countY, 0, 1);
                            }
                            circle = world.addCircle(radius, density, restitution, friction);
                            math.vec2Set(circle.position, -halfWidth + j * (radius * 2 + wPad), -halfSize * pad + i * radius * pad * 2);
                        }
                    }
                    break;

                case samples.CircleRain:
                    restitution = 0.3;
                    friction = 0.2;

                    halfspace = world.addHalfSpace(new Vec2(0, -1), 500);
                    math.vec2MultScalar(halfspace.position, halfspace.shape.normal, -200);

                    var line = world.addLineSegment(250, 0, 0, friction);
                    line.orientation = math.deg2rad(200);
                    math.vec2Set(line.position, -250, -70);

                    line = world.addLineSegment(250, 0, 0, friction);
                    line.orientation = math.deg2rad(-200);
                    math.vec2Set(line.position, 200, 50);

                    line = world.addLineSegment(200, 0, 0, friction);
                    line.orientation = math.deg2rad(-200);
                    math.vec2Set(line.position, 300, -200);

                    halfspace = world.addHalfSpace(new Vec2(1, 0), 500);
                    math.vec2Set(halfspace.position, -500, 0);

                    halfspace = world.addHalfSpace(new Vec2(-1, 0), 500);
                    math.vec2Set(halfspace.position, 500, 0);

                    var circleBottomStart = -300;
                    var circleCount = 100;
                    var radis = [];
                    var h = 0, m = 0;
                    for (i = 0; i < circleCount; i++) {
                        radis[i] = Math.round(5 + Math.random() * 15);
                        h += radis[i] * 2 * 1.5;
                        m = math.max(m, radis[i]);
                    }
                    for (i = 0; i < circleCount; i++) {
                        circle = world.addCircle(radis[i], 1, restitution, friction);
                        math.vec2Set(circle.position, -400 + Math.random() * 800, circleBottomStart - (i * m * 2 * 1.25));
                    }

                    break;

                case samples.FourWins:
                    var fw = this.fourWins;
                    var dimensionX = fw.dimensionX;
                    var dimensionY = fw.dimensionY;
                    var cellSizeX = fw.cellSizeX;
                    var cellSizeY = fw.cellSizeY;

                    // Create outlines (bottom, left, right)
                    halfspace = world.addHalfSpace(new Vec2(0, -1), dimensionX * 0.5, 0, fw.planeFriction);
                    math.vec2Set(halfspace.position, 0, fw.bottom);
                    halfspace = world.addHalfSpace(new Vec2(1, 0), dimensionY * 0.5, 0, fw.planeFriction);
                    math.vec2Set(halfspace.position, fw.left, 0);
                    halfspace = world.addHalfSpace(new Vec2(-1, 0), dimensionY * 0.5, 0, fw.planeFriction);
                    math.vec2Set(halfspace.position, fw.right, 0);

                    // Create inner grid lines Y
                    for (i = 1; i < fw.rowCount; i++) {
                        var cx = fw.left + i * cellSizeX;
                        for (var j = 0; j < fw.colCount; j++) {
                            var cy = fw.top;
                            circle = world.addCircle(2, 0, 0, this.planeFriction);
                            math.vec2Set(circle.position, cx, cy + (j * cellSizeY));
                            circle = world.addCircle(2, 0, 0, this.planeFriction);
                            math.vec2Set(circle.position, cx, cy + (j * cellSizeY) + (cellSizeY * 0.5));
                        }
                    }

                    break;
            }
        };

        PhysicsDemo.prototype.init = function (r, w, h) {
            SampleApp.prototype.init.call(this, r, w, h);

        };

        PhysicsDemo.prototype.update = function (dt, w, h) {
            SampleApp.prototype.update.call(this, dt, w, h);

            var world = this.physics.getWorld();

            // Handle pause
            if (this.keyboard.isKeyDown(Keys.P)) {
                this.keyboard.setKeyDown(Keys.P, false);
                this.paused = !this.paused;
            }

            // Handle restart
            if (this.keyboard.isKeyDown(Keys.R)) {
                this.keyboard.setKeyDown(Keys.R, false);
                this.loadSample(this.activeSample, w, h);
            }

            if (!this.paused) {
                // Handle mouse input
                if (this.mouse.isMouseDown(MouseButton.Left)) {
                    math.vec2Clone(this.nextPos, this.mousePos);
                    if (!this.mouseDown) {
                        this.mouseDown = true;
                    }
                } else {
                    if (this.mouseDown) {
                        math.vec2Clone(this.nextPos, this.mousePos);
                        if (this.activeSample == samples.FourWins) {
                            this.fourWins.place(this.nextPos);
                        } else {
                            var circle = world.addCircle(this.nextRadius, 1, 0.1, 0.2);
                            math.vec2Clone(circle.position, this.nextPos);
                            this.nextRadius = 10 + Math.random() * 50;
                        }

                        this.mouseDown = false;
                    }
                }
                this.physics.step(dt);
            } else {
                this.physics.contacts.clear();
            }
        };

        PhysicsDemo.prototype.drawOSD = function (r, w, h) {
            SampleApp.prototype.drawOSD.call(this, r, w, h);
            r.fillText(0, 20, "Simulation is " + (this.paused ? "paused" : "running"), "white", "left", "top");
            r.fillText(0, 40, "Bodies: " + this.physics.world.size(), "white", "left", "top");
            r.fillText(0, 60, "Broadphase: " + this.physics.broadphase.size(), "white", "left", "top");
            r.fillText(0, 80, "Contacts: " + this.physics.contacts.size(), "white", "left", "top");
            r.fillText(0, 100, "Solver iterations: " + this.physics.solver.iterations, "white", "left", "top");
            r.fillText(0, 120, "Fps: " + this.fps, "white", "left", "top");
        };

        PhysicsDemo.prototype.drawSample = function (id, r, dt, w, h) {
            this.physics.draw(r);
            if (this.mouseDown) {
                if (this.activeSample === samples.FourWins) {
                    r.strokeArc(this.nextPos.x, this.nextPos.y, this.fourWins.radius, this.fourWins.isValidPos(this.nextPos) ? "green" : "red", 2);
                } else {
                    r.strokeArc(this.nextPos.x, this.nextPos.y, this.nextRadius, "blue", 2);
                }

            }
        };

        return PhysicsDemo;
    }
);