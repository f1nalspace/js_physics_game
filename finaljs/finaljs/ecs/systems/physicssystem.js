/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.ecs.systems.PhysicsSystem",
    [
        "final.ecs.System",
        "final.ecs.SystemTypes",
        "final.ecs.ComponentRegister",
        "final.ecs.SystemNotifications",
        "final.ecs.components.TransformComponent",
        "final.ecs.components.ShapeComponent",
        "final.ecs.components.PhysicsComponent",
        "final.physics.PhysicsEngine"
    ],
    function (final, System, SystemTypes, ComponentRegister, SystemNotifications, TransformComponent, ShapeComponent, PhysicsComponent, PhysicsEngine) {
        function PhysicsSystem() {
            System.call(this, SystemTypes.Update);
            this.transformHandle = this.addRequiredComponent(new TransformComponent());
            this.shapeHandle = this.addRequiredComponent(new ShapeComponent());
            this.physicsHandle = this.addRequiredComponent(new PhysicsComponent());
            this.physics = new PhysicsEngine();
            this.world = this.physics.getWorld();
        }

        PhysicsSystem.extend(System);

        PhysicsSystem.prototype.notify = function (entity, msg, payload) {
            switch (msg) {
                case SystemNotifications.ClearedEntities:
                    this.world.clear();
                    break;
                case SystemNotifications.AddedEntity:
                case SystemNotifications.RemovedEntity:
                    var body;
                    var physicsComp = entity.getComponent(this.physicsHandle);
                    var shapeComp = entity.getComponent(this.shapeHandle);
                    var transformComp = entity.getComponent(this.transformHandle);
                    var oldBody = physicsComp.body;
                    if (msg == SystemNotifications.AddedEntity) {
                        body = this.world.add(oldBody.massData.density, oldBody.restitution, oldBody.friction);
                        body.position.setFrom(transformComp.position);
                        body.orientation = transformComp.orientation;
                        body.velocity = oldBody.velocity;
                        body.angularVelocity = oldBody.angularVelocity;
                        body.setShape(shapeComp.shape);
                        body.userData = entity;
                        physicsComp.body = body;
                    } else if (msg == SystemNotifications.RemovedEntity) {
                        this.world.remove(oldBody);
                    }
                    break;
            }

        };

        PhysicsSystem.prototype.update = function (entities, dt) {
            // Simulate physics
            this.physics.step(dt);

            // Set new transformation
            for (var i = 0; i < this.world.size(); i++) {
                var body = this.world.item(i);
                var entity = body.userData;
                var transformComp = entity.getComponent(this.transformHandle);
                transformComp.position.setFrom(body.position);
                transformComp.orientation = body.orientation;
            }
        };

        return PhysicsSystem;
    }
);