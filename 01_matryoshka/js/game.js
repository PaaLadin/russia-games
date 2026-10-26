// Матрёшка — рекурсивный паззл. 5 слоёв, на каждом — поворот фрагментов.
(() => {
  const cv = document.getElementById('view');
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const elLayer = document.getElementById('layer');
  const elMoves = document.getElementById('moves');
  const winBox = document.getElementById('win');
  const btnReset = document.getElementById('btn-reset');
  const btnAgain = document.getElementById('btn-again');

  const COLORS = ['#c0392b', '#d4a017', '#1e8449', '#2c3e87', '#7d3c98'];
  const SIZES = [220, 180, 145, 115, 90];  // радиусы слоёв

  let layer = 0;         // 0..4
  let moves = 0;
  let pieces = [];       // {angle, target, x, y, r}
  let solved = false;
  let anim = 0;

  // генератор: 4 сектора, у каждого свой целевой угол
  function newLayer(idx) {
    const r = SIZES[idx];
    pieces = [];
    const base = Math.random() * Math.PI * 2;
    for (let i = 0; i < 4; i++) {
      const target = base + i * Math.PI / 2;
      // сдвиг КРАТЕН 90 градусам, иначе паззл нерешаем
      const k = 1 + Math.floor(Math.random() * 3);  // 1..3
      pieces.push({
        angle: target + k * Math.PI / 2,
        target: target,
        i
      });
    }
  }

  function drawDoll(cx, cy, r, col, frac) {
    // тело: овал + голова
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = col;
    // тело
    ctx.beginPath();
    ctx.ellipse(0, r * 0.25, r * 0.65, r * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    // голова
    ctx.beginPath();
    ctx.arc(0, -r * 0.45, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    // платок (светлый треугольник)
    ctx.fillStyle = 'rgba(255,240,220,.85)';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.78);
    ctx.lineTo(-r * 0.36, -r * 0.30);
    ctx.lineTo(r * 0.36, -r * 0.30);
    ctx.closePath();
    ctx.fill();
    // лицо
    ctx.fillStyle = '#f6dcc0';
    ctx.beginPath();
    ctx.arc(0, -r * 0.42, r * 0.20, 0, Math.PI * 2);
    ctx.fill();
    // глаза и румянец
    ctx.fillStyle = '#3a2418';
    ctx.beginPath(); ctx.arc(-r*0.08, -r*0.44, r*0.025, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc( r*0.08, -r*0.44, r*0.025, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(220,80,80,.45)';
    ctx.beginPath(); ctx.arc(-r*0.13, -r*0.38, r*0.04, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc( r*0.13, -r*0.38, r*0.04, 0, 7); ctx.fill();
    ctx.restore();
  }

  function drawPieces(cx, cy, r, col) {
    // 4 сектора
    for (let p of pieces) {
      const a0 = p.angle;
      const a1 = p.angle + Math.PI / 2;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, a0, a1);
      ctx.closePath();
      ctx.fillStyle = p.i % 2 === 0 ? col : shade(col, -18);
      ctx.fill();
      // тонкая грань
      ctx.strokeStyle = 'rgba(0,0,0,.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
    // центр — малая матрёшка следующего слоя
    if (layer < SIZES.length - 1) {
      drawDoll(cx, cy, r * 0.62, shade(col, 24), 1);
    } else {
      // сердце — последняя кукла без раскрытия
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.30, 0, Math.PI*2);
      ctx.fillStyle = '#e8b04b';
      ctx.fill();
    }
  }

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  function isSolved() {
    for (const p of pieces) {
      const d = Math.abs(norm(p.angle - p.target));
      if (d > 0.10) return false;
    }
    return true;
  }

  function norm(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2 + 10;
    const r = SIZES[layer];
    const col = COLORS[layer];

    // тень
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.6)';
    ctx.shadowBlur = 20;
    drawPieces(cx, cy, r, col);
    ctx.restore();

    // кольцо-подсказка
    ctx.strokeStyle = 'rgba(232,176,75,.20)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
    ctx.stroke();

    // малая матрёшка-призрак, куда надо собрать
    if (anim > 0) {
      ctx.globalAlpha = anim;
      drawDoll(cx, cy, r * 0.5, shade(col, 40), 1);
      ctx.globalAlpha = 1;
      anim -= 0.03;
    }
  }

  function angleAt(cx, cy, r, mx, my) {
    const dx = mx - cx, dy = my - cy;
    if (Math.hypot(dx, dy) > r) return null;
    const ang = Math.atan2(dy, dx);
    let a = ang < 0 ? ang + Math.PI * 2 : ang;   // [0, 2pi)
    for (let p of pieces) {
      let start = norm(p.angle); if (start < 0) start += Math.PI * 2;
      let end = start + Math.PI / 2;
      if (a >= start && a <= end) return p;
      // сектор мог пересечь 0
      if (end > Math.PI * 2 && a + Math.PI * 2 <= end) return p;
    }
    return null;
  }

  cv.addEventListener('click', (e) => {
    if (solved) return;
    const rect = cv.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);
    const cx = W / 2, cy = H / 2 + 10;
    const r = SIZES[layer];
    const p = angleAt(cx, cy, r, mx, my);
    if (!p) return;
    p.angle += Math.PI / 2;
    moves++;
    elMoves.textContent = moves;
    if (isSolved()) {
      solved = true;
      anim = 1;
      setTimeout(nextLayer, 700);
    }
    render();
  });

  function nextLayer() {
    if (layer < SIZES.length - 1) {
      layer++;
      elLayer.textContent = layer + 1;
      newLayer(layer);
      solved = false;
      render();
    } else {
      winBox.classList.remove('hidden');
    }
  }

  function reset() {
    layer = 0;
    moves = 0;
    solved = false;
    anim = 0;
    elLayer.textContent = '1';
    elMoves.textContent = '0';
    winBox.classList.add('hidden');
    newLayer(0);
    render();
  }

  btnReset.addEventListener('click', reset);
  btnAgain.addEventListener('click', reset);
  newLayer(0);
  render();

  // debug API для тестов (как __debug в Dungeon)
  window.__m = {
    state: () => ({
      layer, moves, solved,
      pieces: pieces.map(p => ({ angle: p.angle, target: p.target })),
      turns_needed: pieces.map(p => {
        const d = ((p.target - p.angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        return Math.round(d / (Math.PI / 2)) % 4;
      })
    }),
    rotate: (i) => {
      if (solved) return 'solved';
      pieces[i].angle += Math.PI / 2;
      moves++;
      elMoves.textContent = moves;
      if (isSolved()) { solved = true; anim = 1; setTimeout(nextLayer, 700); }
      render();
      return 'ok';
    },
    reset: () => reset()
  };
})();