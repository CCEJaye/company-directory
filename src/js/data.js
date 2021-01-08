
(function (Data, $) {

    const rawData = {
        personnel: {}, department: {}, location: {}
    }
    const lists = {
        personnel: { original: [], altered: [] },
        department: { original: [], altered: [] },
        location: { original: [], altered: [] }
    }

    Data.getList = (table = "") => {
        switch (table) {
            case "personnel":
                return lists.personnel.altered;
            case "department":
                return lists.department.altered;
            case "location":
                return lists.location.altered;
            default:
                throw new Error("table does not exist");
        }
    }

    Data.getFullList = (table = "") => {
        switch (table) {
            case "personnel":
                return lists.personnel.original;
            case "department":
                return lists.department.original;
            case "location":
                return lists.location.original;
            default:
                throw new Error("table does not exist");
        }
    }

    Data.getSingle = (table = "", id = "") => {
        const data = Data.getFullList(table);
        for (let i = 0; i < data.length; i++) {
            if (data[i].id == id) return data[i];
        }
        return;
    }

    Data.getWhere = (table = "", searchKey = "", searchValue = "", returnKey = "") => {
        const list = Data.getFullList(table);
        for (let i = 0; i < list.length; i++) {
            if (list[i][searchKey] === searchValue) return list[i][returnKey];
        }
        return -1;
    }

    Data.regenerateLists = (sortList = false) => {
        Data.regenerateList("location", sortList);
        Data.regenerateList("department", sortList);
        Data.regenerateList("personnel", sortList);
    }

    Data.regenerateList = (table = "", sortList = false) => {
        let list = [];
        const tableData = rawData[table];
        const keys = Object.keys(tableData);
        for (let i = 0; i < keys.length; i++) {
            list.push(Util.copyObj(tableData[keys[i]]));
        }
        lists[table].original = list;
        if (sortList) {
            applyListOptions(table);
        }
    }

    const applyListOptions = (table = "") => {
        lists[table].altered = sortList(searchList(filterList(lists[table].original)), table);
    }

    const filterList = (list = []) => {
        return filter(list, "filter");
    }

    const searchList = (list = []) => {
        return filter(list, "search");
    }

    const filter = (list = [], filterOrSearch = "filter") => {
        const table = State.all.currentTable;
        const options = State.all[table];
        const newList = [];
        const isFilter = filterOrSearch === "filter";
        const excKeys = Object.keys(options[filterOrSearch].exclusive);
        const incKeys = Object.keys(options[filterOrSearch].inclusive);
        for (let i = 0; i < list.length; i++) {
            const o = list[i];
            let isExcluded = false;
            loop: for (let j = 0; j < excKeys.length; j++) {
                const category = excKeys[j];
                if (category === "none") continue;
                const values = options[filterOrSearch].exclusive[category];
                for (let k = 0; k < values.length; k++) {
                    const matched = isFilter 
                        ? o[category].toLowerCase() === values[k].toLowerCase()
                        : o[category].toLowerCase().includes(values[k].toLowerCase());
                    if (matched) {
                        isExcluded = true;
                        break loop;
                    }
                }
            }
            if (isExcluded) continue;
            if (incKeys.length) {
                loop2: for (let j = 0; j < incKeys.length; j++) {
                    const category = incKeys[j];
                    const values = options[filterOrSearch].inclusive[category];
                    if (category === "none") {
                        continue;
                    }
                    if (!values.length) {
                        newList.push(o);
                        break;
                    }
                    for (let k = 0; k < values.length; k++) {
                        const matched = isFilter 
                            ? o[category].toLowerCase() === values[k].toLowerCase()
                            : o[category].toLowerCase().includes(values[k].toLowerCase());
                        if (matched) {
                            newList.push(o);
                            break loop2;
                        }
                    }
                }       
            } else {
                newList.push(o);
            }
        }
        console.log("filter", newList);
        return newList;
    }

    const sortList = (list = [], table = "") => {
        const options = State.all[table];
        const catA = Util.safeSet(() => options.sort.primary.category);
        const dirA = Util.safeSet(() => options.sort.primary.direction);
        const catB = Util.safeSet(() => options.sort.secondary.category);
        const dirB = Util.safeSet(() => options.sort.secondary.direction);
        if (!catA || !dirA) return list;
        list.sort((p, q) => {
            const primaryValue = getComparison(p, q, dirA === "asc", catA);
            if (!catB || catB === "none" || !dirB || primaryValue !== 0) return primaryValue;
            return getComparison(p, q, dirB === "asc", catB);
        });
        console.log("sorted", list);
        return list;
    }

    const getComparison = (p = {}, q = {}, asc = true, key = "") => {
        const compA = asc ? p[key].toLowerCase() : q[key].toLowerCase();
        const compB = asc ? q[key].toLowerCase() : p[key].toLowerCase();
        if (compA < compB) return -1;
        if (compA > compB) return 1;
        return 0;
    }









    Data.getAll = (onComplete = (success = true) => {}) => {
        const h = new Util.Handler(["location", "department", "personnel"], [
                getFunc("allLocation"),
                getFunc("allDepartment"),
                getFunc("allPersonnel")
            ],
            (results) => {
                onComplete(harvest(results, true, true, true));
            }
        );
        h.execute();
    }

    Data.add = (table = "", data = {}, onComplete = (success = true) => {}) => {
        switch(table) {
            case "personnel":
                return Data.addPersonnel(data, onComplete);
            case "department":
                return Data.addDepartment(data, onComplete);
            case "location":
                return Data.addLocation(data, onComplete);
        }
    }

    Data.edit = (table = "", data = {}, onComplete = (success = true) => {}) => {
        switch(table) {
            case "personnel":
                return Data.editPersonnel(data, onComplete);
            case "department":
                return Data.editDepartment(data, onComplete);
            case "location":
                return Data.editLocation(data, onComplete);
        }
    }

    Data.delete = (table = "", ids = [0], onComplete = (success = true) => {}) => {
        switch(table) {
            case "personnel":
                return Data.deletePersonnel(ids, onComplete);
            case "department":
                return Data.deleteDepartment(ids, onComplete);
            case "location":
                return Data.deleteLocation(ids, onComplete);
        }
    }

    const getIdArgs = (ids = [0]) => {
        const args = {};
        for (let i = 0; i < ids.length; i++) {
            args[i] = { "id": ids[i] };
        }
        return args;
    }

    Data.getPersonnel = (ids = [0], onComplete = (success = true) => {}) => {
        const h = new Util.Handler(["location", "department", "personnel"], [
                getFunc("allLocation"),
                getFunc("allDepartment"),
                getFunc("getPersonnel", getIdArgs(ids))
            ],
            (results) => {
                onComplete(harvest(results, true, true, false));
            }
        );
        h.execute();
    }

    Data.addPersonnel = (data = {}, onComplete = () => {}) => {
        const h = new Util.Handler(["personnel"], [
                postFunc("addPersonnel", data)
            ],
            (results) => {
                onComplete(true);
            }
        );
        h.execute();
    }

    Data.editPersonnel = (data = {}, onComplete = () => {}) => {
        const h = new Util.Handler(["personnel"], [
                postFunc("editPersonnel", data)
            ],
            (results) => {
                onComplete(true);
            }
        );
        h.execute();
    }

    Data.deletePersonnel = (ids = [0], onComplete = () => {}) => {
        const h = new Util.Handler(["personnel"], [
                postFunc("deletePersonnel", getIdArgs(ids))
            ],
            (results) => {
                onComplete(true);
            }
        );
        h.execute();
    }

    Data.getDepartment = (ids = [0], onComplete = (success = true) => {}) => {
        const h = new Util.Handler(["location", "department"], [
                getFunc("allLocation"),
                getFunc("getDepartment", getIdArgs(ids))
            ],
            (results) => {
                onComplete(harvest(results, true, false, false));
            }
        );
        h.execute();
    }

    Data.addDepartment = (data = {}, onComplete = () => {}) => {
        const h = new Util.Handler(["department"], [
                postFunc("addDepartment", data)
            ],
            (results) => {
                onComplete(true);
            }
        );
        h.execute();
    }

    Data.editDepartment = (data = {}, onComplete = () => {}) => {
        const h = new Util.Handler(["department"], [
                postFunc("editDepartment", data)
            ],
            (results) => {
                onComplete(true);
            }
        );
        h.execute();
    }

    Data.deleteDepartment = (ids = [0], onComplete = () => {}) => {
        const h = new Util.Handler(["department"], [
                postFunc("deleteDepartment", getIdArgs(ids))
            ],
            (results) => {
                onComplete(true);
            }
        );
        h.execute();
    }

    Data.getLocation = (ids = [0], onComplete = (success = true) => {}) => {
        const h = new Util.Handler(["location"], [
                getFunc("getLocation", getIdArgs(ids))
            ],
            (results) => {
                onComplete(harvest(results, false, false, false));
            }
        );
        h.execute();
    }

    Data.addLocation = (data = {}, onComplete = () => {}) => {
        const h = new Util.Handler(["location"], [
                postFunc("addLocation", data)
            ],
            (results) => {
                onComplete(true);
            }
        );
        h.execute();
    }

    Data.editLocation = (data = {}, onComplete = () => {}) => {
        const h = new Util.Handler(["location"], [
                postFunc("editLocation", data)
            ],
            (results) => {
                onComplete(true);
            }
        );
        h.execute();
    }

    Data.deleteLocation = (ids = [0], onComplete = () => {}) => {
        const h = new Util.Handler(["location"], [
                postFunc("deleteLocation", getIdArgs(ids))
            ],
            (results) => {
                onComplete(true);
            }
        );
        h.execute();
    }

    const getFunc = (type = "", params = {}) => {
        return async () => Util.ajaxGet("php/request.php", {type: type, params: params});
    }

    const postFunc = (type = "", params = {}) => {
        return async () => Util.ajaxPost("php/request.php", {type: type, params: params});
    }

    const harvest = (results = {}, overwriteLocation = true, overwriteDepartment = true, overwritePersonnel = true) => {
        let success = true;

        const locationError = Util.safeSet(() => results.location.error);
        const location = Util.safeSet(() => results.location.data);
        if (locationError || !location) {
            success = false;
        } else {
            for (let i = 0; i < location.data.length; i++) {
                const o = location.data[i];
                if (!o.success) {
                    success = false;
                    continue;
                }
                if (overwriteLocation) {
                    rawData.location = harvestLocation(o.results);
                } else {
                    Object.assign(rawData.location, harvestLocation(o.results));
                }
            }
        }

        const departmentError = Util.safeSet(() => results.department.error);
        const department = Util.safeSet(() => results.department.data);
        if (departmentError || !department) {
            success = false;
        } else {
            for (let i = 0; i < department.data.length; i++) {
                const o = department.data[i];
                if (!o.success) {
                    success = false;
                    continue;
                }
                if (overwriteDepartment) {
                    rawData.department = harvestDepartment(o.results);
                } else {
                    Object.assign(rawData.department, harvestDepartment(o.results));
                }
            }
        }

        const personnelError = Util.safeSet(() => results.personnel.error);
        const personnel = Util.safeSet(() => results.personnel.data);
        if (personnelError || !personnel) {
            success = false;
        } else {
            for (let i = 0; i < personnel.data.length; i++) {
                const o = personnel.data[i];
                if (!o.success) {
                    success = false;
                    continue;
                }
                if (overwritePersonnel) {
                    rawData.personnel = harvestPersonnel(o.results);
                } else {
                    Object.assign(rawData.personnel, harvestPersonnel(o.results));
                }
            }
        }
        return success;
    }

    const harvestLocation = (results = []) => {
        const data = {};
        for (let i = 0; i < results.length; i++) {
            const r = results[i];
            data[r.id] = r;
        }
        return data;
    }

    const harvestDepartment = (results = []) => {
        const data = {};
        for (let i = 0; i < results.length; i++) {
            const r = results[i];
            r.location = Util.safeSet(() => rawData.location[r.locationID].name);
            data[r.id] = r;
        }
        return data;
    }

    const harvestPersonnel = (results = []) => {
        const data = {};
        for (let i = 0; i < results.length; i++) {
            const r = results[i];
            const dep = Util.safeSet(() => rawData.department[r.departmentID]);
            const loc = Util.safeSet(() => rawData.location[dep.locationID]);
            r.fullName = r.firstName + " " + r.lastName;
            r.department = Util.safeSet(() => dep.name);
            r.locationID = Util.safeSet(() => dep.locationID);
            r.location = Util.safeSet(() => loc.name);
            data[r.id] = r;
        }
        return data;
    }

}(window.Data = window.Data || {}, jQuery));