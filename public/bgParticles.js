(function () {
  // Static full-screen particle background (one-time render, redraw on resize)
  const canvas = document.createElement("canvas");
  canvas.id = "bg-canvas";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const DPR = window.devicePixelRatio || 1;
  let particles = [];

  function resize() {
    const w = Math.max(300, Math.floor(window.innerWidth * DPR));
    const h = Math.max(200, Math.floor(window.innerHeight * DPR));
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    initParticles();
    render();
  }

  function initParticles() {
    particles = [];
    const area = window.innerWidth * window.innerHeight;
    const count = Math.max(12, Math.min(60, Math.floor(area / 25000)));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 0.8 + Math.random() * 2.2,
        alpha: 0.08 + Math.random() * 0.32,
      });
    }
  }

  function render() {
    const w = canvas.width / DPR;
    const h = canvas.height / DPR;
    ctx.clearRect(0, 0, w, h);

    // particles (static dots only)
    for (const p of particles) {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      g.addColorStop(0, `rgba(167,139,250,${p.alpha})`);
      g.addColorStop(1, "rgba(167,139,250,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  window.addEventListener("resize", debounce(resize, 120));
  function debounce(fn, wait) {
    let t;
    return (...a) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...a), wait);
    };
  }

  // initial setup
  resize();
})();
