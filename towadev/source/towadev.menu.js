final.module("final.towadev.menu", ["final.vec", "final.vec2math", "final.ui", "final.ui.button", "final.ui.label", "final.ui.checkbox", "final.ui.radiobutton"], function(final, vec, vec2math, ui, button, label, checkbox, radiobutton){
    var Vec2 = vec.Vec2,
        UIManager = ui.UIManager,
        Button = button.Button,
        Label = label.Label,
        CheckBox = checkbox.CheckBox,
        RadioButton = radiobutton.RadioButton,
        RadioGroup = radiobutton.RadioGroup;

    var MenuState = {
        None: 0,
        MainMenu: 1,
        OptionsMenu: 2
    };

    var defaultTitleFont = {
        name: "Arial",
        size: 3,
        style: "normal",
        width: 0.025
    };
    var defaultTitleMediumFont = {
        name: "Arial",
        size: 1.85,
        style: "normal",
        width: 0.025
    };
    var defaultTitleSmallFont = {
        name: "Arial",
        size: 1.5,
        style: "normal"
    };
    var defaultSmallFont = {
        name: "Arial",
        size: 0.35,
        style: "normal"
    };
    var defaultMediumFont = {
        name: "Arial",
        size: 0.55,
        style: "normal"
    };
    var defaultMenuTitleFont = {
        name: "Arial",
        size: 1.25,
        style: "normal",
        width: 0.025
    };

    var buttonSize = new Vec2(5, 1.5);
    var buttonFontSize = 0.55;

    var buttonSmallSize = new Vec2(3, 1);
    var buttonSmallFontSize = 0.35;

    var areaPadding = 1;

    function Menu(game) {
        this.game = game;
        this.uiMng = new UIManager(this.game);
        this.state = MenuState.MainMenu;

        this.stateComponents = {};
        this.stateComponents[MenuState.MainMenu] = [];
        this.stateComponents[MenuState.OptionsMenu] = [];
    }

    Menu.prototype.init = function(r) {
        var displayDim = this.game.displayDimension;
        var that = this;

        var touwaX = displayDim.x * 0.5 - displayDim.x * 0.175,
            touwaY = displayDim.y * 0.225,
            defuX = displayDim.x * 0.5 + displayDim.x * 0.175,
            defuY = displayDim.y * 0.35,
            kanaOffsetY = defaultTitleFont.size * 0.4;

        var mainMenuComponents = this.stateComponents[MenuState.MainMenu];
        var optionsMenuComponents = this.stateComponents[MenuState.OptionsMenu];

        if (this.game.isTouchDevice) {
            var touchDeviceInfo = new Label(this.game, new Vec2(displayDim.x, 0), "Touch-Device detected");
            touchDeviceInfo.font = defaultSmallFont;
            touchDeviceInfo.setAlign("right", "top");

            mainMenuComponents.push(touchDeviceInfo);
            optionsMenuComponents.push(touchDeviceInfo);
        }

        {
            var versionLabel = new Label(this.game, new Vec2(areaPadding, displayDim.y - 0.25), "Version: " + this.game.version);
            versionLabel.font = defaultSmallFont;
            versionLabel.setAlign("left", "bottom");
            var copyrightLabel = new Label(this.game, new Vec2(displayDim.x - areaPadding, displayDim.y - 0.25), "© 2015 Torsten Späte");
            copyrightLabel.font = defaultSmallFont;
            copyrightLabel.setAlign("right", "bottom");

            mainMenuComponents.push(versionLabel);
            mainMenuComponents.push(copyrightLabel);
            optionsMenuComponents.push(versionLabel);
            optionsMenuComponents.push(copyrightLabel);
        }

        // MainMenu
        {
            var touwaLabelBig = new Label(this.game, new Vec2(touwaX, touwaY), "トウワ");
            touwaLabelBig.font = defaultTitleFont;
            touwaLabelBig.setAlign("center", "middle");
            touwaLabelBig.setFill("white", "yellow", 0.6);
            touwaLabelBig.setStroke("grey", null, 0, defaultTitleFont.width);

            var defuLabelBig = new Label(this.game, new Vec2(defuX, defuY), "デフ");
            defuLabelBig.font = defaultTitleFont;
            defuLabelBig.setAlign("center", "middle");
            defuLabelBig.setFill("yellow", "white", 0.6);
            defuLabelBig.setStroke("grey", null, 0, defaultTitleFont.width);

            var touwaLabelSmall = new Label(this.game, new Vec2(touwaX, touwaY + kanaOffsetY), "To-u-wa");
            touwaLabelSmall.font = defaultTitleSmallFont;
            touwaLabelSmall.setAlign("center", "top");
            touwaLabelSmall.setFill("white", null, 0.75);
            touwaLabelSmall.setStroke(null, null, defaultTitleFont.width);

            var defuLabelSmall = new Label(this.game, new Vec2(defuX, defuY + kanaOffsetY), "De-fu");
            defuLabelSmall.font = defaultTitleSmallFont;
            defuLabelSmall.setAlign("center", "top");
            defuLabelSmall.setFill("white", null, 0.75);
            defuLabelSmall.setStroke(null, null, defaultTitleFont.width);
            mainMenuComponents.push(touwaLabelBig);
            mainMenuComponents.push(defuLabelBig);
            mainMenuComponents.push(touwaLabelSmall);
            mainMenuComponents.push(defuLabelSmall);

            var mainButtonsY = displayDim.y - buttonSize.y - areaPadding;
            var playButton = new Button(this.game, new Vec2(areaPadding, mainButtonsY), buttonSize, "Play");
            playButton.font.size = buttonFontSize;
            playButton.init(r);
            playButton.click = function (self) {
                that.game.playGame();
            };

            var optionsButton = new Button(this.game, new Vec2(areaPadding + ((displayDim.x - areaPadding * 2) - buttonSize.x) * 0.5, mainButtonsY), buttonSize, "Options");
            optionsButton.font.size = buttonFontSize;
            optionsButton.init(r);
            optionsButton.click = function (self) {
                that.state = MenuState.OptionsMenu;
                that.uiMng.setComponents(optionsMenuComponents);
            };

            var closeButton = new Button(this.game, new Vec2(displayDim.x - areaPadding - buttonSize.x, mainButtonsY), buttonSize, "Exit");
            closeButton.font.size = buttonFontSize;
            closeButton.init(r);
            closeButton.click = function (self) {
                that.game.exitGame();
            };
            mainMenuComponents.push(playButton);
            mainMenuComponents.push(optionsButton);
            mainMenuComponents.push(closeButton);
        }

        // Options
        {
            var subMenuTitleY = areaPadding + defaultTitleMediumFont.size * 0.5;

            var touwaLabelMedium = new Label(this.game, new Vec2(areaPadding - defaultTitleMediumFont.size * 0.25, subMenuTitleY), "トウワ");
            touwaLabelMedium.font = defaultTitleMediumFont;
            touwaLabelMedium.setAlign("left", "middle");
            touwaLabelMedium.setFill("white", "yellow", 0.6);
            touwaLabelMedium.setStroke("grey", null, 0, defaultTitleFont.width);

            var defuLabelMedium = new Label(this.game, new Vec2(6.5, subMenuTitleY), "デフ");
            defuLabelMedium.font = defaultTitleMediumFont;
            defuLabelMedium.setAlign("left", "middle");
            defuLabelMedium.setFill("white", "yellow", 0.6);
            defuLabelMedium.setStroke("grey", null, 0, defaultTitleFont.width);

            var touwaLabelVerySmall = new Label(this.game, new Vec2(2.5, subMenuTitleY + defaultTitleMediumFont.size * 0.35), "To-u-wa");
            touwaLabelVerySmall.font = defaultSmallFont;
            touwaLabelVerySmall.setAlign("left", "top");
            touwaLabelVerySmall.setFill("white", null, 0.6);
            touwaLabelVerySmall.setStroke(null, null, 0, defaultTitleFont.width);

            var defuLabelVerySmall = new Label(this.game, new Vec2(8, subMenuTitleY + defaultTitleMediumFont.size * 0.35), "De-fu");
            defuLabelVerySmall.font = defaultSmallFont;
            defuLabelVerySmall.setAlign("left", "top");
            defuLabelVerySmall.setFill("white", null, 0.6);
            defuLabelVerySmall.setStroke(null, null, 0, defaultTitleFont.width);

            var optionsLabel = new Label(this.game, new Vec2(displayDim.x - areaPadding, areaPadding + 0.25), "Options");
            optionsLabel.font = defaultMenuTitleFont;
            optionsLabel.setAlign("right", "top");
            optionsLabel.setFill("white", "yellow", 0.6);
            optionsLabel.setStroke("grey", null, 0.2, defaultTitleFont.width);

            var backButton = new Button(this.game, new Vec2(areaPadding, displayDim.y - areaPadding - buttonSize.y), buttonSize, "Back");
            backButton.font.size = buttonFontSize;
            backButton.init(r);
            backButton.click = function (self) {
                that.state = MenuState.MainMenu;
                that.uiMng.setComponents(mainMenuComponents);
            };

            var checkboxPadding = [0.1, 0.1, 0.25];

            var autoPauseCheckbox = new CheckBox(this.game, new Vec2(areaPadding, 5), new Vec2(0.75, 0.75), "Auto pause", checkboxPadding[0], checkboxPadding[1], checkboxPadding[2]);
            autoPauseCheckbox.click = function(self) {
                that.game.autoPause = self.checked;
            };
            autoPauseCheckbox.font = defaultMediumFont;
            autoPauseCheckbox.checked = this.game.autoPause;

            var changeDetailFunc = function(game, res){
                game.canvas.width = res.x;
                game.canvas.height = res.y;
                game.resizeAndPositionDisplay();
                game.resizeDimension(game.canvas.width, game.canvas.height);
                game.loadResources(r);
            };

            var lowRes = new Vec2(640, 360);
            var mediumRes = new Vec2(960, 540);
            var highRes = new Vec2(1280, 720);
            var ultraRes = new Vec2(1920, 1080);
            var insaneRes = new Vec2(3840, 2160);

            var detailRadioGroup = new RadioGroup(this.game, new Vec2(areaPadding, 6.25), new Vec2());
            var detailLowRadioButton = new RadioButton(this.game, new Vec2(0, 0), new Vec2(0.75, 0.75), lowRes.y + "p", checkboxPadding[0], checkboxPadding[1], checkboxPadding[2]);
            detailLowRadioButton.click = function(){changeDetailFunc(that.game, lowRes)};
            detailLowRadioButton.font = defaultMediumFont;
            detailLowRadioButton.checked = vec2math.equals(that.game.displaySize, lowRes);
            detailRadioGroup.addChild(detailLowRadioButton);
            var detailMediumRadioButton = new RadioButton(this.game, new Vec2(3, 0), new Vec2(0.75, 0.75), mediumRes.y + "p", checkboxPadding[0], checkboxPadding[1], checkboxPadding[2]);
            detailMediumRadioButton.click = function(){changeDetailFunc(that.game, mediumRes)};
            detailMediumRadioButton.font = defaultMediumFont;
            detailMediumRadioButton.checked = vec2math.equals(that.game.displaySize, mediumRes);
            detailRadioGroup.addChild(detailMediumRadioButton);
            var detailHighRadioButton = new RadioButton(this.game, new Vec2(6, 0), new Vec2(0.75, 0.75), highRes.y + "p", checkboxPadding[0], checkboxPadding[1], checkboxPadding[2]);
            detailHighRadioButton.click = function(){changeDetailFunc(that.game, highRes)};
            detailHighRadioButton.font = defaultMediumFont;
            detailHighRadioButton.checked = vec2math.equals(that.game.displaySize, highRes);
            detailRadioGroup.addChild(detailHighRadioButton);
            var detailUltraRadioButton = new RadioButton(this.game, new Vec2(9, 0), new Vec2(0.75, 0.75), ultraRes.y + "p", checkboxPadding[0], checkboxPadding[1], checkboxPadding[2]);
            detailUltraRadioButton.click = function(){changeDetailFunc(that.game, ultraRes)};
            detailUltraRadioButton.font = defaultMediumFont;
            detailUltraRadioButton.checked = vec2math.equals(that.game.displaySize, ultraRes);
            detailRadioGroup.addChild(detailUltraRadioButton);
            var detailInsaneRadioButton = new RadioButton(this.game, new Vec2(12, 0), new Vec2(0.75, 0.75), insaneRes.y + "p", checkboxPadding[0], checkboxPadding[1], checkboxPadding[2]);
            detailInsaneRadioButton.click = function(){changeDetailFunc(that.game, insaneRes)};
            detailInsaneRadioButton.font = defaultMediumFont;
            detailInsaneRadioButton.checked = vec2math.equals(that.game.displaySize, insaneRes);
            detailRadioGroup.addChild(detailInsaneRadioButton);

            optionsMenuComponents.push(touwaLabelMedium);
            optionsMenuComponents.push(defuLabelMedium);
            optionsMenuComponents.push(touwaLabelVerySmall);
            optionsMenuComponents.push(defuLabelVerySmall);
            optionsMenuComponents.push(optionsLabel);
            optionsMenuComponents.push(backButton);
            optionsMenuComponents.push(autoPauseCheckbox);
            optionsMenuComponents.push(detailRadioGroup);
        }

        this.uiMng.setComponents(mainMenuComponents);
    };

    Menu.prototype.update = function(dt) {
        this.uiMng.update(dt);
    };

    Menu.prototype.draw = function(r) {
        this.uiMng.draw(r);

        var displayDim = this.game.displayDimension;

        if (this.game.debugDrawStates['MenuDeadZone']) {
            r.strokeRect(0, 0, displayDim.x, displayDim.y, "red");
        }
        if (this.game.debugDrawStates['MenuArea']) {
            r.strokeRect(areaPadding, areaPadding, displayDim.x - areaPadding * 2, displayDim.y - areaPadding * 2, "white");
        }
    };

    return {
        MenuState: MenuState,
        Menu: Menu
    };
});