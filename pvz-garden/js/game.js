/* global PVZ_CONFIG, PVZ_ENTITIES */
(function () {
  const C = window.PVZ_CONFIG;
  const { Plant, Zombie, Pea, SunDrop, Mower } = window.PVZ_ENTITIES;

  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.grid = [];
      for (let r = 0; r < C.ROWS; r++) {
        this.grid[r] = Array(C.COLS).fill(null);
      }
      this.zombies = [];
      this.peas = [];
      this.suns = [];
      this.mowers = [];
      this.sun = C.STARTING_SUN;
      this.selected = null;
      this.wave = 1;
      this.spawnQueue = [];
      this.spawnTimer = 2;
      this.skySunTimer = 4 + Math.random() * 3;
      this.state = "playing";
      this.mowerAnim = null;
      this._initMowers();
    }

    _initMowers() {
      this.mowers = [];
      for (let r = 0; r < C.ROWS; r++) {
        const cy = C.GRID_Y + r * C.CELL_H + C.CELL_H / 2;
        this.mowers.push(new Mower(r, cy));
      }
    }

    reset() {
      this.grid = [];
      for (let r = 0; r < C.ROWS; r++) {
        this.grid[r] = Array(C.COLS).fill(null);
      }
      this.zombies = [];
      this.peas = [];
      this.suns = [];
      this.sun = C.STARTING_SUN;
      this.selected = null;
      this.wave = 1;
      this.spawnTimer = 2;
      this.skySunTimer = 4 + Math.random() * 3;
      this.state = "playing";
      this.mowerAnim = null;
      this._initMowers();
      this._startWave();
      this._syncHUD();
    }

    _startWave() {
      const n =
        C.ZOMBIES_BASE + (this.wave - 1) * C.ZOMBIES_PER_WAVE;
      this.spawnQueue = [];
      for (let i = 0; i < n; i++) {
        const row = Math.floor(Math.random() * C.ROWS);
        const delay =
          i === 0
            ? 0.5
            : C.SPAWN_GAP_MIN +
              Math.random() * (C.SPAWN_GAP_MAX - C.SPAWN_GAP_MIN);
        this.spawnQueue.push({ row, delay });
      }
      this.spawnTimer = this.spawnQueue[0]?.delay ?? 0;
    }

    _syncHUD() {
      const sunEl = document.getElementById("sun-count");
      const waveEl = document.getElementById("wave-num");
      if (sunEl) sunEl.textContent = String(this.sun);
      if (waveEl) waveEl.textContent = String(this.wave);
      document.querySelectorAll(".seed-packet").forEach((el) => {
        const t = el.dataset.type;
        if (!t) return;
        const cost = C.PLANTS[t].cost;
        el.classList.toggle("disabled", this.sun < cost);
        el.classList.toggle("selected", this.selected === t);
      });
    }

    selectPlant(type) {
      if (this.state !== "playing") return;
      if (this.sun < C.PLANTS[type].cost) return;
      this.selected = this.selected === type ? null : type;
      this._syncHUD();
    }

    _cellAt(mx, my) {
      const gx = mx - C.GRID_X;
      const gy = my - C.GRID_Y;
      if (gx < 0 || gy < 0) return null;
      const col = Math.floor(gx / C.CELL_W);
      const row = Math.floor(gy / C.CELL_H);
      if (row < 0 || row >= C.ROWS || col < 0 || col >= C.COLS)
        return null;
      return { row, col };
    }

    onClick(mx, my) {
      if (this.state !== "playing") return;

      for (let i = this.suns.length - 1; i >= 0; i--) {
        const s = this.suns[i];
        const d = Math.hypot(mx - s.x, my - s.y);
        if (d < 38) {
          this.sun += s.value;
          this.suns.splice(i, 1);
          this._syncHUD();
          return;
        }
      }

      const cell = this._cellAt(mx, my);
      if (!cell || !this.selected) return;
      const { row, col } = cell;
      if (this.grid[row][col]) return;
      const cost = C.PLANTS[this.selected].cost;
      if (this.sun < cost) return;
      const cx = C.GRID_X + col * C.CELL_W + C.CELL_W / 2;
      const cy = C.GRID_Y + row * C.CELL_H + C.CELL_H / 2;
      this.grid[row][col] = new Plant(this.selected, col, row, cx, cy);
      this.sun -= cost;
      this.selected = null;
      this._syncHUD();
    }

    update(dt) {
      if (this.state !== "playing") return;

      if (this.mowerAnim) {
        this.mowerAnim.x += this.mowerAnim.v * dt;
        this.zombies = this.zombies.filter((z) => {
          if (z.row !== this.mowerAnim.row) return true;
          return z.x > this.mowerAnim.x + 40;
        });
        if (this.mowerAnim.x > this.canvas.width + 80) {
          this.mowerAnim = null;
        }
        return;
      }

      this.skySunTimer -= dt;
      if (this.skySunTimer <= 0) {
        this.skySunTimer =
          C.SKY_SUN_MIN +
          Math.random() * (C.SKY_SUN_MAX - C.SKY_SUN_MIN);
        const x =
          C.GRID_X +
          Math.random() * (C.COLS * C.CELL_W - 40) +
          20;
        this.suns.push(new SunDrop(x, C.GRID_Y - 20, true));
      }

      for (const s of this.suns) {
        s.age += dt;
        if (!s.grounded) {
          s.y += s.vy * dt;
          const ground = C.GRID_Y + C.ROWS * C.CELL_H - 24;
          if (s.y >= ground) {
            s.y = ground;
            s.grounded = true;
            s.vy = 0;
          }
        }
      }

      if (this.spawnQueue.length > 0) {
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
          const next = this.spawnQueue.shift();
          this.zombies.push(
            new Zombie(next.row, this.canvas.width + 30)
          );
          this.spawnTimer =
            this.spawnQueue.length > 0
              ? this.spawnQueue[0].delay
              : 9999;
        }
      }

      for (const z of this.zombies) {
        const rowY = C.GRID_Y + z.row * C.CELL_H + C.CELL_H / 2;
        let blocked = false;
        let target = null;
        for (let c = C.COLS - 1; c >= 0; c--) {
          const p = this.grid[z.row][c];
          if (!p) continue;
          const cellL = p.cellLeft();
          const cellR = cellL + C.CELL_W;
          if (z.x <= cellR + 8 && z.x >= cellL - 20) {
            blocked = true;
            target = p;
            break;
          }
        }
        if (blocked && target) {
          z.eating = true;
          z.eatTarget = target;
          target.hp -= C.ZOMBIE_DAMAGE_PER_S * dt;
          if (target.hp <= 0) {
            const col = target.col;
            this.grid[z.row][col] = null;
            z.eating = false;
            z.eatTarget = null;
          }
        } else {
          z.eating = false;
          z.eatTarget = null;
          z.x -= z.speed * dt;
        }

        const mower = this.mowers[z.row];
        const mowerTriggerX = C.HOUSE_X + 52;
        if (mower.active && !mower.fired && z.x <= mowerTriggerX) {
          mower.fired = true;
          mower.active = false;
          this.mowerAnim = {
            row: z.row,
            x: mower.x,
            v: 420,
            y: rowY,
          };
          this.zombies = this.zombies.filter((zz) => {
            if (zz.row !== z.row) return true;
            return false;
          });
          break;
        }

        if (z.x < C.HOUSE_X + 8 && mower.fired) {
          this._lose();
          return;
        }
      }

      this.zombies = this.zombies.filter((z) => z.hp > 0);

      for (const row of this.grid) {
        for (const p of row) {
          if (!p) continue;
          if (p.type === "sunflower") {
            p.sunTimer -= dt;
            if (p.sunTimer <= 0) {
              const def = C.PLANTS.sunflower;
              p.sunTimer = def.sunInterval + Math.random() * def.sunJitter;
              this.suns.push(
                new SunDrop(p.cx + 8, p.cy - 30, false)
              );
            }
          }
          if (p.type === "peashooter") {
            p.shootTimer -= dt;
            if (p.shootTimer <= 0) {
              const hasZ = this.zombies.some(
                (z) => z.row === p.row && z.x > p.cx
              );
              if (hasZ) {
                this.peas.push(
                  new Pea(p.row, p.cx + 20, p.cy - 8)
                );
              }
              p.shootTimer = C.PLANTS.peashooter.shootInterval;
            }
          }
        }
      }

      for (const pea of this.peas) {
        if (pea.dead) continue;
        pea.x += C.PEA_SPEED * dt;
        let hit = false;
        for (const z of this.zombies) {
          if (z.row !== pea.row) continue;
          const zw = C.ZOMBIE.bodyW;
          if (pea.x >= z.x - zw / 2 && pea.x <= z.x + zw / 2 + 8) {
            z.hp -= C.PEA_DAMAGE;
            pea.dead = true;
            hit = true;
            break;
          }
        }
        if (!hit && pea.x > this.canvas.width) pea.dead = true;
      }
      this.peas = this.peas.filter((p) => !p.dead);

      const aliveZ = this.zombies.length;
      const spawnDone = this.spawnQueue.length === 0 && this.spawnTimer > 9000;
      if (aliveZ === 0 && spawnDone) {
        if (this.wave >= C.TOTAL_WAVES) {
          this._win();
        } else {
          this.wave++;
          this._startWave();
          this._syncHUD();
        }
      }
    }

    _lose() {
      this.state = "lost";
      this._showOverlay("The zombies ate your brains!", "A zombie reached your house.");
    }

    _win() {
      this.state = "won";
      this._showOverlay("You won!", `You survived all ${C.TOTAL_WAVES} waves.`);
    }

    _showOverlay(title, msg) {
      const o = document.getElementById("overlay");
      document.getElementById("overlay-title").textContent = title;
      document.getElementById("overlay-msg").textContent = msg;
      o.classList.remove("hidden");
    }

    draw() {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;

      const grd = ctx.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, "#7ec850");
      grd.addColorStop(0.45, "#5cb83a");
      grd.addColorStop(1, "#3d8c2e");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "rgba(0,0,0,0.06)";
      for (let r = 0; r < C.ROWS; r++) {
        const y = C.GRID_Y + r * C.CELL_H;
        ctx.fillRect(0, y + C.CELL_H - 3, w, 3);
      }

      for (let r = 0; r < C.ROWS; r++) {
        for (let c = 0; c < C.COLS; c++) {
          const x = C.GRID_X + c * C.CELL_W;
          const y = C.GRID_Y + r * C.CELL_H;
          ctx.strokeStyle = "rgba(30,80,20,0.18)";
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, y + 0.5, C.CELL_W - 1, C.CELL_H - 1);
        }
      }

      ctx.fillStyle = "#5d4037";
      ctx.fillRect(8, C.GRID_Y, C.HOUSE_X + 18, C.ROWS * C.CELL_H);

      for (const m of this.mowers) {
        if (!m.active && m.fired) continue;
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.fillStyle = "#bdbdbd";
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#e53935";
        ctx.fillRect(-4, -18, 8, 22);
        ctx.restore();
      }

      if (this.mowerAnim) {
        ctx.save();
        ctx.translate(this.mowerAnim.x, this.mowerAnim.y);
        ctx.fillStyle = "#ffeb3b";
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f44336";
        ctx.fillRect(-6, -20, 12, 28);
        ctx.restore();
      }

      for (let r = 0; r < C.ROWS; r++) {
        for (let c = 0; c < C.COLS; c++) {
          const p = this.grid[r][c];
          if (p) this._drawPlant(ctx, p);
        }
      }

      for (const z of this.zombies) {
        this._drawZombie(ctx, z);
      }

      for (const pea of this.peas) {
        if (pea.dead) continue;
        ctx.fillStyle = "#7cb342";
        ctx.beginPath();
        ctx.arc(pea.x, pea.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#c5e1a5";
        ctx.beginPath();
        ctx.arc(pea.x - 3, pea.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const s of this.suns) {
        ctx.font = "36px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(255,200,0,0.8)";
        ctx.shadowBlur = 12;
        ctx.fillText("☀", s.x, s.y);
        ctx.shadowBlur = 0;
      }
    }

    _drawPlant(ctx, p) {
      const x = p.cx;
      const y = p.cy;
      if (p.type === "sunflower") {
        ctx.fillStyle = "#33691e";
        ctx.fillRect(x - 4, y - 8, 8, 28);
        ctx.fillStyle = "#fdd835";
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.ellipse(
            x + Math.cos(a) * 14,
            y - 18 + Math.sin(a) * 14,
            9,
            14,
            a,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        ctx.fillStyle = "#5d4037";
        ctx.beginPath();
        ctx.arc(x, y - 18, 10, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === "peashooter") {
        ctx.fillStyle = "#33691e";
        ctx.fillRect(x - 4, y + 4, 8, 22);
        ctx.fillStyle = "#43a047";
        ctx.beginPath();
        ctx.arc(x, y - 8, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#2e7d32";
        ctx.fillRect(x + 8, y - 14, 28, 12);
        ctx.fillStyle = "#1b5e20";
        ctx.beginPath();
        ctx.arc(x + 4, y - 12, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === "wallnut") {
        ctx.fillStyle = "#6d4c41";
        ctx.beginPath();
        ctx.ellipse(x, y + 4, 26, 32, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#4e342e";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.strokeStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.moveTo(x - 8, y - 4);
        ctx.quadraticCurveTo(x, y + 8, x + 10, y - 6);
        ctx.stroke();
        const pct = p.hp / p.maxHp;
        ctx.fillStyle = "#ff8a65";
        ctx.fillRect(x - 24, y - 36, 48 * pct, 5);
      }

      if (p.type !== "wallnut" && p.hp < p.maxHp) {
        const pct = p.hp / p.maxHp;
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(x - 22, y + 32, 44, 5);
        ctx.fillStyle = pct > 0.35 ? "#8bc34a" : "#ff7043";
        ctx.fillRect(x - 22, y + 32, 44 * pct, 5);
      }
    }

    _drawZombie(ctx, z) {
      const x = z.x;
      const y = C.GRID_Y + z.row * C.CELL_H + C.CELL_H / 2;
      const w = C.ZOMBIE.bodyW;
      const h = C.ZOMBIE.bodyH;

      ctx.fillStyle = "#37474f";
      ctx.fillRect(x - w / 2 + 6, y - h / 2 + 20, 10, 28);
      ctx.fillRect(x - w / 2 - 4, y - h / 2 + 22, 8, 24);

      ctx.fillStyle = "#5d4037";
      ctx.fillRect(x - w / 2, y - h / 2 + 18, w, h - 22);

      ctx.fillStyle = "#78909c";
      ctx.fillRect(x - w / 2 - 2, y - h / 2 + 38, w + 4, 14);

      ctx.fillStyle = "#8d6e63";
      ctx.beginPath();
      ctx.arc(x + 8, y - h / 2 + 12, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#eceff1";
      ctx.beginPath();
      ctx.arc(x + 14, y - h / 2 + 10, 6, 0, Math.PI * 2);
      ctx.arc(x + 2, y - h / 2 + 10, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#263238";
      ctx.beginPath();
      ctx.arc(x + 15, y - h / 2 + 10, 2, 0, Math.PI * 2);
      ctx.arc(x + 3, y - h / 2 + 10, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#b71c1c";
      ctx.beginPath();
      ctx.moveTo(x - 2, y - h / 2 + 22);
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(x + 4 + i * 3, y - h / 2 + 26 + (i % 2) * 4);
      }
      ctx.lineTo(x + 20, y - h / 2 + 22);
      ctx.closePath();
      ctx.fill();

      const pct = z.hp / z.maxHp;
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(x - w / 2, y - h / 2 - 10, w, 5);
      ctx.fillStyle = pct > 0.4 ? "#aed581" : "#ef5350";
      ctx.fillRect(x - w / 2, y - h / 2 - 10, w * pct, 5);
    }
  }

  window.PVZ_Game = Game;
})();
