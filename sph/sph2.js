// ---------------------------------------------------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------------------------------------------------
window.requestAnimFrame = (function () {
    return  window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

window.performance = window.performance || {};
performance.now = (function () {
    return performance.now ||
        performance.mozNow ||
        performance.msNow ||
        performance.oNow ||
        performance.webkitNow ||
        function () {
            return new Date().getTime();
        };
})();

Function.prototype.inheritsFrom = function (parentClassOrObject) {
    if (parentClassOrObject.constructor == Function) {
        //Normal Inheritance
        this.prototype = new parentClassOrObject;
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject.prototype;
    }
    else {
        //Pure Virtual Inheritance
        this.prototype = parentClassOrObject;
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject;
    }
    return this;
};

function UniqueId() {
}
UniqueId.prototype._id = 0;
UniqueId.prototype.generateId = function () {
    return (++UniqueId.prototype._id).toString();
};
function HashTable() {
    this.hash = {};
    this.count = 0;

    this.clear = function () {
        this.count = 0;
        this.hash = {};
    };


    this.getCount = function () {
        return this.count;
    };

    this.getKeys = function () {
        return this.hash;
    };

    this.contains = function (key) {
        if (typeof key === "string" || typeof key === "number") {
            return this.hash[key] !== undefined;
        }
        if (key._hashtableUniqueId !== undefined) {
            return this.hash[key._hashtableUniqueId] !== undefined;
        }
        return false;
    };

    this.put = function (key, value) {
        if (typeof key === "string" || typeof key === "number") {
            this.hash[key] = value;
            this.count++;
        } else {
            if (key._hashtableUniqueId === undefined) {
                key._hashtableUniqueId = UniqueId.prototype.generateId();
            }
            this.hash[key._hashtableUniqueId] = value;
            this.count++;
        }
    };

    this.get = function (key) {
        if (typeof key === "string" || typeof key === "number") {
            return this.hash[key];
        }
        if (key._hashtableUniqueId === undefined) {
            return undefined;
        }
        return this.hash[key._hashtableUniqueId];
    };

    this.remove = function (key) {
        if (typeof key === "string" || typeof key === "number") {
            delete this.hash[key];
            this.count--;
        } else if (key._hashtableUniqueId !== undefined) {
            delete this.hash[key._hashtableUniqueId];
            this.count--;
        }
    }
}

var VecMath = {};

VecMath.Vec2 = function (x, y) {
    return {
        x:x,
        y:y
    };
};
VecMath.Vec2Set = function (v, vo) {
    vo.x = v.x;
    vo.y = v.y;
};
VecMath.Vec2Add = function (va, vb, vo) {
    vo.x = va.x + vb.x;
    vo.y = va.y + vb.y;
};
VecMath.Vec2AddScalar = function (v, s, vo) {
    vo.x = v.x + s;
    vo.y = v.y + s;
};
VecMath.Vec2Sub = function (va, vb, vo) {
    vo.x = va.x - vb.x;
    vo.y = va.y - vb.y;
};
VecMath.Vec2SubScalar = function (v, s, vo) {
    vo.x = v.x - s;
    vo.y = v.y - s;
};
VecMath.Vec2Mult = function (va, vb, vo) {
    vo.x = va.x * vb.x;
    vo.y = va.y * vb.y;
};
VecMath.Vec2MultScalar = function (v, s, vo) {
    vo.x = v.x * s;
    vo.y = v.y * s;
};
VecMath.Vec2Div = function (va, vb, vo) {
    vo.x = va.x / vb.x;
    vo.y = va.y / vb.y;
};
VecMath.Vec2DivScalar = function (v, s, vo) {
    vo.x = v.x / s;
    vo.y = v.y / s;
};
VecMath.Vec2PerpRight = function (v, vo) {
    vo.x = -v.y;
    vo.y = v.x;
};
VecMath.Vec2PerpLeft = function (v, vo) {
    vo.x = v.y;
    vo.y = -v.x;
};
VecMath.Vec2LengthSquared = function (v) {
    return v.x * v.x + v.y * v.y;
};
VecMath.Vec2Length = function (v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
};
VecMath.Vec2Min = function (a, b) {
    return Vec2(Math.min(a.x, b.x), Math.min(a.y, b.y));
};
VecMath.Vec2Max = function (a, b) {
    return Vec2(Math.max(a.x, b.x), Math.max(a.y, b.y));
};

// ---------------------------------------------------------------------------------------------------------------------
// Vec3
// ---------------------------------------------------------------------------------------------------------------------
function Vec3(x, y, z) {
    return {
        x:x,
        y:y,
        z:z,
        round:function () {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
            this.z = Math.round(this.z);
        },
        toString:function () {
            return this.x + ", " + (this.y) + ", " + (this.z);
        }
    };
}

// ---------------------------------------------------------------------------------------------------------------------
// Vec2
// ---------------------------------------------------------------------------------------------------------------------
function Vec2(x, y) {
    return {
        x:x.x !== undefined && y === undefined ? x.x : x,
        y:x.y !== undefined && y === undefined ? x.y : y,
        halfX:function () {
            return this.x / 2;
        },
        halfY:function () {
            return this.y / 2;
        },
        dot:function (v) {
            return (this.x * v.x) + (this.y * v.y);
        },
        add:function (x, y) {
            if (typeof x == "object" && typeof y == "undefined") {
                return Vec2(this.x + x.x, this.y + x.y);
            } else {
                return Vec2(this.x + x, this.y + y);
            }
        },
        addScalar:function (scalar) {
            return Vec2(this.x + scalar, this.y + scalar);
        },
        iadd:function (x, y) {
            if (typeof x == "object" && typeof y == "undefined") {
                this.x += x.x;
                this.y += x.y;
            } else {
                this.x += x;
                this.y += y;
            }
        },
        iaddScalar:function (scalar) {
            this.x += scalar;
            this.y += scalar;
        },
        sub:function (x, y) {
            if (typeof x == "object" && typeof y == "undefined") {
                return Vec2(this.x - x.x, this.y - x.y);
            } else {
                return Vec2(this.x - x, this.y - y);
            }
        },
        subScalar:function (scalar) {
            return Vec2(this.x - scalar, this.y - scalar);
        },
        isub:function (x, y) {
            if (typeof x == "object" && typeof y == "undefined") {
                this.x -= x.x;
                this.y -= x.y;
            } else {
                this.x -= x;
                this.y -= y;
            }
        },
        isubScalar:function (scalar) {
            this.x -= scalar;
            this.y -= scalar;
        },
        mul:function (x, y) {
            if (typeof x == "object" && typeof y == "undefined") {
                return Vec2(this.x * x.x, this.y * x.y);
            } else {
                return Vec2(this.x * x, this.y * y);
            }
        },
        mulScalar:function (scalar) {
            return Vec2(this.x * scalar, this.y * scalar);
        },
        imul:function (x, y) {
            if (typeof x == "object" && typeof y == "undefined") {
                this.x *= x.x;
                this.y *= x.y;
            } else {
                this.x *= x;
                this.y *= y;
            }
        },
        imulScalar:function (scalar) {
            this.x *= scalar;
            this.y *= scalar;
        },
        div:function (x, y) {
            if (typeof x == "object" && typeof y == "undefined") {
                return Vec2(this.x / x.x, this.y / x.y);
            } else {
                return Vec2(this.x / x, this.y / y);
            }
        },
        divScalar:function (scalar) {
            return Vec2(this.x / scalar, this.y / scalar);
        },
        idiv:function (x, y) {
            if (typeof x == "object" && typeof y == "undefined") {
                this.x /= x.x;
                this.y /= x.y;
            } else {
                this.x /= x;
                this.y /= y;
            }
        },
        idivScalar:function (scalar) {
            this.x /= scalar;
            this.y /= scalar;
        },
        length:function () {
            return Math.sqrt(this.lengthSqrt());
        },
        lengthSqrt:function () {
            return this.dot(this);
        },
        normalized:function () {
            var l = Math.sqrt(this.length());
            if (l == 0) {
                l = 1;
            }
            return Vec2(this.x / l, this.y / l);
        },
        perpRight:function () {
            return Vec2(-this.y, this.x);
        },
        perpLeft:function () {
            return Vec2(this.y, -this.x);
        },
        setup:function (x, y) {
            if (x.x !== undefined && y === undefined) {
                this.x = x.x;
                this.y = x.y;
            } else {
                this.x = x;
                this.y = y;
            }
        },
        setupScalar:function (scalar) {
            this.x = scalar;
            this.y = scalar;
        },
        clone:function () {
            return Vec2(this.x, this.y);
        },
        toString:function () {
            return this.x + ", " + this.y;
        },
        zero:function () {
            this.x = 0;
            this.y = 0;
        },
        abs:function () {
            return Vec2(Math.abs(this.x), Math.abs(this.y));
        }
    };
}

function Rectangle(x, y, w, h) {
    return {
        x:x,
        y:y,
        w:w,
        h:h,
        right:function () {
            return this.x + this.w;
        },
        bottom:function () {
            return this.y + this.h;
        }
    };
}

var Utils = {};
Utils.float2int = function (value) {
    return value | 0;
};

Utils.formatFloat = function (value) {
    if (value != Number.MIN_VALUE && value != Number.MAX_VALUE) {
        return value.toFixed(3);
    } else {
        return "-";
    }
};

var Constants = {};
Constants.Epsilon = 0.00000001;
Constants.DeltaTimeSec = 1 / 60;
Constants.ParticleGravityFactor = 1 / 3000;
Constants.Gravity = Vec2(0, 9.81);
Constants.MaxNeighbors = 75;
Constants.MaxCollisionObjects = 20;

function AABB(min, max) {
    return {
        min:min,
        max:max
    };
}

function Plane(normal, distance, length, color) {
    var n = distance === undefined ? normal.normalized() : normal;
    var w = distance === undefined ? normal.length() : distance;
    return {
        n:n,
        w:w,
        l:length,
        c:color,
        point:function () {
            return this.n.mulScalar(this.w);
        },
        aabb:function (scale) {
            var p = this.point();
            var t = this.n.perpRight();
            var a = p.add(t.mulScalar(this.l * -0.5));
            var b = p.add(t.mulScalar(this.l * 0.5));
            var min = a.add(this.n.mulScalar(-scale * 0.5)).add(t.mulScalar(scale * 0.5));
            var max = b.add(this.n.mulScalar(scale * 0.5)).add(t.mulScalar(scale * -0.5));
            return AABB(VecMath.Vec2Min(min, max), VecMath.Vec2Max(min, max));
        }
    }
}

function findClosestPointOnPlane(plane, pos) {
    var N = plane.n;
    var d = plane.w;
    var distancePointToPlane = -N.dot(pos) + d;
    return pos.add(N.mulScalar(distancePointToPlane));
}

function Body() {
    this.mass = 0;
    this.invMass = 1;
    this.position = Vec2(0, 0);
    this.velocity = Vec2(0, 0);
    this.force = Vec2(0, 0);
}
Body.prototype.setMass = function (mass) {
    this.mass = mass;
    this.invMass = this.mass > 1 ? 1 / this.mass : 1;
};

function FluidParticle(position, velocity, alive) {
    Body.call(this);
    this.position = position;
    this.velocity = velocity;
    this.alive = alive;
    this.neighbors = [];
    this.neighbors.length = Constants.MaxNeighbors;
    this.neighborCount = 0;
    this.relativePositions = [];
    this.relativePositions.length = Constants.MaxNeighbors;
    this.relativeVelocities = [];
    this.relativeVelocities.length = Constants.MaxNeighbors;
    this.distances = [];
    this.distances.length = Constants.MaxNeighbors;
    this.ci = null;
    this.cj = null;
    this.index = null;
    this.density = 0;
    this.nearDensity = 0;
    this.pressure = 0;
    this.nearPressure = 0;
    this.collisionObjects = [];
    this.numCollisionObjects = 0;
    this.color = "rgba(0,0,255,";
}
FluidParticle.inheritsFrom(Body);

FluidParticle.prototype.assignArrays = function () {
    var i;
    for (i = 0; i < Constants.MaxNeighbors; i++) {
        this.relativePositions[i] = Vec2(0, 0);
    }
    for (i = 0; i < Constants.MaxNeighbors; i++) {
        this.relativeVelocities[i] = Vec2(0, 0);
    }
};

function DynamicGrid(cellSpace) {
    this.cells = new HashTable();
    this.cellSpace = cellSpace;
    this.stats = {
        cellCount:0
    };
}

DynamicGrid.prototype.getGridIndex = function (v) {
    return Math.floor(v / this.cellSpace);
};

DynamicGrid.prototype.remove = function (particle, index) {
    var oldIndexX = particle.ci;
    var oldIndexY = particle.cj;
    var xCell = this.cells.get(oldIndexX);
    var yCell = xCell.get(oldIndexY);
    yCell.remove(index);
    if (yCell.getCount() == 0) {
        this.stats.cellCount--;
        xCell.remove(oldIndexY);
    }
    if (xCell.getCount() == 0) {
        this.cells.remove(oldIndexX);
    }
};

DynamicGrid.prototype.clear = function () {
    this.stats.cellCount = 0;
    for (var x in this.cells.getKeys()) {
        var xCell = this.cells.get(x);
        for (var y in xCell.getKeys()) {
            var yCell = xCell.get(y);
            yCell.clear();
            xCell.remove(y);
        }
        this.cells.remove(x);
    }
};

DynamicGrid.prototype.insert = function (particle, index) {
    var gridIndexX = this.getGridIndex(particle.position.x);
    var gridIndexY = this.getGridIndex(particle.position.y);

    var xCell = this.cells.get(gridIndexX);
    if (xCell === undefined) {
        xCell = new HashTable();
        this.cells.put(gridIndexX, xCell);
    }

    var yCell = xCell.get(gridIndexY);
    if (yCell === undefined) {
        yCell = new HashTable();
        xCell.put(gridIndexY, yCell);
        this.stats.cellCount++;
    }

    yCell.put(index, index);

    particle.ci = gridIndexX;
    particle.cj = gridIndexY;
};

DynamicGrid.prototype.refreshParticle = function (particle) {
    var gridIndexX = this.getGridIndex(particle.position.x);
    var gridIndexY = this.getGridIndex(particle.position.y);
    if (particle.ci != gridIndexX || particle.cj != gridIndexY) {
        if (particle.ci != null && particle.cj != null) {
            this.remove(particle, particle.index);
        }
        this.insert(particle, particle.index);
    } else {
        // Cell position has not changed
    }
};

DynamicGrid.prototype.findNeighbors = function (particle) {
    particle.neighborCount = 0;
    for (var xOff = -1; xOff < 2; xOff++) {
        for (var yOff = -1; yOff < 2; yOff++) {
            // Neighbour index
            var x = this.getGridIndex(particle.position.x) + xOff;
            var y = this.getGridIndex(particle.position.y) + yOff;
            var xCell = this.cells.get(x);
            if (xCell !== undefined) {
                var yCell = xCell.get(y);
                if (yCell !== undefined) {
                    var keys = yCell.getKeys();
                    for (var key in keys) {
                        if (particle.neighborCount < Constants.MaxNeighbors) {
                            particle.neighbors[particle.neighborCount] = key;
                            particle.neighborCount++;
                        }
                    }
                }
            }
        }
    }
};

function StopWatch() {
    this.startTime = 0;
    this.duration = 0;
}
StopWatch.prototype.start = function() {
    this.startTime = new Date().getTime();
};
StopWatch.prototype.stop = function() {
    this.duration = ((new Date().getTime()) - this.startTime) / 1000.0;
};

function SPHSimulation(radius, kH, scale, cellSize) {
    var i;
    this.maxParticles = 1000;
    this.radius = radius;
    this.kH = kH;
    this.kHSq = this.kH * this.kH;
    this.kHMul = 1 / this.kH;
    this.cellSize = cellSize;
    this.viscosity = 0.004;
    this.stiffness = 0.08;
    this.nearStiffness = 0.1;
    this.restDensity = 5;
    this.numActiveParticles = 0;
    this.particles = [];
    this.particles.length = this.maxParticles;
    for (i = 0; i < this.maxParticles; i++) {
        this.particles[i] = new FluidParticle(Vec2(0, 0), Vec2(0, 0), false);
        this.particles[i].index = i;
    }
    this.activeParticles = [];
    this.forces = [];
    this.forces.length = this.maxParticles;
    this.scaledPositions = [];
    this.scaledPositions.length = this.maxParticles;
    this.scaledVelocities = [];
    this.scaledVelocities.length = this.maxParticles;
    this.grid = new DynamicGrid(this.cellSize);
    this.planes = [];
    for (i = 0; i < this.maxParticles; i++) {
        this.forces[i] = Vec2(0, 0);
        this.scaledPositions[i] = Vec2(0, 0);
        this.scaledVelocities[i] = Vec2(0, 0);
    }
    this.damping = 0.001;
    this.stats = {
        collisionTests:0,
        densityMin:Number.MAX_VALUE,
        nearDensityMin:Number.MAX_VALUE,
        densityMax:Number.MIN_VALUE,
        nearDensityMax:Number.MIN_VALUE,
        pressureMin:Number.MAX_VALUE,
        nearPressureMin:Number.MAX_VALUE,
        pressureMax:Number.MIN_VALUE,
        nearPressureMax:Number.MIN_VALUE,
        prepareDuration: new StopWatch(),
        pressureDuration: new StopWatch(),
        forceDuration: new StopWatch(),
        collisionDuration : new StopWatch(),
        integrateDuration: new StopWatch()
    };
}

SPHSimulation.prototype.addForce = function (f) {
    for (var i = 0; i < this.numActiveParticles; i++) {
        var index = this.activeParticles[i];
        var particle = this.particles[index];
        particle.force.iadd(f);
    }
};

SPHSimulation.prototype.clear = function () {
    this.grid.clear();
    for (var i = 0; i < this.maxParticles; i++) {
        this.particles[i] = new FluidParticle(Vec2(0, 0), Vec2(0, 0), false);
        this.particles[i].index = i;
    }
    this.activeParticles = [];
    this.numActiveParticles = 0;
};

SPHSimulation.prototype.resetStats = function () {
    for (var k in this.stats) {
        if (this.stats.hasOwnProperty(k)) {
            if (k.substr(0, 3) == "min") {
                this.stats[k] = Number.MAX_VALUE;
            } else if (k.substr(0, 3) == "max") {
                this.stats[k] = Number.MIN_VALUE;
            } else if (typeof this.stats[k] !== "object") {
                this.stats[k] = 0;
            }
        }
    }
};

SPHSimulation.prototype.step = function (dt) {
    this.stats.prepareDuration.start();
    this.resetStats();
    this.prepare(dt);
    this.prepareCollisions();
    this.stats.prepareDuration.stop();
    this.stats.pressureDuration.start();
    this.calculatePressures();
    this.stats.pressureDuration.stop();
    this.stats.forceDuration.start();
    this.calculateForces(dt);
    this.stats.forceDuration.stop();
    this.stats.collisionDuration.start();
    this.resolveCollisions(dt);
    this.stats.collisionDuration.stop();
    this.stats.integrateDuration.start();
    this.integrate(dt);
    this.stats.integrateDuration.stop();
};

SPHSimulation.prototype.updateStats = function (particle) {
    this.stats.densityMin = Math.min(this.stats.densityMin, particle.density);
    this.stats.densityMax = Math.max(this.stats.densityMax, particle.density);
    this.stats.nearDensityMin = Math.min(this.stats.nearDensityMin, particle.nearDensity);
    this.stats.nearDensityMax = Math.max(this.stats.nearDensityMax, particle.nearDensity);
    this.stats.pressureMin = Math.min(this.stats.pressureMin, particle.pressure);
    this.stats.pressureMax = Math.max(this.stats.pressureMax, particle.pressure);
    this.stats.nearPressureMin = Math.min(this.stats.nearPressureMin, particle.nearPressure);
    this.stats.nearPressureMax = Math.max(this.stats.nearPressureMax, particle.nearPressure);
};

SPHSimulation.prototype.prepare = function (dt) {
    // Prepare simulation
    for (var i = 0; i < this.numActiveParticles; i++) {
        var index = this.activeParticles[i];
        var particle = this.particles[index];

        // Scale position and velocity
        VecMath.Vec2Set(particle.position, this.scaledPositions[index]);
        VecMath.Vec2Set(particle.velocity, this.scaledVelocities[index]);

        // Reset sph forces
        this.forces[index].zero();

        // Reset collision object count
        particle.numCollisionObjects = 0;

        // Find neighbors
        this.grid.findNeighbors(particle);
    }
};

SPHSimulation.prototype.prepareCollisions = function () {
    for (var i = 0; i < this.planes.length; i++) {
        var plane = this.planes[i];
        var aabb = plane.aabb(this.cellSize);
        var Ax = this.grid.getGridIndex(aabb.min.x);
        var Ay = this.grid.getGridIndex(aabb.min.y);
        var Bx = this.grid.getGridIndex(aabb.max.x) + 1;
        var By = this.grid.getGridIndex(aabb.max.y) + 1;
        for (var x = Ax; x < Bx; x++) {
            var xGrid = this.grid.cells.get(x);
            if (xGrid !== undefined) {
                for (var y = Ay; y < By; y++) {
                    var yGrid = xGrid.get(y);
                    if (yGrid !== undefined) {
                        var cellParticles = yGrid.getKeys();
                        for (var p in cellParticles) {
                            var particle = this.particles[p];
                            if (particle.numCollisionObjects < Constants.MaxCollisionObjects) {
                                particle.collisionObjects[particle.numCollisionObjects] = plane;
                                particle.numCollisionObjects++;
                                this.stats.collisionTests++;
                            }
                        }
                    }
                }
            }
        }
    }
};

SPHSimulation.prototype.getInactiveParticles = function (num) {
    var inactiveParticles = [];
    for (var i = 0; i < this.maxParticles; i++) {
        if (!this.particles[i].alive) {
            if (inactiveParticles.length < num) {
                inactiveParticles.push(this.particles[i]);
            } else {
                break;
            }
        }
    }
    return inactiveParticles;
};

SPHSimulation.prototype.createBlob = function (posx, posy, width, height, radius, color) {
    var d = (radius * 2) * 1;
    var cx = Math.round(width / d);
    var cy = Math.round(height / d);

    var numParticlesToSpawn = cx * cy;

    var hx = (d * cx) * 0.5;
    var hy = (d * cy) * 0.5;

    var inactiveParticles = this.getInactiveParticles(numParticlesToSpawn);
    var idx = 0;
    var x = posx - hx;
    for (var i = 0; i < cx; i++) {
        var y = posy - hy;
        for (var j = 0; j < cy; j++) {
            var pos = Vec2(x, y);
            if (this.numActiveParticles < this.maxParticles) {
                var particle = inactiveParticles[idx];
                particle.position = pos;
                particle.velocity = Vec2(0, 0);
                particle.alive = true;
                particle.color = color;
                particle.assignArrays();
                this.grid.insert(particle, particle.index);
                this.activeParticles[this.numActiveParticles] = particle.index;
                this.numActiveParticles++;
                idx++;
            } else {
                break;
            }
            y += d;
        }
        x += d;
    }
};

SPHSimulation.prototype.createParticle = function (pos, numParticlesToSpawn, color) {
    var inactiveParticles = this.getInactiveParticles(numParticlesToSpawn);
    for (var i = 0; i < inactiveParticles.length; i++) {
        if (this.numActiveParticles < this.maxParticles) {
            var particle = inactiveParticles[i];
            var jitter = Vec2(Math.random() * this.radius * 4, Math.random() * this.radius * 4);
            particle.position = pos.add(jitter);
            particle.velocity = Vec2(0, 0);
            particle.alive = true;
            particle.color = color;
            particle.assignArrays();
            this.grid.insert(particle, particle.index);
            this.activeParticles[this.numActiveParticles] = particle.index;
            this.numActiveParticles++;
        }
    }
};

/**
 * Calculates the density and pressures of all active particles
 * Uses quadratic spline as kernels
 * Density kernel = (1 - rij/h)^2
 * Near density kernel = (1 - rij/h)^3
 * Pressure = k * (pi - p0)
 * Near pressure = k_near * pi_near
 * @param particle
 * @param index
 */
SPHSimulation.prototype.calculatePressure = function (particle, index) {
    // Calculate pressure
    var density = 0;
    var nearDensity = 0;
    for (var j = 0; j < particle.neighborCount; j++) {
        var n = particle.neighbors[j];
        VecMath.Vec2Sub(this.scaledPositions[n], this.scaledPositions[index], particle.relativePositions[j]);
        VecMath.Vec2Sub(this.scaledVelocities[n], this.scaledVelocities[index], particle.relativeVelocities[j]);
        var relativePosition = particle.relativePositions[j];
        var distanceSq = relativePosition.lengthSqrt();
        if (distanceSq > Constants.Epsilon && distanceSq < this.kHSq) {
            particle.distances[j] = Math.sqrt(distanceSq);
            var q = particle.distances[j] * this.kHMul;
            var oneminusq = 1.0 - q;
            density += oneminusq * oneminusq;
            nearDensity += oneminusq * oneminusq * oneminusq;
        } else {
            particle.distances[j] = Number.MAX_VALUE;
        }
    }
    particle.density = density;
    particle.nearDensity = nearDensity;
    particle.pressure = this.stiffness * (density - this.restDensity);
    particle.nearPressure = this.nearStiffness * nearDensity;
    this.updateStats(particle);
};

SPHSimulation.prototype.calculatePressures = function () {
    for (var i = 0; i < this.numActiveParticles; i++) {
        var index = this.activeParticles[i];
        var particle = this.particles[index];
        this.calculatePressure(particle, index);
    }
};

SPHSimulation.prototype.calculateForce = function (particle, index, dt) {
    // Calculate forces
    var change = Vec2(0, 0);
    var D = Vec2(0, 0);
    var I = Vec2(0, 0);
    for (var j = 0; j < particle.neighborCount; j++) {
        var n = particle.neighbors[j];
        if (particle.distances[j] < this.kH) {
            var relativePosition = particle.relativePositions[j];
            var relativeVelocity = particle.relativeVelocities[j];

            var q = particle.distances[j] * this.kHMul;
            var oneminusq = 1.0 - q;

            // Pressure force
            var scalar = dt * oneminusq * (particle.pressure + particle.nearPressure * oneminusq) / (2.0 * particle.distances[j]);
            VecMath.Vec2MultScalar(relativePosition, scalar, D);

            // Viscosity force
            scalar = dt * this.viscosity * oneminusq;
            VecMath.Vec2MultScalar(relativeVelocity, scalar, I);
            D.isub(I);

            // Add force to neighbor particle
            this.forces[n].iadd(D);
            // Sub from change
            change.isub(D);
        }
    }


    // Add change to particle force
    this.forces[index].iadd(change);
};

SPHSimulation.prototype.calculateForces = function (dt) {
    for (var i = 0; i < this.numActiveParticles; i++) {
        var index = this.activeParticles[i];
        var particle = this.particles[index];
        this.calculateForce(particle, index, dt);
    }
};

SPHSimulation.prototype.integrate = function (dt) {
    for (var i = 0; i < this.numActiveParticles; i++) {
        var index = this.activeParticles[i];
        var particle = this.particles[index];

        // Calculate total force
        var acc = this.forces[index].add(particle.force);

        // Update velocity
        VecMath.Vec2Add(particle.velocity, acc, particle.velocity);

        // Velocity damping
        VecMath.Vec2MultScalar(particle.velocity, 1.0 - this.damping, particle.velocity);

        // Update position
        VecMath.Vec2Add(particle.position, acc, particle.position);
        VecMath.Vec2Add(particle.position, particle.velocity, particle.position);

        // Reset force
        this.forces[index].zero();
        particle.force.zero();

        // Update particle position
        this.grid.refreshParticle(particle);
    }
};

SPHSimulation.prototype.resolveCollision = function(particle, index, dt) {
    var r = this.radius;

    // Determine where the particle will be after being moved
    var prevPos = particle.position;
    var nextPos = Vec2(0, 0);
    var velocity = Vec2(0, 0);
    var correctedVelocity = Vec2(0, 0);
    var correctionPosition = Vec2(0, 0);
    var temp = Vec2(0, 0);
    var Vnormal = Vec2(0, 0);
    var Vtangent = Vec2(0, 0);
    var I = Vec2(0, 0);

    // Predict next position
    VecMath.Vec2Add(prevPos, particle.velocity, nextPos);
    VecMath.Vec2Add(nextPos, this.forces[index], nextPos);
    VecMath.Vec2Add(nextPos, particle.force, nextPos);

    // Get velocity
    VecMath.Vec2Sub(nextPos, prevPos, velocity);

    // Handle collision objects
    for (var j = 0; j < particle.numCollisionObjects; j++) {
        var plane = particle.collisionObjects[j];
        var normal = plane.n;

        // Find closest point on plane for previous position
        var closest = findClosestPointOnPlane(plane, prevPos);

        // Get distance to closest
        VecMath.Vec2Sub(prevPos, closest, temp);
        var closestDistance = temp.dot(normal) - r;

        // Project velocity on collision normal
        var projVel = -velocity.dot(normal);

        // Velocity projection is greater than closest distance
        if (projVel > closestDistance) {
            var time = closestDistance / projVel;

            // Correct velocity by time factor
            VecMath.Vec2MultScalar(velocity, 1.0 - time, correctedVelocity);
            VecMath.Vec2Sub(velocity, correctedVelocity, correctedVelocity);

            // Get corrected position
            VecMath.Vec2Add(prevPos, correctedVelocity, correctionPosition);

            // Set new position to corrected one
            particle.position.setup(correctionPosition);

            // Set new position to corrected one
            VecMath.Vec2Add(correctionPosition, normal.mulScalar(Constants.Epsilon), particle.position);

            // add a velocity impulse against the collision normal
            var friction = 0;
            VecMath.Vec2MultScalar(normal, normal.dot(velocity), Vnormal);
            VecMath.Vec2Sub(velocity, Vnormal, Vtangent);
            VecMath.Vec2MultScalar(Vtangent, friction, Vtangent);
            VecMath.Vec2Sub(Vnormal, Vtangent, I);
            VecMath.Vec2Sub(particle.velocity, I, particle.velocity);

            // Reset force
            this.forces[index].zero();
            particle.force.zero();
        }
    }
};

SPHSimulation.prototype.resolveCollisions = function (dt) {
    for (var i = 0; i < this.numActiveParticles; i++) {
        var index = this.activeParticles[i];
        var particle = this.particles[index];
        this.resolveCollision(particle, index, dt);
    }
};

// ---------------------------------------------------------------------------------------------------------------------
// Sample
// ---------------------------------------------------------------------------------------------------------------------
var Keys = {
    Left:37,
    Right:39,
    Up:38,
    Down:40,
    n1: 49,
    n2: 50,
    C:67,
    G:71,
    N:78,
    O:79,
    R:82,
    S:83,
    Num0:96,
    Add:107,
    Sub:109,
    Space: 32
};

function SPHApplication() {
    this.canvas = document.getElementById("canvas");

    // Double-click text problem will no longer occur.
    this.canvas.onselectstart = function () {
        return false;
    };

    this.ctx = this.canvas.getContext("2d");
    this.keystate = [];
    this.mouse = Vec2(-1, -1);
    this.mousestate = [];
    this.centerOffset = Vec2(this.canvas.width * 0.5, this.canvas.height * 0.5);
    this.gravityMode = 1;
    this.gravity = Constants.Gravity;
    this.fluidGravity = this.gravity.mulScalar(Constants.ParticleGravityFactor);
    this.renderMode = 0;
    this.renderModes = [];
    this.fluidColorIndex = 0;
    this.fluidColors = [];
    this.showCells = false;
    this.planes = [];
    this.paused = true;
    this.scale = 1;
    this.simCount = 0;
    this.maxSimCount = -1;
    this.domain = null;
    this.frameDuration = new StopWatch();
    this.showOSD = true;

    this.fontSize = 16;
    this.font = "normal "+this.fontSize+"px verdana";

    var that = this;

    var getXandY = function (e) {
        var x = e.clientX - that.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.canvas.getBoundingClientRect().top;
        return Vec2(x - that.centerOffset.x, y - that.centerOffset.y);
    };

    this.canvas.addEventListener("keydown", function (ev) {
        that.keystate[ev.keyCode] = true;
    }, false);
    this.canvas.addEventListener("keyup", function (ev) {
        that.keystate[ev.keyCode] = false;
        console.log(ev.keyCode);
    }, false);
    this.canvas.addEventListener("mousedown", function (ev) {
        that.mouse = getXandY(ev);
        that.mousestate[ev.button] = true;
    }, false);
    this.canvas.addEventListener("mouseup", function (ev) {
        that.mousestate[ev.button] = false;
    }, false);
    this.canvas.addEventListener("mousemove", function (ev) {
        that.mouse = getXandY(ev);
    }, false);

    this.addRenderModes();
    this.addFluidColors();
}

SPHApplication.prototype.addRenderMode = function (fill, isArc, factor, gradient) {
    this.renderModes.push({
        fill:fill,
        isArc:isArc,
        factor:factor,
        gradient:gradient
    });
};

SPHApplication.prototype.addRenderModes = function () {
    this.addRenderMode(true, false, 0.25, false);
    this.addRenderMode(false, false, 0.25, false);
    this.addRenderMode(true, true, 0.25, false);
    this.addRenderMode(false, true, 0.25, false);
    this.addRenderMode(true, true, 1, false);
    this.addRenderMode(false, true, 1, false);
    this.addRenderMode(true, true, 2, true);
};

SPHApplication.prototype.addFluidColor = function (color) {
    this.fluidColors.push(color);
};

SPHApplication.prototype.addFluidColors = function () {
    this.addFluidColor("rgba(255,255,255,");
    this.addFluidColor("rgba(51,153,255,");
    this.addFluidColor("rgba(0,0,255,");
    this.addFluidColor("rgba(0,255,0,");
    this.addFluidColor("rgba(255,0,0,");
    this.addFluidColor("rgba(255,255,0,");
};

SPHApplication.prototype.isKeyDown = function (key) {
    return this.keystate[key] !== undefined && this.keystate[key] === true;
};

SPHApplication.prototype.setKeyDown = function (key, value) {
    this.keystate[key] = value;
};

SPHApplication.prototype.isMouseDown = function (button) {
    return this.mousestate[button] !== undefined && this.mousestate[button] === true;
};

SPHApplication.prototype.setMouseButton = function (button, value) {
    this.mousestate[button] = value;
};

SPHApplication.prototype.updateGravity = function () {
    switch (this.gravityMode) {
        case 0:
            this.gravity.setup(0, 0);
            break;
        case 1:
            this.gravity.setup(0, 9.81);
            break;
        case 2:
            this.gravity.setup(0, -9.81);
            break;
        case 3:
            this.gravity.setup(9.81, 0);
            break;
        case 4:
            this.gravity.setup(-9.81, 0);
            break;
    }
    this.fluidGravity = this.gravity.mulScalar(Constants.ParticleGravityFactor);
};

SPHApplication.prototype.init = function () {
    var radius = 0.2;
    var kH = 6 * radius;
    var cellSize = 4 * radius;
    var domainSize = cellSize * 12;
    var planeSize = domainSize;
    this.domain = Rectangle(0, 0, planeSize, planeSize);
    this.scale = Math.max(this.canvas.width, this.canvas.height) / domainSize * 0.4;
    this.planes.push(new Plane(Vec2(0.0, -1.0), -planeSize * 0.5, planeSize * 2, "red"));
    this.planes.push(new Plane(Vec2(0.0, 1.0), -planeSize * 0.5, planeSize * 2, "red"));
    this.planes.push(new Plane(Vec2(-1.0, 0.0), -planeSize, planeSize, "blue"));
    this.planes.push(new Plane(Vec2(1.0, 0.0), -planeSize, planeSize, "blue"));
    this.fluidSim = new SPHSimulation(radius, kH, 1, cellSize);
    this.fluidSim.viscosity = 0.004;
    this.fluidSim.stiffness = 0.2;
    this.fluidSim.nearStiffness = 0.18;
    this.fluidSim.restDensity = 5;
    this.fluidSim.planes = this.planes;
    this.updateGravity();

    var blobRadius = this.fluidSim.radius;
    var blobW = blobRadius * (planeSize / blobRadius * 0.75);
    var blobH = blobRadius * (planeSize / blobRadius * 0.9);
    this.fluidSim.createBlob(-blobW * 0.75, 0, blobW, blobH, blobRadius, "rgba(255,255,255,");
};

SPHApplication.prototype.handleInput = function (dt) {
    if (this.isMouseDown(0)) {
        var m = this.mouse.divScalar(this.scale);
        this.fluidSim.createBlob(m.x, m.y, this.domain.w * 0.2, this.domain.h * 0.2, this.fluidSim.radius, "rgba(255,255,255,");
    }

    if (this.isKeyDown(Keys.Left)) {
        this.fluidSim.addForce(Vec2(-10, 0).mulScalar(Constants.ParticleGravityFactor));
    } else if (this.isKeyDown(Keys.Right)) {
        this.fluidSim.addForce(Vec2(10, 0).mulScalar(Constants.ParticleGravityFactor));
    }
    if (this.isKeyDown(Keys.Up)) {
        this.fluidSim.addForce(Vec2(0, -10).mulScalar(Constants.ParticleGravityFactor));
    } else if (this.isKeyDown(Keys.Down)) {
        this.fluidSim.addForce(Vec2(0, 10).mulScalar(Constants.ParticleGravityFactor));
    }

    if (this.isKeyDown(Keys.Num0)) {
        this.gravityMode++;
        if (this.gravityMode > 4) this.gravityMode = 0;
        this.updateGravity();
        this.setKeyDown(Keys.Num0, false);
    }

    if (this.isKeyDown(Keys.S)) {
        this.renderMode++;
        if (this.renderMode > this.renderModes.length - 1) this.renderMode = 0;
        this.setKeyDown(Keys.S, false);
    }

    if (this.isKeyDown(Keys.R)) {
        this.fluidSim.clear();
        this.setKeyDown(Keys.R, false);
    }

    if (this.isKeyDown(Keys.C)) {
        this.fluidColorIndex++;
        if (this.fluidColorIndex > this.fluidColors.length-1) this.fluidColorIndex = 0;
        this.setKeyDown(Keys.C, false);
    }

    if (this.isKeyDown(Keys.G)) {
        this.showCells = !this.showCells;
        this.setKeyDown(Keys.G, false);
    }

    if (this.isKeyDown(Keys.Add)) {
        this.fluidSim.viscosity += 0.001;
        this.fluidSim.viscosity = Math.min(this.fluidSim.viscosity, 5.0);
        this.setKeyDown(Keys.Add, false);
    }
    if (this.isKeyDown(Keys.Sub)) {
        this.fluidSim.viscosity -= 0.001;
        this.fluidSim.viscosity = Math.max(this.fluidSim.viscosity, 0.001);
        this.setKeyDown(Keys.Sub, false);
    }

    if (this.isKeyDown(Keys.Space)) {
        this.paused = !this.paused;
        this.setKeyDown(Keys.Space, false);
    }

    if (this.isKeyDown(Keys.O)) {
        this.showOSD = !this.showOSD;
        this.setKeyDown(Keys.O, false);
    }
};

SPHApplication.prototype.update = function (dt) {
    this.handleInput(dt);
    if (!this.paused) {
        if (this.simCount < this.maxSimCount || this.maxSimCount < 0) {
            this.fluidSim.addForce(this.fluidGravity);
            this.fluidSim.step(dt);
            this.simCount++;
        }
    }
};

SPHApplication.prototype.renderRectangle = function (rect, color) {
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = color;
    this.ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    this.ctx.lineWidth = 1;
};

SPHApplication.prototype.renderLine = function (x1, y1, x2, y2, color, lineWidth) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth || 1;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    this.ctx.closePath();
};

SPHApplication.prototype.renderText = function (x, y, text, color, baseline, align) {
    this.ctx.fillStyle = color;
    this.ctx.font = this.font;

    this.ctx.textBaseline = baseline || "middle";
    this.ctx.textAlign = align || "center";

    this.ctx.fillText(text, x, y);
};

SPHApplication.prototype.renderCircle = function (x, y, radius, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    this.ctx.fill();
    this.ctx.closePath();
};

function gravityMode2String(mode) {
    switch (mode) {
        case 0:
            return "Off";
        case 1:
            return "Down";
        case 2:
            return "Up";
        case 3:
            return "Right";
        case 4:
            return "Left";
    }
    return "";
}

SPHApplication.prototype.drawParticles = function () {
    var scale = this.scale;
    var radius = this.fluidSim.radius;

    // Draw active particles
    var renderMode = this.renderModes[this.renderMode];
    var renderFactor = renderMode.factor;
    for (var i = 0; i < this.fluidSim.numActiveParticles; i++) {
        var index = this.fluidSim.activeParticles[i];
        var particle = this.fluidSim.particles[index];
        var cx = particle.position.x * scale;
        var cy = particle.position.y * scale;

        if (renderMode.isArc) {
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, radius * scale * renderFactor, 0, Math.PI * 2, false);
            this.ctx.closePath();
        } else {
            var rectSize = scale * radius * 2 * renderFactor;
            this.ctx.beginPath();
            this.ctx.rect(cx - rectSize * 0.5, cy - rectSize * 0.5, rectSize, rectSize);
            this.ctx.closePath();
        }

        var style = this.fluidColors[this.fluidColorIndex] + "1)";
        if (renderMode.gradient) {
            var grd = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * scale * renderFactor);
            grd.addColorStop(0, this.fluidColors[this.fluidColorIndex] + "1)");
            grd.addColorStop(1, this.fluidColors[this.fluidColorIndex] + "0)");
            style = grd;
        }

        if (!renderMode.fill) {
            this.ctx.strokeStyle = style;
            this.ctx.stroke();
        } else {
            this.ctx.fillStyle = style;
            this.ctx.fill();
        }
    }
};

