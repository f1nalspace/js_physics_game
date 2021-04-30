/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.ecs.factories.EntityPhysicsFactory",
    [
        "final.Vec2",
        "final.ecs.ECSManager",
        "final.ecs.components.TransformComponent",
        "final.ecs.components.DisplayComponent",
        "final.ecs.components.ShapeComponent",
        "final.ecs.components.PhysicsComponent",
        "final.physics.shapes.CircleShape",
        "final.physics.shapes.HalfSpaceShape",
        "final.physics.shapes.LineSegmentShape"
    ],
    function (final, Vec2, ECSManager, TransformComponent, DisplayComponent, ShapeComponent, PhysicsComponent, CircleShape, HalfSpaceShape, LineSegmentShape) {
        /**
         * Creates a new entity which has all the required components for a physics circle body
         * @param ecsMng {Object}
         * @param pos {Vec2}
         * @param radius {number}
         * @param [density] {number}
         * @param [restitution] {number}
         * @param [friction] {number}
         * @returns {Entity}
         */
        function createCircle(ecsMng, pos, radius, density, restitution, friction){
            var shapeComp, phyComp;
            var entity = ecsMng.addEntity();
            entity.addComponent(new TransformComponent().setPositionFrom(pos));
            entity.addComponent(new DisplayComponent());
            entity.addComponent(shapeComp = new ShapeComponent().setShape(new CircleShape(radius)));
            entity.addComponent(phyComp = new PhysicsComponent(density, restitution, friction));
            phyComp.body.setShape(shapeComp.shape);
            return entity;
        }

        /**
         * Creates a new entity which has all the required components for a physics halfspace body
         * Keep in mind, that only static bodies will be returned of this type!
         * @param ecsMng {Object}
         * @param pos {Vec2}
         * @param normal {Vec2}
         * @param width {number}
         * @param [restitution] {number}
         * @param [friction] {number}
         * @returns {Entity}
         */
        function createHalfspace(ecsMng, pos, normal, width, restitution, friction){
            var shapeComp, phyComp;
            var entity = ecsMng.addEntity();
            entity.addComponent(new TransformComponent().setPositionFrom(pos));
            entity.addComponent(new DisplayComponent());
            entity.addComponent(shapeComp = new ShapeComponent().setShape(new HalfSpaceShape(normal, width)));
            entity.addComponent(phyComp = new PhysicsComponent(0, restitution, friction));
            phyComp.body.setShape(shapeComp.shape);
            return entity;
        }

        /**
         * Creates a new entity which has all the required components for a physics line segment body
         * @param ecsMng {Object}
         * @param pos {Vec2}
         * @param distance {number}
         * @param orientation {number}
         * @param [density] {number}
         * @param [restitution] {number}
         * @param [friction] {number}
         * @returns {Entity}
         */
        function createLineSegment(ecsMng, pos, distance, orientation, density, restitution, friction){
            var shapeComp, phyComp;
            var entity = ecsMng.addEntity();
            entity.addComponent(new TransformComponent().setPositionFrom(pos).setOrientation(orientation));
            entity.addComponent(new DisplayComponent());
            entity.addComponent(shapeComp = new ShapeComponent().setShape(new LineSegmentShape(distance)));
            entity.addComponent(phyComp = new PhysicsComponent(density, restitution, friction));
            phyComp.body.setShape(shapeComp.shape);
            return entity;
        }

        return {
            createCircle: createCircle,
            createHalfspace: createHalfspace,
            createLineSegment: createLineSegment
        };
    }
);