export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

  const answers = {
    "wat is vana chat": "VANA Chat is een AI-chatoplossing voor bedrijven.",
    "hoeveel kost vana chat": "Onze prijzen beginnen vanaf €49 per maand.",
    "hoe snel live": "Binnen 1 week kan je chatbot live staan."
  };

  let reply = "Ik begrijp je vraag niet helemaal. Probeer het anders te formuleren.";

  for (const [key, value] of Object.entries(answers)) {
    if (text.toLowerCase().includes(key)) {
      reply = value;
      break;
    }
  }

  res.status(200).json({ reply });
}