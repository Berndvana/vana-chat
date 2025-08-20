// api/chat.js — fix voor Vercel bestandslocaties
import fs from "fs";
import path from "path";

const baseDir = process.cwd();

// JSON-bestanden inlezen uit de project root
const flows = JSON.parse(
  fs.readFileSync(path.join(baseDir, "flows/main.flow.json"), "utf8")
);
const intents = JSON.parse(
  fs.readFileSync(path.join(baseDir, "nlu/intents.json"), "utf8")
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

  const global = [
    { if: { intent: "demo" }, to: "faq.demo" },
    { if: { match: "menu|terug" }, to: "faq.menu" },
  ];
  for (const tr of global) {
    if (tr.if?.intent && tr.if.intent === intent) return tr.to;
    if (tr.if?.match && new RegExp(tr.if.match, "i").test(text)) return tr.to;
  }

  for (const tr of node.transitions || []) {
    if (tr.if?.intent && tr.if.intent === intent) return tr.to;
    if (tr.if?.match && new RegExp(tr.if.match, "i").test(text)) return tr.to;
  }

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
      say: "⚠️ Er ging iets mis in de serverless functie",
      buttons: ["FAQ", "Start"],
    });
  }
}
