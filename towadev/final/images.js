final.module("final.images", ["final.renderer"], function (final, renderer) {
    /**
     * Creates a 1-D Tileset image array from the given image
     * @param initialRenderer {Renderer}
     * @param image {Image}
     * @param tileW {Number}
     * @param tileH {Number}
     */
    var createTileset = function (initialRenderer, image, tileW, tileH) {
        var out = [];
        if (image !== undefined && image != null && tileW !== undefined && tileH !== undefined) {
            var maxW = Math.floor(image.width / tileW);
            var maxH = Math.floor(image.height / tileH);
            var idx = 0;
            for (var y = 0; y < maxH; y++) {
                for (var x = 0; x < maxW; x++) {
                    out[idx++] = initialRenderer.renderToCanvas(tileW, tileH, function (r) {
                        var ix = x * tileW;
                        var iy = y * tileH;
                        r.drawImage(image, 0, 0, tileW, tileH, ix, iy, tileW, tileH);
                    });
                }
            }
        }
        return out;
    };

    var calculateTargetRect = function (imgW, imgH, minX, minY, maxW, maxH, outPos, outSize) {
        if (imgW > 0 && imgH > 0 && maxW > 0 && maxH > 0) {
            var xf = maxW / imgW;
            var yf = maxH / imgH;
            var scaleFactor = Math.min(xf, yf);
            outSize.x = imgW * scaleFactor;
            outSize.y = imgH * scaleFactor;
            outPos.x = minX + (maxW * 0.5 - outSize.x * 0.5);
            outPos.y = minY + (maxH * 0.5 - outSize.y * 0.5);
            return true;
        }
        return false;
    };

    var resizeImage = function (initialRenderer, img, scale) {
        var widthScaled = img.width * scale;
        var heightScaled = img.height * scale;

        var orig = document.createElement('canvas');
        orig.width = img.width;
        orig.height = img.height;
        var origCtx = orig.getContext('2d');
        origCtx.drawImage(img, 0, 0);
        var origPixels = origCtx.getImageData(0, 0, img.width, img.height);

        var scaled = document.createElement('canvas');
        scaled.width = widthScaled;
        scaled.height = heightScaled;
        var scaledCtx = scaled.getContext('2d');
        var scaledPixels = scaledCtx.getImageData( 0, 0, widthScaled, heightScaled );

        for( var y = 0; y < heightScaled; y++ ) {
            for( var x = 0; x < widthScaled; x++ ) {
                var index = (Math.floor(y / scale) * img.width + Math.floor(x / scale)) * 4;
                var indexScaled = (y * widthScaled + x) * 4;
                scaledPixels.data[ indexScaled ] = origPixels.data[ index ];
                scaledPixels.data[ indexScaled+1 ] = origPixels.data[ index+1 ];
                scaledPixels.data[ indexScaled+2 ] = origPixels.data[ index+2 ];
                scaledPixels.data[ indexScaled+3 ] = origPixels.data[ index+3 ];
            }
        }
        scaledCtx.putImageData( scaledPixels, 0, 0 );
        return scaled;
    };

    return {
        createTileset: createTileset,
        calculateTargetRect: calculateTargetRect,
        resizeImage: resizeImage
    };
});