// shim layer with setTimeout fallback
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

function Vector2(x, y) {
    return {
        x:x.x !== undefined ? x.x : x,
        y:x.y !== undefined ? x.y : y,
        halfX:function () {
            return this.x / 2;
        },
        halfY:function () {
            return this.y / 2;
        },
        dot:function (v) {
            return (this.x * v.x) + (this.y * v.y);
        },
        sub:function (x, y) {
            if (x.x !== undefined && x.y !== undefined) {
                return Vector2(this.x - x.x, this.y - x.y);
            } else if (y !== undefined) {
                return Vector2(this.x - x, this.y - y);
            } else {
                return Vector2(this.x - x, this.y - x);
            }
        },
        isub:function (x, y) {
            if (x.x !== undefined && x.y !== undefined) {
                this.x -= x.x;
                this.y -= x.y;
            } else if (y !== undefined) {
                this.x -= x;
                this.y -= y;
            } else {
                this.x -= x;
                this.y -= x;
            }
        },
        add:function (x, y) {
            if (x.x !== undefined && x.y !== undefined) {
                return Vector2(this.x + x.x, this.y + x.y);
            } else if (y !== undefined) {
                return Vector2(this.x + x, this.y + y);
            } else {
                return Vector2(this.x + x, this.y + x);
            }
        },
        iadd:function (x, y) {
            if (x.x !== undefined && x.y !== undefined) {
                this.x += x.x;
                this.y += x.y;
            } else if (y !== undefined) {
                this.x += x;
                this.y += y;
            } else {
                this.x += x;
                this.y += x;
            }
        },
        mul:function (x, y) {
            if (x.x !== undefined && x.y !== undefined) {
                return Vector2(this.x * x.x, this.y * x.y);
            } else if (y !== undefined) {
                return Vector2(this.x * x, this.y * y);
            } else {
                return Vector2(this.x * x, this.y * x);
            }
        },
        imul:function (x, y) {
            if (x.x !== undefined && x.y !== undefined) {
                this.x *= x.x;
                this.y *= x.y;
            } else if (y !== undefined) {
                this.x *= x;
                this.y *= y;
            } else {
                this.x *= x;
                this.y *= x;
            }
        },
        div:function (x, y) {
            if (x.x !== undefined && x.y !== undefined) {
                return Vector2(this.x / x.x, this.y / x.y);
            } else if (y !== undefined) {
                return Vector2(this.x / x, this.y / y);
            } else {
                return Vector2(this.x / x, this.y / x);
            }
        },
        idiv:function (x, y) {
            if (x.x !== undefined && x.y !== undefined) {
                this.x /= x.x;
                this.y /= x.y;
            } else if (y !== undefined) {
                this.x /= x;
                this.y /= y;
            } else {
                this.x /= x;
                this.y /= x;
            }
        },
        length:function () {
            // Our length is a scalar of itself
            return this.dot(this);
        },
        normalized:function () {
            var l = Math.sqrt(this.length());
            if (l == 0) {
                l = 1;
            }
            return Vector2(this.x / l, this.y / l);
        },
        normalize:function () {
            var l = Math.sqrt(this.length());
            if (l == 0) {
                l = 1;
            }
            this.x /= l;
            this.y /= l;
            return l;
        },
        perp:function () {
            return Vector2(-this.y, this.x);
        },
        setup:function (x, y) {
            if (x.x !== undefined && y === undefined) {
                this.x = x.x;
                this.y = x.y;
            } else if (y !== undefined) {
                this.x = x;
                this.y = y;
            } else {
                this.x = x;
                this.y = x;
            }
        },
        clone:function () {
            return Vector2(this.x, this.y);
        },
        toString:function () {
            return this.x + ", " + this.y;
        },
        zero:function () {
            this.x = 0;
            this.y = 0;
        }
    };
}

function AABB(center, scale) {
    this.center = center;
    this.prevCenter = Vector2(center);
    this.scale = scale;
    this.axis = [Vector2(1.0, 0.0), Vector2(0.0, 1.0)];
    this.acc = Vector2(0.0, 0.0);
    this.invMass = 1.0;
    this.vel = Vector2(0, 0);
    this.forces = Vector2(0, 0);
}

