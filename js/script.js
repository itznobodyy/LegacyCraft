(function () {

    /* ============================================================
       NAVEGACIÃ“N POR SECCIONES
    ============================================================ */
    var views    = document.querySelectorAll(".content-section");
    var navLinks = document.querySelectorAll(".menu-item[data-section]");

    // FIX #14 â€” usar PerformanceNavigationTiming en lugar del deprecado
    function isReload() {
        try {
            var nav = performance.getEntriesByType("navigation")[0];
            return nav && nav.type === "reload";
        } catch (e) {
            // Fallback para navegadores muy antiguos
            return !!(window.performance && window.performance.navigation &&
                      window.performance.navigation.type === 1);
        }
    }

    var SECTIONS = ["home", "downloads", "servers", "credits"];

    function sectionFromUrl() {
        if (isReload()) return "home";
        /* Try hash first (legacy), then pathname */
        var h = (window.location.hash || "").replace(/^#/, "");
        if (h === "aviso") h = "credits";
        if (SECTIONS.indexOf(h) !== -1) return h;
        /* Try pathname: /apks -> "downloads" */
        var p = window.location.pathname.replace(/^\//, "").replace(/\/$/, "");
        if (SECTIONS.indexOf(p) !== -1) return p;
        return "home";
    }

    function showSection(id) {
        views.forEach(function (el) {
            var on = el.getAttribute("data-view") === id;
            if (on) {
                el.classList.remove("is-active");
                el.style.display = "";
                void el.offsetWidth; /* reflow para reiniciar animacion CSS */
                el.classList.add("is-active");
            } else {
                el.classList.remove("is-active");
                el.style.display = "";
            }
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
            // Siempre mostrar la sección directamente sin depender del hash
            showSection(id);
            if (history.pushState) {
                history.pushState(null, "", id === "home" ? "/" : "/" + id);
            }
        });
    });

    window.addEventListener("popstate", function () {
        var id = sectionFromUrl();
        showSection(id);
        requestAnimationFrame(function () {
            document.documentElement.style.scrollBehavior = "auto";
            window.scrollTo(0, 0);
            document.documentElement.style.scrollBehavior = "";
        });
    });

    if (history.replaceState) history.replaceState(null, "", window.location.pathname || "/");
    showSection(sectionFromUrl());

    /* Forzar scroll al tope después del paint para que no restaure posición anterior en móvil */
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            document.documentElement.style.scrollBehavior = "auto";
            window.scrollTo(0, 0);
            document.documentElement.style.scrollBehavior = "";
        });
    });


    /* ============================================================
       BUSCADOR
    ============================================================ */
    var mainSearch = document.getElementById("main-search");
    var list = document.getElementById("apk-list");

    if (mainSearch) {
        mainSearch.addEventListener("input", function () {
            var q = mainSearch.value.trim().toLowerCase();
            if (q.length === 0) {
                showAllContent();
                return;
            }
            var bestSection = detectBestSection(q);
            if (bestSection) switchToSection(bestSection);

            if (list) {
                list.querySelectorAll(".apk-item").forEach(function (el) {
                    el.style.display = fuzzyMatch(q, getSearchableText(el)) ? "" : "none";
                });
            }

            // FIX #15 â€” searchInSections solo filtra menÃº, no sections
            // (la secciÃ³n activa ya cambia via switchToSection)
            searchInMenu(q);
        });
    }

    function detectBestSection(query) {
        var scores = {};
        if (list) {
            var hits = 0;
            list.querySelectorAll(".apk-item").forEach(function (el) {
                if (fuzzyMatch(query, getSearchableText(el))) hits++;
            });
            if (hits) scores.downloads = hits;
        }
        var inicioEl = document.getElementById("home");
        if (inicioEl) {
            var s = fuzzyMatch(query, getSearchableText(inicioEl)) ? 3 : 0;
            if (/bienven|home|download|instal/.test(query)) s += 5;
            if (s) scores.home = s;
        }
        var servidoresEl = document.getElementById("servers");
        if (servidoresEl) {
            var sv = fuzzyMatch(query, getSearchableText(servidoresEl)) ? 3 : 0;
            if (/serv|server|online|pvp|survival|players/.test(query)) sv += 5;
            if (sv) scores.servers = sv;
        }
        var creditosEl = document.getElementById("credits");
        if (creditosEl) {
            var c = fuzzyMatch(query, getSearchableText(creditosEl)) ? 2 : 0;
            if (/credit|autor|github|discord/.test(query)) c += 5;
            if (c) scores.credits = c;
        }
        var best = null, max = 0;
        for (var k in scores) {
            if (scores[k] > max) { max = scores[k]; best = k; }
        }
        return best;
    }

    // FIX #20 â€” eliminar shadowing de navLinks
    function switchToSection(sectionId) {
        var searchInput = document.getElementById("main-search");
        var wasFocused = searchInput && document.activeElement === searchInput;
        var searchValue = searchInput ? searchInput.value : "";

        showSection(sectionId);
        if (history.pushState) {
            history.pushState(null, "", sectionId === "home" ? "/" : "/" + sectionId);
        }

        if (wasFocused && searchInput) {
            setTimeout(function () {
                searchInput.focus();
                searchInput.value = searchValue;
            }, 10);
        }
    }

    function getSearchableText(element) {
        var texts = [];
        var ds = element.getAttribute && element.getAttribute("data-search");
        if (ds) texts.push(ds);
        texts.push(element.textContent || element.innerText || "");
        return texts.join(" ").toLowerCase();
    }

    function fuzzyMatch(query, text) {
        if (!query || !text) return false;
        if (text.includes(query)) return true;
        var qWords = query.split(" ").filter(Boolean);
        var tWords = text.split(" ").filter(Boolean);
        return qWords.every(function (qw) {
            return tWords.some(function (tw) {
                return tw.includes(qw) || qw.includes(tw) ||
                    levenshteinDistance(qw, tw) <= Math.max(1, Math.floor(qw.length * 0.3));
            });
        });
    }

    function levenshteinDistance(a, b) {
        var m = [], i, j;
        for (i = 0; i <= b.length; i++) m[i] = [i];
        for (j = 0; j <= a.length; j++) m[0][j] = j;
        for (i = 1; i <= b.length; i++) {
            for (j = 1; j <= a.length; j++) {
                m[i][j] = b[i-1] === a[j-1] ? m[i-1][j-1] :
                    Math.min(m[i-1][j-1]+1, m[i][j-1]+1, m[i-1][j]+1);
            }
        }
        return m[b.length][a.length];
    }

    // FIX #15 â€” showAllContent no toca display de sections, solo items y menÃº
    function showAllContent() {
        if (list) {
            list.querySelectorAll(".apk-item").forEach(function (el) {
                el.style.display = "";
            });
        }
        document.querySelectorAll(".menu-item").forEach(function (el) {
            el.style.display = "";
        });
    }

    function searchInMenu(query) {
        document.querySelectorAll(".menu-item").forEach(function (item) {
            var t = (item.textContent || item.innerText || "").toLowerCase();
            item.style.display = fuzzyMatch(query, t) ? "" : "none";
        });
    }


    /* ============================================================
       DOWNLOAD GATE â€” modal con cuenta atrÃ¡s
    ============================================================ */
    var GATE_SECONDS       = 10;
    var gateEl             = document.getElementById("download-gate");
    var panelMain          = document.getElementById("download-gate-panel-main");
    var panelAdblock       = document.getElementById("download-gate-panel-adblock");
    var countEl            = document.getElementById("download-count");
    var progressBar        = document.getElementById("download-progress-bar");
    var mediafireContainer = document.getElementById("download-gate__mediafire");
    var mediafireBtn       = document.getElementById("mediafire-download-btn");
    var gateBackdrop       = gateEl ? gateEl.querySelector(".download-gate__backdrop") : null;
    var gateTimer          = null;
    var gateActive         = false;
    var pendingGateUrl     = null;

    // FIX #16 â€” asignar onclick al mediafireBtn una sola vez aquÃ­
    if (mediafireBtn) {
        mediafireBtn.addEventListener("click", function () {
            setTimeout(closeDownloadGate, 100);
        });
    }

    function detectAdblockDom() {
        return new Promise(function (resolve) {
            var names = [
                "adsbox",
                "ad-banner pub_300x250 pub_300x250m",
                "text-ad textAd text_ad",
                "ad-zone adleader ad_container",
                "banner-ad google-auto-placed adholder",
                "adsbygoogle"
            ];
            var baits = [];
            names.forEach(function (cls) {
                var el = document.createElement("div");
                el.className = cls;
                el.style.cssText = "position:absolute;left:-9999px;width:5px;height:5px;pointer-events:none;";
                el.textContent = "\u00a0";
                document.body.appendChild(el);
                baits.push(el);
            });
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    var blocked = baits.some(function (b) {
                        var st = window.getComputedStyle(b);
                        return st.display === "none" || st.visibility === "hidden" ||
                               parseFloat(st.opacity) === 0 ||
                               (b.offsetHeight === 0 && b.offsetWidth === 0);
                    });
                    baits.forEach(function (b) { b.parentNode && b.parentNode.removeChild(b); });
                    resolve(blocked);
                });
            });
        });
    }

    function detectAdblockScript(url, timeoutMs) {
        return new Promise(function (resolve) {
            var done = false;
            function finish(blocked) {
                if (done) return;
                done = true;
                clearTimeout(t);
                node.parentNode && node.parentNode.removeChild(node);
                resolve(blocked);
            }
            var node = document.createElement("script");
            node.async = true;
            var t = setTimeout(function () { finish(false); }, timeoutMs);
            node.onload  = function () { finish(false); };
            node.onerror = function () { finish(true); };
            node.src = url;
            (document.head || document.documentElement).appendChild(node);
        });
    }

    function detectAdblock() {
        return Promise.all([
            detectAdblockDom(),
            detectAdblockScript(
                "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?lc=" + Date.now(),
                6000
            )
        ]).then(function (results) { return results[0] || results[1]; });
    }

    function resetGatePanels() {
        pendingGateUrl = null;
        if (panelMain)          panelMain.hidden = false;
        if (panelAdblock)       panelAdblock.hidden = true;
        if (mediafireContainer) mediafireContainer.hidden = true;
        if (gateEl)             gateEl.setAttribute("aria-labelledby", "download-gate-title");
    }

    function closeDownloadGate() {
        if (gateTimer) { clearInterval(gateTimer); gateTimer = null; }
        gateActive = false;
        if (gateEl) gateEl.hidden = true;
        document.body.classList.remove("download-gate-open");
        resetGatePanels();
    }

    function showAdblockGate(url) {
        if (!gateEl) return;
        pendingGateUrl = url;
        if (panelMain)    panelMain.hidden = true;
        if (panelAdblock) panelAdblock.hidden = false;
        gateEl.setAttribute("aria-labelledby", "download-gate-adblock-title");
        gateEl.hidden = false;
        var _box1 = gateEl.querySelector(".download-gate__box");
        if (_box1) { _box1.style.animation = "none"; void _box1.offsetWidth; _box1.style.animation = ""; }
        document.body.classList.add("download-gate-open");
    }

    function openDownloadGate(url) {
        if (gateActive || !gateEl || !countEl) return;
        if (panelMain)    panelMain.hidden = false;
        if (panelAdblock) panelAdblock.hidden = true;
        gateEl.setAttribute("aria-labelledby", "download-gate-title");
        gateActive = true;
        gateEl.hidden = false;
        var _box2 = gateEl.querySelector(".download-gate__box");
        if (_box2) { _box2.style.animation = "none"; void _box2.offsetWidth; _box2.style.animation = ""; }
        document.body.classList.add("download-gate-open");

        var timerEl = document.querySelector(".download-gate__timer");
        if (timerEl)            timerEl.hidden = false;
        if (mediafireContainer) mediafireContainer.hidden = true;

        var left = GATE_SECONDS;
        countEl.textContent = String(left);
        if (progressBar) progressBar.style.width = "100%";

        gateTimer = setInterval(function () {
            left -= 1;
            if (left <= 0) {
                clearInterval(gateTimer);
                gateTimer = null;
                gateActive = false;
                if (timerEl)            timerEl.hidden = true;
                if (mediafireContainer) {
                    mediafireContainer.hidden = false;
                    // FIX #16 â€” solo actualizar el href, el listener ya estÃ¡ asignado arriba
                    if (mediafireBtn) mediafireBtn.href = url;
                }
                return;
            }
            countEl.textContent = String(left);
            if (progressBar) progressBar.style.width = (100 * left / GATE_SECONDS) + "%";
        }, 1000);
    }

    if (gateBackdrop) {
        gateBackdrop.addEventListener("click", function () {
            if (gateEl && !gateEl.hidden) closeDownloadGate();
        });
    }
    if (gateEl) {
        gateEl.addEventListener("click", function (e) {
            if (e.target === gateEl || e.target === gateBackdrop) {
                if (!gateEl.hidden) closeDownloadGate();
            }
        });
    }

    // FIX #18 â€” retry con centinela para android selector
    var ANDROID_SENTINEL = "__android_selector__";

    var retryBtn = document.getElementById("download-gate-retry-adblock");
    if (retryBtn) {
        retryBtn.addEventListener("click", function () {
            if (!pendingGateUrl) return;
            var origText = retryBtn.textContent;
            retryBtn.disabled = true;
            retryBtn.textContent = "Comprobando...";
            detectAdblock().then(function (blocked) {
                retryBtn.disabled = false;
                if (blocked) {
                    retryBtn.textContent = "Sigue activo, intenta de nuevo";
                    setTimeout(function () { retryBtn.textContent = origText; }, 2500);
                    return;
                }
                retryBtn.textContent = origText;
                var url = pendingGateUrl;
                pendingGateUrl = null;
                if (url === ANDROID_SENTINEL) {
                    if (gateEl) gateEl.hidden = true;
                    document.body.classList.remove("download-gate-open");
                    resetGatePanels();
                    showAndroidSelector();
                } else {
                    openDownloadGate(url);
                }
            }).catch(function () {
                retryBtn.disabled = false;
                retryBtn.textContent = origText;
                var url = pendingGateUrl;
                if (!url) return;
                pendingGateUrl = null;
                if (url === ANDROID_SENTINEL) {
                    if (gateEl) gateEl.hidden = true;
                    document.body.classList.remove("download-gate-open");
                    resetGatePanels();
                    showAndroidSelector();
                } else {
                    openDownloadGate(url);
                }
            });
        });
    }


    /* ============================================================
       ANDROID SELECTOR
    ============================================================ */
    var androidSelectorEl       = document.getElementById("android-selector");
    var androidSelectorBackdrop = androidSelectorEl
        ? androidSelectorEl.querySelector(".download-gate__backdrop")
        : null;

    function showAndroidSelector() {
        if (!androidSelectorEl) return;
        androidSelectorEl.hidden = false;
        var _box3 = androidSelectorEl.querySelector(".download-gate__box");
        if (_box3) { _box3.style.animation = "none"; void _box3.offsetWidth; _box3.style.animation = ""; }
        document.body.classList.add("download-gate-open");
    }

    function closeAndroidSelector() {
        if (!androidSelectorEl) return;
        androidSelectorEl.hidden = true;
        document.body.classList.remove("download-gate-open");
    }

    if (androidSelectorBackdrop) {
        androidSelectorBackdrop.addEventListener("click", closeAndroidSelector);
    }
    if (androidSelectorEl) {
        androidSelectorEl.addEventListener("click", function (e) {
            if (e.target === androidSelectorEl || e.target === androidSelectorBackdrop) {
                closeAndroidSelector();
            }
        });
    }

    document.querySelectorAll(".android-selector-btn").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            var url = btn.getAttribute("data-url");
            if (!url) return;
            closeAndroidSelector();
            detectAdblock().then(function (blocked) {
                if (blocked) { showAdblockGate(url); return; }
                openDownloadGate(url);
            });
        });
    });

    document.querySelectorAll(".btn-download-gate").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
            var version = btn.getAttribute("data-version");

            if (version === "0.15.10") {
                e.preventDefault();
                detectAdblock().then(function (blocked) {
                    if (blocked) {
                        // FIX #18 â€” usar centinela en lugar de "#"
                        showAdblockGate(ANDROID_SENTINEL);
                        return;
                    }
                    showAndroidSelector();
                });
                return;
            }

            var url = btn.getAttribute("href");
            if (!url || url === "#") return;
            e.preventDefault();
            detectAdblock().then(function (blocked) {
                if (blocked) { showAdblockGate(url); return; }
                openDownloadGate(url);
            });
        });
    });

})();


