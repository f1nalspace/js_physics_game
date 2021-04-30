(function (root, factory) {
    if (typeof exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory(root);
    } else {
        // Browser globals (root is window)
        root.final = factory(root);
    }
}(this, function (global) {
    "use strict";

    var isNode = typeof require === 'function' && typeof exports === 'object';

    var assert = function(expr, msg) {
        if (!expr) {
            throw new Error("Assertion error" + (msg ? ": " + msg : "!"));
        }
    };

    /**
     * Log level enum
     */
    var logLevel = {
        Debug: 0,
        Info: 1,
        Warn: 2,
        Error: 3,
        Fatal: 4,
        toString: function (level) {
            for (var k in this) {
                if (this.hasOwnProperty(k)) {
                    if (this[k] === level) {
                        return k;
                    }
                }
            }
            return "Unknown(" + level + ")";
        }
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
    var activeLogLevel = logLevel.Warn;

    /**
     * Will the log level in format [xxxxx] printed before any log entries
     * @type {boolean}
     */
    var printLogLevel = false;

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

    function levelToString(level) {
        var s = logLevel.toString(level);
        if (s.length < 5) {
            for (var i = 0; i < 5 - s.length; i++) {
                s += " ";
            }
        }
        return "[" + s + "] ";
    }

    /**k
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
            var line = s;
            if (printLogLevel) {
                line = levelToString(level) + s;
            }
            if (typeof console != "undefined" && typeof console.log != "undefined") {
                var hasErrorLog = !!("error" in console);
                if (level >= logLevel.Error && hasErrorLog) {
                    console.error(line);
                } else {
                    console.log(line);
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
                println(line);
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
     * Script load type (ajax, ajax-sync, script, node)
     * @type {string}
     */
    var loadType = "script";

    /**
     * Create an crossbrowser XMLHttpRequest instance
     * @type {*}
     */
    var createXHR = (function () {
        var ids = ["MSXML2.XMLHTTP.4.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"];
        return function () {
            if (typeof global.XMLHttpRequest != "undefined") {
                return new global.XMLHttpRequest();
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
     * Defines the given namespace
     * @param clazz {string}
     */
    function internalDefine(clazz) {
        var classes = clazz.split(",");
        var n = global;
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
    function internalRequire(clazz) {
        var s = clazz.split(".");
        if (s.length > 0) {
            var n = global;
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
    function internalGet(clazz) {
        var s = clazz.split(".");
        if (s.length > 0) {
            var n = global;
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
    function internalHas(clazz) {
        var s = clazz.split(".");
        if (s.length > 0) {
            var n = global;
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
    var loadStates = {};
    var loadIDs = [];
    var installedModules = [];

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
     * @param [skipSource] {boolean}
     */
    function createModule(name, skipSource) {
        if (!modules.hasOwnProperty(name)) {
            modules[name] = {
                parents: [],
                name: name,
                sourceFile: null,
                deps: [],
                source: null,
                status: moduleStatus.Registered,
                skipSource: skipSource || false,
                installCount: 0
            };
        }
        return modules[name];
    }

    /**
     * Print current module state
     */
    var printModuleStates = function() {
        var k;
        for (k in modules) {
            if (modules.hasOwnProperty(k)) {
                log(modules[k].name + ", State: " + modules[k].status + ", InstallCount: " + modules[k].installCount, logLevel.Info);
            }
        }
    };

    var executeCallback = function (m) {
        var i, j, passed, count, loadID, loadState,
            name = m.name;

        // Loop over all load ids and execute callbacks when its requirements has met
        for (i = 0; i < loadIDs.length; i++) {
            loadID = loadIDs[i];
            loadState = loadStates[loadID];
            if (!loadState.done) {
                // Calculate the required modules
                passed = 0;
                count = loadState.required.length;
                for (j = 0; j < count; j++) {
                    var depModule = modules[loadState.required[j]];
                    if ((typeof depModule != "undefined" && depModule.status == moduleStatus.Installed) && internalHas(loadState.required[j])) {
                        passed++;
                    }
                }
                if (count === passed) {
                    // All required modules are installed, we can execute the callback - so we set the done state to true
                    loadState.done = true;
                    log("Execute callback on [" + loadState.required.join(', ') + "] as " + loadID + " from " + name, logLevel.Info);

                    // Building the callback arguments
                    var args = new Array(count + 1);
                    args[0] = internalRequire(name.indexOf(".") > -1 ? name.substr(0, name.indexOf(".")) : defaultNamespace);
                    for (j = 0; j < count; j++) {
                        args[j + 1] = internalRequire(loadState.required[j]);
                    }

                    // Execute callback
                    if (isFunction(loadState.callback)) {
                        try {
                            loadState.callback.apply(this, args);
                        } catch (e) {
                            log("Failed executing callback for module '" + name + "'!", logLevel.Error, e);
                        }
                    }
                }
            }
        }
    };

    var installModule = function (m, from) {
        // Increase install count
        m.installCount++;
        log("Try install module: " + m.name + (from ? " from " + from.name : ""), logLevel.Info);

        // Module is already installed
        if (m.status === moduleStatus.Installed) {
            return;
        }

        var name = m.name;
        var deps = m.deps;

        var i;

        // Check depedendencies
        for (i = 0; i < deps.length; i++) {
            var depModule = modules[deps[i]];
            if (depModule.status !== moduleStatus.Installed) {
                return;
            }
        }

        log("Install module: " + name, logLevel.Info);

        if (!m.skipSource) {
            // Define module
            var out = internalDefine(name);

            // Write source to defined module and return target namespace
            if (isFunction(m.source)) {
                // Build args array for module execution
                var args = new Array(deps.length + 2);
                args[0] = internalRequire(name.indexOf(".") > -1 ? name.substr(0, name.indexOf(".")) : defaultNamespace);
                for (i = 0; i < deps.length; i++) {
                    if (!internalHas(deps[i])) {
                        throw new Error("Module '" + name + "' requires " + deps[i]);
                    } else {
                        args[i + 1] = internalRequire(deps[i]);
                    }
                }
                args[args.length - 1] = m;

                // Call source and get result
                var res = null;
                try {
                    res = m.source.apply(this, args);
                } catch (e) {
                    log("Failed executing source for module '" + name + "'!", logLevel.Error, e);
                }

                // Push result into the target namespace (out)
                if (typeof res != "undefined" && res != null) {
                    if (isFunction(res)) {
                        // Special handling for direct prototype assignments (needs at least two namespaces - first is always window)
                        var s = name.split(".");
                        if (s.length > 0) {
                            var n = global;
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
        } else {
            log("Sources for module '" + name + "' are skipped.", logLevel.Info);
        }

        // Module are installed now
        m.status = moduleStatus.Installed;

        // Execute callback
        executeCallback(m);

        // Install parent modules
        for (i = 0; i < m.parents.length; i++) {
            installModule(m.parents[i], m);
        }
    };

    var scriptLoaded = function (name, is3rd) {
        log("Loaded " + (is3rd ? "third party " : "") + "module '" + name + "' successfully.", logLevel.Debug);

        // Module does already exists!
        var m = modules[name];

        m.status = moduleStatus.Loaded;

        var i;

        // Create all modules for all dependencies
        for (i = 0; i < m.deps.length; i++) {
            createModule(m.deps[i], m.skipSource);
        }

        // Load dependencies
        for (i = 0; i < m.deps.length; i++) {
            internalLoad(m.deps[i], m, m.skipSource);
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
     * @param name {string}
     * @param root {Object|null}
     * @param skipSource {boolean}
     */
    var internalLoad = function (name, root, skipSource) {
        var i;

        // Create module
        var m = createModule(name, skipSource);

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
            var targetObject = internalGet(name);
            if (targetObject != null) {
                // Script already loaded
                scriptLoaded(name, true);
            } else {
                // Find source path
                var sourcePath = "";
                var sourceFileMode = false;
                var sourceNamespace = null;
                for (i = 0; i < sourcePaths.length; i++) {
                    var sourcePathItem = sourcePaths[i];
                    var sourcePattern = sourcePathItem.pattern;
                    if (sourcePattern != null) {
                        var rex = new RegExp(sourcePattern);
                        if (rex.test(name)) {
                            sourcePath = sourcePathItem.path;
                            sourceFileMode = sourcePathItem.filemode;
                            sourceNamespace = sourcePathItem.namespace;
                        }
                    } else {
                        sourcePath = sourcePathItem.path;
                        sourceFileMode = sourcePathItem.filemode;
                        sourceNamespace = sourcePathItem.namespace;
                    }
                }
                if (sourceNamespace != null) {
                    sourceNamespace = sourceNamespace.split(".");
                }

                // Build source file
                var sourceFile;
                var nameList = name.toLowerCase().split(".");
                sourceFile = sourcePath;
                for (i = 0; i < nameList.length; i++) {
                    if (sourceNamespace != null && i < sourceNamespace.length) {
                        if (nameList[i] != sourceNamespace[i]) {
                            sourceFile += nameList[i];
                            if (i < nameList.length - 1) {
                                sourceFile += sourceFileMode ? "." : "/";
                            }
                        }
                    } else {
                        sourceFile += nameList[i];
                        if (i < nameList.length - 1) {
                            sourceFile += sourceFileMode ? "." : "/";
                        }
                    }
                }
                sourceFile += ".js";

                // Set source file - to differ between direct embedded scripts and autoloaded scripts
                m.sourceFile = sourceFile;

                // Create script tag
                if (loadType === "script") {
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
                } else if (loadType == "load") {
                    log("Loading source file (direct): " + sourceFile, logLevel.Debug);
                    try {
                        if (typeof window.load == "undefined") {
                            throw new Error("There is no 'load' function!");
                        }
                        window.load(sourceFile);
                        scriptLoaded(name);
                    } catch (e) {
                        scriptFailed(name, e);
                    }
                } else if (loadType === "node") {
                    var vm = require('vm');
                    var fs = require('fs');
                    try {
                        if (!isNode) {
                            throw new Error("Node environment is not detected, but loadtype was set to node!");
                        }
                        var code = fs.readFileSync(sourceFile, 'utf-8');
                        vm.runInThisContext(code, sourceFile);
                        scriptLoaded(name);
                    } catch (e) {
                        scriptFailed(name);
                    }
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
            executeCallback(m);
        } else if (m.status == moduleStatus.Loaded && m.sourceFile == null) {
            log("Module already loaded via external script file: " + name, logLevel.Info);
            scriptLoaded(m.name);
        }
    };

    var generateLoadID = function () {
        var len = 16,
            hexChars = "0123456789ABCDEF",
            i,
            s;
        s = '';
        for (i = 0; i < len; i++) {
            s += hexChars[Math.floor((Math.random() * (len - 1)) + 1)];
        }
        return s;
    };

    /**
     * Defines a module - does not execute the implementation
     * Uses for execution by using load()
     * @param name {string}
     * @param [reqOrImpl] {Array|function}
     * @param [implAfterReq] {function|Array}
     * @param [version] {string}
     */
    function internalModule(name, reqOrImpl, implAfterReq, version) {
        log("Define module: " + name, logLevel.Debug);
        var m = createModule(name);
        if (typeof version != "undefined") {
            m.version = version;
        }
        if (typeof reqOrImpl != "undefined" && !isFunction(reqOrImpl)) {
            m.deps = reqOrImpl.slice(0);
            if (isFunction(implAfterReq)) {
                m.source = implAfterReq;
            }
        } else if (isFunction(reqOrImpl)) {
            m.source = reqOrImpl;
        }
        m.status = moduleStatus.Loaded;
    }

    /**
     * Loads an module - recursively loads all dependencies
     * @param nameOrNames {string|Array}
     * @param [callback] {Function}
     * @param [skipSource] {boolean}
     */
    var loadModules = function (nameOrNames, callback, skipSource) {
        var i;
        var modulesToLoad = [];
        if (typeof nameOrNames != "undefined") {
            var isNameArray = typeof nameOrNames['splice'] != "undefined";
            if (isNameArray) {
                for (i = 0; i < nameOrNames.length; i++) {
                    modulesToLoad.push(nameOrNames[i]);
                }
            } else if (nameOrNames.length > 0) {
                modulesToLoad.push(nameOrNames);
            }
            // Generate load id and clone full modules into it
            var loadId = generateLoadID();
            if (loadIDs.indexOf(loadId) > -1) {
                throw new Error("Load ID '" + loadId + "' is already present!");
            }
            loadIDs.push(loadId);
            loadStates[loadId] = {
                id: loadId,
                callback: callback,
                required: [].concat(modulesToLoad),
                done: false
            };
            log("Request load: [" + modulesToLoad.join(', ') + "] as " + loadId);

            // Just load all modules without any root/parent
            for (i = 0; i < modulesToLoad.length; i++) {
                internalLoad(modulesToLoad[i], null, skipSource);
            }
        }
    };

    /**
     * Adds a new source path with the given path and pattern
     * @param {String} path
     * @param {string} [pattern]
     * @param {boolean} [filemode]
     * @param {string} [namespace]
     */
    function addSourcePath(path, pattern, filemode, namespace) {
        sourcePaths.push({
            path: path,
            pattern: pattern || null,
            filemode: filemode || false,
            namespace: namespace || null
        });
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
     * Sets the load type (ajax, ajax-sync, script, node)
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

    /**
     * Returns the current state of printing log levels
     * @returns {boolean}
     */
    function isPrintLogLevel() {
        return printLogLevel;
    }

    /**
     * Enable printing of log levels
     * @param value {boolean}
     */
    function setPrintLogLevel(value) {
        printLogLevel = value;
    }

    function getInstalledModules() {
        return installedModules;
    }

    /**
     * Document on ready
     * @param fn {function}
     */
    function ready(fn) {
        document.onreadystatechange = function () {
            var state = document.readyState;
            if (state == 'complete') {
                fn();
            }
        };
    }

    /**
     * Clones the given object
     * @param obj {*}
     * @returns {*}
     */
    var clone = function (obj) {
        return JSON.parse(JSON.stringify(obj));
    };

    /**
     * Returns the milliseconds since start or date epoche
     */
    var msecs = function () {
        return window.performance.now();
    };

    /**
     * Returns the given named property from the root object when it exists,
     * otherwise returns the provided default value or null when no default value are present
     * @returns {*}
     */
    var getProperty = function (root, name, def) {
        return root !== undefined && root[name] !== undefined && root[name] != null ? root[name] : (def !== undefined ? def : null);
    };

    /**
     * Returns true when a event by the given name in the element exists
     * @param el {Element}
     * @param eventName {String}
     * @returns {boolean}
     */
    var isEventSupported = function (el, eventName) {
        var isSupported = (eventName in el);
        if (!isSupported) {
            el.setAttribute(eventName, 'return;');
            isSupported = typeof el[eventName] == 'function';
            el.removeAttribute(eventName);
        }
        return isSupported;
    };

    var countFPS = (function () {
        var lastLoop = (new Date()).getMilliseconds();
        var count = 1;
        var fps = 0;
        return function () {
            var currentLoop = (new Date()).getMilliseconds();
            if (lastLoop > currentLoop) {
                fps = count;
                count = 1;
            } else {
                count += 1;
            }
            lastLoop = currentLoop;
            return fps;
        };
    }());

    // Export core functions
    return {
        module: internalModule,
        load: loadModules,
        log: log,
        has: internalHas,
        getObject: internalGet,
        getInstalledModules: getInstalledModules,
        printModuleStates: printModuleStates,
        LogLevel: logLevel,
        addSourcePath: addSourcePath,
        getDefaultNamespace: getDefaultNamespace,
        setDefaultNamespace: setDefaultNamespace,
        getLoadType: getLoadType,
        setLoadType: setLoadType,
        getLogLevel: getActiveLogLevel,
        setLogLevel: setActiveLogLevel,
        isPrintLogLevel: isPrintLogLevel,
        setPrintLogLevel: setPrintLogLevel,
        ready: ready,
        createXHR: createXHR,
        countFPS: countFPS,
        isEventSupported: isEventSupported,
        getProperty: getProperty,
        msecs: msecs,
        clone: clone
    };
}));