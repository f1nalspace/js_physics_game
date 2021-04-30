/**
 * Created by final on 09.01.2014.
 */
fm.ns("fm.res.ResourceManager");
fm.req("fm.utils");

(function (res, utils, log) {
    var ResourceType = {
        Plain: 1,
        Image: 2,
        Audio: 3
    };

    function ResourceManager() {
        this.pendingCount = 0;
        this.pending = [];
        this.pendingKeys = {};
        this.progressCount = 0;
        this.failedCount = 0;
        this.loaded = {};
        this.loading = false;
        this.categories = {};
        this.log = [];

        // TODO: Dont like the fact that the audio context is created here
        this.audioContext = new window.AudioContext();
    }

    /**
     * Adds a new dependency to the given category
     * @param cat {string} Category key
     * @param dep {string} Dependency category key
     */
    ResourceManager.prototype.addDependency = function(cat, dep) {
        var c = this.categories[cat];
        if (typeof c == "undefined") {
            c = [];
            this.categories[cat] = c;
        }
        if (c.indexOf(dep) != -1) {
            throw new Error("Dependency '"+dep+"' does already exists in category '"+cat+"'!")
        }
        c.push(dep);
    };

    ResourceManager.prototype.isDone = function() {
        return this.loading && (this.progressCount + this.failedCount) == this.pendingCount;
    };

    ResourceManager.prototype.hasPending = function() {
        return this.pendingCount > 0;
    };

    ResourceManager.prototype.getPendingCount = function() {
        return this.pendingCount;
    };

    ResourceManager.prototype.getProgressCount = function() {
        return this.progressCount + this.failedCount;
    };

    ResourceManager.prototype.get = function (key) {
        return this.loaded[key] || null;
    };

    ResourceManager.prototype.add = function (url, key, callback, category) {
        if (typeof this.pendingKeys[key] != "undefined") {
            throw new Error("Resource by key '" + key + "' already in queue!");
        }
        if (typeof this.loaded[key] != "undefined") {
            throw new Error("Resource by key '" + key + "' already loaded!");
        }
        var pending = {
            url: url,
            key: key,
            callback: callback,
            category: category || null
        };
        this.pendingKeys[key] = pending;
        this.pending[this.pendingCount++] = pending;
    };

    ResourceManager.prototype.getResourceType = function(url) {
        if (url.toLowerCase().endsWith(".png") || url.toLowerCase().endsWith(".jpg")) {
            return ResourceType.Image;
        } else if (url.toLowerCase().endsWith(".sound")) {
            // "pseudo" suffix to let feature detection decide whether we need .ogg or .aac
            return ResourceType.Audio;
        }
        return ResourceType.Plain;
    };

    ResourceManager.prototype.start = function () {
        var that = this;

        if (this.loading) {
            throw new Error("Resource loader is already started!");
        }

        this.progressCount = 0;
        this.failedCount = 0;
        this.loading = true;
        this.log.length = 0;

        // Calculate category count
        // Init category state
        var catCount = {};
        var catState = {};
        var catWaiting = {};
        this.pending.forEach(function(pending){
            var cat = pending.category;
            if (cat != null) {
                if (typeof catCount[cat] == "undefined") {
                    catCount[cat] = 0;
                    catState[cat] = 0;
                    catWaiting[cat] = [];
                }
                catCount[cat]++;
            }
        });

        var areDepsMet = function(cat) {
            // We have dependencies for that pending category - check any of them
            var deps = that.categories[cat];
            var allmet = true;
            if (typeof deps != "undefined" && deps.length > 0) {
                for (var i = 0; i < deps.length; i++) {
                    var dep = that.categories[cat][i];
                    if (dep == cat) {
                        throw new Error("Circular dependency for '"+cat+"' detected!");
                    }

                    // When one dep are not met - we cannot execute the callback but must be save the resulted data
                    // which can be triggered by any other resource
                    if (catState[dep] != catCount[dep]) {
                        allmet = false;
                        break;
                    }
                }
            }
            return allmet;
        };

        var load = function load(pending, typeName, data) {
            log("Load '"+pending.category+"' with url '" + pending.url + "' as '" + pending.key + "'");

            // Execute callback
            that.log.push(pending.key + " (" + typeName + ")");
            pending.callback(pending.key, data, function(item) {
            	that.loaded[pending.key] = item;
            	
            	// Increase the category state when needed
            	if (pending.category != null) {
            		catState[pending.category]++;
            	}
            	
            	// Go through all waiting items which was require this dependency - when all other deps was loaded, we can execute the load
            	for (var k in catWaiting) {
            		if (catWaiting.hasOwnProperty(k)) {
            			if (areDepsMet(k)) {
            				for (var j = 0; j <  catWaiting[k].length; j++) {
            					var waitItem = catWaiting[k][j];
            					if (typeof that.loaded[waitItem.pending.key] == "undefined") {
            						load(waitItem.pending, waitItem.typeName, waitItem.data);
            					}
            				}
            			}
            		}
            	}
            });

        };

        var done = function(typeName, pending, data) {
            var cat = pending.category;

            // When no category are defined or no deps found, we can load the result directly
            if (cat == null || typeof that.categories[cat] == "undefined") {
                load(pending, typeName, data);
            } else {
                // There are dependencies for this category - add it to the waiting list
                // Dependeny resource will load it later on automatically
                catWaiting[cat].push({
                    typeName: typeName,
                    pending: pending,
                    data: data
                });
            }
        };

        var count = this.pendingCount;

        var finished = function() {
            that.pendingKeys = {};
            that.pending = [];
        };

        var failed = function(typeName, pending) {
            log(typeName + "-Download failed for '" + pending.url + "'!");
            that.failedCount++;
            if ((that.progressCount + that.failedCount) == count) {
                finished();
            }
        };

        var success = function(typeName, pending, data) {
            log(typeName + "-Download successfully for '" + pending.url + "' as '" + pending.key + "'");
            done(typeName, pending, data);
            that.progressCount++;
            if ((that.progressCount + that.failedCount) == count) {
                finished();
            }
        };

        this.pending.forEach(function(pending){
            log("Retrieve '" + pending.url + "' as '" + pending.key + "'");
            var resType = that.getResourceType(pending.url);
            if (resType == ResourceType.Image) {
                var newImage = new Image();
                newImage.onload = function() {
                    success("Image", pending, newImage);
                };
                newImage.onerror = newImage.onabort = function(){
                    failed("Image", pending);
                };
                newImage.src = pending.url;
            } else if (resType === ResourceType.Audio) {
                // usually assume AAC (m4a)
                var url = pending.url.replace('.sound', '.m4a');
                if (utils.canPlayOgg()) {
                	// if ogg is supported, take that
                	url = url.replace('.m4a', '.ogg');
                }
                var audio = {
                    context: that.audioContext,
                    buffer: null
                };
                utils.ajax(url, function (xhr) {
                    that.audioContext.decodeAudioData(xhr.response, function(decodedData){
                        audio.buffer = decodedData;
                        success("Audio", pending, audio);
                    }, function(e){
                        failed("Audio", pending);
                    });
                }, "get", function () {
                    failed("Audio", pending);
                }, "arraybuffer");
            } else {
                utils.ajax(pending.url, function (xhr) {
                    success("Ajax", pending, xhr);
                }, "get", function () {
                    failed("Ajax", pending);
                });
            }
        });
    };
    res.ResourceManager = ResourceManager;
})(fm.res, fm.utils, fm.log);