/* ============================================================
   LegacyCraft — Lógica UI de Servidores
   Consulta la API mcsrvstat.us (Bedrock) y renderiza las cards
============================================================ */
(function () {
    var API_BASE = "https://api.mcsrvstat.us/bedrock/3/";
    var CACHE_TTL = 60 * 1000; // 1 minuto de caché por servidor
    var _cache = {};

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

    /* ── Obtener datos del servidor (con caché) ── */
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

    /* ── Crear card HTML ── */
    function createCard(server) {
        var card = document.createElement("div");
        card.className = "srv-card";
        card.setAttribute("data-key", server.ip + ":" + server.port);

        var versionClass = server.version === "0.14.3" ? "srv-ver--old" :
                           server.version === "ambas"   ? "srv-ver--both" : "srv-ver--new";

        var tagsHtml = (server.tags || []).map(function (t) {
            return '<span class="srv-tag">' + t + "</span>";
        }).join("");

        card.innerHTML = [
            '<div class="srv-card__header">',
            '  <div class="srv-card__info">',
            '    <div class="srv-card__top">',
            '      <span class="srv-name">' + (server.name || server.ip) + "</span>",
            '      <span class="srv-status srv-status--loading" id="status-' + server.ip.replace(/\./g, "-") + "-" + server.port + '">',
            '        <span class="srv-status__dot"></span><span class="srv-status__text">Cargando</span>',
            "      </span>",
            "    </div>",
            '    <span class="srv-addr">',
            '      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
            '      <span class="srv-addr__text">' + server.ip + ":" + server.port + "</span>",
            '      <button class="srv-copy" title="Copiar IP" data-copy="' + server.ip + ":" + server.port + '">',
            '        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',
            "      </button>",
            "    </span>",
            '    <div class="srv-tags">' + tagsHtml + "</div>",
            "  </div>",
            '  <div class="srv-card__meta">',
            '    <span class="srv-ver ' + versionClass + '">' + server.version + "</span>",
            "  </div>",
            "</div>",

            // Descripción estática
            '<p class="srv-desc">' + (server.description || "") + "</p>",

            // Stats dinámicos (se rellenan al obtener datos)
            '<div class="srv-stats" id="stats-' + server.ip.replace(/\./g, "-") + "-" + server.port + '">',
            '  <div class="srv-stat srv-stat--players">',
            '    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>',
            '    <span class="srv-stat__val" id="players-' + server.ip.replace(/\./g, "-") + "-" + server.port + '">— / —</span>',
            "  </div>",
            '  <div class="srv-stat srv-stat--motd">',
            '    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>',
            '    <span class="srv-stat__val srv-motd" id="motd-' + server.ip.replace(/\./g, "-") + "-" + server.port + '">Consultando...</span>',
            "  </div>",
            '  <div class="srv-stat srv-stat--version">',
            '    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>',
            '    <span class="srv-stat__val" id="version-' + server.ip.replace(/\./g, "-") + "-" + server.port + '">—</span>',
            "  </div>",
            "</div>"
        ].join("\n");

        return card;
    }

    /* ── Actualizar card con datos de la API ── */
    function updateCard(server, data) {
        var key = server.ip.replace(/\./g, "-") + "-" + server.port;
        var statusEl  = document.getElementById("status-"  + key);
        var playersEl = document.getElementById("players-" + key);
        var motdEl    = document.getElementById("motd-"    + key);
        var versionEl = document.getElementById("version-" + key);

        if (!statusEl) return;

        if (!data || !data.online) {
            statusEl.className = "srv-status srv-status--offline";
            statusEl.innerHTML = '<span class="srv-status__dot"></span><span class="srv-status__text">Offline</span>';
            if (playersEl) playersEl.textContent = "0 / —";
            if (motdEl)    motdEl.textContent    = "Servidor offline";
            if (versionEl) versionEl.textContent  = "—";
            return;
        }

        // Online
        statusEl.className = "srv-status srv-status--online";
        statusEl.innerHTML = '<span class="srv-status__dot"></span><span class="srv-status__text">Online</span>';

        var online = (data.players && data.players.online != null) ? data.players.online : 0;
        var max    = (data.players && data.players.max    != null) ? data.players.max    : "?";
        if (playersEl) playersEl.textContent = online + " / " + max;

        // MOTD — puede venir como string o como objeto {raw, clean, html}
        var motdRaw = "";
        if (data.motd) {
            if (typeof data.motd === "string") {
                motdRaw = data.motd;
            } else if (data.motd.raw && data.motd.raw.length) {
                motdRaw = Array.isArray(data.motd.raw) ? data.motd.raw.join("\n") : data.motd.raw;
            } else if (data.motd.clean) {
                motdRaw = Array.isArray(data.motd.clean) ? data.motd.clean.join(" ") : data.motd.clean;
            }
        }
        if (motdEl) {
            motdEl.innerHTML = motdRaw ? motdToHtml(motdRaw) : (data.hostname || "—");
        }

        var ver = (data.version || "—");
        if (versionEl) versionEl.textContent = ver;
    }

    /* ── Cargar y renderizar todos los servidores ── */
    function renderServers() {
        var container = document.getElementById("servers-container");
        if (!container) return;

        var servers = window.SERVERS_LIST || [];
        if (servers.length === 0) {
            container.innerHTML = '<p class="srv-empty">No hay servidores configurados.</p>';
            return;
        }

        container.innerHTML = "";
        servers.forEach(function (server) {
            var card = createCard(server);
            container.appendChild(card);

            fetchServer(server.ip, server.port).then(function (data) {
                updateCard(server, data);
            });
        });

        // Copiar IP al portapapeles
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
    }

    // Lanzar al cargar
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", renderServers);
    } else {
        renderServers();
    }

    // Refrescar cada 60s si la sección está activa
    setInterval(function () {
        var sec = document.getElementById("servidores");
        if (!sec || !sec.classList.contains("is-active")) return;
        var servers = window.SERVERS_LIST || [];
        servers.forEach(function (server) {
            // Forzar re-fetch borrando caché
            var key = server.ip + ":" + server.port;
            delete _cache[key];
            fetchServer(server.ip, server.port).then(function (data) {
                updateCard(server, data);
            });
        });
    }, 60000);
})();

/* ── Filtros por versión ── */
(function () {
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
            var filter = btn.getAttribute("data-filter");
            document.querySelectorAll(".srv-card").forEach(function (card) {
                var key = card.getAttribute("data-key") || "";
                // Buscar el servidor por ip:port
                var servers = window.SERVERS_LIST || [];
                var match = servers.find(function (s) {
                    return (s.ip + ":" + s.port) === key;
                });
                if (!match) { card.hidden = false; return; }
                card.hidden = (filter !== "all" && match.version !== filter && match.version !== "ambas");
            });
        });
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initFilters);
    } else {
        initFilters();
    }
})();
