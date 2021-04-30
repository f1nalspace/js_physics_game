fm.ns("fm.audio.Audio");
fm.req("fm.collections.Hashmap");

/**
 * Audio class that encapsulates playing of audio files
 */
(function (audio, Hashmap) {
    var AudioState = {
        Loaded: 0,
        Playing : 1,
        Stopped : 3
    };

    function AudioInstance(name, source, gain) {
        if (!source.start)
            source.start = source.noteOn;
        if (!source.stop)
            source.stop = source.noteOff;
        this.name = name;
        this.source = source;
        this.gain = gain;
        this.state = AudioState.Loaded;
        this.finishedCallback = null;
    }

    AudioInstance.prototype.update = function() {
        if (this.source.playbackState === this.source.PLAYING_STATE) {
            this.state = AudioState.Playing;
        } else if (this.source.playbackState === this.source.FINISHED_STATE) {
            this.state = AudioState.Stopped;
            if (typeof this.finishedCallback == "function") {
                this.finishedCallback(this);
            }
        }
    };

    AudioInstance.prototype.play = function() {
        this.source.start(0);
        this.state = AudioState.Playing;
    };

    AudioInstance.prototype.stop = function() {
        this.source.stop(0);
        this.state = AudioState.Stopped;
    };

    AudioInstance.prototype.setVolume = function(value) {
        this.gain.gain.value = value * value;
    };

    function Audio() {
        this.clips = new Hashmap();
        this.playing = null;
        this.playlist = null;
        this.masterVolume = 0.5;
    }
    
    Audio.prototype.add = function(name, audio, volume) {
        if (this.clips.contains(name)) {
            throw new Error("Audio manager contains already a sound file by name '"+name+"'!");
        }

        // create a new sound clip and add it to the hashmap
        var clip = {
            context: audio.context,
            buffer: audio.buffer,
            volume: volume || 1.0,
            instances: []
        };
        this.clips.put(name, clip);

        // return new clip
        return clip;
    };

    Audio.prototype.play = function (name) {
        // retrieve clip to play
        var clip = this.clips.get(name);

        // get context
        var ctx = clip.context;

        // Create a buffer source
        var sourceNode = ctx.createBufferSource();
        sourceNode.buffer = clip.buffer;

        // Create a gain node (Volume) and connect it to the source node
        var gainNode = ctx.createGain();
        sourceNode.connect(gainNode);

        // Connect gain node with destination (speakers)
        gainNode.connect(ctx.destination);

        // Create a audio clip and set volume
        var instance = new AudioInstance(name, sourceNode, gainNode);
        instance.setVolume(this.masterVolume * clip.volume);

        // Add sources to clip (We may keep track of it)
        clip.instances.push(instance);

        // let's play
        instance.play();

        return instance;
    };

    // for ambient music
    Audio.prototype.playJukebox = function () {
        var clip;

        // stop currently playing track
        if (this.playing != null) {
            clip = this.clips.get(this.playing);

            // FIXME: assuming music clips only have on instance
            clip.instances[0].stop();
        }

        // get next track
        var next = this.playing;
        if (this.playlist.length > 1) {
        	while (next === this.playing) {
        		next = this.playlist[Math.floor(Math.random() * this.playlist.length)];
        	}
        } else {
        	next = this.playlist[0];
        }

        clip = this.clips.get(next);

        this.playing = next;

        var instance = this.play(this.playing);
        instance.finishedCallback = this.playJukebox.bind(this);
    };

    Audio.prototype.setPlaylist = function (names) {
        this.playlist = names;
    };
    
    Audio.prototype.setMasterVolume = function(vol) {
    	this.masterVolume = vol;

        this.clips.values.forEach(function(clip, key){
            // Update clip volumes
            for (var i = 0; i < clip.instances.length; i++) {
                var instance = clip.instances[i];
                if (instance.state in [AudioState.Loaded, AudioState.Playing]) {
                    instance.setVolume(this.masterVolume * clip.volume);
                }
            }
        });
    };

    Audio.prototype.update = function() {
        this.clips.values.forEach(function(clip, key){
            // Update clip instances
            for (var i = 0; i < clip.instances.length; i++) {
                var instance = clip.instances[i];
                instance.update();
            }

            // Remove instances which are not active any more
            // TODO: May need optimizing - Array filtering is slow!
            clip.instances = clip.instances.filter(function(instance){
                return instance.state !== AudioState.Stopped;
            });
        });
    };

    audio.Audio = Audio;
})(fm.audio, fm.collections.Hashmap);