 import fs from "fs";

import { scrapeCrestinOrtodox } from "./sources/crestinortodox.js";
import { scrapePostmodern } from "./sources/postmodern.js";
import { scrapeWikipedia } from "./sources/wikipedia.js";
import { scrapeDex } from "./sources/dex.js";
import { scrapeDescopera } from "./sources/descopera.js";
import { scrapeEnciclopedia } from "./sources/enciclopedia.js";
import { scrapeCulturaGenerala } from "./sources/culturagenerala.js";
import { scrapeGithubRO } from "./sources/github_ro.js";
import { scrapeOpenTDB } from "./sources/opentdb.js";

// 🔥 AI – generator + filtru + verificator
import { scrapeAI } from "./sources/ai_generator.js";
import { filterAIQuestions } from "./utils/ai_filter.js";
import { verifyAIQuestions } from "./utils/ai_verify.js";

import { cleanQA } from "./utils/clean.js";

async function runScraper() {
    console.log("Scraping pornit...");

    let all = [];

    // Sursele tale existente
    const s1 = await scrapeCrestinOrtodox();
    const s2 = await scrapePostmodern();
    const s3 = await scrapeWikipedia();
    const s4 = await scrapeDescopera();
    const s5 = await scrapeEnciclopedia();
    const s6 = await scrapeDex();
    const s7 = await scrapeCulturaGenerala();
    const s8 = await scrapeGithubRO();
    const s9 = await scrapeOpenTDB();

    // 🔥 AI – generare
    const aiRaw = await scrapeAI();

    // 🔥 AI – filtrare suplimentară
    const aiFiltered = filterAIQuestions(aiRaw);

    // 🔥 AI – verificare factuală
    const aiVerified = await verifyAIQuestions(aiFiltered);

    // Log surse
    console.log("CrestinOrtodox:", s1.length);
    console.log("Postmodern:", s2.length);
    console.log("Wikipedia:", s3.length);
    console.log("Descopera:", s4.length);
    console.log("Enciclopedia:", s5.length);
    console.log("DEX:", s6.length);
    console.log("CulturaGenerala:", s7.length);
    console.log("GitHubRO:", s8.length);
    console.log("OpenTDB:", s9.length);
    console.log("AI (raw):", aiRaw.length);
    console.log("AI (filtrate):", aiFiltered.length);
    console.log("AI (verificate):", aiVerified.length);

    // Combinăm toate sursele
    all = [
        ...s1, ...s2, ...s3, ...s4, ...s5,
        ...s6, ...s7, ...s8, ...s9,
        ...aiVerified
    ];

    console.log("Extrase brute:", all.length);

    // Curățare finală
    const final = cleanQA(all);
    console.log("După cleanQA:", final.length);

    // Backup
    const timestamp = new Date().toISOString().split("T")[0];

    if (fs.existsSync("./intrebari.json")) {
        fs.copyFileSync("./intrebari.json", `./backup/intrebari-${timestamp}.json`);
    }

    // Scriere finală
    fs.writeFileSync(
        "./intrebari.json",
        JSON.stringify(final, null, 2),
        "utf8"
    );

    console.log("Gata! intrebari.json actualizat.");
}

runScraper();
