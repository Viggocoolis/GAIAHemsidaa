document.addEventListener("DOMContentLoaded", () => {
  const math = window.math;
  const Plotly = window.Plotly;

  const openBtn = document.getElementById("graphOpen");
  const win = document.getElementById("graphWindow");
  const header = document.getElementById("graphHeader");

  const input = document.getElementById("graphInput");
  const addBtn = document.getElementById("graphAdd");
  const list = document.getElementById("graphList");
  const clearBtn = document.getElementById("graphClear");
  const plotDiv = document.getElementById("plot");

  if (!openBtn || !win || !header || !plotDiv || !math || !Plotly) return;

  //open/close
  function openGraph() { win.hidden = false; }
  function closeGraph() { win.hidden = true; }
  function toggleGraph() { win.hidden ? openGraph() : closeGraph(); }

  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleGraph();
    if (!win.hidden) setTimeout(drawAll, 0);
  });

  //Drag window
  let dragging = false, startX=0, startY=0, startLeft=0, startTop=0;

  header.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    dragging = true;
    header.setPointerCapture(e.pointerId);

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

  //Data model
  let funcs = []; 

  function normalizeExpr(str) {
    let s = str.trim();
    s = s.replace(/^y\s*=\s*/i, ""); 
    return s;
  }

  function addFunction(expr) {
    const clean = normalizeExpr(expr);
    if (!clean) return;
    funcs.push({ expr: clean, enabled: true });
    renderList();
    drawAll();
  }

  function renderList() {
    list.innerHTML = "";

    funcs.forEach((f, idx) => {
      const row = document.createElement("div");
      row.className = "graph-row";

      const chk = document.createElement("input");
      chk.type = "checkbox";
      chk.checked = f.enabled;
      chk.addEventListener("change", () => {
        f.enabled = chk.checked;
        drawAll();
      });

      const label = document.createElement("span");
      label.textContent = `y = ${f.expr}`;

      const del = document.createElement("button");
      del.className = "graph-del";
      del.textContent = "✕";
      del.addEventListener("click", () => {
        funcs.splice(idx, 1);
        renderList();
        drawAll();
      });

      row.appendChild(chk);
      row.appendChild(label);
      row.appendChild(del);
      list.appendChild(row);
    });
  }

  function makeTrace(expr) {
    const compiled = math.compile(expr);

    const x = [];
    const y = [];

    for (let i = -10; i <= 10; i += 0.1) {
      x.push(i);
      try {
        const val = compiled.evaluate({ x: i });
        // Skippa om den blir konstig
        if (typeof val !== "number" || !isFinite(val)) {
          y.push(null);
        } else {
          y.push(val);
        }
      } catch {
        y.push(null);
      }
    }

    return { x, y, type: "scatter", mode: "lines", name: `y=${expr}` };
  }

  function drawAll() {
    const enabled = funcs.filter(f => f.enabled);

    const traces = enabled.map(f => makeTrace(f.expr));

    const layout = {
      margin: { l: 40, r: 20, t: 20, b: 40 },
      xaxis: { zeroline: true, gridcolor: "rgba(255,255,255,0.08)" },
      yaxis: { zeroline: true, gridcolor: "rgba(255,255,255,0.08)" },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: { color: "#e8eefc" }
    };

    Plotly.newPlot(plotDiv, traces, layout, {
      responsive: true,
      displayModeBar: true
    });
  }

  //knappar
  addBtn.addEventListener("click", () => {
    addFunction(input.value);
    input.value = "";
    input.focus();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFunction(input.value);
      input.value = "";
    }
  });

  clearBtn.addEventListener("click", () => {
    funcs = [];
    renderList();
    drawAll();
  });

 
  addFunction("x^2");
});
