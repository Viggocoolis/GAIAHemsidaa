const API_BASE = "http://localhost:3001";

let currentId = null;
let currentHint = "";
let currentQuestion = "";

const topicsByLevel = {
  "Grundskola åk 1–3": ["Addition", "Subtraktion", "Enkel multiplikation", "Enkla bråk", "Klockan"],
  "Grundskola åk 4–6": ["Multiplikation", "Division", "Bråk", "Procent (enkelt)", "Geometri", "Enkla ekvationer"],
  "Grundskola åk 7–9": ["Procent", "Algebra", "Ekvationer", "Geometri", "Sannolikhet", "Funktioner (grund)"],
  "Gymnasiet Matte 1": ["Algebra", "Funktioner", "Ekvationer", "Geometri", "Statistik"],
  "Gymnasiet Matte 2": ["Trigonometri", "Funktioner", "Exponential", "Logaritmer (grund)", "Geometri"],
  "Gymnasiet Matte 3": ["Derivata", "Grafer", "Optimering", "Trig", "Log/exp"],
  "Gymnasiet Matte 4": ["Integraler", "Derivata (svårare)", "Komplexa tal (grund)", "Vektorer"],
  "Gymnasiet Matte 5": ["Komplexa tal", "Integraler", "Fördjupning derivata", "Differentialekvation (grund)"]
};

function byId(id) { return document.getElementById(id); }

const levelEl = byId("level");
const topicEl = byId("topic");
const diffEl = byId("difficulty");

const nextBtn = byId("nextBtn");
const poolInfo = byId("poolInfo");

const questionEl = byId("question");
const answerInput = byId("answerInput");

const checkBtn = byId("checkBtn");
const hintBtn = byId("hintBtn");
const checkAttemptBtn = byId("checkAttemptBtn");

const feedbackEl = byId("feedback");
const aiBox = byId("aiBox");

function fillTopics() {
  const lvl = levelEl.value;
  const arr = topicsByLevel[lvl] || ["Addition", "Subtraktion"];

  topicEl.innerHTML = "";
  for (const t of arr) {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    topicEl.appendChild(opt);
  }
}

async function loadProblem() {
  const level = levelEl.value;
  const topic = topicEl.value;
  const difficulty = diffEl.value;

  poolInfo.textContent = "Genererar uppgift…";

  const res = await fetch(`${API_BASE}/api/problem`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level, topic, difficulty })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Problem vid generering");

  currentId = data.id;
  currentHint = data.hint || "";
  currentQuestion = data.question || "";

  questionEl.textContent = currentQuestion;
  feedbackEl.textContent = "";
  aiBox.textContent = "";
  answerInput.value = "";

  poolInfo.textContent = `Nivå: ${level} • Område: ${topic} • Svår: ${difficulty}`;
}

async function checkAnswer() {
  if (!currentId) {
    feedbackEl.textContent = "Tryck “Nästa uppgift” först.";
    return;
  }

  const userAnswer = answerInput.value;

  const res = await fetch(`${API_BASE}/api/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: currentId, userAnswer })
  });

  const data = await res.json();
  if (!res.ok) {
    feedbackEl.textContent = data?.error || "Kunde inte rätta.";
    return;
  }

  feedbackEl.textContent = data.feedback || (data.correct ? "Rätt!" : "Fel.");
}

function showHint() {
  if (!currentId) {
    aiBox.textContent = "Tryck “Nästa uppgift” först.";
    return;
  }
  aiBox.textContent = currentHint || "Ingen hint för denna uppgift.";
}

async function aiCheckAttempt() {
  if (!currentId) {
    aiBox.textContent = "Tryck “Nästa uppgift” först.";
    return;
  }

  const level = levelEl.value;
  const attempt = answerInput.value || "(inget svar inskrivet)";

  aiBox.textContent = "AI analyserar ditt försök…";

  const res = await fetch(`${API_BASE}/api/tutor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      level,
      mode: "check",
      problem: currentQuestion,
      attempt
    })
  });

  const data = await res.json();
  if (!res.ok) {
    aiBox.textContent = data?.error || "AI-fel. Kolla servern.";
    return;
  }

  aiBox.textContent = data.text || "(tomt svar)";
}

// ===== Events =====
levelEl.addEventListener("change", () => {
  fillTopics();
});

nextBtn.addEventListener("click", async () => {
  try {
    await loadProblem();
  } catch (e) {
    poolInfo.textContent = "";
    feedbackEl.textContent = "Serverfel: kunde inte generera uppgift.";
    console.error(e);
  }
});

checkBtn.addEventListener("click", () => {
  checkAnswer().catch(console.error);
});

hintBtn.addEventListener("click", () => {
  showHint();
});

checkAttemptBtn.addEventListener("click", () => {
  aiCheckAttempt().catch(console.error);
});

// init
fillTopics();
poolInfo.textContent = "Välj filter och klicka “Nästa uppgift”.";
