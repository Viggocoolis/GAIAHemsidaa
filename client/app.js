const askBtn = document.getElementById("askBtn");
const answerEl = document.getElementById("answer");

askBtn.addEventListener("click", async () => {
    answerEl.textContent = "Thinking...";

    const payload = {
        level: document.getElementById("level").value,
        mode: document.getElementById("mode").value,
        problem: document.getElementById("problem").value,
        attempt: document.getElementById("attempt").value,
    };

    try {
        const res = await fetch("http://localhost:3000/tutor", {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        answerEl.textContent = data.text || "Inget svar.";
    } catch (e)
    { answerEl.textContent = "Error: kunde inte nå servern.";

     }
});