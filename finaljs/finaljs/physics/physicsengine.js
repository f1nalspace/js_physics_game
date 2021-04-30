/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.physics.PhysicsEngine",
    [
        "final.Vec2",
        "final.Vec2Pool",
        "final.math",
        "final.collection.ObjectPool",
        "final.physics.shapes.ShapeType",
        "final.physics.shapes.Shape",
        "final.physics.Body",
        "final.physics.World",
        "final.collision.Broadphase",
        "final.collision.Contact",
        "final.collision.ContactList",
        "final.collision.ContactGenerator",
        "final.renderer.BodyRenderer",
        "final.physics.ContactSolver",
        "final.Profiler"
    ],
    function (final, Vec2, Vec2Pool, math, ObjectPool, ShapeType, Shape, Body, World, Broadphase, Contact, ContactList, ContactGenerator, BodyRenderer, ContactSolver, Profiler) {
        function PhysicsEngine() {
            this.world = new World();
            this.broadphase = new Broadphase();
            this.contacts = new ContactList();
            this.contactGenerator = new ContactGenerator();
            this.solver = new ContactSolver();
            this.showContacts = false;
            this.showContactForces = false;
        }

        PhysicsEngine.prototype.getWorld = function () {
            return this.world;
        };

        PhysicsEngine.prototype.createContacts = function () {
            // Clear contact list
            this.contacts.clear();

            // Add contacts from generators
            for (var i = 0; i < this.broadphase.size(); i++) {
                var pair = this.broadphase.item(i);
                this.contactGenerator.generate(pair.a, pair.b, this.contacts);
            }
        };

        PhysicsEngine.prototype.step = function (dt) {
            var i, body;

            // No object so which needs to be process
            if (this.world.size() == 0) return;

            Profiler.begin("Physics step");

            // Add gravity force to dynamic bodies
            Profiler.begin("Integrate forces");
            var gravityForce = Vec2Pool.get();
            for (i = 0; i < this.world.size(); i++) {
                body = this.world.item(i);
                if (!body.isStatic()) {
                    math.vec2MultScalar(gravityForce, this.world.gravity, body.massData.mass);
                    body.addForce(gravityForce);
                }
            }
            Profiler.end();

            // Integrate velocities
            Profiler.begin("Integrate velocity");
            for (i = 0; i < this.world.size(); i++) {
                body = this.world.item(i);
                if (!body.isStatic()) {
                    body.integrateVelocity(dt);
                } else {
                    math.vec2Clone(body.nextPosition, body.position);
                }
            }
            Profiler.end();

            // Detect potential collision pairs (Broadphase)
            Profiler.begin("Broadphase");
            this.broadphase.update(dt, this.world);
            Profiler.end();

            // Create contacts (Middle + Narrowphase)
            Profiler.begin("Create contacts");
            this.createContacts();
            Profiler.end();

            // Initialize velocity contacts
            Profiler.begin("Initialize velocity contacts");
            this.solver.initializeVelocityContacts(dt, this.contacts);
            Profiler.end();

            // Solve velocities
            Profiler.begin("Solve velocity contacts");
            this.solver.solveVelocities(dt, this.contacts);
            Profiler.end();

            // Integrate positions
            Profiler.begin("Integrate position");
            for (i = 0; i < this.world.size(); i++) {
                body = this.world.item(i);
                if (!body.isStatic()) {
                    body.integratePosition(dt);
                }
            }
            Profiler.end();

            // Clear forces
            for (i = 0; i < this.world.size(); i++) {
                body = this.world.item(i);
                body.clearForce(dt);
            }

            Profiler.end();
        };

        PhysicsEngine.prototype.draw = function (r) {
            Profiler.begin("Physics draw");

            var i;

            var dt = 1 / 60;

            for (i = 0; i < this.world.size(); i++) {
                var body = this.world.item(i);
                var color = body.color;
                var shape = body.shape;
                if (shape != null) {
                    switch (shape.type) {
                        case ShapeType.Plane:
                        case ShapeType.HalfSpace:
                            BodyRenderer.drawHalfSpaceOrPlane(r, body.position, shape.normal, shape.size, color);
                            break;
                        case ShapeType.LineSegment:
                            BodyRenderer.drawLineSegment(r, body.position, shape.distance, body.orientation, color);
                            break;
                        case ShapeType.Circle:
                            BodyRenderer.drawCircle(r, body.position, shape.radius, body.orientation, color);
                            break;
                    }
                }
            }

            // Draw contacts
            var normalSize = 10;
            for (i = 0; i < this.contacts.size(); i++) {
                var contact = this.contacts.item(i);
                var normal = contact.normal;
                var tangent = contact.tangent;
                if (this.showContacts) {
                    r.fillArc(contact.contactPoint.x, contact.contactPoint.y, 4, "red");
                    r.drawLine(contact.contactPoint.x, contact.contactPoint.y, contact.contactPoint.x + normal.x * normalSize, contact.contactPoint.y + normal.y * normalSize, "white", 2);
                }
                if (this.showContactForces) {
                    r.drawLine(contact.contactPoint.x, contact.contactPoint.y, contact.contactPoint.x + normal.x * contact.impulse * dt, contact.contactPoint.y + normal.y * contact.impulse * dt, "green", 4);
                    r.drawLine(contact.contactPoint.x, contact.contactPoint.y, contact.contactPoint.x + tangent.x * contact.tangentImpulse * dt, contact.contactPoint.y + tangent.y * contact.tangentImpulse * dt, "aqua", 4);
                }
            }
            Profiler.end();
        };

        return PhysicsEngine;
    }
);