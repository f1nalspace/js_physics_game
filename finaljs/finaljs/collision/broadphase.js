/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.collision.Broadphase",
    [
        "final.Vec2",
        "final.Vec2Pool",
        "final.math",
        "final.collection.Pair",
        "final.collection.Pool",
        "final.collision.Intersections",
        "final.physics.Body",
        "final.physics.shapes.Shape",
        "final.physics.shapes.ShapeType"
    ],
    function (final, Vec2, Vec2Pool, math, Pair, Pool, Intersections, Body, Shape, ShapeType) {
        function collisionCircleToHalfSpace(bodyA, bodyB) {
            var distance = Vec2Pool.get();
            var aabbCenter = Vec2Pool.get();
            var aabbExt = Vec2Pool.get();

            math.vec2Sub(distance, bodyA.nextPosition, bodyA.position);
            math.vec2AddMultScalar(aabbCenter, bodyA.position, distance, 0.5);
            aabbExt.x = Math.abs(distance.x) * 0.5 + bodyA.shape.radius;
            aabbExt.y = Math.abs(distance.y) * 0.5 + bodyA.shape.radius;

            return Intersections.isAABBInHalfSpace(aabbCenter, aabbExt, bodyB.shape.normal, bodyB.position);
        }

        function collisionHalfSpaceToCircle(bodyA, bodyB) {
            return collisionCircleToHalfSpace(bodyB,  bodyA);
        }

        function collisionCircleToCircle(bodyA, bodyB) {
            var distanceA = Vec2Pool.get();
            var distanceB = Vec2Pool.get();
            var aabbCenterA = Vec2Pool.get();
            var aabbCenterB = Vec2Pool.get();
            var aabbExtA = Vec2Pool.get();
            var aabbExtB = Vec2Pool.get();

            math.vec2Sub(distanceA, bodyA.nextPosition, bodyA.position);
            math.vec2AddMultScalar(aabbCenterA, bodyA.position, distanceA, 0.5);
            aabbExtA.x = Math.abs(distanceA.x) * 0.5 + bodyA.shape.radius;
            aabbExtA.y = Math.abs(distanceA.y) * 0.5 + bodyA.shape.radius;

            math.vec2Sub(distanceB, bodyB.nextPosition, bodyB.position);
            math.vec2AddMultScalar(aabbCenterB, bodyB.position, distanceB, 0.5);
            aabbExtB.x = Math.abs(distanceB.x) * 0.5 + bodyB.shape.radius;
            aabbExtB.y = Math.abs(distanceB.y) * 0.5 + bodyB.shape.radius;

            return Intersections.isAABBInAABB(aabbCenterA, aabbExtA, aabbCenterB, aabbExtB);
        }

        function collisionCircleToLineSegment(bodyA, bodyB) {
            var distanceA = Vec2Pool.get();
            var distanceB = Vec2Pool.get();
            var aabbCenterA = Vec2Pool.get();
            var aabbCenterB = Vec2Pool.get();
            var aabbExtA = Vec2Pool.get();
            var aabbExtB = Vec2Pool.get();

            math.vec2Sub(distanceA, bodyA.nextPosition, bodyA.position);
            math.vec2Sub(distanceB, bodyB.nextPosition, bodyB.position);

            math.vec2AddMultScalar(aabbCenterA, bodyA.position, distanceA, 0.5);
            aabbExtA.x = Math.abs(distanceA.x) * 0.5 + bodyA.shape.radius;
            aabbExtA.y = Math.abs(distanceA.y) * 0.5 + bodyA.shape.radius;

            var lineA = Vec2Pool.get();
            var lineB = Vec2Pool.get();
            var lx = Math.cos(bodyB.orientation) * bodyB.shape.distance;
            var ly = Math.sin(bodyB.orientation) * bodyB.shape.distance;
            lineA.x = bodyA.position.x - lx;
            lineA.y = bodyA.position.y - ly;
            lineB.x = bodyA.position.x + lx;
            lineB.y = bodyA.position.y + ly;

            var radX = Math.max(Math.abs(lineA.x - lineB.x) * 0.5, bodyA.shape.radius);
            var radY = Math.max(Math.abs(lineA.y - lineB.y) * 0.5, bodyA.shape.radius);
            math.vec2AddMultScalar(aabbCenterB, bodyB.position, distanceB, 0.5);
            aabbExtB.x = Math.abs(distanceB.x) * 0.5 + radX;
            aabbExtB.y = Math.abs(distanceB.y) * 0.5 + radY;

            return Intersections.isAABBInAABB(aabbCenterA, aabbExtA, aabbCenterB, aabbExtB);
        }

        function collisionLineSegmentToCircle(bodyA, bodyB) {
            return collisionCircleToLineSegment(bodyB, bodyA);
        }

        var collisionFunctions = [];

        function addCollisionFunction(typeA, typeB, func) {
            if (typeof collisionFunctions[typeA] == "undefined") {
                collisionFunctions[typeA] = [];
            }
            collisionFunctions[typeA][typeB] = func;
        }

        addCollisionFunction(ShapeType.Circle, ShapeType.Circle, collisionCircleToCircle);
        addCollisionFunction(ShapeType.Circle, ShapeType.HalfSpace, collisionCircleToHalfSpace);
        addCollisionFunction(ShapeType.HalfSpace, ShapeType.Circle, collisionHalfSpaceToCircle);
        addCollisionFunction(ShapeType.Circle, ShapeType.LineSegment, collisionCircleToLineSegment);
        addCollisionFunction(ShapeType.LineSegment, ShapeType.Circle, collisionLineSegmentToCircle);

        function Broadphase() {
            this.pairs = new Pool(function () {
                return new Pair();
            });
            this.pairs.expand(100);
        }

        Broadphase.prototype.testCollision = function (bodyA, bodyB) {
            var entryA = collisionFunctions[bodyA.shape.type];
            if (typeof entryA != "undefined") {
                var collisionFunc = entryA[bodyB.shape.type];
                if (typeof collisionFunc != "undefined") {
                    return collisionFunc(bodyA, bodyB);
                }
            }
            return false;
        };

        Broadphase.prototype.execute = function (dt, bodies) {
            // Simple O^n broadphase
            for (var i = 0; i < bodies.size(); ++i) {
                var bodyA = bodies.item(i);
                for (var j = i + 1; j < bodies.size(); ++j) {
                    var bodyB = bodies.item(j);
                    if (bodyA.isStatic() && bodyB.isStatic()) {
                        continue;
                    }
                    if (this.testCollision(bodyA, bodyB)) {
                        var pair = this.pairs.get();
                        if (bodyA.id > bodyB.id) {
                            pair.a = bodyA;
                            pair.b = bodyB;
                        } else{
                            pair.a = bodyB;
                            pair.b = bodyA;
                        }
                    }
                }
            }
        };

        Broadphase.prototype.update = function (dt, bodies) {
            // Clear pair list
            this.pairs.clear();
            // Execute broadphase
            this.execute(dt, bodies);
        };

        Broadphase.prototype.size = function () {
            return this.pairs.size();
        };

        Broadphase.prototype.item = function (index) {
            return this.pairs.item(index);
        };

        return Broadphase;
    }
);