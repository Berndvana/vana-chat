import flows from '../flows/main.flow.json' assert { type: 'json' };
import intents from '../nlu/intents.json' assert { type: 'json' };

const nodes = new Map(flows.nodes.map(n => [n.id, n]));

function detectIntent(text = '') {
  const t = text.toLowerCase();
  for (const [name, list] of Object.entries(intents)) {
    if (list.some(p => new RegExp(p, 'i').test(t))) return name;
  }
  return null;
}

function nextNodeFor(text = '', currentId = 'start') {
  const node = nodes.get(currentId) || nodes.get('start');
  const intent = detectIntent(text);

  const global = [
    { if: { intent: 'demo' }, to: 'faq.demo' },
    { if: { match: 'menu|terug' }, to: 'faq.menu' },
  ];
  for (const tr of global) {
    if (tr.if?.intent && tr.if.intent === intent) return tr.to;
    if (tr.if?.match && new RegExp(tr.if.match, 'i').test(text)) return tr.to;
  }

  for (const tr of (node.transitions || [])) {
    if (tr.if?.intent && tr.if.intent === intent) return tr.to;
    if (tr.if?.match && new RegExp(tr.if.match, 'i').test(text)) return tr.to;
  }

  return node.fallback || flows.fallback || 'fallback';
}

export default async function handler(req, res) {
  try {
    const { text = '', nodeId = null } = req.body || {};
    const startId = nodeId || flows.start || 'start';
    const nextId = nextNodeFor(text, startId);
    const target = nodes.get(nextId) || nodes.get('fallback');

    res.status(200).json({
      nodeId: target.id,
      say: target.say || '…',
      buttons: target.buttons || [],
    });
  } catch (e) {
    console.error(e);
    res.status(200).json({
      nodeId: 'fallback',
      say: "Er ging iets mis. Typ 'FAQ' of kies een optie.",
      buttons: ['FAQ', 'Start'],
    });
  }
}
