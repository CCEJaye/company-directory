(function (Menu, $) {
    
    let menu;
    let currentPanel = null;
    let lastPanel = null;

    Menu.init = () => {
        Mmenu.configs.panelNodetype = ["ul", "ol", "section"];
        menu = new Mmenu("#menu", {
            "extensions": [
                "position-right",
                "position-front",
                "pagedim-black",
                "fx-panels-slide-0",
                "shadow-panels"
            ],
            "navbars": [{
                    "position": "bottom",
                    "content": [`
                        <button id="btnMenuBack" class="iconBtn mini" type="button" tabindex="0">
                            <span class="tLabel">Back</span>
                            <svg role="img"><use xlink:href="img/icons.svg#back"></use></svg>
                        </button>
                        `, `
                        <button id="btnMenuReset" class="iconBtn mini" type="button" tabindex="0">
                            <span class="tLabel">Revert</span>
                            <svg role="img"><use xlink:href="img/icons.svg#reset"></use></svg>
                        </button>
                        `, `
                        <button id="btnMenuClear" class="iconBtn mini" type="button" tabindex="0">
                            <span class="tLabel">Clear</span>
                            <svg role="img"><use xlink:href="img/icons.svg#clear"></use></svg>
                        </button>
                        `, `
                        <button id="btnMenuApply" class="iconBtn mini" type="button" tabindex="0">
                            <span class="tLabel">Apply</span>
                            <svg role="img"><use xlink:href="img/icons.svg#save"></use></svg>
                        </button>
                        `
                    ]
                }, {
                    "position": "top",
                    "content": [
                        "breadcrumbs",
                        "close"
                    ]
                }
            ],
            offCanvas: {
                moveBackground: false
            },
            backButton: {
                close: true
            },
            keyboardNavigation: {
                enable: true,
                enhance: true
            },
            hooks: {
                "openPanel:start": panel => {
                    lastPanel = currentPanel;
                    currentPanel = panel.id;
                    Menu.updateMenuButtons();
                    $("a.mm-tabstart").removeAttr("href");
                }
            }
        }, {
            
        });

        $("#btnMenuBack").on("click", () => {
            if (currentPanel === "mm-0") {
                Ui.refresh();
                Menu.close();
            } else {
                Ui.revert(currentPanel);
                menu.API.openPanel($(".mm-panel.mm-panel_opened-parent:last")[0]);
            }
        });

        $("#btnMenuReset").on("click", () => {
            Ui.revert(currentPanel);
        });

        $("#btnMenuClear").on("click", () => {
            Ui.clear(currentPanel);
        });

        $("#btnMenuApply").on("click", () => {
            Ui.apply(currentPanel);
        });
    }

    Menu.updateSelection = (table = "") => {
        $("#btnPersonnel, #btnDepartment, #btnLocation").parent().removeClass("selected");
        switch (table) {
            case "personnel":
                $("#btnPersonnel").parent().addClass("selected");
                break;
            case "department":
                $("#btnDepartment").parent().addClass("selected");
                break;
            case "location":
                $("#btnLocation").parent().addClass("selected");
                break;
            default:
                throw new Error("table does not exist");
        }
    }

    Menu.open = () => {
        menu.API.open();
    }

    Menu.close = () => {
        menu.API.close();
    }

    Menu.updateMenuButtons = () => {
        let buttons;
        switch (currentPanel) {
            case "mm-0":
            case "mm-5":
                buttons = "#btnMenuBack";
                break;
            case "mm-1":
            case "mm-4":
                buttons = "#btnMenuBack, #btnMenuReset, #btnMenuApply";
                break;
            case "mm-2":
            case "mm-3":
                buttons = "#btnMenuBack, #btnMenuReset, #btnMenuClear, #btnMenuApply";
                break;    
            default:
                throw new Error("Invalid panel id");
        }
        $("#btnMenuBack, #btnMenuReset, #btnMenuClear, #btnMenuApply").hide();
        $(buttons).show();
    }

}(window.Menu = window.Menu || {}, jQuery));