document.addEventListener("DOMContentLoaded", () => {
  const math = window.math; // från CDN

  const openBtn = document.getElementById("calcOpen");
  const win = document.getElementById("calcWindow");
  const header = document.getElementById("calcHeader");
  const closeBtn = document.getElementById("calcClose");
  const display = document.getElementById("calcDisplay");
  const hint = document.getElementById("calcHint");

  if (!openBtn || !win || !header || !closeBtn || !display || !math) return;

  let isActive = false;
  let ans = "0";

  function setActive(on) {
    isActive = on;
    win.classList.toggle("is-active", on);
    if (hint) hint.textContent = on
      ? "Tangentbord aktivt (siffror/tecken). Klicka utanför för att avaktivera."
      : "Klicka på räknaren för att aktivera tangentbord";
  }

  openBtn.addEventListener("click", () => {
    win.hidden = false;
    setActive(true);
    win.style.left = "80px";
    win.style.top = "110px";
  });

  closeBtn.addEventListener("click", () => {
    win.hidden = true;
    setActive(false);
  });

  win.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    setActive(true);
  });

  document.addEventListener("pointerdown", () => setActive(false));

  // Drag
  let dragging = false, startX=0, startY=0, startLeft=0, startTop=0;

  header.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    dragging = true;
    header.setPointerCapture(e.pointerId);
    startX = e.clientX;
    startY = e.clientY;
    startLeft = parseInt(win.style.left || win.offsetLeft, 10);
    startTop = parseInt(win.style.top || win.offsetTop, 10);
  });

  header.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const newLeft = Math.max(8, Math.min(window.innerWidth - 40, startLeft + dx));
    const newTop  = Math.max(8, Math.min(window.innerHeight - 40, startTop + dy));

    win.style.left = `${newLeft}px`;
    win.style.top  = `${newTop}px`;
  });

  header.addEventListener("pointerup", () => { dragging = false; });

  function append(token) { display.value += token; }
  function backspace() { display.value = display.value.slice(0, -1); }
  function clearAll() { display.value = ""; }

  function evaluate() {
    try {
      let expr = display.value.replace(/%/g, "/100");
      expr = expr.replace(/\bANS\b/g, `(${ans})`);
      const result = math.evaluate(expr);
      ans = String(result);
      display.value = ans;
    } catch {
      display.value = "Error";
      setTimeout(() => { display.value = ""; }, 800);
    }
  }

  win.querySelectorAll(".calc-grid button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const k = btn.getAttribute("data-k");
      if (!k) return;
      if (k === "AC") return clearAll();
      if (k === "DEL") return backspace();
      if (k === "=") return evaluate();
      append(k);
    });
  });

  const allowed = new Set(["0","1","2","3","4","5","6","7","8","9","+","-","*","/","^",".","(",")"]);

  document.addEventListener("keydown", (e) => {
    if (!isActive || win.hidden) return;

    const key = e.key;

    if (key === "Escape") { setActive(false); return; }
    if (key === "Enter" || key === "=") { e.preventDefault(); evaluate(); return; }
    if (key === "Backspace") { e.preventDefault(); backspace(); return; }
    if (key === "Delete") { e.preventDefault(); clearAll(); return; }

    if (key.length === 1 && !allowed.has(key)) return;

    if (allowed.has(key)) {
      e.preventDefault();
      append(key);
    }
  });
});
