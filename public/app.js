let currentNode = null;
const chat  = document.getElementById('chat');
const chips = document.getElementById('chips');
const input = document.getElementById('input');
const send  = document.getElementById('send');

const timeNow = () => new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

function bubble(text, who='bot', withMeta=true){
  const row = document.createElement('div');
  row.className = `msg ${who}`;
  if (who === 'bot') {
    const av = document.createElement('div'); av.className = 'avatar'; av.textContent = 'VC';
    row.appendChild(av);
  }
  const wrap = document.createElement('div');
  const b = document.createElement('div'); b.className = 'bubble'; b.textContent = text; wrap.appendChild(b);
  if (withMeta) { const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = timeNow(); wrap.appendChild(meta); }
  row.appendChild(wrap); chat.appendChild(row); chat.scrollTop = chat.scrollHeight;
}

function typing(on=true){
  if (on){
    const row = document.createElement('div'); row.className = 'msg bot'; row.id = 'typing';
    const av = document.createElement('div'); av.className = 'avatar'; av.textContent = 'VC';
    const bub = document.createElement('div'); bub.className = 'bubble typing';
    bub.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
    row.appendChild(av); row.appendChild(bub); chat.appendChild(row); chat.scrollTop = chat.scrollHeight;
  } else { const t = document.getElementById('typing'); if (t) t.remove(); }
}

function setChips(btns) {
  chips.innerHTML = '';
  (btns || []).forEach(label => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.textContent = label;
    btn.onclick = () => { input.value = label; sendMessage(); };
    chips.appendChild(btn);
  });
}

// Calendly helpers
function loadCalendlyScript() {
  return new Promise((resolve) => {
    if (window.Calendly) return resolve();
    const s = document.createElement('script');
    s.src = 'https://assets.calendly.com/assets/external/widget.js';
    s.async = true;
    s.onload = resolve;
    document.head.appendChild(s);
  });
}
async function openPlanner() {
  await loadCalendlyScript();
  document.getElementById('planner-overlay').style.display = 'flex';
}
function closePlanner() { document.getElementById('planner-overlay').style.display = 'none'; }
document.addEventListener('click', (e)=>{ if(e.target && e.target.id==='planner-close') closePlanner(); });

// --- FAQ SaaS WOW ---
const faqItems = [
  {n:1,  t:'Wat is VANA Chat precies?',                 cat:'Algemeen',      p:'Korte uitleg wat de chatbot doet.'},
  {n:2,  t:'Voor wie is VANA Chat geschikt?',           cat:'Algemeen',      p:'Sectoren en type bedrijven.'},
  {n:3,  t:'Hoeveel kost VANA Chat?',                    cat:'Prijzen',       p:'Starter pakket, onderhoud, opties.'},
  {n:4,  t:'Hoe snel kan mijn chatbot live staan?',      cat:'Werking',       p:'Doorlooptijd vanaf intake.'},
  {n:5,  t:'Wat houdt de eenmalige set-up in?',          cat:'Werking',       p:'Wat we verzamelen en bouwen.'},
  {n:6,  t:'Wat is inbegrepen in het onderhoud?',        cat:'Werking',       p:'Monitoring en updates.'},
  {n:7,  t:'Kan de bot afspraken inplannen?',            cat:'Integraties',   p:'Boekingen via agenda/Zapier.'},
  {n:8,  t:'Werkt het met WhatsApp/Messenger?',          cat:'Integraties',   p:'WhatsApp Business, FB Messenger.'},
  {n:9,  t:'Meerdere talen mogelijk?',                   cat:'Werking',       p:'NL standaard, meertalig optie.'},
  {n:10, t:'Hoe zit het met AVG/GDPR?',                  cat:'Veiligheid',    p:'Data, platform, privacy.'},
  {n:11, t:'Wat als een vraag niet begrepen wordt?',     cat:'Werking',       p:'Fallback naar mail/CRM.'},
  {n:12, t:'Hoeveel gesprekken kan hij aan?',            cat:'Werking',       p:'Schaal tot 10.000+.'},
  {n:13, t:'Kan ik later uitbreiden?',                   cat:'Integraties',   p:'Flows, kanalen, koppelingen.'},
  {n:14, t:'Hoe verloopt de samenwerking?',              cat:'Algemeen',      p:'Intake → bouw → live → update.'},
];
const tabs = ['Alle','Algemeen','Prijzen','Integraties','Veiligheid','Werking'];

