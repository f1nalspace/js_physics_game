var finalgine = finalgine || {};

/*
 Vector2
 */
finalgine.Vector2 = function (x, y) {
    var nx = x !== undefined ? (x.x !== undefined && y === undefined ? x.x : x) : 0;
    var ny = y !== undefined ? y : (x !== undefined && x.y !== undefined ? x.y : nx);
    return {
        x:nx,
        y:ny,
        halfX:function () {
            return x / 2;
        },
        halfY:function () {
            return y / 2;
        },
        add:function (x, y) {
            if (x.x !== undefined && y === undefined) {
                return finalgine.Vector2(this.x + x.x, this.y + x.y);
            } else {
                return finalgine.Vector2(this.x + x, this.y + (y || x));
            }
        },
        iadd:function (x, y) {
            if (x.x !== undefined && y === undefined) {
                this.x += x.x;
                this.y += x.y;
            } else {
                this.x += x;
                this.y += (y || x);
            }
        },
        sub:function (x, y) {
            if (x.x !== undefined && y === undefined) {
                return finalgine.Vector2(this.x - x.x, this.y - x.y);
            } else {
                return finalgine.Vector2(this.x - x, this.y - (y || x));
            }
        },
        isub:function (x, y) {
            if (x.x !== undefined && y === undefined) {
                this.x -= x.x;
                this.y -= x.y;
            } else {
                this.x -= x;
                this.y -= (y || x);
            }
        },
        mul:function (x, y) {
            if (x.x !== undefined && y === undefined) {
                return finalgine.Vector2(this.x * x.x, this.y * x.y);
            } else {
                return finalgine.Vector2(this.x * x, this.y * (y || x));
            }
        },
        imul:function (x, y) {
            if (x.x !== undefined && y === undefined) {
                this.x *= x.x;
                this.y *= x.y;
            } else {
                this.x *= x;
                this.y *= (y || x);
            }
        },
        div:function (x, y) {
            if (x.x !== undefined && y === undefined) {
                return finalgine.Vector2(this.x / x.x, this.y / x.y);
            } else {
                return finalgine.Vector2(this.x / x, this.y / (y || x));
            }
        },
        idiv:function (x, y) {
            if (x.x !== undefined && y === undefined) {
                this.x /= x.x;
                this.y /= x.y;
            } else {
                this.x /= x;
                this.y /= (y || x);
            }
        },
        setup:function (x, y) {
            if (x.x !== undefined && y === undefined) {
                this.x = x.x;
                this.y = x.y;
            } else {
                this.x = x;
                this.y = y || x;
            }
        },
        floor:function () {
            return finalgine.Vector2(Math.floor(this.x), Math.floor(this.y));
        },
        toString:function () {
            return "x: " + this.x + ", y: " + this.y;
        },
        dot:function (v) {
            return (this.x * v.x) + (this.y * v.y);
        },
        clone:function () {
            return finalgine.Vector2(this.x, this.y);
        },
        length:function () {
            return this.dot(this);
        },
        lengthSqrt:function () {
            return Math.sqrt(this.length());
        },
        normalize:function () {
            var l = this.lengthSqrt();
            if (l == 0) l = 1;
            this.x /= l;
            this.y /= l;
            return l;
        },
        normalized:function () {
            var l = this.lengthSqrt();
            if (l == 0) l = 1;
            return this.div(l);
        },
        perp:function () {
            return finalgine.Vector2(-this.y, this.x);
        },
        zero:function () {
            this.x = 0;
            this.y = 0;
        },
        reflect:function (normal, bounciness, friction) {
            // Project velocity on line normal
            var projVelocity = this.dot(normal);
            // Impact velocity vector
            var impactVel = normal.mul(projVelocity);
            // Tangent velocity vector (across the surface of collision)
            var tangentVel = this.sub(impactVel);
            // Velocity for bounciness
            var velBounciness = finalgine.Vector2(-impactVel.x * bounciness, -impactVel.y * bounciness);
            // Velocity for friction
            var velFriction = finalgine.Vector2(tangentVel.x * (1.0 - friction), tangentVel.y * (1.0 - friction));
            // Resulting velocity
            return velBounciness.add(velFriction);
        }
    };
};

