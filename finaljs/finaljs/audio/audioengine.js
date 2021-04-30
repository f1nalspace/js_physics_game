/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.audio.AudioEngine", [], function (final) {
    var AudioState = {
        Loaded: 0,
        Playing: 1,
        Stopped: 3
    };

    function AudioInstance(name, source, gain, vol) {
        if (!source.start)
            source.start = source.noteOn;
        if (!source.stop)
            source.stop = source.noteOff;
        this.name = name;
        this.source = source;
        this.gain = gain;
        this.state = AudioState.Loaded;
        this.vol = vol || 1;
        this.handled = false;
    }

    AudioInstance.prototype.update = function () {
        if (this.source.playbackState === this.source.PLAYING_STATE) {
            this.state = AudioState.Playing;
        } else if (this.source.playbackState === this.source.FINISHED_STATE) {
            this.state = AudioState.Stopped;
        }
    };

    AudioInstance.prototype.play = function () {
        this.handled = false;
        this.source.start(0);
        this.state = AudioState.Playing;
    };

    AudioInstance.prototype.stop = function () {
        this.handled = false;
        this.source.stop(0);
        this.state = AudioState.Stopped;
    };

    AudioInstance.prototype.updateVolume = function (masterVolume) {
        var v = masterVolume * this.vol;
        this.gain.gain.value = v * v;
    };

    function AudioEngine() {
        this.context = new window.AudioContext();
        this.masterVolume = 0.5;
        this.instances = [];
        this.instanceStopped = function (instance) {
            return true;
        };
    }

    AudioEngine.prototype.decodeData = function (xhr, success, failed) {
        this.context.decodeAudioData(xhr.response, success, failed);
    };

    AudioEngine.prototype.createInstance = function (name, buffer, volume) {
        // get context
        var ctx = this.context;

        // Create a buffer source
        var sourceNode = ctx.createBufferSource();
        sourceNode.buffer = buffer;

        // Create a gain node (Volume) and connect it to the source node
        var gainNode = ctx.createGain();
        sourceNode.connect(gainNode);

        // Connect gain node with destination (speakers)
        gainNode.connect(ctx.destination);

        // Create a audio clip and set volume
        var instance = new AudioInstance(name, sourceNode, gainNode, volume);
        instance.updateVolume(this.masterVolume);

        // Add instance to list
        this.instances.push(instance);

        // Return it
        return instance;
    };

    AudioEngine.prototype.setMasterVolume = function (vol) {
        this.masterVolume = vol;

        // Update instance volumes
        for (var i = this.instances.length - 1; i >= 0; i--) {
            var instance = this.instances[i];
            if (instance.state in [AudioState.Loaded, AudioState.Playing]) {
                instance.updateVolume(this.masterVolume);
            }
        }
    };

    AudioEngine.prototype.update = function () {
        for (var i = this.instances.length - 1; i >= 0; i--) {
            var instance = this.instances[i];

            // Update clip instance
            instance.update();

            // Remove instance when inactive
            if (instance.state == AudioState.Stopped && !instance.handled) {
                // Call stopped callback, when return of callback is true, remove instance
                // otherwise make sure that this instance is touched - outside stuff needs to do something with this instance
                if (this.instanceStopped(instance)) {
                    this.instances.splice(i, 1);
                } else {
                    instance.handled = true;
                }
            }
        }
    };

    return new AudioEngine();
});