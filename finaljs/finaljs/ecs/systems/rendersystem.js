/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.ecs.systems.RenderSystem",
    [
        "final.ecs.System",
        "final.ecs.SystemTypes",
        "final.ecs.ComponentRegister",
        "final.ecs.components.DisplayComponent",
        "final.ecs.components.ShapeComponent",
        "final.ecs.components.TransformComponent",
        "final.ecs.components.SpriteComponent",
        "final.physics.shapes.Shape",
        "final.physics.shapes.ShapeType",
        "final.renderer.BodyRenderer"
    ],
    function (final, System, SystemTypes, ComponentRegister, DisplayComponent, ShapeComponent, TransformComponent, SpriteComponent, Shape, ShapeType, BodyRenderer) {
        function RenderSystem(){
            System.call(this, SystemTypes.Draw);
            this.displayHandle = this.addRequiredComponent(new DisplayComponent());
            this.shapeHandle = this.addRequiredComponent(new ShapeComponent());
            this.transformHandle = this.addRequiredComponent(new TransformComponent());
            this.spriteHandle = this.addRequiredComponent(new SpriteComponent(), false);
            this.drawPriority = 100; // Needs to be called as last draw system
        }
        RenderSystem.extend(System);

        RenderSystem.prototype.draw = function(entities, r){
            for (var i = 0; i < entities.size(); i++) {
                var entity = entities.item(i);

                var displayComponent = entity.getComponent(this.displayHandle);
                var color = displayComponent.color;

                var shapeComponent = entity.getComponent(this.shapeHandle);
                var shape = shapeComponent.shape;

                var transformComponent = entity.getComponent(this.transformHandle);
                var pos = transformComponent.position;
                var orientation = transformComponent.orientation;

                var spriteComponent = entity.getComponent(this.spriteHandle);

                if (shape != null) {
                    switch (shape.type) {
                        case ShapeType.Plane:
                        case ShapeType.HalfSpace:
                            BodyRenderer.drawHalfSpaceOrPlane(r, pos, shape.normal, shape.size, color);
                            break;
                        case ShapeType.LineSegment:
                            BodyRenderer.drawLineSegment(r, pos, shape.distance, orientation, color);
                            break;
                        case ShapeType.Circle:
                            if (spriteComponent != null) {
                                r.drawImage(spriteComponent.image, pos.x - shape.radius, pos.y - shape.radius, shape.radius * 2, shape.radius * 2);
                            } else {
                                BodyRenderer.drawCircle(r, pos, shape.radius, orientation, color);
                            }
                            break;
                    }
                }
            }
        };

        return RenderSystem;
    }
);