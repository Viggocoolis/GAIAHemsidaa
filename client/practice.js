let ALL = [];
let current = null;

const levelEl = document.getElementById("level");
const topicEl = document.getElementById("topic");
const diffEl = document.getElementById("difficulty");

const questionEl = document.getElementById("question");
const answerInput = document.getElementById("answerInput");
const feedbackEl = document.getElementById("feedback");
const aiBox = document.getElementById("aiBox");

const nextBtn = document.getElementById("nextBtn");
const checkBtn = document.getElementById("checkBtn");
const hintBtn = document.getElementById("hintBtn");
const checkAttemptBtn = document.getElementById("checkAttemptBtn");

function uniq(arr) {
    return [...new Set(arr)];
}

function normalise(s) {
    return (s || "")
    .toString()
    .trim()
    .replace(/\s+/g, " ")
    .replace(",", "."); // 1,5 -> 1.5
}

function isCorrect(problem, userAnswerRaw) {
    const user = normalise(userAnswerRaw);
    const correct = normalise(problem.answer);

    if (!user) return false;

    if (problem.type === "number") {
        const u = Number(user);
        const c = Number(correct);
        if (Number.isFinite(u) && Number.isFinite(c)) {
            //liten tolerans för decimaler
            return Math.abs(u - c) < 1e-9;
    }
    return false;
}
  //text match bra för bråk, förenklingar osv...
  return user.toLowerCase() === correct.toLowerCase();
}

function getFilterd() {
    const level = levelEl.value;
    const topic = topicEl.value;
    const difficulty = diffEl.value;

    return ALL.filter(p => 
        p.level === level &&
        p.topic === topic &&
        p.difficulty === difficulty
    );
}

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function setTopicsForLevel() {
    const topics = uniq(ALL.filter(p => p.level === level).map(p => p.topic)).sort();
    topicEl.innerHTML = topics.map(t => `<option>${t}</option>`).join("");
}

function renderProblem(p) {
    current = p;
    questionEl.textContent = p.question;
    answerInput.value = "";
    feedbackEl.textContent = "";
    aiBox.textContent = "";
}
