var finalgine = finalgine || {};

finalgine.LoadScreen = function (game) {
    this.game = game;
    this.assets = game.assets;
};

finalgine.LoadScreen.prototype.isFinished = function() {
    if (this.assets.isActive()) {
        if (!this.assets.isDone()) {
            return false;
        }
    }
    return true;
};

finalgine.LoadScreen.prototype.render = function () {
    if (!this.assets.isActive()) return;
    if (this.assets.isDone()) return;

    var r = this.game.renderer;
    var screenRect = this.game.screenRect();

    // Clear black
    r.fillRect(screenRect.left(), screenRect.top(), screenRect.w, screenRect.h, [0.0, 0.0, 0.0]);

    // Draw load bar
    if (!this.assets.isDone()) {
        var loadBarSize = finalgine.Vector2(screenRect.w / 2, screenRect.h / 16);
        var loadedBarWidth = loadBarSize.x / this.assets.count() * this.assets.progress();
        r.fillRect(screenRect.left() + ((screenRect.w / 2) - loadBarSize.halfX()), screenRect.top() + ((screenRect.h / 2) - loadBarSize.halfY()), loadedBarWidth, loadBarSize.y, [0.8, 0.8, 0.8]);
        r.drawRect(screenRect.left() + ((screenRect.w / 2) - loadBarSize.halfX()), screenRect.top() + ((screenRect.h / 2) - loadBarSize.halfY()), loadBarSize.x, loadBarSize.y, [1.0, 1.0, 1.0], 4);
    }
};