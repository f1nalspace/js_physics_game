final.module("final.console", ["final.utils"], function (final, utils) {
    var Hashmap = utils.HashMap;

    var defaultConsoleFont = {
        name: "Courier",
        size: 0.4,
        style: "normal"
    };

    function Console(game) {
        this.game = game;
        this.active = false;
        this.buffer = "";
        this.lines = [];
        this.lineCount = 0;
        this.cursor = true;
        this.cursorTimer = 0;
        this.cursorOffset = 0;
        this.history = [];
        this.historyCount = 0;
        this.historyIndex = -1;
        this.commands = new Hashmap();
        var that = this;

        // TODO: Support pos1 and end key!
        // TODO: Support page up/down

        game.canvas.addEventListener("keypress", function (ev) {
            if (that.active) {
                that.keyPressed(ev);
            }
        }, false);

        game.canvas.addEventListener("keyup", function (ev) {
            var key = ev.keyCode ? ev.keyCode : ev.which;
            if (key == final.game.Keys.Enter) {
                if (that.active) {
                    var s = "" + that.buffer;
                    that.buffer = "";
                    that.addLine(s);
                    ev.preventDefault();
                }
            } else if (key == 220 || key == 54 || key == 192 || key == 160) {
                that.active = !that.active;
                that.historyIndex = that.historyCount;
                ev.preventDefault();
            }
        }, false);

        game.canvas.addEventListener("keydown", function (ev) {
            if (that.active) {
                var key = ev.keyCode ? ev.keyCode : ev.which;
                if (key == final.game.Keys.Backspace) {
                    that.removeChar();
                    ev.preventDefault();
                } else if (key == final.game.Keys.Delete) {
                    that.deleteChar();
                    ev.preventDefault();
                } else if (key == final.game.Keys.Left) {
                    that.moveCursor(-1);
                    ev.preventDefault();
                } else if (key == final.game.Keys.Right) {
                    that.moveCursor(1);
                    ev.preventDefault();
                } else if (key == final.game.Keys.Up) {
                    that.switchHistory(-1);
                    ev.preventDefault();
                } else if (key == final.game.Keys.Down) {
                    that.switchHistory(1);
                    ev.preventDefault();
                }
            }
        }, false);
    }

    Console.prototype.keyPressed = function (ev) {
        var key = ev.keyCode ? ev.keyCode : ev.which;
        if (key != final.game.Keys.Enter) {
            this.buffer = this.buffer.insert(this.cursorOffset, String.fromCharCode(key));
            this.moveCursor(1);
        }
    };

    Console.prototype.addCommand = function (name, func) {
        if (this.commands.contains(name)) {
            throw new Error("Console command '" + name + "' is already assigned!");
        }
        this.commands.put(name, func);
    };

    Console.prototype.addLine = function (line, noexec) {
        this.lines[this.lineCount] = line;
        this.lineCount++;
        this.cursorOffset = 0;
        if (line.length > 0 && !noexec) {
            this.history[this.historyCount++] = line;
            this.historyIndex = this.historyCount;
            this.execute(line);
        }
    };

    Console.prototype.clear = function () {
        this.lineCount = 0;
    };

    Console.prototype.execute = function (command) {
        var s = command.split(/[\s,]+/);
        if (s.length > 0) {
            var cmd = s[0];
            var args = s.length > 1 ? s.splice(1) : [];
            var func = this.commands.get(cmd);
            if (func !== undefined) {
                func(cmd, args, this);
            } else {
                this.addLine("Invalid command: " + cmd, true);
            }
        }
    };

    Console.prototype.deleteChar = function () {
        this.buffer = this.buffer.replaceAt(this.cursorOffset);
        this.cursorOffset = Math.max(0, Math.min(this.buffer.length, this.cursorOffset));
    };

    Console.prototype.moveCursor = function (value) {
        this.cursorOffset += value;
        this.cursorOffset = Math.max(0, Math.min(this.buffer.length, this.cursorOffset));
    };

    Console.prototype.removeChar = function () {
        if (this.buffer.length > 0) {
            this.buffer = this.buffer.replaceAt(this.cursorOffset - 1);
            this.moveCursor(-1);
        }
    };

    Console.prototype.switchHistory = function (v) {
        this.historyIndex += v;
        if (this.historyIndex >= 0 && this.historyIndex < this.historyCount) {
            this.buffer = this.history[this.historyIndex];
            this.cursorOffset = this.buffer.length;
        } else {
            if (this.historyIndex < 0) {
                this.historyIndex = -1;
            } else if (this.historyIndex > this.historyCount - 1) {
                this.historyIndex = this.historyCount;
            }
            this.buffer = "";
            this.cursorOffset = 0;
        }
    };

    Console.prototype.update = function (dt) {
        if (this.active) {
            this.cursorTimer += dt;
            if (this.cursorTimer > 350) {
                this.cursorTimer = 0;
                this.cursor = !this.cursor;
            }
        }
    };

    Console.prototype.draw = function (r) {
        if (this.active) {
            var w = this.game.displayDimension.x;
            var h = this.game.displayDimension.y;
            var ch = h * 0.25;
            var fh = defaultConsoleFont.size;
            var maxLines = Math.floor(ch / fh);

            r.applyAlpha(0.5);
            r.fillRect(0, 0, w, ch, "black");
            r.resetAlpha();

            r.applyFont(defaultConsoleFont);

            var cursorWidth = defaultConsoleFont.size * 0.65;

            // Draw lines
            var i;
            var l = this.lineCount - 1;
            var lp = ch - fh * 2;
            for (i = 0; i < maxLines; i++) {
                if (l >= 0 && l < this.lineCount) {
                    r.fillText(0, lp, this.lines[l], "white");
                }
                lp -= fh;
                l--;
            }

            // Draw input buffer
            lp = ch - fh;
            var cp = 0;
            for (i = 0; i < this.buffer.length; i++) {
                r.fillText(cp, lp, "" + this.buffer[i], "white");
                cp += cursorWidth;
            }

            // Draw cursor
            cp = this.cursorOffset * cursorWidth;
            if (this.cursor) {
                r.fillRect(cp, ch - fh, cursorWidth, fh, "white");
            } else {
                r.fillRect(cp, ch - 2, cursorWidth, 2, "white");
            }

            r.resetFont();
        }
    };

    return {
        Console: Console
    }
});

