const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const quickActions = document.getElementById('quick-actions');

function bubble(msg, sender='bot') {
  const div = document.createElement('div');
  div.className = 'chat-bubble ' + sender;
  div.textContent = msg;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener('click', () => {
  const text = userInput.value.trim();
  if (!text) return;
  bubble(text, 'user');
  userInput.value = '';
  if (text.toLowerCase().includes('demo')) {
    openPlanner();
    bubble('Ik heb de agenda geopend zodat je direct een demo kan inplannen!', 'bot');
  } else {
    bubble('Bedankt voor je bericht! Een medewerker neemt zo snel mogelijk contact op.', 'bot');
  }
});

quickActions.addEventListener('click', (e) => {
  if (e.target.classList.contains('chip')) {
    const choice = e.target.textContent;
    bubble(choice, 'user');
    if (choice === 'Plan een demo') {
      openPlanner();
      bubble('Ik heb de agenda geopend zodat je direct een demo kan inplannen!', 'bot');
    } else if (choice === 'FAQ') {
      bubble('Je kunt alles vinden in onze FAQ-sectie.', 'bot');
    } else if (choice === 'Contact') {
      bubble('Stuur ons een mail via support@vanachat.com.', 'bot');
    }
  }
});

// Calendly integratie
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

function closePlanner() {
  document.getElementById('planner-overlay').style.display = 'none';
}

document.getElementById('planner-close').addEventListener('click', closePlanner);
