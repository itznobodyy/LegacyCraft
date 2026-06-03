(function () {
    // Actualizar selectores para el nuevo diseño replicado
    var views = document.querySelectorAll(".content-section");
    var navLinks = document.querySelectorAll(".menu-item[data-section]");

    function sectionFromHash() {
        // Siempre volver a inicio al recargar la página
        if (window.performance && window.performance.navigation.type === 1) {
            return "inicio";
        }
        
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

    // Siempre limpiar hash al recargar y volver a inicio
    if (window.performance && window.performance.navigation.type === 1) {
        if (history.replaceState) {
            history.replaceState(null, "", "#inicio");
        }
    } else if (!window.location.hash || window.location.hash === "#") {
        if (history.replaceState) {
            history.replaceState(null, "", "#inicio");
        }
    }
    showSection(sectionFromHash());

    // Búsqueda principal mejorada - busca cualquier cosa en la página
    var mainSearch = document.getElementById("main-search");
    var list = document.getElementById("apk-list");
    
    if (mainSearch) {
        mainSearch.addEventListener("input", function () {
            var q = mainSearch.value.trim().toLowerCase();
            if (q.length === 0) {
                // Mostrar todo si no hay búsqueda
                showAllContent();
                return;
            }
            
            // Detectar qué sección tiene mejores resultados y cambiar automáticamente
            var bestSection = detectBestSection(q);
            if (bestSection) {
                switchToSection(bestSection);
            }
            
            // Buscar en APKs
            if (list) {
                var apkItems = list.querySelectorAll(".apk-item");
                apkItems.forEach(function (el) {
                    var searchableText = getSearchableText(el);
                    el.style.display = fuzzyMatch(q, searchableText) ? "" : "none";
                });
            }
            
            // Buscar en secciones de contenido
            searchInSections(q);
            
            // Buscar en menú
            searchInMenu(q);
        });
    }
    
    // Función para detectar la mejor sección para la búsqueda
    function detectBestSection(query) {
        var sectionScores = {};
        
        // Puntuar sección APKs
        if (list) {
            var apkItems = list.querySelectorAll(".apk-item");
            var apkMatches = 0;
            apkItems.forEach(function (el) {
                var searchableText = getSearchableText(el);
                if (fuzzyMatch(query, searchableText)) {
                    apkMatches++;
                    // Dar puntos extra por coincidencias importantes
                    if (searchableText.includes('android') && query.includes('android')) {
                        apkMatches += 2;
                    }
                    if (searchableText.includes('14') && query.includes('14')) {
                        apkMatches += 2;
                    }
                    if (searchableText.includes('15') && query.includes('15')) {
                        apkMatches += 2;
                    }
                }
            });
            if (apkMatches > 0) {
                sectionScores['apks'] = apkMatches;
            }
        }
        
        // Puntuar sección Inicio
        var inicioSection = document.getElementById("inicio");
        if (inicioSection) {
            var inicioText = getSearchableText(inicioSection);
            var inicioScore = fuzzyMatch(query, inicioText) ? 3 : 0;
            
            // Palabras clave específicas de Inicio
            if (query.includes('bienven') || query.includes('inicio') || query.includes('descarg') || query.includes('instal')) {
                inicioScore += 5;
            }
            
            if (inicioScore > 0) {
                sectionScores['inicio'] = inicioScore;
            }
        }
        
        // Puntuar sección Créditos
        var creditosSection = document.getElementById("creditos");
        if (creditosSection) {
            var creditosText = getSearchableText(creditosSection);
            var creditosScore = fuzzyMatch(query, creditosText) ? 2 : 0;
            
            // Palabras clave específicas de Créditos
            if (query.includes('credit') || query.includes('autor') || query.includes('github') || query.includes('discord')) {
                creditosScore += 5;
            }
            
            if (creditosScore > 0) {
                sectionScores['creditos'] = creditosScore;
            }
        }
        
        // Encontrar la sección con mayor puntuación
        var bestSection = null;
        var maxScore = 0;
        
        for (var section in sectionScores) {
            if (sectionScores[section] > maxScore) {
                maxScore = sectionScores[section];
                bestSection = section;
            }
        }
        
        return bestSection;
    }
    
    // Función para cambiar a una sección específica
    function switchToSection(sectionId) {
        // Guardar el foco del buscador
        var searchInput = document.getElementById("main-search");
        var wasFocused = searchInput && document.activeElement === searchInput;
        var searchValue = searchInput ? searchInput.value : "";
        
        // Actualizar hash y mostrar sección
        if (window.location.hash !== "#" + sectionId) {
            window.location.hash = sectionId;
        } else {
            showSection(sectionId);
        }
        
        // Actualizar menú activo
        var navLinks = document.querySelectorAll(".menu-item[data-section]");
        navLinks.forEach(function (a) {
            a.classList.toggle("is-active", a.getAttribute("data-section") === sectionId);
        });
        
        // Restaurar el foco y el valor del buscador si estaba enfocado
        if (wasFocused && searchInput) {
            setTimeout(function() {
                searchInput.focus();
                searchInput.value = searchValue;
            }, 10);
        }
    }
    
    // Función para obtener todo el texto searchable de un elemento
    function getSearchableText(element) {
        var texts = [];
        
        // Atributo data-search
        var dataSearch = element.getAttribute("data-search");
        if (dataSearch) texts.push(dataSearch);
        
        // Texto del elemento
        texts.push(element.textContent || element.innerText);
        
        // Títulos y descripciones importantes
        var titles = element.querySelectorAll("h1, h2, h3, .apk-name, .section-title");
        titles.forEach(function(title) {
            texts.push(title.textContent || title.innerText);
        });
        
        var descriptions = element.querySelectorAll("p, .apk-desc, .section-description");
        descriptions.forEach(function(desc) {
            texts.push(desc.textContent || desc.innerText);
        });
        
        // Características y etiquetas
        var features = element.querySelectorAll("li, .apk-tag, .apk-date");
        features.forEach(function(feature) {
            texts.push(feature.textContent || feature.innerText);
        });
        
        return texts.join(" ").toLowerCase();
    }
    
    // Función de búsqueda difusa (tolerante a errores)
    function fuzzyMatch(query, text) {
        if (!query || !text) return false;
        
        // Búsqueda exacta primero
        if (text.includes(query)) return true;
        
        // Búsqueda de palabras individuales
        var queryWords = query.split(" ").filter(function(word) { return word.length > 0; });
        var textWords = text.split(" ").filter(function(word) { return word.length > 0; });
        
        // Si todas las palabras de la consulta están en el texto
        var allWordsFound = queryWords.every(function(qWord) {
            return textWords.some(function(tWord) {
                return tWord.includes(qWord) || qWord.includes(tWord) || 
                       levenshteinDistance(qWord, tWord) <= Math.max(1, Math.floor(qWord.length * 0.3));
            });
        });
        
        if (allWordsFound) return true;
        
        // Búsqueda por subcadenas
        return queryWords.some(function(qWord) {
            return textWords.some(function(tWord) {
                return tWord.includes(qWord) || qWord.includes(tWord);
            });
        });
    }
    
    // Distancia de Levenshtein simple (para tolerancia a errores)
    function levenshteinDistance(str1, str2) {
        var matrix = [];
        var i, j;
        
        for (i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (i = 1; i <= str2.length; i++) {
            for (j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
    
    // Función para mostrar todo el contenido
    function showAllContent() {
        // Mostrar todos los APKs
        if (list) {
            var apkItems = list.querySelectorAll(".apk-item");
            apkItems.forEach(function (el) {
                el.style.display = "";
            });
        }
        
        // Mostrar todas las secciones
        var sections = document.querySelectorAll(".content-section");
        sections.forEach(function(section) {
            section.style.display = "";
        });
        
        // Mostrar todos los menús
        var menuItems = document.querySelectorAll(".menu-item");
        menuItems.forEach(function(item) {
            item.style.display = "";
        });
    }
    
    // Buscar en secciones de contenido
    function searchInSections(query) {
        var sections = document.querySelectorAll(".content-section");
        sections.forEach(function(section) {
            var searchableText = getSearchableText(section);
            section.style.display = fuzzyMatch(query, searchableText) ? "" : "none";
        });
    }
    
    // Buscar en menú
    function searchInMenu(query) {
        var menuItems = document.querySelectorAll(".menu-item");
        menuItems.forEach(function(item) {
            var searchableText = item.textContent || item.innerText;
            item.style.display = fuzzyMatch(query, searchableText.toLowerCase()) ? "" : "none";
        });
    }

    var GATE_SECONDS = 10;
    var gateEl = document.getElementById("download-gate");
    var panelMain = document.getElementById("download-gate-panel-main");
    var panelAdblock = document.getElementById("download-gate-panel-adblock");
    var countEl = document.getElementById("download-count");
    var progressBar = document.getElementById("download-progress-bar");
    var mediafireContainer = document.getElementById("download-gate__mediafire");
    var mediafireBtn = document.getElementById("mediafire-download-btn");
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
        if (mediafireContainer) mediafireContainer.hidden = true;
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

    function openMediafireInNewTab(url) {
        var f = document.createElement("form");
        f.setAttribute("method", "get");
        f.setAttribute("action", url);
        f.setAttribute("target", "_blank");
        f.style.cssText = "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0";
        document.body.appendChild(f);
        f.submit();
        if (f.parentNode) {
            f.parentNode.removeChild(f);
        }
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

        // Reiniciar estado: mostrar contador y ocultar botón MediaFire
        var timerContainer = document.querySelector('.download-gate__timer');
        if (timerContainer) timerContainer.hidden = false;
        if (mediafireContainer) mediafireContainer.hidden = true;

        var left = GATE_SECONDS;
        countEl.textContent = String(left);
        setGateProgress(left);

        gateTimer = window.setInterval(function () {
            left -= 1;
            if (left <= 0) {
                window.clearInterval(gateTimer);
                gateTimer = null;
                gateActive = false;
                
                // Ocultar el contador y mostrar el botón de MediaFire
                var timerContainer = document.querySelector('.download-gate__timer');
                if (timerContainer) timerContainer.hidden = true;
                if (mediafireContainer) {
                    mediafireContainer.hidden = false;
                    if (mediafireBtn) {
                        mediafireBtn.href = url;
                        
                        // Agregar event listener aquí, cuando el botón es visible
                        mediafireBtn.onclick = function(e) {
                            setTimeout(function() {
                                closeDownloadGate();
                            }, 100);
                        };
                    }
                }
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
    
    // También cerrar al hacer clic fuera del contenido del modal
    if (gateEl) {
        gateEl.addEventListener("click", function (e) {
            if (e.target === gateEl || e.target === gateBackdrop) {
                if (!gateEl.hidden) closeDownloadGate();
            }
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

    // Variables para el selector de Android
    var androidSelectorEl = document.getElementById("android-selector");
    var androidSelectorBackdrop = androidSelectorEl ? androidSelectorEl.querySelector(".download-gate__backdrop") : null;

    // Función para mostrar el selector de Android
    function showAndroidSelector() {
        if (androidSelectorEl) {
            androidSelectorEl.hidden = false;
            document.body.classList.add("download-gate-open");
        }
    }

    // Función para cerrar el selector de Android
    function closeAndroidSelector() {
        if (androidSelectorEl) {
            androidSelectorEl.hidden = true;
            document.body.classList.remove("download-gate-open");
        }
    }

    // Event listeners para el selector de Android
    if (androidSelectorBackdrop) {
        androidSelectorBackdrop.addEventListener("click", function () {
            closeAndroidSelector();
        });
    }
    
    // También cerrar al hacer clic fuera del contenido del selector de Android
    if (androidSelectorEl) {
        androidSelectorEl.addEventListener("click", function (e) {
            if (e.target === androidSelectorEl || e.target === androidSelectorBackdrop) {
                if (!androidSelectorEl.hidden) closeAndroidSelector();
            }
        });
    }

    document.querySelectorAll(".android-selector-btn").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            var url = btn.getAttribute("data-url");
            if (!url) return;
            
            // Cerrar selector de Android
            closeAndroidSelector();
            
            // Abrir el modal de descarga normal con la URL seleccionada
            detectAdblock().then(function (blocked) {
                if (blocked) {
                    showAdblockGate(url);
                    return;
                }
                openDownloadGate(url);
            });
        });
    });

    document.querySelectorAll(".btn-download-gate").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
            var version = btn.getAttribute("data-version");
            
            // Si es la versión 0.15.10, mostrar selector de Android
            if (version === "0.15.10") {
                e.preventDefault();
                detectAdblock().then(function (blocked) {
                    if (blocked) {
                        showAdblockGate("#");
                        return;
                    }
                    showAndroidSelector();
                });
                return;
            }
            
            // Para otras versiones, usar el flujo normal
            var url = btn.getAttribute("href");
            if (!url || url === "#") return;
            e.preventDefault();
            detectAdblock().then(function (blocked) {
                if (blocked) {
                    showAdblockGate(url);
                    return;
                }
                openDownloadGate(url);
            });
        });
    });
})();
