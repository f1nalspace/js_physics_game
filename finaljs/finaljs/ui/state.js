/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.ui.State", [],
    function (final) {
        return {
            None: -1,
            Disabled: 0, // Can only be unpressed
            Enabled: 1, // Unpressed
            Hover: 2, // Hover
            Pressed: 3 // Pressed
        };
    }
);