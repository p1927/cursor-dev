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
      const el = document.createElement("button");
      el.type = "button";
      el.className = `seed-packet seed-${id}`;
      el.dataset.type = id;
      el.setAttribute(
        "aria-label",
        `${def.name}, cost ${def.cost} sun. Select to plant.`
      );
      el.setAttribute("aria-pressed", "false");
      el.innerHTML = `<div class="pkt-face pkt-face-${id}" aria-hidden="true"></div><div class="pkt-cost"><span>${def.cost}</span></div>`;
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

  function onCanvasPrimaryPointer(ev) {
    if (!ev.isPrimary) return;
    const { x, y } = canvasCoords(ev);
    game.onClick(x, y);
  }
  canvas.addEventListener("pointerdown", onCanvasPrimaryPointer);

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
