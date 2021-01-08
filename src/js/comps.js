(function (Comps, $) {
    
    Comps.init = () => {
        MicroModal.init({ disableFocus: true });

        $(".selectBtn").on("change", function() {
            const childCount = $(this).children("option").length;
            const selected = $(this).children("option:selected");
            let value = "";
            if (selected.length === 1) {
                value = selected.html();
            } else if (selected.length > 1) {
                value = selected.length + " selected";
            } else {
                value = "None";
            }
            $(this).attr("size", Math.min(childCount, 10));
            $(this).prop("disabled", childCount < 2).siblings("span").html(value);
        });

        $(".selectBtn:not([multiple])").on("change", function() {
            $(this).trigger("blur");
        });

        $(".valueBtn[data-on][data-off]").on("click", function() {
            const isOn = $(this).data("is-on");
            $(this).children("span:last-of-type").html($(this).data(isOn ? "off" : "on"));
            $(this).data("is-on", !isOn);
        });

        $("#modalCloseBtn").on("click", () => MicroModal.close("modal"));
    }

    Comps.setLoading = () => {
        $(".loader").removeClass("run finish error");
        $(".loader").delay(50).addClass("run");
    }
    
    Comps.setFinished = () => {
        $(".loader").removeClass("run finish error");
        $(".loader").delay(50).addClass("finish");
    }
    
    Comps.setError = () => {
        $(".loader").removeClass("run finish error");
        $(".loader").delay(50).addClass("error");
    }

    Comps.showModal = (title = "", paras = [""], onComplete = () => {}) => {
        let htmlStr = "";
        for (let i = 0; i < paras.length; i++) {
            htmlStr += `<p class="tBody">` + paras[i] + `</p>`;
        }
        $("#modalHeader").html(title);
        $("#modalContent").html(htmlStr);
        MicroModal.show("modal");
        $("#modalCloseBtn").one("click", onComplete);
    }

}(window.Comps = window.Comps || {}, jQuery));