AABB.prototype.addForce = function (v, dt) {
    this.forces.iadd(v.mul(this.invMass * dt * dt));
};

AABB.prototype.resetForces = function () {
    this.forces.zero();
};

AABB.prototype.integrate = function (dt) {
    this.acc.iadd(this.forces);
    var position = this.center.mul(2).sub(this.prevCenter).add(this.acc);
    this.prevCenter.setup(this.center);
    this.vel.setup(position.x - this.prevCenter.x, position.y - this.prevCenter.y);
    this.center.setup(position);
    this.acc.zero();
};

AABB.prototype.project = function (axis) {
    var verts = [
        this.center.add(-this.scale.halfX(), -this.scale.halfY()),
        this.center.add(this.scale.halfX(), -this.scale.halfY()),
        this.center.add(this.scale.halfX(), this.scale.halfY()),
        this.center.add(-this.scale.halfX(), this.scale.halfY())
    ];

    var pos = this.center.dot(axis);
    var radius = Math.abs(axis.dot(this.axis[0])) * this.scale.halfX() + Math.abs(axis.dot(this.axis[1])) * this.scale.halfY();
    var min = pos - radius;
    var max = pos + radius;

    // 0.......1
    // .       .
    // .       .
    // 3.......2

    /*
     var min = verts[0].dot(axis);
     var max = min;

     for (var i in verts) {
     var v = verts[i];
     var d = verts[i].dot(axis);
     if (d < min) {
     min = d;
     }
     if (d > max) {
     max = d;
     }
     }
     */

    return {
        min:min,
        max:max,
        toString:function () {
            return this.min + " - " + this.max;
        },
        isOverlap:function (other) {
            if (this.max < other.min) {
                return false;
            }
            if (other.max < this.min) {
                return false;
            }
            return true;
        }
    };
}

var Keys = {
    Left:37,
    Right:39,
    Up:38,
    Down:40
}

