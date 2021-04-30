final.module("final.ui.carousel", ["final.ui", "final.ui.button", "final.vec", "final.shim"], function (final, ui, button, vec, shim) {
    var UIControl = ui.UIControl,
        UIState = ui.UIState,
        Button = button.Button,
        Vec2 = vec.Vec2;

    function CarouselButton(game, pos, size) {
        Button.call(this, game, pos, size);
    }
    CarouselButton.extend(Button);

    CarouselButton.prototype.draw = function(r, p, s) {
        r.applyShadows(0.2, 0, 0, "white");
        r.strokeRect(p.x, p.y, s.x, s.y, "rgba(255,255,255,0.75)", 0.05);
        r.resetShadows();
    };

    /**
     *
     * @param game {Game}
     * @param pos {Vec2}
     * @param size {Vec2}
     * @param itemSize {Vec2}
     * @param itemPadding {Vec2}
     * @param buttonSize {Vec2}
     * @constructor
     */
    function Carousel(game, pos, size, itemSize, itemPadding, buttonSize) {
        UIControl.call(this, game, pos, size);
        this.items = [];
        this.images = [];
        this.captions = [];
        this.selectedIndex = -1;
        this.itemSize = itemSize;
        this.itemMargin = new Vec2(0, 0);
        this.itemPadding = itemPadding;
        this.captionPos = new Vec2(0, 0.75);
        this.itemClick = function(self, item){};
        this.changed = function(self, item){};

        var that = this;

        var buttonLeft = new Button(game, new Vec2(0, size.y * 0.5 - buttonSize.y * 0.5), new Vec2(buttonSize.x, buttonSize.y));
        buttonLeft.hint = "Prev";
        buttonLeft.click = function() {
            if (that.items.length > 1) {
                that.selectedIndex--;
                if (that.selectedIndex < 0) {
                    that.selectedIndex = that.items.length-1;
                }
                that.changed(that, that.items[that.selectedIndex]);
            }
        };
        this.buttonLeft = buttonLeft;
        this.addChild(buttonLeft);

        var buttonRight = new Button(game, new Vec2(this.size.x - buttonSize.x, size.y * 0.5 - buttonSize.y * 0.5), new Vec2(buttonSize.x, buttonSize.y));
        buttonRight.hint = "Next";
        buttonRight.click = function() {
            if (that.items.length > 1) {
                that.selectedIndex++;
                if (that.selectedIndex > that.items.length-1) {
                    that.selectedIndex = 0;
                }
                that.changed(that, that.items[that.selectedIndex]);
            }
        };
        this.buttonRight = buttonRight;
        this.addChild(buttonRight);

        var buttonCenter = new CarouselButton(game, new Vec2((this.size.x * 0.5) - (this.itemSize.x * 0.5), (this.size.y * 0.5) - (this.itemSize.y * 0.5)), new Vec2(this.itemSize.x, this.itemSize.y));
        buttonCenter.click = function() {
            if (that.items.length > 0) {
                that.itemClick(that, that.items[that.selectedIndex]);
            }
        };
        this.buttonCenter = buttonCenter;
        this.addChild(buttonCenter);
    }
    Carousel.extend(UIControl);

    Carousel.prototype.addItem = function(item, image, caption) {
        this.items.push(item);
        this.images.push(image || null);
        this.captions.push(caption || null);
    };

    Carousel.prototype.update = function(dt, p, s) {
        var r = UIControl.prototype.update.call(this, dt, p, s);
        if (this.selectedIndex == -1 && this.items.length > 0) {
            this.selectedIndex = 0;
        }
        return r;
    };

    Carousel.prototype.drawBackground = function(r, p, s) {
        r.fillRect(p.x, p.y, s.x, s.y, "rgba(0,255,0,0.25)", 2);
    };

    Carousel.prototype.drawItem = function(r, p, s, index) {
        var itemImage = this.images[index];
        var itemCaption = this.captions[index];
        if (itemImage !== undefined && itemImage != null) {
            r.drawImage(itemImage, p.x, p.y, s.x, s.y);
        } else {
            r.fillRect(p.x, p.y, s.x, s.y, "brown");
        }
    };

    Carousel.prototype.drawCaption = function(r, p, s, caption) {
        if (caption !== undefined && caption != null) {
            r.applyFont(this.font, "center", "middle");
            r.fillText(p.x + s.x * 0.5 + this.captionPos.x * s.x, p.y + s.y * 0.5 + this.captionPos.y * s.y, caption, "yellow");
            r.resetFont();
        }
    };

    Carousel.prototype.drawCarousel = function(r, p, s) {
        r.push();
        r.clipRect(p.x, p.y, s.x, s.y);
        var itemPos = new Vec2();
        var itemSize = new Vec2(this.itemSize.x - this.itemPadding.x * 2, this.itemSize.y - this.itemPadding.y * 2);
        if (this.items.length > 1 && this.selectedIndex != -1) {
            // Calculate the total visible count of the carousel + 2 for transitions
            var maxCount = Math.ceil(this.size.x / this.itemSize.x) + 2;

            // Calculate side count by removing the center and divide by 2
            var sideCount = Math.round((maxCount-1) / 2);

            // Calculate starting index
            var i;
            var idx = this.selectedIndex;
            for (i = 0; i < sideCount; i++) {
                idx--;
                if (idx < 0) idx = this.items.length-1;
            }

            // Calculate starting position
            var posx = p.x + (s.x * 0.5) - (this.itemSize.x * 0.5);
            for (i = 0; i < sideCount; i++) {
                posx -= this.itemMargin.x + this.itemSize.x + this.itemMargin.x;
            }

            var posy = p.y + (s.y * 0.5) - (this.itemSize.y * 0.5);
            for (i = 0; i < maxCount; i++) {
                itemPos.x = posx + this.itemPadding.x;
                itemPos.y = posy + this.itemPadding.y;
                this.drawItem(r, itemPos, itemSize, idx);
                posx += this.itemSize.x + this.itemMargin.x * 2;
                idx++;
                if (idx > this.items.length-1) {
                    idx = 0;
                }
            }
        }
        r.pop();
    };

    Carousel.prototype.draw = function(r, p, s) {
        this.drawBackground(r, p, s);
        this.drawCarousel(r, p, s);
        this.drawCaption(r, p, s, (this.captions.length > 1 && this.selectedIndex != -1) ? this.captions[this.selectedIndex] : null);
    };

    return {
        CarouselButton: CarouselButton,
        Carousel: Carousel
    }
});