/**
 * This sample is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.samples.sat.SATSampleApp",
    [
        "final.Vec2",
        "final.Vec2Pool",
        "final.math",
        "final.skeleton.SampleApp",
        "final.collision.ClosestPoints",
        "final.collision.Intersections",
        "final.collision.Projection",
        "final.input.MouseButton"
    ],
    function (final, Vec2, Vec2Pool, math, SampleApp, ClosestPoints, Intersections, Projection, MouseButton) {
        var sampleTypes = {
            CircleAABB: 1,
            getKeyByValue: function (value) {
                for (var k in this) {
                    if (this.hasOwnProperty(k)) {
                        var v = this[k];
                        if (!isNaN(v) && isFinite(v)) {
                            if (v == value) {
                                return k;
                            }
                        }
                    }
                }
                return null;
            }
        };

        function SATSampleApp(canvas) {
            SampleApp.call(this, canvas);
            this.registerSample(sampleTypes.CircleAABB, "Test for Circle and AABB");
            this.setSample(sampleTypes.CircleAABB);
            this.center = new Vec2(50, -130);
            this.centerRadius = 30;
            this.mouseDown = false;
            this.mouseStart = new Vec2(-1, -1);
            this.dotRadius = 4;
        }

        SATSampleApp.extend(SampleApp);

        SATSampleApp.prototype.update = function (dt, w, h) {
            SampleApp.prototype.update.call(this, dt, w, h);

            if (this.mouse.isMouseDown(MouseButton.Left)) {
                if (!this.mouseDown) {
                    if (Intersections.isPointInCircle(this.mousePos, this.center, this.centerRadius)) {
                        this.mouseDown = true;
                        math.vec2Clone(this.mouseStart, this.mousePos);
                    }
                } else {
                    this.center.x += this.mousePos.x - this.mouseStart.x;
                    this.center.y += this.mousePos.y - this.mouseStart.y;
                    math.vec2Clone(this.mouseStart, this.mousePos);
                }
            } else {
                if (this.mouseDown) {
                    this.mouseDown = false;
                }
            }
        };

        SATSampleApp.prototype.drawCircleAABB = function (r, dt, w, h) {
            var bodyA = {
                position: this.center,
                radius: this.centerRadius
            };

            var bodyB = {
                position: Vec2Pool.get(),
                ext: Vec2Pool.get()
            };
            math.vec2Set(bodyB.position, 0, 0);
            math.vec2Set(bodyB.ext, 40, 90);

            // Draw circle
            r.strokeArc(bodyA.position.x, bodyA.position.y, bodyA.radius, "yellow", 2);

            // Draw aabb
            r.strokeRect(bodyB.position.x - bodyB.ext.x, bodyB.position.y - bodyB.ext.y, bodyB.ext.x * 2, bodyB.ext.y * 2, "yellow", 2);

            var closest = Vec2Pool.get();
            ClosestPoints.closestPointOnAABB(closest, bodyA.position, bodyB.position, bodyB.ext);
            r.drawLine(bodyA.position.x, bodyA.position.y, closest.x, closest.y, "red");

            var distanceToClosest = Vec2Pool.get();
            math.vec2Sub(distanceToClosest, bodyA.position, closest);

            var closestNormal = Vec2Pool.get();
            math.vec2Normalize(closestNormal, distanceToClosest);
            r.drawNormal(closest.x, closest.y, closestNormal.x, closestNormal.y, "white", 2, 40);

            var relativePosition = Vec2Pool.get();
            math.vec2Sub(relativePosition, bodyA.position, bodyB.position);

            var aabbAxisX = Vec2Pool.get(1, 0);
            var aabbAxisY = Vec2Pool.get(0, 1);

            var axis = [];
            if (!math.vec2Equals(closest, bodyA.position)) {
                axis.push(closestNormal);
            } else {
                axis.push(aabbAxisX);
                axis.push(aabbAxisY);
            }

            var collisionDistance = 0;
            var collisionNormal = Vec2Pool.get();
            var collisionIndex = -1;

            var t = [];

            for (var i = 0; i < axis.length; i++) {
                var n = axis[i];

                var projPos = math.vec2Dot(relativePosition, n);

                // Project aabb
                var projAABB = Vec2Pool.get();
                Projection.projectAABB(projAABB, bodyB.ext, n);

                // Project circle
                var projCircle = Vec2Pool.get();
                Projection.projectCircle(projCircle, bodyA.radius);
                projCircle.x += projPos;
                projCircle.y += projPos;

                // Find overlaps
                var d0 = projCircle.x - projAABB.y;
                var d1 = projAABB.x - projCircle.y;

                // Get max overlap
                var overlap = d0 > d1 ? d0 : d1;
                if (overlap > 0) {
                    collisionIndex = -1;
                    break;
                }

                // Save greatest (smallest positive overlap)
                if (collisionIndex == -1 || overlap > collisionDistance) {
                    collisionIndex = i;
                    collisionDistance = overlap;
                    math.vec2Clone(collisionNormal, n);
                }
            }

            if (collisionIndex > -1) {
                // Make sure the collision normal is always pushing away
                if (math.vec2Dot(collisionNormal, relativePosition) < 0) {
                    math.vec2MultScalar(collisionNormal, collisionNormal, -1);
                }

                // Penetration
                var fixedPos = Vec2Pool.get();
                math.vec2AddMultScalar(fixedPos, bodyA.position, collisionNormal, -collisionDistance);

                r.strokeArc(fixedPos.x, fixedPos.y, bodyA.radius, "green", 2);

                r.drawNormal(bodyB.position.x, bodyB.position.y, collisionNormal.x, collisionNormal.y, "white", 2, 40);
            }

            r.fillText(-w * 0.5, -h * 0.5 + 20, "Distance: " + collisionDistance, "white", "left", "top");
        };

        SATSampleApp.prototype.drawSample = function (id, r, dt, w, h) {
            var func = this["draw" + sampleTypes.getKeyByValue(id)];
            if (typeof func == "function") {
                func.call(this, r, dt, w, h);
            }
        };

        return SATSampleApp;
    }
);