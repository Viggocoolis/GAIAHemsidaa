document.addEventListener("DOMContentLoaded", () => {
  const askBtn = document.getElementById("askBtn");
  const answerEl = document.getElementById("answer");

  if (!askBtn) {
    console.error("Hittar inte knappen med id='askBtn'. Kolla index.html.");
    return;
  }

  askBtn.addEventListener("click", async () => {
    answerEl.textContent = "Tänker...";

    const payload = {
      level: document.getElementById("level")?.value || "",
      mode: document.getElementById("mode")?.value || "hint",
      problem: document.getElementById("problem")?.value || "",
      attempt: document.getElementById("attempt")?.value || ""
    };

    try {
      const res = await fetch("http://localhost:3001/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      answerEl.textContent = data.text || "Inget svar.";
    } catch (e) {
      console.error(e);
      answerEl.textContent = "Fel: kunde inte nå servern.";
    }
  });
});
