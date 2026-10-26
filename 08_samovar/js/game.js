// Самовар — чайная церемония. Гость хочет свой жар углей и крепость заварки.
(() => {
  const cv = document.getElementById('view');
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;

  const elGuest = document.getElementById('guest');
  const elScore = document.getElementById('score');
  const elCoalBar = document.getElementById('coal-bar');
  const elCoalVal = document.getElementById('coal-val');
  const elTeaBar = document.getElementById('tea-bar');
  const elTeaVal = document.getElementById('tea-val');
  const elWant = document.getElementById('want');
  const winBox = document.getElementById('win');
  const elTitle = document.getElementById('end-title');
  const elText = document.getElementById('end-text');
  const btnAgain = document.getElementById('btn-again');

  const GUESTS = [
    { name: 'Купец',    coal: 70, tea: 60, tol: 15 },
    { name: 'Барышня',  coal: 50, tea: 30, tol: 12 },
    { name: 'Старик',   coal: 80, tea: 80, tol: 15 },
    { name: 'Пахарь',   coal: 90, tea: 70, tol: 12 },
    { name: 'Поп',      coal: 60, tea: 50, tol: 15 },
    { name: 'Дьяк',     coal: 75, tea: 65, tol: 12 },
  ];

  let coal = 40, tea = 0, guestIdx = 0, score = 0, moves = 0, over = false;
  let flashes = [];

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function cur() { return GUESTS[guestIdx]; }

  function wantText() {
    if (guestIdx >= GUESTS.length) return 'все напоены';
    const g = cur();
    return g.name + ': угли ' + g.coal + '%, заварка ' + g.tea + '%';
  }

  function flash(t, c) { flashes.push({ t, c, life: 1.0, y: 70 }); }

  function act(kind) {
    if (over) return;
    if (kind === 'coal') { coal = clamp(coal + 18, 0, 100); flash('Угли подкинул', '#e05020'); moves++; }
    if (kind === 'tea')  { tea = clamp(tea + 15, 0, 100); flash('Заварка гуще', '#d89040'); moves++; }
    if (kind === 'wait') { coal = clamp(coal - 6, 0, 100); flash('Угли прогорают', '#a06040'); moves++; }
    if (kind === 'serve') {
      const g = cur();
      const dc = Math.abs(coal - g.coal), dt = Math.abs(tea - g.tea);
      if (dc <= g.tol && dt <= g.tol) {
        score += 10 + Math.max(0, 40 - moves);
        elScore.textContent = score;
        flash('Гость доволен!', '#7ad07a');
        guestIdx++;
        moves = 0;
        coal = 40 + Math.random() * 20;
        tea = Math.random() * 15;
        if (guestIdx >= GUESTS.length) finish(true);
      } else {
        score = Math.max(0, score - 3);
        elScore.textContent = score;
        flash('Не тот чай... -3', '#e05030');
      }
    }
    updateHud();
    draw();
  }

  function updateHud() {
    elGuest.textContent = Math.min(guestIdx + 1, GUESTS.length);
    elCoalBar.style.width = coal + '%';
    elCoalVal.textContent = Math.round(coal) + '%';
    elTeaBar.style.width = tea + '%';
    elTeaVal.textContent = Math.round(tea) + '%';
    elWant.textContent = wantText();
  }

  function draw() {
    ctx.fillStyle = '#2a1a20';
    ctx.fillRect(0, 0, W, H);
    // стол
    ctx.fillStyle = '#1a1016';
    ctx.fillRect(0, H - 90, W, 90);
    ctx.fillStyle = '#3a2428';
    ctx.fillRect(0, H - 92, W, 6);

    // самовар
    const sx = W/2, sy = H - 190;
    // ножки
    ctx.fillStyle = '#8a6020';
    ctx.fillRect(sx - 45, sy + 130, 10, 40);
    ctx.fillRect(sx + 35, sy + 130, 10, 40);
    // корпус
    const grd = ctx.createLinearGradient(sx - 60, sy, sx + 60, sy);
    grd.addColorStop(0, '#6a4810');
    grd.addColorStop(0.4, '#d8a850');
    grd.addColorStop(0.6, '#e8c070');
    grd.addColorStop(1, '#8a6020');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.ellipse(sx, sy + 70, 62, 80, 0, 0, 7);
    ctx.fill();
    // кран
    ctx.fillStyle = '#8a6020';
    ctx.fillRect(sx + 60, sy + 80, 20, 8);
    ctx.fillRect(sx + 76, sy + 80, 6, 18);
    // крышка и труба
    ctx.fillStyle = '#a07830';
    ctx.fillRect(sx - 24, sy - 22, 48, 8);
    ctx.fillRect(sx - 14, sy - 60, 28, 44);
    ctx.fillStyle = '#d8a850';
    ctx.beginPath(); ctx.arc(sx, sy - 66, 10, 0, 7); ctx.fill();

    // пар (по жару)
    for (let i = 0; i < 6; i++) {
      const a = 0.08 + (coal / 100) * 0.35;
      ctx.fillStyle = 'rgba(240,240,240,' + a + ')';
      const px = sx - 20 + (i % 3) * 20 + Math.sin(performance.now()/700 + i) * 6;
      const py = sy - 90 - i * 14 - (performance.now()/50 % 15);
      ctx.beginPath(); ctx.arc(px, py, 10 + i * 2, 0, 7); ctx.fill();
    }

    // чашка с чаем (крепость = цвет)
    const cupX = W/2 + 160, cupY = H - 130;
    ctx.fillStyle = '#f0e0d0';
    ctx.beginPath();
    ctx.moveTo(cupX - 28, cupY - 20);
    ctx.lineTo(cupX + 28, cupY - 20);
    ctx.lineTo(cupX + 20, cupY + 24);
    ctx.lineTo(cupX - 20, cupY + 24);
    ctx.closePath();
    ctx.fill();
    // жидкость
    const teaCol = 'rgb(' + Math.round(240 - tea*1.8) + ',' + Math.round(200 - tea*1.5) + ',' + Math.round(140 - tea*1.2) + ')';
    ctx.fillStyle = teaCol;
    const lvl = 20 + tea * 0.2;
    ctx.beginPath();
    ctx.ellipse(cupX, cupY - 20 + lvl, 22, 5, 0, 0, 7);
    ctx.fill();
    // ручка
    ctx.strokeStyle = '#f0e0d0'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cupX + 30, cupY, 14, -Math.PI/2, Math.PI/2); ctx.stroke();

    // гость
    const gx = W/2 - 160, gy = H - 150;
    ctx.fillStyle = '#e0c8b0';
    ctx.beginPath(); ctx.arc(gx, gy - 40, 22, 0, 7); ctx.fill();
    ctx.fillStyle = '#a05030';
    ctx.fillRect(gx - 26, gy - 24, 52, 50);
    // глаза
    ctx.fillStyle = '#2a1010';
    ctx.beginPath(); ctx.arc(gx - 8, gy - 44, 2.5, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(gx + 8, gy - 44, 2.5, 0, 7); ctx.fill();

    // вспышки
    for (const f of flashes) {
      ctx.globalAlpha = f.life;
      ctx.fillStyle = f.c;
      ctx.font = 'bold 16px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText(f.t, W/2, f.y);
      ctx.globalAlpha = 1;
      f.life -= 0.02;
      f.y -= 0.4;
    }
    flashes = flashes.filter(f => f.life > 0);

    requestAnimationFrame(draw);
  }

  function finish(win) {
    over = true;
    elTitle.textContent = win ? 'ВСЕ НАПОЕНЫ' : 'ЧАЙ НЕ УДАЛСЯ';
    elTitle.style.color = win ? '#7ad07a' : '#e05030';
    elText.textContent = 'Напоено гостей: ' + guestIdx + '. Очки: ' + score + '.';
    winBox.classList.remove('hidden');
  }

  function reset() {
    coal = 40; tea = 0; guestIdx = 0; score = 0; moves = 0; over = false; flashes = [];
    elScore.textContent = 0;
    winBox.classList.add('hidden');
    updateHud();
  }

  document.querySelectorAll('#controls button').forEach(b => {
    b.addEventListener('click', () => act(b.dataset.act));
  });
  btnAgain.addEventListener('click', reset);

  // API для тестов
  window.__s = {
    state: () => ({ coal, tea, guestIdx, score, moves, over }),
    act, reset,
    set: (c, t) => { coal = c; tea = t; updateHud(); }
  };

  reset();
  requestAnimationFrame(draw);
})();