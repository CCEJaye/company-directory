(function (Util, $) {
    

    
    Util.swap = (target = "", current = "", speedVar = "fast") => {
        const speed = Number.parseInt(Util.cssVar(speedVar));
        $(current).fadeOut(speed, "swing", () => {
            $(target).fadeIn(speed);
        });
    }

    Util.mapUnique = (list = [], fn = (i) => {}) => {
        const uniques = [];
        for (let i = 0; i < list.length; i++) {
            const value = fn(list[i]);
            if (uniques.includes(value)) continue;
            uniques.push(value);
        }
        return uniques;
    }

    Storage.prototype.setObject = function (key, value) {
        this.setItem(key, JSON.stringify(value));
    }

    Storage.prototype.getObject = function (key) {
        let value = this.getItem(key);
        return value && JSON.parse(value);
    }

    Util.capitalise = (str = "") => str.charAt(0).toUpperCase() + str.slice(1);

    Util.save = (key = "", obj = {}) => {
        localStorage.setObject(key, obj);
    }

    Util.load = (key = "") => {
        return localStorage.getObject(key);
    }

    Util.cssVar = (name = "") => $(":root").css("--" + name);

    /*
    Takes an array of async functions to be run simultaneously
    Results of all functions are associated into an object based on the given function names
    The object is given as an argument to a callback function once all async functions are complete
    */
    Util.Handler = class Handler {
        constructor(names = [""], fns = [async () => {}], onComplete = (data = {}) => {}) {
            this.names = names;
            this.onComplete = onComplete;
            this.data = {};
            this.count = fns.length;
            for (let i = 0; i < this.count; i++) {
                const d = this.data[i] = {};
                d.fn = fns[i];
                d.complete = false;
                d.result = {};
            }
        }

        execute() {
            for (let i = 0; i < this.count; i++) {
                this.data[i].fn().then((data) => this.check(i, data));
            }
        }

        check(id, data = {}) {
            const status = this.data[id];
            status.complete = true;
            status.result = data;

            let finished = true;
            let res = {};
            for (let i = 0; i < this.count; i++) {
                const d = this.data[i];
                if (!d.complete) {
                    finished = false;
                    break;
                } else {
                    res[this.names[i]] = d.result;
                }
            }

            if (finished) {
                this.onComplete(res);
            }
        }
    }

    /*
    Replacement for optional chaining and null coalescing
    */
    Util.safeSet = (tryFunction = () => {}, def = "") => {
        try {
            return tryFunction();
        } catch(e) {
            return def;
        }
    }

    Util.arrayRemove = (arr = [], value) => {
        let i = arr.indexOf(value);
        return i < 0 ? arr : arr.slice(0, i).concat(arr.slice(i + 1));
    };

    Util.copyObj = (source) => JSON.parse(JSON.stringify(source));
    
    Util.wait = () => new Promise(r => setTimeout(r, 100));

    /*
    Travels through a pair of nested objects and counts the number of values
    OR objects that are different, don't exist, or have different keys
    */    
    Util.countDifferences = (obj1 = {}, obj2 = {}, exitIfAnyFound = false) => {
        let changes = 0;
        const isArray1 = Array.isArray(obj1);
        const isArray2 = Array.isArray(obj2);
        const isObj1 = !isArray1 && typeof obj1 === "object";
        const isObj2 = !isArray2 && typeof obj2 === "object";
        if (isArray1 && isArray2) {
            const longObj = obj1.length > obj2.length ? obj1 : obj2;
            const shortObj = obj1.length > obj2.length ? obj2 : obj1;
            if (longObj.length) {
                for (let i = 0; i < longObj.length; i++) {
                    const oA = longObj[i];
                    const oB = Util.safeSet(() => shortObj[i]);
                    changes += Util.countDifferences(oA, oB, exitIfAnyFound);
                    if (exitIfAnyFound && changes > 0) break;
                }
            }
        } else if (isObj1 && isObj2) {
            const keys1 = Object.keys(obj1);
            const keys2 = Object.keys(obj2);
            const uniqueKeys = Util.mapUnique(keys1.concat(keys2), (i) => i);
            if (uniqueKeys.length) {
                for (let i = 0; i < uniqueKeys.length; i++) {
                    const oA = Util.safeSet(() => obj1[uniqueKeys[i]]);
                    const oB = Util.safeSet(() => obj2[uniqueKeys[i]]);
                    changes += Util.countDifferences(oA, oB, exitIfAnyFound);
                    if (exitIfAnyFound && changes > 0) break;
                }
            }
        } else if (obj1 !== obj2) {
            changes++;
        }
        return changes;
    }

    Util.has = (obj = {}, truthFn = (i) => {}) => {
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (truthFn(obj[key])) return key;
        }
        return false;
    }

    Util.ajaxPost = async (url = "", data = {}) => {
        return await $.ajax({
            url: url,
            dataType: "json",
            type: "post",
            data: data,
            success: (result) => {
                return {data: result, error: false};
            },
            error: (jqXHR, textStatus, errorThrown) => {
                return {data: textStatus, error: true};
            }
        });
    }

    Util.ajaxGet = async (url = "", data = {}) => {
        let r;
        await $.ajax({
            url: url,
            dataType: "json",
            data: data,
            success: (result) => {
                r = {data: result, error: false};
            },
            error: (jqXHR, textStatus, errorThrown) => {
                r = {data: textStatus, error: true};
            }
        });
        return r;
    }

    Util.pushUnique = (arr1 = [], arr2 = []) => {
        for (let i = 0; i < arr2.length; i++) {
            const val = arr2[i];
            if (arr1.includes(val)) continue;
            arr1.push(val);
        }
    }

    Util.rem = value => {
        const unit = $("html").css("font-size");
        if (typeof value !== "undefined" && value > 0) {
            return parseInt(unit) * value;
        } else {
            return parseInt(unit);
        }
    }

}(window.Util = window.Util || {}, jQuery));