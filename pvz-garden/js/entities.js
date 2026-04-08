/* global PVZ_CONFIG */
(function () {
  const C = window.PVZ_CONFIG;

  class Plant {
    constructor(type, col, row, cx, cy) {
      this.type = type;
      this.col = col;
      this.row = row;
      this.cx = cx;
      this.cy = cy;
      const def = C.PLANTS[type];
      this.hp = def.hp;
      this.maxHp = def.hp;
      this.shootTimer = type === "peashooter" ? def.shootInterval * 0.3 : 0;
      this.sunTimer =
        type === "sunflower"
          ? 2 + Math.random() * (def.sunJitter || 0)
          : 0;
    }

    cellLeft() {
      return C.GRID_X + this.col * C.CELL_W;
    }
    cellTop() {
      return C.GRID_Y + this.row * C.CELL_H;
    }
  }

  class Zombie {
    constructor(row, x) {
      this.row = row;
      this.x = x;
      this.hp = C.ZOMBIE.hp;
      this.maxHp = C.ZOMBIE.hp;
      this.eating = false;
      this.eatTarget = null;
      this.speed = C.ZOMBIE.speed;
    }
  }

  class Pea {
    constructor(row, x, y) {
      this.row = row;
      this.x = x;
      this.y = y;
      this.dead = false;
    }
  }

  class SunDrop {
    constructor(x, y, fromSky) {
      this.x = x;
      this.y = y;
      this.fromSky = fromSky;
      this.vy = fromSky ? 52 : 0;
      this.grounded = !fromSky;
      this.value = C.SUN_VALUE;
      this.age = 0;
    }
  }

  class Mower {
    constructor(row, yCenter) {
      this.row = row;
      this.active = true;
      this.x = C.HOUSE_X + 8;
      this.y = yCenter;
      this.fired = false;
      this.speed = 0;
    }
  }

  window.PVZ_ENTITIES = { Plant, Zombie, Pea, SunDrop, Mower };
})();
