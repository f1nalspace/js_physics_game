var finalgine = finalgine || {};
finalgine.Utils = {};

finalgine.Utils.ajax = function (url, callback, options) {
    options = options || {};
    options.method = options.method || "GET";
    options.contentType = options.contentType || null;
    options.contentLength = options.contentLength || null;
    var createXMLHttp = function () {
        return new XMLHttpRequest();
    };

    var xhr = createXMLHttp();
    xhr.open(options.method, url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                callback(xhr);
            }
        }
    };
    if (options.contentType != null) {
        xhr.setRequestHeader('Content-Type', options.contentType);
    }
    if (options.contentLength != null) {
        xhr.setRequestHeader('Content-Length', options.contentLength);
    }
    xhr.send(options.data || null);
};