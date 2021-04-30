/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
window.final = (function () {
    /**
     * Return true when the given object is a function - only because the IE-8 does not return "function" for typeof -.-
     * @param f
     */
    function isFunction(f) {
        if (typeof f == "function") {
            return true;
        } else if (typeof f != "undefined" && f != null) {
            if (typeof f.toString != "undefined") {
                return f.toString().substr(0, 8) == 'function';
            }
            return true;
        }
        return false;
    }

    /**
     * XMLHttpRequest function
     * @type {Function|*}
     */
    var xhrRequest = (function () {
        var ids = ["MSXML2.XMLHTTP.4.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"];
        return function() {
            if (typeof window.XMLHttpRequest != "undefined") {
                return new window.XMLHttpRequest();
            } else {
                for (var i = 0; i < ids.length; i++) {
                    try {
                        return new ActiveXObject(ids[i]);
                    } catch (e) {
                    }
                }
                throw new Error("XHR Request is not supported by this browser/environment!");
            }
        }
    })();

    /**
     * Simple class inheritance
     */
    if (typeof Function.prototype.extend == "undefined") {
        Function.prototype.extend = function (b) {
            var d = this;
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            function __() {
                this.constructor = d;
            }

            __.prototype = b.prototype;
            d.prototype = new __();
        };
    }

    /**
     * String prototype addons
     */

    if (typeof String.prototype.endsWith == "undefined") {
        String.prototype.endsWith = function (suffix) {
            return this.indexOf(suffix, this.length - suffix.length) !== -1;
        };
    }

    /**
     * Array prototype addons
     */

    if (typeof Array.prototype.remove == "undefined") {
        Array.prototype.remove = function (from, to) {
            if (typeof from == "object") {
                this.splice(this.indexOf(from), 1);
            } else {
                var rest = this.slice((to || from) + 1 || this.length);
                this.length = from < 0 ? this.length + from : from;
                return this.push.apply(this, rest);
            }
        };
    }

    if (typeof Array.prototype.fill == "undefined") {
        Array.prototype.fill = function (value, start, end) {
            for (var i = (start || 0); i < (end || this.length); i++) {
                if (typeof value == "function") {
                    this[i] = new value();
                } else {
                    this[i] = value || null;
                }
            }
            return this;
        };
    }

    if (typeof Object.prototype.getClassName == "undefined") {
        var nameFromToStringRegex = /^function\s?([^\s(]*)/;
        Object.prototype.getClassName = function (defaultName) {
            var result = "";
            if (typeof this === 'function') {
                result = this.toString().match(nameFromToStringRegex)[1];
            } else if (typeof this.constructor === 'function') {
                result = this.constructor.name;
            }
            return result || defaultName;
        };
    }

    /**
     * Request animation frame shim (frame update by browser with 60 fps)
     */
    window.requestAnimationFrame =
        window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function (callback) {
            return window.setTimeout(callback, 1000 / 60);
        };

    /**
     * High performance timer shim (msecs with microseconds precision when supported)
     */
    window.performance = window.performance || {};
    window.performance.now = window.performance.now ||
        window.performance.mozNow ||
        window.performance.msNow ||
        window.performance.oNow ||
        window.performance.webkitNow ||
        function () {
            return Date.now();
        };

    /**
     * Audio context shim
     */
    window.AudioContext =
        window.AudioContext ||
        window.mozAudioContext ||
        window.oAudioContext ||
        window.webkitAudioContext;

    /**
     * Log level enum
     */
    var logLevel = {
        Debug: 0,
        Info: 1,
        Warning: 2,
        Error: 3,
        Fatal: 4
    };

    /**
     * Default log level used when level is not passed to log()
     * @type {number}
     */
    var defaultLogLevel = logLevel.Info;

    /**
     * Active log level
     * @type {number}
     */
    var activeLogLevel = logLevel.Warning;

    /**
     * Write a log string into the system out
     * when level is given, only logs will be created >= logLevel
     * @param s {string}
     * @param [level] {string}
     * @param [e] {Error}
     */
    function log(s, level, e) {
        if (typeof level == "undefined" || isNaN(level)) {
            level = defaultLogLevel;
        }
        if (level >= activeLogLevel) {
            if (typeof console != "undefined" && typeof console.log != "undefined") {
                var hasErrorLog = !!("error" in console);
                if (level >= logLevel.Error && hasErrorLog) {
                    console.error(s);
                } else {
                    console.log(s);
                }
                if (typeof e != "undefined") {
                    var stackTrace = e.stack || e.stackTrace || e.description || "";
                    if (stackTrace.length == 0) {
                        stackTrace = e.toString();
                    }
                    if (hasErrorLog) {
                        console.error(stackTrace);
                    } else {
                        console.log(stackTrace);
                    }
                }
            } else if (typeof println == "function") {
                println(s);
                if (typeof e != "undefined") {
                    println(e.message);
                }
            }
        }
    }

    /**
     * Source paths used for auto loading js files - default no items (current directory)
     * Each source may be a pair of regex and string - regex for matching the namespace and the actual source path
     * because we want to support loading sources from different folders based on a namespace pattern
     * @type {Array}
     */
    var sourcePaths = [];

    /**
     * Default namespace used for dependency references
     * @type {string}
     */
    var defaultNamespace = "final";

    /**
     * Script load type (ajax, ajax-sync, script)
     * @type {string}
     */
    var loadType = "script";

    /**
     * Defines the given namespace
     * @param clazz {string}
     */
    function define(clazz) {
        var classes = clazz.split(",");
        var n = window;
        for (var j = 0; j < classes.length; j++) {
            var s = clazz.split(".");
            if (s.length > 0) {
                for (var i = 0; i < s.length; i++) {
                    if (typeof n[s[i]] == "undefined") {
                        n[s[i]] = {};
                    }
                    n = n[s[i]];
                }
            }
        }
        return n;
    }

    /**
     * Checks if the given class namespace is existing
     * Throws error when any part is missing
     * @param clazz {string}
     * @returns {*}
     */
    function require(clazz) {
        var s = clazz.split(".");
        if (s.length > 0) {
            var n = window;
            var x = "";
            for (var i = 0; i < s.length; i++) {
                if (i > 0) {
                    x += ".";
                }
                x += s[i];
                if (typeof n[s[i]] == "undefined") {
                    throw new Error("Namespace or class '" + x + "' not found!");
                }
                n = n[s[i]];
            }
            return n;
        }
        return null;
    }

    /**
     * Returns the object from the class namespace
     * When not exists, null will be returned
     * @param clazz {string}
     * @returns {Object|Null}
     */
    function getObject(clazz) {
        var s = clazz.split(".");
        if (s.length > 0) {
            var n = window;
            var x = "";
            for (var i = 0; i < s.length; i++) {
                if (i > 0) {
                    x += ".";
                }
                x += s[i];
                if (typeof n[s[i]] == "undefined") {
                    return null;
                }
                n = n[s[i]];
            }
            return n;
        }
        return null;
    }

    /**
     * Returns true when the full class namespace does exists
     * @param clazz {string}
     * @returns {boolean}
     */
    function has(clazz) {
        var s = clazz.split(".");
        if (s.length > 0) {
            var n = window;
            var x = "";
            for (var i = 0; i < s.length; i++) {
                if (i > 0) {
                    x += ".";
                }
                x += s[i];
                if (typeof n[s[i]] == "undefined") {
                    return false;
                }
                n = n[s[i]];
            }
        }
        return true;
    }

    // Module map
    var modules = {};

    // Module status enum
    var moduleStatus = {
        Registered: 0,
        LoadFailed: 1,
        Loading: 2,
        Loaded: 3,
        Installed: 4
    };

    /**
     * Creates a new module and registers it into the modules with the given name
     * @param name {string}
     * @param [callback] {function}
     */
    function createModule(name, callback) {
        if (!modules.hasOwnProperty(name)) {
            modules[name] = {
                callbacks: [],
                parents: [],
                name: name,
                deps: [],
                nextModules: [],
                source: null,
                status: moduleStatus.Registered
            };
        }
        if (isFunction(callback)) {
            modules[name].callbacks.push(callback);
        }
        return modules[name];
    }

    /**
     * Defines a module - does not execute the implementation
     * Uses for execution by using load()
     * @param name {string}
     * @param [reqOrImpl] {Array|function}
     * @param [implAfterReq] {function|Array}
     */
    function module(name, reqOrImpl, implAfterReq) {
        log("Define module: " + name, logLevel.Debug);
        var m = createModule(name);
        if (typeof reqOrImpl != "undefined" && !isFunction(reqOrImpl)) {
            m.deps = reqOrImpl.slice(0);
            if (isFunction(implAfterReq)) {
                m.source = implAfterReq;
            }
        } else if (isFunction(reqOrImpl)) {
            m.source = reqOrImpl;
        }
    }

    var load, installModule;

    installModule = function (m) {
        // Module is already installed
        if (m.status == moduleStatus.Installed) {
            return;
        }

        var name = m.name;
        var deps = m.deps;

        var i;

        // Check depedendencies
        for (i = 0; i < deps.length; i++) {
            var depModule = modules[deps[i]];
            if (depModule.status != moduleStatus.Installed) {
                return;
            }
        }

        log("Install module: " + name, logLevel.Info);

        // Define module and return target namespace
        var out = define(name);
        if (isFunction(m.source)) {
            // Build args array
            var args = new Array(deps.length + 1);
            args[0] = require(name.indexOf(".") > -1 ? name.substr(0, name.indexOf(".")) : defaultNamespace);
            for (i = 0; i < deps.length; i++) {
                if (!has(deps[i])) {
                    throw new Error("Module '" + name + "' requires " + deps[i]);
                } else {
                    args[i + 1] = require(deps[i]);
                }
            }
            // Call source and get result
            var res = null;
            try {
                res   = m.source.apply(this, args);
            } catch (e) {
                log("Failed executing source for module '" + name + "'!", logLevel.Error, e);
            }

            // Push result into the target namespace (out)
            if (typeof res != "undefined" && res != null) {
                if (isFunction(res)) {
                    // Special handling for direct prototype assignments (needs at least two namespaces - first is always window)
                    var s = name.split(".");
                    if (s.length > 0) {
                        var n = window;
                        for (i = 0; i < s.length; i++) {
                            n = n[s[i]];
                            if (i == s.length - 2) {
                                var lastName = s[s.length - 1];
                                n[lastName] = res;
                            }
                        }
                    }
                } else {
                    for (var k in res) {
                        out[k] = res[k];
                    }
                }
            }
        }

        // Module are installed now
        m.status = moduleStatus.Installed;

        // Call function callbacks
        var cbindex = 0;
        while (m.callbacks.length > 0) {
            var cb = m.callbacks.pop();
            try {
                cb();
            } catch (e) {
                log("Failed executing install callback "+cbindex+" for module '" + name + "'!", logLevel.Error, e);
            }
            cbindex++;
        }

        // Install parent modules
        for (i = 0; i < m.parents.length; i++) {
            installModule(m.parents[i]);
        }
    };

    var scriptLoaded = function (name, is3rd) {
        log("Loaded " + (is3rd ? "third party " : "") + "module '" + name + "' successfully.", logLevel.Debug);

        // Module does already exists!
        var m = modules[name];

        m.status = moduleStatus.Loaded;

        var i;

        // Add next modules as dependencies as well
        for (i = 0; i < m.nextModules.length; i++) {
            m.deps.push(m.nextModules[i]);
        }

        // Create all modules for all dependencies
        for (i = 0; i < m.deps.length; i++) {
            createModule(m.deps[i]);
        }

        // Load dependencies
        for (i = 0; i < m.deps.length; i++) {
            load(m.deps[i], m);
        }

        // Install module
        installModule(m);
    };

    var getParentNames = function (parents) {
        var result = [];
        for (var i = 0; i < parents.length; i++) {
            result.push(parents[i].name);
        }
        return result;
    };

    var scriptFailed = function (name) {
        var m = modules[name];
        log("Module '" + name + "' could not be loaded for [" + getParentNames(m.parents).join() + "]", logLevel.Error);
        m.status = moduleStatus.LoadFailed;
    };

    /**
     * Loads an module - recursively loads all dependencies
     * @param names {string|Array}
     * @param [root] {Object|Function}
     * @param [callback] {Function}
     */
    load = function (names, root, callback) {
        var i, s;

        if (isFunction(root)) {
            callback = root;
            root = null;
        }

        var isNameArray = typeof names['splice'] != "undefined";
        var name = isNameArray ? names[0] : names;

        // Create module
        var m = createModule(name, callback);

        // Support for loading multiple modules at once
        if (isNameArray && names.length > 1) {
            for (i = 1; i < names.length; i++) {
                m.nextModules.push(names[i]);
            }
        }

        // When root is defined - another module depends on this module
        // therefore we need to add this depending module to the parent list
        if (typeof root != "undefined" && root != null) {
            m.parents.push(root);
        }

        // Load module only when last loading not failed
        if (m.status < moduleStatus.Loading) {
            log("Load module: " + name, logLevel.Info);

            // Set module state to loading
            m.status = moduleStatus.Loading;

            // Test if the given target object does already exists - this is the case for 3rd party dependencies
            var targetObject = getObject(name);
            if (targetObject != null) {
                // Script already loaded
                scriptLoaded(name, true);
            } else {

                // Find source path
                var sourcePath = "";
                for (i = 0; i < sourcePaths.length; i++) {
                    if (sourcePaths[i][1] != null) {
                        var rex = new RegExp(sourcePaths[i][1]);
                        if (rex.test(name)) {
                            sourcePath = sourcePaths[i][0];
                        }
                    } else {
                        sourcePath = sourcePaths[i][0];
                    }
                }

                // Match a namespace with at least one dot and one char before the dot
                var sourceFile;

                // Match a namespace with at least one dot and one char before the dot
                if (name.indexOf(".") > 0) {
                    s = name.toLowerCase().split(".");
                    if (s.length > 0) {
                        if (s[0] === "final") {
                            // Skip final namespace
                            sourceFile = sourcePath;
                            for (i = 1; i < s.length; i++) {
                                sourceFile += s[i];
                                if (i < s.length - 1) {
                                    sourceFile += "/";
                                }
                            }
                            sourceFile += ".js";
                        }
                    }
                } else {
                    sourceFile = sourcePath + name + ".js";
                }

                // Create script tag
                if (loadType == "script") {
                    log("Loading source file (script): " + sourceFile, logLevel.Debug);
                    var script = document.createElement("script");
                    script.type = "text/javascript";
                    script.src = sourceFile;

                    // Some chrome versions -maybe other browsers crashes for "in" checks for script
                    var onloadSupported = false;
                    try {
                        onloadSupported = !!('onload' in script);
                    } catch (e) {
                    }

                    if (onloadSupported) {
                        script.onload = function () {
                            scriptLoaded(name);
                        };
                    } else {
                        script.onreadystatechange = function () {
                            if (script.readyState == "loaded" || script.readyState == "complete") {
                                scriptLoaded(name);
                            }
                        };
                    }
                    script.onerror = function () {
                        scriptFailed(name);
                    };
                    document.getElementsByTagName("body")[0].appendChild(script);
                } else {
                    log("Loading source file (ajax): " + sourceFile, logLevel.Debug);
                    var xhr = createXHR();
                    xhr.open("GET", sourceFile, loadType != "ajax-sync");
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            eval(xhr.responseText);
                            scriptLoaded(name);
                        }
                    };
                    xhr.onerror = function () {
                        scriptFailed(name);
                    };
                    xhr.send(null);
                }
            }
        } else if (m.status == moduleStatus.Installed) {
            if (isFunction(callback)) {
                callback();
            }
        }
    };

    /**
     * @deprecated
     * Set a new current source path used by auto loader
     * This should be called once only - Is used for backward compability
     * @returns {string}
     */
    function setSourcePath(value) {
        sourcePaths = [[value, null]];
    }

    /**
     * Adds a new source path with the given path and pattern
     * @param {String} path
     * @param [string] pattern
     */
    function addSourcePath(path, pattern) {
        sourcePaths.push([path, pattern || null]);
    }

    /**
     * Returns the current default namespace used for dependency references
     * @returns {string}
     */
    function getDefaultNamespace() {
        return defaultNamespace;
    }

    /**
     * Set a new current default namespace used for dependency references
     * This should be called once only
     * @returns {string}
     */
    function setDefaultNamespace(value) {
        defaultNamespace = value;
    }

    /**
     * Returns the current load type
     * @returns {string}
     */
    function getLoadType() {
        return loadType;
    }

    /**
     * Sets the load type (ajax, ajax-sync, script)
     * @param value {string}
     */
    function setLoadType(value) {
        loadType = value;
    }

    /**
     * Changes the active log level
     * @param {number} level
     */
    function setActiveLogLevel(level) {
        if (!isNaN(level)) {
            activeLogLevel = level;
        }
    }

    /**
     * Returns the active log level
     * @returns {number}
     */
    function getActiveLogLevel() {
        return activeLogLevel;
    }

    // Export core functions
    return {
        define: define,
        require: require,
        has: has,
        module: module,
        load: load,
        log: log,
        setSourcePath: setSourcePath,
        addSourcePath: addSourcePath,
        getDefaultNamespace: getDefaultNamespace,
        setDefaultNamespace: setDefaultNamespace,
        getActiveLogLevel: getActiveLogLevel,
        setActiveLogLevel: setActiveLogLevel,
        getLoadType: getLoadType,
        setLoadType: setLoadType,
        getXhrRequest: function () {
            return new xhrRequest();
        }
    };
})();