# VANA Chat — Starterpakket

Dit pakket bevat een werkende mini-chatbot met FAQ-flow en een **Plan een demo**-actie.

## Inhoud
```
vana-chat/
 ├─ server.js
 ├─ flows/
 │   └─ main.flow.json
 ├─ nlu/
 │   └─ intents.json
 └─ public/
     ├─ index.html
     └─ app.js
```

## Benodigdheden
- Node.js (LTS): https://nodejs.org (na installatie kun je `node -v` draaien).

## Snelstart (na het uitpakken)
1) Open een terminal in de uitgepakte map `vana-chat/`  
2) Installeer dependencies:
```bash
npm init -y
npm install express cors
```
3) Start de server:
```bash
node server.js
```
4) Open in je browser: http://localhost:3000

Je ziet het chatvenster met FAQ-knoppen. Typ **Plan een demo** of klik op de knop; dit opent je demo-planner in een nieuw tabblad (pas de URL in `public/app.js` aan).

## Demo-planner koppelen
- Vervang in `public/app.js` de placeholder URL:
```js
window.open('https://jouwbedrijf.nl/demo', '_blank'); // ← vervang met je Cal.com/Calendly/HubSpot link
```

## Op je website zetten (iframe)
Publiceer deze app (bijv. Render/Railway/Fly.io/VPS). Plaats daarna op jouw website:
```html
<iframe src="https://chat.jouwdomein.nl" style="width:400px;height:600px;border:0;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.1)"></iframe>
```

## Veelvoorkomende fouten
- **Unexpected identifier** in Node: zorg dat `server.js` alleen JavaScript bevat (geen uitleg/markdown).
- **Port in use**: er draait al iets op poort 3000. Sluit die app of start met `PORT=4000 node server.js` (Windows PowerShell: `$env:PORT=4000; node server.js`).

Succes! 🚀
"# vana-chat" 
"# vana-chat" 
