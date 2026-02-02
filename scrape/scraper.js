 import { generateQuestions } from "./sources/ai_generator.js";
import fs from "fs";

async function run() {
  console.log("Pornesc generatorul AI...");

  try {
    const questions = await generateQuestions();

    // GitHub Actions rulează DEJA în folderul /scrape,
    // deci fișierul trebuie scris direct aici:
    fs.writeFileSync(
      "./intrebari.json",
      JSON.stringify(questions, null, 2),
      "utf8"
    );

    console.log(`Gata! Am generat ${questions.length} întrebări.`);
  } catch (err) {
    console.error("Eroare la generare:", err);
    process.exit(1);
  }
}

run();
