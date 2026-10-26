// Баня — симулятор парения. Гость хочет свой режим: температура + пар.
(() => {
  const cv = document.getElementById('view');
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;

  const elGuest = document.getElementById('guest');
  const elScore = document.getElementById('score');
  const elHeatBar = document.getElementById('heat-bar');
  const elHeatVal = document.getElementById('heat-val');
  const elSteamBar = document.getElementById('steam-bar');
  const elSteamVal = document.getElementById('steam-val');
  const elWant = document.getElementById('want');
  const winBox = document.getElementById('win');
  const elFinal = document.getElementById('final-score');
  const btnAgain = document.getElementById('btn-again');

  // Гость: идеальный жар + идеальный пар, допуск
  const GUESTS = [
    { name: 'Купец',    heat: 80, steam: 60, tol: 15 },
    { name: 'Старик',   heat: 65, steam: 40, tol: 15 },
    { name: 'Барышня',  heat: 55, steam: 25, tol: 12 },
    { name: 'Молодец',  heat: 95, steam: 80, tol: 15 },
    { name: 'Пасечник', heat: 70, steam: 50, tol: 12 },
  ];

  let heat = 40;       // 20..110
  let steam = 0;       // 0..100
  let guestIdx = 0;
  let score = 0;
  let timeLeft = 25;   // ходов на гостя
  let done = false;
  let flashes = [];    // визуальные эффекты

  function curGuest() { return GUESTS[guestIdx]; }

  function startGuest() {
    heat = 40 + Math.random() * 20;
    steam = Math.random() * 15;
    timeLeft = 25;
    if (guestIdx >= GUESTS.length) { finish(); return; }
    elGuest.textContent = guestIdx + 1;
    const g = curGuest();
    elWant.textContent = g.name + ': жар ' + g.heat + '°, пар ' + g.steam + '%';
    draw();
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function act(kind) {
    if (done) return;
    if (kind === 'wood')  { heat = clamp(heat + 12, 20, 110); steam = clamp(steam + 3, 0, 100); flash('Дров подбросили', '#e8a04b'); }
    if (kind === 'water') { heat = clamp(heat - 8, 20, 110); steam = clamp(steam + 18, 0, 100); flash('Воды на камни', '#6aa8d8'); }
    if (kind === 'vent')  { heat = clamp(heat - 12, 20, 110); steam = clamp(steam - 20, 0, 100); flash('Отдушину открыли', '#a0c0d8'); }
    if (kind === 'venik') {
      // веник = оценить и подать: если близко к идеалу — плюс очко, но время тратится
      const g = curGuest();
      const dh = Math.abs(heat - g.heat), ds = Math.abs(steam - g.steam);
      if (dh <= g.tol && ds <= g.tol) {
        score += 10 + Math.round(timeLeft / 2);
        elScore.textContent = score;
        flash('Хорошо попарили! +' + (10 + Math.round(timeLeft / 2)), '#7ad07a');
        guestIdx++;
        setTimeout(startGuest, 600);
        draw();
        return;
      } else {
        score = Math.max(0, score - 3);
        elScore.textContent = score;
        flash('Не тот пар... -3', '#d06a4a');
      }
    }
    timeLeft--;
    if (timeLeft <= 0) {
      flash('Гость ушёл недовольным', '#d06a4a');
      guestIdx++;
      setTimeout(startGuest, 600);
    }
    draw();
  }

  function flash(text, color) {
    flashes.push({ text, color, t: 1.0, y: 40 + Math.random() * 100 });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // стены/пол — сруб
    ctx.fillStyle = '#3a2418';
    ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 40) {
      ctx.fillStyle = y % 80 === 0 ? '#2f1c12' : '#3a2418';
      ctx.fillRect(0, y, W, 38);
      ctx.strokeStyle = '#1a0f08';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, y + 39); ctx.lineTo(W, y + 39); ctx.stroke();
    }

    // каменка
    ctx.fillStyle = '#4a4a52';
    ctx.fillRect(W/2 - 60, H - 140, 120, 80);
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = i % 3 === 0 ? '#5a5a62' : '#3a3a42';
      ctx.beginPath();
      ctx.arc(W/2 - 50 + (i % 6) * 20, H - 130 + Math.floor(i / 6) * 25, 10, 0, 7);
      ctx.fill();
    }
    // огонь под камнями
    const fireH = 10 + (heat - 20) * 0.35;
    ctx.fillStyle = 'rgba(240,120,40,' + (0.4 + heat/300) + ')';
    ctx.beginPath();
    ctx.moveTo(W/2 - 40, H - 60);
    ctx.lineTo(W/2, H - 60 - fireH);
    ctx.lineTo(W/2 + 40, H - 60);
    ctx.fill();

    // полок с гостем
    ctx.fillStyle = '#5a3a24';
    ctx.fillRect(W/2 - 90, H/2 - 40, 180, 14);
    // гость
    const g = curGuest();
    if (guestIdx < GUESTS.length) {
      ctx.fillStyle = '#e0c8a8';
      ctx.beginPath(); ctx.arc(W/2, H/2 - 90, 22, 0, 7); ctx.fill(); // голова
      ctx.fillStyle = '#d8c0a0';
      ctx.fillRect(W/2 - 26, H/2 - 70, 52, 32); // тело/полотенце
      // лицо: довольство от близости
      const dh = Math.abs(heat - g.heat), ds = Math.abs(steam - g.steam);
      const ok = dh <= g.tol && ds <= g.tol;
      ctx.fillStyle = '#2a1a10';
      if (ok) { // улыбка
        ctx.beginPath(); ctx.arc(W/2, H/2 - 86, 6, 0.15*Math.PI, 0.85*Math.PI); ctx.lineWidth = 2; ctx.strokeStyle = '#2a1a10'; ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(W/2 - 8, H/2 - 94, 2, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(W/2 + 8, H/2 - 94, 2, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.moveTo(W/2 - 6, H/2 - 82); ctx.lineTo(W/2 + 6, H/2 - 82); ctx.stroke();
      }
    }

    // пар
    const steamAlpha = 0.15 + steam / 200;
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = 'rgba(220,230,240,' + steamAlpha + ')';
      const x = W/2 - 70 + (i * 20) + Math.sin(performance.now()/800 + i)*10;
      const y = H/2 - 30 - (i * 8) + Math.cos(performance.now()/600 + i)*6;
      ctx.beginPath(); ctx.arc(x, y, 25 + i*2, 0, 7); ctx.fill();
    }

    // плашки-события
    for (const f of flashes) {
      ctx.globalAlpha = f.t;
      ctx.fillStyle = f.color;
      ctx.font = 'bold 16px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText(f.text, W/2, f.y);
      ctx.globalAlpha = 1;
      f.t -= 0.02;
      f.y -= 0.5;
    }
    flashes = flashes.filter(f => f.t > 0);

    // HUD-полосы
    elHeatBar.style.width = clamp((heat - 20) / 90 * 100, 0, 100) + '%';
    elHeatVal.textContent = Math.round(heat) + '°';
    elSteamBar.style.width = steam + '%';
    elSteamVal.textContent = Math.round(steam) + '%';

    if (!done && guestIdx < GUESTS.length) requestAnimationFrame(draw);
  }

  function finish() {
    done = true;
    elFinal.textContent = score;
    const h2 = winBox.querySelector('h2');
    const pEl = winBox.querySelector('p');
    if (score >= 30) {
      h2.textContent = 'ВСЕ ДОВОЛЬНЫ';
      h2.style.color = '#e8a04b';
      pEl.textContent = 'Отличная баня! Счёт: ' + score;
    } else {
      h2.textContent = 'БАНЯ НЕ ЗАДАЛАСЬ';
      h2.style.color = '#d06a4a';
      pEl.textContent = 'Гости ушли недовольными. Счёт: ' + score;
    }
    winBox.classList.remove('hidden');
  }

  function reset() {
    heat = 40; steam = 0; guestIdx = 0; score = 0; done = false; flashes = [];
    elScore.textContent = 0;
    winBox.classList.add('hidden');
    elGuest.textContent = 1;
    startGuest();
    requestAnimationFrame(draw);
  }

  document.querySelectorAll('#controls button').forEach(b => {
    b.addEventListener('click', () => act(b.dataset.act));
  });
  btnAgain.addEventListener('click', reset);

  reset();
})();