/*
 Vector3
 */
finalgine.Vector3 = function (x, y, z) {
    var nx = x !== undefined ? (x.x !== undefined && y === undefined ? x.x : x) : 0;
    var ny = y !== undefined ? y : (x !== undefined && x.y !== undefined ? x.y : nx);
    var nz = z !== undefined ? z : (x !== undefined && x.z !== undefined ? x.z : nx);
    return {
        x:nx,
        y:ny,
        z:nz,
        halfX:function () {
            return x / 2;
        },
        halfY:function () {
            return y / 2;
        },
        halfZ:function () {
            return z / 2;
        },
        add:function (x, y, z) {
            if (x.x !== undefined && y === undefined && z === undefined) {
                return finalgine.Vector3(this.x + x.x, this.y + x.y, this.z + x.z);
            } else {
                return finalgine.Vector3(this.x + x, this.y + (y || x), this.z + (z || x));
            }
        },
        iadd:function (x, y, z) {
            if (x.x !== undefined && y === undefined && z === undefined) {
                this.x += x.x;
                this.y += x.y;
                this.z += x.z;
            } else {
                this.x += x;
                this.y += (y || x);
                this.z += (z || x);
            }
        },
        sub:function (x, y, z) {
            if (x.x !== undefined && y === undefined && z === undefined) {
                return finalgine.Vector3(this.x - x.x, this.y - x.y, this.z - x.z);
            } else {
                return finalgine.Vector3(this.x - x, this.y - (y || x), this.z - (z || x));
            }
        },
        isub:function (x, y, z) {
            if (x.x !== undefined && y === undefined && z === undefined) {
                this.x -= x.x;
                this.y -= x.y;
                this.z -= x.z;
            } else {
                this.x -= x;
                this.y -= (y || x);
                this.z -= (z || x);
            }
        },
        mul:function (x, y, z) {
            if (x.x !== undefined && y === undefined && z === undefined) {
                return finalgine.Vector3(this.x * x.x, this.y * x.y, this.z * x.z);
            } else {
                return finalgine.Vector3(this.x * x, this.y * (y || x), this.z * (z || x));
            }
        },
        imul:function (x, y, z) {
            if (x.x !== undefined && y === undefined && z === undefined) {
                this.x *= x.x;
                this.y *= x.y;
                this.z *= x.z;
            } else {
                this.x *= x;
                this.y *= (y || x);
                this.z *= (z || x);
            }
        },
        div:function (x, y, z) {
            if (x.x !== undefined && y === undefined && z === undefined) {
                return finalgine.Vector3(this.x / x.x, this.y / x.y, this.z / x.z);
            } else {
                return finalgine.Vector3(this.x / x, this.y / (y || x), this.z / (z || x));
            }
        },
        idiv:function (x, y, z) {
            if (x.x !== undefined && y === undefined && z === undefined) {
                this.x /= x.x;
                this.y /= x.y;
                this.z /= x.z;
            } else {
                this.x /= x;
                this.y /= (y || x);
                this.z /= (z || x);
            }
        },
        setup:function (x, y, z) {
            if (x.x !== undefined && y === undefined) {
                this.x = x.x;
                this.y = x.y;
                this.z = x.z;
            } else {
                this.x = x;
                this.y = y || x;
                this.z = z || x;
            }
        },
        dot:function (v) {
            return (this.x * v.x) + (this.y * v.y) + (this.z * v.z);
        },
        clone:function () {
            return finalgine.Vector3(this.x, this.y, this.z);
        },
        length:function () {
            return this.dot(this);
        },
        lengthSqrt:function () {
            return Math.sqrt(this.length());
        },
        normalized:function () {
            var l = this.lengthSqrt();
            if (l == 0) l = 1;
            return this.div(l);
        },
        zero:function () {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }
    };
};