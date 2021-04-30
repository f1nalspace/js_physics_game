/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.physics.World",
    [
        "final.Vec2",
        "final.Vec2Pool",
        "final.math",
        "final.collection.ObjectPool",
        "final.physics.shapes.ShapeType",
        "final.physics.shapes.Shape",
        "final.physics.shapes.HalfSpaceShape",
        "final.physics.shapes.LineSegmentShape",
        "final.physics.shapes.CircleShape",
        "final.physics.Body"
    ],
    function (final, Vec2, Vec2Pool, math, ObjectPool, ShapeType, Shape, HalfSpaceShape, LineSegmentShape, CircleShape, Body) {
        function World() {
            this.bodies = new ObjectPool(function () {
                return new Body();
            });
            this.bodies.expand(1000);
            this.gravity = new Vec2(0, 9.81 * 20);
            this.bodyCounter = 0;
        }

        World.prototype.size = function () {
            return this.bodies.size();
        };

        World.prototype.item = function (index) {
            return this.bodies.item(index);
        };

        World.prototype.add = function (density, restitution, friction) {
            var body = this.bodies.get();
            body.id = this.bodyCounter++;
            body.massData.density = density || 0;
            body.restitution = typeof restitution != "undefined" ? restitution : body.restitution;
            body.friction = (typeof friction != "undefined" ? friction : body.friction);
            return body;
        };

        World.prototype.addCircle = function (radius, density, restitution, friction) {
            return this.add(density, restitution, friction).setShape(new CircleShape(radius));
        };

        World.prototype.addHalfSpace = function (normal, size) {
            return this.add(0, 0, 0).setShape(new HalfSpaceShape(normal, size));
        };

        World.prototype.addLineSegment = function (distance, density, restitution, friction) {
            return this.add(density, restitution, friction).setShape(new LineSegmentShape(distance));
        };

        World.prototype.remove = function (body) {
            this.bodies.release(body);
        };

        World.prototype.clear = function () {
            for (var i = 0; i < this.bodies.size(); i++) {
                this.bodies.release(this.bodies.item(i));
                i--;
            }
        };

        return World;
    }
);