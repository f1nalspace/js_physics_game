function Vec2(x, y) {
    return {
        x:x,
        y:y,
        length: function() {
            return Math.sqrt(x * x + y * y);
        },
        dot: function(v) {
            return (x * v.x) + (y * v.y);
        },
        invert: function() {
            return Vec2(-this.x, -this.y);
        },
        perpRight: function() {
            return Vec2(-this.y, this.x);
        },
        add: function(v) {
            if (typeof v == "object") {
                return Vec2(this.x + v.x, this.y + v.y);
            } else {
                return Vec2(this.x + v, this.y + v);
            }
        },
        sub: function(v) {
            if (typeof v == "object") {
                return Vec2(this.x - v.x, this.y - v.y);
            } else {
                return Vec2(this.x - v, this.y - v);
            }
        },
        mul: function(v) {
            if (typeof v == "object") {
                return Vec2(this.x * v.x, this.y * v.y);
            } else {
                return Vec2(this.x * v, this.y * v);
            }
        }
    };
}

function Plane2(x, y, d) {
    return {
        x:x,
        y:y,
        d:d
    };
}

function IndexGrid(cellSize, origin, size) {
    this.cellSize = cellSize;
    this.origin = origin;
    this.size = size;
    this.cells = [];
    this.activeCells = [];
    this.activeCellCount = 0;
}

IndexGrid.prototype.draw = function (r) {
    r.strokeStyle = "blue";
    r.lineWidth = 2;
    for (var i = 0; i < this.activeCellCount; i++) {
        var cell = this.activeCells[i];
        var tx = this.origin.x + (cell.x * this.cellSize);
        var ty = this.origin.y + (cell.y * this.cellSize);
        r.strokeRect(tx, ty, this.cellSize, this.cellSize);
    }
    r.lineWidth = 2;
};

IndexGrid.prototype.insert = function (point, object) {
    var x = Math.floor((point.x - this.origin.x) / this.cellSize);
    var y = Math.floor((point.y - this.origin.x) / this.cellSize);
    var index = -1;
    if (this.cells[x] === undefined) {
        this.cells[x] = [];
    }
    var cell = this.cells[x][y];
    if (this.cells[x][y] === undefined) {
        cell = {
            x:x,
            y:y,
            activeIndex:this.activeCellCount,
            buckets:[]
        };
        this.cells[x][y] = cell;
        this.activeCells[this.activeCellCount] = cell;
        this.activeCellCount++;
    }
    index = cell.buckets.length;
    cell.buckets.push(object);
    return {
        x:x,
        y:y,
        index: index
    }
};

IndexGrid.prototype.reset = function () {
    this.activeCellCount = 0;
    this.activeCells = [];
    this.cells = [];
};

IndexGrid.prototype.getCell = function (x, y) {
    if (this.cells[x] !== undefined && this.cells[x][y] !== undefined) {
        return this.cells[x][y];
    }
    return null;
};

function IndexGridDemo(canvas) {
    Game.call(this, canvas);

    this.particleRadius = 10;
    this.grid = new IndexGrid(this.particleRadius * 2, Vec2(-256, -256), Vec2(512, 512));
    this.particles = [];
    this.selectedParticle = null;
    this.planes = [
        Plane2(-1, 0, 256),
        Plane2(1, 0, 256),
        Plane2(0, -1, 256),
        Plane2(0, 1, 256)
    ];

    var particleCount = 100;
    for (var i = 0; i < particleCount; i++) {
        var x = this.grid.origin.x + (this.grid.cellSize) + (Math.random() * (this.grid.size.x - this.grid.cellSize * 3));
        var y = this.grid.origin.y + (this.grid.cellSize) + (Math.random() * (this.grid.size.y - this.grid.cellSize * 3));
        var speed = Math.random() * 150;
        var particle = {
            position:Vec2(x, y),
            lx:-1,
            ly:-1,
            vel:Vec2(-(speed/2) + Math.random() * speed, -(speed/2) + Math.random() * speed)
        }
        var p = this.grid.insert(particle.position, particle);
        particle.lx = p.x;
        particle.ly = p.y;
        particle.index = i;
        this.particles.push(particle);
    }
};
IndexGridDemo.inheritsFrom(Game);

IndexGridDemo.prototype.findNeighbors = function (particle) {
    var lst = [];
    for (var ny = -1; ny < 2; ny++) {
        for (var nx = -1; nx < 2; nx++) {
            var x = particle.lx + nx;
            var y = particle.ly + ny;
            var cell = this.grid.getCell(x, y);
            if (cell != null) {
                for (var i = 0; i < cell.buckets.length; i++) {
                    var other = cell.buckets[i];
                    if (other.index != particle.index) {
                        lst.push(other);
                    }
                }
            }
        }
    }
    return lst;
};

