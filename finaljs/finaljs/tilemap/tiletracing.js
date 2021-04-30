/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.tilemap.TileTracing", ["final.Vec2", "final.tilemap.SimpleTileMap"], function (final, Vec2, SimpleTileMap) {
    /**
     * This is a full tile-based implementation of a contour tracing algoryhtm presented on this site:
     * http://www.gogo-robot.com/2010/02/01/converting-a-tile-map-into-geometry/
     *
     * @param sourceMap
     * @returns {Object}
     * @constructor
     */
    function TileTracing(sourceMap) {
        // Clone map
        var map = sourceMap.clone();

        // Define directions in clockwise order
        var dirs = [
            new Vec2(0, -1), // Up
            new Vec2(1, 0), // Right
            new Vec2(0, 1), // Down
            new Vec2(-1, 0) // Left
        ];
        var dirCount = dirs.length;

        function Tile(x, y) {
            Vec2.call(this, x, y);
            this.direction = 0;
        }

        Tile.extend(Vec2);

        Tile.prototype.toHash = function () {
            return this.x + "x" + this.y;
        };

        // Finds the next solid tile starting from top-left
        var findStart = function () {
            for (var y = 0; y < map.dimension.y; y++) {
                for (var x = 0; x < map.dimension.x; x++) {
                    if (map.isSolid(x, y)) {
                        return new Tile(x, y);
                    }
                }
            }
            return null;
        };

        //        e1
        // v1 |--------| v2
        //    |        |
        // e0 |        | e2
        //    |        |
        // v0 |--------| v3
        //        e3
        function Edge(index, v0, v1, tile) {
            this.index = index;
            this.v0 = v0;
            this.v1 = v1;
            this.tile = tile || null;
        }

        Edge.prototype.toString = function () {
            return this.v0 + ", " + this.v1;
        };

        var Steps = {
            None: 0,
            FindStart: 1,
            GetOpenTile: 2,
            FindNextForward: 3,
            RotateForward: 4,
            TraverseFindStartingEdge: 5,
            TraverseNextEdge: 6,
            Done: 10
        };

        var curStep = Steps.FindStart;
        var openList = [];
        var startTile = null;
        var mainVertices = [];
        var mainEdges = [];
        var shapes = [];

        var curTile = null;
        var nextTile = null;

        /**
         * Creates the 4 vertices for the tile in tile coordinates
         * @param tile
         * @returns {Array}
         */
        function createTileVertices(tile) {
            var verts = [];
            verts.push(new Vec2(tile.x, tile.y + 1));
            verts.push(new Vec2(tile.x, tile.y));
            verts.push(new Vec2(tile.x + 1, tile.y));
            verts.push(new Vec2(tile.x + 1, tile.y + 1));
            return verts;
        }

        function addTileVertices(tile) {
            var i, j;
            var verts = createTileVertices(tile);
            var vertIndices = [];
            for (i = 0; i < verts.length; i++) {
                var index = -1;
                for (j = 0; j < mainVertices.length; j++) {
                    if (mainVertices[j].equals(verts[i])) {
                        index = j;
                        break;
                    }
                }
                if (index == -1) {
                    vertIndices.push(mainVertices.length);
                    mainVertices.push(verts[i]);
                } else {
                    vertIndices.push(index);
                }
            }
            return vertIndices;
        }

        function createTileEdges(indices, tile) {
            var edges = [];
            for (var i = 0; i < indices.length; i++) {
                var e0 = indices[i];
                var e1 = indices[i == indices.length - 1 ? 0 : i + 1];

                // Skip edges which are outside
                if ((i == 0 && tile.x == 0) ||
                    (i == 1 && tile.y == 0) ||
                    (i == 2 && tile.x == (sourceMap.dimension.x - 1)) ||
                    (i == 3 && tile.y == (sourceMap.dimension.y - 1))) {
                    continue;
                }

                edges.push(new Edge(i, e0, e1, tile.toHash()));

            }
            return edges;
        }

        var isTilesShareCommonEdges = function (verts) {
            for (var i = 0; i < verts.length; i++) {
                var n0 = verts[i];
                var n1 = verts[i == verts.length - 1 ? 0 : i + 1];
                for (var j = 0; j < mainEdges.length; j++) {
                    var mEdge = mainEdges[j];
                    var m0 = mainVertices[mEdge.v0];
                    var m1 = mainVertices[mEdge.v1];
                    if (n0.equals(m1) && n1.equals(m0)) {
                        return true;
                    }
                }
            }
            return false;
        };

        var removeOverlapEdges = function (edges) {
            var newEdges = [];
            for (var i = 0; i < edges.length; i++) {
                var edge = edges[i];
                var addIt = true;
                for (var j = 0; j < mainEdges.length; j++) {
                    var mainEdge = mainEdges[j];
                    if (edge.v0 == mainEdge.v1 && edge.v1 == mainEdge.v0) {
                        addIt = false;
                        mainEdges.splice(j, 1);
                        break;
                    }
                }
                if (addIt) {
                    newEdges.push(edge);
                }
            }
            return newEdges;
        };

        function processOpenTile() {
            if (openList.length > 0) {
                // CurrentTile = Tile at the end of the open list
                curTile = openList[openList.length - 1];
                // Set current step to next forward
                curStep = Steps.FindNextForward;
            } else {
                // We are done
                curStep = Steps.FindStart;
            }
        }

        function processRotateForward() {
            // Are not all directions exhausted?
            if (curTile.direction < dirCount - 1) {
                // Increase forward direction
                curTile.direction++;
                // Set current step to find next forward
                curStep = Steps.FindNextForward;
            } else {
                // Remove tile from open list
                openList.pop();
                // No directions left - get next open tile
                curStep = Steps.GetOpenTile;
                // Just jump to the open tile step directly
                processOpenTile();
            }
        }

        var tvStartEdge = null;
        var tvLastEdge = null;
        var tvCurShape = null;

        function processTraverseFindStartingEdge() {
            var i, result;

            // Find next free starting edge - at the start this is always zero
            tvStartEdge = null;
            var startEdgeIndex = -1;
            for (i = 0; i < mainEdges.length; i++) {
                if (mainEdges[i] != null) {
                    startEdgeIndex = i;
                    tvStartEdge = mainEdges[i];
                    break;
                }
            }
            // Continue when we found a starting edge
            result = tvStartEdge != null;

            if (result) {
                // Save start edge as last edge
                tvLastEdge = tvStartEdge;
                // Null starting edge
                mainEdges[startEdgeIndex] = null;
                // Set current step to travel to the next edge
                curStep = Steps.TraverseNextEdge;
                // Create shape vertices and add first two vertices from starting edge into it
                tvCurShape = [];
                tvCurShape.push(mainVertices[tvStartEdge.v0]);
                tvCurShape.push(mainVertices[tvStartEdge.v1]);
                // Add shape to shapes list
                shapes.push(tvCurShape);
            } else {
                // We are completely done
                curStep = Steps.Done;
            }
            return result;
        }

        function clearShapePoints(shape, firstIdx, middleIdx, lastIdx) {
            var last = shape[lastIdx];
            var middle = shape[middleIdx];
            var first = shape[firstIdx];
            var d1 = new Vec2().setFrom(last).sub(middle);
            var d2 = new Vec2().setFrom(middle).sub(first);
            var d = d1.dot(d2);
            if (d > 0) {
                shape.splice(middleIdx, 1);
                return true;
            }
            return false;
        }

        function optimizeShape(shape) {
            if (shape.length > 2) {
                var i = shape.length - 1;
                clearShapePoints(shape, i - 2, i - 1, i);
            }
        }


        function finalizeShape(shape) {
            if (shape.length > 2) {
                clearShapePoints(shape, shape.length - 1, 0, 1);
            }
            if (shape.length > 2) {
                clearShapePoints(shape, 0, shape.length - 1, shape.length - 2);
            }
            // Finally add first vertex to shape list to complete the shape
            shape.push(shape[0]);
        }

        function processTraverseNextEdge() {
            var i;
            for (i = 0; i < mainEdges.length; i++) {
                var curEdge = mainEdges[i];
                if (curEdge != null && curEdge.v0 == tvLastEdge.v1) {
                    // If v0 from current edge equals starting edge - then we are finished
                    if (curEdge.v1 == tvStartEdge.v0) {
                        // Just in case - we clear last edge
                        tvLastEdge = null;
                        // We are done with this shape - Set cur step to find next starting edge
                        curStep = Steps.TraverseFindStartingEdge;
                        // Optimize shape
                        optimizeShape(tvCurShape);
                        // Finalize shape
                        finalizeShape(tvCurShape);
                    } else {
                        // Now our current edge is the last edge
                        tvLastEdge = curEdge;
                        // Add always the first edge vertex to the list
                        tvCurShape.push(mainVertices[curEdge.v1]);
                        // Optimize shape
                        optimizeShape(tvCurShape);
                    }
                    // Null edge
                    mainEdges[i] = null;
                    return true;
                }
            }
            // We are totally done, there is no shape or anything
            // This is a step we will never get into, but to ensure it this two lines of codes are there
            curStep = Steps.Done;
            return false;
        }

        var step = function () {
            var result = true;
            switch (curStep) {
                case Steps.Done:
                    result = false;
                    break;

                case Steps.TraverseNextEdge:
                    result = processTraverseNextEdge();
                    break;

                case Steps.TraverseFindStartingEdge:
                    result = processTraverseFindStartingEdge();
                    break;

                case Steps.FindStart:
                    openList = [];
                    curTile = null;
                    startTile = findStart();
                    if (startTile != null) {
                        // Add the start tile to the open list
                        openList.push(startTile);
                        // Remove the tile from the tile map
                        map.remove(startTile.x, startTile.y);
                        // Create tile vertices for the start tile
                        var startTileIndices = addTileVertices(startTile);
                        // Create tile edges from the indices and add it to the main edge list
                        mainEdges = mainEdges.concat(createTileEdges(startTileIndices, startTile));
                        // Set next step to get open tile
                        curStep = Steps.GetOpenTile;
                        // Just jump to the open tile step directly
                        processOpenTile();
                    } else {
                        // No start found, exit if we have not found any edges at all
                        if (mainEdges.length == 0) {
                            result = false;
                        } else {
                            // Otherwise initialize shapes array
                            shapes = [];
                            // And set next step to traverse find starting edge
                            curStep = Steps.TraverseFindStartingEdge;
                        }
                    }
                    break;
                case Steps.GetOpenTile:
                    processOpenTile();
                    break;
                case Steps.FindNextForward:
                    // Tile in the "forward" direction of the current tile
                    var nx = curTile.x + dirs[curTile.direction].x;
                    var ny = curTile.y + dirs[curTile.direction].y;
                    nextTile = map.isSolid(nx, ny) ? new Tile(nx, ny) : null;

                    // Next tile exists
                    if (nextTile != null) {
                        // Create next tile vertices
                        var nextVerts = createTileVertices(nextTile);
                        // Does next tile shares a common edge with the current shape
                        if (isTilesShareCommonEdges(nextVerts)) {
                            // Add NextTile to the open list
                            openList.push(nextTile);
                            // Remove NextTile from the tile map
                            map.remove(nextTile.x, nextTile.y);
                            // Add NextTile’s vertices to the vertex list
                            var nextTileIndices = addTileVertices(nextTile);
                            // Generate an edge list for NextTile
                            var nextTileEdges = createTileEdges(nextTileIndices, nextTile);
                            // Remove edges that overlap from the main edge list and the edge list for NextTile
                            nextTileEdges = removeOverlapEdges(nextTileEdges);
                            // Add the remaining edges from NextTile to the main edge list
                            mainEdges = mainEdges.concat(nextTileEdges);
                            // Change next step to find next open tile
                            curStep = Steps.GetOpenTile;
                            // Just jump to the open tile step directly
                            processOpenTile();
                        } else {
                            // Rotate to next forward direction
                            curStep = Steps.RotateForward;
                            // Jump directly to rotate forward
                            processRotateForward();
                        }
                    } else {
                        // Rotate to next forward direction
                        curStep = Steps.RotateForward;
                        // Jump directly to rotate forward
                        processRotateForward();
                    }

                    break;
                case Steps.RotateForward:
                    processRotateForward();
                    break;
            }
            return result;
        };

        function run() {
            while (step()) {
            }
        }

        function getShapes() {
            return shapes;
        }

        return {
            run: run,
            getShapes: getShapes
        };

    }

    return TileTracing;
});