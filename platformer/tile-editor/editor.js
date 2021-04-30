fm.ns('fm.app.Editor');

(function (fm) {
    var State = {
            None: 0,
            Loading: 1,
            Active: 2
        },
        baseViewportMoveSpeed = 4,
        viewportMoveSpeed = 4,
        brush = {
            x: 0,
            y: 0,
            w: 1,
            h: 1,
            erase: false,
            fill: false
        },
        brushSelectXStart = null,
        brushSelectYStart = null,
        currentTileset = null,
        grid = true,
        currentLayer = null,
        mapSize = null,
        lightmaps = {},
        sightmaps = {},
        brightWhite = new fm.gfx.LightValue(1.0, 1.0, 1.0, 1.0);
        ;

    function addClass(element, clazz) {
        if (!element.classList.contains(clazz)) {
            element.classList.add(clazz);
        }
    }

    function hasClass(element, clazz) {
        return element.classList.contains(clazz);
    }

    function removeClass(element, clazz) {
        if (element.classList.contains(clazz)) {
            element.classList.remove(clazz);
        }
    }

    function selectTool(name) {
        var eraseElement = document.getElementById('erase');
        var fillElement = document.getElementById('fill');
        var brushElement = document.getElementById('brush');

        brush.erase = false;
        brush.fill = false;
        removeClass(eraseElement, "pressed");
        removeClass(fillElement, "pressed");
        removeClass(brushElement, "pressed");

        if (name == "erase") {
            brush.erase = true;
            addClass(eraseElement, "pressed");
        } else if (name == "fill") {
            brush.fill = true;
            brush.w = 1;
            brush.h = 1;
            addClass(fillElement, "pressed");
        } else {
            addClass(brushElement, "pressed");
        }
    }

    function Editor() {
        this.tilesetSelector = document.getElementById('ts');
        this.layerContainer = document.getElementById('layers-container');
        this.mapLoadContainer = document.getElementById('map-load-name');
        this.canvas = document.getElementById('canvas');
        this.renderer = fm.gfx.renderer.RendererFactory.create(this.canvas);
        this.viewport = new fm.gfx.Viewport(0, 0, this.renderer.getWidth(), this.renderer.getHeight());
        this.tsCanvas = document.getElementById('ts-canvas');
        this.tsRenderer = fm.gfx.renderer.RendererFactory.create(this.tsCanvas);
        this.rm = new fm.res.ResourceManager();

        // initial map
        this.setMapSize(new fm.geometry.Vec2(2, 2));
        this.resetMap();

        // change listener for options and selections
        var that = this;
        this.tilesetSelector.addEventListener('change', function () {
            var key = that.tilesetSelector.value;
            that.setCurrentTileset(key);
        }, false);
        document.getElementById('grid-option').addEventListener('change', function () {
            grid = !grid;
        }, false);
        document.getElementById('add-layer').addEventListener('click', function () {
            var size = parseInt(document.getElementById('tilesize').value, 10);
            var layer = that.createEmptyLayer(size);
            that.addLayer(layer);
        }, false);
        document.getElementById('map-save').addEventListener('click', function () {
            that.saveMap();
        }, false);
        document.getElementById('map-load').addEventListener('click', function () {
            that.loadMap();
        }, false);
        document.getElementById('map-set-size').addEventListener('click', function () {
            var x = parseInt(document.getElementById('map-x').value, 10);
            var y = parseInt(document.getElementById('map-y').value, 10);
            that.setMapSize(new fm.geometry.Vec2(x, y));
        }, false);
        document.getElementById('erase').addEventListener('click', function () {
            selectTool('erase');
        }, false);
        document.getElementById('brush').addEventListener('click', function () {
            selectTool('brush');
        }, false);
        document.getElementById('fill').addEventListener('click', function () {
            selectTool('fill');
        }, false);

        // Add mouse listeners to canvas
        var updatePos = function (x, y) {
            this.mouse.x = (x - this.canvas.getBoundingClientRect().left) * (this.canvas.width / this.canvas.offsetWidth);
            this.mouse.y = (y - this.canvas.getBoundingClientRect().top) * (this.canvas.height / this.canvas.offsetHeight);
        };
        this.mousestate = [];
        this.mouse = {x: -1, y: -1};
        this.mouseTile = {x: -1, y: -1};
        this.canvas.addEventListener("mousemove", function (e) {
            updatePos.call(this, e.clientX, e.clientY);
        }.bind(this), false);
        this.canvas.addEventListener("mousedown", function (e) {
            updatePos.call(this, e.clientX, e.clientY);
            this.mousestate[e.button] = true;
        }.bind(this), false);
        this.canvas.addEventListener("mouseup", function (e) {
            updatePos.call(this, e.clientX, e.clientY);
            this.mousestate[e.button] = false;
        }.bind(this), false);
        this.canvas.addEventListener("mouseout", function(e){
            this.mouse.x = -1;
            this.mouse.y = -1;
        }.bind(this), false);

        // Disable selection
        this.canvas.onselectstart = function () {
            return false;
        };

        // add mouse listeners to tileset
        this.mouseTs = {x: -1, y: -1};
        var updatePosTs = function (x, y) {
            this.mouseTs.x = (x - this.tsCanvas.getBoundingClientRect().left) * (this.tsCanvas.width / this.tsCanvas.offsetWidth);
            this.mouseTs.y = (y - this.tsCanvas.getBoundingClientRect().top) * (this.tsCanvas.height / this.tsCanvas.offsetHeight);
        };
        this.tsCanvas.addEventListener("mousemove", function (e) {
            updatePosTs.call(this, e.clientX, e.clientY);
        }.bind(this), false);
        this.tsCanvas.addEventListener("mousedown", function (e) {
            updatePosTs.call(this, e.clientX, e.clientY);
            // brush selection start
            brushSelectXStart = this.mouseTs.x;
            brushSelectYStart = this.mouseTs.y;
        }.bind(this), false);
        this.tsCanvas.addEventListener("mouseup", function (e) {
            updatePosTs.call(this, e.clientX, e.clientY);
            // brush selection stop
            brush.x = brushSelectXStart / currentLayer.layer.tileSize | 0;
            brush.y = brushSelectYStart / currentLayer.layer.tileSize | 0;
            brush.w = Math.max((this.mouseTs.x / currentLayer.layer.tileSize | 0) - brush.x, 1);
            brush.h = Math.max((this.mouseTs.y / currentLayer.layer.tileSize | 0) - brush.y, 1);
            brushSelectXStart = null;
            brushSelectYStart = null;
            if (brush.erase) {
                selectTool("brush");
            }
        }.bind(this), false);

        // Add key listeners
        this.keystate = [];
        document.addEventListener("keydown", function (e) {
            this.keystate[-1] = e.ctrlKey;
            this.keystate[e.keyCode ? e.keyCode : e.which] = true;
        }.bind(this), false);
        document.addEventListener("keyup", function (e) {
            this.keystate[e.keyCode ? e.keyCode : e.which] = false;
        }.bind(this), false);

        this.load();
    };

    Editor.prototype.setMapSize = function (s) {
        mapSize = s;
        document.getElementById('map-x').value = mapSize[0];
        document.getElementById('map-y').value = mapSize[1];
        document.getElementById('map-current-size').innerHTML = ' (' + mapSize[0] + ' x ' + mapSize[1] + ')';

        // adjust layer sizes
        if (typeof this.layers !== 'undefined') {
            for (var i = 0; i < this.layers.length; i++) {
                var layerCopy = this.createEmptyLayer(this.layers[i].layer.tileSize);
                this.layers[i].layer.copyTilesInto(layerCopy);
                this.layers[i].layer = layerCopy;
            }
        }

        // adjust viewport bounds
        this.viewport.setBounds(0, 0, mapSize[0] * 128, mapSize[1] * 128);
    };

    Editor.prototype.resetMap = function () {
        this.layers = [];
        var layer = this.createEmptyLayer(32);
        this.addLayer(layer);
    };

    Editor.prototype.load = function () {
        var that = this;
        this.rm.add("../content/tilesets/common.png", "tileset:common", function (key, data, ret) {
            var tileset = new fm.gfx.Tileset();
            tileset.init(that.renderer, key, data, currentLayer.layer.tileSize);
            that.addTileset(key);

            // take first loaded tileset as current one
            if (currentTileset === null) {
                currentTileset = tileset;
            }

            ret(tileset);
        }, "tileset");

        this.rm.add("../content/tilesets/other.png", "tileset:other", function (key, data, ret) {
            var tileset = new fm.gfx.Tileset();
            tileset.init(that.renderer, key, data, currentLayer.layer.tileSize);
            that.addTileset(key);

            // take first loaded tileset as current one
            if (currentTileset === null) {
                currentTileset = tileset;
            }

            ret(tileset);
        }, "tileset");

        this.listMaps();
    };

    Editor.prototype.saveMap = function () {
        var mapName = document.getElementById('map-name').value;

        // generate JSON representation of the map
        var json = {};
        json.width = mapSize[0];
        json.height = mapSize[1];
        json.layers = [];
        for (var i = 0; i < this.layers.length; i++) {
            var layer = this.layers[i].layer;
            var data = [];
            for (var k = 0; k < layer.tiles.length; k++) {
                var tile = layer.tiles[k];
                if (tile === -1) {
                    data.push(-1);
                } else {
                    data.push({
                        tileset: tile.tileset.name,
                        index: tile.tileIndex
                    });
                }
            }
            json.layers.push({
                data: data,
                tilesize: layer.tileSize,
                name: layer.name
            });
        }
        json = JSON.stringify(json);

        // send to server
        var that = this;
        fm.utils.ajax('map-service.php', function () {
                that.listMaps();
                alert('The map has been saved');
            },
            'POST',
            function () {
                alert('Error while saving');
            },
            undefined,
            'action=save&name=' + mapName + '&data=' + json
        );
    };

    Editor.prototype.listMaps = function () {
        this.mapLoadContainer.innerHTML = '';
        var that = this;
        fm.utils.ajax('map-service.php', function (xhr) {
                var maps = xhr.response.split(',');
                for (var i = 0; i < maps.length; i++) {
                    var option = document.createElement('option');
                    var optionValue = document.createAttribute('value');
                    optionValue.value = maps[i];
                    option.setAttributeNode(optionValue);
                    var optionText = document.createTextNode(maps[i]);
                    option.appendChild(optionText);

                    that.mapLoadContainer.appendChild(option);
                }
            },
            'POST',
            function () {
                alert('Error while loading available maps');
            },
            undefined,
            'action=list'
        );
    };

    Editor.prototype.loadMap = function () {
        var name = this.mapLoadContainer.value;
        // set name for map to save to the loaded map's name
        document.getElementById('map-name').value = name;
        var that = this;
        fm.utils.ajax('map-service.php', function (xhr) {
                var json = JSON.parse(xhr.response);
                // empty layers before setting map size, so resizing will not trigger copying of layer contents
                that.layers = [];
                that.setMapSize(new fm.geometry.Vec2(json.width, json.height));
                that.layerContainer.innerHTML = '';
                currentLayer = null;
                for (var i = 0; i < json.layers.length; i++) {
                    var layer = that.createEmptyLayer(json.layers[i].tilesize);
                    layer.name = json.layers[i].name;

                    for (var k = 0; k < json.layers[i].data.length; k++) {
                        var tileData = json.layers[i].data[k];
                        if (tileData !== -1) {
                            var tileset = that.rm.get(tileData.tileset);
                            var tile = tileset.getTile(tileData.index);

                            layer.tiles[k] = tile;
                        }
                    }

                    that.addLayer(layer);
                }
            },
            'POST',
            function () {
                alert('Error while loading map');
            },
            undefined,
            'action=load&name=' + name
        );
    };

    Editor.prototype.addTileset = function (key) {
        var option = document.createElement('option');
        var optionValue = document.createAttribute('value');
        optionValue.value = key;
        option.setAttributeNode(optionValue);
        var optionText = document.createTextNode(key);
        option.appendChild(optionText);

        this.tilesetSelector.appendChild(option);
    };

    Editor.prototype.createEmptyLayer = function (tilesize) {
        // 128px tilesize is the biggest and counts as "one" tile in map size
        var tileSizeFactor = 128 / tilesize;
        var size = new fm.geometry.Vec2(tileSizeFactor * mapSize[0], tileSizeFactor * mapSize[1]);
        var layer = new fm.map.TileLayer(tilesize, size, 'Layer ' + this.layers.length);

        return layer;
    };

    Editor.prototype.addLayer = function (layer, visible) {
        if (typeof visible === 'undefined') {
            visible = true;
        }

        var layerElement = document.createElement('div');
        var index = this.layers.length;
        var html = '<span class="name" id="layer_' + index + '_name">' + layer.name + '</span><span class="tilesize"> [' + layer.tileSize + ']</span>';
        html += '<button id="layer_' + index + '_up" class="up">^</button>';
        html += '<button id="layer_' + index + '_down" class="down">v</button>';
        html += '<span class="visible"><input type="checkbox" id="layer_' + index + '"';
        if (visible) {
            html += 'checked="checked"';
        }
        html += '/></span>';
        layerElement.innerHTML = html;
        this.layerContainer.appendChild(layerElement);

        var getChildIndex = function (child) {
            var i = 0;
            while ((child = child.previousSibling) != null) {
                i++;
            }

            return i;
        };

        var that = this;
        var blur = function (element) {
            var text = element.innerText ? element.innerText : element.textContent;
            var i = getChildIndex(element.parentNode);
            that.layers[i].layer.name = text;
            element.removeAttribute('contentEditable');
        };
        document.getElementById('layer_' + index + '_name').addEventListener('dblclick', function (event) {
            var attribute = document.createAttribute('contentEditable');
            attribute.value = 'true';
            event.currentTarget.setAttributeNode(attribute);
            event.currentTarget.contentEditable = 'true';
            event.currentTarget.addEventListener('keydown', function (e) {
                var code = e.keyCode ? e.keyCode : e.which;
                if (code === 13) {
                    blur(e.currentTarget);
                }
                e.stopPropagation();
            }, false);
        }, false);
        document.getElementById('layer_' + index + '_name').addEventListener('blur', function (event) {
            blur(event.currentTarget);
        }, false);
        layerElement.addEventListener('click', function (event) {
            var i = getChildIndex(event.currentTarget);
            that.setCurrentLayer(i);
        }, false);
        document.getElementById('layer_' + index).addEventListener('click', function (event) {
            var i = getChildIndex(event.currentTarget.parentNode.parentNode);
            that.layers[i].visible = !that.layers[i].visible;
            event.stopPropagation();
        }, false);
        document.getElementById('layer_' + index + '_up').addEventListener('click', function (event) {
            var layerElement = event.currentTarget.parentNode;
            var i = getChildIndex(layerElement);
            layerElement.parentNode.insertBefore(layerElement, layerElement.previousSibling);
            that.layers.swap(i, i - 1);
        }, false);
        document.getElementById('layer_' + index + '_down').addEventListener('click', function (event) {
            var layerElement = event.currentTarget.parentNode;
            var i = getChildIndex(layerElement);
            layerElement.parentNode.insertBefore(layerElement.nextSibling, layerElement);
            that.layers.swap(i, i + 1);
        }, false);

        this.layers.push({
            layer: layer,
            element: layerElement,
            visible: true
        });

        if (currentLayer === null) {
            this.setCurrentLayer(0);
        }
    };

    Editor.prototype.setCurrentLayer = function (layerIndex) {
        if (layerIndex < this.layers.length) {
            if (currentLayer !== null) {
                // adjust tile size
                var prevTileSize = currentLayer.layer.tileSize;
                var newTileSize = this.layers[layerIndex].layer.tileSize;
                if (currentTileset !== null) {
                    currentTileset.setTileSize(newTileSize);
                }
                var tileSizeFactor = prevTileSize / newTileSize;
                brush.w = Math.max(1, brush.w * tileSizeFactor | 0);
                brush.h = Math.max(1, brush.h * tileSizeFactor | 0);
                brush.x = Math.max(0, brush.x * tileSizeFactor | 0);
                brush.y = Math.max(0, brush.y * tileSizeFactor | 0);

                // de-activate former layer
                currentLayer.element.removeAttribute('class');
                currentLayer = null;
            }

            // set new layer
            currentLayer = this.layers[layerIndex];
            var attr = document.createAttribute('class');
            attr.value = 'selected';
            currentLayer.element.setAttributeNode(attr);
        }
    };

    Editor.prototype.autoSelectCurrentLayer = function(inc) {
        var index = -1;
        if (currentLayer !== null) {
            for (var i = 0; i < this.layers.length; i++) {
                if (this.layers[i] == currentLayer) {
                    index = i;
                    break;
                }
            }
            index = Math.max(Math.min(index + inc, this.layers.length-1), 0);
        } else if (this.layers.length > 0) {
            index = 0;
        }
        if (index > -1) {
            this.setCurrentLayer(index);
        }
    };

    Editor.prototype.setCurrentTileset = function (key) {
        currentTileset = this.rm.get(key);
        currentTileset.setTileSize(currentLayer.layer.tileSize);
    };

    Editor.prototype.drawLoading = function () {
        this.renderer.clear();
        this.renderer.fillRect(0, 0, this.canvas.width, this.canvas.height, '#000');
        this.renderer.fillText(this.canvas.width * 0.5, this.canvas.height * 0.5, "Loading resources: " + this.rm.getProgressCount() + " / " + this.rm.getPendingCount(), "white");
    };

    Editor.prototype.drawGrid = function () {
        if (!grid) {
            return;
        }
        var v = this.viewport;
        var tilesize = currentLayer.layer.tileSize;

        var minX = v.getOffsetX() / tilesize | 0;
        var minY = v.getOffsetY() / tilesize | 0;
        var maxX = minX + 2 + (v.getWidth() / tilesize | 0);
        var maxY = minY + 2 + (v.getHeight() / tilesize | 0);

        for (var y = minY; y <= maxY; y++) {
            this.renderer.drawLine(minX * tilesize, y * tilesize, maxX * tilesize, y * tilesize, '#999');
        }
        for (var x = minX; x <= maxX; x++) {
            this.renderer.drawLine(x * tilesize, minY * tilesize, x * tilesize, maxY * tilesize, '#999');
        }
    };

    Editor.prototype.drawBrush = function () {
        if (this.mouse.x < 0 || this.mouse.y < 0) return;

        var mouseTileX = (this.mouse.x + this.viewport.getOffsetX()) / currentLayer.layer.tileSize | 0;
        var mouseTileY = (this.mouse.y + this.viewport.getOffsetY()) / currentLayer.layer.tileSize | 0;

        // draw brush border
        var topLeftX = mouseTileX * currentLayer.layer.tileSize;
        var topLeftY = mouseTileY * currentLayer.layer.tileSize;
        var w = brush.w * currentLayer.layer.tileSize;
        var h = brush.h * currentLayer.layer.tileSize;
        this.renderer.strokeRect(topLeftX, topLeftY, w, h, '#f00');

        if (brush.erase) {
            // draw diagonal lines
            this.renderer.push();
            this.renderer.clip(topLeftX, topLeftY, w, h);
            for (var i = 0; i <= 2 * Math.max(w, h); i += 4) {
                this.renderer.drawLine(topLeftX + i, topLeftY, topLeftX, topLeftY + i, '#f00', 1);
            }
            this.renderer.pop();
        } else {
            // draw brush tile
            this.renderer.drawTexture(currentTileset.getTexture(), topLeftX, topLeftY, w, h, brush.x * currentLayer.layer.tileSize, brush.y * currentLayer.layer.tileSize, brush.w * currentLayer.layer.tileSize, brush.h * currentLayer.layer.tileSize, 0.5);
        }
    };

    Editor.prototype.drawTileset = function () {
        // tileset itself
        this.tsRenderer.drawTexture(currentTileset.getTexture(), 0, 0, 320, 320);

        // current brush selection
        if (brushSelectXStart !== null) {
            // currently selecting
            var brushX = brushSelectXStart / currentLayer.layer.tileSize | 0;
            var brushY = brushSelectYStart / currentLayer.layer.tileSize | 0;
            var brushW = Math.max((this.mouseTs.x / currentLayer.layer.tileSize | 0) - brushX, 1);
            var brushH = Math.max((this.mouseTs.y / currentLayer.layer.tileSize | 0) - brushY, 1);

            this.tsRenderer.strokeRect(brushX * currentLayer.layer.tileSize, brushY * currentLayer.layer.tileSize, brushW * currentLayer.layer.tileSize, brushH * currentLayer.layer.tileSize, '#0f0');
        } else if (brush !== null) {
            this.tsRenderer.strokeRect(brush.x * currentLayer.layer.tileSize, brush.y * currentLayer.layer.tileSize, brush.w * currentLayer.layer.tileSize, brush.h * currentLayer.layer.tileSize, '#f00');
        }
    };

    Editor.prototype.draw = function () {
        var r = this.renderer;
        var v = this.viewport;

        // map canvas
        r.clear();
        r.push();
        r.translate(-v.getOffsetX(), -v.getOffsetY());

        // draw map bg
        r.fillRect(0, 0, mapSize[0] * 128, mapSize[1] * 128, '#fff');
        
        // generate lightmaps and sightmaps
    	for (var i = 0; i < 4; i++) {
    		var tilesize = Math.pow(2, i+4);
    		var tileSizeFactor = 128 / tilesize;
    		var size = new fm.geometry.Vec2(tileSizeFactor * mapSize[0], tileSizeFactor * mapSize[1]);
    		lightmaps[tilesize] = Array.apply(null, new Array(size[0] * size[1])).map(fm.gfx.LightValue.prototype.dim.bind(brightWhite));
    		sightmaps[tilesize] = Array.apply(null, new Array(size[0] * size[1])).map(Number.prototype.valueOf, 1.0);
    	}
        
        // draw layers
        for (var i = 0; i < this.layers.length; i++) {
            var l = this.layers[i];
            if (l.visible) {
                l.layer.renderLayer(r, v, lightmaps[l.layer.tileSize], sightmaps[l.layer.tileSize]);
            }
        }

        this.drawGrid();
        this.drawBrush();
        r.pop();

        // tileset canvas
        this.tsRenderer.clear();
        this.drawTileset();
    };

    Editor.prototype.update = function () {
        if (this.keystate[-1]) {
            viewportMoveSpeed = 4 * baseViewportMoveSpeed;
        } else {
            viewportMoveSpeed = baseViewportMoveSpeed;
        }
        if (this.keystate[fm.game.Keys.Up]) {
            this.viewport.setOffset(this.viewport.getOffsetX(), this.viewport.getOffsetY() - viewportMoveSpeed);
        }
        if (this.keystate[fm.game.Keys.Down]) {
            this.viewport.setOffset(this.viewport.getOffsetX(), this.viewport.getOffsetY() + viewportMoveSpeed);
        }
        if (this.keystate[fm.game.Keys.Left]) {
            this.viewport.setOffset(this.viewport.getOffsetX() - viewportMoveSpeed, this.viewport.getOffsetY());
        }
        if (this.keystate[fm.game.Keys.Right]) {
            this.viewport.setOffset(this.viewport.getOffsetX() + viewportMoveSpeed, this.viewport.getOffsetY());
        }
        if (this.keystate[fm.game.Keys.PageDown]) {
            this.autoSelectCurrentLayer(1);
            this.keystate[fm.game.Keys.PageDown] = false;
        } else if (this.keystate[fm.game.Keys.PageUp]) {
            this.autoSelectCurrentLayer(-1);
            this.keystate[fm.game.Keys.PageUp] = false;
        }

        // drawing
        if (!(this.mouse.x < 0 || this.mouse.y < 0) && this.mousestate[0]) {
            var tileX = (this.mouse.x + this.viewport.getOffsetX()) / currentLayer.layer.tileSize | 0;
            var tileY = (this.mouse.y + this.viewport.getOffsetY()) / currentLayer.layer.tileSize | 0;

            if (brush.fill) {
                var prevTile = currentLayer.layer.get(tileX, tileY);
                if (prevTile != null) {
                    var newTile = currentTileset.getTile(brush.x, brush.y);
                    currentLayer.layer.fill(tileX, tileY, prevTile, newTile);
                }
            } else {
                // copy current brush to/erase that location
                for (var x = brush.x; x < brush.x + brush.w; x++) {
                    for (var y = brush.y; y < brush.y + brush.h; y++) {
                        if (brush.erase) {
                            currentLayer.layer.set(tileX + x - brush.x, tileY + y - brush.y, -1);
                        } else {
                            var tile = currentTileset.getTile(x, y);
                            currentLayer.layer.set(tileX + x - brush.x, tileY + y - brush.y, tile);
                        }
                    }
                }
            }
        }
    };

    Editor.prototype.run = function () {
        this.state = State.Loading;
        this.rm.start();

        var loop = function (msecs) {
            window.requestAnimationFrame(loop.bind(this));
            if (this.state == State.Loading) {
                if (!this.rm.isDone()) {
                    this.drawLoading();
                } else {
                    this.state = State.Active;
                }
            } else if (this.state == State.Active) {
                this.update();
                this.draw();
            }
        };
        loop.call(this, 0);
    };

    fm.app.Editor = Editor;
})(fm);