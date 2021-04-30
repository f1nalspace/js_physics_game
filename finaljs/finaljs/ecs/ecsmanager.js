/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.ecs.ECSManager",
    [
        "final.collection.List",
        "final.collection.Map",
        "final.collection.ObjectPool",
        "final.ecs.ComponentRegister",
        "final.ecs.System",
        "final.ecs.SystemTypes",
        "final.ecs.Entity",
        "final.ecs.EntityNotifications",
        "final.ecs.SystemNotifications"
    ],
    function (final, List, Map, ObjectPool, ComponentRegister, System, SystemTypes, Entity, EntityNotifications, SystemNotifications) {
        var MAX_SYSTEMS = 10;

        function ECSManager(engine) {
            var impl = {};

            var maxComponentHandles = ComponentRegister.getCount();

            var entities = new ObjectPool(function(){
                return new Entity();
            });

            var systemCount = 0;
            var systems = new Array(MAX_SYSTEMS).fill(null);
            var systemMap = new Map();

            var systemEntitiesList = new Array(MAX_SYSTEMS).fillFunc(List);
            var systemEntitiesMap = new Array(MAX_SYSTEMS).fillFunc(Map);

            var systemUpdateIndices = new Array(MAX_SYSTEMS).fillFunc(-1);
            var updateSystemCount = 0;
            var systemDrawIndices = new Array(MAX_SYSTEMS).fillFunc(-1);
            var drawSystemCount = 0;

            /**
             * Received an notication from an entity
             * @param entity {Entity} The Entity
             * @param msg {number} Message ID
             * @param [payload] {*} An optional data passed
             */
            function notify(entity, msg, payload) {
                var component, system, id, i, j;
                switch (msg) {
                    case EntityNotifications.AddedComponent:
                    case EntityNotifications.RemovedComponent:
                        component = payload;
                        id = entity.getId();
                        if (msg == EntityNotifications.AddedComponent) {
                            final.log("Added component '" + component.getClassName() + "' to entity '" + id + "'");
                        } else {
                            final.log("Removed component '" + component.getClassName() + "' from entity '" + id + "'");
                        }

                        for (i = 0; i < systemCount; i++) {
                            system = systems[i];
                            var k = system.getClassName();

                            // Does entity is already registered in system?
                            var exists = systemEntitiesMap[i].containsKey(id);

                            // Calculate count of found required / interesting components
                            var reqCount = system.getRequiredComponentCount();
                            var c = 0;
                            var d = 0;
                            for (j = 0; j < maxComponentHandles; j++) {
                                if (entity.hasComponent(j)) {
                                    if (system.isRequiredComponentHandle(j, true)) {
                                        c++;
                                    } else if (system.isRequiredComponentHandle(j, false)) {
                                        d++;
                                    }
                                }
                            }

                            // Add entity to system entities map when all requirements are met or at least one interesting component is found
                            // or remove an entity from the system entities map when all required are violated and no interesting components are found
                            if (msg == EntityNotifications.AddedComponent) {
                                if (!exists && (reqCount > 0 ? c >= reqCount : d > 0)) {
                                    final.log("Added entity '" + id + "' to system '" + k + "'");
                                    systemEntitiesMap[i].put(id, entity);
                                    systemEntitiesList[i].add(entity);
                                    system.notify(entity, SystemNotifications.AddedEntity);
                                }
                            } else {
                                if (exists && (reqCount > 0 ? c < reqCount : d < system.getRequiredComponentCount(false))) {
                                    final.log("Removed entity '" + id + "' from system '" + k + "'");
                                    systemEntitiesMap[i].remove(id);
                                    systemEntitiesList[i].remove(entity);
                                    system.notify(entity, SystemNotifications.RemovedEntity);
                                }
                            }
                        }
                        break;
                }
            }

            /**
             * Creates and adds a new entity
             * @returns {Entity}
             */
            function addEntity() {
                final.log("Added entity");
                var entity = entities.get();
                entity.setManager(impl);
                return entity;
            }

            /**
             * Clears all entities from all lists/maps/pools
             */
            function clearEntities(){
                for (var i = 0; i < entities.size(); i++) {
                    var entity = entities.item(i);
                    entities.release(entity);
                    i--;
                }
                for (var j = 0; j < systemCount; j++) {
                    systemEntitiesMap[j].clear();
                    systemEntitiesList[j].clear();
                    var system = systems[j];
                    system.notify(null, SystemNotifications.ClearedEntities);
                }
            }

            /**
             * Adds a system
             * @param system {Object}
             */
            function addSystem(system) {
                if (systemCount >= MAX_SYSTEMS) {
                    throw new Error("Cannot add more systems than " + MAX_SYSTEMS);
                }
                var k = system.getClassName();
                if (systemMap.containsKey(k)) {
                    throw new Error("System '" + k + "' does already exists!");
                }
                systemMap.put(k, system);
                systems[systemCount++] = system;
                final.log("Added system: " + k);

                var i;


                // Resort system indices by priority
                var tmpUpdateSystems = [];
                var tmpDrawSystems = [];
                for (i = 0; i < systemCount; i++) {
                    var system = systems[i];
                    if ((system.type & SystemTypes.Update) == SystemTypes.Update) {
                        tmpUpdateSystems.push(i);
                    } else if ((system.type & SystemTypes.Draw) == SystemTypes.Draw) {
                        tmpDrawSystems.push(i);
                    }
                }
                tmpUpdateSystems.sort(function (a, b) {
                    return systems[a].updatePriority - systems[b].updatePriority;
                });
                tmpDrawSystems.sort(function (a, b) {
                    return systems[a].drawPriority - systems[b].drawPriority;
                });

                // Push sorted indices into the indices map
                updateSystemCount = tmpUpdateSystems.length;
                drawSystemCount = tmpDrawSystems.length;
                for (i = 0; i < updateSystemCount; i++) {
                    systemUpdateIndices[i] = tmpUpdateSystems[i];
                }
                for (i = 0; i < drawSystemCount; i++) {
                    systemDrawIndices[i] = tmpDrawSystems[i];
                }
            }

            /**
             * Initiazes all systems in the order of handles
             * @param dt {number}
             * @param r {CanvasRenderer}
             */
            function init(dt, r) {
                for (var i = 0; i < systemCount; i++) {
                    var system = systems[i];
                    system.init(dt, r);
                }
            }

            /**
             * Updates all system by priority
             * @param dt {number}
             */
            function update(dt) {
                for (var i = 0; i < updateSystemCount; i++) {
                    var index = systemUpdateIndices[i];
                    var system = systems[index];
                    system.update(systemEntitiesList[index], dt);
                }
            }

            /**
             * Draws all system by priority
             * @param r {CanvasRenderer}
             */
            function draw(r) {
                for (var i = 0; i < drawSystemCount; i++) {
                    var index = systemDrawIndices[i];
                    var system = systems[index];
                    system.draw(systemEntitiesList[index], r);
                }
            }

            // Updates implementation map and return it
            return impl = {
                addEntity: addEntity,
                clearEntities: clearEntities,
                notify: notify,
                addSystem: addSystem,
                init: init,
                update: update,
                draw: draw
            };
        }

        return ECSManager;
    }
)
;