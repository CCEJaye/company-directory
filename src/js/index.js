$(window).on("load", () => {
    Comps.setLoading();
    State.load();
    Menu.init();
    Comps.init();
    Data.getAll((success) => {
        if (!success) {
            Components.setError();
            Comps.showModal("Error", ["Could not connect to database."]);
            return;
        }
        Data.regenerateLists(true);
        Ui.init();
        Ui.populate();
        Ui.applyFields();
        Comps.setFinished();
        if (State.toCommit.tutorial) {
            Comps.showDecisionModal("Tutorial", 
                ["Click on the badges to edit and delete rows."], 
                ["Don't show again", "Okay"],
                [() => {
                    State.setTutorial(false);
                }, () => {}]
            );
        }
    });
});