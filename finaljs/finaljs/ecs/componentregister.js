/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.ecs.ComponentRegister",
    [
        "final.collection.Map"
    ],
    function (final, Map) {
        var componentClassCounter = 0;
        var nameToIndex = new Map;

        /**
         * Register a new component with its class name
         * @param obj {Object}
         */
        function register(obj){
            var k = obj.getClassName();
            if (nameToIndex.containsKey(k)) {
                throw new Error("Component class '"+k+"' is already registered!");
            }
            nameToIndex.put(k, componentClassCounter++);
            final.log("Registered component class: " + k);
        }

        /**
         * Returns the given component handle for the component
         * Will be determined by the class name of the object
         * @param obj
         * @returns {number}
         */
        function getIndex(obj){
            var k = obj.getClassName();
            if (!nameToIndex.containsKey(k)) {
                throw new Error("There is no component class registered for '"+k+"'");
            }
            return nameToIndex.get(k);
        }

        /**
         * Returns the current registered component count
         * @returns {number}
         */
        function getCount(){
            return componentClassCounter;
        }

        return {
            register: register,
            getIndex: getIndex,
            getCount: getCount
        };
    }
);