/**
 * Created by final on 08.01.2014.
 */
fm.ns("fm.geometry.Vec2");

(function(geo){
    // TODO: Growable vec2 pool - faster vec2 creation
    function Vec2(x,y) {
        if (typeof x != "undefined") {
            if (typeof x[0] != "undefined") {
                return [x[0], x[1]];
            } else {
                return [x,y];
            }
        } else {
            return [0,0];
        }
    }
    geo.Vec2 = Vec2;
})(fm.geometry);