final.module("final.game",
    [
        "final.shim",
        "final.vec",
        "final.vec2math",
        "final.resourcemanager",
        "final.renderer",
        "final.profiler",
        "final.utils",
        "final.images",
        "final.ui",
        "final.ui.progressbar"
    ], function (final, shim, vec, vec2math, resourcemanager, renderer, profiler, utils, images, ui, progressbar) {
        var Vec2 = vec.Vec2,
            ResourceManager = resourcemanager.ResourceManager,
            ProgressBar = progressbar.ProgressBar,
            Profiler = profiler.Profiler,
            Renderer = renderer.Renderer,
            Transform = renderer.Transform;

        var Keys = {
            Backspace: 8,
            Enter: 13,
            Shift: 16,
            Ctrl: 17,
            Alt: 18,
            PauseBreak: 19,
            CapsLock: 20,
            Esc: 27,
            Space: 32,
            PageUp: 33,
            PageDown: 34,
            End: 35,
            Home: 36,
            Left: 37,
            Right: 39,
            Up: 38,
            Down: 40,
            PrintScreen: 44,
            Insert: 45,
            Delete: 46,
            F1: 112,
            F2: 113,
            F4: 114,
            F5: 115,
            F6: 116,
            F7: 118,
            F8: 119,
            F9: 120,
            F10: 121,
            F11: 122,
            F12: 123,
            NumLock: 144,
            ScrollLock: 145
        };

        var NumberKeys = utils.createRangeArray(48, 57);
        var AlphaKeys = utils.createRangeArray(65, 90);

        var MouseButton = {
            Left: 0,
            Right: 2
        };

        var GameInitState = {
            None: 0,
            LoadingResources: 1,
            ResourcesFailed: 2,
            ResourcesLoaded: 3
        };

        var DisplayMode = {
            None: 0,
            Centered: 1,
            Stretched: 2
        };

        var loadingSmallFont = {
            name: "Arial",
            size: 0.3,
            style: "normal"
        };

        var loadingBigFont = {
            name: "Arial",
            size: 0.6,
            style: "normal"
        };

        /**
         * Game constructor
         *
         * @param {string} canvasId
         * @constructor
         */
        function Game(canvasId) {
            var that = this;
            if (!canvasId) {
                throw new Error("Canvas ID argument is missing!");
            }
            this.canvas = document.getElementById(canvasId);
            this.version = "0.0.0";
            this.displayMode = DisplayMode.Centered;
            this.displayPos = new Vec2(that.canvas.left, that.canvas.top);
            this.displaySize = new Vec2(that.canvas.width, that.canvas.height);
            this.autoUpdateViewport = false;
            this.autoUpdateViewportInterval = 100;

            // TODO: Support vertical orientation
            this.displayDimension = new Vec2(20, 0);
            this.metersToPixels = this.displaySize.x / this.displayDimension.x;
            this.displayDimension.y = this.displaySize.y / this.metersToPixels;

            this.paused = false;
            this.focused = true;
            this.autoResume = false;
            this.autoPause = true;

            // Input states for key, mouse and touch events
            this.keystate = [];
            this.mouse = new Vec2(-1, -1);
            this.mousestate = [];
            this.isTouchDevice = final.isEventSupported(that.canvas, 'ontouchstart');
            this.touch = new Vec2(-1, -1);
            this.touchstate = false;
            this.releaseTouch = false;

            // A wrapper to convert client to view coords
            var updatePos = function (pos, x, y) {
                pos.x = that.renderer.unProjectX(x - that.canvas.getBoundingClientRect().left) * (that.canvas.width / that.canvas.offsetWidth);
                pos.y = that.renderer.unProjectY(y - that.canvas.getBoundingClientRect().top) * (that.canvas.height / that.canvas.offsetHeight);
            };

            // Disable selection
            that.canvas.onselectstart = function () {
                return false;
            };

            if (that.isTouchDevice) {
                final.log("Adding touch events");
                that.canvas.addEventListener('touchstart', function (e) {
                    if (that.handlePointDown()) {
                        e.preventDefault();
                        return;
                    }
                    var touchobj = e.changedTouches[0];
                    updatePos(that.touch, touchobj.clientX, touchobj.clientY);
                    if (!that.touchstate) {
                        that.releaseTouch = false;
                        that.touchstate = true;
                    }
                }, false);
                that.canvas.addEventListener('touchmove', function (e) {
                    e.preventDefault();
                    var touchobj = e.changedTouches[0];
                    updatePos(that.touch, touchobj.clientX, touchobj.clientY);
                }, false);
                that.canvas.addEventListener('touchend', function (e) {
                    if (that.touchstate) {
                        that.releaseTouch = true;
                        that.touchstate = false;
                    }
                }, false);
            } else {
                // Add mouse listeners
                final.log("Adding mouse events");
                that.canvas.addEventListener("mousedown", function (e) {
                    if (that.handlePointDown()) {
                        e.preventDefault();
                        return;
                    }
                    updatePos(that.mouse, e.clientX, e.clientY);
                    that.mousestate[e.button] = true;
                }, false);
                that.canvas.addEventListener("mousemove", function (e) {
                    updatePos(that.mouse, e.clientX, e.clientY);
                }, false);
                that.canvas.addEventListener("mouseup", function (e) {
                    updatePos(that.mouse, e.clientX, e.clientY);
                    that.mousestate[e.button] = false;
                }, false);
                that.canvas.addEventListener("mouseout", function (e) {
                    that.mouse.x = -1;
                    that.mouse.y = -1;
                }, false);
            }

            // Add key listeners
            that.canvas.addEventListener("keydown", function (e) {
                that.keystate[e.keyCode ? e.keyCode : e.which] = true;
            }, false);
            that.canvas.addEventListener("keyup", function (e) {
                that.keystate[e.keyCode ? e.keyCode : e.which] = false;
            }, false);

            // Window resize listener
            window.addEventListener("resize", function (ev) {
                that.resizeAndPositionDisplay();
            }, false);

            // Resource loader
            this.contentPath = "content/";
            this.resLoader = new ResourceManager();
            this.loadingBar = new ProgressBar(this, new Vec2(0, 0), new Vec2(this.displayDimension.x * 0.5, this.displayDimension.y * 0.05));

            // Game init state
            this.initState = GameInitState.None;

            // Game time
            this.gameTime = new utils.StopWatch();
            this.timeScale = 1.0;

            // Renderer
            this.renderer = null;
            this.fps = 0;

            // Console
            this.console = final['console'] !== undefined ? new final.console.Console(this) : null;
        }

        Game.prototype.handlePointDown = function () {
            if (this.paused) {
                this.resume();
                return true;
            }
            return false;
        };

        /**
         * Adds the given resource to the resource loader which will be loaded automatically after the init call
         * @param {string} url Relative url to the content directory
         * @param {string} key Resource key like: map:map1.json
         * @param {function} callback The callback for the ajax request (Will actually start loading the resource)
         * @param {Array} [deps] Dependency list optional
         */
        Game.prototype.addResource = function (url, key, callback, deps) {
            this.resLoader.add(this.contentPath + url, key, callback, deps);
        };

        Game.prototype.isKeyDown = function (key) {
            return this.keystate[key] !== undefined && this.keystate[key] === true;
        };

        Game.prototype.setKeyDown = function (key, value) {
            this.keystate[key] = value;
        };

        Game.prototype.isMouseDown = function (button) {
            return this.mousestate[button] !== undefined && this.mousestate[button] === true;
        };

        Game.prototype.setMouseButton = function (button, value) {
            this.mousestate[button] = value;
        };

        /**
         * Will be called when all resources has been loaded
         */
        Game.prototype.loaded = function (r) {
        };

        /**
         * Core game update method
         * Updates console when available
         * Calls loaded when resources are loaded
         * Updates game time when not in ResourceLoaded init state
         * @param dt {number}
         */
        Game.prototype.update = function (dt) {
            if (this.console != null) {
                this.console.update(dt);
            }
            if (this.initState == GameInitState.LoadingResources) {
                this.loadingBar.value = this.resLoader.getProgressCount();
                if (this.resLoader.isDone()) {
                    if (this.resLoader.failedCount == 0) {
                        final.log("All resources are loaded");
                        this.resLoader.reset();
                        this.initState = GameInitState.ResourcesLoaded;
                        this.loaded(this.renderer);
                        final.log("Game is started");
                    } else {
                        final.log(this.resLoader.failedCount + " resources failed loading!", final.LogLevel.Error);
                        this.initState = GameInitState.ResourcesFailed;
                        final.log("Game cannot be started, because some resources was not loaded!", final.LogLevel.Error);
                    }
                }
            } else if (!this.initState < GameInitState.ResourcesLoaded) {
                if (!this.paused) {
                    this.gameTime.update(dt);
                }
            }
        };

        Game.prototype.postUpdate = function (dt) {
            if (this.releaseTouch) {
                this.releaseTouch = false;
                this.touch.x = -1;
                this.touch.y = -1;
                console.log("released touch");
            }
        };

        /**
         * Pre draw - will be called before actually calling draw
         * Not used right now
         * @param r {Renderer}
         */
        Game.prototype.preDraw = function (r) {
        };

        /**
         * Draws loading screen
         * @param r {Renderer}
         */
        Game.prototype.drawLoading = function (r) {
            var count = this.resLoader.getPendingCount();
            var progress = this.resLoader.progressCount;
            var failed = this.resLoader.failedCount;

            this.loadingBar.draw(r, this.loadingBar.pos, this.loadingBar.size);

            r.applyFont(loadingBigFont, "center", "bottom");
            r.fillText(this.loadingBar.pos.x + this.loadingBar.size.x * 0.5, this.loadingBar.pos.y - loadingBigFont.size * 0.2, "Loading game", "white");
            r.resetFont();

            r.applyFont(loadingSmallFont, "left", "top");
            r.fillText(this.loadingBar.pos.x, this.loadingBar.pos.y + this.loadingBar.size.y, "Loaded resources " + progress + " / " + count, "white");
            r.resetFont();

            if (failed > 0) {
                r.applyFont(loadingSmallFont, "right", "top");
                r.fillText(this.loadingBar.pos.x + this.loadingBar.size.x, this.loadingBar.pos.y + this.loadingBar.size.y, "Failed resources " + failed + " / " + count, "red");
                r.resetFont();
            }
        };

        /**
         * Core draw call
         * Clears screen with the given clear color
         * Also draws loading screen when init state is LoadingResources
         * @param r {Renderer}
         */
        Game.prototype.draw = function (r) {
            r.clear("black");

            // Draw loading
            if (this.initState == GameInitState.LoadingResources || this.initState == GameInitState.ResourcesFailed) {
                this.drawLoading(r);
            }
        };

        /**
         * Post draw function - Used for rendering console
         * @param r {Renderer}
         */
        Game.prototype.postDraw = function (r) {
            Profiler.begin("console");
            if (this.console != null) {
                this.console.draw(r);
            }
            Profiler.finish();
        };

        /**
         * Adds default console commands - when console is available
         */
        Game.prototype.addConsoleCommands = function () {
            var that = this;
            if (this.console != null) {
                this.console.addCommand("clear", function (cmd, args, con) {
                    con.clear();
                });
                this.console.addCommand("exit", function (cmd, args, con) {
                    con.active = false;
                });
                this.console.addCommand("commands", function (cmd, args, con) {
                    con.addLine("Available commands:", true);
                    for (var i = 0; i < con.commands.keys.length; i++) {
                        var key = con.commands.keys[i];
                        con.addLine(key, true);
                    }
                });
                this.console.addCommand("profiler", function (cmd, args, con) {
                    if (args.length == 1) {
                        var value = args[0] === "yes" || args[0] === "1" || args[0] === "true";
                        if (value != Profiler.active) {
                            if (value) {
                                Profiler.enable(that.canvas);
                            } else {
                                Profiler.disable();
                            }
                        }
                    }
                    con.addLine("Profiler is " + (Profiler.active ? "enabled" : "disabled"), true);
                });
                this.console.addCommand("pause", function (cmd, args, con) {
                    that.paused = !that.paused;
                    con.addLine("Game is " + (that.paused ? "paused" : "running"), true);
                });
                this.console.addCommand("timescale", function (cmd, args, con) {
                    if (args.length == 1) {
                        that.timeScale = Math.max(parseFloat(args[0]), 0);
                    }
                    con.addLine("Timescale is " + (that.timeScale), true);
                });
            }
        };

        Game.prototype.resizeDimension = function(w, h) {
            this.displaySize.x = w;
            this.displaySize.y = h;
            this.metersToPixels = this.displaySize.x / this.displayDimension.x;
            this.displayDimension.y = this.displaySize.y / this.metersToPixels;
            this.renderer.setViewport(w, h);
            this.renderer.setTransformScale(this.metersToPixels, this.metersToPixels);
        };

        /**
         * Resizes and position display (canvas) element based upon configured display mode
         */
        Game.prototype.resizeAndPositionDisplay = function () {
            var parent, pw, ph, px, py, position;
            if (this.canvas.parentNode.nodeName === "BODY") {
                pw = window.innerWidth;
                ph = window.innerHeight;
                px = py = 0;
                position = "absolute";
            } else {
                parent = this.canvas.parentNode;
                pw = parent.offsetWidth;
                ph = parent.offsetHeight;
                px = parent.clientLeft;
                py = parent.clientTop;
                position = "relative";
            }
            if (this.displayMode == DisplayMode.Centered) {
                var newSize = new Vec2();
                var newPos = new Vec2();
                if (images.calculateTargetRect(this.canvas.width, this.canvas.height, px, py, pw, ph, newPos, newSize)) {
                    this.canvas.style.position = position;
                    this.canvas.style.width = parseInt(newSize.x, 10) + "px";
                    this.canvas.style.height = parseInt(newSize.y, 10) + "px";
                    this.canvas.style.left = parseInt(newPos.x, 10) + "px";
                    this.canvas.style.top = parseInt(newPos.y, 10) + "px";
                } else {
                    this.canvas.style.position = "static";
                    this.canvas.style.width = "100%";
                }
            } else if (this.displayMode == DisplayMode.Stretched) {
                this.canvas.style.position = position;
                this.canvas.style.left = px + "px";
                this.canvas.style.top = py + "px";
                this.canvas.style.width = pw + "px";
                this.canvas.style.height = ph + "px";
            }
        };

        /**
         * One-Time-call initialization for game
         * - Resizes and position display
         * - Starts game timer
         * - Adds console commands
         * @param r {Renderer}
         */
        Game.prototype.init = function (r) {
            final.log("Initialize game");
            this.resizeAndPositionDisplay();
            this.gameTime.start();
            this.addConsoleCommands();
        };

        Game.prototype.pause = function () {
            this.paused = true;
            this.focused = false;
        };

        Game.prototype.resume = function () {
            this.paused = false;
            this.focused = true;
            this.canvas.focus();
        };

        /**
         * Runs the game - init, resources, game loop until finished
         */
        Game.prototype.run = function () {
            this.renderer = new Renderer(this.canvas, new Transform(0, 0, this.metersToPixels, this.metersToPixels));
            var r = this.renderer;
            var last = 0;
            var dt = (1 / 60);
            var oneSec = 1 / 1000;
            var accum = 0;
            var that = this;
            this.paused = false;
            this.focused = true;
            this.init(r);
            this.canvas.focus();

            // Update viewport every second if needed
            if (this.autoUpdateViewport) {
                window.setInterval(function () {
                    var newW = that.canvas.width;
                    var newH = that.canvas.height;
                    that.resizeDimension(newW, newH);
                }, this.autoUpdateViewportInterval);
            }

            (function gameLoop(msecs) {
                window.requestAnimationFrame(gameLoop);

                if (that.resLoader.hasPending() && !that.resLoader.loading) {
                    // Setup loading bar
                    that.loadingBar.max = that.resLoader.getPendingCount();
                    that.loadingBar.value = 0;
                    that.loadingBar.pos.x = that.displayDimension.x * 0.5 - that.loadingBar.size.x * 0.5;
                    that.loadingBar.pos.y = that.displayDimension.y * 0.5 - that.loadingBar.size.y * 0.5;

                    // Start resource loader
                    final.log("Start loading " + that.resLoader.getPendingCount() + " resources");
                    that.initState = GameInitState.LoadingResources;
                    that.resLoader.start();
                }

                // Update focus state
                if (that.autoPause) {
                    if (that.focused && !document.hasFocus()) {
                        that.pause();
                    } else if (!that.focused && document.hasFocus() && that.autoResume) {
                        that.resume();
                    }
                } else if (that.paused) {
                    that.resume();
                }

                // Get delta for last frame
                Profiler.begin("total");
                var now = msecs !== undefined ? msecs : 0;
                var delta = Math.min((now - last) * oneSec, 0.5);
                last = now;
                accum += delta;

                // Update
                Profiler.begin("total update");
                while (accum >= dt) {
                    var scaledDt = dt * that.timeScale;
                    that.update(scaledDt);
                    that.postUpdate(scaledDt);
                    accum -= dt;
                }
                Profiler.finish();

                // Render
                Profiler.begin("draw");
                that.preDraw(r);
                that.draw(r);
                that.postDraw(r);
                Profiler.finish();

                that.fps = final.countFPS();
                Profiler.finish();

                Profiler.update();
            })();
        };

        return {
            Keys: Keys,
            NumberKeys: NumberKeys,
            AlphaKeys: AlphaKeys,
            MouseButton: MouseButton,
            GameInitState: GameInitState,
            DisplayMode: DisplayMode,
            Game: Game
        };
    }
);