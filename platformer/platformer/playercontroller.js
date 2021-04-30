/**
 * Created by tspaete on 16.01.14.
 */
fm.ns("fm.app.platformer.PlayerController");

(function(platformer, game){
    function PlayerController(game, player) {
        this.game = game;
        this.player = player;
        this.jumped = false;
    }

    PlayerController.prototype.update = function(dt) {
        var g = this.game;
        var p = this.player;

        p.vel[0] = 0;
        if (g.isKeyDown(game.Keys.Left)) {
            p.vel[0] += -100;
            p.dir[0] = -1;
        } else if (g.isKeyDown(game.Keys.Right)) {
            p.vel[0] += 100;
            p.dir[0] = 1;
        }
        if (g.isKeyDown(game.Keys.Up)) {
            if (p.canJump()) {
                g.audio.play("sfx:jump");
                p.jump();
            }
        }
    };

    platformer.PlayerController = PlayerController;
})(fm.app.platformer, fm.game);