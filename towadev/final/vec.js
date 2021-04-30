final.module("final.vec", [], function(){
    var Vec2 = (function () {
        function Vec2(x, y) {
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
            return {
                x: nx,
                y: ny
            }
        }
        return Vec2;
    })();

    var Vec3 = (function () {
        function Vec3(x, y, z) {
            var nx = 0;
            var ny = 0;
            var nz = 0;
            if (z === undefined) {
                if (y === undefined) {
                    nx = x;
                    ny = x;
                    nz = x;
                } else {
                    nx = x;
                    ny = y;
                    nz = 0;
                }
            } else {
                nx = x;
                ny = y;
                nz = z;
            }
            return {
                x: nx,
                y: ny,
                z: nz
            }
        }
        return Vec3;
    })();

    var Vec4 = (function () {
        function Vec4(x, y, z, w) {
            return {
                x: x,
                y: y,
                z: z,
                w: w
            }
        }
        return Vec4;
    })();

    return {
        Vec2: Vec2,
        Vec3: Vec3,
        Vec4: Vec4
    }
});