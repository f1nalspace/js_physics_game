"use strict";
final.module("final.collision.ContactGenerator",
    [
        "final.Vec2Pool",
        "final.math",
        "final.collision.ClosestPoints",
        "final.collision.Intersections",
        "final.collision.Contact",
        "final.collision.ContactList",
        "final.physics.Body",
        "final.physics.shapes.Shape",
        "final.physics.shapes.ShapeType"
    ],
    function (final, Vec2Pool, math, ClosestPoints, Intersections, Contact, ContactList, Body, Shape, ShapeType) {
        function flipContacts(list, count) {
            if (count > 0) {
                for (var i = list.size()-1; i > list.size()-1-count; i--){
                    var contact = list.item(i);
                    math.vec2MultScalar(contact.normal, contact.normal, -1);
                    var tmp = contact.bodyA;
                    contact.bodyA = contact.bodyB;
                    contact.bodyB = tmp;
                }
            }
            return count;
        }

        function createContactCircleToCircle(circleA, circleB, list) {
            var aCircleShape = circleA.shape;
            var bCircleShape = circleB.shape;
            var radii = aCircleShape.radius + bCircleShape.radius;

            var relPos = Vec2Pool.get();
            math.vec2Sub(relPos, circleB.position, circleA.position);
            var distanceSquared = math.vec2LengthSquared(relPos);
            if (distanceSquared > radii * radii) {
                return 0;
            }

            var distance = Math.sqrt(distanceSquared);
            var contact = list.add();
            contact.bodyA = circleA;
            contact.bodyB = circleB;

            if (distance == 0.0) {
                contact.penetration = aCircleShape.radius;
                math.vec2Set(contact.normal, 1, 0);
                math.vec2Set(contact.contactPoint, circleA.position.x, circleA.position.y);
            } else {
                contact.penetration = -(radii - distance);
                math.vec2MultScalar(contact.normal, relPos, 1 / distance);
                var contactA = Vec2Pool.get();
                var contactB = Vec2Pool.get();
                var contactDistance = Vec2Pool.get();
                math.vec2AddMultScalar(contactA, circleA.position, contact.normal, aCircleShape.radius);
                math.vec2AddMultScalar(contactB, circleB.position, contact.normal, -bCircleShape.radius);
                math.vec2Sub(contactDistance, contactB, contactA);
                math.vec2Set(contact.contactPoint, contactA.x + contactDistance.x * 0.5, contactA.y + contactDistance.y * 0.5);
            }
            return 1;
        }

        function createContactHalfSpaceToCircle(halfspace, circle, list) {
            var circleShape = circle.shape;
            var halfspaceShape = halfspace.shape;
            var normal = halfspaceShape.normal;
            var circlePos = circle.position;

            var sub = Vec2Pool.get();
            math.vec2Sub(sub, halfspace.position, circlePos);
            var proj = -math.vec2Dot(normal, sub);
            if (proj > circleShape.radius) {
                return 0;
            }

            var contact = list.add();
            contact.bodyA = halfspace;
            contact.bodyB = circle;
            contact.penetration = -(circleShape.radius - proj);
            math.vec2MultScalar(contact.normal, normal, 1);
            math.vec2AddMultScalar(contact.contactPoint, circlePos, normal, -proj);
            return 1;
        }

        function createContactCircleToHalfSpace(a, b, list) {
            return flipContacts(list, createContactHalfSpaceToCircle(b, a, list));
        }

        function createContactCircleToLineSegment(circle, lineSegment, list) {
            var circleShape = circle.shape;
            var lineSegmentShape = lineSegment.shape;

            var pax = Math.cos(lineSegment.orientation) * lineSegmentShape.distance;
            var pay = Math.sin(lineSegment.orientation) * lineSegmentShape.distance;

            var pa = Vec2Pool.get();
            var pb = Vec2Pool.get();
            math.vec2Set(pa, lineSegment.position.x - pax, lineSegment.position.y - pay);
            math.vec2Set(pb, lineSegment.position.x + pax, lineSegment.position.y + pay);

            var ab = Vec2Pool.get();
            var ac = Vec2Pool.get();
            math.vec2Sub(ab, pb, pa);
            math.vec2Sub(ac, circle.position, pa);

            var closest = Vec2Pool.get();
            var t = math.vec2Dot(ac, ab) / math.vec2LengthSquared(ab);

            var normal = Vec2Pool.get();
            math.vec2AddMultScalar(closest, pa, ab, Math.max(Math.min(t, 1), 0));

            var distance = Vec2Pool.get();
            math.vec2Sub(distance, circle.position, closest);

            math.vec2Normalize(normal, distance);

            var proj = math.vec2Dot(normal, distance);
            if (proj > circleShape.radius) {
                return 0;
            }

            var contact = list.add();
            contact.bodyA = lineSegment;
            contact.bodyB = circle;
            contact.penetration = -(circleShape.radius - proj);
            math.vec2Clone(contact.normal, normal);
            math.vec2Clone(contact.contactPoint, closest);
            return 1;
        }

        function createContactLineSegmentToCircle(a, b, list) {
            return flipContacts(list, createContactCircleToLineSegment(b, a, list));
        }

        var contactFunctions = [];

        function addContactFunction(typeA, typeB, func) {
            if (typeof contactFunctions[typeA] == "undefined") {
                contactFunctions[typeA] = [];
            }
            contactFunctions[typeA][typeB] = func;
        }

        addContactFunction(ShapeType.Circle,ShapeType.Circle, createContactCircleToCircle);
        addContactFunction(ShapeType.Circle,ShapeType.HalfSpace, createContactCircleToHalfSpace);
        addContactFunction(ShapeType.HalfSpace,ShapeType.Circle, createContactHalfSpaceToCircle);
        addContactFunction(ShapeType.Circle,ShapeType.LineSegment, createContactCircleToLineSegment);
        addContactFunction(ShapeType.LineSegment,ShapeType.Circle, createContactLineSegmentToCircle);

        function ContactGenerator() {
        }

        /**
         * Generates contacts for the given bodies and pushes these into the list
         * @param bodyA {Body}
         * @param bodyB {Body}
         * @param list {ContactList}
         */
        ContactGenerator.prototype.generate = function (bodyA, bodyB, list) {
            var entryA = contactFunctions[bodyA.shape.type];
            if (typeof entryA != "undefined") {
                var contactFunc = entryA[bodyB.shape.type];
                if (typeof contactFunc != "undefined") {
                    return contactFunc(bodyA, bodyB, list);
                }
            }
            return 0;
        };
        return ContactGenerator;
    }
);