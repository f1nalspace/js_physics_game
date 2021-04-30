/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.utils.DomUtils", function () {
    return {
        write: function (s) {
            var p = document.createElement("p");
            p.appendChild(document.createTextNode(s));
            document.body.appendChild(p);
        }
    };
});