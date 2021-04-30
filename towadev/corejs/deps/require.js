(function (global) {
	var require = function(name) {
		if (name === './package.json') {
			return '1.0';
		} else {
			var r = global[name];
			return r;
		}
	};
	global.require = require;
}(this));