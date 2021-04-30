/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.physics.Arbiter",
    [
        "final.Vec2",
        "final.Vec2Pool",
        "final.math",
        "final.collision.Contact"
    ],
    function (final, Vec2, Vec2Pool, math, Contact) {
        function Arbiter() {
            this.body1 = null;
            this.body2 = null;
            this.contacts = new Array(2).fillFunc(function(){return new Contact();});
            this.numContacts = 0;
        }

        Arbiter.prototype.init = function () {
            this.body1 = null;
            this.body2 = null;
            for (var i = 0; i < 2; i++) {
                this.contacts[0].init();
            }
            this.numContacts = 0;
        };

        return Arbiter;
    }
);