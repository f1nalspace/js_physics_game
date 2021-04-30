/**
 * Created by final on 08.01.2014.
 */
fm.ns("fm.gfx.renderer.RendererFactory");
fm.req("fm.gfx.renderer.Canvas2DRenderer");

/**
 * Renderer factory
 */
(function (renderer) {
    /**
     * Creates a new renderer - based on platform/supports these can be a canvas2d or a webgl
     * @param canvas
     * @param doubleBuffer
     * @returns {fm.gfx.renderer.Canvas2DRenderer}
     */
    var create = function(canvas, doubleBuffer) {
        // TODO: For now we have only one renderer (canvas 2d - we may have later on a webgl renderer)
        return new renderer.Canvas2DRenderer(canvas, doubleBuffer);
    };
    renderer.RendererFactory = {
        create: create
    };
})(fm.gfx.renderer);