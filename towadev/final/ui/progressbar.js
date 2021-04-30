final.module("final.ui.progressbar", ["final.ui", "final.shim"], function(final, ui, shim){
    var UIControl = ui.UIControl;

    function ProgressBar(game, pos, size) {
        UIControl.call(this, game, pos, size);

        this.min = 0;
        this.max = 0;
        this.value = 0;
        this.backStyle = {
            fillStyle: null,
            strokeStyle: "white",
            width: 0.015
        };
        this.progressStyle = {
            fillStyle: "red",
            strokeStyle: null,
            width: 0.015,
            gradient: ["red", "lime"]
        };
    }
    ProgressBar.extend(UIControl);

    ProgressBar.prototype.init = function(r) {
    };

    ProgressBar.prototype.draw = function(r, p, s) {
        var range = Math.max(this.min, this.max) - Math.min(this.min, this.max);
        if (range != 0) {
            var stepValue = s.x / range;
            var progressSize = stepValue * (Math.min(this.value - this.min, this.max));

            if (this.backStyle.style != null) {
                r.fillRect(p.x, p.y, s.x, s.y, this.backStyle.style);
            }

            var barStyle = r.createGradientStyle(p.x, p.y, p.x + s.x, p.y + s.y, this.progressStyle.gradient);
            r.fillRect(p.x, p.y, progressSize, s.y, barStyle);

            if (this.backStyle.strokeStyle != null) {
                r.strokeRect(p.x, p.y, s.x, s.y, this.backStyle.strokeStyle, this.backStyle.width);
            }

            if (this.progressStyle.strokeStyle != null) {
                r.strokeRect(p.x, p.y, progressSize, s.y, this.progressStyle.strokeStyle, this.progressStyle.width);
            }
        }
    };

    return {
        ProgressBar: ProgressBar
    }
});