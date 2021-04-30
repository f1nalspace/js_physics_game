fm.ns('fm.map.Light');
fm.req('fm.map.Los');

(function(map) {
	function Light(x, y, radius, lightValue) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.lightValue = lightValue;
		
		// effects over time
		// flicker
		this.flickering = false;
		this.flickerOnToOff = null;
		this.flickerOffToOn = null;
		this.nextFlickerChange = 0;
		this.initialIntensity = lightValue.intensity;
		
		// resizing
		this.resizing = false;
		this.nextResizeChange = 0;
		this.initialRadius = radius;
		this.minRadius = radius * 0.75;
	}
	
	Light.prototype.flicker = function(offToOn, onToOff) {
		if (typeof onToOff === 'undefined') {
			onToOff = offToOn;
		}
		this.flickering = true;
		this.flickerOnToOff = onToOff;
		this.flickerOffToOn = offToOn;
	};
	
	Light.prototype.resize = function(minRadius) {
		if (typeof minRadius !== 'undefined') {
			this.minRadius = minRadius;
		}
		this.resizing = true;
	};
	
	Light.prototype.update = function(dt) {
		if (this.flickering) {
			this.nextFlickerChange -= dt;
			if (this.nextFlickerChange <= 0) {
				if (this.lightValue.intensity == 0) {
					this.lightValue.intensity = this.initialIntensity;
					this.nextFlickerChange = fm.utils.getRandom(this.flickerOnToOff[0], this.flickerOnToOff[1]);
				} else {
					this.lightValue.intensity = 0;
					this.nextFlickerChange = fm.utils.getRandom(this.flickerOffToOn[0], this.flickerOffToOn[1]);
				}
				
			}
		} else if (this.resizing) {
			this.nextResizeChange -= dt;
			if (this.nextResizeChange <= 0) {
				this.radius = fm.utils.getRandom(this.minRadius, this.initialRadius);
				this.lightValue.intensity = this.radius / this.initialRadius * this.initialIntensity;
				this.nextResizeChange = fm.utils.getRandom(0.05, 0.2);
			}
		}
	};
	
	Light.prototype.getValueAt = function(x, y) {
		var dX = x - this.x;
		var dY = y - this.y;
		var dist = Math.sqrt(dX*dX + dY*dY);
		
		return this.getValueForDistance(dist);
	};
	
	Light.prototype.getValueForDistance = function(dist) {
		if (dist > this.radius) {
			return this.lightValue.dim(0);
		}
		
		return this.lightValue.dim(1 - Math.pow(dist / this.radius, 2));
	};
	
	Light.prototype.setPos = function(x, y) {
		this.x = x;
		this.y = y;
	};
	
	map.Light = Light;
})(fm.map);
