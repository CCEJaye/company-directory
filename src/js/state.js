(function (State, $) {

    /*
        State.all is the default and saved state, accessed to apply to lists
        State.toCommit is the temporary state, accessed by the ui
    */
    State.all = {
        version: "1.0.0",
        personnel: {
            category: "department",
            filter: { inclusive: { department: [] }, exclusive: {} },
            search: { inclusive: { firstName: [] }, exclusive: {} },
            sort: {
                primary: { category: "department", direction: "asc" },
                secondary: { category: "firstName", direction: "asc" }
            },
            displayFields: {
                jobTitle: true,
                department: false,
                location: false,
                email: true
            }
        },
        department: {
            category: "location",
            filter: { inclusive: { location: [] }, exclusive: {}},
            search: { inclusive: { name: [] }, exclusive: {}},
            sort: {
                primary: { category: "location", direction: "asc" },
                secondary: { category: "name", direction: "asc" }
            },
            displayFields: {
                location: true
            }
        },
        location: {
            category: "name",
            filter: { inclusive: { name: [] }, exclusive: {}},
            search: { inclusive: { name: [] }, exclusive: {}},
            sort: {
                primary: { category: "name", direction: "asc" },
                secondary: { category: "none", direction: "asc" }
            },
            displayFields: {}
        },
        theme: "dark",
        currentSection: "table",
        currentTable: "personnel",
        tutorial: true
    }

    State.parameters = {
        personnel: {
            firstName: {
                updating: "text",
                filterAdv: "existingRef",
                categorised: "firstChar",
                display: "First name",
                isForeign: false,
                inputId: "#inpRowFirstName",
                isUnique: false,
                columnName: "firstName"
            },
            lastName: {
                updating: "text",
                filterAdv: "existingRef",
                categorised: "firstChar",
                display: "Last name",
                isForeign: false,
                inputId: "#inpRowLastName",
                isUnique: false,
                columnName: "lastName"
            },
            jobTitle: {
                updating: "text",
                filterAdv: "existingRef",
                categorised: "ref",
                display: "Job title",
                isForeign: false,
                inputId: "#inpRowJobTitle",
                isUnique: false,
                columnName: "jobTitle"
            },
            email: {
                updating: "text",
                filterAdv: "existingRef",
                categorised: "firstChar",
                display: "Email",
                isForeign: false,
                inputId: "#inpRowEmail",
                isUnique: false,
                columnName: "email"
            },
            department: {
                updating: "ref",
                filterAdv: "existingRef",
                categorised: "ref",
                display: "Department",
                isForeign: false,
                inputId: "#selRowDepartment",
                isUnique: false,
                columnName: "departmentID"
            },
            location: {
                updating: "ref",
                filterAdv: "existingRef",
                categorised: "ref",
                display: "Location",
                isForeign: true,
                inputId: "#selRowLocation",
                isUnique: false,
                columnName: "locationID"
            }
        },
        department: {
            name: {
                updating: "text",
                filterAdv: "existingRef",
                categorised: "firstChar",
                display: "Name",
                isForeign: false,
                inputId: "#inpRowName",
                isUnique: true,
                columnName: "name"
            },
            location: {
                updating: "ref",
                filterAdv: "existingRef",
                categorised: "firstChar",
                display: "Location",
                isForeign: false,
                inputId: "#selRowLocation",
                isUnique: false,
                columnName: "locationID"
            },
        },
        location: {
            name: {
                updating: "text",
                filterAdv: "existingRef",
                categorised: "firstChar",
                display: "Name",
                isForeign: false,
                inputId: "#inpRowName",
                isUnique: true,
                columnName: "name"
            }
        }
    }
    Object.freeze(State.parameters);
    State.items = {
        personnel: {
            fullName: {
                isHeading: true,
                icon: "",
                tag: ""
            },
            jobTitle: {
                isHeading: false,
                icon: "#job",
                tag: "p"
            },
            email: {
                isHeading: false,
                icon: "#email",
                tag: "address"
            },
            department: {
                isHeading: false,
                icon: "#department",
                tag: "p"
            },
            location: {
                isHeading: false,
                icon: "#marker",
                tag: "p"
            }
        },
        department: {
            name: {
                isHeading: true,
            },
            location: {
                isHeading: false,
                icon: "#marker",
                tag: "p"
            },
        },
        location: {
            name: {
                isHeading: true
            }
        }
    }
    Object.freeze(State.items);
    State.toCommit = {};

    State.revert = () => {
        if (!Util.countDifferences(State.all, State.toCommit, true)) {
            return false;
        }
        State.toCommit = Util.copyObj(State.all);
        return true;
    }

    State.load = () => {
        const state = Util.load("cd-state");
        if (state && state.version === "1.0.0") {
            State.all = state;
        }
        State.revert();
        return true;
    }

    State.commit = () => {
        if (!Util.countDifferences(State.all, State.toCommit, true)) {
            return false;
        }
        State.all = Util.copyObj(State.toCommit);
        Util.save("cd-state", State.all);
        State.onValidCommit();
        return true;
    }

    State.onValidCommit = () => {};

    State.resetSort = () => {
        const table = State.toCommit.currentTable;
        let def;
        switch (table) {
            case "personnel":
                def = {
                    primary: { category: "firstName", direction: "asc" },
                    secondary: { category: "none", direction: "asc" }
                }
                break;
            case "department":
            case "location":
                def = {
                    primary: { category: "name", direction: "asc" },
                    secondary: { category: "none", direction: "asc" }
                }
                break;
            default:
                throw new Error("invalid table name");
        }
        if (!Util.countDifferences(State.toCommit[table].sort, def, true)) {
            return false;
        }
        State.toCommit[table].sort = def;
        return true;
    }

    State.resetFilter = () => {
        const table = State.toCommit.currentTable;
        const def = { inclusive: {}, exclusive: {} };
        if (!Util.countDifferences(State.toCommit[table].filter, def, true)) {
            return false;
        }
        State.toCommit[table].filter = def;
        return true;
    }

    State.resetSearch = () => {
        const table = State.toCommit.currentTable;
        const def = { inclusive: {}, exclusive: {} };
        if (!Util.countDifferences(State.toCommit[table].search, def, true)) {
            return false;
        }
        State.toCommit[table].search = def;
        return true;
    }

    State.resetFields = () => {
        const table = State.toCommit.currentTable;
        let def;
        switch (table) {
            case "personnel":
                def = {
                    jobTitle: false,
                    department: false,
                    location: false,
                    email: false
                }
                break;
            case "department":
                def = {
                    location: false
                }
                break;
            case "location":
                return false;
            default:
                throw new Error("invalid table name");
        }
        if (!Util.countDifferences(State.toCommit[table].displayFields, def, true)) {
            return false;
        }
        State.toCommit[table].displayFields = def;
        return true;
    }

    State.updateTable = (table = "") => {
        if (State.toCommit.currentTable === table) return false;
        State.toCommit.currentTable = table;
        return true;
    }

    State.updateRow = (rows = []) => {
        if (State.toCommit.currentRowIds === rows) return false;
        State.toCommit.currentTable = rows;
        return true;
    }

    State.updateCategory = (category = "") => {
        const table = State.toCommit.currentTable;
        const options = State.toCommit[table];
        if (category === options.category) return false;
        options.category = category;
        return true;
    }

    State.updateSort = (data = {}) => {
        const table = State.toCommit.currentTable;
        const sort = State.toCommit[table].sort;
        if (!Util.countDifferences(sort, data, true)) return false;
        State.toCommit[table].sort = data;
        return true;
    }

    State.updateFilter = (data = {}) => {
        const table = State.toCommit.currentTable;
        const filter = State.toCommit[table].filter;
        if (!Util.countDifferences(filter, data, true)) return false;
        State.toCommit[table].filter = data;
        return true;
    }

    State.updateSearch = (data = {}) => {
        const table = State.toCommit.currentTable;
        const search = State.toCommit[table].search;
        if (!Util.countDifferences(search, data, true)) return false;
        State.toCommit[table].search = data;
        return true;
    }

    State.updateFields = (data = {}) => {
        const table = State.toCommit.currentTable;
        const fields = State.toCommit[table].displayFields;
        if (!Util.countDifferences(fields, data, true)) return false;
        State.toCommit[table].displayFields = data;
        return true;
    }

    State.updateTheme = (theme = "") => {
        if (State.toCommit.theme === theme) return false;
        State.toCommit.theme = theme;
        return true;
    }

    State.setTutorial = (set = true) => {
        State.toCommit.tutorial = set;
        State.all = Util.copyObj(State.toCommit);
        Util.save("cd-state", State.all);
    }

}(window.State = window.State || {}, jQuery));