 // scrape/sources/ai_generator.js
import OpenAI from "openai";

export async function generateQuestions() {
  console.log("AI: generare întrebări cu OpenAI...");

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const NUM_QUESTIONS = 100;

  const prompt = `
Generează ${NUM_QUESTIONS} întrebări de cultură generală în limba română.
Condiții OBLIGATORII:

- Întrebările trebuie să fie SCURTE și CLARE.
- Nivel: ușor–mediu, pentru adulți.
- Fără întrebări despre filme, seriale, jocuri video, celebrități, TikTok, YouTube, muzică pop, sport modern.
- Acceptate: istorie, geografie, știință de bază, anatomie simplă, literatură clasică, artă, cultură generală, logică simplă, natură, tradiții, religie (fără controverse).
- Fără întrebări cu răspunsuri subiective sau de opinie.
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

Acum generează lista completă JSON cu ${NUM_QUESTIONS} elemente.
`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Ești un generator de întrebări de cultură generală." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    const raw = completion.choices[0].message.content;

    // Extragem JSON-ul curat
    const first = raw.indexOf("[");
    const last = raw.lastIndexOf("]");

    if (first === -1 || last === -1) {
      console.error("AI: nu am găsit JSON în răspuns.");
      return [];
    }

    const jsonText = raw.slice(first, last + 1);

    const parsed = JSON.parse(jsonText);

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
  } catch (err) {
    console.error("AI: eroare la generare:", err);
    return [];
  }
}
