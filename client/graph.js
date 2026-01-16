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

  
  // OPEN / CLOSE

  function toggleGraph() {
    win.hidden = !win.hidden;
    if (!win.hidden) setTimeout(drawAll, 0);
  }

  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleGraph();
  });

  
  // Drag window

  let dragging = false, startX=0, startY=0, startLeft=0, startTop=0;

  header.addEventListener("pointerdown", (e) => {
    dragging = true;
    header.setPointerCapture(e.pointerId);
    startX = e.clientX;
    startY = e.clientY;
    startLeft = win.offsetLeft;
    startTop = win.offsetTop;
  });

  header.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    win.style.left = startLeft + (e.clientX - startX) + "px";
    win.style.top  = startTop  + (e.clientY - startY) + "px";
  });

  header.addEventListener("pointerup", () => dragging = false);

  
  // Data model
  let funcs = [];

  function normalizeExpr(str) {
    return str.replace(/^y\s*=\s*/i, "").trim();
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
      chk.onchange = () => { f.enabled = chk.checked; drawAll(); };

      const label = document.createElement("span");
      label.textContent = `y = ${f.expr}`;

      const del = document.createElement("button");
      del.textContent = "✕";
      del.onclick = () => {
        funcs.splice(idx, 1);
        renderList();
        drawAll();
      };

      row.append(chk, label, del);
      list.appendChild(row);
    });
  }

  
  function makeTrace(expr) {
    const compiled = math.compile(expr);
    const x = [];
    const y = [];

    
    const RANGE = 200;
    const STEP = 0.05;

    for (let i = -RANGE; i <= RANGE; i += STEP) {
      try {
        const val = compiled.evaluate({ x: i });
        if (!isFinite(val)) {
          x.push(i);
          y.push(null);
        } else {
          x.push(i);
          y.push(val);
        }
      } catch {
        x.push(i);
        y.push(null);
      }
    }

    return {
      x, y,
      type: "scatter",
      mode: "lines",
      line: { width: 2 },
      name: `y = ${expr}`,
      connectgaps: false
    };
  }

  function drawAll() {
    const traces = funcs.filter(f => f.enabled).map(f => makeTrace(f.expr));

    Plotly.newPlot(plotDiv, traces, {
      dragmode: "pan",
      margin: { l: 50, r: 20, t: 20, b: 50 },
      xaxis: {
        zeroline: true,
        gridcolor: "rgba(255,255,255,0.08)",
        autorange: true
      },
      yaxis: {
        zeroline: true,
        gridcolor: "rgba(255,255,255,0.08)",
        autorange: true
      },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: { color: "#e8eefc" }
    }, {
      responsive: true,
      scrollZoom: true
    });
  }

  
  addBtn.onclick = () => {
    addFunction(input.value);
    input.value = "";
    input.focus();
  };

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFunction(input.value);
      input.value = "";
    }
  });

  clearBtn.onclick = () => {
    funcs = [];
    renderList();
    drawAll();
  };


  addFunction("x^2");
});
