/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.utils.ImageUtils", function(final) {
    return {
        calculateTargetRect: function (imgW, imgH, minX, minY, maxW, maxH, outPos, outSize) {
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
        }
    };
});