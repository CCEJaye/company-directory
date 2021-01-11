$(window).on("load", () => {
    Comps.setLoading();
    State.load();
    Menu.init();
    Comps.init();
    Data.getAll((success) => {
        if (!success) {
            Components.setError();
            throw new Error("Connection failed");
        }
        Data.regenerateLists(true);
        Ui.init();
        Ui.populate();
        Ui.applyFields();
        Comps.setFinished();
    });
});