function Game() {

    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.keystate = [];
    this.mousestate = [];
    this.mouse = Vector2(-1, -1);

    this.canvas.focus();

    var that = this;

    var getXandY = function (e) {
        var x = e.clientX - that.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.canvas.getBoundingClientRect().top;
        return Vector2(x, y);
    };

    this.canvas.addEventListener("keydown", function (ev) {
        that.keystate[ev.keyCode] = true;
    }, false);
    this.canvas.addEventListener("keyup", function (ev) {
        that.keystate[ev.keyCode] = false;
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
}

Game.prototype.isKeyDown = function (key) {
    return this.keystate[key] !== undefined && this.keystate[key] === true;
}

Game.prototype.isMouseDown = function (button) {
    return this.mousestate[button] !== undefined && this.mousestate[button] === true;
}

Game.prototype.setKeyDown = function (key, value) {
    this.keystate[key] = value;
}

Game.prototype.run = function () {
    this.init();
    var that = this;
    var frametime = 1.0 / 60;
    (function gameLoop() {
        requestAnimFrame(gameLoop);
        that.update(frametime);
        that.render();
    })();
}

Game.prototype.init = function () {
    this.player = new AABB(Vector2(0, -200), Vector2(100, 100));
    this.boxes = [];
    this.boxes.push(this.player);
    this.boxes.push(new AABB(Vector2(-150, 50), Vector2(150, 150)));
    this.boxes.push(new AABB(Vector2(0, 50), Vector2(150, 150)));
    this.boxes.push(new AABB(Vector2(150, 50), Vector2(150, 150)));
    this.mtv = Vector2(0, 0);
    this.mtvAxis = Vector2(0, 0);
    this.sat = new SeparatingAxisTheorem();
    this.time = 0;
}

Game.prototype.update = function (dt) {
    this.mtv.setup(1, 0);
    this.mtvAxis.setup(0, 0);

    // Reset forces
    this.player.resetForces();

    // Add forces
    this.player.addForce(Vector2(0, 9.81), dt);

    var moveSpeed = 50;
    if (this.isKeyDown(Keys.Left)) {
        this.player.addForce(Vector2(-100, 0), dt);
    } else if (this.isKeyDown(Keys.Right)) {
        this.player.addForce(Vector2(100, 0), dt);
    }
    if (this.isKeyDown(Keys.Up)) {
        this.player.addForce(Vector2(0, -100), dt);
    } else if (this.isKeyDown(Keys.Down)) {
        this.player.addForce(Vector2(0, 100), dt);
    }

    var step = dt;
    this.time += dt;

    while (dt && this.time >= step) {

        // Integrate
        this.player.integrate(dt);

        // Separating axis test
        for (var i in this.boxes) {
            var box = this.boxes[i];
            if (box != this.player) {
                var satTest = this.sat.getCollision(this.player, box, this.player.vel, box.vel, this.mtv, this.mtvAxis);
                if (satTest) {
                    // Separation when minimum translation distance is negative
                    if (this.mtv.x < 0.0) {
                        this.player.center.x += this.mtvAxis.x * -this.mtv.x * 1.01;
                        this.player.center.y += this.mtvAxis.y * -this.mtv.x * 1.01;
                    } else {
                        // Separation in time when, distance is positive
                        //var v = this.player.center.sub(this.player.prevCenter);
                        //this.player.prevCenter.setup(this.player.center.add(v.mul(this.mtv.x)));
                    }
                }
            }
        }

        this.time -= step;
    }

}

Game.prototype.drawBox = function (center, scale, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(center.x - scale.halfX(), center.y - scale.halfY(), scale.x, scale.y);
}

Game.prototype.render = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw black background
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Make 0, 0 the center of the canvas
    this.ctx.save();
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

    // Draw boxes
    this.drawBox(this.boxes[0].center, this.boxes[0].scale, "red");
    this.drawBox(this.boxes[1].center, this.boxes[1].scale, "darkblue");
    this.drawBox(this.boxes[2].center, this.boxes[2].scale, "blue");
    this.drawBox(this.boxes[3].center, this.boxes[3].scale, "darkblue");

    /*
     // Draw velocity box
     if (this.player.vel.length() > Number.MIN_VALUE) {
     var targetPos = this.player.center.add(this.player.vel);
     this.ctx.globalAlpha = 0.75;
     this.drawBox(targetPos, this.player.scale, "yellow");
     this.ctx.beginPath();
     this.ctx.strokeStyle = "yellow";
     this.ctx.moveTo(this.player.center.x - this.player.scale.halfX(), this.player.center.y - this.player.scale.halfY());
     this.ctx.lineTo(targetPos.x - this.player.scale.halfX(), targetPos.y - this.player.scale.halfY());
     this.ctx.moveTo(this.player.center.x + this.player.scale.halfX(), this.player.center.y - this.player.scale.halfY());
     this.ctx.lineTo(targetPos.x + this.player.scale.halfX(), targetPos.y - this.player.scale.halfY());
     this.ctx.moveTo(this.player.center.x + this.player.scale.halfX(), this.player.center.y + this.player.scale.halfY());
     this.ctx.lineTo(targetPos.x + this.player.scale.halfX(), targetPos.y + this.player.scale.halfY());
     this.ctx.moveTo(this.player.center.x - this.player.scale.halfX(), this.player.center.y + this.player.scale.halfY());
     this.ctx.lineTo(targetPos.x - this.player.scale.halfX(), targetPos.y + this.player.scale.halfY());
     this.ctx.stroke();
     this.ctx.closePath();
     this.ctx.globalAlpha = 1.0;
     }
     */

    // Draw text
    this.ctx.font = "normal 14pt Arial";
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";
    this.ctx.fillText("Pos X: " + this.player.center.x, -(this.canvas.width / 2), -(this.canvas.height / 2));
    this.ctx.fillText("Pos Y: " + this.player.center.y, -(this.canvas.width / 2), -(this.canvas.height / 2) + 20);
    this.ctx.fillText("Vel X: " + this.player.vel.x, -(this.canvas.width / 2), -(this.canvas.height / 2) + 40);
    this.ctx.fillText("Vel Y: " + this.player.vel.y, -(this.canvas.width / 2), -(this.canvas.height / 2) + 60);
    this.ctx.restore();
}


