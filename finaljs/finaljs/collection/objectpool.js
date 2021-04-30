/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.collection.ObjectPool", function () {
    function ObjectPool(createFunc, applyFunc) {
        var freeList = [];
        var activeList = [];
        var ext = 0.2; // Extend pool bv 20 percent of the capacity
        var capacity = 0;
        return {
            /**
             * Expand the object pool
             * @param count {Number}
             */
            expand: function (count) {
                capacity += count;
                for (var i = 0; i < count; i++) {
                    freeList.push(createFunc());
                }
            },
            /**
             * Grows the pool when capacity has reached max by 10 percent from the current capacity
             * Call init function when exists to "initialize" the object
             * Returns a pooled object
             * @returns {*}
             */
            get: function (x, y) {
                // Grow pool if  required
                if (freeList.length <= 0) {
                    this.expand(Math.max(Math.round(capacity * ext), 1));
                }
                // Get pooled object
                var v = freeList.pop();
                // Init object
                if (typeof v['init'] == "function") {
                    v['init']();
                }
                // Add object to active list
                activeList.push(v);
                // Apply properties from arguments
                if (typeof applyFunc == "function") {
                    applyFunc(v, x, y);
                }
                return v;
            },
            /**
             * Releases the object from the pool
             * @param obj
             */
            release: function (obj) {
                // Add object to free list
                freeList.push(obj);
                // Remove object from active list
                activeList.remove(obj);
            },
            item: function (index) {
                if (activeList.length > 0 && index < activeList.length) {
                    return activeList[index];
                }
                return null;
            },
            size: function () {
                return activeList.length;
            },
            capacity: function () {
                return capacity;
            }
        };
    }
    return ObjectPool;
});