/* ============================================================
   CONTADOR DE VISITANTES ÚNICOS — Supabase (sin IPs)
============================================================ */
(function () {
    var SUPABASE_URL  = "https://ktfkhevjxkgkcfvltuey.supabase.co";
    var SUPABASE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmtoZXZqeGtna2Nmdmx0dWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MTkyNTYsImV4cCI6MjA5NjA5NTI1Nn0.-gbuid_5PjIw9szdUCRs7OgL81oougTU7mv3s_S8PJY";
    var TABLE         = "visitors";
    var LS_KEY        = "lc_visitor_id";
    var LS_REGISTERED = "lc_registered_v2"; /* v2 = limpia el flag viejo */

    var countEl = document.getElementById("visitor-count");
    if (!countEl) return;

    /* Limpiar flag viejo que podría estar bloqueando */
    localStorage.removeItem("lc_registered");

    var headers = {
        "apikey":        SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Content-Type":  "application/json"
    };

    function isValidUUID(str) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(str);
    }

    function getVisitorId() {
        var id = localStorage.getItem(LS_KEY);
        if (id && !isValidUUID(id)) { localStorage.removeItem(LS_KEY); id = null; }
        if (!id) {
            id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0;
                return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
            });
            localStorage.setItem(LS_KEY, id);
        }
        return id;
    }

    function fetchCount() {
        return fetch(SUPABASE_URL + "/rest/v1/" + TABLE + "?select=id", {
            headers: Object.assign({}, headers, { "Prefer": "count=exact", "Range": "0-0" })
        }).then(function (res) {
            var cr = res.headers.get("content-range");
            if (cr) {
                var n = parseInt(cr.split("/")[1], 10);
                return isNaN(n) ? 0 : n;
            }
            return 0;
        });
    }

    function registerVisit(visitorId) {
        if (localStorage.getItem(LS_REGISTERED) === "1") return Promise.resolve();
        /* Upsert: inserta si no existe, ignora si ya existe (ON CONFLICT DO NOTHING) */
        return fetch(SUPABASE_URL + "/rest/v1/" + TABLE, {
            method:  "POST",
            headers: Object.assign({}, headers, {
                "Prefer": "resolution=ignore-duplicates,return=minimal"
            }),
            body: JSON.stringify({ id: visitorId, visited_at: new Date().toISOString() })
        }).then(function (res) {
            /* 200, 201, 204 = éxito. Cualquier otro = schema incompatible, ignorar */
            localStorage.setItem(LS_REGISTERED, "1");
        }).catch(function () {
            /* Error de red — no bloquear el conteo */
        });
    }

    var visitorId = getVisitorId();

    /* Siempre registrar primero, luego mostrar conteo */
    registerVisit(visitorId)
        .then(function ()  { return fetchCount(); })
        .then(function (n) { countEl.textContent = n.toLocaleString("es"); })
        .catch(function () { countEl.textContent = "—"; });
})();

/* ============================================================
   SKILLS — animación de barras al entrar en viewport
============================================================ */
(function () {
    function animateBars(section) {
        section.querySelectorAll(".skill-bar-fill").forEach(function (bar) {
            bar.classList.add("is-visible");
        });
    }

    function resetBars(section) {
        section.querySelectorAll(".skill-bar-fill").forEach(function (bar) {
            bar.classList.remove("is-visible");
        });
    }

    var creditsSection = document.getElementById("credits");
    if (!creditsSection) return;

    /* Observar la sección de créditos: anima al entrar, resetea al salir */
    if ("IntersectionObserver" in window) {
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    /* Pequeño delay para que la transición se vea suave */
                    setTimeout(function () { animateBars(creditsSection); }, 120);
                } else {
                    resetBars(creditsSection);
                }
            });
        }, { threshold: 0.05 });
        obs.observe(creditsSection);
    } else {
        /* Fallback: animar directamente sin observer */
        animateBars(creditsSection);
    }

    /* También disparar cuando el usuario navega a Créditos via menú */
    document.querySelectorAll("[data-section='credits']").forEach(function (btn) {
        btn.addEventListener("click", function () {
            setTimeout(function () { animateBars(creditsSection); }, 200);
        });
    });
})();
