/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.collection.List", function() {
    function List(initialCapacity) {
        var items = [];
        var capacity = 0;
        var used = 0;
        var ext = 0.1; // Extend item pool by 10 percent of the capacity
        var alloc = function (count) {
            capacity += count;
            for (var i = used; i < capacity; i++) {
                items[i] = null;
            }
        };
        if (typeof initialCapacity != "undefined" && initialCapacity != null) {
            alloc(initialCapacity);
        }
        return {
            /**
             * Adds the given object to to the list and returns it
             * @param obj {*}
             * @returns {*}
             */
            add: function (obj) {
                // Grow pool if required
                if (used >= capacity) {
                    alloc(Math.max(capacity * ext | 0, 1));
                }

                // Add object to pool
                items[used++] = obj;
                return obj;
            },
            remove: function(obj) {
                items.remove(obj);
            },
            /**
             * Returns the given item by index
             * @param index {number}
             * @returns {*|null}
             */
            item: function (index) {
                if (used > 0 && index < used) {
                    return items[index];
                }
                return null;
            },
            /**
             * Returns the number of items in the list
             * @returns {number}
             */
            size: function () {
                return used;
            },
            /**
             * Clears the list
             */
            clear: function () {
                var l = items.length;
                for (var i = 0; i < l; i++) {
                    items[i] = null;
                }
                used = 0;
            }
        };
    }
    return List;
});