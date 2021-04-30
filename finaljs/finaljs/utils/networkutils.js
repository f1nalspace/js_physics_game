/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.utils.NetworkUtils", function () {
    return {
        ajax: function (url, callback, method, errorCallback, respType, data) {
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
            xhr.onerror = function () {
                if (typeof errorCallback == "function") {
                    errorCallback(xhr);
                }
            };
            if (typeof respType != "undefined") {
                xhr.responseType = respType;
            }
            if (typeof data != 'undefined') {
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhr.send(data);
            } else {
                xhr.send(null);
            }
        }
    };
});