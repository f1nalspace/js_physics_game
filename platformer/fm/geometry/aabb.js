/**
 * Created by final on 09.02.14.
 */
fm.ns("fm.geometry");
fm.req("fm.geometry.Vec2");
fm.req("fm.geometry.math");
(function(geo, vmath){
    var aabbAxis = [
        geo.Vec2(1,0),
        geo.Vec2(0,1)
    ];

    function AABB(min, max) {
        this.min = min;
        this.max = max;
    }

    AABB.prototype.project = function(output, normal) {
        var eX = (this.max[0] - this.min[0]) * 0.5;
        var eY = (this.max[1] - this.min[1]) * 0.5;
        var r = Math.abs(vmath.vec2Dot(normal, aabbAxis[0])) * eX + Math.abs(vmath.vec2Dot(normal, aabbAxis[1])) * eY;
        output[0] = -r;
        output[1] = +r;
    };

    AABB.prototype.getCenterX = function() {
        return this.min[0] + (this.max[0] - this.min[0]) * 0.5;
    };

    AABB.prototype.getCenterY = function() {
        return this.min[1] + (this.max[1] - this.min[1]) * 0.5;
    };

    geo.AABB = AABB;
})(fm.geometry, fm.geometry.math);