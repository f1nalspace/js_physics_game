/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.engine.Engine",
    [
        "final.Vec2",
        "final.input.MouseInput",
        "final.input.KeyboardInput",
        "final.input.TouchInput",
        "final.utils.ImageUtils",
        "final.audio.AudioEngine",
        "final.managers.ResourceManager",
        "final.managers.AudioManager",
        "final.window.Window",
        "final.renderer.CanvasRenderer",
        "final.Profiler"
    ],
    function (final, Vec2, MouseInput, KeyboardInput, TouchInput, ImageUtils, AudioEngine, ResourceManager, AudioManager, Window, CanvasRenderer, profiler) {
        var DisplayMode = {
            None: 0,
            Centered: 1,
            Stretched: 2
        };

        var EngineState = {
            None: 0,
            AddedResources: 1,
            LoadingResouces: 2,
            Ready: 10
        };

        var UpdateMode = {
            None: 0,
            FixedFramerate: 1,
            DynamicFramerate: 2
        };

        var loadingFont = {
            name: "monospace",
            size: 20,
            style: "normal"
        };

        function Engine(canvas) {
            this.window = new Window(canvas);
            this.window.resizeEvent = this.updateWindowBounds.bind(this);

            this.displayMode = DisplayMode.Centered;
            this.displayPos = new final.Vec2(this.window.getLeft(), this.window.getTop());
            this.displaySize = new final.Vec2(this.window.getWidth(), this.window.getHeight());

            this.mouse = new MouseInput(this.window);
            this.keyboard = new KeyboardInput(this.window);
            this.touch = new TouchInput(this.window);

            this.resourceMng = new ResourceManager();
            this.audioMng = new AudioManager();
            AudioEngine.instanceStopped = this.audioMng.instanceStopped.bind(this.audioMng);

            this.state = EngineState.None;

            this.profilerEnabled = false;

            this.updateMode = UpdateMode.FixedFramerate;
            this.preferredFramerate = 60;
            this.fps = 0;
        }

        Engine.prototype.updateWindowBounds = function () {
            if (this.displayMode == DisplayMode.Centered) {
                if (ImageUtils.calculateTargetRect(this.window.getWidth(), this.window.getHeight(), 0, 0, this.window.getParentWidth(), this.window.getParentHeight(), this.displayPos, this.displaySize)) {
                    this.window.setSize(this.displaySize.x, this.displaySize.y);
                    this.window.setPosition(this.displayPos.x, this.displayPos.y);
                } else {
                    this.window.setSize(this.window.getWidth(), this.window.getHeight());
                }
            } else if (this.displayMode == DisplayMode.Stretched) {
                this.displayPos.x = 0;
                this.displayPos.y = 0;
                this.displaySize.x = this.window.getParentWidth();
                this.displaySize.y = this.window.getParentHeight();
                this.window.setSize(this.displaySize.x, this.displaySize.y);
                this.window.setPosition(this.displayPos.x, this.displayPos.y);
            }
        };

        Engine.prototype.update = function (dt, w, h) {
        };

        Engine.prototype.addResource = function (url, key, category, callback) {
            this.state = EngineState.AddedResources;
            this.resourceMng.add(url, key, category, callback);
        };

        Engine.prototype.addResourceDependency = function (cat, dep) {
            this.resourceMng.addDependency(cat, dep);
        };

        Engine.prototype.getResource = function (key) {
            var res = this.resourceMng.get(key);
            if (res != null) {
                return res.data;
            }
            return null;
        };

        Engine.prototype.draw = function (r, dt, w, h) {
            r.clear();
            r.fillRect(0, 0, w, h, "black");
        };

        Engine.prototype.drawLoading = function (r, w, h) {
            r.clear();
            r.fillRect(0, 0, w, h, "blue");

            r.setFont(loadingFont.name, loadingFont.size * 3, loadingFont.style);
            r.fillText(w * 0.5, h * 0.35, "loading game", "white", "center", "middle");

            r.setFont(loadingFont.name, loadingFont.size, loadingFont.style);

            r.fillText(w * 0.5, h * 0.64, "done resources: " + this.resourceMng.getProgressCount() + " / " + this.resourceMng.getPendingCount(), "white", "center", "middle");

            var barHeight = 40;
            var barWidth = (w * 0.75);
            var barBorderWidth = barWidth + 10;
            var barBorderHeight = barHeight + 10;
            r.strokeRect(w * 0.5 - barBorderWidth * 0.5, h * 0.7 - barBorderHeight * 0.5, barBorderWidth, barBorderHeight, "white", 1);
            r.fillRect(w * 0.5 - barWidth * 0.5, h * 0.7 - barHeight * 0.5, barWidth / this.resourceMng.getPendingCount() * this.resourceMng.getProgressCount(), barHeight, "white");

            r.strokeText(w * 0.5, h * 0.7 - barHeight * 0.5 + barHeight * 0.5, (this.resourceMng.getProgressCount() * 100 / this.resourceMng.getPendingCount()).toFixed(2) + " %", "black", "center", "middle", 1);

            r.resetFont();
        };

        /**
         * First time initialization
         * @param r {CanvasRenderer}
         * @param w {number}
         * @param h {number}
         */
        Engine.prototype.init = function (r, w, h) {
        };

        /**
         * All resources are loaded
         * @param dt {number}
         * @param r {CanvasRenderer}
         * @param w {number}
         * @param h {number}
         */
        Engine.prototype.prepare = function (dt, r, w, h) {
            // Push loaded audio to audio manager
            final.log("Prepare");
            var list = this.resourceMng.getLoaded();
            for (var k in list) {
                if (list.hasOwnProperty(k)) {
                    if (typeof list[k] != "undefined") {
                        var type = list[k].type;
                        if (type == "Audio" && !this.audioMng.has(k)) {
                            final.log("Added audio '" + k + "' to audio manager");
                            this.audioMng.add(k, list[k].data);
                        }
                    }
                }
            }
        };

        Engine.prototype.run = function () {
            final.log("Run");
            var r = new CanvasRenderer(this.window.canvas);
            var that = this;

            var last = 0;
            var dt = (1 / this.preferredFramerate);
            var oneSec = 1 / 1000;
            var accum = 0;

            // Resize window
            this.updateWindowBounds();

            // Set window focus
            this.window.focus();

            // Init game
            this.init(r, this.window.getWidth(), this.window.getHeight());

            // Call prepare when no resources was being added
            if (this.state != EngineState.AddedResources) {
                this.state = EngineState.Ready;
                this.prepare(dt, r, this.window.getWidth(), this.window.getHeight());
            }

            if (this.profilerEnabled) {
                profiler.enable(r.getCanvas());
            }

            var fpsPrevTime = Date.now();
            var frames = 0;
            this.fps = this.preferredFramerate;

            var gameLoop = function (msecs) {
                requestAnimationFrame(gameLoop, null);
                profiler.begin("Game loop");
                var w = that.window.getWidth(), h = that.window.getHeight();
                if (that.state == EngineState.AddedResources) {
                    final.log("Start resource manager");
                    that.state = EngineState.LoadingResouces;
                    that.resourceMng.start();
                } else if (that.state == EngineState.LoadingResouces) {
                    if (that.resourceMng.isDone()) {
                        final.log("Resource manager is done");
                        that.state = EngineState.Ready;
                        that.drawLoading(r, w, h);
                        that.prepare(dt, r, w, h);
                    }
                    that.drawLoading(r, w, h);
                } else if (that.state == EngineState.Ready) {
                    // Calculate fps
                    var time = Date.now();
                    frames++;
                    if (time > fpsPrevTime + 1000) {
                        that.fps = Math.round(( frames * 1000 ) / ( time - fpsPrevTime ));
                        fpsPrevTime = time;
                        frames = 0;
                    }

                    // Calculate delta time
                    var now = msecs !== undefined ? msecs : 0;
                    var delta = (now - last) * oneSec;
                    if (delta > 0.25)
                        delta = 0.25;
                    last = now;

                    // Update
                    profiler.begin("Total update");
                    if (that.updateMode == UpdateMode.FixedFramerate) {
                        accum += delta;
                        while (accum >= dt) {
                            that.update(dt, w, h);
                            accum -= dt;
                        }
                    } else if (that.updateMode == UpdateMode.DynamicFramerate) {
                        that.update(delta, w, h);
                    } else {
                        that.update(dt, w, h);
                    }
                    profiler.end();

                    // Draw
                    profiler.begin("Total draw");
                    that.draw(r, dt, w, h);
                    profiler.end();
                }
                profiler.end();

                // Update audio engine
                AudioEngine.update();
                // Clear vec2 pool
                final.Vec2Pool.clear();

                // Update profiler
                profiler.update();
            };
            requestAnimationFrame(gameLoop, null);
        };

        final.engine.Engine = Engine;
        final.engine.DisplayMode = DisplayMode;
        final.engine.UpdateMode = UpdateMode;
    }
);