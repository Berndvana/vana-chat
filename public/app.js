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
  bubble(data.say, 'bot');
  setChips(data.buttons);

  if (data && data.nodeId === 'faq.demo') {
    openPlanner();
  }
}

send.addEventListener('click', sendMessage);
input.addEventListener('keydown', (e)=>{ if (e.key === 'Enter') sendMessage(); });

// Greeting + flow bootstrap
(function init(){
  bubble("👋 Welkom bij VANA Chat! Ik help je met vragen, prijzen en integraties.\nKies hieronder een optie of stel direct je vraag.", 'bot');
  setChips(['FAQ','Plan een demo','Contact']);
  fetch('/chat', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ text:'', nodeId:null })
  }).then(r=>r.json()).then(d => { currentNode = d.nodeId; });
})();
