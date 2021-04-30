/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
final.module("final.collection.Pool", function() {
    function Pool(createFunc, applyFunc) {
        var pool = [];
        var capacity = 0;
        var used = 0;
        var ext = 0.2; // Extend pool bv 20 percent of the capacity
        return {
            /**
             * Allocates objects by the given count - will increase capacity
             * @param count {Number}
             */
            expand: function (count) {
                var oldCapacity = capacity;
                capacity += count;
                for (var i = oldCapacity; i < capacity; i++) {
                    pool[i] = createFunc();
                }
            },
            /**
             * Grows the pool when capacity has reached max by 10 percent from the current capacity
             * Returns a pooled object
             * @returns {*}
             */
            get: function (x, y) {
                // Expand pool if required
                if (!(used < capacity)) {
                    this.expand(Math.max(Math.floor(capacity * ext), 1));
                }
                // Get pooled object
                var v = pool[used++];
                // Init object
                if (typeof v['init'] == "function") {
                    v['init']();
                }
                // Apply properties
                if (typeof applyFunc == "function") {
                    applyFunc(v, x, y);
                }
                return v;
            },
            /**
             * Clears the pool
             */
            clear: function () {
                used = 0;
            },
            item: function (index) {
                if (used > 0 && index < used) {
                    return pool[index];
                }
                return null;
            },
            size: function () {
                return used;
            },
            capacity: function () {
                return capacity;
            }
        };
    }
    return Pool;
});