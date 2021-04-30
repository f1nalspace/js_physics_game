/**
 * This sample is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.samples.ecs.ECSSampleApp",
    [
        "final.engine.Engine",
        "final.ecs.ECSManager",
        "final.ecs.components.DisplayComponent",
        "final.ecs.components.ShapeComponent",
        "final.ecs.components.PhysicsComponent",
        "final.ecs.components.TransformComponent",
        "final.ecs.components.SpriteComponent",
        "final.Profiler",
        "final.physics.shapes.CircleShape",
        "final.physics.shapes.HalfSpaceShape",
        "final.ecs.systems.RenderSystem",
        "final.ecs.systems.PhysicsSystem",
        "final.ecs.systems.ParticleSystem",
        "final.Vec2"
    ],
    function (
        final,
        Engine,
        ECSManager,
        DisplayComponent,
        ShapeComponent,
        PhysicsComponent,
        TransformComponent,
        SpriteComponent,
        Profiler,
        CircleShape,
        HalfSpaceShape,
        RenderSystem,
        PhysicsSystem,
        ParticleSystem,
        Vec2
        ) {
        function ECSSampleApp(canvas) {
            Engine.call(this, canvas);
            this.ecsMng = new ECSManager(this);
            this.profilerEnabled = true;
        }
        ECSSampleApp.extend(Engine);

        ECSSampleApp.prototype.init = function(r, w, h){
            this.addResource("../../content/images/blue_circle.png", "image:blue_circle", "images");
        };

        ECSSampleApp.prototype.prepare = function (dt, r, w, h) {
            Engine.prototype.prepare.call(this, dt, r, w, h);

            // Adding systems to ECS
            this.ecsMng.addSystem(new RenderSystem());
            this.ecsMng.addSystem(new PhysicsSystem());
            this.ecsMng.addSystem(new ParticleSystem());

            // Initialize systems
            this.ecsMng.init(dt, r);

            var phyComp, shapeComp;

            // Add ground
            var grnEntity = this.ecsMng.addEntity();
            grnEntity.addComponent(new TransformComponent().setPosition(0, h * 0.4));
            grnEntity.addComponent(new DisplayComponent());
            grnEntity.addComponent(shapeComp = new ShapeComponent().setShape(new HalfSpaceShape(new Vec2(0, -1), w * 0.5)));
            grnEntity.addComponent(phyComp = new PhysicsComponent(0));
            phyComp.body.setShape(shapeComp.shape);

            // Add circles
            var count = 1;
            var rad = 10;
            for (var i = 0; i < count; i++) {
                var circleEntity = this.ecsMng.addEntity();
                circleEntity.addComponent(new TransformComponent().setPosition(-w*0.5+rad+Math.random()*(w-rad*2), -h*0.5+rad+Math.random()*(h-rad*2)));
                circleEntity.addComponent(new DisplayComponent());
                circleEntity.addComponent(shapeComp = new ShapeComponent().setShape(new CircleShape(rad)));
                circleEntity.addComponent(phyComp = new PhysicsComponent(1));
                circleEntity.addComponent(new SpriteComponent(this.getResource("image:blue_circle")));
                phyComp.body.setShape(shapeComp.shape);
            }
        };

        ECSSampleApp.prototype.update = function (dt, w, h) {
            Engine.prototype.update.call(this, dt, w, h);
            Profiler.begin("ECS Update");
            this.ecsMng.update(dt);
            Profiler.end();
        };

        ECSSampleApp.prototype.draw = function (r, dt, w, h) {
            Engine.prototype.draw.call(this, r, dt, w, h);
            Profiler.begin("ECS Draw");
            r.push();
            r.translate(w * 0.5, h * 0.5);
            this.ecsMng.draw(r);
            r.pop();
            Profiler.end();
            r.fillText(0, 0, "Fps: " + this.fps, "white", "left", "top");
        };

        return ECSSampleApp;
    }
);