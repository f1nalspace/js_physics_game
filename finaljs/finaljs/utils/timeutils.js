/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.utils.TimeUtils", function () {
    return {
        msecs: function () {
            return window.performance.now();
        }
    };
});