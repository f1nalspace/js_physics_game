/**
 * This sample is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.skeleton.SampleApp", ["final.Vec2", "final.Vec2Pool", "final.engine.Engine", "final.input.Keys"], function (final, Vec2, Vec2Pool, Engine, Keys) {
    function SampleApp(canvas) {
        Engine.call(this, canvas);
        this.samples = [];
        this.sampleNames = {};
        this.sampleMapping = {};
        this.activeSample = -1;
        this.selectedSample = -1;
        this.mousePos = new Vec2(-1, -1);
    }

    SampleApp.extend(Engine);

    SampleApp.prototype.registerSample = function (id, name) {
        if (typeof this.sampleNames[id] != "undefined") {
            throw new Error("Sample by id '" + id + "' already exists!");
        }
        this.sampleMapping[id] = this.samples.length;
        this.samples.push(id);
        this.sampleNames[id] = name;
        if (this.selectedSample == -1) {
            this.selectedSample = this.samples[0];
        }
    };

    SampleApp.prototype.setSample = function (id) {
        if (typeof this.sampleNames[id] == "undefined") {
            throw new Error("Sample by id '" + id + "' does not exists!");
        }
        this.selectedSample = this.sampleMapping[id];
    };

    SampleApp.prototype.init = function (r, w, h) {
        r.setFont("arial", 20, "normal");
    };

    SampleApp.prototype.prepare = function (dt, r, w, h) {
        Engine.prototype.prepare.call(this, dt, r, w, h);
    };

    SampleApp.prototype.loadSample = function (id, w, h) {
    };

    SampleApp.prototype.update = function (dt, w, h) {
        // Handle input
        this.mousePos.x = this.mouse.pos.x - w * 0.5;
        this.mousePos.y = this.mouse.pos.y - h * 0.5;
        if (this.keyboard.isKeyDown(Keys.Space)) {
            this.keyboard.setKeyDown(Keys.Space, false);
            if (this.activeSample > -1 && this.samples.length > 1) {
                this.selectedSample = this.activeSample + 1;
                if (this.selectedSample > this.samples.length - 1) {
                    this.selectedSample = this.samples[0];
                }
            }
        }

        // Load sample
        if (this.selectedSample > -1) {
            this.activeSample = this.selectedSample;
            this.selectedSample = -1;
            this.loadSample(this.activeSample, w, h);
        }
    };

    SampleApp.prototype.drawSample = function (id, r, w, h) {
    };

    SampleApp.prototype.drawOSD = function (r, w, h) {
        if (this.activeSample > -1) {
            r.fillText(0, 0, "Sample " + (this.activeSample+1) + "/" + this.samples.length + " " + this.sampleNames[this.samples[this.activeSample]], "white", "left", "top");
        }
    };

    SampleApp.prototype.draw = function (r, dt, w, h) {
        Engine.prototype.draw.call(this, r, dt, w, h);

        r.push();
        r.translate(w * 0.5, h * 0.5);

        if (this.activeSample > -1) {
            this.drawSample(this.samples[this.activeSample], r, dt, w, h);
        }

        r.pop();

        this.drawOSD(r, w, h);
    };

    return SampleApp;
});