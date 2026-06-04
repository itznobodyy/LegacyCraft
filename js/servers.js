/* ============================================================
   LegacyCraft — Servidores
   Edita SERVERS_LIST para añadir o quitar servidores.
   Cada entrada: { name, ip, port, version, description, tags }
   version: "0.15.10" | "0.14.3" | "ambas"
============================================================ */

window.SERVERS_LIST = [
    {
        name:        "BerryMC",
        ip:          "berrymc.ddns.net",
        port:        25565,
        version:     "0.15.10",
        description: "Servidor survival clásico de MCPE 0.15.X",
        tags:        ["Survival", "PvP"]
    },
    {
        name:        "AstralMC",
        ip:          "AstralMC.holynodes.com",
        port:        25589,
        version:     "0.15.10",
        description: "Servidor de MCPE clásico con comunidad activa",
        tags:        ["SMP", "Survival", "PvP"]
    },
    {
        name:        "OasisMC",
        ip:          "OasisMC.ddns.net",
        port:        29763,
        version:     "ambas",
        description: "Red clásica de Minecraft PE con múltiples modos de juego",
        tags:        ["Survival", "Economy", "Factions", "Roleplay"]
    },
    {
        name:        "CrowdWix",
        ip:          "CrowdWix.ddns.net",
        port:        2456,
        version:     "0.15.10",
        description: "Servidor MCPE legacy con comunidad establecida",
        tags:        ["SMP", "PvP", "Minigames"]
    }
];
