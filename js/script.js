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
    var panelMain = document.getElementById("download-gate-panel-main");
    var panelAdblock = document.getElementById("download-gate-panel-adblock");
    var countEl = document.getElementById("download-count");
    var progressBar = document.getElementById("download-progress-bar");
    var gateBackdrop = gateEl ? gateEl.querySelector(".download-gate__backdrop") : null;
    var gateTimer = null;
    var gateActive = false;
    var pendingGateUrl = null;

    function detectAdblockDom() {
        return new Promise(function (resolve) {
            var names = [
                "adsbox",
                "ad-banner pub_300x250 pub_300x250m",
                "text-ad textAd text_ad",
                "ad-zone adleader ad_container",
                "banner-ad google-auto-placed adholder",
                "adsbygoogle",
            ];
            var baits = [];
            for (var i = 0; i < names.length; i++) {
                var el = document.createElement("div");
                el.className = names[i];
                el.style.cssText = "position:absolute;left:-9999px;width:5px;height:5px;pointer-events:none;";
                el.textContent = "\u00a0";
                document.body.appendChild(el);
                baits.push(el);
            }

            function check() {
                var blocked = false;
                for (var j = 0; j < baits.length; j++) {
                    var b = baits[j];
                    var st = window.getComputedStyle(b);
                    if (st.display === "none" || st.visibility === "hidden" || parseFloat(st.opacity) === 0) {
                        blocked = true;
                        break;
                    }
                    if (b.offsetHeight === 0 && b.offsetWidth === 0) {
                        blocked = true;
                        break;
                    }
                }
                for (var k = 0; k < baits.length; k++) {
                    var node = baits[k];
                    if (node.parentNode) node.parentNode.removeChild(node);
                }
                resolve(blocked);
            }
            requestAnimationFrame(function () {
                requestAnimationFrame(check);
            });
        });
    }

    function detectAdblockScript(url, timeoutMs) {
        return new Promise(function (resolve) {
            var decided = false;
            function finish(blocked) {
                if (decided) return;
                decided = true;
                window.clearTimeout(t);
                if (node.parentNode) node.parentNode.removeChild(node);
                resolve(blocked);
            }
            var node = document.createElement("script");
            node.async = true;
            var t = window.setTimeout(function () {
                finish(false);
            }, timeoutMs);
            node.onload = function () {
                finish(false);
            };
            node.onerror = function () {
                finish(true);
            };
            node.src = url;
            (document.head || document.documentElement).appendChild(node);
        });
    }

    function detectAdblock() {
        var bust = Date.now();
        return Promise.all([
            detectAdblockDom(),
            detectAdblockScript(
                "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?legacycraft=" + bust,
                6000
            ),
        ]).then(function (results) {
            for (var i = 0; i < results.length; i++) {
                if (results[i]) return true;
            }
            return false;
        });
    }

    function resetGatePanels() {
        pendingGateUrl = null;
        if (panelMain) panelMain.hidden = false;
        if (panelAdblock) panelAdblock.hidden = true;
        if (gateEl) gateEl.setAttribute("aria-labelledby", "download-gate-title");
    }

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
        resetGatePanels();
    }

    function showAdblockGate(url) {
        if (!gateEl) return;
        pendingGateUrl = url;
        if (panelMain) panelMain.hidden = true;
        if (panelAdblock) panelAdblock.hidden = false;
        gateEl.setAttribute("aria-labelledby", "download-gate-adblock-title");
        gateEl.hidden = false;
        document.body.classList.add("download-gate-open");
    }

    function openDownloadGate(url) {
        if (gateActive || !gateEl || !countEl) return;
        if (panelMain) panelMain.hidden = false;
        if (panelAdblock) panelAdblock.hidden = true;
        gateEl.setAttribute("aria-labelledby", "download-gate-title");
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
                resetGatePanels();
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
            if (gateEl && !gateEl.hidden) closeDownloadGate();
        });
    }

    var retryAdblockBtn = document.getElementById("download-gate-retry-adblock");
    if (retryAdblockBtn) {
        retryAdblockBtn.addEventListener("click", function () {
            if (!pendingGateUrl) return;
            detectAdblock().then(function (blocked) {
                if (blocked) return;
                var url = pendingGateUrl;
                pendingGateUrl = null;
                openDownloadGate(url);
            });
        });
    }

    document.querySelectorAll(".btn-download-gate").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
            var url = btn.getAttribute("href");
            if (!url || url === "#") return;
            e.preventDefault();
            detectAdblock().then(function (blocked) {
                if (blocked) showAdblockGate(url);
                else openDownloadGate(url);
            });
        });
    });
})();
