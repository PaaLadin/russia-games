// Зимняя рыбалка — лёд, лунка, терпение. Жди поклёвки, не дёргай зря.
(() => {
  const cv = document.getElementById('view');
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;

  const elCatch = document.getElementById('catch');
  const elTime = document.getElementById('time');
  const elCold = document.getElementById('cold');
  const winBox = document.getElementById('win');
  const elTitle = document.getElementById('end-title');
  const elText = document.getElementById('end-text');
  const btnAgain = document.getElementById('btn-again');
  const btnDrop = document.getElementById('btn-drop');
  const btnPull = document.getElementById('btn-pull');
  const btnWarm = document.getElementById('btn-warm');

  let timeLeft = 60;
  let caught = 0;
  let cold = 0;
  let bait = 'idle';        // idle | waiting | bite | reeling
  let biteAt = 0;
  let waitStart = 0;
  let over = false;
  let msg = '';
  let msgT = 0;
  let bubbles = [];
  let timer = null;
  let runId = 0;
  let lastTickTs = 0;  // 10D: реальное время тика

  function setMsg(t) { msg = t; msgT = 2.2; }

  function drop() {
    if (over || bait !== 'idle') return;
    bait = 'waiting';
    waitStart = performance.now();
    biteAt = waitStart + 1500 + Math.random() * 3500;
    btnDrop.disabled = true;
    btnPull.disabled = false;
    setMsg('Ждём поклёвки...');
  }

  function pull() {
    if (over) return;
    if (bait === 'bite') {
      // поймал
      const w = 1 + Math.floor(Math.random() * 3);
      caught += w;
      elCatch.textContent = caught;
      setMsg('Подсёк! Рыба +' + w);
      reset_bait();
      return;
    }
    if (bait === 'waiting') {
      // рано
      setMsg('Рано! Рыба ушла.');
      reset_bait();
      return;
    }
    setMsg('Сначала опусти снасть.');
  }

  function reset_bait() {
    bait = 'idle';
    btnDrop.disabled = false;
    btnPull.disabled = true;
  }

  function warm() {
    if (over) return;
    cold = Math.max(0, cold - 25);
    setMsg('Погрелся у печки.');
  }

  function tick() {
    const my = runId;
    if (over) return;
    if (my !== runId) return;

    // 10D: тик раз в секунду по реальному времени, а не каждый кадр
    const now = performance.now();
    if (!lastTickTs) lastTickTs = now;
    const dt = now - lastTickTs;
    if (dt < 1000) {
      if (msgT > 0) msgT -= 0.016;
      draw();
      if (my === runId) requestAnimationFrame(tick);
      return;
    }
    lastTickTs = now;

    timeLeft = Math.max(0, timeLeft - 1);
    elTime.textContent = timeLeft;

    // холод растёт
    cold = Math.min(100, cold + (bait === 'waiting' ? 2.2 : 1.1));
    elCold.textContent = Math.round(cold);
    if (cold >= 100) { finish(false); return; }
    if (timeLeft <= 0) { finish(true); return; }

    // поклёвка
    if (bait === 'waiting' && performance.now() >= biteAt) {
      bait = 'bite';
      setMsg('КЛЮЁТ! Подсекай!');
    }
    // если долго на крючке не подсекают — уходит
    if (bait === 'bite' && performance.now() >= biteAt + 1800) {
      setMsg('Прозевал. Ушла.');
      reset_bait();
    }

    // пузырьки
    if (bait === 'waiting' || bait === 'bite') {
      if (Math.random() < 0.25) {
        bubbles.push({ x: W/2 + (Math.random()-0.5)*80, y: H-110, r: 2 + Math.random()*3, v: 0.4 + Math.random()*0.6, life: 1 });
      }
    }

    if (msgT > 0) msgT -= 0.1;
    draw();
    if (my === runId) requestAnimationFrame(tick);
  }

  function draw() {
    // небо и лёд
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0a1420');
    g.addColorStop(0.45, '#142434');
    g.addColorStop(0.5, '#3a5a78');
    g.addColorStop(1, '#1a2e44');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // лунка
    const lx = W/2, ly = H - 100;
    ctx.fillStyle = '#0a1824';
    ctx.beginPath(); ctx.ellipse(lx, ly, 46, 16, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#5a7a9a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(lx, ly, 46, 16, 0, 0, 7); ctx.stroke();
    // блик
    ctx.fillStyle = 'rgba(160,208,240,.25)';
    ctx.beginPath(); ctx.ellipse(lx - 10, ly - 2, 18, 6, 0, 0, 7); ctx.fill();

    // леска
    if (bait === 'waiting' || bait === 'bite') {
      ctx.strokeStyle = '#a0c8e0'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(lx, 60); ctx.lineTo(lx, ly - 6); ctx.stroke();
      // поплавок
      ctx.fillStyle = bait === 'bite' ? '#e05030' : '#e0a040';
      ctx.beginPath(); ctx.arc(lx, ly - 8, 5, 0, 7); ctx.fill();
    }

    // пузырьки
    for (const b of bubbles) {
      ctx.fillStyle = 'rgba(180,220,245,' + b.life + ')';
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill();
      b.y -= b.v; b.life -= 0.008;
    }
    bubbles = bubbles.filter(b => b.life > 0);

    // рыбак (силуэт)
    const fx = 90, fy = H - 120;
    ctx.fillStyle = '#1a2838';
    ctx.beginPath(); ctx.arc(fx, fy - 30, 18, 0, 7); ctx.fill();       // голова
    ctx.fillRect(fx - 18, fy - 12, 36, 40);                              // тело
    // удочка
    ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(fx + 12, fy + 10); ctx.lineTo(lx - 30, 60); ctx.stroke();
    // шапка
    ctx.fillStyle = '#3a5a78';
    ctx.fillRect(fx - 20, fy - 46, 40, 8);

    // HUD-надписи на канвасе
    ctx.fillStyle = '#a0d0f0';
    ctx.font = 'bold 18px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('Улов: ' + caught, W - 120, 40);
    ctx.fillText('Время: ' + timeLeft, W - 120, 66);
    ctx.fillStyle = cold > 70 ? '#e05030' : '#90a8c0';
    ctx.fillText('Холод: ' + Math.round(cold) + '%', W - 120, 92);

    // сообщение
    if (msgT > 0) {
      ctx.globalAlpha = Math.min(1, msgT);
      ctx.fillStyle = '#e0eaf5';
      ctx.font = 'bold 20px Georgia';
      ctx.fillText(msg, W/2, 100);
      ctx.globalAlpha = 1;
    }

    if (over) return;
  }

  function finish(win) {
    over = true;
    btnDrop.disabled = true;
    btnPull.disabled = true;
    if (win) {
      elTitle.textContent = 'РЫБАЛКА УДАЛАСЬ';
      elTitle.style.color = '#a0d0f0';
      elText.textContent = 'Поймал ' + caught + ' рыб за минуту. Не замёрз — уже победа.';
    } else {
      elTitle.textContent = 'ЗАМЁРЗ';
      elTitle.style.color = '#e05030';
      elText.textContent = 'Холод одолел. Улов: ' + caught + '. Пора домой, к печке.';
    }
    winBox.classList.remove('hidden');
  }

  function reset() {
    timeLeft = 60; caught = 0; cold = 0; bait = 'idle'; over = false;
    msg = ''; msgT = 0; bubbles = [];
    elCatch.textContent = 0;
    elTime.textContent = 60;
    elCold.textContent = 0;
    btnDrop.disabled = false;
    btnPull.disabled = true;
    winBox.classList.add('hidden');
    lastTickTs = 0;
    runId++;
    requestAnimationFrame(tick);
  }

  btnDrop.addEventListener('click', drop);
  btnPull.addEventListener('click', pull);
  btnWarm.addEventListener('click', warm);
  btnAgain.addEventListener('click', reset);

  // API для тестов
  window.__f = {
    state: () => ({ timeLeft, caught, cold, bait, over }),
    drop, pull, warm,
    setCold: (v) => { cold = v; },
    setTime: (v) => { timeLeft = v; }
  };

  reset();
})();