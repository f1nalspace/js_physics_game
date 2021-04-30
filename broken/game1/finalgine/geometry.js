var finalgine = finalgine || {};

/*
 Projection class
 */
finalgine.Projection = function (min, max) {
    return {
        min:min,
        max:max,
        toString:function () {
            return this.min + ", " + this.max;
        },
        draw:function (r, center, scale, axis, color, lineWidth) {
            var as = axis.mul(scale);
            var target = center.add(as.div(2.0));
            var xp = target.x - (scale.x);
            var yp = target.y - (scale.y);
            var sx = as.x;
            var sy = as.y;
            r.drawLine(xp, yp, xp + sx, yp + sy, color, lineWidth);
        }
    };
};

/*
 Bounding volume class
 */
finalgine.BoundingVolume = function () {
    return {
        center:finalgine.Vector2(0.0, 0.0),
        scale:finalgine.Vector2(1.0, 1.0),
        axis:[],
        project:function (axis) {
            throw new Error("Abstract method");
        },
        draw:function (r, color) {
            throw new Error("Abstract method");
        },
        boundRect:function (offset) {
        	offset = offset || finalgine.Vector2(0.0, 0.0);
            return finalgine.Rectangle(offset.x + (this.center.x - this.scale.halfX()), offset.y + (this.center.y - this.scale.halfY()), this.scale.x, this.scale.y);
        },
        toString:function () {
            return this.center.toString() + " - " + this.scale.toString() + " (" + this.boundRect().toString() + ")";
        }
    };
};

/*
 AABB class
 */
finalgine.AABB = function (pos, size) {
    var b = finalgine.BoundingVolume();
    b.center = pos;
    b.scale = size;
    b.axis = [finalgine.Vector2(1.0, 0.0), finalgine.Vector2(0.0, 1.0)];
    b.project = function (axis) {
        var r = Math.abs(axis.dot(this.axis[0])) * this.scale.halfX() + Math.abs(axis.dot(this.axis[1])) * this.scale.halfY();
        return finalgine.Projection(-r, +r);
    };
    b.draw = function (r, color) {
        var rect = this.boundRect();
        r.drawRect(rect.left(), rect.top(), rect.w, rect.h, color, 1);
    };
    return b;
};

/*
 Rectangle
*/
finalgine.Rectangle = function (x, y, w, h) {
   return {
       x:x.x || x,
       y:x.y || y,
       w:y.x || w,
       h:y.y || h,
       left:function () {
           return this.x;
       },
       right:function () {
           return this.x + this.w;
       },
       top:function () {
           return this.y;
       },
       bottom:function () {
           return this.y + this.h;
       },
       contains:function (r) {
           return (r.right() >= this.left()) &&
               (r.bottom() >= this.top()) &&
               (r.left() <= this.right()) &&
               (r.top() <= this.bottom());
       },
       toString:function () {
           return "" + this.left() + "," + this.right() + "," + this.top() + "," + this.bottom();
       },
       add:function (x, y) {
           if (x.x !== undefined && y === undefined) {
               return finalgine.Rectangle(this.x + x.x, this.y + x.y, this.w, this.h);
           } else {
               return finalgine.Rectangle(this.x + x, this.y + y, this.w, this.h);
           }
       },
       mul:function (x, y) {
           if (x.x !== undefined && y === undefined) {
               return finalgine.Rectangle(this.x * x.x, this.y * x.y, this.w * x.x, this.h * x.y);
           } else {
               return finalgine.Rectangle(this.x * x, this.y * (y || x), this.w * x, this.h * (y || x));
           }
       },
       div:function (x, y) {
           if (x.x !== undefined && y === undefined) {
               return finalgine.Rectangle(this.x / x.x, this.y / x.y, this.w / x.x, this.h / x.y);
           } else {
               return finalgine.Rectangle(this.x / x, this.y / (y || x), this.w / x, this.h / (y || x));
           }
       }
   };
};

