/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.managers.AudioManager", ["final.collection.Map", "final.audio.AudioEngine"], function (final, Map, AudioEngine) {
    function AudioManager() {
        this.items = new Map();
    }

    AudioManager.prototype.add = function (key, buffer) {
        if (this.items.containsKey(key)) {
            throw new Error("Audio buffer by key '" + key + "' already exists!");
        }
        this.items.put(key, {
            instances: [],
            buffer: buffer,
            repeat: false,
            repeatCount: 0,
            playedCount: 0
        });
    };

    AudioManager.prototype.instanceStopped = function (instance) {
        var item = this.items.get(instance.name);

        // Increase played count
        item.playedCount++;

        // Remove instance
        item.instances.remove(instance);

        if (!item.repeat || (item.repeat && item.repeatCount > 0 && item.playedCount >= item.repeatCount)) {
            final.log("Audio instance '" + instance.name + "' has been stopped (" + item.playedCount + " times played)");
            return true;
        } else {
            final.log("Audio instance '" + instance.name + "' has been stopped (" + item.playedCount + " times played) - restart it (Repeat)");
            this.play(instance.name, instance.vol, item.repeat, item.repeatCount);
            return false;
        }
    };

    AudioManager.prototype.has = function (key) {
        return this.items.containsKey(key);
    };

    AudioManager.prototype.play = function (key, volume, repeat, repeatCount) {
        if (!this.items.containsKey(key)) {
            throw new Error("Audio buffer by key '" + key + "' does not exists!");
        }
        var item = this.items.get(key);
        if (item.instances.length > 0 && repeat) {
            throw new Error("Cannot play audio instance '" + key + "' in repeat mode cause its already started!");
        }
        if (repeat) {
            item.repeat = true;
            item.repeatCount = repeatCount || 0;
            item.playedCount = 0;
        }
        var instance = AudioEngine.createInstance(key, item.buffer, volume || 1);
        item.instances.push(instance);
        instance.play();
    };

    return AudioManager;
});