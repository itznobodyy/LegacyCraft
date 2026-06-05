/* ============================================================
   LegacyCraft — Lógica UI de Servidores
   Funcionalidades:
   - Ocultar servidores offline
   - Ordenar por jugadores online (mayor a menor)
   - Top ranking badges (#1, #2, #3)
   - Sistema de estrellas con promedio en Supabase
   - Filtros por versión
   - Refrescar cada 60s
============================================================ */
(function () {
    var SUPABASE_URL = "https://ktfkhevjxkgkcfvltuey.supabase.co";
    var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmtoZXZqeGtna2Nmdmx0dWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MTkyNTYsImV4cCI6MjA5NjA5NTI1Nn0.-gbuid_5PjIw9szdUCRs7OgL81oougTU7mv3s_S8PJY";
    var RATINGS_TABLE = "server_ratings";
    var API_BASE  = "https://api.mcsrvstat.us/bedrock/3/";
    var CACHE_TTL = 60 * 1000;
    var _cache    = {};

    /* ── Visitor ID (mismo sistema que script.js) ── */
    function getVisitorId() {
        var LS_KEY = "lc_visitor_id";
        var id = localStorage.getItem(LS_KEY);
        if (id && !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id)) {
            localStorage.removeItem(LS_KEY);
            id = null;
        }
        if (!id) {
            id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0;
                return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
            });
            localStorage.setItem(LS_KEY, id);
        }
        return id;
    }

    /* ── Supabase headers ── */
    var _sbHeaders = {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Content-Type": "application/json"
    };

    /* ── Clave única por servidor ── */
    function serverKey(server) {
        return server.ip.toLowerCase() + ":" + server.port;
    }

    /* ── Clave para localStorage de rating del usuario ── */
    function ratingLsKey(server) {
        return "lc_rating_" + server.ip + "_" + server.port;
    }

    /* ── Obtener promedio de ratings de Supabase ── */
    function fetchAvgRating(key) {
        return fetch(
            SUPABASE_URL + "/rest/v1/" + RATINGS_TABLE +
            "?server_key=eq." + encodeURIComponent(key) + "&select=rating",
            { headers: _sbHeaders }
        )
        .then(function (r) { return r.json(); })
        .then(function (rows) {
            if (!rows || !rows.length) return null;
            var sum = rows.reduce(function (acc, row) { return acc + (row.rating || 0); }, 0);
            return Math.round((sum / rows.length) * 10) / 10;
        })
        .catch(function () { return null; });
    }

    /* ── Guardar o actualizar rating en Supabase ── */
    function upsertRating(key, rating, visitorId) {
        return fetch(
            SUPABASE_URL + "/rest/v1/" + RATINGS_TABLE,
            {
                method: "POST",
                headers: Object.assign({}, _sbHeaders, {
                    "Prefer": "resolution=merge-duplicates,return=minimal"
                }),
                body: JSON.stringify({
                    server_key: key,
                    rating:     rating,
                    visitor_id: visitorId
                })
            }
        ).catch(function () {});
    }

    /* ── Parsear colores § del MOTD a HTML ── */
    function motdToHtml(raw) {
        if (!raw) return "—";
        var map = {
            "0": "#000000", "1": "#0000AA", "2": "#00AA00", "3": "#00AAAA",
            "4": "#AA0000", "5": "#AA00AA", "6": "#FFAA00", "7": "#AAAAAA",
            "8": "#555555", "9": "#5555FF", "a": "#55FF55", "b": "#55FFFF",
            "c": "#FF5555", "d": "#FF55FF", "e": "#FFFF55", "f": "#FFFFFF"
        };
        var html = "";
        var i = 0;
        var openSpan = false;
        var str = String(raw);
        while (i < str.length) {
            if ((str[i] === "\u00a7" || str[i] === "&") && i + 1 < str.length) {
                var code = str[i + 1].toLowerCase();
                if (map[code]) {
                    if (openSpan) html += "</span>";
                    html += '<span style="color:' + map[code] + '">';
                    openSpan = true;
                } else if (code === "r") {
                    if (openSpan) { html += "</span>"; openSpan = false; }
                } else if (code === "l") {
                    html += "<strong>";
                } else if (code === "n") {
                    html += "<br>";
                }
                i += 2;
                continue;
            }
            html += str[i] === "<" ? "&lt;" : str[i] === ">" ? "&gt;" : str[i];
            i++;
        }
        if (openSpan) html += "</span>";
        return html;
    }

    /* ── Obtener datos del servidor con caché ── */
    function fetchServer(ip, port) {
        var key = ip + ":" + port;
        var now = Date.now();
        if (_cache[key] && (now - _cache[key].ts) < CACHE_TTL) {
            return Promise.resolve(_cache[key].data);
        }
        return fetch(API_BASE + ip + ":" + port)
            .then(function (r) { return r.json(); })
            .then(function (data) {
                _cache[key] = { ts: now, data: data };
                return data;
            })
            .catch(function () { return null; });
    }

    /* ── Versión badge ── */
    function verBadge(version) {
        var label = version === "ambas" ? t("srv.both") : version;
        var cls = version === "0.14.3" ? "srv-ver--old" :
                  version === "ambas"  ? "srv-ver--both" : "srv-ver--new";
        return '<span class="srv-ver ' + cls + '">' + label + "</span>";
    }

    /* ── Ranking badge ── */
    function rankBadge(pos) {
        if (pos === 1) return '<span class="srv-rank srv-rank--1" title="Ranking #1">#1</span>';
        if (pos === 2) return '<span class="srv-rank srv-rank--2" title="Ranking #2">#2</span>';
        if (pos === 3) return '<span class="srv-rank srv-rank--3" title="Ranking #3">#3</span>';
        return '<span class="srv-rank srv-rank--n">#' + pos + "</span>";
    }

    /* ── Crear card HTML ── */
    function createCard(server, rank, data) {
        var key     = serverKey(server);
        var idKey   = server.ip.replace(/\./g, "-").replace(/:/g, "-") + "-" + server.port;
        var tagsHtml = (server.tags || []).map(function (t) {
            return '<span class="srv-tag">' + t + "</span>";
        }).join("");

        var isOnline  = data && data.online === true;
        var online    = isOnline && data.players && data.players.online != null ? data.players.online : 0;
        var max       = isOnline && data.players && data.players.max    != null ? data.players.max    : "?";

        var verText   = (data && data.version && data.version !== "") ? data.version : ("MCPE " + (server.version === "ambas" ? t("srv.both") : server.version));

        var proto     = "—";
        if (data && data.protocol) {
            if (typeof data.protocol === "object" && data.protocol.version != null) {
                proto = data.protocol.version;
            } else if (typeof data.protocol === "number") {
                proto = data.protocol;
            }
        }
        var hasQuery  = (data && data.debug && data.debug.query === true);
        var queryFail = (data && data.debug && data.debug.error && data.debug.error.query)
            ? data.debug.error.query : null;

        // La API ya devuelve el MOTD en HTML con colores correctos — usarlo directamente
        var motdLines = [];
        if (data && data.motd && data.motd.html && data.motd.html.length) {
            motdLines = Array.isArray(data.motd.html) ? data.motd.html : [data.motd.html];
        } else if (data && data.motd && data.motd.raw && data.motd.raw.length) {
            var raws = Array.isArray(data.motd.raw) ? data.motd.raw : [data.motd.raw];
            motdLines = raws.map(function (line) { return motdToHtml(line); });
        } else if (data && data.motd && data.motd.clean) {
            var cleans = Array.isArray(data.motd.clean) ? data.motd.clean : [data.motd.clean];
            motdLines = cleans;
        }

        var motdBlockHtml = motdLines.length
            ? motdLines.map(function (line) {
                return '<div class="srv-motd__line">' + line + "</div>";
              }).join("")
            : '<div class="srv-motd__line" style="color:rgba(255,255,255,0.35)">' + t("srv.no_motd") + '</div>';

        var card = document.createElement("div");
        card.className = "srv-card";
        card.setAttribute("data-key", key);
        card.setAttribute("data-version", server.version);

        card.innerHTML = [
            /* Header */
            '<div class="srv-card__header">',
            '  <div class="srv-card__info">',
            '    <div class="srv-card__top">',
            '      ' + (rank ? rankBadge(rank) : ''),
            '      <span class="srv-name">' + (server.name || server.ip) + "</span>",
            '      <span class="srv-status ' + (isOnline ? 'srv-status--online' : 'srv-status--offline') + '">',
            '        <span class="srv-status__dot"></span><span class="srv-status__text">' + (isOnline ? t("srv.online") : t("srv.offline")) + '</span>',
            "      </span>",
            '      ' + verBadge(server.version),
            "    </div>",
            /* IP + copy */
            '    <span class="srv-addr">',
            '      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
            '      <span class="srv-addr__text">' + server.ip + ":" + server.port + "</span>",
            '      <button class="srv-copy" title="' + t("srv.copy") + '" data-copy="' + server.ip + ":" + server.port + '">',
            '        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',
            "      </button>",
            "    </span>",
            /* Tags */
            '    <div class="srv-tags">' + tagsHtml + "</div>",
            "  </div>",
            "</div>",

            /* Descripción */
            '<p class="srv-desc" hidden>' + (server.description || "") + "</p>",

            /* MOTD — bloque tipo terminal */
            '<div class="srv-motd-block">',
            motdBlockHtml,
            "</div>",

            /* Stats en fila */
            '<div class="srv-stats">',
            '  <div class="srv-stat srv-stat--players">',
            '    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>',
            '    <span class="srv-stat__val"><strong>' + online + '</strong> / ' + max + "</span>",
            "  </div>",
            '  <div class="srv-stat srv-stat--proto">',
            '    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4 2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>',
            '    <span class="srv-stat__val">' + t("srv.protocol") + ' <strong>' + proto + "</strong></span>",
            "  </div>",
            '  <div class="srv-stat ' + (hasQuery ? "srv-stat--query-on" : "srv-stat--query-off") + '">',
            '    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
            '    <span class="srv-stat__val">' + t("srv.query") + ' <strong>' + (hasQuery ? t("srv.query.on") : (queryFail ? t("srv.query.off") : t("srv.query.no"))) + "</strong></span>",
            "  </div>",
            '  <div class="srv-stat srv-stat--version">',
            '    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>',
            '    <span class="srv-stat__val">' + verText + "</span>",
            "  </div>",
            "</div>",

            /* Sistema de estrellas */
            '<div class="srv-stars" data-server-key="' + key + '">',
            '  <div class="srv-stars__icons" id="stars-' + idKey + '">',
            '    <button class="srv-star" data-star="1" aria-label="' + t("srv.star1") + '">★</button>',
            '    <button class="srv-star" data-star="2" aria-label="' + t("srv.star2") + '">★</button>',
            '    <button class="srv-star" data-star="3" aria-label="' + t("srv.star3") + '">★</button>',
            '    <button class="srv-star" data-star="4" aria-label="' + t("srv.star4") + '">★</button>',
            '    <button class="srv-star" data-star="5" aria-label="' + t("srv.star5") + '">★</button>',
            "  </div>",
            '  <span class="srv-stars__avg" id="avg-' + idKey + '">' + t("srv.loading") + '</span>',
            "</div>"
        ].join("\n");

        return card;
    }

    /* ── Aplicar rating guardado del usuario en una card ── */
    function restoreUserRating(card, server) {
        var saved = parseInt(localStorage.getItem(ratingLsKey(server)) || "0", 10);
        if (!saved) return;
        var idKey = server.ip.replace(/\./g, "-").replace(/:/g, "-") + "-" + server.port;
        var starsEl = document.getElementById("stars-" + idKey);
        if (!starsEl) return;
        starsEl.querySelectorAll(".srv-star").forEach(function (btn) {
            var n = parseInt(btn.getAttribute("data-star"), 10);
            btn.classList.toggle("is-active", n <= saved);
        });
    }

    /* ── Cargar promedio de Supabase y mostrarlo ── */
    function loadAvgRating(server) {
        var key   = serverKey(server);
        var idKey = server.ip.replace(/\./g, "-").replace(/:/g, "-") + "-" + server.port;
        var avgEl = document.getElementById("avg-" + idKey);
        if (!avgEl) return;
        fetchAvgRating(key).then(function (avg) {
            if (avg === null) {
                avgEl.textContent = "—";
            } else {
                avgEl.textContent = "★ " + avg.toFixed(1);
            }
        });
    }

    /* ── Adjuntar listeners de estrellas a una card ── */
    function attachStarListeners(card, server) {
        var key       = serverKey(server);
        var idKey     = server.ip.replace(/\./g, "-").replace(/:/g, "-") + "-" + server.port;
        var starsEl   = document.getElementById("stars-" + idKey);
        if (!starsEl) return;

        var visitorId = getVisitorId();

        starsEl.addEventListener("mouseover", function (e) {
            var btn = e.target.closest(".srv-star");
            if (!btn) return;
            var hoverVal = parseInt(btn.getAttribute("data-star"), 10);
            starsEl.querySelectorAll(".srv-star").forEach(function (s) {
                var n = parseInt(s.getAttribute("data-star"), 10);
                s.classList.toggle("is-hover", n <= hoverVal);
            });
        });

        starsEl.addEventListener("mouseleave", function () {
            starsEl.querySelectorAll(".srv-star").forEach(function (s) {
                s.classList.remove("is-hover");
            });
        });

        starsEl.addEventListener("click", function (e) {
            var btn = e.target.closest(".srv-star");
            if (!btn) return;
            var rating = parseInt(btn.getAttribute("data-star"), 10);

            /* Guardar en localStorage */
            localStorage.setItem(ratingLsKey(server), String(rating));

            /* Actualizar UI */
            starsEl.querySelectorAll(".srv-star").forEach(function (s) {
                var n = parseInt(s.getAttribute("data-star"), 10);
                s.classList.toggle("is-active", n <= rating);
            });

            /* Upsert en Supabase y recargar promedio */
            upsertRating(key, rating, visitorId).then(function () {
                loadAvgRating(server);
            });
        });
    }

    /* ── Estado del filtro activo ── */
    var _activeFilter = "all";

    /* ── Aplicar filtro de versión a las cards ya en el DOM ── */
    function applyVersionFilter() {
        var container = document.getElementById("servers-container");
        if (!container) return;
        container.querySelectorAll(".srv-card").forEach(function (card) {
            var v = card.getAttribute("data-version") || "";
            card.hidden = (_activeFilter !== "all" && v !== _activeFilter && v !== "ambas");
        });
    }

    /* ── Renderizar todos los servidores online ordenados ── */
    function renderServers(serverList) {
        var container = document.getElementById("servers-container");
        if (!container) return;

        container.innerHTML = "";

        if (!serverList || serverList.length === 0) {
            container.innerHTML = '<p class="srv-empty">' + t("srv.empty") + '</p>';
            return;
        }

        serverList.forEach(function (item, idx) {
            /* Solo los online tienen ranking */
            var rank = (item.data && item.data.online) ? (idx + 1) : null;
            var card = createCard(item.server, rank, item.data);
            container.appendChild(card);
            restoreUserRating(card, item.server);
            loadAvgRating(item.server);
            attachStarListeners(card, item.server);
        });

        /* Copiar IP al portapapeles */
        container.addEventListener("click", function (e) {
            var btn = e.target.closest(".srv-copy");
            if (!btn) return;
            var text = btn.getAttribute("data-copy");
            if (!text) return;
            navigator.clipboard.writeText(text).then(function () {
                btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
                setTimeout(function () {
                    btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';
                }, 2000);
            }).catch(function () {});
        });

        applyVersionFilter();
    }

    /* ── Fetch todos los servidores, filtrar offline, ordenar y renderizar ── */
    function fetchAndRender() {
        var servers = window.SERVERS_LIST || [];
        if (servers.length === 0) {
            var c = document.getElementById("servers-container");
            if (c) c.innerHTML = '<p class="srv-empty">' + t("srv.none") + '</p>';
            return;
        }

        /* Forzar invalidación de caché en cada ciclo de refresco */
        servers.forEach(function (server) {
            var k = server.ip + ":" + server.port;
            delete _cache[k];
        });

        var promises = servers.map(function (server) {
            return fetchServer(server.ip, server.port).then(function (data) {
                return { server: server, data: data };
            });
        });

        Promise.all(promises).then(function (results) {
            /* Separar online y offline — mostrar online primero, luego offline */
            var online  = results.filter(function (item) { return item.data && item.data.online; });
            var offline = results.filter(function (item) { return !item.data || !item.data.online; });

            /* Ordenar online por jugadores descendente ANTES del concat */
            online.sort(function (a, b) {
                var aP = a.data && a.data.players ? a.data.players.online || 0 : 0;
                var bP = b.data && b.data.players ? b.data.players.online || 0 : 0;
                return bP - aP;
            });

            var allServers = online.concat(offline);
            renderServers(allServers);
        });
    }

    /* ── Helper: traducción con fallback ── */
    function t(key) {
        return (window.i18n && window.i18n.t) ? window.i18n.t(key) : key;
    }

    /* ── Exponer re-render para i18n ── */
    window._lcRerenderServers = function () { fetchAndRender(); };

    /* ── Inicializar ── */
    function init() {
        fetchAndRender();
        initFilters();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    /* ── Refrescar cada 60 s si la sección está activa ── */
    setInterval(function () {
        var sec = document.getElementById("servers");
        if (!sec || !sec.classList.contains("is-active")) return;
        fetchAndRender();
    }, 60000);

    /* ── Filtros por versión ── */
    function initFilters() {
        var bar = document.querySelector(".srv-filter-bar");
        if (!bar) return;
        bar.addEventListener("click", function (e) {
            var btn = e.target.closest(".srv-filter-btn");
            if (!btn) return;
            bar.querySelectorAll(".srv-filter-btn").forEach(function (b) {
                b.classList.remove("is-active");
            });
            btn.classList.add("is-active");
            _activeFilter = btn.getAttribute("data-filter") || "all";
            applyVersionFilter();
        });
    }
})();
