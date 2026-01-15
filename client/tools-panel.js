document.addEventListener("DOMContentLoaded", () => {
  // ===== Helpers =====
  const byId = (id) => document.getElementById(id);
  const safeOn = (el, ev, fn) => { if (el) el.addEventListener(ev, fn); };

 
  const panelLeft  = byId("tmPanelLeft");
  const panelRight = byId("tmPanelRight");
  const backdrop   = byId("tmBackdrop");

  
  if (!panelLeft || !panelRight || !backdrop) return;

  const openLeftBtn  = byId("tmOpenLeft");
  const openRightBtn = byId("tmOpenRight");
  const closeLeftBtn = byId("tmCloseLeft");
  const closeRightBtn= byId("tmCloseRight");

  function syncAria() {
    panelLeft.setAttribute("aria-hidden", panelLeft.classList.contains("is-open") ? "false" : "true");
    panelRight.setAttribute("aria-hidden", panelRight.classList.contains("is-open") ? "false" : "true");
  }

  function openPanel(side) {
    backdrop.hidden = false;

    if (side === "left") panelLeft.classList.add("is-open");
    if (side === "right") panelRight.classList.add("is-open");

    syncAria();
  }

function closePanels() {
  // flytta fokus bort från knappar som finns i panelen innan vi gömmer den
  try { document.activeElement?.blur?.(); } catch {}

  panelLeft.classList.remove("is-open");
  panelRight.classList.remove("is-open");
  backdrop.hidden = true;

  panelLeft.setAttribute("aria-hidden", "true");
  panelRight.setAttribute("aria-hidden", "true");
}


  safeOn(openLeftBtn, "click", () => openPanel("left"));
  safeOn(openRightBtn, "click", () => openPanel("right"));
  safeOn(closeLeftBtn, "click", closePanels);
  safeOn(closeRightBtn, "click", closePanels);
  safeOn(backdrop, "click", closePanels);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePanels();
  });

  // ===== Whiteboard =====
  const canvas   = byId("tmCanvas");
  if (!canvas) return; // if whiteboard markup missing, stop here safely
  const ctx      = canvas.getContext("2d");

  // IMPORTANT: match your HTML ids
  const penBtn    = byId("tmPenBtn");
  const eraserBtn = byId("tmEraserBtn");
  const clearBtn  = byId("tmClearBtn");

  const sizeEl   = byId("tmSize");
  const colorEl  = byId("tmColor");
  const saveBtn  = byId("tmSave");
  const statusEl = byId("tmStatus");

  const BG = "#0b1220";

  // HiDPI + correct sizing when panel is open
  let canvasReady = false;
  function setupCanvas() {
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    const cssW = rect.width;
    const cssH = rect.width * (600 / 900);

    canvas.style.height = `${cssH}px`;

    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);

    // draw in CSS pixels (not device pixels)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation = "source-over";

    // background
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, cssW, cssH);
  }

  function ensureCanvasReady() {
    if (canvasReady) return;
    setupCanvas();
    canvasReady = true;
  }

  // Re-setup on resize so it keeps correct size
  window.addEventListener("resize", () => {
    if (!canvasReady) return;
    canvasReady = false;
    ensureCanvasReady();
  });

  // Ensure canvas is sized after opening right panel
  safeOn(openRightBtn, "click", () => setTimeout(ensureCanvasReady, 60));

  // Drawing state
  let drawing = false;
  let mode = "pen"; // "pen" | "eraser"
  let last = null;

  function getLineWidth() {
    return Number(sizeEl?.value || 6);
  }

  function applyMode() {
    if (mode === "eraser") {
      // Real eraser: removes pixels
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = colorEl?.value || "#ffffff";
    }
    ctx.lineWidth = getLineWidth();
  }

  function posFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function startDraw(e) {
    ensureCanvasReady();
    drawing = true;
    last = posFromEvent(e);
    if (statusEl) statusEl.textContent = "Ritar…";
  }

  function moveDraw(e) {
    if (!drawing) return;
    const p = posFromEvent(e);

    applyMode();
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();

    last = p;
  }

  function endDraw() {
    drawing = false;
    last = null;
    if (statusEl) statusEl.textContent = "";
  }

  // Mouse
  safeOn(canvas, "mousedown", startDraw);
  safeOn(window, "mousemove", moveDraw);
  safeOn(window, "mouseup", endDraw);

  // Touch
  safeOn(canvas, "touchstart", (e) => { e.preventDefault(); startDraw(e); });
  safeOn(canvas, "touchmove", (e) => { e.preventDefault(); moveDraw(e); });
  safeOn(canvas, "touchend", (e) => { e.preventDefault(); endDraw(); });

  // Buttons
  safeOn(penBtn, "click", () => {
    mode = "pen";
    if (penBtn) penBtn.style.opacity = "1";
    if (eraserBtn) eraserBtn.style.opacity = "0.7";
  });

  safeOn(eraserBtn, "click", () => {
    mode = "eraser";
    if (eraserBtn) eraserBtn.style.opacity = "1";
    if (penBtn) penBtn.style.opacity = "0.7";
  });

  safeOn(clearBtn, "click", () => {
    ensureCanvasReady();
    const rect = canvas.getBoundingClientRect();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, rect.width, rect.height);
  });

  safeOn(saveBtn, "click", () => {
    ensureCanvasReady();
    const link = document.createElement("a");
    link.download = `mattehelper-whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });

  // init button states
  if (penBtn) penBtn.style.opacity = "1";
  if (eraserBtn) eraserBtn.style.opacity = "0.7";
});
