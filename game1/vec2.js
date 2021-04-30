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