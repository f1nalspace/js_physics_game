fm.ns('fm.app.platformer.resources');

fm.app.platformer.resources = {
    dependencies: {
        map: "tileset"
    },
    items: [
        {
            file: "content/tilesets/common.json",
            name: "tileset:common",
            category: "tileset"
        },
        {
            file: "content/tilesets/other.json",
            name: "tileset:other",
            category: "tileset"
        },
        {
            file: "content/music/ambient-00.sound",
            name: "music:ambient-00",
            category: "audio",
            volume: 0.75
        },
        {
            file: "content/sfx/jump.sound",
            name: "sfx:jump",
            category: "audio"
        },
        {
            file: "content/sprites/player.png",
            name: "spritesheet:player",
            category: "texture",
            width: 16,
            height: 32
        },
        {
            file: "content/maps/map-00.json",
            name: "map:00",
            category: "map",
            tileObjectMappings: [
                {
                    tileset: "tileset:other",
                    mappings: [
                        0, "PlayerSpawn",
                        1, "Diamond",
                        2, "Diamond",
                        3, "Diamond",
                        4, "Jumppad",
                        5, "Box"
                    ]
                }
            ]
        }
    ]
};