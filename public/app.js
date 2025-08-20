async function sendMessage(text) {
  const messages = document.getElementById("messages");

  messages.innerHTML += `<div class="msg user">${text}</div>`;

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  const data = await res.json();
  messages.innerHTML += `<div class="msg bot">${data.reply}</div>`;
  messages.scrollTop = messages.scrollHeight;
}

function manualSend() {
  const input = document.getElementById("user-input");
  const text = input.value;
  if (text.trim() !== "") {
    sendMessage(text);
    input.value = "";
  }
}