/**
 * This sample is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.samples.collision.CollisionSampleApp",
    [
        "final.Vec2",
        "final.Vec2Pool",
        "final.math",
        "final.skeleton.SampleApp",
        "final.input.MouseButton",
        "final.collision.ClosestPoints",
        "final.collision.Intersections",
        "final.collision.Contact",
        "final.collision.ContactList",
        "final.collision.ContactGenerator",
        "final.physics.shapes.ShapeType"
    ],
    function (final, Vec2, Vec2Pool, math, SampleApp, MouseButton, ClosestPoints, Intersections, Contact, ContactList, ContactGenerator, ShapeType) {
        var sampleTypes = {
            ClosestPtLineSeg: 1,
            ClosestPtPlaneOrHalfspace: 2,
            ClosestPtAABB: 3,
            ClosestPtOBB: 4,
            ClosestPtCircle: 5,
            IntersectionPtCircle: 10,
            IntersectionCircleCircle: 11,
            IntersectionCircleAABB: 12,
            IntersectionAABBAABB: 13,
            IntersectionAABBHalfSpace: 14,
            IntersectionCircleHalfSpace: 15,
            IntersectionRayAABB: 30,
            IntersectionRayCircle: 31,
            SweptCircleCircle: 50,
            ContactPtCircleCircle: 100,
            ContactPtCircleHalfSpace: 101,
            ContactPtCircleLineSeg: 102,
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

        function CollisionSampleApp(canvas) {
            SampleApp.call(this, canvas);
            this.registerSample(sampleTypes.ClosestPtLineSeg, "Closest point on line segment");
            this.registerSample(sampleTypes.ClosestPtPlaneOrHalfspace, "Closest point on line plane/half-space");
            this.registerSample(sampleTypes.ClosestPtAABB, "Closest point on aabb");
            this.registerSample(sampleTypes.ClosestPtOBB, "Closest point on obb");
            this.registerSample(sampleTypes.ClosestPtCircle, "Closest point on circle");
            this.registerSample(sampleTypes.IntersectionPtCircle, "Intersection point in circle");
            this.registerSample(sampleTypes.IntersectionCircleCircle, "Intersection circle in circle");
            this.registerSample(sampleTypes.IntersectionCircleAABB, "Intersection circle in aabb");
            this.registerSample(sampleTypes.IntersectionAABBAABB, "Intersection aabb in aabb");
            this.registerSample(sampleTypes.IntersectionAABBHalfSpace, "Intersection aabb in half-space");
            this.registerSample(sampleTypes.IntersectionCircleHalfSpace, "Intersection circle in half-space");
            this.registerSample(sampleTypes.IntersectionRayAABB, "Intersection ray and aabb");
            this.registerSample(sampleTypes.IntersectionRayCircle, "Intersection ray and circle");
            this.registerSample(sampleTypes.ContactPtCircleCircle, "Contact point to circle to circle");
            this.registerSample(sampleTypes.ContactPtCircleHalfSpace, "Contact point to circle to half-space");
            this.registerSample(sampleTypes.ContactPtCircleLineSeg, "Contact point to circle to line segment");
            //this.registerSample(sampleTypes.SweptCircleCircle, "Swept test circle to circle");
            this.setSample(sampleTypes.ContactPtCircleCircle);
            this.position = new Vec2(50, 50);
            this.centerRadius = 10;
            this.mouseDown = false;
            this.mouseStart = new Vec2(-1, -1);
            this.dotRadius = 4;
            this.contactList = new ContactList();
            this.contactGen = new ContactGenerator();
        }

        CollisionSampleApp.extend(SampleApp);

        CollisionSampleApp.prototype.update = function (dt, w, h) {
            SampleApp.prototype.update.call(this, dt, w, h);

            this.contactList.clear();

            if (this.mouse.isMouseDown(MouseButton.Left)) {
                if (!this.mouseDown) {
                    if (Intersections.isPointInCircle(this.mousePos, this.position, this.centerRadius)) {
                        this.mouseDown = true;
                        math.vec2Clone(this.mouseStart, this.mousePos);
                    }
                } else {
                    this.position.x += this.mousePos.x - this.mouseStart.x;
                    this.position.y += this.mousePos.y - this.mouseStart.y;
                    math.vec2Clone(this.mouseStart, this.mousePos);
                }
            } else {
                if (this.mouseDown) {
                    this.mouseDown = false;
                }
            }
        };

        CollisionSampleApp.prototype.drawClosestPtLineSeg = function (r, w, h) {
            var line = {
                a: Vec2Pool.get(-200, 0),
                b: Vec2Pool.get(200, 100)
            };

            var p = this.position;

            var closest = Vec2Pool.get();
            ClosestPoints.closestPointOnLineSegment(closest, p, line.a, line.b);

            // Draw geometry line
            r.drawLine(line.b.x, line.b.y, line.a.x, line.a.y, "yellow", 2);

            // Draw point to closest line
            r.drawLine(p.x, p.y, closest.x, closest.y, "blue", 2);

            // Draw point
            r.fillArc(p.x, p.y, this.dotRadius, "green");

            // Draw line points A and B
            r.fillArc(line.a.x, line.a.y, this.dotRadius, "red");
            r.fillArc(line.b.x, line.b.y, this.dotRadius, "red");

            // Draw closest point
            r.fillArc(closest.x, closest.y, this.dotRadius, "white", 2);

            // Draw text
            r.fillText(line.a.x, line.a.y, "A", "white", "center", "bottom");
            r.fillText(line.b.x, line.b.y, "B", "white", "center", "bottom");
            r.fillText(p.x, p.y, "C", "white", "center", "bottom");
        };

        CollisionSampleApp.prototype.drawClosestPtPlaneOrHalfspace = function (r, w, h) {
            var plane = {
                position: Vec2Pool.get(0, -1 * -50),
                normal: Vec2Pool.get(0, -1),
                size: 200
            };
            math.vec2UnitRotate(plane.normal, math.deg2rad(-65));

            var p = this.position;

            var closest = Vec2Pool.get();
            ClosestPoints.closestPointOnPlaneOrHalfSpace(closest, p, plane.normal, plane.position);

            var pC = Vec2Pool.get();
            math.vec2Clone(pC, plane.position);
            r.fillArc(pC.x, pC.y, this.dotRadius, "red");

            var tangent = Vec2Pool.get();
            math.vec2PerpRight(tangent, plane.normal);

            var a = Vec2Pool.get();
            var b = Vec2Pool.get();
            math.vec2AddMultScalar(a, pC, tangent, -plane.size);
            math.vec2AddMultScalar(b, pC, tangent, plane.size);

            // Draw geometry line
            r.drawLine(b.x, b.y, a.x, a.y, "yellow", 2);
            r.drawNormal(pC.x, pC.y, plane.normal.x, plane.normal.y, "white", 1, 50);

            // Draw point to closest line
            r.drawLine(p.x, p.y, closest.x, closest.y, "blue", 2);

            // Draw point
            r.fillArc(p.x, p.y, this.dotRadius, "green");

            // Draw closest point
            r.fillArc(closest.x, closest.y, this.dotRadius, "white", 2);
        };

        CollisionSampleApp.prototype.drawClosestPtAABB = function (r, w, h) {
            var aabb = {
                position: Vec2Pool.get(-20, 50),
                ext: Vec2Pool.get(120, 70)
            };

            var p = this.position;

            var closest = Vec2Pool.get();
            ClosestPoints.closestPointOnAABB(closest, p, aabb.position, aabb.ext);

            // Draw geometry rect
            r.push();
            r.translate(aabb.position.x, aabb.position.y);
            r.strokeRect(-aabb.ext.x, -aabb.ext.y, aabb.ext.x * 2, aabb.ext.y * 2, "yellow", 2);
            r.pop();

            // Draw point to closest line
            r.drawLine(p.x, p.y, closest.x, closest.y, "blue", 2);

            // Draw point
            r.fillArc(p.x, p.y, this.dotRadius, "green");

            // Draw closest point
            r.fillArc(closest.x, closest.y, this.dotRadius, "white", 2);
        };

        CollisionSampleApp.prototype.drawClosestPtOBB = function (r, w, h) {
            var obb = {
                position: Vec2Pool.get(-20, 50),
                ext: Vec2Pool.get(120, 70),
                angle: 30,
                axisX: Vec2Pool.get(),
                axisY: Vec2Pool.get()
            };
            math.vec2UnitRotate(obb.axisX, math.deg2rad(obb.angle));
            math.vec2PerpRight(obb.axisY, obb.axisX);

            var p = this.position;

            var closest = Vec2Pool.get();
            ClosestPoints.closestPointOnOBB(closest, p, obb.position, obb.ext, obb.axisX, obb.axisY);

            // Draw rotated geometry rect
            r.push();
            r.translate(obb.position.x, obb.position.y);
            r.rotate(math.deg2rad(obb.angle));
            r.strokeRect(-obb.ext.x, -obb.ext.y, obb.ext.x * 2, obb.ext.y * 2, "yellow", 2);
            r.pop();

            // Draw point to closest line
            r.drawLine(p.x, p.y, closest.x, closest.y, "blue", 2);

            // Draw point
            r.fillArc(p.x, p.y, this.dotRadius, "green");

            // Draw closest point
            r.fillArc(closest.x, closest.y, this.dotRadius, "white", 2);
        };

        CollisionSampleApp.prototype.drawClosestPtCircle = function (r, w, h) {
            var circle = {
                position: Vec2Pool.get(-20, 50),
                radius: 70
            };

            var p = this.position;

            var closest = Vec2Pool.get();
            ClosestPoints.closestPointOnCircle(closest, p, circle.position, circle.radius);

            // Draw circle
            r.strokeArc(circle.position.x, circle.position.y, circle.radius, "yellow", 2);

            // Draw point to closest line
            r.drawLine(p.x, p.y, closest.x, closest.y, "blue", 2);

            // Draw point
            r.fillArc(p.x, p.y, this.dotRadius, "green");

            // Draw closest point
            r.fillArc(closest.x, closest.y, this.dotRadius, "white", 2);
        };

        CollisionSampleApp.prototype.drawIntersectionPtCircle = function (r, w, h) {
            var circle = {
                position: Vec2Pool.get(-20, 50),
                radius: 70
            };

            var p = this.position;

            var intersects = Intersections.isPointInCircle(p, circle.position, circle.radius);

            // Draw circle
            r.strokeArc(circle.position.x, circle.position.y, circle.radius, intersects ? "red" : "yellow", 2);

            // Draw point
            r.fillArc(p.x, p.y, this.dotRadius, "green");
        };

        CollisionSampleApp.prototype.drawIntersectionCircleCircle = function (r, w, h) {
            var circle = {
                position: Vec2Pool.get(-20, 50),
                radius: 70
            };

            var p = this.position;

            var intersects = Intersections.isCircleInCircle(p, this.centerRadius * 4, circle.position, circle.radius);

            // Draw circle
            r.strokeArc(circle.position.x, circle.position.y, circle.radius, intersects ? "red" : "yellow", 2);

            // Draw point / circle
            r.strokeArc(p.x, p.y, this.centerRadius * 4, "green", 2);
            r.fillArc(p.x, p.y, this.dotRadius, "green");
        };

        CollisionSampleApp.prototype.drawIntersectionCircleAABB = function (r, dt, w, h) {
            var aabb = {
                position: Vec2Pool.get(-80, 50),
                ext: Vec2Pool.get(70, 90),
                vel: Vec2Pool.get(0, 0)
            };

            var circle = {
                position: this.position,
                radius: this.centerRadius * 4,
                vel: Vec2Pool.get(0, 0)
            };

            circle.vel.x = (aabb.position.x - circle.position.x) / dt / dt * 0.25;
            circle.vel.y = (aabb.position.y - circle.position.y) / dt / dt * 0.25;

            var closest = Vec2Pool.get();
            ClosestPoints.closestPointOnAABB(closest, circle.position, aabb.position, aabb.ext);

            var circleCenterToClosest = Vec2Pool.get();
            math.vec2Sub(circleCenterToClosest, closest, circle.position);
            var axis = [Vec2Pool.get(1, 0), Vec2Pool.get(0, 1)];
            if (math.vec2LengthSquared(circleCenterToClosest) > 0) {
                var circleNormal = Vec2Pool.get();
                math.vec2Normalize(circleNormal, circleCenterToClosest);
                axis.push(circleNormal);
            }

            var normal = Vec2Pool.get();

            var relOffset = Vec2Pool.get();
            math.vec2Sub(relOffset, circle.position, aabb.position);

            var relVel = Vec2Pool.get();
            math.vec2Sub(relVel, circle.vel, aabb.vel);

            var index = -1;
            var collisionDistance = null;

            for (var i = 0; i < axis.length; i++) {
                var n = axis[i];

                var d = math.vec2Dot(relOffset, n);

                var projCircle = Vec2Pool.get();
                projCircle.x = -circle.radius + d;
                projCircle.y = +circle.radius + d;

                var projAABB = Vec2Pool.get();
                var p = Math.abs(math.vec2Dot(axis[0], n)) * aabb.ext.x + Math.abs(math.vec2Dot(axis[1], n)) * aabb.ext.y;
                projAABB.x = -p;
                projAABB.y = +p;

                var d0 = projAABB.x - projCircle.y;
                var d1 = projCircle.x - projAABB.y;
                var overlap = d0 > d1 ? d0 : d1;
                if (d0 > 0 || d1 > 0) {
                    // Separation found - early out
                    index = -1;
                    break;
                }

                if (index == -1 || overlap > collisionDistance) {
                    index = i;
                    collisionDistance = overlap;
                    math.vec2Clone(normal, n);
                }
            }

            var intersects = false;
            if (index > -1) {
                intersects = collisionDistance < 0;
                // Make sure the collision normal is always pushing away
                if (math.vec2Dot(normal, relOffset) < 0) {
                    math.vec2MultScalar(normal, normal, -1);
                }
            }

            // Draw aabb
            r.strokeRect(aabb.position.x - aabb.ext.x, aabb.position.y - aabb.ext.y, aabb.ext.x * 2, aabb.ext.y * 2, intersects ? "red" : "yellow", 2);

            // Draw point / circle
            r.strokeArc(circle.position.x, circle.position.y, circle.radius, "green", 2);
            r.fillArc(circle.position.x, circle.position.y, this.dotRadius, "green");
        };

        CollisionSampleApp.prototype.drawIntersectionAABBAABB = function (r, dt, w, h) {
            var aabbA = {
                position: Vec2Pool.get(-80, 50),
                ext: Vec2Pool.get(70, 90),
                vel: Vec2Pool.get(0, 0)
            };

            var aabbB = {
                position: this.position,
                ext: Vec2Pool.get(120, 40),
                vel: Vec2Pool.get(0, 0)
            };

            var intersects = Intersections.isAABBInAABB(aabbB.position, aabbB.ext, aabbA.position, aabbA.ext);

            // Draw aabb
            r.strokeRect(aabbA.position.x - aabbA.ext.x, aabbA.position.y - aabbA.ext.y, aabbA.ext.x * 2, aabbA.ext.y * 2, intersects ? "red" : "yellow", 2);
            r.strokeRect(aabbB.position.x - aabbB.ext.x, aabbB.position.y - aabbB.ext.y, aabbB.ext.x * 2, aabbB.ext.y * 2, "green");

            // Draw point
            r.fillArc(aabbB.position.x, aabbB.position.y, this.dotRadius, "green");
        };

        CollisionSampleApp.prototype.drawIntersectionAABBHalfSpace = function (r, dt, w, h) {
            var aabb = {
                position: this.position,
                ext: Vec2Pool.get(70, 90),
                vel: Vec2Pool.get(0, 0)
            };

            var halfSpace = {
                position: Vec2Pool.get(0, 100),
                normal: Vec2Pool.get(0, -1),
                size: 200
            };
            math.vec2UnitRotate(halfSpace.normal, math.deg2rad(-65));

            var intersects = Intersections.isAABBInHalfSpace(aabb.position, aabb.ext, halfSpace.normal, halfSpace.position);

            // Draw aabb
            r.strokeRect(aabb.position.x - aabb.ext.x, aabb.position.y - aabb.ext.y, aabb.ext.x * 2, aabb.ext.y * 2, intersects ? "red" : "yellow", 2);

            var pC = Vec2Pool.get();
            math.vec2Clone(pC, halfSpace.position);
            r.fillArc(pC.x, pC.y, this.dotRadius, "red");

            var tangent = Vec2Pool.get();
            math.vec2PerpRight(tangent, halfSpace.normal);

            var a = Vec2Pool.get();
            var b = Vec2Pool.get();
            math.vec2AddMultScalar(a, pC, tangent, -halfSpace.size);
            math.vec2AddMultScalar(b, pC, tangent, halfSpace.size);

            // Draw geometry line
            r.drawLine(b.x, b.y, a.x, a.y, "yellow", 2);
            r.drawNormal(pC.x, pC.y, halfSpace.normal.x, halfSpace.normal.y, "white", 1, 50);

            // Draw point
            r.fillArc(aabb.position.x, aabb.position.y, this.dotRadius, "green");
        };

        CollisionSampleApp.prototype.drawIntersectionCircleHalfSpace = function (r, dt, w, h) {
            var circle = {
                position: this.position,
                radius: 70
            };

            var plane = {
                position: Vec2Pool.get(0, 100),
                normal: Vec2Pool.get(0, -1),
                size: 200
            };
            math.vec2UnitRotate(plane.normal, math.deg2rad(-65));

            var intersects = Intersections.isCircleInHalfSpace(circle.position, circle.radius, plane.normal, plane.position);

            // Draw aabb
            r.strokeArc(circle.position.x, circle.position.y, circle.radius, intersects ? "red" : "green", 2);

            var pC = Vec2Pool.get();
            math.vec2Clone(pC, plane.position);
            r.fillArc(pC.x, pC.y, this.dotRadius, "red");

            var tangent = Vec2Pool.get();
            math.vec2PerpRight(tangent, plane.normal);

            var a = Vec2Pool.get();
            var b = Vec2Pool.get();
            math.vec2AddMultScalar(a, pC, tangent, -plane.size);
            math.vec2AddMultScalar(b, pC, tangent, plane.size);

            // Draw geometry line
            r.drawLine(b.x, b.y, a.x, a.y, "yellow", 2);
            r.drawNormal(pC.x, pC.y, plane.normal.x, plane.normal.y, "white", 1, 50);

            // Draw point
            r.fillArc(circle.position.x, circle.position.y, this.dotRadius, "green");
        };

        CollisionSampleApp.prototype.drawContacts = function(r) {
            // Draw contacts
            for (var i = 0; i < this.contactList.size(); i++) {
                var contact = this.contactList.item(i);
                r.fillArc(contact.contactPoint.x, contact.contactPoint.y, this.dotRadius, "red");
                r.drawNormal(contact.contactPoint.x, contact.contactPoint.y, contact.normal.x, contact.normal.y, "white", 2, 40);
                r.drawLine(contact.contactPoint.x, contact.contactPoint.y, contact.contactPoint.x - contact.normal.x * contact.penetration, contact.contactPoint.y - contact.normal.y * contact.penetration, "red", 2);
            }
        };

        CollisionSampleApp.prototype.drawContactPtCircleCircle = function (r, dt, w, h) {
            var circleA = {
                position: Vec2Pool.get(),
                nextPosition: Vec2Pool.get(),
                shape: {
                    type: ShapeType.Circle,
                    radius: 70
                }
            };
            math.vec2Set(circleA.position, 0, 0);
            math.vec2Set(circleA.nextPosition, 0, 0);

            var circleB = {
                position: this.position,
                nextPosition: this.position,
                shape: {
                    type: ShapeType.Circle,
                    radius: 50
                }
            };

            // Calculate contacts
            this.contactList.clear();
            var contactCount = this.contactGen.generate(circleA, circleB, this.contactList);

            // Draw point
            r.fillArc(circleB.position.x, circleB.position.y, this.dotRadius, "green");

            // Draw circles
            r.strokeArc(circleA.position.x, circleA.position.y, circleA.shape.radius, "yellow");
            r.strokeArc(circleB.position.x, circleB.position.y, circleB.shape.radius, contactCount > 0 ? "red" : "yellow");

            // Draw contacts
            this.drawContacts(r);
        };

        CollisionSampleApp.prototype.drawContactPtCircleHalfSpace = function (r, dt, w, h) {
            var circle = {
                position: this.position,
                nextPosition: this.position,
                velocity: Vec2Pool.get(),
                shape: {
                    type: ShapeType.Circle,
                    radius: 70
                }
            };

            var plane = {
                position: Vec2Pool.get(),
                nextPosition: Vec2Pool.get(),
                velocity: Vec2Pool.get(),
                shape: {
                    type: ShapeType.HalfSpace,
                    normal: Vec2Pool.get(),
                    size: 200
                }
            };
            var normal = plane.shape.normal;
            math.vec2UnitRotate(normal, math.deg2rad(-65));
            math.vec2MultScalar(plane.position, normal, -50);
            math.vec2Clone(plane.nextPosition, plane.position);

            var pC = Vec2Pool.get();
            math.vec2Clone(pC, plane.position);
            r.fillArc(pC.x, pC.y, this.dotRadius, "red");

            var tangent = Vec2Pool.get();
            math.vec2PerpRight(tangent, normal);

            var a = Vec2Pool.get();
            var b = Vec2Pool.get();
            math.vec2AddMultScalar(a, pC, tangent, -plane.shape.size);
            math.vec2AddMultScalar(b, pC, tangent, plane.shape.size);

            // Calculate contacts
            this.contactList.clear();
            var contactCount = this.contactGen.generate(circle, plane, this.contactList);

            // Draw geometry line
            r.drawLine(b.x, b.y, a.x, a.y, "yellow", 2);

            // Draw point
            r.fillArc(circle.position.x, circle.position.y, this.dotRadius, "green");

            // Draw circles
            r.strokeArc(circle.position.x, circle.position.y, circle.shape.radius, contactCount > 0 ? "red" : "yellow");

            // Draw contacts
            this.drawContacts(r);
        };

        CollisionSampleApp.prototype.drawContactPtCircleLineSeg = function (r, dt, w, h) {
            var circleBody = {
                position: this.position,
                nextPosition: this.position,
                velocity: Vec2Pool.get(),
                shape: {
                    type: ShapeType.Circle,
                    radius: 70
                }
            };

            var lineBody = {
                position: Vec2Pool.get(0, 50),
                nextPosition: Vec2Pool.get(),
                velocity: Vec2Pool.get(),
                orientation: math.deg2rad(25),
                shape: {
                    type: ShapeType.LineSegment,
                    distance: 200
                }
            };
            math.vec2Clone(lineBody.nextPosition, lineBody.position);

            var line = lineBody.shape;
            var circle = circleBody.shape;

            var a = Vec2Pool.get();
            var b = Vec2Pool.get();
            var ax = Math.cos(lineBody.orientation) * line.distance;
            var ay = Math.sin(lineBody.orientation) * line.distance;
            math.vec2Set(a, lineBody.position.x - ax, lineBody.position.y - ay);
            math.vec2Set(b, lineBody.position.x + ax, lineBody.position.y + ay);

            // Calculate contacts
            this.contactList.clear();
            var contactCount = this.contactGen.generate(lineBody, circleBody, this.contactList);

            // Draw point
            r.fillArc(circleBody.position.x, circleBody.position.y, this.dotRadius, "green");

            // Draw circles
            r.strokeArc(circleBody.position.x, circleBody.position.y, circle.radius, contactCount > 0 ? "red" : "yellow");

            // Draw line points A and B
            r.drawLine(b.x, b.y, a.x, a.y, "yellow", 2);

            // Draw contacts
            this.drawContacts(r);
        };

        CollisionSampleApp.prototype.drawSweptCircleCircle = function (r, dt, w, h) {
            var circle = {
                position: this.position,
                radius: 70,
                velocity: Vec2Pool.get(-120, 130)
            };

            var otherCircle = {
                position: Vec2Pool.get(),
                radius: 120
            };

            var circlePrevPos = Vec2Pool.get();
            math.vec2Clone(circlePrevPos, circle.position);

            var circleNextPos = Vec2Pool.get();
            math.vec2Add(circleNextPos, circle.position, circle.velocity);

            var diff = Vec2Pool.get();
            math.vec2Sub(diff, circleNextPos, circlePrevPos);

            var aabb = {
                position: Vec2Pool.get(),
                ext: Vec2Pool.get()
            };

            aabb.position.x = circlePrevPos.x + diff.x * 0.5;
            aabb.position.y = circlePrevPos.y + diff.y * 0.5;
            aabb.ext.x = Math.abs(diff.x) * 0.5 + circle.radius;
            aabb.ext.y = Math.abs(diff.y) * 0.5 + circle.radius;

            r.fillArc(circlePrevPos.x, circlePrevPos.y, this.dotRadius, "green");
            r.strokeArc(circlePrevPos.x, circlePrevPos.y, circle.radius, "yellow");
            r.strokeArc(circleNextPos.x, circleNextPos.y, circle.radius, "orange");

            r.strokeRect(aabb.position.x - aabb.ext.x, aabb.position.y - aabb.ext.y, aabb.ext.x * 2, aabb.ext.y * 2, "aqua", 2);

            var intersects = Intersections.isCircleInAABB(otherCircle.position, otherCircle.radius, aabb.position, aabb.ext);
            r.strokeArc(otherCircle.position.x, otherCircle.position.y, otherCircle.radius, intersects ? "red" : "yellow", 2);
        };

        CollisionSampleApp.prototype.drawIntersectionRayAABB = function (r, dt, w, h) {
            var ray = {
                start: Vec2Pool.get(-w * 0.3, h * 0.3),
                end: this.position,
                distance: Vec2Pool.get()
            };
            math.vec2Sub(ray.distance, ray.end, ray.start);

            var aabb = {
                position: Vec2Pool.get(0, 50),
                ext: Vec2Pool.get(120, 70)
            };

            r.strokeRect(aabb.position.x - aabb.ext.x, aabb.position.y - aabb.ext.y, aabb.ext.x * 2, aabb.ext.y * 2, "yellow", 2);

            r.drawLine(ray.start.x, ray.start.y, ray.end.x, ray.end.y, "aqua", 2);
            r.fillArc(ray.end.x, ray.end.y, this.dotRadius, "red");

            var intersectionPoint = Vec2Pool.get();
            var intersectionTime = Vec2Pool.get();
            if (Intersections.intersectRayAABB(ray.start, ray.distance, aabb.position, aabb.ext, 1.0, intersectionTime, intersectionPoint)) {
                r.fillArc(intersectionPoint.x, intersectionPoint.y, this.dotRadius, "blue");
            }
        };

        CollisionSampleApp.prototype.drawIntersectionRayCircle = function (r, dt, w, h) {
            var ray = {
                start: Vec2Pool.get(-w * 0.4, h * 0.4),
                end: this.position,
                distance: Vec2Pool.get()
            };
            math.vec2Sub(ray.distance, ray.end, ray.start);

            var circle = {
                position: Vec2Pool.get(0, 0),
                radius: 70
            };

            r.fillArc(circle.position.x, circle.position.y, this.dotRadius, "yellow");
            r.strokeArc(circle.position.x, circle.position.y, circle.radius, "yellow");

            r.drawLine(ray.start.x, ray.start.y, ray.end.x, ray.end.y, "aqua", 2);
            r.fillArc(ray.end.x, ray.end.y, this.dotRadius, "red");

            var intersectionPoint = Vec2Pool.get();
            var intersectionTime = Vec2Pool.get();
            if (Intersections.intersectRayCircle(ray.start, ray.distance, circle.position, circle.radius, 1.0, intersectionTime, intersectionPoint)) {
                r.fillArc(intersectionPoint.x, intersectionPoint.y, this.dotRadius, "blue");
            }

        };

        CollisionSampleApp.prototype.drawSample = function (id, r, dt, w, h) {
            var func = this["draw" + sampleTypes.getKeyByValue(id)];
            if (typeof func == "function") {
                func.call(this, r, dt, w, h);
            }
        };

        return CollisionSampleApp;
    }
);