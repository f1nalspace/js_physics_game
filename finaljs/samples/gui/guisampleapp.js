/**
 * This sample is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.samples.gui.GUISampleApp",
    [
        "final.Vec2",
        "final.math",
        "final.engine.Engine",
        "final.ui.controls.Button",
        "final.managers.UIManager"
    ],
    function(final, Vec2, math, Engine, Button, UIManager) {
        function GUISampleApp(canvas) {
            Engine.call(this, canvas);
            this.uiMng = new UIManager(this);
            this.uiPos = new Vec2();
            this.button = new Button(this.uiMng, new Vec2(0, 0), new Vec2(100, 20));
        }

        GUISampleApp.extend(Engine);

        GUISampleApp.prototype.update = function (dt, w, h) {
            Engine.prototype.update.call(this, dt, w, h);
            this.button.update(dt, this.uiPos, this.button.ext);
        };

        GUISampleApp.prototype.draw = function (r, dt, w, h) {
            r.clear();
            r.fillRect(0, 0, w, h, "black");
            math.vec2Set(this.uiPos, w * 0.5, h * 0.5);
            this.button.draw(r, this.uiPos, this.button.ext);
        };

        return GUISampleApp;
    }
);