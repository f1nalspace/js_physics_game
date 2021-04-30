fm.ns('fm.gfx.Texture');

(function(gfx) {
	function Texture(canvas) {
		this.data = canvas;
		this.width = canvas.width;
		this.height = canvas.height;
	};
	
	Texture.prototype.createLitTexture = function(lv) {
		var imageData = this.data.getContext('2d').getImageData(0, 0, this.width, this.height);
		
		// TODO: also color
		// adjust intensity
		for (var i = 0; i < imageData.data.length; i+= 4) {
			imageData.data[i + 0] = lv.intensity * lv.color[0] * imageData.data[i + 0];
			imageData.data[i + 1] = lv.intensity * lv.color[1] * imageData.data[i + 1];
			imageData.data[i + 2] = lv.intensity * lv.color[2] * imageData.data[i + 2];
		}
		
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		ctx.putImageData(imageData, 0, 0);
		
		return new Texture(canvas, this.width, this.height);
	};
	
	Texture.prototype.getImageData = function(x, y, w, h) {
		return this.data.getContext('2d').getImageData(x, y, w, h);
	};
	
	gfx.Texture = Texture;
})(fm.gfx);