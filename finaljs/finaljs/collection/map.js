/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.collection.Map", function () {
    function Map() {
        var indices = {};
        var values = [];
        var count = 0;
        return {
            /**
             * Inserts the given value with the key into the map
             * @param key
             * @param value
             */
            put: function (key, value) {
                if (typeof indices[key] == "undefined") {
                    indices[key] = count++;
                }
                values[indices[key]] = value;
            },
            /**
             * Returns the value by the given key from the map
             * @param key
             * @returns {*|null}
             */
            get: function (key) {
                if (typeof indices[key] != "undefined") {
                    return values[indices[key]];
                }
                return null;
            },
            remove: function (key) {
                if (typeof indices[key] != "undefined") {
                    values[indices[key]] = undefined;
                    indices[key] = undefined;
                    count--;
                }
            },
            clear: function(){
                for(var i = count; i > 0; i--) {
                    values.pop();
                }
                indices = {};
                count = 0;
            },
            size: function () {
                return count;
            },
            keys: function () {
                return indices;
            },
            values: function () {
                return values;
            },
            containsKey: function (key) {
                return typeof indices[key] != "undefined";
            }
        };
    }
    return Map;
});