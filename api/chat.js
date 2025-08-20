// api/chat.js — werkt gegarandeerd op Vercel met fs in plaats van JSON imports
import fs from "fs";
import path from "path";

const __dirname = path.resolve();

// JSON bestanden inlezen
const flows = JSON.parse(
  fs.readFileSync(path.join(__dirname, "flows/main.flow.json"), "utf8")
);
const intents = JSON.parse(
  fs.readFileSync(path.join(__dirname, "nlu/intents.json"), "utf8")
);

const nodes = new Map(flows.nodes.map((n) => [n.id, n]));

function detectIntent(text = "") {
  const t = text.toLowerCase();
  for (const [name, list] of Object.entries(intents)) {
    if (list.some((p) => new RegExp(p, "i").test(t))) return name;
  }
  return null;
}

function nextNodeFor(text = "", currentId = "start") {
  const node = nodes.get(currentId) || nodes.get("start");
  const intent = detectIntent(text);

  // Globale snelkoppelingen
  const global = [
    { if: { intent: "demo" }, to: "faq.demo" },
    { if: { match: "menu|terug" }, to: "faq.menu" },
  ];
  for (const tr of global) {
    if (tr.if?.intent && tr.if.intent === intent) return tr.to;
    if (tr.if?.match && new RegExp(tr.if.match, "i").test(text)) return tr.to;
  }

  // Node-specifieke transitions
  for (const tr of node.transitions || []) {
    if (tr.if?.intent && tr.if.intent === intent) return tr.to;
    if (tr.if?.match && new RegExp(tr.if.match, "i").test(text)) return tr.to;
  }

  // Fallback
  return node.fallback || flows.fallback || "fallback";
}

export default function handler(req, res) {
  try {
    const { text = "", nodeId = null } = req.body || {};
    const startId = nodeId || flows.start || "start";
    const toId = nextNodeFor(text, startId);
    const to = nodes.get(toId) || nodes.get("fallback");

    res.status(200).json({
      nodeId: to.id,
      say: to.say || "…",
      buttons: to.buttons || [],
    });
  } catch (e) {
    console.error("Chat API error:", e);
    res.status(200).json({
      nodeId: "fallback",
      say: "Er ging iets mis. Typ 'FAQ' of kies een optie.",
      buttons: ["FAQ", "Start"],
    });
  }
}
