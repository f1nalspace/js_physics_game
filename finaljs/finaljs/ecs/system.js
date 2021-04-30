/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.ecs.System",
    [
        "final.collection.Map",
        "final.ecs.ComponentRegister",
        "final.ecs.SystemTypes"
    ],
    function (final, Map, ComponentRegister, SystemTypes) {
        function System(type){
            this.requiredComponentHandles = new Map();
            this.type = type;
            this.updatePriority = 0;
            this.drawPriority = 0;
        }

        System.prototype.addRequiredComponent = function(comp, req){
            var handle = ComponentRegister.getIndex(comp);
            this.requiredComponentHandles.put(handle, typeof req == "undefined" ? true : req);
            return handle;
        };

        System.prototype.isRequiredComponentHandle = function(handle, check){
            if (this.requiredComponentHandles.containsKey(handle)) {
                return this.requiredComponentHandles.get(handle) == (typeof check == "undefined" ? true : check);
            }
            return false;
        };

        System.prototype.getRequiredComponentCount = function(){
            var c = 0;
            var keys = this.requiredComponentHandles.keys();
            for (var k in keys) {
                if (keys.hasOwnProperty(k)) {
                    if (this.requiredComponentHandles.get(k) == true) {
                        c++;
                    }
                }
            }
            return c;
        };

        System.prototype.init = function(dt, r){
        };

        System.prototype.update = function(entities, dt){
        };

        System.prototype.draw = function(entities, r){
        };

        System.prototype.notify = function(entity, msg, payload){
        };

        return System;
    }
);