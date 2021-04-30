/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.managers.UIManager", ["final.engine.Engine"], function () {
    function UIManager(engine) {
        this.engine = engine;
        this.mouse = engine.mouse;
        this.keyboard = engine.keyboard;
        this.touch = engine.touch;
    }
    return UIManager;
});