SPHApplication.prototype.draw = function (dt) {
    var oldDuration = this.frameDuration.duration;
    this.frameDuration.start();

    var scale = this.scale;
    var cellSize = this.fluidSim.cellSize;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw black background
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(this.centerOffset.x, this.centerOffset.y);

    // Draw boundary planes
    var that = this;
    this.planes.forEach(function (plane) {
        var planeNormal = plane.n;
        var planeDistance = plane.w;
        var planePos = planeNormal.mulScalar(planeDistance);
        var planeTangent = planeNormal.perpRight();
        var planePosStart = planePos.add(planeTangent.mulScalar(-plane.l * 0.5));
        var planePosEnd = planePosStart.add(planeTangent.mulScalar(plane.l));
        this.renderLine(planePosStart.x * scale, planePosStart.y * scale, planePosEnd.x * scale, planePosEnd.y * scale, plane.c, 2.0);

        /*
        var aabb = plane.aabb(this.fluidSim.cellSize);
        var aabbRect = Rectangle(aabb.min.x * scale, aabb.min.y * scale, aabb.max.x * scale - aabb.min.x * scale, aabb.max.y * scale - aabb.min.y * scale);
        this.renderRectangle(aabbRect, "purple");
        */

    }, that);

    // Draw cells
    if (this.showCells) {
        for (var x in this.fluidSim.grid.cells.getKeys()) {
            var xCell = this.fluidSim.grid.cells.get(x);
            for (var y in xCell.getKeys()) {
                this.ctx.strokeStyle = "green";
                this.ctx.strokeRect(x * cellSize * scale, y * cellSize * scale, cellSize * scale, cellSize * scale);
            }
        }
    }

    // Draw particles
    this.drawParticles();

    this.ctx.restore();

    if (this.showOSD) {
        // Draw osd
        var fontSize = this.fontSize;
        var osdPos = 0;
        this.renderText(0, 0, "r / kH: " + Utils.formatFloat(this.fluidSim.radius) + " / " + Utils.formatFloat(this.fluidSim.kH), "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "Cellsize: " + Utils.formatFloat(this.fluidSim.cellSize), "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "Rest Density: " + Utils.formatFloat(this.fluidSim.restDensity), "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "Viscosity: " + Utils.formatFloat(this.fluidSim.viscosity), "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "Stiffness / Near Stiffness: " + Utils.formatFloat(this.fluidSim.stiffness) + " / " + Utils.formatFloat(this.fluidSim.nearStiffness), "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "DT: " + Utils.formatFloat(Constants.DeltaTimeSec), "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "Damping: " + Utils.formatFloat(this.fluidSim.damping), "yellow", "top", "left");

        this.renderText(0, osdPos+=fontSize*2, "Particles: " + this.fluidSim.numActiveParticles + " / " + this.fluidSim.maxParticles, "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "Gravity[" + gravityMode2String(this.gravityMode) + "]: (" + this.gravity.toString() + ")", "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "Cells: " + this.fluidSim.grid.stats.cellCount, "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "Collision tests: " + this.fluidSim.stats.collisionTests, "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "Density min/max: " + Utils.formatFloat(this.fluidSim.stats.densityMin) + "/" + Utils.formatFloat(this.fluidSim.stats.densityMax), "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "Near Density min/max: " + Utils.formatFloat(this.fluidSim.stats.nearDensityMin) + "/" + Utils.formatFloat(this.fluidSim.stats.nearDensityMax), "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "Pressure min/max: " + Utils.formatFloat(this.fluidSim.stats.pressureMin) + "/" + Utils.formatFloat(this.fluidSim.stats.pressureMax), "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "Near Pressure min/max: " + Utils.formatFloat(this.fluidSim.stats.nearPressureMin) + "/" + Utils.formatFloat(this.fluidSim.stats.nearPressureMax), "yellow", "top", "left");

        this.renderText(0, osdPos+=fontSize*2, "--------------------------------", "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize*2, "Prepare duration: " + Utils.formatFloat(this.fluidSim.stats.prepareDuration.duration) + " secs.", "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "Pressure duration: " + Utils.formatFloat(this.fluidSim.stats.pressureDuration.duration) + " secs.", "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "Force duration: " + Utils.formatFloat(this.fluidSim.stats.forceDuration.duration) + " secs.", "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "Collision duration: " + Utils.formatFloat(this.fluidSim.stats.collisionDuration.duration) + " secs.", "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "Integrate duration: " + Utils.formatFloat(this.fluidSim.stats.integrateDuration.duration) + " secs.", "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "Draw duration: " + Utils.formatFloat(oldDuration) + " secs.", "yellow", "top", "left");

        var totalDuration =  this.fluidSim.stats.prepareDuration.duration + this.fluidSim.stats.pressureDuration.duration + this.fluidSim.stats.forceDuration.duration + this.fluidSim.stats.collisionDuration.duration + this.fluidSim.stats.integrateDuration.duration + oldDuration;
        this.renderText(0, osdPos+=fontSize, "= Total duration: " + Utils.formatFloat(totalDuration) + " secs.", "yellow", "top", "left");

        this.renderText(0, osdPos+=fontSize*2, "Keymap:", "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "---------------", "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "R = Clear", "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "G = Grid visibility", "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "S = Particle render mode", "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "C = Particle color", "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "Arrow Keys = Apply external force", "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "Num 0 = Change gravity", "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "Space = Pause", "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "+/- = Modify viscosity", "yellow", "top", "left");
        this.renderText(0, osdPos+=fontSize, "O = OSD visibility", "yellow", "top", "left");

        if (this.paused) {
            this.renderText(0, osdPos+=fontSize*2, "[Paused]", "yellow", "top", "left");
        }
    }

    this.frameDuration.stop();
};

SPHApplication.prototype.run = function () {
    this.init();
    var that = this;
    (function gameLoop() {
        that.update(Constants.DeltaTimeSec);
        that.draw(Constants.DeltaTimeSec);
        requestAnimFrame(gameLoop);
    })();
};