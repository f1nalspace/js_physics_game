final.module("final.engine", ["final.game", "final.utils"], function(final, game, utils){
    var Game = game.Game;

    function Engine(canvasId) {
        Game.call(this, canvasId);
        this.entities = new utils.ArrayList();
    }
    Engine.extends(Game);

    return {
        Engine: Engine
    };
});