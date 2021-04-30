var finalgine = finalgine || {};

finalgine.MouseButton = {
    Left:0,
    Middle:1,
    Right:2
};

finalgine.Keys = {
    Left:37,
    Right:39,
    Up:38,
    Down:40,
    W:87,
    S:83,
    A:65,
    D:68
};

finalgine.ScaleMode = {
    Fixed:1,
    Scaled:2
};

finalgine.GameState = {
    None:0,
    LoadScreen:1,
    Game:2
};

finalgine.Colors = {
    Black:[0.0, 0.0, 0.0],
    White:[1.0, 1.0, 1.0],
    Red:[1.0, 0.0, 0.0],
    Green:[0.0, 1.0, 0.0],
    Blue:[0.0, 0.0, 1.0],
    Yellow:[1.0, 1.0, 0.0]
};

finalgine.GameEngine = function (screenRes, scaleMode) {
    this.canvas = null;
    this.renderer = null;
    this.screenRes = screenRes || new finalgine.Vector2(1280, 720);
    this.scaleMode = scaleMode || finalgine.ScaleMode.Fixed;

    this.timer = new finalgine.Timer();
    this.frametime = 0;
    this.fixedFrametime = null;

    this.assets = new finalgine.AssetManager(this);
    this.loadScreen = new finalgine.LoadScreen(this);
    this.state = finalgine.GameState.None;

    this.keystate = [];
    this.mouse = finalgine.Vector2(-1, -1);
    this.mousestate = {0:false, 1:false, 2:false};

    this.profiler = new finalgine.Profiler();

    this.updateTime = 0;
};

finalgine.GameEngine.prototype.screenRect = function () {
    return finalgine.Rectangle(-(this.canvas.width / 2), -(this.canvas.height / 2), this.canvas.width, this.canvas.height);
};

finalgine.GameEngine.prototype.loop = function () {
    this.profiler.update();
    this.profiler.start("Update");

    // Update timer / frametime
	var frametime = this.timer.tick();
    this.frametime = this.fixedFrametime || frametime;

    // Load screen, change state to game when finished loading
    if (this.state == finalgine.GameState.LoadScreen) {
        if (this.loadScreen.isFinished()) {
            this.state = finalgine.GameState.Game;
            this.initGame();
            this.startGame();
        }
    }

    // Update
    if (this.state >= finalgine.GameState.Game) {
        var dt = this.frametime;
        var step = dt;
        this.updateTime += dt;
        while (dt && this.updateTime >= step) {
            this.beforeUpdate(dt);
            this.updateGame(dt);
            this.updateTime -= step;
        }
    }
    this.profiler.stop("Update");

    // Render
    this.profiler.start("Render");
    this.renderer.push();
    this.renderer.clear();
    this.renderer.translate(this.canvas.width / 2, this.canvas.height / 2);
    if (this.state >= finalgine.GameState.Game) {
        this.renderGame(this.renderer);
    } else if (this.state == finalgine.GameState.LoadScreen) {
        this.loadScreen.render();
    }
    this.renderer.pop();
    this.profiler.stop("Render");
};

finalgine.GameEngine.prototype.startInput = function () {
    var that = this;
    var getXandY = function (e) {
        var x = e.clientX - that.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.canvas.getBoundingClientRect().top;
        return finalgine.Vector2(x - (that.screenRes.x / 2), y - (that.canvas.height / 2));
    };

    this.canvas.addEventListener("keydown", function (e) {
        if (that.keystate[e.keyCode] === undefined) {
            that.keystate[e.keyCode] = true;
        } else {
            if (!that.keystate[e.keyCode]) {
                that.keystate[e.keyCode] = true;
            }
        }
    }, false);

    this.canvas.addEventListener("keyup", function (e) {
        if (that.keystate[e.keyCode] !== undefined) {
            that.keystate[e.keyCode] = false;
        }
    }, false);

    this.canvas.addEventListener("mousedown", function (e) {
        that.mouse = getXandY(e);
        that.mousestate[e.button] = true;
    }, false);

    this.canvas.addEventListener("mouseup", function (e) {
        that.mousestate[e.button] = false;
    }, false);

    this.canvas.addEventListener("mousemove", function (e) {
        that.mouse = getXandY(e);
    }, false);
};

finalgine.GameEngine.prototype.isKeyDown = function (key) {
    return (this.keystate[key] !== undefined && this.keystate[key]);
};
finalgine.GameEngine.prototype.setKey = function (key, value) {
    this.keystate[key] = value;
};

finalgine.GameEngine.prototype.isMouseDown = function (btn) {
    return (this.mousestate[btn] !== undefined && this.mousestate[btn]);
};
finalgine.GameEngine.prototype.setMouseButton = function (btn, value) {
    this.mousestate[btn] = value;
};

finalgine.GameEngine.prototype.init = function () {
    // Create canvas and append it to body, when not exists
    if (this.canvas == null) {
        this.canvas = document.createElement("canvas");
        document.body.appendChild(this.canvas);
    }

    // Resize canvas to fit fixed screen resolution
    this.canvas.width = this.screenRes.x;
    this.canvas.height = this.screenRes.y;

    // Resize canvas to fit dynamic window resolution
    if (this.scaleMode == finalgine.ScaleMode.Scaled) {
        this.screenRes.x = window.innerWidth / 2;
        this.screenRes.y = window.innerHeight / 2;
        this.canvas.width = this.screenRes.x;
        this.canvas.height = this.screenRes.y;
    }

    // Create renderer
    this.renderer = new finalgine.Renderer(this.canvas, this.screenRes);

    // Start input
    this.startInput();
};


// Child class need to implement this!
finalgine.GameEngine.prototype.preloadAssets = function (assets) {
};
finalgine.GameEngine.prototype.initGame = function () {
};
finalgine.GameEngine.prototype.startGame = function() {	
};
finalgine.GameEngine.prototype.beforeUpdate = function (dt) {
};
finalgine.GameEngine.prototype.updateGame = function (dt) {
};
finalgine.GameEngine.prototype.renderGame = function (r) {
};

finalgine.GameEngine.prototype.run = function () {
    // Init engine
    this.init();

    // Preload assets
    this.preloadAssets(this.assets);
    this.state = finalgine.GameState.LoadScreen;
    this.assets.startDownload();

    // Focus canvas
    this.canvas.tabIndex = 1;
    this.canvas.focus();

    // Reset update time
    this.updateTime = 0;

    // Start game loop
    var that = this;
    (function gameLoop() {
        that.loop();
        window.requestAnimFrame(gameLoop, that.canvas);
    })();
};

finalgine.GameEngine.prototype.getAsset = function (name) {
    return this.assets.get(name);
};