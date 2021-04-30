fm.ns('fm.gfx.LightValue');

(function(gfx) {
	function LightValue(r, g, b, i) {
		this.color = [r, g, b];
		this.intensity = i;
	};
	
	LightValue.prototype.add = function(lv) {
		var intensityFactor = lv.intensity / this.intensity;
		this.color[0] += lv.color[0] * intensityFactor;
		this.color[1] += lv.color[1] * intensityFactor;
		this.color[2] += lv.color[2] * intensityFactor;
		this.intensity = Math.min(1.0, this.intensity + lv.intensity);
		
		var factor = Math.max(this.color[0], this.color[1], this.color[2]);
		if (factor > 1.0) {
			this.color[0] /= factor;
			this.color[1] /= factor;
			this.color[2] /= factor;
		}
	};
	
	LightValue.prototype.dim = function(factor) {
		if (typeof factor === 'undefined') {
			factor = 1.0;
		}
		return new gfx.LightValue(this.color[0], this.color[1], this.color[2], factor * this.intensity);
	};
	
	gfx.LightValue = LightValue;
})(fm.gfx);