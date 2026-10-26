// Конструктивизм — архитектурный паззл. Собери здание по образцу.
(() => {
  const cv = document.getElementById('view');
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const GRID = 6;
  const CELL = W / (GRID * 2 + 1);   // слева образец, справа поле

  const elBldg = document.getElementById('bldg');
  const elMoves = document.getElementById('moves');
  const elPalette = document.getElementById('palette');
  const winBox = document.getElementById('win');
  const elText = document.getElementById('end-text');
  const btnAgain = document.getElementById('btn-again');

  // 0 = пусто, 1 = чёрный, 2 = красный, 3 = серый
  const BUILDINGS = [
    { name: 'Рабочий клуб', pattern: [
      [0,2,2,2,2,0],
      [2,0,0,0,0,2],
      [2,0,0,0,0,2],
      [2,0,0,0,0,2],
      [2,0,0,0,0,2],
      [0,2,2,2,2,0],
    ]},
    { name: 'Дом культуры', pattern: [
      [1,1,1,1,1,1],
      [1,0,0,0,0,1],
      [1,0,2,2,0,1],
      [1,0,2,2,0,1],
      [1,0,0,0,0,1],
      [1,1,1,1,1,1],
    ]},
    { name: 'Башня', pattern: [
      [0,0,2,2,0,0],
      [0,1,1,1,1,0],
      [2,1,0,0,1,2],
      [2,1,0,0,1,2],
      [0,1,1,1,1,0],
      [0,0,2,2,0,0],
    ]},
    { name: 'Фабрика', pattern: [
      [3,3,3,3,3,3],
      [3,0,3,0,3,0],
      [3,0,3,0,3,0],
      [2,2,2,2,2,2],
      [0,0,0,0,0,0],
      [0,2,0,0,2,0],
    ]},
    { name: 'Дворец', pattern: [
      [2,2,2,2,2,2],
      [2,1,0,0,1,2],
      [2,0,3,3,0,2],
      [2,0,3,3,0,2],
      [2,1,0,0,1,2],
      [2,2,2,2,2,2],
    ]},
  ];

  const COLORS = { 0: '#f0f0f0', 1: '#111111', 2: '#e02020', 3: '#808080' };
  const NAMES  = { 0: '·', 1: '█', 2: '◆', 3: '▪' };

  let bldg = 0;
  let target = null;
  let current = null;
  let selected = 2;   // выбранный блок
  let moves = 0;
  let over = false;

  function loadBuilding(i) {
    bldg = i;
    target = BUILDINGS[i].pattern.map(row => row.slice());
    current = target.map(row => row.map(() => 0));
    moves = 0;
    over = false;
    elBldg.textContent = i + 1;
    elMoves.textContent = 0;
    winBox.classList.add('hidden');
    buildPalette();
    draw();
  }

  function buildPalette() {
    elPalette.innerHTML = '';
    for (const c of [1, 2, 3, 0]) {
      const d = document.createElement('div');
      d.className = 'block-btn' + (c === selected ? ' active' : '');
      d.style.background = COLORS[c];
      d.style.color = c === 1 ? '#f0f0f0' : '#111';
      d.textContent = NAMES[c];
      d.dataset.c = c;
      d.addEventListener('click', () => {
        selected = c;
        document.querySelectorAll('.block-btn').forEach(b => b.classList.remove('active'));
        d.classList.add('active');
      });
      elPalette.appendChild(d);
    }
  }

  function drawGrid(ox, oy, grid, showEmpty) {
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        const px = ox + x * CELL, py = oy + y * CELL;
        const c = grid[y][x];
        if (c === 0 && !showEmpty) continue;
        ctx.fillStyle = COLORS[c];
        ctx.fillRect(px, py, CELL - 2, CELL - 2);
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 2;
        ctx.strokeRect(px, py, CELL - 2, CELL - 2);
      }
    }
    // внешняя рамка
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    ctx.strokeRect(ox - 2, oy - 2, CELL * GRID, CELL * GRID);
  }

  function draw() {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, W, H);

    const topY = 40;
    const leftX = 30;
    const rightX = 30 + CELL * GRID + 50;

    // подписи
    ctx.fillStyle = '#111';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ОБРАЗЕЦ', leftX + CELL * GRID / 2, 24);
    ctx.fillText('ПОЛЕ', rightX + CELL * GRID / 2, 24);

    drawGrid(leftX, topY, target, false);
    drawGrid(rightX, topY, current, true);

    // счётчик совпадений
    let match = 0, total = 0;
    for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) {
      if (target[y][x] !== 0) { total++; if (current[y][x] === target[y][x]) match++; }
    }
    ctx.fillStyle = '#111';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(match + ' / ' + total, W / 2, H - 24);

    if (!over) requestAnimationFrame(draw);
  }

  cv.addEventListener('click', (e) => {
    if (over) return;
    const rect = cv.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);
    const topY = 40;
    const rightX = 30 + CELL * GRID + 50;
    const gx = Math.floor((mx - rightX) / CELL);
    const gy = Math.floor((my - topY) / CELL);
    if (gx < 0 || gx >= GRID || gy < 0 || gy >= GRID) return;

    // клик: если тут уже выбранный блок — убрать; иначе поставить
    if (current[gy][gx] === selected) {
      current[gy][gx] = 0;
    } else {
      current[gy][gx] = selected;
    }
    moves++;
    elMoves.textContent = moves;
    checkWin();
  });

  function checkWin() {
    // полное совпадение current и target
    for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) {
      if (current[y][x] !== target[y][x]) return;
    }
    over = true;
    setTimeout(nextBuilding, 500);
  }

  function nextBuilding() {
    if (bldg < BUILDINGS.length - 1) {
      loadBuilding(bldg + 1);
    } else {
      over = true;
      elText.textContent = 'Все ' + BUILDINGS.length + ' зданий построены. ' +
        'Ходов всего: ' + moves + '.';
      winBox.classList.remove('hidden');
    }
  }

  window.__k = {
    state: () => ({ bldg, moves, over, target, current, selected }),
    setSelected: (c) => { selected = c; },
    set: (x, y, c) => { current[y][x] = c; moves++; elMoves.textContent = moves; checkWin(); }
  };
  btnAgain.addEventListener('click', () => loadBuilding(0));
  loadBuilding(0);
})();