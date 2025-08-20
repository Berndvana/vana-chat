const chatBox = document.getElementById('chat-box');
const input = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const typing = document.getElementById('typing-indicator');
const chips = document.querySelectorAll('.chip');

function addMessage(text, sender='user') {
  const div = document.createElement('div');
  div.className = 'chat-bubble ' + sender;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function botReply(text) {
  typing.style.display = 'block';
  setTimeout(() => {
    typing.style.display = 'none';
    addMessage(text, 'bot');
  }, 800);
}

sendBtn.addEventListener('click', () => {
  const msg = input.value.trim();
  if (!msg) return;
  addMessage(msg, 'user');
  input.value = '';
  // fake bot logic
  if (msg.toLowerCase().includes('faq')) {
    botReply('Veelgestelde vragen: 1) Wat is VANA Chat? 2) Hoeveel kost het? 3) Hoe snel live?');
  } else if (msg.toLowerCase().includes('demo')) {
    botReply('Klik hier om een demo te plannen 👉');
    setTimeout(() => { window.open('https://jouwbedrijf.nl/demo', '_blank'); }, 1200);
  } else {
    botReply('Bedankt voor je bericht! Ons team neemt snel contact met je op.');
  }
});

chips.forEach(chip => {
  chip.addEventListener('click', () => {
    addMessage(chip.textContent, 'user');
    if (chip.textContent.includes('FAQ')) botReply('Veelgestelde vragen: 1) Wat is VANA Chat? 2) Hoeveel kost het?');
    if (chip.textContent.includes('Plan')) botReply('Klik hier om een demo te plannen 👉');
    if (chip.textContent.includes('Contact')) botReply('Je kunt ons bereiken via info@jouwbedrijf.nl');
  });
});
