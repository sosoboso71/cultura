
// scrape/utils/ai_verify.js
import fetch from "node-fetch";

/**
 * Verifică factual întrebările generate de AI.
 * Elimină întrebările inventate, greșite sau ambigue.
 *
 * Primește: [{ intrebare, raspuns }]
 * Returnează: doar întrebările valide
 */
export async function verifyAIQuestions(list) {
    console.log("AI Verify: verificare factuală...");

    const HF_MODEL = "google/gemma-2b-it";

    const verified = [];

    for (const item of list) {
        const prompt = `
Verifică dacă următoarea întrebare și răspuns sunt corecte factual.

Întrebare: "${item.intrebare}"
Răspuns: "${item.raspuns}"

Reguli:
- Dacă întrebarea este reală și răspunsul este corect → răspunde EXACT cu "OK".
- Dacă întrebarea este falsă, inventată, ambiguă sau răspunsul este greșit → răspunde EXACT cu "BAD".

Răspuns:
`;

        let result = "BAD";

        try {
            const response = await fetch(
                `https://api-inference.huggingface.co/models/${HF_MODEL}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        inputs: prompt,
                        parameters: {
                            max_new_tokens: 20,
                            temperature: 0.2
                        }
                    })
                }
            );

            const data = await response.json();

            let text = "";

            if (Array.isArray(data) && data[0]?.generated_text) {
                text = data[0].generated_text;
            } else if (typeof data === "string") {
                text = data;
            } else {
                text = JSON.stringify(data);
            }

            if (text.includes("OK")) {
                result = "OK";
            }
        } catch (err) {
            console.error("AI Verify: eroare:", err);
        }

        if (result === "OK") {
            verified.push(item);
        }
    }

    console.log("AI Verify: valide:", verified.length);
    return verified;
}
