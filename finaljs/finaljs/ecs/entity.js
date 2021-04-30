/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.ecs.Entity",
    [
        "final.ecs.ComponentRegister",
        "final.ecs.Component",
        "final.ecs.EntityNotifications"
    ],
    function (final, ComponentRegister, Component, EntityNotifications) {
        var EntityIDCounter = 0;

        function Entity(){
            var id = ++EntityIDCounter;
            var maxComponentHandles = ComponentRegister.getCount();
            var components = new Array(maxComponentHandles).fill(null);
            var ecsMng = null;
            return {
                getId: function(){
                    return id;
                },
                getComponent: function(handle){
                    if (handle > maxComponentHandles){
                        throw new Error("Component handle '"+handle+"' is invalid!");
                    }
                    if (components[handle] == null) {
                        return null;
                    }
                    return components[handle];
                },
                addComponent: function(comp){
                    var handle = ComponentRegister.getIndex(comp);
                    if (handle > maxComponentHandles){
                        throw new Error("Component handle '"+handle+"' is invalid!");
                    }
                    if (components[handle] != null) {
                        throw new Error("Component by handle '"+handle+"' does already exists!");
                    }
                    components[handle] = comp;
                    if (ecsMng != null) {
                        ecsMng.notify(this, EntityNotifications.AddedComponent, comp);
                    }
                    return this;
                },
                removeComponent: function(comp){
                    var handle = ComponentRegister.getIndex(comp);
                    if (handle > maxComponentHandles){
                        throw new Error("Component handle '"+handle+"' is invalid!");
                    }
                    if (components[handle] == null) {
                        throw new Error("No component by handle '"+handle+"' found!");
                    }
                    components[handle] = null;
                    if (ecsMng != null) {
                        ecsMng.notify(this, EntityNotifications.RemovedComponent, comp);
                    }
                    return this;
                },
                removeComponentByHandle: function(handle){
                    if (handle > maxComponentHandles){
                        throw new Error("Component handle '"+handle+"' is invalid!");
                    }
                    var comp = components[handle];
                    return this.removeComponent(comp);
                },
                hasComponent: function(handle){
                    return handle < maxComponentHandles && components[handle] != null;
                },
                setManager: function(mng) {
                    ecsMng = mng;
                },
                init: function(){
                    for (var i = 0; i < maxComponentHandles; i++) {
                        components[i] = null;
                    }
                }
            };
        }
        return Entity;
    }
);