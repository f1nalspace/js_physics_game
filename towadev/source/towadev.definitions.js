final.module("towadev.definitions", [], function(){
    var GameProperties = {
        initialMoney: 1,
        waveTimerDuration: 1
    };

    var Tower = {
        id: "",
        name: "",
        weapon: "",
        weaponmods: {
            range: 1,
            rangeFactor: 1,
            cooldownTime: 1,
            cooldownTimeFactor: 1,
            bulletCount: 1,
            bulletCountFactor: 1,
            bulletSpeed: 1,
            bulletSpeedFactor: 1,
            bulletDamage: 1,
            bulletDamageFactor: 1,
            bulletRadius: 1,
            bulletRadiusFactor: 1,
            bulletScatterRange: 1,
            bulletScatterRangeFactor: 1,
            bulletAreaType: 0,
            bulletAreaRadius: 1,
            bulletAreaRadiusFactor: 1,
            bulletAreaDuration: 1,
            bulletAreaDurationFactor: 1,
            bulletAreaEffectType: 0,
            bulletAreaEffectOp: 0,
            bulletAreaEffectDelta: 1,
            bulletAreaEffectDeltaFactor: 1
        },
        cost: 1,
        tier: 1,
        image: ""
    };

    var Weapon = {
        id: "",
        cooldownTime: 1,
        range: 1,
        image: "",
        bulletPosFactor: 1,
        bulletCount: 1,
        bulletScatterRange: 1,
        bulletSpeed: 1,
        bullet: {
            type: 0,
            speed: 1,
            damage: 1,
            damageRanges: {
                min: 1,
                max: 1
            },
            radius: 1,
            "area": {
                "type" : 0,
                "radius": 1,
                "duration": 1,
                "effectType": 1,
                "effectOp": 0,
                "effectDelta": 1
            }
        }
    };

    var Enemy = {
        id: "",
        speed: 1,
        health: 1,
        armor: 1,
        bounty: 1,
        sizeFactor: 1,
        color: "white",
        penalty: 1
    };

    var Wave = {
        count: 1,
        enemy: "",
        enemyMods: {
            speed: null,
            speedFactor: 1,
            health: null,
            healthFactor: 1,
            bounty: null,
            bountyFactor: 1,
            size: null,
            sizeFactor: 1
        },
        interval: 1,
        bonus: 1,
        special: ""
    };

    return {
        GameProperties: GameProperties,
        Tower: Tower,
        Weapon: Weapon,
        Enemy: Enemy,
        Wave: Wave
    }
});

