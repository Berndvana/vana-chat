let currentNode = null;
const chat = document.getElementById('chat');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send');
const chips = document.getElementById('chips');

function addMsg(text, who) {
  const div = document.createElement('div');
  div.className = 'msg ' + who;
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function setButtons(buttons) {
  chips.innerHTML = '';
  (buttons || []).forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.textContent = b;
    btn.onclick = () => {
      input.value = b;
      send();
    };
    chips.appendChild(btn);
  });
}

async function send() {
  const text = input.value;
  if (!text) return;
  addMsg(text, 'user');
  input.value = '';

  const res = await fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, nodeId: currentNode })
  });
  const data = await res.json();
  currentNode = data.nodeId;
  addMsg(data.say, 'bot');
  setButtons(data.buttons);

  // Open planner automatically for the demo node
  if (data && data.nodeId === 'faq.demo') {
    // TODO: Replace this URL with your actual scheduling link (Cal.com/Calendly/HubSpot)
    window.open('https://jouwbedrijf.nl/demo', '_blank');
  }
}

sendBtn.addEventListener('click', send);
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });

// Start dialogue
(async function(){
  const res = await fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: '', nodeId: null })
  });
  const data = await res.json();
  currentNode = data.nodeId;
  addMsg(data.say, 'bot');
  setButtons(data.buttons);
})();