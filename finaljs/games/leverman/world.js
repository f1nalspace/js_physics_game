/**
 * Crackout (Krakout-clone) based on finaljs game development framework
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.games.leverman.World",
    [
        "final.Vec2"
    ],
    function (final, Vec2) {
        function World() {
            // World parameters
            var drawScale = 1.0;
            var velIterations = 7;
            var posIterations = 3;

            // This needs to be added as a global variable :-(
            var world = window.world = new b2World(new b2Vec2(0, 10));

            function createChain(pos, angle, dynamic, density, verts, userData) {
                var bodyDef = new b2BodyDef();
                bodyDef.type = dynamic ? b2_dynamicBody : b2_staticBody;
                bodyDef.position.Set(pos.x, pos.y);
                bodyDef.angle = Math.PI / 180 * angle;
                bodyDef.userData = userData || null;
                var body = world.CreateBody(bodyDef);
                var shape = new b2ChainShape();
                var chainVerts = [];
                for (var i = 0; i < verts.length; i++) {
                    chainVerts.push(new b2Vec2(verts[i].x, verts[i].y));
                }
                shape.vertices = chainVerts;
                shape.CreateLoop();
                var fixtureDef = new b2FixtureDef();
                fixtureDef.density = density;
                fixtureDef.shape = shape;
                body.CreateFixtureFromDef(fixtureDef);
                return body;
            }

            function createBox(pos, angle, dynamic, density, halfSize, userData) {
                var bodyDef = new b2BodyDef();
                bodyDef.type = dynamic ? b2_dynamicBody : b2_staticBody;
                bodyDef.position.Set(pos.x, pos.y);
                bodyDef.angle = Math.PI / 180 * angle;
                bodyDef.userData = userData || null;
                var body = world.CreateBody(bodyDef);
                var shape = new b2PolygonShape();
                shape.SetAsBoxXY(halfSize.x, halfSize.y);
                var fixtureDef = new b2FixtureDef();
                fixtureDef.density = density;
                fixtureDef.shape = shape;
                body.CreateFixtureFromDef(fixtureDef);
                return body;
            }

            function drawFixture(r, fixture, transform) {
                var verts;
                var shape = fixture.shape;
                if (shape instanceof b2ChainShape) {
                    verts = shape.vertices;
                    r.drawCustom(function(c){
                        for (var i = 0, vertMax = verts.length; i < vertMax; i++) {
                            var v = new b2Vec2();
                            b2Vec2.Mul(v, transform, verts[i]);
                            if (i == 0) {
                                c.moveTo(v.x * drawScale, v.y * drawScale);
                            } else {
                                c.lineTo(v.x * drawScale, v.y * drawScale);
                            }
                        }
                    }, "white", 2);
                } else if (shape instanceof b2PolygonShape) {
                    verts = shape.vertices;
                    r.drawCustom(function(c){
                        for (var i = 0, vertMax = verts.length; i < vertMax; i++) {
                            var v = new b2Vec2();
                            b2Vec2.Mul(v, transform, verts[i]);
                            if (i == 0) {
                                c.moveTo(v.x * drawScale, v.y * drawScale);
                            } else {
                                c.lineTo(v.x * drawScale, v.y * drawScale);
                            }
                        }
                        c.closePath();
                    }, "white", 2);
                }
            }

            function draw(r) {
                for (var i = 0, maxBodies = world.bodies.length; i < maxBodies; i++) {
                    var body = world.bodies[i];
                    var transform = body.GetTransform();
                    for (var j = 0, maxFixtures = body.fixtures.length; j < maxFixtures; j++){
                        drawFixture(r, body.fixtures[j], transform);
                    }
                }
            }

            function step(dt) {
                world.Step(dt, velIterations, posIterations);
            }

            function setDrawScale(scale) {
                drawScale = scale;
            }

            return {
                createChain: createChain,
                createBox: createBox,
                draw: draw,
                step: step,
                setDrawScale: setDrawScale
            };
        }

        return World;
  }
);