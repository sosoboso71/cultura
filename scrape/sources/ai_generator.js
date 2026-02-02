// scrape/sources/ai_generator.js
import fetch from "node-fetch";

/**
 * Generează întrebări de cultură generală în limba română
 * folosind un model HuggingFace accesibil fără autentificare.
 *
 * Returnează un array de obiecte:
 * { intrebare: string, raspuns: string }
 */
export async function scrapeAI() {
    console.log("AI: generare întrebări...");

    const NUM_QUESTIONS = 100;

    const prompt = `
Generează ${NUM_QUESTIONS} întrebări de cultură generală în limba română.
Condiții OBLIGATORII:

- Întrebările trebuie să fie SCURTE și CLARE.
- Nivel: ușor–mediu, pentru adulți.
- Fără întrebări despre filme, seriale, jocuri video, celebrități, TikTok, YouTube, muzică pop, sport modern.
- Acceptate: istorie, geografie, știință de bază, anatomie simplă, literatură clasică, artă, cultură generală, logică simplă, natură, tradiții, religie (fără controverse).
- Fără întrebări cu răspunsuri subiective sau de opinie.
- Fără întrebări de tip "care este părerea ta" sau "ce crezi despre".
- Fără întrebări prea tehnice sau academice.
- Fără întrebări cu răspunsuri foarte lungi.
- Răspunsul trebuie să fie un singur cuvânt sau o expresie scurtă.

FORMAT STRICT:

Întoarce DOAR o listă JSON, fără text în plus, fără explicații, fără comentarii.
Fiecare element trebuie să fie de forma:
{
  "intrebare": "text întrebare?",
  "raspuns": "text răspuns"
}

Exemplu de structură (doar structură, nu repeta aceste întrebări):

[
  {
    "intrebare": "Care este capitala Franței?",
    "raspuns": "Paris"
  },
  {
    "intrebare": "Ce planetă este cunoscută ca Planeta Roșie?",
    "raspuns": "Marte"
  }
]

Acum generează lista completă JSON cu ${NUM_QUESTIONS} elemente.
`;

    // Poți schimba modelul dacă vrei altceva
    const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.2";

    const url = `https://api-inference.huggingface.co/models/${encodeURIComponent(
        HF_MODEL
    )}`;

    let rawText = "";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
                // fără Authorization – folosim endpoint public
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 2048,
                    temperature: 0.7,
                    top_p: 0.9
                }
            })
        });

        if (!response.ok) {
            console.error("AI: eroare HTTP:", response.status, await response.text());
            return [];
        }

        const data = await response.json();

        // HuggingFace poate întoarce fie { generated_text }, fie array
        if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
            rawText = data[0].generated_text;
        } else if (typeof data === "string") {
            rawText = data;
        } else {
            rawText = JSON.stringify(data);
        }
    } catch (err) {
        console.error("AI: eroare la fetch:", err);
        return [];
    }

    // Încercăm să extragem JSON-ul din text
    let jsonPart = rawText;

    const firstBracket = rawText.indexOf("[");
    const lastBracket = rawText.lastIndexOf("]");

    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        jsonPart = rawText.slice(firstBracket, lastBracket + 1);
    }

    let parsed = [];
    try {
        parsed = JSON.parse(jsonPart);
    } catch (err) {
        console.error("AI: eroare la parsarea JSON:", err);
        return [];
    }

    // Normalizăm structura la { intrebare, raspuns }
    const result = parsed
        .filter(
            (item) =>
                item &&
                typeof item.intrebare === "string" &&
                typeof item.raspuns === "string"
        )
        .map((item) => ({
            intrebare: item.intrebare.trim(),
            raspuns: item.raspuns.trim()
        }));

    console.log("AI: întrebări generate:", result.length);

    return result;
}
