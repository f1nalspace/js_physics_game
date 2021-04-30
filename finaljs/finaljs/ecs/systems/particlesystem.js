/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.ecs.systems.ParticleSystem",
    [
        "final.ecs.System",
        "final.ecs.SystemTypes",
        "final.ecs.SystemNotifications",
        "final.ecs.ComponentRegister",
        "final.ecs.components.ParticleGroupComponent",
        "final.physics.particles.ParticleEngine",
        "final.physics.particles.ParticleGroup"
    ],
    function (final, System, SystemTypes, SystemNotifications, ComponentRegister, ParticleGroupComponent, ParticleEngine, ParticleGroup) {
        function ParticleSystem(){
            System.call(this, SystemTypes.Update);
            this.updatePriority = 10; // Needs to be called after physics system
            this.pgroupHandle = this.addRequiredComponent(new ParticleGroupComponent());
            this.particles = new ParticleEngine();
        }
        ParticleSystem.extend(System);

        ParticleSystem.prototype.notify = function (entity, msg, payload) {
            switch (msg) {
                case SystemNotifications.ClearedEntities:
                    break;
                case SystemNotifications.AddedEntity:
                case SystemNotifications.RemovedEntity:
                    if (msg == SystemNotifications.AddedEntity || msg == SystemNotifications.RemovedEntity) {
                        var groupComponent = entity.getComponent(this.pgroupHandle);
                        if (msg == SystemNotifications.AddedEntity) {
                            groupComponent.group = new ParticleGroup(this.particles);
                        } else if (msg == SystemNotifications.RemovedEntity) {
                            groupComponent.group = null;
                        }
                    }
                    break;

            }
        };

        ParticleSystem.prototype.update = function(entities, dt){
            this.particles.step(dt);
        };

        return ParticleSystem;
    }
);