IndexGridDemo.prototype.selectParticle = function(x, y) {
    var minLen = Number.MAX_VALUE;
    this.selectedParticle = null;
    for (var i = 0; i < this.particles.length; i++) {
        var particle = this.particles[i];
        var diff = Vec2(x - particle.position.x, y - particle.position.y);
        var l = diff.length();
        if (l < this.particleRadius) {
            if (l < minLen) {
                minLen = l;
                this.selectedParticle = particle;
            }
        }
    }
};

function reflectVector(v, normal, bounciness, friction) {
    // Project velocity on line normal
    var projVelocity = v.dot(normal);
    // Impact velocity vector
    var impactVel = normal.mul(projVelocity);
    // Tangent velocity vector (across the surface of collision)
    var tangentVel = v.sub(impactVel);
    // Velocity for bounciness
    var velBounciness = Vec2(-impactVel.x * bounciness, -impactVel.y * bounciness);
    // Velocity for friction
    var velFriction = Vec2(tangentVel.x * (1.0 - friction), tangentVel.y * (1.0 - friction));
    // Resulting velocity
    return velBounciness.add(velFriction);
}

IndexGridDemo.prototype.update = function (r, dt) {
    // Clear grid
    this.grid.reset();

    // Add new particles
    if (this.isMouseDown(0)) {
        var particle = {
            position:Vec2(this.mouse.x, this.mouse.y),
            lx:-1,
            ly:-1,
            vel:Vec2(0, 0),
            index: this.particles.length
        }
        var p = this.grid.insert(particle.position, particle);
        particle.lx = p.x;
        particle.ly = p.y;
        this.particles.push(particle);

        this.setMouseButton(0, false);
    }


    // Update particles
    for (var i = 0; i < this.particles.length; i++) {
        var particle = this.particles[i];

        // Particle integration
        particle.position.x += particle.vel.x * dt;
        particle.position.y += particle.vel.y * dt;

        // Simple plane collision
        for (var j = 0; j < this.planes.length; j++) {
            var plane = this.planes[j];
            var pos = Vec2(plane.x * plane.d, plane.y * plane.d);
            var normal = Vec2(plane.x, plane.y).invert();
            var tangent = normal.perpRight();

            var p = particle.position.sub(pos);
            var d = p.dot(tangent);

            var closestPoint = pos.add(tangent.mul(d));

            var distance = closestPoint.sub(particle.position).length();
            if (distance < this.particleRadius) {
                // Reflect velocity
                var vr = reflectVector(particle.vel, normal, 1.0, 0.0);
                particle.vel.x = vr.x;
                particle.vel.y = vr.y;
            }
        }

        var p = this.grid.insert(particle.position, particle);
        particle.lx = p.x;
        particle.ly = p.y;
        particle.index = i;
    }
};

IndexGridDemo.prototype.render = function (r) {
    Game.prototype.render.call(this, r);

    r.save();
    r.translate(this.canvas.width * 0.5, this.canvas.height * 0.5);

    r.fillStyle = "#cccccc";
    r.fillRect(this.grid.origin.x, this.grid.origin.y, this.grid.size.x, this.grid.size.y);

    r.font = "normal 12px Arial";
    r.textBaseline = "top";
    r.textAlign = "left";
    r.fillStyle = "red";
    r.fillText("Active cells: " + this.grid.activeCellCount, -(this.canvas.width * 0.5) + 10, -(this.canvas.height * 0.5) + 10);
    r.fillText("Num particles: " + this.particles.length, -(this.canvas.width * 0.5) + 10, -(this.canvas.height * 0.5) + 22);

    r.lineWidth = 4;

    // Draw planes
    r.strokeStyle = "red";
    for (var i = 0; i < this.planes.length; i++) {
        var plane = this.planes[i];

        var pos = Vec2(plane.x * plane.d, plane.y * plane.d);
        var normal = Vec2(plane.x, plane.y).invert();
        var tangent = normal.perpRight();
        var normalLength = 20;
        var normalTarget = pos.add(normal.mul(normalLength));

        var lineLength = 512;
        var lineStart = pos.add(tangent.mul(lineLength * 0.5));
        var lineEnd = lineStart.add(tangent.mul(-1).mul(lineLength));

        // Draw line
        r.beginPath();
        r.moveTo(lineStart.x, lineStart.y   );
        r.lineTo(lineEnd.x, lineEnd.y);
        r.closePath();
        r.stroke();

        // Draw plane direction
        r.beginPath();
        r.moveTo(pos.x, pos.y   );
        r.lineTo(normalTarget.x, normalTarget.y);
        r.closePath();
        r.stroke();
    }

    r.lineWidth = 2;

    // Draw grid
    this.grid.draw(r);

    r.font = "bold 12px Arial";
    r.textAlign = "center";
    r.textBaseline = "middle";

    for (var i = 0; i < this.particles.length; i++) {
        var particle = this.particles[i];

        r.fillStyle = "yellow";

        r.beginPath();
        r.arc(particle.position.x, particle.position.y, this.particleRadius, 0 * Math.PI, 2 * Math.PI, false);
        r.closePath();
        r.fill();
    }

    r.restore();
};

