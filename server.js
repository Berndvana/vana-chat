// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helpers to load flow & intents
function loadFlow(name) {
  const data = fs.readFileSync(path.join(__dirname, 'flows', name), 'utf8');
  return JSON.parse(data);
}
function loadIntents() {
  const data = fs.readFileSync(path.join(__dirname, 'nlu', 'intents.json'), 'utf8');
  return JSON.parse(data);
}

const flow = loadFlow('main.flow.json');
const intents = loadIntents();

// Simple intent detection
function detectIntent(text) {
  text = (text || '').toLowerCase();
  for (const [intent, patterns] of Object.entries(intents)) {
    for (const pat of patterns) {
      const re = new RegExp(pat, 'i');
      if (re.test(text)) return intent;
    }
  }
  return null;
}

// Global transitions (e.g., capture "plan demo" from anywhere)
const GLOBAL_TRANSITIONS = [
  { if: { intent: 'demo' }, to: 'faq.demo' }
];

// Find next node based on text and current node
function nextNodeFor(text, node) {
  const intent = detectIntent(text || '');

  // 0) Global transitions first
  for (const tr of GLOBAL_TRANSITIONS) {
    if (tr.if?.intent && tr.if.intent === intent) return tr.to;
    if (tr.if?.match && new RegExp(tr.if.match, 'i').test(text || '')) return tr.to;
  }

  // 1) Intent transitions within node
  const byIntent = (node.transitions || []).find(tr => tr.if?.intent === intent);
  if (byIntent) return byIntent.to;

  // 2) Regex transitions within node
  const byRegex = (node.transitions || []).find(tr => tr.if?.match && new RegExp(tr.if.match, 'i').test(text || ''));
  if (byRegex) return byRegex.to;

  // 3) Fallback
  return node.fallback || flow.fallback || 'fallback';
}

// Utility to find a node by id
function findNode(id) {
  return flow.nodes.find(n => n.id === id);
}

// Chat API
app.post('/chat', (req, res) => {
  const { text, nodeId } = req.body;
  const currentNode = findNode(nodeId || flow.start);
  const nextId = nextNodeFor(text, currentNode);
  const nextNode = findNode(nextId);
  res.json({
    nodeId: nextNode.id,
    say: nextNode.say,
    buttons: nextNode.buttons || []
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Bot listening on http://localhost:${PORT}`));
