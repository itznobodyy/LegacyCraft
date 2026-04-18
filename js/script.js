(function () {
    var views = document.querySelectorAll(".view");
    var navLinks = document.querySelectorAll(".nav-link[data-section]");

    function sectionFromHash() {
        var h = (window.location.hash || "#inicio").replace(/^#/, "");
        if (h === "aviso") h = "creditos";
        if (h === "inicio" || h === "apks" || h === "creditos") return h;
        return "inicio";
    }

    function showSection(id) {
        views.forEach(function (el) {
            var v = el.getAttribute("data-view");
            var on = v === id;
            el.classList.toggle("is-active", on);
        });
        navLinks.forEach(function (a) {
            a.classList.toggle("is-active", a.getAttribute("data-section") === id);
        });
    }

    document.querySelectorAll("[data-section]").forEach(function (el) {
        el.addEventListener("click", function (e) {
            e.preventDefault();
            var id = el.getAttribute("data-section");
            if (!id) return;
            if (window.location.hash !== "#" + id) {
                window.location.hash = id;
            } else {
                showSection(id);
            }
        });
    });

    window.addEventListener("hashchange", function () {
        showSection(sectionFromHash());
    });

    if (!window.location.hash || window.location.hash === "#") {
        if (history.replaceState) {
            history.replaceState(null, "", "#inicio");
        }
    }
    showSection(sectionFromHash());

    var input = document.getElementById("apk-search");
    var list = document.getElementById("apk-list");
    if (input && list) {
        var items = list.querySelectorAll(".apk-item");
        input.addEventListener("input", function () {
            var q = input.value.trim().toLowerCase();
            items.forEach(function (el) {
                var hay = (el.getAttribute("data-search") || "") + " " + el.textContent;
                hay = hay.toLowerCase();
                el.hidden = q.length > 0 && hay.indexOf(q) === -1;
            });
        });
    }

    var GATE_SECONDS = 10;
    var gateEl = document.getElementById("download-gate");
    var countEl = document.getElementById("download-count");
    var progressBar = document.getElementById("download-progress-bar");
    var gateBackdrop = gateEl ? gateEl.querySelector(".download-gate__backdrop") : null;
    var gateTimer = null;
    var gateActive = false;

    function setGateProgress(left) {
        if (progressBar) {
            progressBar.style.width = (100 * left) / GATE_SECONDS + "%";
        }
    }

    function closeDownloadGate() {
        if (gateTimer) {
            window.clearInterval(gateTimer);
            gateTimer = null;
        }
        gateActive = false;
        if (gateEl) gateEl.hidden = true;
        document.body.classList.remove("download-gate-open");
    }

    function openDownloadGate(url) {
        if (gateActive || !gateEl || !countEl) return;
        gateActive = true;
        gateEl.hidden = false;
        document.body.classList.add("download-gate-open");

        var left = GATE_SECONDS;
        countEl.textContent = String(left);
        setGateProgress(left);

        gateTimer = window.setInterval(function () {
            left -= 1;
            if (left <= 0) {
                window.clearInterval(gateTimer);
                gateTimer = null;
                gateActive = false;
                gateEl.hidden = true;
                document.body.classList.remove("download-gate-open");
                window.location.href = url;
                return;
            }
            countEl.textContent = String(left);
            setGateProgress(left);
        }, 1000);
    }

    if (gateBackdrop) {
        gateBackdrop.addEventListener("click", function () {
            if (gateActive) closeDownloadGate();
        });
    }

    document.querySelectorAll(".btn-download-gate").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
            var url = btn.getAttribute("href");
            if (!url || url === "#") return;
            e.preventDefault();
            openDownloadGate(url);
        });
    });
})();
