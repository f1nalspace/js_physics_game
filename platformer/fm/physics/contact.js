/**
 * Created by tspaete on 27.02.14.
 */
fm.ns('fm.physics.Contact');
fm.req('fm.geometry.Vec2');
fm.req('fm.geometry.math');

(function(Vec2, vmath, physics) {
    function Contact() {
        this.normal = Vec2();
        this.distance = 0;
        this.bodyA = null;
        this.bodyB = null;
        this.tileAABB = null;
    }
    physics.Contact = Contact;
})(fm.geometry.Vec2, fm.geometry.math, fm.physics);
