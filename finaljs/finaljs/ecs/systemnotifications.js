/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.ecs.SystemNotifications",
    [
    ],
    function (final) {
        return {
            None: 0,
            AddedEntity: 1,
            RemovedEntity: 2,
            ClearedEntities: 3
        };
    }
);