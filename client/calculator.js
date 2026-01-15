document.addEventListener("DOMContentLoaded", () => {
  const math = window.math;

  const openBtn  = document.getElementById("calcOpen");
  const win      = document.getElementById("calcWindow");
  const header   = document.getElementById("calcHeader");
  const display  = document.getElementById("calcDisplay");
  const hint     = document.getElementById("calcHint");

  if (!openBtn || !win || !header || !display || !math) return;

  let isActive = false; // tangentbord aktivt
  let ans = "0";

  function setActive(on) {
    isActive = on;
    win.classList.toggle("is-active", on);
    if (hint) {
      hint.textContent = on
        ? "Tangentbord aktivt (siffror/tecken). Klicka utanför för att avaktivera."
        : "Klicka på räknaren för att aktivera tangentbord";
    }
  }

  function openCalc() {
    win.hidden = false;
    setActive(true);

    // startposition (kan ändras)
    if (!win.style.left) {
      win.style.left = "50%";
      win.style.top = "90px";
      win.style.transform = "translateX(-50%)";
    }
  }

  function closeCalc() {
    win.hidden = true;
    setActive(false);
  }

  function toggleCalc() {
    if (win.hidden) openCalc();
    else closeCalc();
  }

  // Toggle via samma knapp
  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCalc();
  });

  // Klick på kalkylatorn = aktivera tangentbord (men stoppa document-handlern)
  win.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    setActive(true);
  });

  // Klick utanför = avaktivera tangentbord (inte stäng)
  document.addEventListener("pointerdown", () => setActive(false));

  // ===== Drag =====
  let dragging = false, startX=0, startY=0, startLeft=0, startTop=0;

  header.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    dragging = true;
    header.setPointerCapture(e.pointerId);

    // när du drar: ta bort translate så offsetLeft funkar rätt
    win.style.transform = "none";

    startX = e.clientX;
    startY = e.clientY;
    startLeft = win.offsetLeft;
    startTop = win.offsetTop;
  });

  header.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const newLeft = Math.max(8, Math.min(window.innerWidth - 80, startLeft + dx));
    const newTop  = Math.max(8, Math.min(window.innerHeight - 80, startTop + dy));

    win.style.left = `${newLeft}px`;
    win.style.top  = `${newTop}px`;
  });

  header.addEventListener("pointerup", () => { dragging = false; });

  // ===== Input helpers =====
  function append(token) {
    display.value += token;
  }

  function backspace() {
    display.value = display.value.slice(0, -1);
  }

  function clearAll() {
    display.value = "";
  }

  function evaluate() {
    try {
      let expr = display.value.replace(/%/g, "/100");
      expr = expr.replace(/\bANS\b/g, `(${ans})`);
      const result = math.evaluate(expr);
      ans = String(result);
      display.value = ans;
    } catch {
      display.value = "Error";
      setTimeout(() => { display.value = ""; }, 700);
    }
  }

  // Buttons
  win.querySelectorAll(".calc-grid button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const k = btn.getAttribute("data-k");
      if (!k) return;

      if (k === "AC") return clearAll();
      if (k === "DEL") return backspace();
      if (k === "=") return evaluate();

      append(k);
    });
  });

  // ===== Keyboard input (ONLY when active + window open) =====
  const allowed = new Set(["0","1","2","3","4","5","6","7","8","9","+","-","*","/","^",".","(",")"]);

  document.addEventListener("keydown", (e) => {
    if (win.hidden) return;

    // Esc stänger alltid när den är öppen
    if (e.key === "Escape") {
      closeCalc();
      return;
    }

    // tangentbord bara när kalkylatorn är aktiv
    if (!isActive) return;

    const key = e.key;

    if (key === "Enter" || key === "=") { e.preventDefault(); evaluate(); return; }
    if (key === "Backspace") { e.preventDefault(); backspace(); return; }
    if (key === "Delete") { e.preventDefault(); clearAll(); return; }

    if (key.length === 1 && allowed.has(key)) {
      e.preventDefault();
      append(key);
    }
  });
});
  