function renderFAQMenu(){
  // container bubble
  const row = document.createElement('div'); row.className = 'msg bot';
  const av = document.createElement('div'); av.className = 'avatar'; av.textContent = 'VC';
  const wrap = document.createElement('div'); const b = document.createElement('div'); b.className = 'bubble';
  b.innerHTML = `
    <strong>Veelgestelde vragen</strong>
    <div class="searchbar">
      <input id="faq-search" placeholder="🔍  Zoek in FAQ… (bijv. prijs, WhatsApp, AVG)" />
    </div>
    <div class="tabs" id="faq-tabs"></div>
    <div class="faq-grid" id="faq-grid"></div>
    <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
      <button class="chip" id="faq-demo">📅 Plan een demo</button>
      <button class="chip" id="faq-contact">Contact</button>
    </div>`;
  wrap.appendChild(b); row.appendChild(av); row.appendChild(wrap); chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;

  const grid = b.querySelector('#faq-grid');
  const search = b.querySelector('#faq-search');
  const tabsEl = b.querySelector('#faq-tabs');
  const demoBtn = b.querySelector('#faq-demo');
  const contactBtn = b.querySelector('#faq-contact');

  let query = ''; let active = 'Alle';

  function drawTabs(){
    tabsEl.innerHTML = '';
    tabs.forEach(t => {
      const el = document.createElement('button');
      el.className = 'tab' + (t===active ? ' active' : '');
      el.textContent = t;
      el.onclick = () => { active = t; draw(); drawTabs(); };
      tabsEl.appendChild(el);
    });
  }

  function draw(){
    grid.innerHTML = '';
    faqItems
      .filter(i => (active==='Alle' || i.cat===active))
      .filter(i => i.t.toLowerCase().includes(query) || i.p.toLowerCase().includes(query))
      .forEach(i => {
        const card = document.createElement('div'); card.className = 'card';
        card.innerHTML = `<div class="h">${i.t}</div><p class="p">${i.p}</p>`;
        card.onclick = () => { input.value = String(i.n); sendMessage(); };
        grid.appendChild(card);
      });
  }

  search.addEventListener('input', e => { query = e.target.value.trim().toLowerCase(); draw(); });
  demoBtn.onclick = () => openPlanner();
  contactBtn.onclick = () => { input.value = 'Contact'; sendMessage(); };

  drawTabs(); draw();
}

// Answer overlay
function openAnswer(title, text){
  const overlay = document.getElementById('answer-overlay');
  document.getElementById('answer-title').textContent = title || 'Antwoord';
  document.getElementById('answer-body').textContent = text || '';
  overlay.style.display = 'flex';
}
function closeAnswer(){ document.getElementById('answer-overlay').style.display = 'none'; }
document.getElementById('answer-close').addEventListener('click', closeAnswer);
document.getElementById('answer-back').addEventListener('click', ()=>{ closeAnswer(); renderFAQMenu(); });
document.getElementById('answer-demo').addEventListener('click', ()=>{ closeAnswer(); openPlanner(); });

async function sendMessage(){
  const text = input.value.trim();
  if (!text) return;
  bubble(text, 'user');
  input.value = '';

  typing(true);
  const res = await fetch('/chat', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ text, nodeId: currentNode })
  }).catch(()=>null);
  typing(false);

  if (!res) { bubble('Er ging iets mis met de verbinding. Probeer het nog eens.', 'bot'); return; }
  const data = await res.json();
  currentNode = data.nodeId;

  // Intercept FAQ menu
  if (data.nodeId === 'faq.menu') {
    renderFAQMenu();
    setChips(['Plan een demo','Contact']);
    return;
  }

  // Intercept FAQ answers (faq.q1..faq.q14)
  if (/^faq\.q\d+$/.test(data.nodeId)) {
    // show in overlay
    const item = faqItems.find(x => `faq.q${x.n}` === data.nodeId);
    openAnswer(item ? item.t : 'Antwoord', data.say);
    setChips(['Plan een demo','Terug naar FAQ']);
    return;
  }

  // Normal bot bubbles
  bubble(data.say, 'bot');
  setChips(data.buttons);

  if (data && data.nodeId === 'faq.demo') {
    openPlanner();
  }
}

send.addEventListener('click', sendMessage);
input.addEventListener('keydown', (e)=>{ if (e.key === 'Enter') sendMessage(); });

(function init(){
  bubble("👋 Welkom bij VANA Chat! Ik help je met vragen, prijzen en integraties.\nKies hieronder een optie of stel direct je vraag.", 'bot');
  setChips(['FAQ','Plan een demo','Contact']);
  fetch('/chat', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ text:'', nodeId:null })
  }).then(r=>r.json()).then(d => { currentNode = d.nodeId; });
})();
