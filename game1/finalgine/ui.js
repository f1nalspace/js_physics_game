var finalgine = finalgine || {};

finalgine.UIControl = function (x,y,w,h) {
    this.pos = finalgine.Vector2(x, y);
    this.size = finalgine.Vector2(w, h);
    this.initialPos = finalgine.Vector2(x, y);
    this.initialSize = finalgine.Vector2(w, h);
    this.childs = [];
};

finalgine.UIControl.prototype.addChild = function (child) {
    this.childs.push(child);
};

finalgine.UIControl.prototype.removeChild = function (child) {
    this.childs = this.childs.filter(function (v) {
        return v == child ? false : true;
    });
};