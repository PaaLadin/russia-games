// Русская печь — тайм-менеджмент томления. Жар, время, 6 блюд.
(() => {
  const cv = document.getElementById('view');
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;

  const elHeat = document.getElementById('heat');
  const elDishes = document.getElementById('dishes');
  const elPots = document.getElementById('pots');
  const winBox = document.getElementById('win');
  const elTitle = document.getElementById('end-title');
  const elText = document.getElementById('end-text');
  const btnAgain = document.getElementById('btn-again');

  // блюдо: имя, нужный жар, нужное время (тиков), допуск жара
  const DISHES = [
    { name: 'Щи',     heat: 70, time: 12, tol: 12 },
    { name: 'Каша',   heat: 85, time: 10, tol: 10 },
    { name: 'Хлеб',   heat: 95, time: 14, tol: 8 },
    { name: 'Пирог',  heat: 80, time: 11, tol: 10 },
    { name: 'Молоко', heat: 60, time: 8,  tol: 12 },
    { name: 'Грибы',  heat: 75, time: 9,  tol: 10 },
  ];

  let heat = 30;       // 0..120
  let dishes = [];
  let doneCount = 0;
  let burnt = 0;
  let over = false;
  let tickTimer = null;

  function initDishes() {
    dishes = DISHES.map(d => ({ ...d, progress: 0, state: 'wait' }));  // wait/cook/done/burnt
    doneCount = 0; burnt = 0;
    renderPots();
  }

  function renderPots() {
    elPots.innerHTML = '';
    dishes.forEach((d, i) => {
      const div = document.createElement('div');
      div.className = 'pot' + (d.state === 'done' ? ' done' : d.state === 'burnt' ? ' burnt' : '');
      const pct = Math.min(100, d.progress / d.time * 100);
      let status = 'ждёт';
      if (d.state === 'cook') status = 'томится';
      if (d.state === 'done') status = 'готово';
      if (d.state === 'burnt') status = 'сгорело';
      div.innerHTML = '<div class="name">' + d.name + '</div>' +
        '<div class="bar"><div class="fill" style="width:' + pct + '%"></div></div>' +
        '<div class="status">' + status + '</div>';
      div.addEventListener('click', () => startDish(i));
      elPots.appendChild(div);
    });
    elDishes.textContent = doneCount;
    elHeat.textContent = Math.round(heat);
  }

  function startDish(i) {
    const d = dishes[i];
    if (over) return;
    if (d.state !== 'wait') return;
    if (Math.abs(heat - d.heat) > d.tol) {
      flash('Не тот жар для ' + d.name, '#d06a4a');
      return;
    }
    d.state = 'cook';
    renderPots();
  }

  function tick() {
    if (over) return;
    // жар падает со временем
    heat = Math.max(0, heat - 3);

    for (const d of dishes) {
      if (d.state === 'cook') {
        const dh = Math.abs(heat - d.heat);
        if (dh > d.tol * 1.6) {
          d.state = 'burnt'; burnt++; flash(d.name + ' сгорело!', '#d06a4a');
          continue;
        }
        d.progress++;
        if (d.progress >= d.time) {
          d.state = 'done'; doneCount++;
          flash(d.name + ' готово!', '#6ad8a8');
        }
      }
    }
    renderPots();
    checkEnd();
  }

  function checkEnd() {
    const finished = dishes.every(d => d.state === 'done' || d.state === 'burnt');
    if (finished) {
      over = true;
      if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
      if (doneCount >= 5) {
        elTitle.textContent = 'ПЕЧЬ ИСТОПЛЕНА';
        elTitle.style.color = '#6ad8a8';
        elText.textContent = 'Готово ' + doneCount + ' из 6, сгорело ' + burnt + '. Хозяйка довольна.';
      } else {
        elTitle.textContent = 'ОБЕД НЕ УДАЛСЯ';
        elTitle.style.color = '#d06a4a';
        elText.textContent = 'Готово ' + doneCount + ' из 6, сгорело ' + burnt + '.';
      }
      winBox.classList.remove('hidden');
    }
  }

  let flashes = [];
  function flash(text, color) {
    flashes.push({ text, color, t: 1.0, y: 60 });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // фон — изба
    ctx.fillStyle = '#2a1810';
    ctx.fillRect(0, 0, W, H);
    // пол
    ctx.fillStyle = '#1a0f08';
    ctx.fillRect(0, H - 80, W, 80);
    // печь
    const px = W/2 - 120, py = H - 260, pw = 240, ph = 180;
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(px, py, pw, ph);
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(px + 10, py + 10, pw - 20, ph - 20);
    // топка
    ctx.fillStyle = '#0a0505';
    ctx.fillRect(px + 60, py + 90, 120, 70);
    // огонь по жару
    const fireH = 10 + heat * 0.5;
    ctx.fillStyle = 'rgba(240,120,40,' + (0.5 + heat/300) + ')';
    ctx.beginPath();
    ctx.moveTo(px + 70, py + 155);
    ctx.lineTo(px + 120, py + 155 - fireH);
    ctx.lineTo(px + 170, py + 155);
    ctx.fill();
    // искры
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = 'rgba(255,200,100,' + (0.6 - i*0.08) + ')';
      ctx.beginPath();
      ctx.arc(px + 90 + i*14, py + 140 - (i*7) - (Date.now()/100 % 20), 2, 0, 7);
      ctx.fill();
    }
    // заслонка (положение по жару)
    ctx.fillStyle = '#3a2a1a';
    const damperY = py + 80 - heat * 0.3;
    ctx.fillRect(px + 50, Math.max(py+10, damperY), 140, 10);

    // пар из печи
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = 'rgba(220,220,220,' + (0.15 + i*0.03) + ')';
      ctx.beginPath();
      ctx.arc(W/2 - 40 + i*25 + Math.sin(Date.now()/700 + i)*10, py - 10 - i*18, 14 + i*3, 0, 7);
      ctx.fill();
    }

    // вспышки
    for (const f of flashes) {
      ctx.globalAlpha = f.t;
      ctx.fillStyle = f.color;
      ctx.font = 'bold 15px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText(f.text, W/2, f.y);
      ctx.globalAlpha = 1;
      f.t -= 0.02;
      f.y -= 0.4;
    }
    flashes = flashes.filter(f => f.t > 0);

    // HUD-надписи
    ctx.fillStyle = '#c9a882';
    ctx.font = '14px Georgia';
    ctx.textAlign = 'left';
    ctx.fillText('Жар: ' + Math.round(heat) + '°', 16, 28);
    ctx.fillText('Готово: ' + doneCount + '/6', 16, 48);

    if (!over) requestAnimationFrame(draw);
  }

  function addWood() {
    if (over) return;
    heat = Math.min(120, heat + 20);
    renderPots();
  }
  function damper() {
    if (over) return;
    heat = Math.max(0, heat - 15);
    renderPots();
  }

  function reset() {
    heat = 30; over = false; flashes = [];
    initDishes();
    winBox.classList.add('hidden');
    if (tickTimer) clearInterval(tickTimer);
    tickTimer = setInterval(tick, 700);
    requestAnimationFrame(draw);
  }

  document.querySelectorAll('#controls button').forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.act === 'wood') addWood();
      if (b.dataset.act === 'damper') damper();
      if (b.dataset.act === 'wait') { /* ждём — тик сам идёт */ }
    });
  });
  btnAgain.addEventListener('click', reset);
  reset();
})();