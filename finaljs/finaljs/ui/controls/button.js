/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.ui.controls.Button", ["final.ui.Control", "final.ui.State"], function(final, Control, State) {
    function Button(mng, pos, ext) {
        Control.call(this, mng, pos, ext);
        this.color = "white";
    }

    Button.extend(Control);

    Button.prototype.draw = function (r, p, e) {
        r.strokeRect(p.x - e.x, p.y - e.y, e.x * 2, e.y * 2, this.color, 2);
        if (this.state == State.Hover) {
            r.fillRect(p.x - e.x, p.y - e.y, e.x * 2, e.y * 2, this.color);
        }
    };
    return Button;
});