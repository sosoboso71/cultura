// scrape/utils/ai_filter.js

/**
 * Filtru suplimentar pentru întrebările AI.
 * Elimină pop culture, întrebări lungi, răspunsuri ambigue, duplicate etc.
 *
 * Primește: [{ intrebare, raspuns }]
 * Returnează: întrebări curate
 */
export function filterAIQuestions(list) {
    console.log("AI Filter: filtrare suplimentară...");

    const badWords = [
        "film", "serial", "actor", "actriță", "youtube", "tiktok", "instagram",
        "facebook", "joc video", "gaming", "minecraft", "fortnite", "league of legends",
        "valorant", "pubg", "csgo", "muzică", "cântec", "melodie", "album",
        "sport", "fotbal", "tenis", "basket", "nba", "fifa", "premier league",
        "celebru", "celebră", "vedetă", "influencer", "show tv"
    ];

    const seen = new Set();

    const clean = list.filter(item => {
        if (!item.intrebare || !item.raspuns) return false;

        const q = item.intrebare.trim();
        const a = item.raspuns.trim();

        // eliminăm duplicatele
        const key = q.toLowerCase() + "|" + a.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);

        // eliminăm întrebările prea lungi
        if (q.length > 120) return false;

        // eliminăm răspunsurile prea lungi
        if (a.length > 40) return false;

        // eliminăm pop culture
        const lower = q.toLowerCase();
        if (badWords.some(w => lower.includes(w))) return false;

        // eliminăm întrebările fără semn de întrebare
        if (!q.includes("?")) return false;

        // eliminăm răspunsurile cu propoziții
        if (a.includes(".") || a.includes("?") || a.includes("!")) return false;

        // eliminăm răspunsurile cu 4+ cuvinte
        if (a.split(" ").length > 4) return false;

        return true;
    });

    console.log("AI Filter: rămase după filtrare:", clean.length);
    return clean;
}
