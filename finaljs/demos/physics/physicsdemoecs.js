"use strict";
final.module("final.demos.physics.PhysicsDemoECS",
    [
        "final.Vec2",
        "final.math",
        "final.skeleton.SampleApp",
        "final.Profiler",
        "final.ecs.ECSManager",
        "final.ecs.ComponentRegister",
        "final.ecs.systems.RenderSystem",
        "final.ecs.systems.PhysicsSystem",
        "final.ecs.systems.InputSystem",
        "final.ecs.factories.EntityPhysicsFactory",
        "final.ecs.components.ShapeComponent",
        "final.ecs.components.DisplayComponent",
        "final.ecs.components.TransformComponent",
        "final.ecs.components.MouseInputComponent",
        "final.physics.shapes.CircleShape"
    ],
    function (
        final,
        Vec2,
        math,
        SampleApp,
        Profiler,
        ECSManager,
        ComponentRegister,
        RenderSystem,
        PhysicsSystem,
        InputSystem,
        EntityPhysicsFactory,
        ShapeComponent,
        DisplayComponent,
        TransformComponent,
        MouseInputComponent,
        CircleShape
        ) {
        var samples = {
            Simple: 0,
            SimpleCircleStack: 1,
            HeavyCircleStack: 2,
            BouncyCircleStack: 3
        };

        function PhysicsDemo(canvas) {
            SampleApp.call(this, canvas);
            this.registerSample(samples.Simple, "Simple");
            this.registerSample(samples.SimpleCircleStack, "Simple circle stack");
            this.registerSample(samples.HeavyCircleStack, "Heavy circle stack");
            this.registerSample(samples.BouncyCircleStack, "Bouncy circle stack");
            this.setSample(samples.Simple);
            this.ecsMng = new ECSManager(this);
            this.profilerEnabled = true;
            this.nextRadius = 0;
            this.shapeComponentHandle = ComponentRegister.getIndex(new ShapeComponent());
            this.objectPlacerEntity = null;
        }

        PhysicsDemo.extend(SampleApp);

        PhysicsDemo.prototype.placeBody = function(x, y, w, h){
            EntityPhysicsFactory.createCircle(this.ecsMng, new Vec2(x - w * 0.5, y - h * 0.5), this.nextRadius, 1);

            // Create next radius and apply to object placer shape
            var minSize = Math.min(w, h);
            this.nextRadius = minSize*0.01 + Math.random() * minSize*0.1;
            var shapeComp = this.objectPlacerEntity.getComponent(this.shapeComponentHandle);
            shapeComp.shape.radius = this.nextRadius;
        };

        PhysicsDemo.prototype.prepare = function (dt, r, w, h) {
            SampleApp.prototype.prepare.call(this, dt, r, w, h);

            var minSize = Math.min(w, h);

            this.nextRadius = minSize*0.01 + Math.random() * minSize*0.1;

            // Adding systems to ECS
            this.ecsMng.addSystem(new RenderSystem());
            this.ecsMng.addSystem(new PhysicsSystem());
            this.ecsMng.addSystem(new InputSystem(this));

            // Initialize systems
            this.ecsMng.init(dt, r);
        };

        PhysicsDemo.prototype.loadSample = function (id, w, h) {
            var count, radius, spacing, density, restitution, i;
            var minSize = Math.min(w, h);
            var that = this;

            var left = -w * 0.4;
            var right = w * 0.4;
            var ground = h * 0.4;

            // Clear all entities
            this.ecsMng.clearEntities();

            // Add object placer entity
            var objectPlacerTransform = new TransformComponent();
            var objectPlacerEntity = this.ecsMng.addEntity();
            objectPlacerEntity.addComponent(new ShapeComponent().setShape(new CircleShape(this.nextRadius)));
            objectPlacerEntity.addComponent(new DisplayComponent().setColor("yellow"));
            objectPlacerEntity.addComponent(objectPlacerTransform);
            objectPlacerEntity.addComponent(new MouseInputComponent().setMouseMove(function(x, y){
                objectPlacerTransform.position.x = x - w * 0.5;
                objectPlacerTransform.position.y = y - h * 0.5;
            }).setMouseClick(function(x, y, btn){
                that.placeBody(x, y, w, h);
            }));
            this.objectPlacerEntity = objectPlacerEntity;

            switch (id){
                case samples.Simple:
                    EntityPhysicsFactory.createHalfspace(this.ecsMng, new Vec2(0, h * 0.4), new Vec2(0, -1), w * 0.5);
                    EntityPhysicsFactory.createLineSegment(this.ecsMng, new Vec2(-w * 0.4, 0), h * 0.4, math.deg2rad(90), 0);
                    EntityPhysicsFactory.createLineSegment(this.ecsMng, new Vec2(w * 0.4, 0), h * 0.4, math.deg2rad(90), 0);
                    EntityPhysicsFactory.createCircle(this.ecsMng, new Vec2(), minSize*0.15, 0);
                    EntityPhysicsFactory.createCircle(this.ecsMng, new Vec2(1, -h * 0.5), minSize*0.08, 1);
                    break;

                case samples.SimpleCircleStack:
                case samples.HeavyCircleStack:
                case samples.BouncyCircleStack:
                    count = 6;
                    radius = minSize * 0.05;
                    spacing = 1.5;
                    density = 1;
                    restitution = 0;

                    EntityPhysicsFactory.createHalfspace(this.ecsMng, new Vec2(0, h * 0.4), new Vec2(0, -1), w * 0.5);
                    EntityPhysicsFactory.createLineSegment(this.ecsMng, new Vec2(-w * 0.4, 0), h * 0.4, math.deg2rad(90), 0);
                    EntityPhysicsFactory.createLineSegment(this.ecsMng, new Vec2(w * 0.4, 0), h * 0.4, math.deg2rad(90), 0);

                    for (i = 0; i < count; i++) {
                        if (id == samples.HeavyCircleStack) {
                            density = (i + 1) * 20;
                        } else if (id == samples.BouncyCircleStack) {
                            restitution = 1 - math.clamp((i + 1) / count/2, 0, 1);
                        }
                        EntityPhysicsFactory.createCircle(this.ecsMng, new Vec2(0, ground - radius*2 - (radius * 2 * spacing) * i), radius, density, restitution);
                    }

                    break;
            }
        };

        PhysicsDemo.prototype.init = function (r, w, h) {
            SampleApp.prototype.init.call(this, r, w, h);
        };

        PhysicsDemo.prototype.update = function (dt, w, h) {
            SampleApp.prototype.update.call(this, dt, w, h);

            Profiler.begin("ECS Update");
            this.ecsMng.update(dt);
            Profiler.end();
        };

        PhysicsDemo.prototype.drawOSD = function (r, w, h) {
            SampleApp.prototype.drawOSD.call(this, r, w, h);
            r.fillText(0, 20, "Fps: " + this.fps, "white", "left", "top");
        };

        PhysicsDemo.prototype.drawSample = function (id, r, dt, w, h) {
            Profiler.begin("ECS Draw");
            this.ecsMng.draw(r);
            Profiler.end();
        };

        return PhysicsDemo;
    }
);