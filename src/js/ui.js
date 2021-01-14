(function (Ui, $) {

    let updating = false;
    let allowBasicStateChange = true;
    let shouldUpdateUi = true;
    let isSelecting = false;
    let selectedIds = [];

    const ifReadyDoThen = (fnA = async () => {}, fnB = async () => {}) => async () => {
        if (updating) return;
        updating = true;
        $.when(await fnA()).done(await fnB());
        updating = false;
    }

    Ui.init = () => {
        State.onValidCommit = () => {
            Ui.refresh();
            Comps.setFinished();
        }

        $("#selCategory").on("change", ifReadyDoThen(
            async () => Comps.setSelect("#selSortCategoryA", $("#selCategory").val()),
            async () => {
                if (allowBasicStateChange) {
                    State.revert();
                    State.updateCategory($("#selCategory").val());
                    State.updateSort(Generate.sortData());
                    State.commit();
                }
            }
        ));

        // $("#selCategory").on("change", () => {
        //     $.when()
        // });
    
        $("#btnSort").on("click", ifReadyDoThen(
            () => Comps.toggle("#btnSortDirectionA"),
            () => {
                if (allowBasicStateChange) {
                    State.revert();
                    State.updateSort(Generate.sortData());
                    State.commit();
                }
            }
        ));
    
        $("#selFilter").on("change", ifReadyDoThen(
            () => Comps.setSelect("#selFilterValuesA", $("#selFilter").val()),
            () => {
                if (allowBasicStateChange) {
                    State.revert();
                    State.updateFilter(Generate.filterData());
                    State.commit();
                }
            }
        ));
    
        $("#btnClear").on("click", ifReadyDoThen(
            () => {
                $("#inpSearchValuesA, #inpSearchValuesB, #inpSearchValuesC, #inpSearchValuesD").val("");
                $("#inpSearch").val("")
                    .prop("disabled", false);
            },
            () => {
                State.revert();
                State.updateSearch(Generate.searchData());
                State.commit();
            }
        ));
    
        $("#btnSearch").on("click", ifReadyDoThen(
            () => $("#inpSearchValuesA").val($("#inpSearch").val()),
            () => {
                State.revert();
                State.updateSearch(Generate.searchData());
                State.commit();
            }
        ));
    
        $("#btnAdd").on("click", ifReadyDoThen(
            () => {
                setSelecting(false);
                resetSelections();
                Ui.updateRow();
            },
            () => {}
        ));
    
        $("#btnMenu").on("click", ifReadyDoThen(
            () => Menu.open(),
            () => {}
        ));
    
        $("#btnPersonnel").on("click", ifReadyDoThen(
            () => {
                State.revert();
                State.updateTable("personnel");
                shouldUpdateUi = State.commit();
            },
            () => {
                if (shouldUpdateUi) {
                    Menu.close();
                    Ui.update();
                }
                shouldUpdateUi = true;
            }
        ));
    
        $("#btnDepartment").on("click", ifReadyDoThen(
            () => {
                State.revert();
                State.updateTable("department");
                shouldUpdateUi = State.commit();
            },
            () => {
                if (shouldUpdateUi) {
                    Menu.close();
                    Ui.update();
                }
                shouldUpdateUi = true;
            }
        ));
    
        $("#btnLocation").on("click", ifReadyDoThen(
            () => {
                State.revert();
                State.updateTable("location");
                shouldUpdateUi = State.commit();
            },
            () => {
                if (shouldUpdateUi) {
                    Menu.close();
                    Ui.update();
                }
                shouldUpdateUi = true;
            }
        ));
    
        $("#selSortCategoryA").on("change", ifReadyDoThen(
            () => {
                allowBasicStateChange = false;
                Comps.setSelect("#selCategory", $("#selSortCategoryA").val());
            },
            () => {
                State.updateCategory($("#selCategory").val());
                State.updateSort(Generate.sortData());
                allowBasicStateChange = true;
            }
        ));
    
        $("#btnSortDirectionA").on("click", ifReadyDoThen(
            () => {
                allowBasicStateChange = false;
                Comps.setToggle("#btnSort", $("#btnSortDirectionA").data("is-on"));
            },
            () => {
                State.updateSort(Generate.sortData())
                allowBasicStateChange = true;
            }
        ));
    
        $("#selSortCategoryB").on("change", ifReadyDoThen(
            () => State.updateSort(Generate.sortData()),
            () => {}
        ));
    
        $("#btnSortDirectionB").on("click", ifReadyDoThen(
            () => State.updateSort(Generate.sortData()),
            () => {}
        ));
    
        for (let i = 0; i < 4; i++) {
            const char = String.fromCharCode(65 + i);
            $("#selFilterCategory" + char).on("change", ifReadyDoThen(
                () => {
                    const table = State.toCommit.currentTable;
                    const cat = $("#selFilterCategory" + char).val();
                    const valuesType = cat === "none" ? "" : State.parameters[table][cat].filterAdv;
                    let selectOptionsValues = char === "A" ? "" : Generate.emptyOption();
                    if (valuesType === "existingRef") {
                        selectOptionsValues += Generate.selectOptionsByExistingRef(cat, Data.getFullList(table));
                    } else if (valuesType === "existingFirstChar") {
                        selectOptionsValues += Generate.selectOptionsByChar(cat, Data.getFullList(table));
                    }
                    Comps.updateSelect("#selFilterValues" + char, selectOptionsValues, "none");
                    $("#btnFilterRule" + char + ", #selFilterValues" + char).prop("disabled", cat === "none");
                    if (char === "A") {
                        Comps.updateSelect("#selFilter", selectOptionsValues);
                    }
                },
                () => State.updateFilter(Generate.filterData())
            ));

            $("#btnFilterRule" + char).on("click", ifReadyDoThen(
                () => State.updateFilter(Generate.filterData())
            ));

            $("#selFilterValues" + char).on("change", ifReadyDoThen(
                () => Comps.setSelect("#selFilter", $("#selFilterValues" + char).val()),
                () => State.updateFilter(Generate.filterData())
            ));

            $("#selSearchCategory" + char).on("change", ifReadyDoThen(
                () => {
                    const isNone = $("#selSearchCategory" + char).val() === "none";
                    $("#inpSearchValues" + char).prop("disabled", isNone)
                        .val("");
                    $("#btnSearchRule" + char).prop("disabled", isNone);
                    if (char === "A") {
                        allowBasicStateChange = false;
                        $("#inpSearch").val("");
                        allowBasicStateChange = true;
                    }
                },
                () => State.updateSearch(Generate.searchData())
            ));

            $("#btnSearchRule" + char).on("click", ifReadyDoThen(
                () => State.updateSearch(Generate.searchData())
            ));

            $("#inpSearchValues" + char).on("change", ifReadyDoThen(
                () => {
                    if (char === "A") {
                        allowBasicStateChange = false;
                        $("#inpSearch").val($("#inpSearchValues" + char).val());
                        allowBasicStateChange = true;
                    }
                },
                () => State.updateSearch(Generate.searchData())
            ));
        }

        $("#btnFieldJobTitle, #btnFieldDepartment, #btnFieldLocation, #btnFieldEmail, #btnFieldName")
                .on("click", ifReadyDoThen(
            () => State.updateFields(Generate.fieldData())
        ));

        $("#btnTheme").on("click", ifReadyDoThen(
            () => {
                $(":root").removeClass("lightTheme");
                if (!$("#btnTheme").data("is-on")) {
                    $(":root").addClass("lightTheme");
                }
            },
            () => {
                State.updateTheme($("#btnTheme").data("is-on") ? "dark" : "light");
                State.commit();
            }
        ));
    
        $("#btnBack").on("click", ifReadyDoThen(
            () => {
                if (!isSelecting) {
                    Util.swap("#sectionTable", "#sectionRow", "medium");
                }
                setSelecting(false);
                resetSelections();
            }
        ));
    
        $("#btnReset").on("click", ifReadyDoThen(
            () => Ui.updateRow()
        ));
    
        $("#btnSave").on("click", ifReadyDoThen(
            () => Ui.handleSave()
        ));

        $("#btnDelete").on("click", ifReadyDoThen(
            () => {
                const table = State.all.currentTable;
                if (!selectedIds.length) return;
                if (table === "personnel") {
                    handleDelete();
                } else if (table === "department") {
                    Comps.setLoading();
                    Data.getAll(() => {
                        const list = Data.getFullList("personnel");
                        for (let i = 0; i < list.length; i++) {
                            if (selectedIds.includes(Number.parseInt(list[i].departmentID))) {
                                Comps.setError();
                                Comps.showModal("Error", ["One or more rows are dependencies in another table."]);
                                return;
                            }
                        }
                        handleDelete();
                    });
                } else if (table === "location") {
                    Comps.setLoading();
                    Data.getDepartment(selectedIds, () => {
                        const list = Data.getFullList("department");
                        for (let i = 0; i < list.length; i++) {
                            if (selectedIds.includes(Number.parseInt(list[i].locationID))) {
                                Comps.setError();
                                Comps.showModal("Error", ["One or more rows are dependencies in another table."]);
                                return;
                            }
                        }
                        handleDelete();
                    });
                }
            }
        ));
    
        $("#btnSelectAll").on("click", ifReadyDoThen(
            () => {
                resetSelections();
                const idList = Util.mapUnique(Data.getList(State.toCommit.currentTable), (i) => Number.parseInt(i.id));
                for (let i = 0; i < idList.length; i++) {
                    const id = idList[i];
                    const ele = $(".listItem[data-id=" + id + "]");
                    const icon = ele.children(".badge .icon");
                    const badge = ele.children(".badge .badgeIcon");
                    addSelection(ele, id, icon, badge);
                    Util.swap(icon, badge);
                }
            }
        ));

        $("#btnEdit, #btnEditBatch").on("click", () => {
            Ui.updateRow();
        });

        $("#tableList").on("click", "li.listItem, div.badge", function(e) {
            const ele = $(this);
            if (ele.hasClass("badge")) {
                const itemId = ele.parent().data("id");
                let wasSelected = selectedIds.includes(itemId);
                if (!itemId) return;
                if (wasSelected) {
                    removeSelection(ele.parent(), itemId);
                } else {
                    addSelection(ele.parent(), itemId);
                }
                setSelecting(selectedIds.length);
                e.stopPropagation();
            } else if (ele.hasClass("listItem")) {
                const itemId = ele.data("id");
                if (itemId) {
                    setSelecting(false, true);
                    resetSelections();
                    addSelection(ele, itemId);
                    Ui.updateRow();
                }
            }
        });

        Ui.update();
            
        $("#preloader").delay(200).fadeOut(Util.cssVar("very-slow"), "swing");
        $("#menu").delay(200).css("opacity", "");
        $(".mm-wrapper__blocker, .mm-btn_close").on("mousedown", () => {
            $("#btnMenuBack").trigger("click");
        })
    }

    const resetSelections = () => {
        $("#tableList .listItem.selected").removeClass("selected");
        selectedIds = [];
    }

    const addSelection = (ele = {}, id = 0) => {
        ele.addClass("selected");
        selectedIds.push(id);
    }

    const removeSelection = (ele = {}, id = 0) => {
        ele.removeClass("selected");
        selectedIds = Util.arrayRemove(selectedIds, id);
    }

    const setSelecting = (show = true, ignoreActions = false) => {
        isSelecting = show;
        if (show) {
            Util.swap("#actions", "#actionsBasic", "medium");
            $("#btnBack, #btnSelectAll, #btnDelete").show();
            $("#btnReset, #btnSave").hide();
            if (selectedIds.length > 1) {
                $("#btnEditBatch").show();
                $("#btnEdit").hide();
            } else {
                $("#btnEditBatch").hide();
                $("#btnEdit").show();
            }
        } else {
            $("#tableList .listItem.selected").removeClass("selected");
            if (!ignoreActions) {
                Util.swap("#actionsBasic", "#actions", "medium");
            }
        }
    }

    const handleDelete = () => {
        const table = State.all.currentTable;
        if (!selectedIds.length) return;
        Comps.showDecisionModal("Confirmation", 
            ["Are you sure you want to delete these rows?", "This cannot be undone."],
            ["Delete", "Cancel"], 
            [() => {
                Comps.setLoading();
                Data.delete(table, selectedIds, (success) => {
                    if (!success) return Comps.setError();
                    Data.getAll((success) => {
                        if (!success) return Comps.setError();
                        Ui.refresh();
                        Comps.showModal("Success", ["Rows successfully deleted."]);
                        Comps.setFinished();
                        Ui.updateTable();
                    });
                });
            }, () => {}]
        );
    }

    Ui.refresh = () => {
        Data.regenerateList(State.all.currentTable, true);
        Ui.populate();
        Ui.applyFields();
    }

    // sets to defaults - clear
    Ui.clear = (panel = "") => {
        switch (panel) {
            case "mm-2":        // Filter
                if (State.resetFilter()) {
                    Ui.updateFilter();
                }
                break;
            case "mm-3":        // Search
                if (State.resetSearch()) {
                    Ui.updateSearch();
                }
                break;
            default:
                return;
        }
    }

    // undoes any menu changes - back and reset
    Ui.revert = (panel = "") => {
        switch (panel) {
            case "mm-1":        // Sort
                if (State.revert()) {
                    Ui.updateCategory();
                    Ui.updateSort();
                }
                break;
            case "mm-2":        // Filter
                if (State.revert()) {
                    Ui.updateFilter();
                }
                break;
            case "mm-3":        // Search
                if (State.revert()) {
                    Ui.updateSearch();
                }
                break;
            case "mm-4":        // Display
                if (State.revert()) {
                    Ui.updateFields();
                }
                break;
            default:
                return;
        }
    }

    Ui.apply = (panel = "") => {
        switch (panel) {
            case "mm-1":
            case "mm-2":
            case "mm-3":
            case "mm-4":
                State.commit();
                break;
            default:
                return;
        }
    }

    Ui.applyFields = () => {
        const table = State.all.currentTable;
        const fields = State.all[table].displayFields;
        const keys = Object.keys(fields);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (fields[key]) {
                $("[id^=itemId-" + key + "]").show();
            } else {
                $("[id^=itemId-" + key + "]").hide();
            }
        }
    }

    Ui.populate = () => {
        $("#tableList").html(Generate.list());
    }

    Ui.handleSave = () => {
        const table = State.toCommit.currentTable;
        const isAdd = !selectedIds.length;
        const isEdit = selectedIds.length === 1;
        const isBatch = selectedIds.length > 1;
        const v = Generate.validation(!isBatch, selectedIds);
        if (v.errors.length) {
            Comps.setError();
            Comps.showModal("Error", v.errors, () => {});
            return;
        }
        let postData = {};
        if (isAdd) {
            postData = { 0: v.data };
        } else if (isBatch || isEdit) {
            let hasChanged = false;
            for (let i = 0; i < selectedIds.length; i++) {
                const item = Data.getSingle(table, selectedIds[i]);
                const newItem = postData[i] = {};
                newItem.id = selectedIds[i];
                const params = State.parameters[table];
                const paramKeys = Object.keys(params);
                for (let j = 0; j < paramKeys.length; j++) {
                    const key = paramKeys[j];
                    const param = params[key];
                    const column = param.columnName;
                    if (param.isForeign) continue;
                    if (v.data[column] === -1) {
                        newItem[column] = item[column];
                    } else {
                        newItem[column] = v.data[column] || item[column];
                    }
                    if (isEdit) {
                        hasChanged = v.data[column] !== item[column] || hasChanged;
                    } else if (param.updating === "ref") {
                        hasChanged = v.data[column] >= 0 || hasChanged;
                    } else if (param.updating === "text") {
                        hasChanged = v.data[column] || hasChanged;
                    }
                }
            }
            if (!hasChanged) {
                if (!isSelecting) {
                    Util.swap("#sectionTable", "#sectionRow", "medium");
                }
                setSelecting(false);
                resetSelections();
                return;
            }
        }
        Comps.setLoading();
        const onComplete = (success) => {
            Comps.setLoading();
            setSelecting(false);
            Data.getAll((success) => {
                Ui.refresh();
                Ui.updateTable();
                if (success) {
                    Comps.setFinished();
                } else {
                    Comps.setError();
                }
            });
        }
        if (isAdd) {
            Data.add(table, postData, onComplete);
        } else {
            Data.edit(table, postData, onComplete);
        }
        resetSelections();
    }


    Ui.update = () => {
        switch(State.toCommit.currentSection) {
            case "table":
                Ui.updateTable();
                break;
            case "row":
                Ui.updateRow();
                break;
            default:
                throw new Error("invalid section");
        }
    }
    
    Ui.updateTable = () => {
        const table = State.toCommit.currentTable;
        $("#tableHeading").html(Util.capitalise(table));
        Util.swap("#sectionTable", "#sectionRow", "medium");
        Util.swap("#actionsBasic", "#actions", "medium");
        Ui.updateCategory();
        Ui.updateSearch();
        Ui.updateSort();
        Ui.updateFilter();
        Ui.updateFields();
        Ui.updateTheme();
        Menu.updateSelection(table);
    }

    Ui.updateRow = () => {
        let heading = "";
        if (selectedIds.length > 1) {
            heading = "Batch edit " + State.toCommit.currentTable;
        } else if (selectedIds.length > 0) {
            heading = "Edit " + State.toCommit.currentTable;
        } else {
            heading = "Add " + State.toCommit.currentTable;
        }
        $("#rowHeading").html(heading);
        Util.swap("#sectionRow", "#sectionTable", "medium");
        Util.swap("#actions", "#actionsBasic", "medium");
        Ui.updateRowFields();
    }

    Ui.updateRowFields = () => {
        updating = true;
        allowBasicStateChange = false;
        const table = State.toCommit.currentTable;
        const isAdd = !selectedIds.length;
        const isEdit = selectedIds.length === 1;
        const isBatch = selectedIds.length > 1;
        const data = isAdd ? false : Data.getSingle(table, selectedIds[0]);
        switch(table) {
            case "personnel":
                $(`#inpRowFirstNameRoot, #inpRowLastNameRoot, #inpRowJobTitleRoot, 
                        #inpRowEmailRoot, #selRowDepartmentRoot`).show();
                $("#inpRowNameRoot, #selRowLocationRoot").hide();

                $("#inpRowFirstName").val(isEdit ? data.firstName : "")
                    .prop("placeholder", !isBatch ? "" : "Existing");
                $("#inpRowLastName").val(isEdit ? data.lastName : "")
                    .prop("placeholder", !isBatch ? "" : "Existing");
                $("#inpRowJobTitle").val(isEdit ? data.jobTitle : "")
                    .prop("placeholder", !isBatch ? "" : "Existing");
                $("#inpRowEmail").val(isEdit ? data.email : "")
                    .prop("placeholder", !isBatch ? "" : "Existing");
                Comps.updateSelect("#selRowDepartment",
                    Generate.emptyOption() + Generate.selectOptionsByExistingRef("name", Data.getFullList("department")),
                    isEdit ? [data.department] : ["none"]);
                break;
            case "department":
                $(`#inpRowFirstNameRoot, #inpRowLastNameRoot, #inpRowJobTitleRoot, 
                        #inpRowEmailRoot, #selRowDepartmentRoot`).hide();
                $("#inpRowNameRoot, #selRowLocationRoot").show();
                
                $("#inpRowName").val(isEdit ? data.name : "")
                    .prop("placeholder", !isBatch ? "" : "Existing");
                Comps.updateSelect("#selRowLocation",
                    Generate.emptyOption() + Generate.selectOptionsByExistingRef("name", Data.getFullList("location")),
                    isEdit ? [data.location] : ["none"]);
                break;
            case "location":
                $(`#inpRowFirstNameRoot, #inpRowLastNameRoot, #inpRowJobTitleRoot, 
                        #inpRowEmailRoot, #selRowDepartmentRoot`).hide();
                $("#inpRowNameRoot, #selRowLocationRoot").show();
                
                $("#inpRowName").val(isEdit ? data.name : "")
                    .prop("placeholder", !isBatch ? "" : "Existing");
                break;
            default:
                throw new Error("invalid section");
        }
        $("#btnBack, #btnReset, #btnSave").show();
        $("#btnEdit, #btnEditBatch, #btnSelectAll, #btnDelete").hide();
        updating = false;
        allowBasicStateChange = true;
    }
    
    Ui.updateCategory = () => {
        updating = true;
        allowBasicStateChange = false;
        const table = State.toCommit.currentTable;
        const cat = State.toCommit[table].category;
        const fieldParams = State.parameters[table];
        Comps.updateSelect("#selCategory", Generate.selectOptionsByParams(fieldParams), [cat]);
        $("#selCategory").prop("disabled", Object.keys(fieldParams).length < 2);
        updating = false;
        allowBasicStateChange = true;
    }
    
    Ui.updateSort = () => {
        updating = true;
        allowBasicStateChange = false;
        const table = State.toCommit.currentTable;
        const sort = State.toCommit[table].sort;
        const fieldParams = State.parameters[table];
        const isAscA = sort.primary.direction !== "desc";
        const isAscB = sort.secondary.direction !== "desc";
        const catA = sort.primary.category;
        const catB = sort.secondary.category;
        Comps.setToggle("#btnSort", isAscA);
        Comps.updateSelect("#selSortCategoryA", Generate.selectOptionsByParams(fieldParams), [catA]);
        Comps.setToggle("#btnSortDirectionA", isAscA);
        Comps.updateSelect("#selSortCategoryB",
            Generate.emptyOption() + Generate.selectOptionsByParams(fieldParams),
            catB ? [catB] : []);
        Comps.setToggle("#btnSortDirectionB", isAscB);
        $("#btnSortDirectionB").prop("disabled", !catB);
        updating = false;
        allowBasicStateChange = true;
    }
    
    Ui.updateFilter = () => {
        updating = true;
        allowBasicStateChange = false;
        const table = State.toCommit.currentTable;
        const fieldParams = State.parameters[table];
        const filter = State.toCommit[table].filter;
        const incKeys = Object.keys(filter.inclusive);
        const excKeys = Object.keys(filter.exclusive);
        for (let i = 0; i < 4; i++) {
            const key = incKeys[i] || excKeys[i - incKeys.length];
            let rule = !incKeys[i] ? "exclusive" : "inclusive";
            const suffix = String.fromCharCode(65 + i);
            const values = filter[rule][key] || [];
            const isEmpty = !key || key === "none";
            const valuesType = isEmpty ? "" : fieldParams[key].filterAdv;
            const something = fieldParams[key]
            const selectOptionsCat = Generate.emptyOption() 
                + Generate.selectOptionsByParams(fieldParams);
            let selectOptionsValues = Generate.emptyOption();
            if (valuesType === "existingRef") {
                if (key === "location" || key === "department") {
                    selectOptionsValues += Generate.selectOptionsByExistingRef("name", Data.getFullList(key));
                } else {
                    selectOptionsValues += Generate.selectOptionsByExistingRef(key, Data.getFullList(table));
                }
            } else if (valuesType === "existingFirstChar") {
                selectOptionsValues += Generate.selectOptionsByChar(key, Data.getFullList(table));
            }
            Comps.updateSelect("#selFilterCategory" + suffix, selectOptionsCat, isEmpty ? ["none"] : [key]);
            Comps.setToggle("#btnFilterRule" + suffix, rule === "inclusive" || isEmpty);
            $("#btnFilterRule" + suffix).prop("disabled", isEmpty);
            Comps.updateSelect("#selFilterValues" + suffix, selectOptionsValues, values.length ? values : ["none"]);
            $("#selFilterValues" + suffix).prop("disabled", isEmpty);
            if (i > 0) continue;
            Comps.updateSelect("#selFilter", selectOptionsValues, values.length ? values : ["none"]);
        }
        updating = false;
        allowBasicStateChange = true;
    }
    
    Ui.updateSearch = () => {
        updating = true;
        allowBasicStateChange = false;
        const table = State.toCommit.currentTable;
        const search = State.toCommit[table].search;
        const fieldParams = State.parameters[table];    
        const incKeys = Object.keys(search.inclusive);
        const excKeys = Object.keys(search.exclusive);
        let searchStr = "";
        let nonEmptyCount = 0;
        for (let i = 0; i < 4; i++) {
            const key = incKeys[i] || excKeys[i - incKeys.length];
            let rule = incKeys[i] ? "inclusive" : "exclusive";
            const suffix = String.fromCharCode(65 + i);
            const values = search[rule][key] || [];
            const isEmpty = !key || key === "none";
            if (isEmpty) {
                rule = "";
            } else {
                nonEmptyCount++;
            }
            const selectOptionsCat = Generate.emptyOption() 
                + Generate.selectOptionsByParams(fieldParams);
            Comps.updateSelect("#selSearchCategory" + suffix, selectOptionsCat, isEmpty ? ["none"] : [key]);
            Comps.setToggle("#btnSearchRule" + suffix, rule === "inclusive" || isEmpty);
            $("#btnSearchRule" + suffix).prop("disabled", isEmpty);
            $("#inpSearchValues" + suffix).val(values.join(" "))
                .prop("disabled", isEmpty);
            if (nonEmptyCount === 1) {
                searchStr = values.join(" ");
            }
            if (nonEmptyCount > 1 && values.length) {
                searchStr = "Custom";
            }
        }
        $("#inpSearch").val(searchStr)
            .prop("disabled", searchStr === "Custom");
        updating = false;
        allowBasicStateChange = true;
    }

    Ui.updateFields = () => {
        updating = true;
        allowBasicStateChange = false;
        $("#btnFieldJobTitle, #btnFieldDepartment, #btnFieldLocation, #btnFieldEmail, #btnFieldName").hide();
        const options = State.toCommit[State.toCommit.currentTable];
        const fields = Object.keys(options.displayFields);
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            const o = options.displayFields[field];
            switch(field) {
                case "jobTitle":
                    Comps.setToggle("#btnFieldJobTitle", o);
                    $("#btnFieldJobTitle").show();
                    break;
                case "department":
                    Comps.setToggle("#btnFieldDepartment", o);
                    $("#btnFieldDepartment").show();
                    break;
                case "location":
                    Comps.setToggle("#btnFieldLocation", o);
                    $("#btnFieldLocation").show();
                    break;
                case "email":
                    Comps.setToggle("#btnFieldEmail", o);
                    $("#btnFieldEmail").show();
                    break;
                case "name":
                    Comps.setToggle("#btnFieldName", o);
                    $("#btnFieldName").show();
                    break;
                default:
                    throw new Error("field has no associated button");
            }
        }
        updating = false;
        allowBasicStateChange = true;
    }

    Ui.updateTheme = () => {
        updating = true;
        allowBasicStateChange = false;
        Comps.setToggle("#btnTheme", State.toCommit.theme === "dark")
        $(":root").removeClass("lightTheme");
        if (State.toCommit.theme === "light") {
            $(":root").addClass("lightTheme");
        }
        updating = false;
        allowBasicStateChange = true;
    }
    
}(window.Ui = window.Ui || {}, jQuery));