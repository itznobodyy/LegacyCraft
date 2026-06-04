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
    }
    /* Añade más servidores aquí con el mismo formato:
    ,{
        name:        "Mi Servidor",
        ip:          "play.miserv.net",
        port:        19132,
        version:     "0.14.3",
        description: "Descripción breve del servidor",
        tags:        ["Survival", "Factions"]
    }
    */
];
