/**
 * Created by final on 09.01.2014.
 */
fm.ns("fm.utils");

/**
 * Ajax call
 * @param url {string}
 * @param callback {function}
 * @param method {string}
 * @param errorCallback {function}
 */
(function(utils){
    utils.ajax = function(url, callback, method, errorCallback, respType, data) {
        method = method || "GET";
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (typeof callback == "function") {
                    callback(xhr);
                }
            }
        };
        xhr.onerror = function() {
            if (typeof errorCallback == "function") {
                errorCallback(xhr);
            }
        };
        if (typeof respType != "undefined") {
            xhr.responseType = respType;
        }
        
        if (typeof data !== 'undefined') {
        	xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        	xhr.send(data);
        } else {
        	xhr.send(null);
        }
    };
    
    utils.canPlayOgg = function() {
    	// taken from http://diveintohtml5.info/everything.html
    	var a = document.createElement('audio');
    	return !!(a.canPlayType && a.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''));
    };
    
    utils.getRandom = function(min, max) {
		  return Math.random() * (max - min) + min;
    };
})(fm.utils);