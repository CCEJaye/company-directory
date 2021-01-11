(function (Comps, $) {
    
    Comps.init = () => {
        MicroModal.init({ disableFocus: true });

        $(".selectBtn").on("change", function() {
            const childCount = $(this).children("option").length;
            const selected = $(this).val();
            let value = "";
            if (!Array.isArray(selected) || selected.length === 1) {
                value = $(this).children(`option[value="` + selected + `"]`).html();
            } else if (selected.length > 1) {
                value = selected.length + " selected";
            } else {
                value = "None";
            }
            $(this).attr("size", Math.min(childCount, 6));
            $(this).prop("disabled", childCount < 2).siblings("span").html(value);
        });

        $(".selectBtn:not([multiple])").on("change", function() {
            $(this).trigger("blur");
        });

        $(".selectBtn").on("focus", function() {
            const fromTop = $(this).parent().offset().top - $(window).scrollTop() + $(this).parent().height();
            const fromBottom = $(window).height() - fromTop;
            if (fromTop < fromBottom) {
                $(this).addClass("flipY");
            } else {
                $(this).removeClass("flipY");
            }
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
        $("#modalBtnPositive").hide();
        $("#modalBtnNegative").off("click");
        $("#modalBtnNegative span").html("Okay");
        $("#modalBtnNegative").one("click", () => {
            MicroModal.close("modal");
            onComplete();
        });
        MicroModal.show("modal");
    }

    Comps.showDecisionModal = (title = "", paras = [""], btnNames = [""], btnFns = [() => {}]) => {
        let htmlStr = "";
        for (let i = 0; i < paras.length; i++) {
            htmlStr += `<p class="tBody">` + paras[i] + `</p>`;
        }
        $("#modalHeader").html(title);
        $("#modalContent").html(htmlStr);
        $("#modalBtnPositive").show();
        $("#modalBtnPositive").off("click");
        $("#modalBtnNegative").off("click");
        $("#modalBtnPositive span").html(btnNames[0]);
        $("#modalBtnNegative span").html(btnNames[1]);
        $("#modalBtnPositive").one("click", () => {
            MicroModal.close("modal");
            btnFns[0]();
        });
        $("#modalBtnNegative").one("click", () => {
            MicroModal.close("modal");
            btnFns[1]();
        });
        MicroModal.show("modal");
    }

    Comps.setSelect = (selector = "", value = "") => {
        $(selector).val(value).trigger("change");
    }

    Comps.updateSelect = (selector = "", values = [], selected = []) => {
        $(selector).html(values).val(selected).trigger("change");
    }

    Comps.setToggle = (selector = "", isOn = true) => {
        $(selector).data("is-on", !isOn).trigger("click");
    }

    Comps.toggle = (selector = "") => {
        $(selector).trigger("click");
    }

}(window.Comps = window.Comps || {}, jQuery));