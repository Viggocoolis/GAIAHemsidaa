document.addEventListener("DOMContentLoaded", () => {
  // ===== Helpers =====
  const $ = (id) => document.getElementById(id);

  function mustGet(id) {
    const el = $(id);
    if (!el) {
      console.error(`Saknar element med id="#${id}" i practice.html`);
      throw new Error(`Missing element #${id}`);
    }
    return el;
  }

  function uniq(arr) {
    return [...new Set(arr)];
  }

  function normalize(s) {
    return (s ?? "")
      .toString()
      .trim()
      .replace(/\s+/g, "")
      .replace(",", "."); // 1,5 -> 1.5
  }

  function isCorrect(problem, userAnswerRaw) {
    const user = normalize(userAnswerRaw);
    const correct = normalize(problem.answer);

    if (!user) return false;

    if (problem.answerType === "number") {
      const u = Number(user);
      const c = Number(correct);
      if (Number.isFinite(u) && Number.isFinite(c)) {
        return Math.abs(u - c) < 1e-9;
      }
      return false;
    }

    // text/exakt match (bra för bråk osv)
    return user.toLowerCase() === correct.toLowerCase();
  }

  function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  // ===== DOM =====
  const levelEl = mustGet("level");
  const topicEl = mustGet("topic");
  const diffEl = mustGet("difficulty");

  const nextBtn = mustGet("nextBtn");
  const poolInfo = mustGet("poolInfo");

  const questionEl = mustGet("question");
  const answerInput = mustGet("answerInput");
  const checkBtn = mustGet("checkBtn");
  const hintBtn = mustGet("hintBtn");
  const checkAttemptBtn = mustGet("checkAttemptBtn");

  const feedbackEl = mustGet("feedback");
  const aiBox = mustGet("aiBox");

  // ===== State =====
  let ALL = [];
  let current = null;

  // ===== Filters =====
  function setTopicsForLevel(level) {
    const topics = uniq(ALL.filter(p => p.level === level).map(p => p.topic)).sort();
    topicEl.innerHTML = topics.map(t => `<option>${t}</option>`).join("");

    // om nivån saknar topics, visa tomt
    if (topics.length === 0) {
      topicEl.innerHTML = `<option>(Inga områden ännu)</option>`;
    }
  }

  function getFiltered() {
    const level = levelEl.value;
    const topic = topicEl.value;
    const difficulty = diffEl.value;

    return ALL.filter(p =>
      p.level === level &&
      p.topic === topic &&
      p.difficulty === difficulty
    );
  }

  function updatePoolInfo() {
    const filtered = getFiltered();
    poolInfo.textContent = `Matchande uppgifter: ${filtered.length}`;
  }

  // ===== Render =====
  function renderProblem(p) {
    current = p;
    questionEl.textContent = p.question;
    answerInput.value = "";
    feedbackEl.textContent = "";
    aiBox.textContent = "";
  }

  // ===== AI call =====
  async function callAI(mode, attemptText) {
    if (!current) {
      aiBox.textContent = "Välj en uppgift först (klicka “Nästa uppgift”).";
      return;
    }

    aiBox.textContent = "AI tänker...";

    try {
      const payload = {
        level: current.level,
        mode, // "hint" eller "check"
        problem: current.question,
        attempt: attemptText || ""
      };

      // OBS: ändra port om din backend kör på 3000 istället
      const res = await fetch("http://localhost:3001/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      // Om backend returnerar 500/401 osv:
      if (!res.ok) {
        const text = await res.text();
        aiBox.textContent =
          `Serverfel (${res.status}).\n\n` +
          `Tips: kolla server-terminalen.\n\n` +
          `Svar från server:\n${text.slice(0, 400)}`;
        return;
      }

      const data = await res.json();
      aiBox.textContent = data.text || "Inget AI-svar.";
    } catch (e) {
      console.error(e);
      aiBox.textContent = "Kunde inte nå AI-servern (är backend igång?).";
    }
  }

  // ===== Events =====
  levelEl.addEventListener("change", () => {
    setTopicsForLevel(levelEl.value);
    updatePoolInfo();
  });

  topicEl.addEventListener("change", updatePoolInfo);
  diffEl.addEventListener("change", updatePoolInfo);

  nextBtn.addEventListener("click", () => {
    const filtered = getFiltered();
    updatePoolInfo();

    if (filtered.length === 0) {
      feedbackEl.textContent = "Inga uppgifter matchar dina val ännu.";
      return;
    }

    renderProblem(pickRandom(filtered));
  });

  checkBtn.addEventListener("click", () => {
    if (!current) {
      feedbackEl.textContent = "Klicka “Nästa uppgift” först.";
      return;
    }

    const ok = isCorrect(current, answerInput.value);
    feedbackEl.textContent = ok
      ? "✅ Rätt! 🎉"
      : "❌ Inte riktigt. Prova igen eller ta ett tips.";
  });

  hintBtn.addEventListener("click", () => {
    callAI("hint", "");
  });

  checkAttemptBtn.addEventListener("click", () => {
    const userAttempt = answerInput.value.trim();
    callAI("check", userAttempt ? `Mitt svar/försök: ${userAttempt}` : "");
  });

  // ===== Boot =====
  async function loadProblems() {
    const res = await fetch("problems.json");
    ALL = await res.json();

    setTopicsForLevel(levelEl.value);
    updatePoolInfo();
  }

  loadProblems();
});
