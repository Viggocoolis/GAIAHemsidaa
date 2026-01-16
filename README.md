
readme.MD

# Namn på projektet
Matte Helper

Viggo Wessén

### Tävlar i kategori: 
Bästa AI-tillämpning, Bästa användarupplevelse (UX UI), Bästa innovativa idé.

## Projekt & Teknisk- beskrivning

Jag har gjort en Webbplats med inbyggd AI för att hjälpa användaren med läxor eller för att träna och förbättras i matte. 

Jag har importerat en API nyckel från OPENAI's Api nyckel (chatgpt), laggt till den och sagt till vilka regler den ska följa, på läxhjälpen sidan så är AI'n använd för att hjälpa till med läxor och hur man ska tänka utan att ge ett svar, på uppgifter sidan så används AI för att generera uppgifter, tips och för att kolla ditt svar. På sidorna finns det två knappar, Whiteboard och verktyg, Whiteboarden fungerar som en vanlig whiteboard, bra verktyg för att huvudräkna. I verktygslådan finns det 2 knappar, Miniräknare och Graf. Miniräknaren är använd som en vanlig miniräknare, ger svaret och fungerar som man tänker sig, Miniräknaren är avancerad altså att den innehåller SIN, COS, TAN, Roten ur, pi, procent, x^2, x^y och +,-,/ och *. Grafen är använd för att hjälpa dig med uppgifter som kräver en graf, man använder grafens skrivyta för att skriva in sin uppgift (exempel finns i grafen för testning).

### Externt producerade komponenter

Frontend: javascript, HTML5, CSS3, Plotly.js, math.js, Pointer Events.API
Backend: Node.js, Express.js, OpenAI API, dotenv, cors.

### Install
Note: 1. Server filen kan man inte kolla på i github eftersom att den innehåller känslig kod såsom: API nyckel till AI.
2. Miniräknaren fungerar bättre när servern är på (alltså AI + servern är ingång)

För att få igång servern skriv in dessa kommando i två bash terminaler en för server och en för client (kan hittas i visual studio code) För kommadot för att starta servern: 
cd server 
och
node index.js
I bash server terminalen

För att starta client bash skriv in kommandot:
cd client
serve
(om detta ej går kopiera från readme.txt i filen där finns det också hur man gör eftersom att det behöver vara space mellan cd client och serve.)


OBS: AI'n som svarar på ens frågor är från en chatgpt och är gpt-4o-mini, den slösar inte mycket av mina tokens men har ej oändligt med tokens, ungefär 6$ Cirka 55kr är tillgänglig för nycklen, dock borde det räcka i över ett år eftersom gpt-4o-mini använder relativt få tokens per prompt.)
