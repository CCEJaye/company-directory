(function (Ui, $) {

    let updating = false;
    let allowBasicStateChange = true;
    let requiresListChange = false;
    let shouldUpdateUi = true;
    let selectMode = false;

    const ifReadyDoThen = (fnA = () => {}, fnB = () => {}) => async () => {
        if (updating) return;
        updating = true;
        $.when(fnA()).done(fnB());
        updating = false;
    }

    Ui.init = () => {
        State.onValidCommit = () => {
            requiresListChange = true;
            Ui.refresh();
            Comps.setFinished();
        }

        $("#selCategory").on("change", ifReadyDoThen(
            () => $("#selSortCategoryA").val($("#selCategory").val()).trigger("change"),
            () => {
                if (allowBasicStateChange) {
                    State.revert();
                    State.updateCategory($("#selCategory").val());
                    State.updateSort(getSortData());
                    State.commit();
                }
            }
        ));
    
        $("#btnSort").on("click", ifReadyDoThen(
            () => $("#btnSortDirectionA").trigger("click"),
            () => {
                if (allowBasicStateChange) {
                    State.revert();
                    State.updateSort(getSortData());
                    State.commit();
                }
            }
        ));
    
        $("#selFilter").on("change", ifReadyDoThen(
            () => $("#selFilterValuesA").val($("#selFilter").val()).trigger("change"),
            () => {
                if (allowBasicStateChange) {
                    State.revert();
                    State.updateFilter(getFilterData());
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
                State.updateSearch(getSearchData());
                State.commit();
            }
        ));
    
        $("#btnSearch").on("click", ifReadyDoThen(
            () => $("#inpSearchValuesA").val($("#inpSearch").val()),
            () => {
                State.revert();
                State.updateSearch(getSearchData());
                State.commit();
            }
        ));
    
        $("#btnAdd").on("click", ifReadyDoThen(
            () => {
                selectMode = false;
                State.updateRowIds([]);
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
                $("#selCategory").val($("#selSortCategoryA").val()).trigger("change");
            },
            () => {
                State.updateCategory($("#selCategory").val());
                State.updateSort(getSortData());
                allowBasicStateChange = true;
            }
        ));
    
        $("#btnSortDirectionA").on("click", ifReadyDoThen(
            () => {
                allowBasicStateChange = false;
                $("#btnSort").data("is-on", !$("#btnSortDirectionA").data("is-on")).trigger("click");
            },
            () => {
                State.updateSort(getSortData())
                allowBasicStateChange = true;
            }
        ));
    
        $("#selSortCategoryB").on("change", ifReadyDoThen(
            () => State.updateSort(getSortData()),
            () => {}
        ));
    
        $("#btnSortDirectionB").on("click", ifReadyDoThen(
            () => State.updateSort(getSortData()),
            () => {}
        ));
    
        for (let i = 0; i < 4; i++) {
            const char = String.fromCharCode(65 + i);
            $("#selFilterCategory" + char).on("change", ifReadyDoThen(
                () => {
                    const table = State.toCommit.currentTable;
                    const cat = $("#selFilterCategory" + char).val();
                    const valuesType = cat === "none" ? "" : State.parameters[table][cat].filterAdv;
                    let selectOptionsValues = char === "A" ? "" : getEmptyOption(true);
                    if (valuesType === "existingRef") {
                        selectOptionsValues += getSelectOptionsByRef([], cat, Data.getFullList(table));
                    } else if (valuesType === "existingFirstChar") {
                        selectOptionsValues += getSelectOptionsByChar([], cat, Data.getFullList(table));
                    }
                    $("#selFilterValues" + char).html(selectOptionsValues)
                        .trigger("change");
                    $("#btnFilterRule" + char).prop("disabled", cat === "none");
                    if (char === "A") {
                        $("#selFilter").html(selectOptionsValues)
                            .trigger("change");
                    }
                },
                () => State.updateFilter(getFilterData())
            ));

            $("#btnFilterRule" + char).on("click", ifReadyDoThen(
                () => State.updateFilter(getFilterData()),
                () => {}
            ));

            $("#selFilterValues" + char).on("change", ifReadyDoThen(
                () => $("#selFilter").val($("#selFilterValues" + char).val()).trigger("change"),
                () => State.updateFilter(getFilterData())
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
                () => State.updateSearch(getSearchData())
            ));

            $("#btnSearchRule" + char).on("click", ifReadyDoThen(
                () => State.updateSearch(getSearchData()),
                () => {}
            ));

            $("#inpSearchValues" + char).on("change", ifReadyDoThen(
                () => {
                    if (char === "A") {
                        allowBasicStateChange = false;
                        $("#inpSearch").val($("#inpSearchValues" + char).val());
                        allowBasicStateChange = true;
                    }
                },
                () => State.updateSearch(getSearchData())
            ));
        }

        $("#btnFieldJobTitle, #btnFieldDepartment, #btnFieldLocation, #btnFieldEmail, #btnFieldName").on("click", ifReadyDoThen(
            () => {},
            () => {
                State.updateFields(getFieldData());
            }
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

        // ********************************************************************
        // ********************************************************************
    
        $("#btnBack").on("click", ifReadyDoThen(
            () => {
                State.updateRowIds([]);
                updateSelections([]);
                if (!selectMode) {
                    Ui.updateTable();
                }
            },
            () => {
            }
        ));
    
        $("#btnReset").on("click", ifReadyDoThen(
            () => {},
            () => Ui.updateRow()
        ));
    
        $("#btnSave").on("click", ifReadyDoThen(
            () => {
                Ui.handleSave();
            },
            () => {}
        ));

        $("#btnDelete").on("click", ifReadyDoThen(
            () => {
                const ids = State.toCommit.currentRowIds;
                if (!ids.length) return;
                Comps.setLoading();
                Data.delete(State.all.currentTable, ids, (success) => {
                    if (!success) {
                        Comps.setError();
                    } else {
                        Data.getAll((success) => {
                            if (!success) {
                                Comps.setError();
                            } else {
                                requiresListChange = true;
                                Ui.refresh();
                                Comps.setFinished();
                            }
                        });
                    }
                });
            },
            () => {}
        ));
    
        $("#btnSelectAll").on("click", ifReadyDoThen(
            () => {
                const idList = Util.mapUnique(Data.getList(State.toCommit.currentTable), (i) => i.id);
                State.updateRowIds(idList);
                for (let i = 0; i < idList.length; i++) {
                    const item = idList[i];
                    $(".listItem[data-id=" + item + "] .badge .icon").show();
                    $(".listItem[data-id=" + item + "] .badge .badgeIcon").hide();
                }
            },
            () => {}
        ));

        $("#btnEdit, #btnEditBatch").on("click", () => {
            selectMode = false;
            Ui.updateRow();
        });

        $("#tableList").on("click", "li, div", function(e) {
            const ele = $(this);
            if (ele.hasClass("badge")) {
                const rowIds = State.toCommit.currentRowIds;
                const itemId = ele.parent().data("id");
                let wasSelected = rowIds.includes(itemId);
                if (!itemId) return;
                if (wasSelected) {
                    State.updateRowIds(Util.arrayRemove(rowIds, itemId));
                    swap(ele.children(".badgeIcon"), ele.children(".icon"));
                } else {
                    State.updateRowIds(rowIds.concat([itemId]));
                    swap(ele.children(".icon"), ele.children(".badgeIcon"));
                }
                updateSelections(State.toCommit.currentRowIds);
                selectMode = State.toCommit.currentRowIds.length;
                e.stopPropagation();
            } else if (ele.hasClass("listItem")) {
                const itemId = ele.data("id");
                if (itemId) {
                    selectMode = false;
                    State.updateRowIds([itemId]);
                    Ui.updateRow();
                }
            }
            console.log(State.toCommit.currentRowIds);
        });

        Ui.update();
            
        $("#preloader").delay(200).fadeOut(Util.cssVar("very-slow"), "swing");
        $("#menu").delay(200).css("opacity", "");
    }

    const updateSelections = (items = []) => {
        if (items.length) {
            swap("#actions", "#actionsBasic");
        } else {
            swap("#actionsBasic", "#actions");
            swap(".listItem .badge .badgeIcon", ".listItem .badge .icon");
        }
        if (items.length > 1) {
            $("#btnEditBatch").show();
            $("#btnEdit").hide();
        } else {
            $("#btnEditBatch").hide();
            $("#btnEdit").show();
        }
        $("#btnBack").show();
        $("#btnSelectAll").show();
        $("#btnDelete").show();
        $("#btnReset").hide();
        $("#btnSave").hide();
    }

    Ui.refresh = () => {
        if (requiresListChange) {
            Data.regenerateList(State.all.currentTable, true);
            Ui.populate();
            Ui.applyFields();
            requiresListChange = false;
        }
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
        const htmlStrs = [];
        const table = State.all.currentTable;
        const list = Data.getList(table);
        const params = State.items[table];
        const paramKeys = Object.keys(params);
        const badgeCat = Util.has(params, i => i.isHeading);
        for (let i = 0 ; i < list.length; i++) {
            const item = list[i];
            const badgeVals = item[badgeCat].split(" ");
            const badgeVal = badgeVals.length > 1 
                ? badgeVals[0].substr(0, 1) + badgeVals[1].substr(0, 1)
                : badgeVals[0].substr(0, 2);
            htmlStrs.push(`<li class="listItem grid gC gCmf" data-id="` + item.id + `">`);
            htmlStrs.push(`<div class="badge grid gcTop">`);
            htmlStrs.push(`<span class="tHeading4 gcMiddle badgeIcon">`+badgeVal+`</span>`);
            htmlStrs.push(`<svg class="icon gcMiddle" role="img" style="display: none;">
                <use xlink:href="img/icons.svg#save"></use></svg>`);
            htmlStrs.push(`</div>`);
            htmlStrs.push(`<article class="gcStart p2L">`);
            for (let j = 0; j < paramKeys.length; j++) {
                const p = paramKeys[j];
                if (params[p].isHeading) {
                    htmlStrs.push(`<h3 id="itemId-` + p + i + `" class="tHeading5">` + item[p] + `</h3>`);
                } else {
                    htmlStrs.push(getItemSection(params[p], p + i, item[p]));
                }
            }
            htmlStrs.push("</article></li>");
        }
        $("#tableList").html(htmlStrs.join(""));
    }

    const getItemSection = (param = {}, id = "", value = "") => {
        const strs = [];
        strs.push(`<` + param.tag + ` id="itemId-` + id + `" class="tBody pT">`);
        strs.push(`<svg class="icon mini mR"><use xlink:href="img/icons.svg` + param.icon + `"></use></svg>`);
        strs.push(value + `</`+param.tag+`>`);
        return strs.join("");
    }




    const getEmptyOption = (selected = false) => {
        return "<option"+(selected ? "" : " selected")+" value=\"none\">None</option>";
    }

    const getSortData = () => {
        const data = {
            primary: {
                category: $("#selSortCategoryA").val(),
                direction: $("#btnSortDirectionA").data("is-on") ? "asc" : "desc" },
            secondary: { 
                category: $("#selSortCategoryB").val() || "none",
                direction: $("#btnSortDirectionB").data("is-on") ? "asc" : "desc" }
        }
        return data;
    }

    const getFilterData = () => {
        const data = { inclusive: {}, exclusive: {}};
        for (let i = 0; i < 4; i++) {
            const char = String.fromCharCode(65 + i);
            const cat = $("#selFilterCategory" + char).val();
            console.log(cat);
            const rule = $("#btnFilterRule" + char).data("is-on") ? "inclusive" : "exclusive";
            const values = $("#selFilterValues" + char).val() || [];
            if (!cat || cat === "none" || !values || values[0] === "none") continue;
            data[rule][cat] = values;
        }
        console.log(data);
        return data;
    }

    const getSearchData = () => {
        const data = { inclusive: {}, exclusive: {}};
        for (let i = 0; i < 4; i++) {
            const char = String.fromCharCode(65 + i);
            const cat = $("#selSearchCategory" + char).val();
            if (!cat || cat === "none") continue;
            const rule = $("#btnSearchRule" + char).data("is-on") ? "inclusive" : "exclusive";
            const values = $("#inpSearchValues" + char).val()
                ? $("#inpSearchValues" + char).val().trim().toLowerCase().split(" ") : [];
            data[rule][cat] = values;
        }
        return data;
    }

    const getFieldData = () => {
        const data = {};
        const fields = Object.keys(State.parameters[State.toCommit.currentTable]);
        if (fields.includes("jobTitle")) {
            data.jobTitle = $("#btnFieldJobTitle").data("is-on");
        }
        if (fields.includes("department")) {
            data.department = $("#btnFieldDepartment").data("is-on");
        }
        if (fields.includes("location")) {
            data.location = $("#btnFieldLocation").data("is-on");
        }
        if (fields.includes("email")) {
            data.email = $("#btnFieldEmail").data("is-on");
        }
        if (fields.includes("name")) {
            data.name = $("#btnFieldName").data("is-on");
        }
        return data;
    }

    Ui.validateRow = (blankIsError = true) => {
        const table = State.toCommit.currentTable;
        const params = State.parameters[table];
        const paramKeys = Object.keys(params);
        const data = {};
        let errs = [];
        let hasChanged = false;
        for (let i = 0; i < paramKeys.length; i++) {
            const key = paramKeys[i];
            const param = params[key];
            const column = param.columnName;
            if (param.isForeign) continue;
            if (param.updating === "text") {
                data[column] = $(param.inputId).val();
                errs = errs.concat(validateText(data[column], param, table, key, blankIsError));
            } else if (param.updating === "ref") {
                data[column] = Data.getWhere(key, "name", $(param.inputId).val(), "id");
                errs = errs.concat(validateRef(data[column], param, table, key, blankIsError));
            }
        }
        console.log(errs, data);
        return { errors: errs, data: data };
    }

    const validateText = (value = "", param = {}, table = "", key = "", blankIsError = true) => {
        const errs = [];
        if (blankIsError && !value.trim().length) {
            errs.push(param.display + " cannot be empty.");
        }
        if (value.length > 50) {
            errs.push(param.display + " cannot be longer than 50 characters.");
        }
        if (param.isUnique && Data.getWhere(table, key, value, "id") > -1) {
            errs.push(param.display + " already exists.");
        }
        return errs;
    }

    const validateRef = (value = "", param = {}, table = "", key = "", blankIsError = true) => {
        const errs = [];
        if (blankIsError && value === -1) {
            errs.push(param.display + " is invalid.");
        }
        if (param.isUnique && Data.getWhere(table, key, value, "id") > -1) {
            errs.push(param.display + " already exists.");
        }
        return errs;
    }

    Ui.handleSave = () => {
        const table = State.toCommit.currentTable;
        const rowIds = State.toCommit.currentRowIds;
        const isAdd = !rowIds.length;
        const isEdit = rowIds.length === 1;
        const isBatch = rowIds.length > 1;
        const v = Ui.validateRow(!isBatch);
        if (v.errors.length) {
            Comps.setError();
            Comps.showModal("Error", v.errors, () => {});
            return;
        }
        let modalMsg = "";
        let postData = {};
        if (isAdd) {
            postData = { 0: v.data };
            modalMsg = [Util.capitalise(table) + " added."];
        } else if (isBatch || isEdit) {
            let hasChanged = false;
            for (let i = 0; i < rowIds.length; i++) {
                const item = Data.getSingle(table, rowIds[i]);
                const newItem = postData[i] = {};
                newItem.id = rowIds[i];
                const params = State.parameters[table];
                const paramKeys = Object.keys(params);
                for (let j = 0; j < paramKeys.length; j++) {
                    const key = paramKeys[j];
                    const param = params[key];
                    const column = param.columnName;
                    if (param.isForeign) continue;
                    newItem[column] = v.data[column] || item[column];
                    if (isEdit) {
                        hasChanged = v.data[column] !== item[column];
                    } else if (param.updating === "ref") {
                        hasChanged = v.data[column] >= 0 || hasChanged;
                    } else if (param.updating === "text") {
                        hasChanged = v.data[column] || hasChanged;
                    }
                }
            }
            if (!hasChanged) {
                Comps.setError();
                Comps.showModal("Error", ["No fields have been changed."], () => {});
                return;
            }
            modalMsg = isEdit ? [Util.capitalise(table) + " updated."] 
                : ["Multiple " + table + "s updated."];
        }
        Comps.setLoading();
        const onComplete = (success) => {
            updateSelections([]);
            Ui.updateTable();
            if (success) {
                Comps.setFinished();
            } else {
                Comps.setError();
            }
        }
        if (isAdd) {
            Data.add(table, postData, (success) => {
                Comps.showModal("Success", modalMsg, onComplete);
            });
        } else {
            Data.edit(table, postData, (success) => {
                Comps.showModal("Success", modalMsg, onComplete);
            });
        }
        State.updateRowIds([]);
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
        $("#tableHeading").html(Util.capitalise(State.toCommit.currentTable));
        swap("#sectionTable", "#sectionRow");
        swap("#actionsBasic", "#actions");
        Ui.updateCategory();
        Ui.updateSearch();
        Ui.updateSort();
        Ui.updateFilter();
        Ui.updateFields();
        Ui.updateTheme();
    }

    Ui.updateRow = () => {
        const ids = State.toCommit.currentRowIds;
        let heading = "";
        if (ids.length > 1) {
            heading = "Batch edit";
        } else if (ids.length > 0) {
            heading = "Edit";
        } else {
            heading = "Add " + State.toCommit.currentTable;
        }
        $("#rowHeading").html(heading);
        swap("#sectionRow", "#sectionTable");
        swap("#actions", "#actionsBasic");
        Ui.updateRowFields();
    }

    Ui.updateRowFields = () => {
        updating = true;
        allowBasicStateChange = false;
        const table = State.toCommit.currentTable;
        const ids = State.toCommit.currentRowIds;
        const isAdd = !ids.length;
        const isEdit = ids.length === 1;
        const isBatch = ids.length > 1;
        const data = isAdd ? false : Data.getSingle(table, ids[0]);
        switch(table) {
            case "personnel":
                $("#inpRowFirstNameRoot").show();
                $("#inpRowLastNameRoot").show();
                $("#inpRowJobTitleRoot").show();
                $("#inpRowEmailRoot").show();
                $("#selRowDepartmentRoot").show();
                $("#inpRowNameRoot").hide();
                $("#selRowLocationRoot").hide();

                $("#inpRowFirstName").val(isEdit ? data.firstName : "")
                    .prop("placeholder", !isBatch ? "" : "Existing");
                $("#inpRowLastName").val(isEdit ? data.lastName : "")
                    .prop("placeholder", !isBatch ? "" : "Existing");
                $("#inpRowJobTitle").val(isEdit ? data.jobTitle : "")
                    .prop("placeholder", !isBatch ? "" : "Existing");
                $("#inpRowEmail").val(isEdit ? data.email : "")
                    .prop("placeholder", !isBatch ? "" : "Existing");
                $("#selRowDepartment")
                    .html((isAdd ? getEmptyOption(true) : "")
                        + getSelectOptionsByRef(isEdit ? [data.department] : [], "department", Data.getFullList(table)))
                    .val(isEdit ? data.department : "")
                    .trigger("change");
                break;
            case "department":
                $("#inpRowFirstNameRoot").hide();
                $("#inpRowLastNameRoot").hide();
                $("#inpRowJobTitleRoot").hide();
                $("#inpRowEmailRoot").hide();
                $("#selRowDepartmentRoot").hide();
                $("#inpRowNameRoot").show();
                $("#selRowLocationRoot").show();
                
                $("#inpRowName").val(isEdit ? data.name : "")
                    .prop("placeholder", !isBatch ? "" : "Existing");
                $("#selRowLocation")
                    .html((isAdd ? getEmptyOption(true) : "")
                        + getSelectOptionsByRef(isEdit ? [data.location] : [], "location", Data.getFullList(table)))
                    .val(isEdit ? data.location : "")
                    .trigger("change");
                break;
            case "location":
                $("#inpRowFirstNameRoot").hide();
                $("#inpRowLastNameRoot").hide();
                $("#inpRowJobTitleRoot").hide();
                $("#inpRowEmailRoot").hide();
                $("#selRowDepartmentRoot").hide();
                $("#inpRowNameRoot").show();
                $("#selRowLocationRoot").hide();
                
                $("#inpRowName").val(isEdit ? data.name : "")
                    .prop("placeholder", !isBatch ? "" : "Existing");
                break;
            default:
                throw new Error("invalid section");
        }
        $("#btnBack").show();
        $("#btnEdit").hide();
        $("#btnEditBatch").hide();
        $("#btnSelectAll").hide();
        $("#btnDelete").hide();
        $("#btnReset").show();
        $("#btnSave").show();
        updating = false;
        allowBasicStateChange = true;
    }
    
    Ui.updateCategory = () => {
        updating = true;
        allowBasicStateChange = false;
        console.log("updateCategory");
        const table = State.toCommit.currentTable;
        const cat = State.toCommit[table].category;
        const fieldParams = State.parameters[table];
        $("#selCategory").html(getSelectOptionsByParams(fieldParams, [cat]))
            .trigger("change")
            .prop("disabled", Object.keys(fieldParams).length < 2);
        updating = false;
        allowBasicStateChange = true;
    }
    
    Ui.updateSort = () => {
        updating = true;
        allowBasicStateChange = false;
        console.log("updateSort");
        const table = State.toCommit.currentTable;
        const sort = State.toCommit[table].sort;
        const fieldParams = State.parameters[table];
        const isAscA = sort.primary.direction !== "desc";
        const isAscB = sort.secondary.direction !== "desc";
        const catA = sort.primary.category;
        const catB = sort.secondary.category;
        $("#btnSort")
            .data("is-on", !isAscA)
            .trigger("click");
        $("#selSortCategoryA")
            .html(getSelectOptionsByParams(fieldParams, [catA]))
            .trigger("change");
        $("#btnSortDirectionA")
            .data("is-on", !isAscA)
            .trigger("click");
        $("#selSortCategoryB")
            .html(getEmptyOption(!catB)
                + getSelectOptionsByParams(fieldParams, catB ? [catB] : []))
            .trigger("change");
        $("#btnSortDirectionB")
            .data("is-on", !isAscB)
            .trigger("click")
            .prop("disabled", !catB);
        updating = false;
        allowBasicStateChange = true;
    }
    
    Ui.updateSearch = () => {
        updating = true;
        allowBasicStateChange = false;
        console.log("updateSearch");
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
            const selectOptionsCat = getEmptyOption(isEmpty) 
                + getSelectOptionsByParams(fieldParams, isEmpty ? [] : [key]);
            $("#selSearchCategory" + suffix).html(selectOptionsCat)
                .trigger("change");
            $("#btnSearchRule" + suffix).data("is-on", rule === "exclusive")
                .trigger("click")
                .prop("disabled", isEmpty);
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
    
    Ui.updateFilter = () => {
        updating = true;
        allowBasicStateChange = false;
        console.log("updateFilter");
        const table = State.toCommit.currentTable;
        const fieldParams = State.parameters[table];
        const filter = State.toCommit[table].filter;
        const incKeys = Object.keys(filter.inclusive);
        const excKeys = Object.keys(filter.exclusive);
        for (let i = 0; i < 4; i++) {
            const key = incKeys[i] || excKeys[i - incKeys.length];
            let rule = incKeys[i] ? "inclusive" : "exclusive";
            const suffix = String.fromCharCode(65 + i);
            const values = filter[rule][key] || [];
            const isEmpty = !key || key === "none";
            const valuesType = isEmpty ? "" : fieldParams[key].filterAdv;
            const selectOptionsCat = getEmptyOption(isEmpty) 
                + getSelectOptionsByParams(fieldParams, isEmpty ? [] : [key]);
            let selectOptionsValues = getEmptyOption(!values.length);
            if (valuesType === "existingRef") {
                selectOptionsValues += getSelectOptionsByRef(values, key, Data.getFullList(table));
            } else if (valuesType === "existingFirstChar") {
                selectOptionsValues += getSelectOptionsByChar(values, key, Data.getFullList(table));
            }
            $("#selFilterCategory" + suffix)
                .html(selectOptionsCat)
                .trigger("change");
            $("#btnFilterRule" + suffix)
                .data("is-on", rule === "exclusive")
                .trigger("click")
                .prop("disabled", isEmpty);
            $("#selFilterValues" + suffix)
                .html(selectOptionsValues)
                .trigger("change")
                .prop("disabled", isEmpty);
            if (i === 0) {
                $("#selFilter").html(selectOptionsValues)
                    .trigger("change");
            }
        }
        updating = false;
        allowBasicStateChange = true;
    }

    Ui.updateFields = () => {
        updating = true;
        allowBasicStateChange = false;
        console.log("updateFields");
        $("#btnFieldJobTitle, #btnFieldDepartment, #btnFieldLocation, #btnFieldEmail, #btnFieldName").hide();
        const options = State.toCommit[State.toCommit.currentTable];
        const fields = Object.keys(options.displayFields);
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            const o = options.displayFields[field];
            switch(field) {
                case "jobTitle":
                    $("#btnFieldJobTitle").data("is-on", !o).trigger("click").show();
                    break;
                case "department":
                    $("#btnFieldDepartment").data("is-on", !o).trigger("click").show();
                    break;
                case "location":
                    $("#btnFieldLocation").data("is-on", !o).trigger("click").show();
                    break;
                case "email":
                    $("#btnFieldEmail").data("is-on", !o).trigger("click").show();
                    break;
                case "name":
                    $("#btnFieldName").data("is-on", !o).trigger("click").show();
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
        $("#btnTheme").data("is-on", State.toCommit.theme !== "dark")
            .trigger("click");
        $(":root").removeClass("lightTheme");
        if (State.toCommit.theme === "light") {
            $(":root").addClass("lightTheme");
        }
        updating = false;
        allowBasicStateChange = true;
    }
    
    const getSelectOptionsByParams = (fieldParams = {}, selectedKeys = []) => {
        const keys = Object.keys(fieldParams);
        let str = "";
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const field = State.parameters[State.toCommit.currentTable][key];
            let selected = "";
            if (field.categorised) {
                for (let i = 0; i < selectedKeys.length; i++) {
                    const k = selectedKeys[i];
                    if (k === key) {
                        selected = " selected";
                        break;
                    }
                }
                str += "<option"+selected+" value=\""+key+"\">"+field.display+"</option>";
            }
        }
        return str;
    }
    
    const getSelectOptionsByChar = (selectedKeys = [], category = "", list = []) => {
        let str = "";
        const uniqueFirstChars = Util.mapUnique(list, i => i[category].substr(0, 1).toUpperCase()).sort();
    
        for (let i = 0; i < uniqueFirstChars.length; i++) {
            const firstChar = uniqueFirstChars[i];
            let selected = "";
            for (let j = 0; j < selectedKeys.length; j++) {
                const key = selectedKeys[j];
                if (key === firstChar) {
                    selected = " selected";
                    break;
                }
            }
            str += "<option"+selected+">"+firstChar+"</option>";
        }
        return str;
    }
    
    const getSelectOptionsByRef = (selectedKeys = [], category = "", list = []) => {
        let str = "";
        const uniqueRefs = Util.mapUnique(list, i => i[category]).sort();
    
        for (let i = 0; i < uniqueRefs.length; i++) {
            const ref = uniqueRefs[i];
            let selected = "";
            let id = "";
            for (let j = 0; j < selectedKeys.length; j++) {
                const key = selectedKeys[j];
                if (key === ref) {
                    selected = " selected";
                    id = key;
                    break;
                }
            }
            str += "<option"+selected+">"+ref+"</option>";
        }
        return str;
    }

    const getSearchString = (obj = {}) => {
        const keys = Object.keys(obj);
        let str = "";
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const o = obj[key];
            if (!Array.isArray(o)) {
                throw new Error("value should be array");
            }
            for (let j = 0; j < o.length; j++) {
                str += o[j] + " ";
            }
        }
        return str;
    }
    
    const swap = (target = "", current = "") => {
        const speed = $(":root").css("--fast");
        $(current).fadeOut(speed, "swing", () => {
            $(target).fadeIn(speed);
        });
    }
    
}(window.Ui = window.Ui || {}, jQuery));