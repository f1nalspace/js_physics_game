var finalgine = finalgine || {};

finalgine.Profiler = function() {
    this.items = [];
    this.active = true;
    this.doRefresh = false;
    this.latestRefresh = window.performance.now();
};

finalgine.Profiler.prototype.update = function() {
    this.doRefresh = window.performance.now() - this.latestRefresh > 500;
    if (this.doRefresh) {
        this.latestRefresh = window.performance.now();
    }
};

finalgine.Profiler.prototype.start = function(name) {
    if (!this.active || !this.doRefresh) return;
    if (this.items[name] === undefined) {
        var itm = {
            start: 0,
            finished: 0,
            duration: 0,
            min: Number.MAX_VALUE,
            max: Number.MIN_VALUE,
            average: 0
        };
        this.items[name] = itm;
    }
    this.items[name].start = window.performance.now();
    this.items[name].finished = 0;
};

finalgine.Profiler.prototype.stop = function(name) {
    if (!this.active || !this.doRefresh) return;
    var itm = this.items[name];
    if (itm !== undefined) {
        itm.finished = window.performance.now();
        itm.duration = itm.finished - itm.start;
        itm.min = Math.min(itm.min, itm.duration);
        itm.max = Math.max(itm.max, itm.duration);
        itm.average = itm.max - itm.min;
    }
};