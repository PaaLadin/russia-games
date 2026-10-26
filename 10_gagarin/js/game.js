// Гагарин — орбитальный симулятор. Держи орбиту 3 витка, не сгори и не улетай.
(() => {
  const cv = document.getElementById('view');
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;

  const elOrbit = document.getElementById('orbit');
  const elFuel = document.getElementById('fuel');
  const elSignal = document.getElementById('signal');
  const winBox = document.getElementById('win');
  const elTitle = document.getElementById('end-title');
  const elText = document.getElementById('end-text');
  const btnAgain = document.getElementById('btn-again');

  const CX = W/2, CY = H/2;
  const R_SAFE_MIN = 110, R_SAFE_MAX = 200;   // коридор орбиты
  const R_EARTH = 70;

  let r = 155;           // радиус орбиты
  let angle = 0;         // угол
  let fuel = 100;
  let signal = 100;
  let orbit = 1;
  let orbitProgress = 0;
  let lastAngle = 0;
  let over = false;
  let starfield = [];
  let flags = [];        // визуальные метки

  for (let i = 0; i < 160; i++) {
    starfield.push({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*1.4 + 0.3, a: Math.random() });
  }

  function flash(t) { flags.push({ t, life: 1.0 }); }

  function step() {
    if (over) return;
    // угловая скорость зависит от радиуса (упрощённый Кеплер)
    const w = 2.4 * (155 / r);
    const prev = angle;
    angle += w * 0.003;   // 10D: виток ~15с, 3 витка ~45с

    // топливо и связь: медленно тратятся
    fuel = Math.max(0, fuel - 0.012);
    signal = Math.max(0, signal - 0.008);

    // 10D: виток = пересечение полного круга (2pi), а не "окно"
    if (Math.floor(angle / (Math.PI * 2)) > Math.floor(prev / (Math.PI * 2))) {
      orbit++;
      flash('Виток ' + orbit);
      if (orbit > 3) { finish(true); return; }
    }
    orbitProgress = angle % (Math.PI * 2);

    // сход с орбиты
    if (r < R_SAFE_MIN - 20) { finish(false, 'Сгорел в атмосфере'); return; }
    if (r > R_SAFE_MAX + 60) { finish(false, 'Улетел в космос'); return; }
    if (fuel <= 0 && r < R_SAFE_MIN) { finish(false, 'Топливо кончилось'); return; }

    draw();
    requestAnimationFrame(step);
  }

  function act(kind) {
    if (over) return;
    if (kind === 'boost') { r = Math.min(280, r + 6); fuel = Math.max(0, fuel - 3); flash('Ускорение'); }
    if (kind === 'brake') { r = Math.max(60, r - 6); fuel = Math.max(0, fuel - 3); flash('Торможение'); }
    if (kind === 'radio') { signal = Math.min(100, signal + 15); flash('Связь +15'); }
    if (kind === 'return') {
      if (orbit >= 3) finish(true);
      else flash('Рано возвращаться');
    }
  }

  function draw() {
    // фон: звёзды
    ctx.fillStyle = '#03060a';
    ctx.fillRect(0, 0, W, H);
    for (const s of starfield) {
      ctx.fillStyle = 'rgba(220,235,255,' + (0.3 + s.a*0.7) + ')';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
    }

    // орбитальный коридор
    ctx.strokeStyle = 'rgba(80,140,200,.18)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(CX, CY, R_SAFE_MIN, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.arc(CX, CY, R_SAFE_MAX, 0, 7); ctx.stroke();
    ctx.strokeStyle = 'rgba(80,200,140,.25)';
    ctx.beginPath(); ctx.arc(CX, CY, R_SAFE_MAX, 0, 7); ctx.stroke();

    // Земля
    const g = ctx.createRadialGradient(CX - 22, CY - 22, 8, CX, CY, R_EARTH);
    g.addColorStop(0, '#2a6a9a');
    g.addColorStop(0.6, '#1a3a6a');
    g.addColorStop(1, '#0a1a3a');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(CX, CY, R_EARTH, 0, 7); ctx.fill();
    // материки (пятна)
    ctx.fillStyle = 'rgba(60,140,80,.5)';
    ctx.beginPath(); ctx.ellipse(CX - 18, CY - 12, 20, 14, 0.4, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(CX + 20, CY + 18, 14, 10, -0.2, 0, 7); ctx.fill();

    // корабль
    const sx = CX + Math.cos(angle) * r;
    const sy = CY + Math.sin(angle) * r;
    // след
    ctx.strokeStyle = 'rgba(224,64,48,.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CX, CY, r, angle - 0.3, angle);
    ctx.stroke();
    // корабль
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(angle + Math.PI/2);
    ctx.fillStyle = '#e0e8f0';
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(6, 8);
    ctx.lineTo(-6, 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e04030';
    ctx.fillRect(-2, 8, 4, 6);
    ctx.restore();

    // HUD
    ctx.fillStyle = '#e8c040';
    ctx.font = 'bold 16px Georgia';
    ctx.textAlign = 'left';
    ctx.fillText('Виток: ' + orbit + '/3', 16, 30);
    ctx.fillText('Топливо: ' + Math.round(fuel) + '%', 16, 52);
    ctx.fillStyle = signal < 30 ? '#e04030' : '#90c0e0';
    ctx.fillText('Связь: ' + Math.round(signal) + '%', 16, 74);
    ctx.fillStyle = r < R_SAFE_MIN || r > R_SAFE_MAX ? '#e04030' : '#80d0a0';
    ctx.fillText('Орбита: ' + (r < R_SAFE_MIN ? 'низко' : r > R_SAFE_MAX ? 'высоко' : 'в норме'), 16, 96);

    // вспышки
    for (const f of flags) {
      ctx.globalAlpha = f.life;
      ctx.fillStyle = '#e8c040';
      ctx.font = 'bold 18px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText(f.t, W/2, 100);
      ctx.globalAlpha = 1;
      f.life -= 0.015;
    }
    flags = flags.filter(f => f.life > 0);
  }

  function finish(win, reason) {
    over = true;
    if (win) {
      elTitle.textContent = 'ПОЕХАЛИ!';
      elTitle.style.color = '#80d0a0';
      elText.textContent = 'Три витка, возвращение на Землю. Топливо: ' +
        Math.round(fuel) + '%, связь: ' + Math.round(signal) + '%.';
    } else {
      elTitle.textContent = reason || 'ПОЛЁТ ПРЕРВАН';
      elTitle.style.color = '#e04030';
      elText.textContent = 'Виток: ' + orbit + ', радиус: ' + Math.round(r) +
        ', топливо: ' + Math.round(fuel) + '%.';
    }
    winBox.classList.remove('hidden');
  }

  function reset() {
    r = 155; angle = 0; lastAngle = 0; fuel = 100; signal = 100;
    orbit = 1; orbitProgress = 0; over = false; flags = []; step._counted = false;
    winBox.classList.add('hidden');
    requestAnimationFrame(step);
  }

  document.querySelectorAll('#controls button').forEach(b => {
    b.addEventListener('click', () => act(b.dataset.act));
  });
  btnAgain.addEventListener('click', reset);

  // API для тестов
  window.__g2 = {
    state: () => ({ r, angle, fuel, signal, orbit, over }),
    act, reset,
    setR: (v) => { r = v; },
    setOrbit: (v) => { orbit = v; }
  };

  reset();
})();