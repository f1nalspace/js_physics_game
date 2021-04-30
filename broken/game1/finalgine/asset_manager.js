var finalgine = finalgine || {};

finalgine.AssetManager = function (game) {
    this.game = game;
    this.logSection = "Asset Manager";
    this.cacheMap = new Array();
    this.loadList = [];
    this.loadCount = 0;
    this.remainingCount = -1;
    this.finishedCallback = null;
    this.downloadActive = false;
};

finalgine.AssetManager.prototype.add = function (func) {
    var that = this;
    this.loadCount++;
    this.loadList.push(func);
};

finalgine.AssetManager.prototype.assetLoaded = function (name, data) {
    this.cacheMap[name] = data;
    this.remainingCount--;
    if (this.remainingCount == 0) {
        if (this.finishedCallback != null) {
            this.finishedCallback();
        }
        this.downloadActive = false;
    }
};

finalgine.AssetManager.prototype.startDownload = function () {
    finalgine.Log.info("Start download of " + this.loadCount + " assets", this.logSection);
    this.remainingCount = this.loadCount;
    this.downloadActive = true;
    for (var i = 0; i < this.loadList.length; i++) {
        this.loadList[i]();
    }
};

finalgine.AssetManager.prototype.get = function (name) {
    if (this.cacheMap[name] !== undefined) {
        return this.cacheMap[name];
    }
    return null;
};

finalgine.AssetManager.prototype.progress = function () {
    return this.loadCount - this.remainingCount;
};

finalgine.AssetManager.prototype.count = function () {
    return this.loadCount;
};

finalgine.AssetManager.prototype.isDone = function () {
    return this.remainingCount == 0;
};

finalgine.AssetManager.prototype.isActive = function () {
    return this.downloadActive;
};

finalgine.AssetManager.prototype.addLevel = function (name, url) {
    var that = this;
    this.add(function () {
        finalgine.Log.info("Load level '" + url + "' as " + name, that.logSection);
        finalgine.Utils.ajax(url, function (xhr) {
            that.levelLoaded(name, xhr);
        }, {
            method:"GET",
            contentType:"application/json"
        });
    });
};

finalgine.AssetManager.prototype.levelLoaded = function (name, xhr) {
    finalgine.Log.info("Level '" + name + "' loaded", this.logSection);
    var data = JSON.parse(xhr.responseText);
    finalgine.Log.info("\tLevel width: " + data.width, this.logSection);
    finalgine.Log.info("\tLevel height: " + data.height, this.logSection);
    var level = new finalgine.TileMap(this.game);
    level.loadTiledJSON(data);
    this.assetLoaded(name, level);
};

finalgine.AssetManager.prototype.addImage = function (name, url) {
    var that = this;
    this.add(function () {
        finalgine.Log.info("Load image '" + url + "' as " + name, that.logSection);
        var img = new Image();
        img.onload = function () {
            that.imageLoaded(name, this);
        };
        img.src = url;
    });
};

finalgine.AssetManager.prototype.imageLoaded = function (name, img) {
    finalgine.Log.info("Image '" + name + "' loaded", this.logSection);
    finalgine.Log.info("\tImage width: " + img.width, this.logSection);
    finalgine.Log.info("\tImage height: " + img.height, this.logSection);
    this.assetLoaded(name, img);
};
