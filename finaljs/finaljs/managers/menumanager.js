/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.managers.MenuManager", ["final.collection.Map"], function(final, Map) {
    (function (mng) {
        function MenuManager() {
            this.items = new Map();
            this.active = null;
        }

        MenuManager.prototype.add = function (id) {
            if (this.items.containsKey(id)) {
                throw new Error("Menu by id '" + id + "' does already exists!");
            }
            var menu = {
                id: id
            };
            this.items.put(id, menu);
        };

        MenuManager.prototype.set = function (id) {
            if (this.active == null || this.active != id) {
                this.active = id;
            }
        };

        mng.MenuManager = MenuManager;
    })(final.managers);
});