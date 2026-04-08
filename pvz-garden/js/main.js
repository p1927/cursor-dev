/* global PVZ_CONFIG, PVZ_Game */
(function () {
  const C = window.PVZ_CONFIG;
  const Game = window.PVZ_Game;

  const canvas = document.getElementById("game");
  const bar = document.getElementById("seed-bar");
  const overlay = document.getElementById("overlay");
  const btnRestart = document.getElementById("btn-restart");

  const game = new Game(canvas);

  function buildSeedBar() {
    bar.innerHTML = "";
    const order = ["sunflower", "peashooter", "wallnut"];
    for (const id of order) {
      const def = C.PLANTS[id];
      const el = document.createElement("div");
      el.className = `seed-packet seed-${id}`;
      el.dataset.type = id;
      el.innerHTML = `<span>${def.name}</span><div class="cost">${def.cost}</div>`;
      el.addEventListener("click", () => game.selectPlant(id));
      bar.appendChild(el);
    }
  }

  function canvasCoords(ev) {
    const r = canvas.getBoundingClientRect();
    const sx = canvas.width / r.width;
    const sy = canvas.height / r.height;
    return {
      x: (ev.clientX - r.left) * sx,
      y: (ev.clientY - r.top) * sy,
    };
  }

  canvas.addEventListener("click", (ev) => {
    const { x, y } = canvasCoords(ev);
    game.onClick(x, y);
  });

  btnRestart.addEventListener("click", () => {
    overlay.classList.add("hidden");
    game.reset();
    game._syncHUD();
  });

  buildSeedBar();
  game._startWave();
  game._syncHUD();

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    game.update(dt);
    game.draw();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
