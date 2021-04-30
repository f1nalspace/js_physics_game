final.module("final.towadev",
    [
        "final.vec",
        "final.vec2math",
        "final.utils",
        "final.game",
        "final.profiler",
        "final.console",
        "final.pathfinding",
        "final.images",
        "final.ui",
        "final.ui.button",
        "final.ui.carousel",
        "final.towadev.map",
        "final.towadev.menu",
        "final.towadev.entity.entities",
        "final.towadev.bullet",
        "final.towadev.weapon",
        "final.towadev.entity.tower",
        "final.towadev.entity.enemy",
        "final.towadev.entity.spawner",
        "final.towadev.entity.area",
        "final.renderer"
    ],
    function (final,
              vec,
              vec2math,
              utils,
              game,
              profiler,
              console,
              pathfinding,
              images,
              ui,
              button,
              carousel,
              map,
              menu,
              entities,
              bullet,
              weapon,
              tower,
              enemy,
              spawner,
              area,
              renderer,
              _module) {

        var Vec2 = vec.Vec2,
            Map = map.Map,
            Tiles = map.Tiles,
            Game = game.Game,
            MouseButton = game.MouseButton,
            GameInitState = game.GameInitState,
            Menu = menu.Menu,
            Entities = entities.Entities,
            GrowablePool = utils.GrowablePool,
            HashMap = utils.HashMap,
            StopWatch = utils.StopWatch,
            FixedPool = utils.FixedPool,
            UIManager = ui.UIManager,
            Button = button.Button,
            Carousel = carousel.Carousel,
            Bullet = bullet.Bullet,
            BulletType = bullet.BulletType,
            Tower = tower.Tower,
            Enemy = enemy.Enemy,
            EnemyAction = enemy.EnemyAction,
            EntitySpawner = spawner.EntitySpawner,
            Weapon = weapon.Weapon,
            AStar = pathfinding.AStar,
            Area = area.Area,
            Profiler = profiler.Profiler,
            Transform = renderer.Transform;

        var version = _module.version;

        var State = {
            None: 0,
            Menu: 1,
            LevelRunning: 10,
            LevelComplete: 11,
            LevelOnly: 12,
            GameOver: 20
        };

        var osdFont = {
            name: "Arial",
            size: 0.5,
            style: "normal"
        };

        var debugFont = {
            name: "Arial",
            size: 0.3,
            style: "normal"
        };

        var warningFont = {
            name: "Arial",
            size: 0.4,
            style: "italic"
        };

        var gameOverFont = {
            name: "Arial",
            size: 2.5,
            style: "normal",
            width: 0.04,
            blur: 0.2
        };

        var gameWinFont = {
            name: "Arial",
            size: 4,
            style: "italic",
            width: 0.04,
            blur: 0.4
        };

        var gamePauseFont = {
            name: "Arial",
            size: 3,
            style: "italic",
            blur: 0.4,
            width: 0.04,
            fillStyle: "white",
            strokeStyle: "black"
        };
        var gameContinueFont = {
            name: "Arial",
            size: 1.25,
            style: "italic",
            blur: 0.1,
            fillStyle: "white"
        };

        var defaultInitialMoney = 500;
        var defaultWaveTimerDuration = 5;

        var imagesToLoad = [
            "tower.png",
            "tower_medium.png",
            "tower_small.png",
            "weapon.png",
            "arrows.png",
            "money.png",
            "upgrade.png",
            "maptileset.png"
        ];

        var towerPickerSize = new Vec2(5, 1),
            towerPickerItemSize = new Vec2(1, 1),
            towerPickerItemPadding = new Vec2(0.1, 0.1),
            towerPickerButtonSize = new Vec2(1, 1),
            towerButtonSize = new Vec2(1, 1);

        var getModProperty = function (root, name, def) {
            return root !== undefined && root[name] !== undefined && root[name] != null ? root[name] : def;
        };

        /**
         * Towadev class constructor
         * @param canvasId
         * @constructor
         */
        function TowaDev(canvasId) {
            Game.call(this, canvasId);
            var that = this;

            this.version = version;
            this.map = new Map(this);
            this.entities = new Entities(this);
            this.sortedEntities = [];

            this.hoverTilePos = new Vec2(0, 0);

            this.enemyPath = [];
            this.money = 0;
            this.lives = 10;
            this.bulletPool = new GrowablePool(50, 5);
            this.bulletPool.createFunc = function () {
                return that.createBullet();
            };
            this.enemies = new HashMap();
            this.waves = new HashMap();
            this.weapons = new HashMap();
            this.towers = new HashMap();
            this.towerPool = new GrowablePool(50, 5);
            this.towerPool.createFunc = function () {
                return that.createTower();
            };
            this.currentWaveIndex = -1;
            this.currentWaveId = null;
            this.waveTimer = new StopWatch();

            this.enemyId = null;
            this.enemySpawner = null;
            this.enemyPool = new FixedPool(50);
            this.enemyPool.createFunc = function () {
                return that.createEnemy();
            };
            this.state = State.None;
            this.gameProperties = {};

            this.towerId = null;
            this.towerPreviews = new HashMap();
            this.towerInstances = new HashMap();
            this.selectedTower = null;
            this.towerPlaceMoved = false;

            this.menu = new Menu(this);

            this.images = new HashMap();
            this.imageScale = 4;

            var k;

            var emptySpace = this.displayDimension.y - 10;

            this.uiMng = new UIManager(this);
            this.towerPicker = new Carousel(this, new Vec2(this.displayDimension.x * 0.5 - towerPickerSize.x * 0.5, this.displayDimension.y - emptySpace * 0.5 - towerPickerSize.y * 0.5), towerPickerSize, towerPickerItemSize, towerPickerItemPadding, towerPickerButtonSize);
            this.towerPicker.captionPos = new Vec2(0, -0.75);
            this.towerPicker.buttonLeft.hintPos = new Vec2(0, -0.75);
            this.towerPicker.buttonRight.hintPos = new Vec2(0, -0.75);
            for (k in this.towerPicker.buttonLeft.effectStates) {
                if (this.towerPicker.buttonLeft.effectStates.hasOwnProperty(k)) {
                    this.towerPicker.buttonLeft.effectStates[k].shadow = null;
                }
            }
            for (k in this.towerPicker.buttonRight.effectStates) {
                if (this.towerPicker.buttonRight.effectStates.hasOwnProperty(k)) {
                    this.towerPicker.buttonRight.effectStates[k].shadow = null;
                }
            }
            this.towerPicker.changed = function (self, item) {
                that.changeTower(item);
            };
            this.uiMng.add(this.towerPicker);
            this.sellButton = new Button(this, new Vec2(0, 0), towerButtonSize);
            this.sellButton.click = function () {
                that.sellTower();
            };
            this.sellButton.visible = false;
            this.uiMng.add(this.sellButton);
            this.upgradeButton = new Button(this, new Vec2(0, 0), towerButtonSize);
            this.upgradeButton.click = function () {
                that.upgradeTower();
            };
            this.upgradeButton.visible = false;
            this.uiMng.add(this.upgradeButton);

            this.chenabled = false;
            this.dbgEnabled = false;
            this.debugDrawStates = {
                MenuArea: false,
                MenuDeadZone: false,
                WeaponCooldown: false
            };
        }

        TowaDev.extend(Game);

        TowaDev.prototype.playGame = function() {
            this.state = State.LevelRunning;
        };

        TowaDev.prototype.exitGame = function() {
            window.close();
        };

        TowaDev.prototype.createBullet = function () {
            var bullet = new Bullet(this, null);
            bullet.alive = false;
            return bullet;
        };

        TowaDev.prototype.createTower = function () {
            var tower = new Tower(this, null);
            tower.alive = false;
            return tower;
        };

        TowaDev.prototype.createEnemy = function () {
            var enemy = new Enemy(this);
            enemy.alive = false;
            return enemy;
        };

        TowaDev.prototype.addConsoleCommands = function () {
            Game.prototype.addConsoleCommands.call(this);
            if (this.console != null) {
                var that = this;
                this.console.addCommand("cheats", function (cmd, args, con) {
                    if (args.length == 2) {
                        that.chenabled = args[0] === "are" && args[1] === "lame";
                    }
                    con.addLine("Cheats is " + (that.chenabled ? "enabled" : "disabled"), true);
                });
                this.console.addCommand("debug", function (cmd, args, con) {
                    if (args.length == 1) {
                        that.dbgEnabled = args[0] === "yes" || args[0] === "1" || args[0] === "true";
                    }
                    con.addLine("Debug is " + (that.dbgEnabled ? "enabled" : "disabled"), true);
                });
                this.console.addCommand("money", function (cmd, args, con) {
                    if (!that.chenabled) {
                        con.addLine("Command is cheat protected!", true);
                        return;
                    }
                    if (args.length == 1) {
                        that.money = parseInt(args[0], 10);
                    }
                });
                this.console.addCommand("lives", function (cmd, args, con) {
                    if (!that.chenabled) {
                        con.addLine("Command is cheat protected!", true);
                        return;
                    }
                    if (args.length == 1) {
                        that.lives = parseInt(args[0], 10);
                    }
                });
                this.console.addCommand("wave", function (cmd, args, con) {
                    if (!that.chenabled) {
                        con.addLine("Command is cheat protected!", true);
                        return;
                    }
                    if (args.length == 1) {
                        var index = parseInt(args[0], 10);
                        that.changeWave(index - 1);
                    }
                    con.addLine("Wave is: " + (that.currentWaveIndex + 1), true);
                });
                this.console.addCommand("autopause", function (cmd, args, con) {
                    if (args.length == 1) {
                        that.autoPause = args[0] === "yes" || args[0] === "1" || args[0] === "true";
                    }
                    con.addLine("Autopause is " + (that.autoPause ? "enabled" : "disabled"), true);
                });
                for (var k in this.debugDrawStates) {
                    if (this.debugDrawStates.hasOwnProperty(k)) {
                        this.console.addCommand("draw" + k, function (cmd, args, con) {
                            var drawKey = cmd.substr(4);
                            var enabled = that.debugDrawStates[drawKey];
                            if (args.length == 1) {
                                enabled = args[0] === "yes" || args[0] === "1" || args[0] === "true";
                            }
                            that.debugDrawStates[drawKey] = enabled;
                            con.addLine("Draw "+drawKey+" is " + (enabled ? "enabled" : "disabled"), true);
                        });
                    }
                }
            }
        };

        TowaDev.prototype.loadResources = function(r) {
            var that = this;

            // Load map resource
            this.addResource("maps/map.json", "map:map", function (key, xhr) {
                var obj = JSON.parse(xhr.responseText);
                that.map.import(obj);
                final.log("Loaded map '" + key + "' successfully");
            });

            // Load game resources
            this.addResource("game/game.json", "game:game", function (key, xhr) {
                that.gameProperties = JSON.parse(xhr.responseText);
                final.log("Loaded game properties '" + key + "' successfully");
            });
            this.addResource("game/enemies.json", "game:enemies", function (key, xhr) {
                var obj = JSON.parse(xhr.responseText);
                utils.loadGameKeys(obj, "enemies", that.enemies);
                final.log("Loaded " + that.enemies.count + " enemies '" + key + "' successfully");
            });
            this.addResource("game/waves.json", "game:waves", function (key, xhr) {
                var obj = JSON.parse(xhr.responseText);
                utils.loadGameKeys(obj, "waves", that.waves);
                final.log("Loaded " + that.waves.count + " waves '" + key + "' successfully");
            });
            this.addResource("game/weapons.json", "game:weapons", function (key, xhr) {
                var obj = JSON.parse(xhr.responseText);
                utils.loadGameKeys(obj, "weapons", that.weapons);
                final.log("Loaded " + that.weapons.count + " weapons '" + key + "' successfully");
            });
            this.addResource("game/towers.json", "game:towers", function (key, xhr) {
                var obj = JSON.parse(xhr.responseText);
                utils.loadGameKeys(obj, "towers", that.towers);
                final.log("Loaded " + that.towers.count + " towers '" + key + "' successfully");
            });

            // Add image resources
            for (var i = 0; i < imagesToLoad.length; i++) {
                this.addResource("images/" + imagesToLoad[i], "image:" + imagesToLoad[i], function (key, image) {
                    that.images.put(key, images.resizeImage(r, image, that.imageScale));
                    final.log("Loaded image '" + key + "' successfully");
                });
            }
        };

        /**
         * Game pre-initialization phase
         * @param r {Renderer}
         */
        TowaDev.prototype.init = function (r) {
            Game.prototype.init.call(this);
            var that = this;

            // Add console commands
            this.console.addLine("Touwa Devu - " + version + " [console]", true);

            // Load resources
            this.loadResources(r);

            // Init pools
            this.bulletPool.init();
            this.enemyPool.init();
            this.towerPool.init();

            // Init menu
            this.menu.init(r);
        };

        TowaDev.prototype.defineEnemy = function (entity, enemyId, waveId) {
            if (!this.enemies.contains(enemyId)) {
                throw new Error("Enemy by id '" + enemyId + "' not found!")
            }
            if (!this.waves.contains(waveId)) {
                throw new Error("Wave by id '" + waveId + "' not found!")
            }
            var def = this.enemies.get(enemyId);
            var wave = this.waves.get(waveId);
            var mods = wave['enemyMods'];
            entity.speed = getModProperty(mods, "speed", def.speed) * getModProperty(mods, "speedFactor", 1);
            entity.minSpeed = entity.speed * 0.1; // Min speed is 10% of speed
            entity.maxSpeed = entity.speed * 10.0; // Max speed is 1000% of speed
            entity.health = getModProperty(mods, 'health', def.health) * getModProperty(mods, "healthFactor", 1);
            entity.bounty = getModProperty(mods, 'bounty', def.bounty) * getModProperty(mods, "bountyFactor", 1);
            entity.armor = getModProperty(mods, 'armor', def.armor) * getModProperty(mods, "armorFactor", 1);
            entity.color = def['color'];
            entity.penalty = getModProperty(def, 'penalty', 1);
            entity.size.x = this.map.tileSize * getModProperty(mods, "sizeFactor", def.sizeFactor);
            entity.size.y = this.map.tileSize * getModProperty(mods, "sizeFactor", def.sizeFactor);
        };

        /**
         * Will be executed when an entity is spawned by a entity spawner
         * @param spawner {EntitySpawner} Spawner
         * @param entity {Enemy} Entity
         */
        TowaDev.prototype.entitySpawned = function (spawner, entity) {
            if (entity instanceof Enemy) {
                entity.reset(this);
                entity.alive = true;
                entity.pos.x = spawner.pos.x;
                entity.pos.y = spawner.pos.y;
                entity.pathQueue.enqueue(this.enemyPath);
                this.defineEnemy(entity, this.enemyId, this.currentWaveId);
                this.entities.add(entity);
            }
        };

        /**
         * Returns the number of enemies left
         * @returns {number}
         */
        TowaDev.prototype.countEnemies = function () {
            var c = 0;
            var entities = this.entities.values();
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                if (entity.alive && entity instanceof Enemy) {
                    c++;
                }
            }
            return c;
        };

        /**
         * Returns true, when the enemy is finished and no enemies are left
         * @returns {boolean}
         */
        TowaDev.prototype.isAllEnemiesKilled = function () {
            // Spawner disabled when all enemies has been spawned
            if (!this.enemySpawner.enabled) {
                // Count how many enemies are alive
                var left = this.countEnemies();
                if (left == 0) {
                    // No enemies are alive in this wave, we can advance to next wave
                    return true;
                }
            }
            return false;
        };

        /**
         * Will be executed when all enemies has been killed or last has reached target
         * Adds a bonus based on the given factor to the count players money
         * Restarts the wave timer when there is more waves to play or execute the level complete method
         * @param bonusFactor {number} Bonus factor 0-1
         */
        TowaDev.prototype.enemiesKilled = function (bonusFactor) {
            // Give 50% bonus to player, when last enemy has reached target
            var curWave = this.waves.get(this.currentWaveId);
            if (curWave['bonus'] !== undefined) {
                this.money += curWave['bonus'] * bonusFactor;
            }

            // Restart wave timer or switch to game complete state
            if (this.currentWaveIndex < this.waves.count - 1) {
                this.waveTimer.restart();
            } else {
                this.levelComplete();
            }
        };

        /**
         * Will be executed when an entity action is executed, like enemy has reached target or enemy died, etc.
         * @param entity {Enemy} Entity
         * @param action {number} Action code
         */
        TowaDev.prototype.entityAction = function (entity, action) {
            if (action == EnemyAction.TargetReached) {
                // Kill enemy
                entity.alive = false;

                // But decrease player live
                this.lives -= entity.penalty;

                // Player dead?
                if (this.lives <= 0) {
                    this.state = State.GameOver;
                    return;
                }

                // All enemies killed - advance to next wave
                if (this.isAllEnemiesKilled()) {
                    this.enemiesKilled(0.5);
                }
            }
        };

        /**
         * Simple callback which will be called, when an new tower has been selected from the ui
         * @param id {string}
         */
        TowaDev.prototype.changeTower = function (id) {
            this.towerId = id;
        };

        TowaDev.prototype.sellTower = function () {
            if (this.selectedTower != null) {
                this.money += this.selectedTower.getSellCost();
                this.selectedTower.alive = false;
                this.unselectTower();
            }
        };

        TowaDev.prototype.upgradeTower = function () {
            if (this.selectedTower != null) {
                // TODO: Implement upgrade function
                this.unselectTower();
            }
        };

        /**
         * Will be executed when an tower weapon want to fire one bullet
         * Creates a bullet, sets it properties and adds it to the bullets pool
         * @param weapon {Weapon} Weapon
         * @param pos {Vec2} Start position
         * @param dir {Vec2} Direction
         */
        TowaDev.prototype.fireBullet = function (weapon, pos, dir) {
            var bullet = this.bulletPool.get();
            bullet.reset();
            bullet.owner = weapon;
            bullet.alive = true;

            var tower = weapon.owner;
            var towerDef = this.towers.get(tower.id);
            var weaponMods = towerDef['weaponmods'];

            if (this.weapons.contains(weapon.weaponId)) {
                var def = this.weapons.get(weapon.weaponId);
                bullet.damage = getModProperty(weaponMods, "bulletDamage", def.bullet['damage']) * getModProperty(weaponMods, "bulletDamageFactor", 1);
                bullet.damageRanges.x = def.bullet['damageRanges'].min;
                bullet.damageRanges.y = def.bullet['damageRanges'].max;
                bullet.speed = getModProperty(weaponMods, "bulletSpeed", def.bullet['speed']) * getModProperty(weaponMods, "bulletSpeedFactor", 1);
                bullet.radius = getModProperty(weaponMods, "bulletRadius", def.bullet['radius']) * getModProperty(weaponMods, "bulletRadiusFactor", 1);
                bullet.type = getModProperty(weaponMods, "bulletType", def.bullet['type']);

                if (bullet.type == BulletType.Area) {
                    var areaDef = def.bullet['area'];
                    bullet.areaType = getModProperty(weaponMods, "bulletAreaType", areaDef['type']);
                    bullet.areaRadius = getModProperty(weaponMods, "bulletAreaRadius", areaDef['radius']) * getModProperty(weaponMods, "bulletAreaRadiusFactor", 1);
                    bullet.areaDuration = getModProperty(weaponMods, "bulletAreaDuration", areaDef['duration']) * getModProperty(weaponMods, "bulletAreaDurationFactor", 1);
                    bullet.areaEffectType = getModProperty(weaponMods, "bulletAreaEffectType", areaDef['effectType']);
                    bullet.areaEffectOp = getModProperty(weaponMods, "bulletAreaEffectOp", areaDef['effectOp']);
                    bullet.areaEffectDelta = getModProperty(weaponMods, "bulletAreaEffectDelta", areaDef['effectDelta']) * getModProperty(weaponMods, "bulletAreaEffectDeltaFactor", 1);
                }
            }

            bullet.pos.x = pos.x + (dir.x * this.map.tileSize * weapon.bulletPosFactor);
            bullet.pos.y = pos.y + (dir.y * this.map.tileSize * weapon.bulletPosFactor);
            bullet.dir.x = dir.x;
            bullet.dir.y = dir.y;
        };

        TowaDev.prototype.enemyHit = function (dt, target, weapon) {
            if (target.health <= 0) {
                target.health = 0;
                target.alive = false;

                this.money += target.bounty;

                // All enemies killed, advance to next wave
                if (this.isAllEnemiesKilled()) {
                    this.enemiesKilled(1.0);
                }
            }
        };

        /**
         * Does change the state to complete - shows the congratulations screen
         */
        TowaDev.prototype.levelComplete = function () {
            this.state = State.LevelComplete;
        };

        /**
         * Increases the wave
         * Sets the new enemy id
         * Restarts the enemy spawner
         */
        TowaDev.prototype.nextWave = function () {
            if (this.currentWaveIndex < this.waves.count - 1) {
                this.currentWaveId = this.waves.keys[++this.currentWaveIndex];
                var nextWave = this.waves.get(this.currentWaveId);
                if (nextWave === undefined) {
                    throw new Error("Wave by id '" + this.currentWaveId + "' not found!");
                }

                // Setup enemy id
                this.enemyId = nextWave['enemy'];
                if (!this.enemies.contains(this.enemyId)) {
                    throw new Error("Enemy by id '" + this.enemyId + "' not found!");
                }

                // Setup and restart enemy spawner
                this.enemySpawner.interval = 1 / nextWave['interval'];
                this.enemySpawner.max = nextWave['count'];
                this.enemySpawner.restart();
            }
        };

        TowaDev.prototype.changeWave = function (index) {
            var waveId = this.waves.keys[index];
            var wave = this.waves.get(waveId);
            if (wave !== undefined && wave != null) {
                // Setup enemy id
                this.enemyId = wave['enemy'];
                if (!this.enemies.contains(this.enemyId)) {
                    throw new Error("Enemy by id '" + this.enemyId + "' not found!");
                }

                this.currentWaveIndex = index;
                this.currentWaveId = waveId;

                // Setup and restart enemy spawner
                this.enemySpawner.interval = 1 / wave['interval'];
                this.enemySpawner.max = wave['count'];
                this.enemySpawner.restart();

                return true;
            }
            return false;
        };

        /**
         * Generate for all tower types preview images
         * @param r {Renderer}
         */
        TowaDev.prototype.genTowerPreviews = function (r) {
            var towerIds = this.towers.keys;
            for (var i = 0; i < towerIds.length; i++) {
                var towerId = towerIds[i];
                var def = this.towers.get(towerId);
                var newtower = new Tower(this);
                newtower.pos.x = newtower.size.x * 0.5;
                newtower.pos.y = newtower.size.y * 0.5;
                this.defineTower(newtower, def);
                var previewCanvasWidth = newtower.size.x * this.metersToPixels;
                var previewCanvasHeight = newtower.size.y * this.metersToPixels;
                var previewImage = r.renderToCanvas(previewCanvasWidth, previewCanvasHeight, function (nr) {
                    newtower.draw(nr);
                }, new Transform(0, 0, this.metersToPixels, this.metersToPixels));
                this.towerPreviews.put(towerId, previewImage);
                final.log("Generated tower preview for " + towerId);
            }
        };

        /**
         * Game loaded state change - will be executed when the resource loader has loaded all resources
         * @param r {Renderer}
         */
        TowaDev.prototype.loaded = function (r) {
            // Level is now running
            if (this.state == State.None) {
                this.state = State.Menu;
            }

            // Map tileset
            this.map.tileset = images.createTileset(r, this.images.get("image:maptileset.png"), 64 * this.imageScale, 64 * this.imageScale);

            // Tower picker buttons
            var arrowTileset = images.createTileset(r, this.images.get("image:arrows.png"), 18 * this.imageScale, 32 * this.imageScale);
            this.towerPicker.buttonLeft.image = arrowTileset[0];
            this.towerPicker.buttonRight.image = arrowTileset[1];
            vec2math.set(this.towerPicker.buttonLeft.imageSize, 0.45, 0.6);
            vec2math.set(this.towerPicker.buttonRight.imageSize, 0.45, 0.6);

            // Sell and upgrade buttons
            this.upgradeButton.image = images.createTileset(r, this.images.get("image:upgrade.png"), 32 * this.imageScale, 32 * this.imageScale);
            this.upgradeButton.enabled = false;
            this.sellButton.image = this.images.get("image:money.png");
            vec2math.set(this.sellButton.imageSize, 0.75, 0.75);
            vec2math.set(this.upgradeButton.imageSize, 0.75, 0.75);

            // Generate tower previews
            this.genTowerPreviews(r);

            // Get tower id from list
            this.towerId = this.towers.firstKey();
            this.money = getModProperty(this.gameProperties, "initialMoney", defaultInitialMoney);

            // Add towers to picker and create tower instances
            var towerKeys = this.towers.keys;
            for (var i = 0; i < towerKeys.length; i++) {
                var key = towerKeys[i];
                var tower = this.towers.get(key);
                this.towerPicker.addItem(key, this.towerPreviews.get(key), tower.name + " - " + tower.cost + " €");

                var towerInstance = new Tower(this, key);
                this.defineTower(towerInstance, tower);
                this.towerInstances.put(key, towerInstance);
            }

            // Get enemy start pos
            var enemyStartPos = this.map.getTilePositionByType(Tiles.EnemyStart);
            var enemyTargetPos = this.map.getTilePositionByType(Tiles.EnemyFinish);

            // Calculate enemy path using a*
            var that = this;
            var pathFinder = new AStar(this.map);
            pathFinder.startPos = enemyStartPos;
            pathFinder.targetPos = enemyTargetPos;
            pathFinder.isBlocked = function (x, y) {
                return !that.map.isWalkableForEnemy(x, y);
            };
            this.enemyPath = pathFinder.findPath();

            // Create entity spawner
            this.enemySpawner = new EntitySpawner(this, "Enemy");
            this.enemySpawner.createFunc = function (entityClass) {
                return that.enemyPool.get();
            };
            this.enemySpawner.pos.x = (enemyStartPos.x * this.map.tileSize) + this.map.tileSize * 0.5;
            this.enemySpawner.pos.y = (enemyStartPos.y * this.map.tileSize) + this.map.tileSize * 0.5;
            this.enemySpawner.entitySpawned = function (spawner, entity) {
                that.entitySpawned(spawner, entity);
            };
            this.addEntity(this.enemySpawner);

            // Setup first wave and start timer
            this.currentWaveId = null;
            this.currentWaveIndex = -1;
            this.waveTimer.target = getModProperty(this.gameProperties, "waveTimerDuration", defaultWaveTimerDuration);
            this.waveTimer.stopped = function () {
                that.nextWave();
            };
            this.waveTimer.start();
        };

        /**
         * Adds an entity to the entity list
         * @param entity {Entity}
         * @returns {Entity}
         */
        TowaDev.prototype.addEntity = function (entity) {
            this.entities.add(entity);
            return entity;
        };

        /**
         * Returns the given tower by world coordinates
         * @param x {number}
         * @param y {number}
         * @returns {Tower}
         */
        TowaDev.prototype.getTower = function (x, y) {
            var entities = this.entities.values();
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                if (entity instanceof Tower) {
                    var tx = Math.floor(entity.pos.x / this.map.tileSize);
                    var ty = Math.floor(entity.pos.y / this.map.tileSize);
                    if (tx == x && ty == y) {
                        return entity;
                    }
                }
            }
            return null;
        };

        /**
         * Sets the given weapon properties like cooldown, range etc. by the retrieved weapon definition
         * @param weaponId {string}
         * @param weapon {Weapon}
         * @param mods {object}
         */
        TowaDev.prototype.setWeaponProperties = function (weaponId, weapon, mods) {
            if (this.weapons.contains(weaponId)) {
                var def = this.weapons.get(weaponId);
                weapon.lockRange = getModProperty(mods, "range", def.range) * getModProperty(mods, "rangeFactor", 1);
                weapon.cooldownTime = getModProperty(mods, "cooldownTime", def.cooldownTime) * getModProperty(mods, "cooldownTimeFactor", 1);
                weapon.weaponId = weaponId;
                weapon.image = this.images.get("image:" + def.image);
                weapon.bulletPosFactor = def.bulletPosFactor;
                weapon.bulletCount = getModProperty(mods, "bulletCount", def.bulletCount) * getModProperty(mods, "bulletCountFactor", 1);
                weapon.bulletScatterRange = getModProperty(mods, "bulletScatterRange", def.bulletScatterRange) * getModProperty(mods, "bulletScatterRangeFactor", 1);
                weapon.bulletSpeed = getModProperty(mods, "bulletSpeed", def.bullet['speed']) * getModProperty(mods, "bulletSpeedFactor", 1);
            }
        };

        /**
         * Sets the given tower properties like cost, weapon by the given tower definition
         * Also sets the given tower image from the images database
         * @param tower {Tower}
         * @param def {object}
         */
        TowaDev.prototype.defineTower = function (tower, def) {
            tower.cost = def.cost;
            tower.image = this.images.get("image:" + def.image);
            tower.hint = def.hint !== undefined ? def.hint : "";
            this.setWeaponProperties(def.weapon, tower.weapon, def['weaponmods']);
        };

        /**
         * Creates a new tower on the given x,y map coordinates and adds it to the entities map
         * @param x {number}
         * @param y {number}
         * @returns {Tower}
         */
        TowaDev.prototype.placeTower = function (x, y) {
            var tower = this.towerPool.get();
            tower.reset();
            tower.id = this.towerId;
            tower.alive = true;
            tower.pos.x = (x * this.map.tileSize) + tower.size.x * 0.5;
            tower.pos.y = (y * this.map.tileSize) + tower.size.y * 0.5;

            var def = this.towers.get(this.towerId);
            this.defineTower(tower, def);

            return this.addEntity(tower);
        };

        /**
         * Returns the given tower state for the x,y map coordinates
         * 0 = Tower can be placed
         * 1 = There is already an tower
         * 2 = Tower cannot be placed on this tile
         * 3 = Not enough money for this tower
         * @param x {number}
         * @param y {number}
         * @returns {number}
         */
        TowaDev.prototype.getTowerPlaceableState = function (x, y) {
            // Are there already a tower placed on this tile?
            if (this.getTower(x, y) == null) {
                // Is map tile placeable for tower?
                if (this.map.getTile(x, y) == Tiles.Placeable) {
                    var def = this.towers.get(this.towerId);
                    if (def === undefined) throw new Error("No definition for tower '" + this.towerId + "' found!");
                    // Do we have enough money for this tower?
                    if (def.cost <= this.money) {
                        // Tower can be placed
                        return 0;
                    } else {
                        // Not enough money
                        return 3;
                    }
                } else {
                    // Map tile is not placeable
                    return 2;
                }
            } else {
                // There is already a tower
                return 1;
            }
        };

        TowaDev.prototype.selectTower = function () {
            this.selectedTower = this.getTower(this.hoverTilePos.x, this.hoverTilePos.y);

            // Sell button
            this.sellButton.pos.x = this.hoverTilePos.x * this.map.tileSize + this.map.tileSize * 0.3 + this.sellButton.size.x;
            this.sellButton.pos.y = this.hoverTilePos.y * this.map.tileSize + this.map.tileSize * 0.7;
            this.sellButton.visible = true;
            this.sellButton.hint = "Sell (" + (this.selectedTower.getSellCost()) + " €)";

            // Upgrade button
            this.upgradeButton.pos.x = this.hoverTilePos.x * this.map.tileSize + this.map.tileSize * 0.3 + this.sellButton.size.x;
            this.upgradeButton.pos.y = this.hoverTilePos.y * this.map.tileSize - this.map.tileSize * 0.35;
            this.upgradeButton.visible = true;
            this.upgradeButton.hint = "Upgrade";
        };

        TowaDev.prototype.unselectTower = function () {
            this.selectedTower = null;
            this.sellButton.visible = false;
            this.upgradeButton.visible = false;
        };

        /**
         * Recalculate hover tile position (Mouse tile position)
         * When left mouse button is pressed it a tower will be placed on certain conditions
         * @param dt {float} Delta time
         */
        TowaDev.prototype.handleInput = function (dt) {
            // Get hover tile  position by count mouse position
            this.hoverTilePos.x = Math.floor((this.isTouchDevice ? this.touch.x : this.mouse.x) / this.map.tileSize);
            this.hoverTilePos.y = Math.floor((this.isTouchDevice ? this.touch.y : this.mouse.y) / this.map.tileSize);

            // Hover place by left mouse down
            var down = this.isTouchDevice ? this.touchstate : this.isMouseDown(MouseButton.Left);
            if (!this.towerPlaceMoved && down) {
                this.towerPlaceMoved = true;
            } else if (this.towerPlaceMoved && !down) {
                this.towerPlaceMoved = false;

                // Are there already a tower placed on this tile?
                var towerPlaceState = this.getTowerPlaceableState(this.hoverTilePos.x, this.hoverTilePos.y);

                // We can only place or select towers when no tower is selected
                if (this.selectedTower == null) {
                    if (towerPlaceState == 0) {
                        // Buy and place tower
                        var tower = this.placeTower(this.hoverTilePos.x, this.hoverTilePos.y);
                        this.money -= tower.cost;

                        // Unselect tower
                        this.unselectTower();
                        this.setMouseButton(0, false);
                    } else if (towerPlaceState == 1) {
                        // Select tower
                        this.selectTower();
                        this.setMouseButton(MouseButton.Left, false);
                    }
                } else {
                    // Unselect tower when some is selected
                    this.unselectTower();
                    this.setMouseButton(0, false);
                }
            }
        };

        /**
         * Removes all dead entities from the entities map
         */
        TowaDev.prototype.removeDeadEntities = function () {
            var toRemove = [];
            var entities = this.entities.values();
            var l = entities.length;
            var i, entity;
            for (i = 0; i < l; i++) {
                entity = entities[i];
                if (!entity.alive) {
                    toRemove.push(entity);
                }
            }
            for (i = 0; i < toRemove.length; i++) {
                entity = toRemove[i];
                this.entities.remove(entity);
            }
        };

        /**
         * Game update
         * @param dt {number} Delta time
         */
        TowaDev.prototype.update = function (dt) {
            Game.prototype.update.call(this, dt);

            // Resources not loaded - exit
            if (this.initState < GameInitState.ResourcesLoaded) {
                return;
            }

            // Update menu
            if (this.state == State.Menu) {
                this.menu.update(dt);
                return;
            }

            if (this.state == State.LevelRunning) {
                // Do not update when game is paused
                if (this.paused) {
                    return;
                }

                // Update ui - false when mouse is not over any ui control
                Profiler.begin("ui and input");
                if (!this.uiMng.update(dt)) {
                    // Handle input (mouse, keyboard etc.)
                    this.handleInput(dt);
                }
                Profiler.finish();

                // Update wave timer
                if (this.waveTimer.active) {
                    this.waveTimer.update(dt);
                }

                // Update bullets
                Profiler.begin("bullets");
                var bullets = this.bulletPool.items;
                var bulletCount = this.bulletPool.count;
                var i;
                for (i = 0; i < bulletCount; i++) {
                    var bullet = bullets[i];
                    if (bullet.alive) {
                        // Move bullet
                        bullet.update(dt);

                        // Bullet still alive after update
                        if (bullet.alive) {
                            // Check map area
                            var area = this.map.area;
                            var inside = bullet.pos.x >= area.pos.x && bullet.pos.y >= area.pos.y && bullet.pos.x < (area.pos.x + area.size.x) && bullet.pos.y < (area.pos.y + area.size.y);
                            if (!inside) {
                                // Bullet outside of map - destroy it
                                bullet.alive = false;
                            }
                        }
                    }
                }
                Profiler.finish();

                // Update entities
                Profiler.begin("entities");
                var entities = this.entities.values();
                var entitiesCount = entities.length;
                for (i = 0; i < entitiesCount; i++) {
                    var entity = entities[i];
                    if (entity.alive) {
                        entity.update(dt);
                    }
                }
                this.removeDeadEntities();
                Profiler.finish();

                // Update pools
                Profiler.begin("pools");
                this.bulletPool.update();
                this.enemyPool.update();
                this.towerPool.update();
                Profiler.finish();
            }
        };

        TowaDev.prototype.drawOSD = function (r) {
            var i, textSize;

            var displayDim = this.displayDimension;

            var curWave = this.waves.get(this.currentWaveId);

            r.fillRect(0, 0, displayDim.x * 0.8, this.map.tileSize - this.map.tileSize * 0.2, "rgba(0,0,0,0.5)");

            r.applyFont(osdFont);
            r.fillText(0.1, 0.1, "Lives: " + this.lives, "white");
            r.fillText(3.5, 0.1, "Money: " + this.money + " €", "white");
            var waveText = "Wave: " + (this.currentWaveIndex + 1) + " / " + this.waves.count;
            if (this.waveTimer.active) {
                waveText += " (Next wave in: " + (Math.round(this.waveTimer.target - this.waveTimer.secs)) + " secs)";
            } else if (curWave !== undefined && curWave['special'] !== undefined && curWave['special'].length > 0) {
                waveText += " [" + curWave['special'] + "]";
            }
            textSize = r.getTextSize(waveText);
            r.fillText(8, 0.1, waveText, "white");
            if (!this.waveTimer.active) {
                r.fillText(8 + textSize.w + 0.75, 0.1, "Enemies: " + this.enemySpawner.count + " / " + this.enemySpawner.max, "white");
            }
            r.resetFont();

            if (this.dbgEnabled) {
                var debugLines = [];
                debugLines.push("State: " + this.state);
                debugLines.push("Entities: " + this.entities.count());
                debugLines.push("Bullets: " + this.bulletPool.count + " / " + this.bulletPool.max);
                debugLines.push("Towers: " + this.towerPool.count + " / " + this.towerPool.max);
                debugLines.push("Game time: " + this.gameTime.secs.toFixed(2) + " secs");
                debugLines.push("Fps: " + this.fps);
                r.applyFont(debugFont, "right", "top");
                var maxBlockSize = new Vec2(0, 0);
                for (i = 0; i < debugLines.length; i++) {
                    textSize = r.getTextSize(debugLines[i]);
                    maxBlockSize.x = Math.max(maxBlockSize.x, textSize.w);
                    maxBlockSize.y += textSize.h;
                }
                r.fillRect(displayDim.x - maxBlockSize.x, displayDim.y - maxBlockSize.y, maxBlockSize.x, maxBlockSize.y, "rgba(0,0,0,0.25)");
                for (i = 0; i < debugLines.length; i++) {
                    r.fillText(displayDim.x, displayDim.y - debugFont.size * ((debugLines.length - i)), debugLines[i], "white");
                }
                r.resetFont();
            }

            if (this.chenabled) {
                r.applyFont(warningFont, "left", "bottom");
                r.fillText(0, displayDim.y, "Cheat-Mode", "red");
                r.resetFont();
            }

            // Draw game state dependent stuff
            if (this.state == State.GameOver) {
                r.applyFont(gameOverFont, "center", "middle");
                r.applyShadows(gameOverFont.blur);
                r.fillText(displayDim.x * 0.5, displayDim.y * 0.5, "Game Over!", "red");
                r.resetShadows();
                r.strokeText(displayDim.x * 0.5, displayDim.y * 0.5, "Game Over!", "yellow", gameOverFont.width);
                r.resetFont();
            } else if (this.state == State.LevelComplete) {
                r.applyFont(gameWinFont, "center", "middle");
                r.applyShadows(gameWinFont.blur);
                r.fillText(displayDim.x * 0.5, displayDim.y * 0.5, "Victory", "green");
                r.resetShadows();
                r.strokeText(displayDim.x * 0.5, displayDim.y * 0.5, "Victory", "yellow", gameWinFont.width);
                r.resetFont();
            }

            if (this.paused) {
                r.applyFont(gamePauseFont, "center", "middle");
                r.applyShadows(gamePauseFont.blur);
                r.fillText(displayDim.x * 0.5, displayDim.y * 0.45, "Paused", gamePauseFont.fillStyle);
                r.resetShadows();
                r.strokeText(displayDim.x * 0.5, displayDim.y * 0.45, "Paused", gamePauseFont.strokeStyle, gamePauseFont.width);
                r.resetFont();

                r.applyFont(gameContinueFont, "center", "middle");
                r.applyShadows(gameContinueFont.blur);
                r.fillText(displayDim.x * 0.5, displayDim.y * 0.65, "Click to continue", gameContinueFont.fillStyle);
                r.resetShadows();
                r.resetFont();
            }
        };

        /**
         * Draws the entire game
         * @param r {Renderer}
         */
        TowaDev.prototype.draw = function (r) {
            Game.prototype.draw.call(this, r);

            // Resources not loaded - exit
            if (this.initState < GameInitState.ResourcesLoaded) {
                return;
            }

            // Render menu
            if (this.state == State.Menu) {
                Profiler.begin("menu");
                this.menu.draw(r);
                Profiler.finish();
                return;
            }

            // Draw map
            Profiler.begin("map");
            this.map.draw(r);
            Profiler.finish();

            // Draw entities
            Profiler.begin("entities");
            Profiler.begin("sort");
            var entities = this.entities.values();
            var entityCount = entities.length;
            var sortedEntities = utils.copyArray(entities, this.sortedEntities, entityCount);
            sortedEntities.sort(function (a, b) {
                return b.drawOrder - a.drawOrder;
            });
            Profiler.finish();
            Profiler.begin("draw");
            var i;
            for (i = 0; i < entityCount; i++) {
                var entity = sortedEntities[i];
                if (entity.alive) {
                    entity.draw(r);
                }
            }
            Profiler.finish();
            Profiler.finish();

            if (this.state != State.LevelOnly) {
                // Draw hovered tile
                if (this.selectedTower == null && this.map.isValid(this.hoverTilePos.x, this.hoverTilePos.y)) {
                    r.strokeRect(this.hoverTilePos.x * this.map.tileSize, this.hoverTilePos.y * this.map.tileSize, this.map.tileSize, this.map.tileSize, "white");

                    // Is map tile placeable for tower?
                    var placeableState = this.getTowerPlaceableState(this.hoverTilePos.x, this.hoverTilePos.y);
                    var notEnoughMoneyForTower = placeableState == 3;
                    if (placeableState == 0 || notEnoughMoneyForTower) {
                        var towerInstance = this.towerInstances.get(this.towerId);
                        var towerPreview = this.towerPreviews.get(this.towerId);
                        if (towerPreview !== undefined && towerInstance !== undefined) {
                            r.applyAlpha(notEnoughMoneyForTower ? 0.5 : 1.0);
                            r.drawImage(towerPreview, this.hoverTilePos.x * this.map.tileSize, this.hoverTilePos.y * this.map.tileSize, this.map.tileSize, this.map.tileSize);
                            r.strokeArc(this.hoverTilePos.x * this.map.tileSize + this.map.tileSize * 0.5, this.hoverTilePos.y * this.map.tileSize + this.map.tileSize * 0.5, towerInstance.weapon.lockRange, "rgba(255,255,0,0.5)");
                            r.resetAlpha();
                        }
                    }
                }

                // Draw selected tower
                if (this.selectedTower != null) {
                    r.applyAlpha(1.0);
                    r.strokeArc(this.selectedTower.pos.x, this.selectedTower.pos.y, this.selectedTower.weapon.lockRange, "rgba(255,255,255,0.5)");
                    r.resetAlpha();
                }

                // Draw bullets
                var bullets = this.bulletPool.items;
                var bulletCount = this.bulletPool.count;
                for (i = 0; i < bulletCount; i++) {
                    var bullet = bullets[i];
                    if (bullet.alive) {
                        bullet.draw(r);
                    }
                }

                // Draw ui
                Profiler.begin("ui");
                this.uiMng.draw(r);
                Profiler.finish();

                // Draw osd
                Profiler.begin("osd");
                this.drawOSD(r);
                Profiler.finish();
            }

        };

        return {
            State: State,
            TowaDev: TowaDev
        }
    },
    "0.5.1-alpha"
);