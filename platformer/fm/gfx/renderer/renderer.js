/**
 * Created by final on 08.01.2014.
 */
fm.ns("fm.gfx.renderer.Renderer");

(function (renderer) {
    /**
     * Renderer interface
     * @param canvas
     * @param doubleBuffer
     * @returns Object
     * @constructor
     */
    renderer.Renderer = function (canvas, doubleBuffer) {
        return {
            getContext: function () {
            },
            clear: function () {
            },
            fillRect: function (x, y, w, h, style) {
            },
            strokeRect: function (x, y, w, h, style, width) {
            },
            push: function () {
            },
            pop: function () {
            },
            translate: function (x, y) {
            },
            scale: function (x, y) {
            },
            rotate: function (rad) {
            },
            setFont: function (font) {
            },
            resetFont: function () {
            },
            /**
             * Renderes a filled text by the given x,y coordinates
             * @param x
             * @param y
             * @param text
             * @param style
             * @param [align]
             * @param [baseline]
             */
            fillText: function (x, y, text, style, align, baseline) {
            },
            /**
             * Creates a texture from the given image resource
             * when needed it will be resized to provided target size
             * @param image
             * @param [targetWidth]
             * @param [targetHeight]
             */
            loadTexture: function (image, targetWidth, targetHeight) {
            },
            /**
             * Draws the given image to target coordinates
             * @param img
             * @param x
             * @param y
             * @param w
             * @param h
             * @param [sx]
             * @param [sy]
             * @param [sw]
             * @param [sh]
             */
            drawTexture: function (img, x, y, w, h, sx, sy, sw, sh) {
            },
            drawLine: function (x0, y0, x1, y1, color, width) {
            },
            flip: function(){
            },
            getTextureData: function(texture){
            },
            createTexture: function(data, w, h) {
            }
        };
    };
})(fm.gfx.renderer);