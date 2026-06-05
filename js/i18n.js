/* ============================================================
   LegacyCraft — i18n (ES / EN)
   Uso: data-i18n="key" en elementos HTML
        data-i18n-placeholder="key" en inputs
        data-i18n-title="key" en elementos con title
============================================================ */
(function () {
    var STRINGS = {
        es: {
            /* Nav */
            "nav.home":       "Inicio",
            "nav.downloads":  "APKs PE",
            "nav.servers":    "Servidores",
            "nav.credits":    "Créditos",
            "nav.lang":       "EN",

            /* Search */
            "search.placeholder": "Buscar...",

            /* Home — Qué encontrarás */
            "home.whatyouget":        "Qué encontrarás",
            "home.feature.apks":      "APKs de MCPE 0.15.10 y 0.14.3",
            "home.feature.servers":   "Servidores legacy activos",
            "home.feature.links":     "Links directos a MediaFire",
            "home.feature.discord":   "Discord para soporte",

            /* Home — Cómo descargar */
            "home.howto":             "Cómo descargar",
            "home.step1.title":       "Abre APKs PE",
            "home.step1.desc":        "En el menú lateral",
            "home.step2.title":       "Elige tu versión",
            "home.step2.desc":        "0.15.10 o 0.14.3",
            "home.step3.title":       "Pulsa Descargar",
            "home.step3.desc":        "Espera la cuenta atrás",
            "home.step4.title":       "Obtén el APK",
            "home.step4.desc":        "Desde MediaFire",

            /* Home — Antes de instalar */
            "home.beforeinstall":      "Antes de instalar",
            "home.tip1.title":         "Activa orígenes desconocidos",
            "home.tip1.desc":          "Sin eso no puedes instalar el APK",
            "home.tip2.title":         "¿No funciona en Android 14+?",
            "home.tip2.desc":          "Baja las alternativas de más abajo",
            "home.tip3.title":         "Guarda tus mundos",
            "home.tip3.desc":          "Haz copia antes de reinstalar",

            /* Home — Comunidad */
            "home.community":          "Comunidad",
            "home.community.text":     "¿No te funciona algo o hay un link caído?",
            "home.discord.btn":        "Únete al Discord",

            /* Downloads */
            "dl.title":                "Descargas APK",
            "dl.015.date":             "Agosto 2016",
            "dl.015.desc":             "Pistones pegajosos, mapas del tesoro, corceles y mobs clásicos.",
            "dl.015.f1":               "Pistones pegajosos",
            "dl.015.f2":               "Mapas del tesoro",
            "dl.015.f3":               "Corceles y armadura",
            "dl.014.date":             "Febrero 2016",
            "dl.014.desc":             "Redstone básico, dispensadores, carritos con cofres y biomas clásicos.",
            "dl.014.f1":               "Redstone y dispensadores",
            "dl.014.f2":               "Carritos con cofres",
            "dl.014.f3":               "Brujas y cabañas",
            "dl.btn.download":         "Descargar",

            /* Downloads — Alternativas */
            "dl.alt.title":            "Alternativas",
            "dl.alt.desc":             "Si las versiones de arriba no funcionan en tu dispositivo, prueba estas alternativas. Incluyen anuncios — instala AdGuard para eliminarlos.",
            "dl.alt1.name":            "Alternativa 1 — PE 0.15.10",
            "dl.alt1.date":            "Android 14+ compatible",
            "dl.alt1.desc":            "Versión alternativa de Minecraft PE compatible con Android 14 y superior.",
            "dl.alt1.f3":              "Contiene anuncios",
            "dl.alt2.name":            "Alternativa 2 — PE 0.15.10",
            "dl.alt2.date":            "Android 14+ compatible",
            "dl.alt2.desc":            "Segunda versión alternativa para dispositivos con Android 14 y superior.",
            "dl.alt2.f3":              "Contiene anuncios",

            /* Downloads — AdGuard */
            "dl.adguard.title":        "Bloquear anuncios",
            "dl.adguard.desc":         "Las alternativas incluyen anuncios. Instala <strong>AdGuard</strong> para eliminarlos completamente.",
            "dl.adguard.date":         "Bloqueador de anuncios",
            "dl.adguard.desc2":        "Bloquea todos los anuncios de las versiones alternativas. Instálalo antes de abrir el juego.",
            "dl.adguard.f1":           "Sin anuncios",
            "dl.adguard.f2":           "Para alternativas",
            "dl.adguard.f3":           "Fácil instalación",

            /* Servers */
            "srv.title":               "Servidores",
            "srv.intro":               "Servidores activos de Minecraft PE 0.15.10 y 0.14.3. El estado se actualiza en tiempo real.",
            "srv.filter.all":          "Todos",
            "srv.online":              "Online",
            "srv.offline":             "Offline",
            "srv.copy":                "Copiar IP",
            "srv.no_motd":             "Sin MOTD",
            "srv.protocol":            "Protocolo:",
            "srv.query":               "Query:",
            "srv.query.on":            "Activado",
            "srv.query.off":           "Desactivado",
            "srv.query.no":            "No",
            "srv.loading":             "Cargando…",
            "srv.empty":               "No hay servidores online en este momento.",
            "srv.none":                "No hay servidores configurados.",
            "srv.star1":               "1 estrella",
            "srv.star2":               "2 estrellas",
            "srv.star3":               "3 estrellas",
            "srv.star4":               "4 estrellas",
            "srv.star5":               "5 estrellas",

            /* Credits */
            "cr.title":                "Créditos",
            "cr.intro":                "Un sitio para los que todavía juegan Minecraft PE clásico. Hecho por Nobody.",
            "cr.author":               "Autor",
            "cr.author.role":          "Creador & Desarrollador",
            "cr.author.desc":          "Hago cosas en la web. Este es uno de esos proyectos.",
            "cr.tech":                 "Tecnologías",
            "cr.tech.type.frontend":   "Frontend",
            "cr.tech.type.styles":     "Estilos",
            "cr.tech.type.interactive":"Interactividad",
            "cr.tech.type.typography": "Tipografía",
            "cr.tech.desc":            "Página estática optimizada con tecnologías modernas y diseño responsivo.",
            "cr.project":              "Proyecto",
            "cr.project.versions":     "Versiones",
            "cr.project.launch":       "Año de lanzamiento",
            "cr.project.update":       "Actualización",
            "cr.project.desc":         "Colección curada de las mejores versiones clásicas de Minecraft PE para nostalgia y disfrute.",
            "cr.skills":               "Skills",
            "cr.footer.tagline":       "Preservando la nostalgia de Minecraft PE",
            "cr.footer.rights":        "© 2026 Nobody · Todos los derechos reservados",
            "cr.footer.legal1":        "Los textos, el diseño de esta página, el logotipo LegacyCraft y el código del sitio son obra del autor salvo donde se indique lo contrario.",
            "cr.footer.legal2":        "Queda prohibida la reproducción o distribución no autorizada de los materiales propios del proyecto.",

            /* Android selector modal */
            "modal.android.eyebrow":   "Selecciona tu versión de Android",
            "modal.android.title":     "Minecraft PE 0.15.10",
            "modal.android.text":      "Elige la versión compatible con tu dispositivo Android.",
            "modal.android.normal":    "Android Normal — 76.56 MB",
            "modal.android.14":        "Android 14+ — 39.51 MB",

            /* Download gate modal */
            "modal.dl.eyebrow":        "Antes de descargar",
            "modal.dl.text":           "Si algo falla con la APK, cuéntanoslo en <strong>Discord</strong> y lo revisamos.",
            "modal.dl.discord":        "Ir a Discord",
            "modal.dl.timer.caption":  "Redirección a la descarga",
            "modal.dl.ready.caption":  "Listo para descargar",

            /* Adblock panel */
            "modal.ab.eyebrow":        "Descarga bloqueada",
            "modal.ab.text":           "Desactiva el bloqueador <strong>en esta página</strong> y pulsa Reintentar para continuar con la descarga.",
            "modal.ab.retry":          "Ya lo desactivé · Reintentar",
            "modal.ab.checking":       "Comprobando...",
            "modal.ab.stillon":        "Sigue activo, intenta de nuevo",

            /* Visitor counter tooltip */
            "visitor.title":           "Visitantes únicos"
        },

        en: {
            /* Nav */
            "nav.home":       "Home",
            "nav.downloads":  "APKs PE",
            "nav.servers":    "Servers",
            "nav.credits":    "Credits",
            "nav.lang":       "ES",

            /* Search */
            "search.placeholder": "Search...",

            /* Home — What you'll find */
            "home.whatyouget":        "What you'll find",
            "home.feature.apks":      "MCPE 0.15.10 and 0.14.3 APKs",
            "home.feature.servers":   "Active legacy servers",
            "home.feature.links":     "Direct links to MediaFire",
            "home.feature.discord":   "Discord for support",

            /* Home — How to download */
            "home.howto":             "How to download",
            "home.step1.title":       "Open APKs PE",
            "home.step1.desc":        "In the sidebar menu",
            "home.step2.title":       "Pick your version",
            "home.step2.desc":        "0.15.10 or 0.14.3",
            "home.step3.title":       "Tap Download",
            "home.step3.desc":        "Wait for the countdown",
            "home.step4.title":       "Get the APK",
            "home.step4.desc":        "From MediaFire",

            /* Home — Before installing */
            "home.beforeinstall":      "Before installing",
            "home.tip1.title":         "Enable unknown sources",
            "home.tip1.desc":          "You can't install the APK without it",
            "home.tip2.title":         "Doesn't work on Android 14+?",
            "home.tip2.desc":          "Download the alternatives below",
            "home.tip3.title":         "Back up your worlds",
            "home.tip3.desc":          "Make a copy before reinstalling",

            /* Home — Community */
            "home.community":          "Community",
            "home.community.text":     "Something not working or a broken link?",
            "home.discord.btn":        "Join Discord",

            /* Downloads */
            "dl.title":                "APK Downloads",
            "dl.015.date":             "August 2016",
            "dl.015.desc":             "Sticky pistons, treasure maps, horses and classic mobs.",
            "dl.015.f1":               "Sticky pistons",
            "dl.015.f2":               "Treasure maps",
            "dl.015.f3":               "Horses and armor",
            "dl.014.date":             "February 2016",
            "dl.014.desc":             "Basic redstone, dispensers, minecarts with chests and classic biomes.",
            "dl.014.f1":               "Redstone and dispensers",
            "dl.014.f2":               "Minecarts with chests",
            "dl.014.f3":               "Witches and cottages",
            "dl.btn.download":         "Download",

            /* Downloads — Alternatives */
            "dl.alt.title":            "Alternatives",
            "dl.alt.desc":             "If the versions above don't work on your device, try these alternatives. They include ads — install AdGuard to remove them.",
            "dl.alt1.name":            "Alternative 1 — PE 0.15.10",
            "dl.alt1.date":            "Android 14+ compatible",
            "dl.alt1.desc":            "Alternative version of Minecraft PE compatible with Android 14 and above.",
            "dl.alt1.f3":              "Contains ads",
            "dl.alt2.name":            "Alternative 2 — PE 0.15.10",
            "dl.alt2.date":            "Android 14+ compatible",
            "dl.alt2.desc":            "Second alternative for devices running Android 14 and above.",
            "dl.alt2.f3":              "Contains ads",

            /* Downloads — AdGuard */
            "dl.adguard.title":        "Block ads",
            "dl.adguard.desc":         "The alternatives include ads. Install <strong>AdGuard</strong> to remove them completely.",
            "dl.adguard.date":         "Ad blocker",
            "dl.adguard.desc2":        "Blocks all ads in the alternative versions. Install it before opening the game.",
            "dl.adguard.f1":           "No ads",
            "dl.adguard.f2":           "For alternatives",
            "dl.adguard.f3":           "Easy install",

            /* Servers */
            "srv.title":               "Servers",
            "srv.intro":               "Active Minecraft PE 0.15.10 and 0.14.3 servers. Status updates in real time.",
            "srv.filter.all":          "All",
            "srv.online":              "Online",
            "srv.offline":             "Offline",
            "srv.copy":                "Copy IP",
            "srv.no_motd":             "No MOTD",
            "srv.protocol":            "Protocol:",
            "srv.query":               "Query:",
            "srv.query.on":            "Enabled",
            "srv.query.off":           "Disabled",
            "srv.query.no":            "No",
            "srv.loading":             "Loading…",
            "srv.empty":               "No servers online right now.",
            "srv.none":                "No servers configured.",
            "srv.star1":               "1 star",
            "srv.star2":               "2 stars",
            "srv.star3":               "3 stars",
            "srv.star4":               "4 stars",
            "srv.star5":               "5 stars",

            /* Credits */
            "cr.title":                "Credits",
            "cr.intro":                "A site for those who still play classic Minecraft PE. Made by Nobody.",
            "cr.author":               "Author",
            "cr.author.role":          "Creator & Developer",
            "cr.author.desc":          "I make things on the web. This is one of those projects.",
            "cr.tech":                 "Technologies",
            "cr.tech.type.frontend":   "Frontend",
            "cr.tech.type.styles":     "Styles",
            "cr.tech.type.interactive":"Interactivity",
            "cr.tech.type.typography": "Typography",
            "cr.tech.desc":            "Static site optimized with modern technologies and responsive design.",
            "cr.project":              "Project",
            "cr.project.versions":     "Versions",
            "cr.project.launch":       "Launch year",
            "cr.project.update":       "Last update",
            "cr.project.desc":         "Curated collection of the best classic Minecraft PE versions for nostalgia and fun.",
            "cr.skills":               "Skills",
            "cr.footer.tagline":       "Preserving Minecraft PE nostalgia",
            "cr.footer.rights":        "© 2026 Nobody · All rights reserved",
            "cr.footer.legal1":        "The text, design, LegacyCraft logo and site code are the author's work unless otherwise noted.",
            "cr.footer.legal2":        "Unauthorized reproduction or distribution of the project's original materials is prohibited.",

            /* Android selector modal */
            "modal.android.eyebrow":   "Select your Android version",
            "modal.android.title":     "Minecraft PE 0.15.10",
            "modal.android.text":      "Choose the version compatible with your Android device.",
            "modal.android.normal":    "Standard Android — 76.56 MB",
            "modal.android.14":        "Android 14+ — 39.51 MB",

            /* Download gate modal */
            "modal.dl.eyebrow":        "Before downloading",
            "modal.dl.text":           "If something goes wrong with the APK, let us know on <strong>Discord</strong> and we'll check it out.",
            "modal.dl.discord":        "Go to Discord",
            "modal.dl.timer.caption":  "Redirecting to download",
            "modal.dl.ready.caption":  "Ready to download",

            /* Adblock panel */
            "modal.ab.eyebrow":        "Download blocked",
            "modal.ab.text":           "Disable your ad blocker <strong>on this page</strong> and click Retry to continue.",
            "modal.ab.retry":          "I disabled it · Retry",
            "modal.ab.checking":       "Checking...",
            "modal.ab.stillon":        "Still active, try again",

            /* Visitor counter tooltip */
            "visitor.title":           "Unique visitors"
        }
    };

    /* ── Detectar idioma: localStorage > navigator.language > "es" ── */
    var LS_LANG = "lc_lang";
    var _lang = localStorage.getItem(LS_LANG);
    if (!_lang) {
        var nav = (navigator.language || navigator.userLanguage || "es").toLowerCase();
        _lang = nav.startsWith("es") ? "es" : "en";
    }

    /* ── API pública ── */
    window.i18n = {
        t: function (key) {
            return (STRINGS[_lang] && STRINGS[_lang][key]) || (STRINGS["es"][key]) || key;
        },
        lang: function () { return _lang; },
        set: function (lang) {
            if (!STRINGS[lang]) return;
            _lang = lang;
            localStorage.setItem(LS_LANG, lang);
            applyAll();
            updateLangBtn();
            /* Re-renderizar servidores si están en pantalla */
            if (window._lcRerenderServers) window._lcRerenderServers();
        }
    };

    /* ── Aplicar traducciones al DOM ── */
    function applyAll() {
        /* data-i18n → textContent */
        document.querySelectorAll("[data-i18n]").forEach(function (el) {
            var key = el.getAttribute("data-i18n");
            el.textContent = window.i18n.t(key);
        });
        /* data-i18n-html → innerHTML (para strings con <strong> etc.) */
        document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
            var key = el.getAttribute("data-i18n-html");
            el.innerHTML = window.i18n.t(key);
        });
        /* data-i18n-placeholder → placeholder */
        document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
            var key = el.getAttribute("data-i18n-placeholder");
            el.placeholder = window.i18n.t(key);
        });
        /* data-i18n-title → title */
        document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
            var key = el.getAttribute("data-i18n-title");
            el.title = window.i18n.t(key);
        });
        /* html lang attribute */
        document.documentElement.lang = _lang;
    }

    function updateLangBtn() {
        var btn = document.getElementById("lang-toggle");
        if (btn) btn.textContent = window.i18n.t("nav.lang");
    }

    /* Aplicar al cargar */
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", applyAll);
    } else {
        applyAll();
    }
})();
