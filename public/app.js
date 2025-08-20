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

// --- FAQ Cards + Search ---
function renderFAQMenu(){
  const items = [
    {n:1, t:'Wat is VANA Chat precies?'},
    {n:2, t:'Voor wie is VANA Chat geschikt?'},
    {n:3, t:'Hoeveel kost VANA Chat?'},
    {n:4, t:'Hoe snel kan mijn chatbot live staan?'},
    {n:5, t:'Wat houdt de eenmalige set-up in?'},
    {n:6, t:'Wat is inbegrepen in onderhoud?'},
    {n:7, t:'Kan de bot afspraken inplannen?'},
    {n:8, t:'Werkt het met WhatsApp/Messenger?'},
    {n:9, t:'Meerdere talen mogelijk?'},
    {n:10, t:'Hoe zit het met AVG/GDPR?'},
    {n:11, t:'Wat als een vraag niet begrepen wordt?'},
    {n:12, t:'Hoeveel gesprekken kan hij aan?'},
    {n:13, t:'Kan ik later uitbreiden?'},
    {n:14, t:'Hoe verloopt de samenwerking?'}
  ];

  const row = document.createElement('div'); row.className = 'msg bot';
  const av = document.createElement('div'); av.className = 'avatar'; av.textContent = 'VC';
  const wrap = document.createElement('div'); const b = document.createElement('div'); b.className = 'bubble';
  b.innerHTML = `<strong>Veelgestelde vragen</strong>
    <div class="faq-wrap">
      <div class="faq-top">
        <input id="faq-search" class="faq-search" placeholder="Zoek in FAQ… (bijv. prijs, WhatsApp, AVG)" />
        <button class="linkish" id="faq-more">Toon alle</button>
      </div>
      <div class="faq-grid" id="faq-grid"></div>
      <div class="faq-actions">
        <button class="chip" id="faq-demo">Plan een demo</button>
        <div class="faq-note">Tip: klik op een vraag of gebruik de zoekfunctie</div>
      </div>
    </div>`;
  wrap.appendChild(b); row.appendChild(av); row.appendChild(wrap); chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;

  const grid = b.querySelector('#faq-grid');
  const moreBtn = b.querySelector('#faq-more');
  const search = b.querySelector('#faq-search');
  const demoBtn = b.querySelector('#faq-demo');

  let expanded = false;
  let query = '';

  function draw(){
    grid.innerHTML = '';
    const base = expanded ? items : items.slice(0,5);
    base
      .filter(({t}) => t.toLowerCase().includes(query.toLowerCase()))
      .forEach(({n,t}) => {
        const card = document.createElement('div');
        card.className = 'faq-card';
        card.innerHTML = `<div class="faq-num">${n}</div><div class="faq-title">${t}</div>`;
        card.onclick = () => { input.value = String(n); sendMessage(); };
        grid.appendChild(card);
      });
    moreBtn.textContent = expanded ? 'Toon minder' : 'Toon alle';
  }
  draw();

  moreBtn.onclick = () => { expanded = !expanded; draw(); };
  search.addEventListener('input', (e)=>{ query = e.target.value; draw(); });
  demoBtn.onclick = () => openPlanner();
}

async function sendMessage(){
  const text = input.value.trim();
  if (!text) return;
  bubble(text, 'user');
  input.value = '';

  typing(true);
  const res = await fetch('/chat', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ text, nodeId: currentNode })
  }).catch(()=>null);
  typing(false);

  if (!res) { bubble('Er ging iets mis met de verbinding. Probeer het nog eens.', 'bot'); return; }
  const data = await res.json();
  currentNode = data.nodeId;

  if (data.nodeId === 'faq.menu') {
    renderFAQMenu();
    setChips(['Plan een demo','Contact']);
    return;
  }

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
