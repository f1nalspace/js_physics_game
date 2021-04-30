final.module("final.vec2math", ["final.vec"], function(final, vec){
    return {
        add: function(v, a, b) {
            v.x = a.x + b.x;
            v.y = a.y + b.y;
        },
        sub: function(v, a, b) {
            v.x = a.x - b.x;
            v.y = a.y - b.y;
        },
        div: function(v, a, b) {
            v.x = a.x / b.x;
            v.y = a.y / b.y;
        },
        mult: function(v, a, b) {
            v.x = a.x * b.x;
            v.y = a.y * b.y;
        },
        addScalar: function(v, a, b) {
            v.x = a.x + b;
            v.y = a.y + b;
        },
        subScalar: function(v, a, b) {
            v.x = a.x - b;
            v.y = a.y - b;
        },
        divScalar: function(v, a, b) {
            v.x = a.x / b;
            v.y = a.y / b;
        },
        multScalar: function(v, a, b) {
            v.x = a.x * b;
            v.y = a.y * b;
        },
        addMultScalar: function(v, a, b, scalar) {
            v.x = (a.x + b.x) * scalar;
            v.y = (a.y + b.y) * scalar;
        },
        lengthSquared: function(v) {
            return v.x * v.x + v.y * v.y;
        },
        length: function(v) {
            return Math.sqrt(this.lengthSquared(v));
        },
        dot: function(v, a) {
            return v.x * a.x + v.y * a.y;
        },
        normalize: function(v, a) {
            var l = this.length(a);
            if (l == 0) {
                l = 1;
            }
            v.x = a.x / l;
            v.y = a.y / l;
        },
        set: function(v, x, y) {
            var nx = 0;
            var ny = 0;
            if (y === undefined) {
                if (x !== undefined) {
                    nx = x;
                    ny = x;
                }
            } else {
                nx = x;
                ny = y;
            }
            v.x = nx;
            v.y = ny;
        },
        zero: function(v) {
            v.x = 0;
            v.y = 0;
        },
        perpLeft: function(v, a) {
            v.x = a.y;
            v.y = -a.x;
        },
        perpRight: function(v, a) {
            v.x = -a.y;
            v.y = a.x;
        },
        min: function(v, a, b) {
            v.x = Math.min(a.x, b.x);
            v.y = Math.min(a.y, b.y);
        },
        max: function(v, a, b) {
            v.x = Math.max(a.x, b.x);
            v.y = Math.max(a.y, b.y);
        },
        equals: function(a, b) {
            var dx = Math.abs(a.x - b.x);
            var dy = Math.abs(a.y - b.y);
            return dx === 0 && dy === 0;
        }
    };
});