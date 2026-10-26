// Лукоморье — сказочный рогалик. Комнаты, враги, избушка на финише.
(() => {
  const cv = document.getElementById('view');
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const N = 11;                 // 11x11
  const CELL = W / N;

  const elHp = document.getElementById('hp');
  const elSword = document.getElementById('sword');
  const elDepth = document.getElementById('depth');
  const elGold = document.getElementById('gold');
  const elLog = document.getElementById('log');
  const winBox = document.getElementById('win');
  const elTitle = document.getElementById('end-title');
  const elText = document.getElementById('end-text');
  const btnAgain = document.getElementById('btn-again');

  const WALL = 1, FLOOR = 0, EXIT = 2;
  let map, hero, enemies, items, depth, hp, sword, gold, over, moves;

  function log(msg) {
    const d = document.createElement('div');
    d.textContent = msg;
    elLog.appendChild(d);
    elLog.scrollTop = elLog.scrollHeight;
  }

  function hud() {
    elHp.textContent = Math.max(0, hp);
    elSword.textContent = sword;
    elDepth.textContent = depth;
    elGold.textContent = gold;
  }

  function rnd(n) { return Math.floor(Math.random() * n); }

  function genLevel() {
    map = [];
    for (let y = 0; y < N; y++) {
      const row = [];
      for (let x = 0; x < N; x++) {
        row.push((x === 0 || y === 0 || x === N-1 || y === N-1) ? WALL : FLOOR);
      }
      map.push(row);
    }
    // немного внутренних стен
    for (let i = 0; i < 6; i++) {
      const x = 2 + rnd(N-4), y = 2 + rnd(N-4);
      map[y][x] = WALL;
    }
    // герой
    hero = { x: 1, y: 1 };
    // выход — избушка
    map[N-2][N-2] = EXIT;
    // враги
    enemies = [];
    const nEnemies = 2 + depth;
    for (let i = 0; i < nEnemies; i++) {
      let x, y;
      do { x = 1 + rnd(N-2); y = 1 + rnd(N-2); } while (map[y][x] !== FLOOR || (x===1&&y===1) || (x===N-2&&y===N-2));
      enemies.push({ x, y, hp: 1 + Math.floor(depth/2) });
    }
    // предметы
    items = [];
    for (let i = 0; i < 2; i++) {
      let x, y;
      do { x = 1 + rnd(N-2); y = 1 + rnd(N-2); } while (map[y][x] !== FLOOR);
      items.push({ x, y, kind: Math.random() < 0.5 ? 'gold' : 'sword' });
    }
  }

  function draw() {
    ctx.fillStyle = '#14241a';
    ctx.fillRect(0, 0, W, H);

    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const t = map[y][x];
      const px = x*CELL, py = y*CELL;
      if (t === WALL) {
        ctx.fillStyle = '#0a140e';
        ctx.fillRect(px, py, CELL, CELL);
        ctx.strokeStyle = '#1a2a1e';
        ctx.strokeRect(px+1, py+1, CELL-2, CELL-2);
      } else if (t === EXIT) {
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(px, py, CELL, CELL);
        ctx.fillStyle = '#e8c04b';
        // избушка
        ctx.beginPath();
        ctx.moveTo(px + CELL/2, py + 6);
        ctx.lineTo(px + CELL - 8, py + CELL/2);
        ctx.lineTo(px + 8, py + CELL/2);
        ctx.fill();
        ctx.fillStyle = '#5a3a20';
        ctx.fillRect(px + 10, py + CELL/2, CELL - 20, CELL/2 - 8);
      } else {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#14241a' : '#16281c';
        ctx.fillRect(px, py, CELL, CELL);
      }
    }

    // предметы
    for (const it of items) {
      const px = it.x*CELL + CELL/2, py = it.y*CELL + CELL/2;
      if (it.kind === 'gold') {
        ctx.fillStyle = '#e8c04b';
        ctx.beginPath(); ctx.arc(px, py, 8, 0, 7); ctx.fill();
      } else {
        ctx.strokeStyle = '#c0d0e0'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(px-8, py+8); ctx.lineTo(px+8, py-8); ctx.stroke();
      }
    }

    // враги
    for (const e of enemies) {
      const px = e.x*CELL + CELL/2, py = e.y*CELL + CELL/2;
      ctx.fillStyle = '#d06a4a';
      ctx.beginPath(); ctx.arc(px, py, 12, 0, 7); ctx.fill();
      ctx.fillStyle = '#2a0a0a';
      ctx.beginPath(); ctx.arc(px-4, py-2, 2, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(px+4, py-2, 2, 0, 7); ctx.fill();
    }

    // герой
    const hx = hero.x*CELL + CELL/2, hy = hero.y*CELL + CELL/2;
    ctx.fillStyle = '#7ad07a';
    ctx.beginPath(); ctx.arc(hx, hy, 13, 0, 7); ctx.fill();
    ctx.fillStyle = '#0d1a14';
    ctx.beginPath(); ctx.arc(hx-4, hy-2, 2.5, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(hx+4, hy-2, 2.5, 0, 7); ctx.fill();

    hud();
  }

  function enemyAt(x, y) { return enemies.find(e => e.x === x && e.y === y); }

  function tryMove(dx, dy) {
    if (over) return;
    const nx = hero.x + dx, ny = hero.y + dy;
    if (nx < 0 || ny < 0 || nx >= N || ny >= N) return;
    const e = enemyAt(nx, ny);
    if (e) { log('На пути враг. Бей (F) или обойди.'); return; }
    if (map[ny][nx] === WALL) return;
    hero.x = nx; hero.y = ny;
    moves++;

    // подобрать предмет
    const it = items.find(i => i.x === nx && i.y === ny);
    if (it) {
      if (it.kind === 'gold') { gold += 10; log('Нашёл золото (+10).'); }
      else { sword += 1; log('Нашёл меч (+1 к урону).'); }
      items = items.filter(i => i !== it);
    }

    if (map[ny][nx] === EXIT) {
      if (depth >= 3) { finish(true); return; }
      log('Избушка на курьих ножках... ведёт глубже.');
      depth++;
      hp = Math.min(100, hp + 10);
      genLevel();
      draw();
      return;
    }

    // ход врагов
    enemyTurn();
    draw();
  }

  function enemyTurn() {
    for (const e of enemies) {
      if (Math.random() < 0.6) continue;
      const dx = Math.sign(hero.x - e.x), dy = Math.sign(hero.y - e.y);
      const nx = e.x + dx, ny = e.y + dy;
      if (nx === hero.x && ny === hero.y) {
        const dmg = 5 + rnd(6);
        hp -= dmg;
        log('Враг ударил (-' + dmg + ').');
        if (hp <= 0) { finish(false); return; }
        continue;
      }
      if (nx >= 0 && ny >= 0 && nx < N && ny < N && map[ny][nx] === FLOOR && !enemyAt(nx, ny)) {
        e.x = nx; e.y = ny;
      }
    }
  }

  function attack() {
    if (over) return;
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    for (const [dx, dy] of dirs) {
      const e = enemyAt(hero.x + dx, hero.y + dy);
      if (e) {
        e.hp -= sword;
        log('Удар! Враг: ' + Math.max(0, e.hp) + ' HP.');
        if (e.hp <= 0) {
          enemies = enemies.filter(x => x !== e);
          gold += 5;
          log('Враг повержен!');
        }
        moves++;
        enemyTurn();
        draw();
        return;
      }
    }
    log('Враг не рядом.');
  }

  function finish(win) {
    over = true;
    if (win) {
      elTitle.textContent = 'ИЗБУШКА НАЙДЕНА';
      elTitle.style.color = '#7ad07a';
      elText.textContent = 'Прошёл ' + depth + ' уровней Лукоморья. Золото: ' +
        gold + ', меч: ' + sword + '. Сказка кончилась, а ты — молодец.';
    } else {
      elTitle.textContent = 'СКАЗКА ОБОРВАЛАСЬ';
      elTitle.textContent = 'Тьма одолела...';
      elTitle.style.color = '#d06a4a';
      elText.textContent = 'Глубина ' + depth + ', золото ' + gold + '.';
    }
    winBox.classList.remove('hidden');
  }

  function reset() {
    depth = 1; hp = 100; sword = 1; gold = 0; over = false; moves = 0;
    elLog.innerHTML = '';
    winBox.classList.add('hidden');
    genLevel();
    log('Лукоморье. Глубина 1. Найди избушку.');
    draw();
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'W' || e.key === 'ц') tryMove(0, -1);
    else if (e.key === 's' || e.key === 'S' || e.key === 'ы') tryMove(0, 1);
    else if (e.key === 'a' || e.key === 'A' || e.key === 'ф') tryMove(-1, 0);
    else if (e.key === 'd' || e.key === 'D' || e.key === 'в') tryMove(1, 0);
    else if (e.key === 'f' || e.key === 'F' || e.key === 'а') attack();
    e.preventDefault && ['w','a','s','d','f','ц','ы','ф','в','а'].includes(e.key) && e.preventDefault();
  });

  // API для тестов
  window.__l = {
    state: () => ({ hero, depth, hp, sword, gold, enemies: enemies.length, over }),
    move: (dx, dy) => tryMove(dx, dy),
    attack: () => attack(),
    heroPos: () => ({ x: hero.x, y: hero.y }),
    exitPos: () => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (map[y][x] === EXIT) return { x, y }; },
    teleport: (x, y) => { hero.x = x; hero.y = y; draw(); }
  };

  btnAgain.addEventListener('click', reset);
  reset();
})();