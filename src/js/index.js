

$(window).on("load", () => {
    // get all data
    // load state
    // apply data and state to UI
    // populate

    Comps.setLoading();
    State.load();
    Menu.init();
    Comps.init();
    Data.getAll((success) => {
        if (!success) {
            Components.setError();
            throw new Error("unhandled error");
        }
        Data.regenerateLists(true);
        Ui.init();
        Ui.populate();
        Ui.applyFields();
        Comps.setFinished();
    });
});