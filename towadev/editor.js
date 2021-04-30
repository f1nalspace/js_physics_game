// Make buttons
$(function () {
    final.setLogLevel(final.LogLevel.Debug);
    final.addSourcePath("final/", "^(final\\..*)$", false, "final");
    final.addSourcePath("source/", "^(final\\.towadev)$", true, "final");
    final.addSourcePath("source/", "^(final\\.towadev\\..*)$", true, "final");
    final.load("final.towadev.editor", function () {
        var editor = new final.towadev.editor.Editor("canvas", true);

        var tableFields = [];

        editor.modifiedCallback = function () {
            if (editor.modified) {
            } else {
            }
        };

        function loadMap(mapname) {
            $.ajax("php/map.php", {
                method: "get",
                dataType: "json",
                data: {
                    action: "load",
                    map: mapname
                }
            }).done(function (data) {
                editor.loadMap(data, mapname);
            });
        }

        function showMapNameDialog(success) {
            var input = $("<input/>");
            input.attr("type", "text");
            input.css("width", "90%");
            input.prop("id", "map-name");
            var inputLabel = $("<label/>");
            inputLabel.text("Name:");
            inputLabel.attr("for", "map-name");
            var dlg = $("<div/>").dialog({
                modal: true,
                height: 400,
                width: 600,
                title: "Enter map name",
                buttons: [
                    {
                        text: "OK",
                        click: function () {
                            if (success) {
                                success(input.val());
                            }
                            $(this).dialog("close");
                        }
                    },
                    {
                        text: "Cancel",
                        click: function () {
                            $(this).dialog("close");
                        }
                    }
                ]
            });
            var widget = dlg.dialog("widget");
            var content = $(".ui-dialog-content", widget);

            content.append($("<div/>").append(inputLabel).append(input));
        }

        function saveMap(mapname) {
            var mapExport = editor.exportMap();
            $.ajax("php/map.php", {
                method: "post",
                dataType: "json",
                data: {
                    data: JSON.stringify(mapExport),
                    action: "save",
                    map: mapname
                }
            }).done(function () {
                editor.currentMapName = mapname;
                editor.modified = false;
                editor.modifiedCallback();
            });
        }

        function saveMapTrigger() {
            if (editor.currentMapName == null) {
                showMapNameDialog(function (newname) {
                    saveMap(newname + ".json");
                });
            } else {
                saveMap(editor.currentMapName);
            }
        }

        function showMapList() {
            $.ajax("php/map.php", {
                method: "get",
                dataType: "json",
                data: {
                    action: "list"
                }
            }).done(function (data) {
                var selectedMap = null;
                var dlg = $("<div/>").dialog({
                    title: "Select a map",
                    height: 400,
                    width: 600,
                    modal: true,
                    buttons: [
                        {
                            id: "button-load-map",
                            text: "Load map",
                            click: function () {
                                loadMap(selectedMap);
                                $(this).dialog("close");
                            }
                        },
                        {
                            text: "Cancel",
                            click: function () {
                                $(this).dialog("close");
                            }
                        }
                    ]
                });
                var widget = dlg.dialog("widget");
                $("#button-load-map", widget).button("disable");

                var content = $(".ui-dialog-content", widget);

                var ul = $("<ul/>");
                ul.addClass("map-list");
                content.append(ul);
                for (var i = 0; i < data.length; i++) {
                    var li = $("<li/>");
                    li.attr("data-map", data[i]);
                    li.text(data[i]);
                    ul.append(li);
                }
                ul.selectable({
                    selected: function (event, ui) {
                        selectedMap = $(ui.selected).attr("data-map");
                        $("#button-load-map", widget).button("enable");
                    }
                });
            });
        }

        function updateActions() {
            $(".action-new").button().click(function () {
                editor.newMap();
            });
            $(".action-load").button().click(function () {
                showMapList();
            });
            $(".action-save").button().click(function () {
                saveMapTrigger();
            });
        }

        function updateToolbar() {
            $("ul#tabs a").click(function (e) {
                e.preventDefault();
                var t = $(this);
                t.tab('show');
                var dataMode = t.attr("data-mode");
                if (dataMode && dataMode >= 1 && dataMode <= 2) {
                    editor.setMode(parseInt(dataMode, 10));
                    $("#canvas").show();
                } else {
                    $("#canvas").hide();
                }
            });

            // Initialize tiles as default
            $("ul#tabs a[data-mode=" + editor.mode + "]").click();
        }

        function updateTiles() {
            var tileTypes = editor.getTileTypes();
            var tileItems = $('.tiles');
            for (var i = 0; i < tileTypes.length; i++) {
                var v = tileTypes[i].value;

                var label = $("<label/>");
                label.addClass("btn btn-default");

                var input = $("<input/>");
                input.attr("type", "radio");
                input.attr("name", "tile");
                input.attr("autocomplete", "off");
                input.val(v);
                label.append(input);

                label.append(tileTypes[i].name);

                if (editor.tilePen == v) {
                    label.addClass("active");
                    input.prop("checked", true);
                }

                tileItems.append(label);
                $(":radio", tileItems).change(function () {
                    editor.setTilePen(parseInt($(this).val()));
                });
            }
        }

        function createDialog(form, title, saveAction) {
            // Build modal dialog
            var modalFade = $("<div/>").addClass("modal fade").attr("role", "dialog");

            var modalDialog = $("<div/>").addClass("modal-dialog modal-lg").attr("role", "document");

            var modalContent = $("<div/>").addClass("modal-content");

            var modalHeader = $("<div/>").addClass("modal-header");
            modalHeader.append($("<button/>").addClass("close").attr("type", "button").attr("data-dismiss", "modal").append($("<span/>").attr("aria-hidden", "true").html("&times;")));
            modalHeader.append($("<h4/>").addClass("modal-title").text(title));

            var modalBody = $("<div/>").addClass("modal-body");
            modalBody.append(form);

            var modalFooter = $("<div/>").addClass("modal-footer");
            var closeButton = $("<button/>").addClass("btn btn-default").attr("type", "button").attr("data-dismiss", "modal").text("Close");
            var saveButton = $("<button/>").addClass("btn btn-primary").attr("type", "button").text("Save").click(function () {
                saveAction();
            });
            modalFooter.append(closeButton).append(saveButton);

            modalContent.append(modalHeader).append(modalBody).append(modalFooter);

            modalDialog.append(modalContent);

            modalFade.append(modalDialog);

            $("body").append(modalFade);

            // Show dialog
            modalFade.modal('show');

            // Destroy modal dialog when it gets hidden
            modalFade.on('hidden.bs.modal', function () {
                $(this).data('bs.modal', null);
                $(this).remove();
            });

            return modalFade;
        }

        function getFieldProperty(item, field) {
            return item[field.prop];
        }

        function createForm(fields, itemId, item) {
            var i, j, form, field, fieldType, grp, label, inputContainer, input, select, option, dataId, value;
            form = $("<form/>").addClass("form-horizontal").attr("role", "form");

            grp = $("<div/>").addClass("form-group");
            label = $("<label/>").addClass("control-label col-sm-2").text("#");
            grp.append(label);

            inputContainer = $("<div/>").addClass("col-sm-10");
            input = $("<input/>").addClass("form-control").attr("data-prop", "#");
            input.val(itemId || "");
            inputContainer.append(input);

            grp.append(inputContainer);

            form.append(grp);

            for (i = 0; i < fields.length; i++) {
                field = fields[i];
                grp = $("<div/>").addClass("form-group");
                label = $("<label/>").addClass("control-label col-sm-2").text(field.name);
                grp.append(label);

                inputContainer = $("<div/>").addClass("col-sm-10");

                fieldType = field.type || "text";
                input = $("<input/>").addClass("form-control").attr("data-prop", field.prop);
                switch (fieldType) {
                    case "number":
                        input.attr("type", "number");
                        input.attr("step", typeof field.step != "undefined" ? field.step : 1);
                        input.attr("min", typeof field.min != "undefined" ? field.min : 0);
                        break;
                    case "color":
                        input.attr("type", "color");
                        break;
                    default:
                        input.attr("type", "text");
                        break;
                }
                if (item) {
                    value = getFieldProperty(item, field);
                    input.val(value);
                } else {
                    input.val("");
                }
                inputContainer.append(input);

                if (field.type === "select") {
                    input.attr("type", "hidden");
                    select = $("<select/>").addClass("form-control");
                    select.change(function () {
                        var input = $(this).prev();
                        input.val($("option:selected", this).val());
                    });

                    for (j = 0; j < field.data.count; j++) {
                        dataId = field.data.keys[j];
                        // TODO: Display same as key?
                        option = $("<option/>").val(dataId).text(dataId);
                        if (dataId === value) {
                            option.prop("selected", "selected");
                        }
                        select.append(option);
                    }

                    inputContainer.append(select);
                }

                grp.append(inputContainer);

                form.append(grp);
            }
            return form;
        }

        function setFieldProperty(item, field, value) {
            item[field.prop] = value;
        }

        function saveForm(form, fields, item, itemId) {
            var i, field, input;
            for (i = 0; i < fields.length; i++) {
                field = fields[i];
                input = $("input[data-prop=" + field.prop + "]", form);
                setFieldProperty(item, field, input.val());
            }

            // Renamed ID?
            input = $("input[data-prop=#]", form);
            if (input.val() !== itemId) {
                item._newID = input.val();
            }

            return true;
        }

        function updateTableRow(row, fields, item) {
            var i, field, td;
            for (i = 0; i < fields.length; i++) {
                field = fields[i];
                td = $("td[data-prop=" + field.prop + "]", row);
                td.text(getFieldProperty(item, field));
            }
        }

        function moveTableRow(table, row, delta) {
            if (delta < 0) {
                row.insertBefore(row.prev());
            } else {
                row.insertAfter(row.next());
            }
            var rows = $("tbody tr", table);
            for (var i = 0; i < rows.length; i++) {
                var tr = rows[i];
                $(".move-up", tr).attr("disabled", !(i > 0) ? "disabled" : null);
                $(".move-down", tr).attr("disabled", !(i < rows.length - 1) ? "disabled" : null);
            }
        }

        function renameKeyValues(tableId, data, fields, prop, oldValue, newValue) {
            var tbl = $("table#" + tableId);
            for (var i = 0; i < data.count; i++) {
                var itemKey = data.keys[i];
                var item = data.keyValues[itemKey];
                if (item[prop] === oldValue) {
                    item[prop] = newValue;
                }
                var row = $("tr[data-item="+itemKey+"]", tbl);
                updateTableRow(row, fields, item);
            }
        }

        function renameTableRow(row, item, oldItemId, newItemId) {
            var table = row.closest("table");
            var tableId = table.prop("id");

            // Rename dependencies
            for (var k in tableFields) {
                if (tableFields.hasOwnProperty(k)) {
                    if (k !== tableId) {
                        var fields = tableFields[k].fields;
                        for (var i = 0; i < fields.length; i++) {
                            var field = fields[i];
                            if (field.type == 'select' && field.dataId === tableId) {
                                renameKeyValues(k, tableFields[k].data, fields, field.prop, oldItemId, newItemId);
                            }
                        }
                    }
                }
            }

            row.attr("data-item", item['_newID']);

            var td = $("td[data-prop=#]", row);
            td.text(newItemId);
        }

        function createTable(name, table, data, fields, options) {
            var i, j, itemId, item, row, actionGroup, actionAdd, actionEdit, actionRemove, actionMoveDown, actionMoveUp, field;

            tableFields[table.prop("id")] = {
                fields: fields,
                data: data
            };

            var thead = $("<thead/>");
            var tbody = $("<tbody/>");

            // Create header
            row = $("<tr/>");
            row.append($("<th/>").text("Action"));
            row.append($("<th/>").text("#"));
            for (j = 0; j < fields.length; j++) {
                field = fields[j];
                row.append($("<th/>").text(field.name));
            }
            thead.append(row);

            for (i = 0; i < data.count; i++) {
                itemId = data.keys[i];
                item = data.get(itemId);

                row = $("<tr/>").attr("data-item", itemId);

                actionGroup = $("<div/>").addClass("btn-toolbar");

                actionEdit = $("<button/>").addClass("btn btn-default").append($("<span/>").addClass("glyphicon glyphicon-pencil")).attr("href", "#").attr("data-item", itemId);
                actionEdit.click(function () {
                    var self = $(this);
                    var row = self.closest("tr");
                    var itemId = row.attr("data-item");
                    var item = data.get(itemId);
                    var newForm = createForm(fields, itemId, item);
                    var dlg = createDialog(newForm, "Edit " + name + ": " + itemId, function () {
                        if (saveForm($("form", dlg), fields, item, itemId)) {
                            // Is ID renamed?
                            var canUpdateAndClose = true;
                            if (item['_newID']) {
                                // TODO: Add validation check to cancel the submit
                                if (data.renameKey(itemId, item['_newID'])) {
                                    renameTableRow(row, item, itemId, item['_newID']);
                                    itemId = item['_newID'];
                                } else {
                                    canUpdateAndClose = false;
                                }
                                item['_newID'] = null;
                            }
                            if (canUpdateAndClose) {
                                updateTableRow(row, fields, item);
                                dlg.modal("hide");
                            }
                        }
                    });
                });

                actionGroup.append(actionEdit);

                if (options && options.allowMove) {
                    actionMoveUp = $("<button/>").addClass("btn btn-default move-up").append($("<span/>").addClass("glyphicon glyphicon-arrow-up")).attr("href", "#").attr("data-item", itemId).attr("data-delta", -1);
                    actionMoveDown = $("<button/>").addClass("btn btn-default move-down").append($("<span/>").addClass("glyphicon glyphicon-arrow-down")).attr("href", "#").attr("data-item", itemId).attr("data-delta", 1);
                    $([actionMoveUp, actionMoveDown]).each(function(){
                        $(this).click(function(){
                            var self = $(this);
                            var row = self.closest("tr");
                            moveData(data, self.attr("data-item"), self.attr("data-delta"));
                            moveTableRow(table, row, self.attr("data-delta"));
                        });
                    });
                    actionGroup.append(actionMoveUp);
                    actionGroup.append(actionMoveDown);
                    if (!(i > 0)) {
                        actionMoveUp.attr("disabled", "disabled");
                    } else if (!(i < data.count - 1)) {
                        actionMoveDown.attr("disabled", "disabled");
                    }
                }

                actionRemove = $("<button/>").addClass("btn btn-default").append($("<span/>").addClass("glyphicon glyphicon-minus")).attr("href", "#");

                actionGroup.append(actionRemove);

                row.append($("<td/>").append(actionGroup));

                row.append($("<td/>").attr("data-prop", "#").text(itemId));

                for (j = 0; j < fields.length; j++) {
                    field = fields[j];
                    row.append($("<td/>").text(item[field.prop]).attr("data-prop", field.prop));
                }

                $(tbody).append(row);
            }

            // Create "addition" row
            row = $("<tr/>");
            actionGroup = $("<div/>").addClass("btn-toolbar");
            actionAdd = $("<button/>").addClass("btn btn-default").append($("<span/>").addClass("glyphicon glyphicon-plus")).attr("href", "#");
            actionAdd.click(function(){
                var self = $(this);
                var newForm = createForm(fields, null, null);
                var dlg = createDialog(newForm, "New " + name, function () {
                    dlg.modal("hide");
                });
            });
            actionGroup.append(actionAdd);
            row.append($("<td/>").append(actionGroup));
            row.append($("<td/>").attr("colspan", 1 + fields.length));
            tbody.append(row);

            table.append(thead);
            table.append(tbody);
        }

        function updateEnemies() {
            createTable("Enemy", $("#enemies"), editor.enemies, [
                {
                    prop: "speed",
                    name: "Speed",
                    type: "number",
                    step: 0.05
                },
                {
                    prop: "health",
                    name: "Health",
                    type: "number"
                },
                {
                    prop: "bounty",
                    name: "Bounty",
                    type: "number"
                },
                {
                    prop: "sizeFactor",
                    name: "Size (in %)",
                    type: "number",
                    step: 0.05
                },
                {
                    prop: "color",
                    name: "Color",
                    type: "color"
                }
            ]);
        }

        function updateWaves() {
            createTable("Wave", $("#waves"), editor.waves, [
                {
                    prop: "count",
                    name: "Count",
                    type: "number"
                },
                {
                    prop: "enemy",
                    name: "Enemy",
                    type: "select",
                    data: editor.enemies,
                    dataId: "enemies"
                },
                {
                    prop: "interval",
                    name: "Interval (in secs)",
                    type: "number",
                    step: 0.05
                },
                {
                    prop: "bonus",
                    name: "Bonus",
                    type: "number"
                }
            ], {
                allowMove: true
            });
        }

        function updateTowersWeapons() {
            createTable("Tower", $("#towers"), editor.towers, [
                {
                    prop: "name",
                    name: "Name"
                },
                {
                    prop: "weapon",
                    name: "Weapon",
                    type: "select",
                    data: editor.weapons,
                    dataId: "weapons"
                },
                {
                    prop: "cost",
                    name: "Cost",
                    type: "number"
                },
                {
                    prop: "image",
                    name: "Image"
                }
            ]);

            createTable("Weapon", $("#weapons"), editor.weapons, [
                {
                    prop: "cooldownTime",
                    name: "Cooldown (in secs)",
                    type: "number",
                    step: 0.05
                },
                {
                    prop: "range",
                    name: "Range",
                    type: "number",
                    step: 0.05
                },
                {
                    prop: "image",
                    name: "Image"
                }
            ]);
        }

        function updateGameSettings() {
            $("#gameInitialMoney").val(editor.gameProperties['initialMoney']);
            $("#gameWaveTimerDuration").val(editor.gameProperties['waveTimerDuration']);
        }

        function initEditor() {
            updateActions();
            updateToolbar();
            updateTiles();
            updateEnemies();
            updateWaves();
            updateTowersWeapons();
            updateGameSettings();
        }

        editor.initCallback = function () {
            initEditor();
        };

        editor.run();
        editor.resizeAndPositionDisplay();
    });
});
