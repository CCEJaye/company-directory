(function (Generate, $) {
    
    
    
    Generate.selectOptionsByExistingRef = (category = "", list = []) => {
        let str = "";
        const uniqueRefs = Util.mapUnique(list, i => i[category]).sort();
        for (let i = 0; i < uniqueRefs.length; i++) {
            str += "<option>"+uniqueRefs[i]+"</option>";
        }
        return str;
    }
    
    Generate.selectOptionsByChar = (category = "", list = []) => {
        let str = "";
        const uniqueFirstChars = Util.mapUnique(list, i => i[category].substr(0, 1).toUpperCase()).sort();
        for (let i = 0; i < uniqueFirstChars.length; i++) {
            str += "<option>"+uniqueFirstChars[i]+"</option>";
        }
        return str;
    }
    
    Generate.selectOptionsByParams = (fieldParams = {}) => {
        const keys = Object.keys(fieldParams);
        const table = State.toCommit.currentTable;
        let str = "";
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const field = State.parameters[table][key];
            if (field.categorised) {
                str += `<option value="`+key+`">`+field.display+`</option>`;
            }
        }
        return str;
    }

    Generate.validateText = (value = "", param = {}, table = "", key = "", blankIsError = true, itemIds = []) => {
        const errs = [];
        if (blankIsError && !value.trim().length) {
            errs.push(param.display + " cannot be empty.");
        }
        if (value.length > 50) {
            errs.push(param.display + " cannot be longer than 50 characters.");
        }
        if (param.isUnique && Data.getWhere(table, key, value, "id", itemIds) > -1) {
            errs.push(param.display + " already exists.");
        }
        return errs;
    }

    Generate.validateRef = (value = "", param = {}, table = "", key = "", blankIsError = true, itemIds = []) => {
        const errs = [];
        if (blankIsError && value === -1) {
            errs.push(param.display + " is invalid.");
        }
        if (param.isUnique && Data.getWhere(table, key, value, "id", itemIds) > -1) {
            errs.push(param.display + " already exists.");
        }
        return errs;
    }

    Generate.emptyOption = () => {
        return `<option value="none">None</option>`;
    }

    Generate.sortData = () => {
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

    Generate.filterData = () => {
        const data = { inclusive: {}, exclusive: {}};
        for (let i = 0; i < 4; i++) {
            const char = String.fromCharCode(65 + i);
            const cat = $("#selFilterCategory" + char).val();
            const rule = $("#btnFilterRule" + char).data("is-on") ? "inclusive" : "exclusive";
            let values = $("#selFilterValues" + char).val();
            if (!values || (values.length === 1 && values[0] === "none")) values = [];
            if (!cat || cat === "none" || !values) continue;
            data[rule][cat] = values;
        }
        return data;
    }

    Generate.searchData = () => {
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

    Generate.fieldData = () => {
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

    Generate.itemSection = (param = {}, id = "", value = "") => {
        const strs = [];
        strs.push(`<` + param.tag + ` id="itemId-` + id + `" class="tBody pT">`);
        strs.push(`<svg class="icon mini mR"><use xlink:href="img/icons.svg` + param.icon + `"></use></svg>`);
        strs.push(value + `</`+param.tag+`>`);
        return strs.join("");
    }

    Generate.list = () => {
        const htmlStrs = [];
        const table = State.all.currentTable;
        const list = Data.getList(table);
        const params = State.items[table];
        const paramKeys = Object.keys(params);
        const badgeCat = Util.has(params, i => i.isHeading);
        const headerCat = State.all[table].category;
        const fieldParams = State.parameters[table];
        const headerType = fieldParams[headerCat].categorised;
        let currentHeader = headerType === "firstChar" ? "" : -1;
        for (let i = 0 ; i < list.length; i++) {
            const item = list[i];
            const badgeVals = item[badgeCat].split(" ");
            const badgeVal = badgeVals.length > 1 
                ? badgeVals[0].substr(0, 1) + badgeVals[1].substr(0, 1)
                : badgeVals[0].substr(0, 2);
            const headerValThis = headerType === "firstChar" 
                ? item[headerCat].substr(0, 1).toUpperCase()
                : item[fieldParams[headerCat].columnName];
            if (headerValThis !== currentHeader) {
                currentHeader = headerValThis;
                htmlStrs.push(`<li class="tHeading6 listHeader">` + (headerType === "firstChar" ? currentHeader : item[headerCat]) + `</li>`);
            }
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
                    htmlStrs.push(Generate.itemSection(params[p], p + i, item[p]));
                }
            }
            htmlStrs.push("</article></li>");
        }
        return htmlStrs.join("");
    }

    Generate.validation = (blankIsError = true, ids = []) => {
        const table = State.toCommit.currentTable;
        const params = State.parameters[table];
        const paramKeys = Object.keys(params);
        const data = {};
        let errs = [];
        for (let i = 0; i < paramKeys.length; i++) {
            const key = paramKeys[i];
            const param = params[key];
            const column = param.columnName;
            if (param.isForeign) continue;
            if (param.updating === "text") {
                data[column] = $(param.inputId).val();
                errs = errs.concat(Generate.validateText(data[column], param, table, key, blankIsError, ids));
            } else if (param.updating === "ref") {
                data[column] = Data.getWhere(key, "name", $(param.inputId).val(), "id");
                errs = errs.concat(Generate.validateRef(data[column], param, table, key, blankIsError, ids));
            }
        }
        return { errors: errs, data: data };
    }

}(window.Generate = window.Generate || {}, jQuery));