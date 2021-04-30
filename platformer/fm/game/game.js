/**
 * Created by final on 08.01.2014.
 */
fm.ns("fm.game.Game");
fm.req("fm.gfx.renderer.RendererFactory");
fm.req("fm.res.ResourceManager");

(function (window, game, gfx, res) {
    var State = {
        None: 0,
        Loading: 1,
        Active: 2
    };

    function Game(canvas) {
        this.canvas = canvas;
        this.viewport = {x: 0, y: 0, w: this.canvas.width, h: this.canvas.height};
        this.state = State.None;
        this.resMng = new res.ResourceManager();
        this.renderer = null;
        this.font = {name: "arial", size: 14, style: "normal"};
        this.clearColor = "black";

        // Disable selection
        this.canvas.onselectstart = function () {
            return false;
        };

        // Add mouse listeners
        var updatePos = function (x, y) {
            this.mouse.x = (x - this.canvas.getBoundingClientRect().left) * (this.canvas.width / this.canvas.offsetWidth);
            this.mouse.y = (y - this.canvas.getBoundingClientRect().top) * (this.canvas.height / this.canvas.offsetHeight);
        };
        this.mousestate = [];
        this.mouse = {x: -1, y: -1};
        this.canvas.addEventListener("mousemove", function (e) {
            updatePos.call(this, e.clientX, e.clientY);
        }.bind(this), false);
        this.canvas.addEventListener("mousedown", function (e) {
            updatePos.call(this, e.clientX, e.clientY);
            this.mousestate[e.button] = true;
        }.bind(this), false);
        this.canvas.addEventListener("mouseup", function (e) {
            updatePos.call(this, e.clientX, e.clientY);
            this.mousestate[e.button] = false;
        }.bind(this), false);

        // Add key listeners
        this.keystate = [];
        this.canvas.addEventListener("keydown", function (e) {
            this.keystate[e.keyCode ? e.keyCode : e.which] = true;
        }.bind(this), false);
        this.canvas.addEventListener("keyup", function (e) {
            this.keystate[e.keyCode ? e.keyCode : e.which] = false;
        }.bind(this), false);
    }

    Game.prototype.isKeyDown = function (key) {
        return typeof this.keystate[key] != "undefined" && this.keystate[key] == true;
    };
    Game.prototype.setKeyDown = function (key, value) {
        this.keystate[key] = value;
    };

    /**
     * Should be used to add resources to the resources manager
     * @param r {fm.gfx.renderer.Renderer}
     */
    Game.prototype.loadContent = function (r) {
    };

    /**
     * Adds the given resource as a pending resource to the resource manager
     * @param url {string} The relative or full url to the resource
     * @param key {string} Unique key for the resource
     * @param callback {function}
     * @param cat {string} An optional category string - when there are dependencies
     */
    Game.prototype.addResource = function (url, key, callback, cat) {
        this.resMng.add(url, key, callback, cat);
    };

    /**
     * Adds a new dependency to the given category for the resource manager
     * @param cat {string} Category key
     * @param dep {string} Dependency category key
     */
    Game.prototype.addResourceDependency = function(cat, dep) {
        this.resMng.addDependency(cat, dep);
    };

    /**
     * Will be called when all resources are loaded/failed or no resources was needed to preload
     */
    Game.prototype.init = function () {
    };

    /**
     * Updates the current frame
     * @param dt {Number}
     */
    Game.prototype.update = function (dt) {
    };

    /**
     * Draws the current frame
     * @param r {fm.gfx.renderer.Renderer}
     */
    Game.prototype.draw = function (r) {
        var v = this.viewport;
        r.clear();
        r.fillRect(v.x, v.y, v.w, v.h, this.clearColor);
    };

    /**
     * Draws the loading screen
     * @param r {fm.gfx.renderer.Renderer}
     */
    Game.prototype.drawLoading = function (r) {
        var v = this.viewport;
        r.clear();
        r.fillRect(v.x, v.y, v.w, v.h, this.clearColor);

        r.fillText(v.w * 0.5, v.h * 0.5, "Loading resources: " + this.resMng.getProgressCount() + " / " + this.resMng.getPendingCount(), "white", "center", "middle");

        var barHeight = 40;
        var barWidth = (v.w * 0.75);
        var barBorderWidth = barWidth + 10;
        var barBorderHeight = barHeight + 10;
        r.strokeRect(v.w * 0.5 - barBorderWidth * 0.5, v.h * 0.6 - barBorderHeight * 0.5, barBorderWidth, barBorderHeight, "white", 1);
        r.fillRect(v.w * 0.5 - barWidth * 0.5, v.h * 0.6 - barHeight * 0.5, barWidth / this.resMng.getPendingCount() * this.resMng.getProgressCount(), barHeight, "white");
    };

    /**
     * Creates the renderer, loads resources and starts the game loop
     * Also handles switching states when resources are loaded
     */
    Game.prototype.run = function () {
        this.renderer = gfx.renderer.RendererFactory.create(this.canvas, false);
        this.renderer.setFont(this.font);

        // Load content
        this.loadContent(this.renderer);

        // Start resource manager when needed
        if (this.resMng.hasPending()) {
            this.resMng.start();
            this.state = State.Loading;
        } else {
            this.init();
            this.state = State.Active;
        }

        // Execute game loop
        var last = 0;
        var dt = (1 / 60);
        var oneSec = 1 / 1000;
        var accum = 0;
        var gameLoop = function gameLoop(msecs) {
            window.requestAnimationFrame(gameLoop.bind(this));
            if (this.state == State.Loading) {
                if (!this.resMng.isDone()) {
                    this.drawLoading(this.renderer);
                } else {
                    this.init();
                    this.state = State.Active;
                }
            } else if (this.state == State.Active) {
                var now = typeof msecs != "undefined" ? msecs : 0;
                var delta = (now - last) * oneSec;
                last = now;
                accum += delta;
                while (accum >= dt) {
                    this.update(dt);
                    accum -= dt;
                }
                this.draw(this.renderer);
            }
            this.renderer.flip();
        };
        gameLoop.call(this, 0);
    };

    game.Game = Game;
})(window, fm.game, fm.gfx, fm.res);