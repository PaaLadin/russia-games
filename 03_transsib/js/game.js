// Транссиб — менеджмент: топливо, вода, пассажиры, погода.
(() => {
  const cv = document.getElementById('view');
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;

  const elStation = document.getElementById('station');
  const elCoal = document.getElementById('coal');
  const elWater = document.getElementById('water');
  const elPass = document.getElementById('passengers');
  const elLog = document.getElementById('log');
  const winBox = document.getElementById('win');
  const elTitle = document.getElementById('end-title');
  const elText = document.getElementById('end-text');
  const btnAgain = document.getElementById('btn-again');
  const btnGo = document.getElementById('btn-go');

  const STATIONS = ['Москва', 'Ярославль', 'Киров', 'Пермь', 'Екатеринбург',
                    'Омск', 'Новосибирск', 'Красноярск', 'Иркутск', 'Владивосток'];
  const DIST = [0, 280, 900, 1400, 1800, 2400, 3300, 4100, 5200, 9200];

  let coal = 100, water = 100, passengers = 0, station = 0;
  let score = 0, trainX = 60, anim = 0;
  let over = false;

  function log(msg) {
    const d = document.createElement('div');
    d.textContent = msg;
    elLog.appendChild(d);
    elLog.scrollTop = elLog.scrollHeight;
  }

  function hud() {
    elStation.textContent = station;
    elCoal.textContent = Math.round(coal);
    elWater.textContent = Math.round(water);
    elPass.textContent = passengers;
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // небо
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0e1420');
    grad.addColorStop(1, '#2a3a52');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // горы/лес
    ctx.fillStyle = '#152030';
    for (let i = 0; i < 12; i++) {
      const x = i * 60, h = 60 + ((i * 37) % 80);
      ctx.beginPath();
      ctx.moveTo(x, H - 100);
      ctx.lineTo(x + 30, H - 100 - h);
      ctx.lineTo(x + 60, H - 100);
      ctx.fill();
    }
    // земля
    ctx.fillStyle = '#101828';
    ctx.fillRect(0, H - 100, W, 100);
    // рельсы
    ctx.strokeStyle = '#4a5a6a';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, H - 70); ctx.lineTo(W, H - 70); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, H - 60); ctx.lineTo(W, H - 60); ctx.stroke();
    // шпалы
    ctx.strokeStyle = '#3a4a5a';
    ctx.lineWidth = 2;
    for (let x = 0; x < W; x += 24) {
      ctx.beginPath(); ctx.moveTo(x, H - 72); ctx.lineTo(x, H - 58); ctx.stroke();
    }

    // поезд
    const tx = 40 + trainX * 0.5;
    ctx.fillStyle = '#2a6a4a';
    ctx.fillRect(tx, H - 100, 140, 32);        // локомотив
    ctx.fillStyle = '#4a8a6a';
    ctx.fillRect(tx + 10, H - 108, 30, 10);     // труба
    ctx.fillStyle = '#2a4a3a';
    ctx.fillRect(tx + 150, H - 96, 80, 24);     // вагон 1
    ctx.fillRect(tx + 240, H - 96, 80, 24);     // вагон 2
    ctx.fillStyle = '#6aa8d8';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(tx + 160 + i * 14, H - 88, 10, 8);
      ctx.fillRect(tx + 250 + i * 14, H - 88, 10, 8);
    }
    // колёса
    ctx.fillStyle = '#0a1018';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(tx + 20 + i * 40, H - 62, 8, 0, 7);
      ctx.fill();
    }
    // дым
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = 'rgba(180,190,200,' + (0.35 - i * 0.06) + ')';
      ctx.beginPath();
      ctx.arc(tx + 25 - i * 18, H - 110 - i * 16 - (anim % 10), 8 + i * 3, 0, 7);
      ctx.fill();
    }

    // погода/индикатор
    ctx.font = '13px Georgia';
    ctx.fillStyle = '#9ab0c8';
    ctx.fillText('Станция ' + station + '/' + (STATIONS.length - 1) + ': ' + STATIONS[station], 12, 22);
    ctx.fillText('Расстояние до конца: ' + (DIST[DIST.length - 1] - DIST[station]) + ' км', 12, 42);

    anim += 1;
    if (!over) requestAnimationFrame(draw);
  }

  function travel() {
    if (over) return;
    if (station >= STATIONS.length - 1) return finish(true);
    const dist = DIST[station + 1] - DIST[station];
    const coalNeed = Math.round(dist / 80);
    const waterNeed = Math.round(dist / 120);
    if (coal < coalNeed) { log('Уголь кончился на перегоне. Поезд встал.'); return finish(false); }
    if (water < waterNeed) { log('Вода кончилась. Котёл остыл.'); return finish(false); }

    coal -= coalNeed;
    water -= waterNeed;
    trainX += dist / 40;

    // случайное событие
    const r = Math.random();
    if (r < 0.30) {
      const add = 3 + Math.floor(Math.random() * 6);
      passengers += add;
      log('Станция ' + STATIONS[station + 1] + ': +' + add + ' пассажиров.');
    } else if (r < 0.50) {
      log('Станция ' + STATIONS[station + 1] + ': тихо, без событий.');
    } else if (r < 0.75) {
      const w = 5 + Math.floor(Math.random() * 10);
      water = clamp(water - w, 0, 100);
      log('Жара на перегоне: котёл пил воду (-' + w + ').');
    } else {
      const c = 5 + Math.floor(Math.random() * 10);
      coal = clamp(coal - c, 0, 100);
      log('Ветер и снег: уголь угорел (-' + c + ').');
    }

    station++;
    score += 10 + passengers;
    hud();
    if (station === STATIONS.length - 1) {
      log('Владивосток! Поезд прибыл.');
      finish(true);
    }
  }

  function addCoal() {
    if (over) return;
    coal = clamp(coal + 25, 0, 100);
    passengers = Math.max(0, passengers - 1);
    log('Погрузили уголь (+25), один пассажир ушёл.');
    hud();
  }

  function addWater() {
    if (over) return;
    water = clamp(water + 25, 0, 100);
    passengers = Math.max(0, passengers - 1);
    log('Набрали воды (+25), один пассажир ушёл.');
    hud();
  }

  function rest() {
    if (over) return;
    passengers += 2;
    log('Привал: +2 пассажира, все отдохнули.');
    hud();
  }

  function finish(win) {
    over = true;
    btnGo.disabled = true;
    if (win) {
      elTitle.textContent = 'ВЛАДИВОСТОК!';
      elTitle.style.color = '#6ad8a8';
      elText.textContent = 'Поезд дошёл до конца пути. Пассажиров: ' + passengers +
        '. Счёт: ' + score + '.';
    } else {
      elTitle.textContent = 'ПОЕЗД ВСТАЛ';
      elTitle.style.color = '#d06a4a';
      elText.textContent = 'Дошли до станции ' + station + ' (' + STATIONS[station] +
        '). Пассажиров: ' + passengers + '. Счёт: ' + score + '.';
    }
    winBox.classList.remove('hidden');
  }

  function reset() {
    coal = 100; water = 100; passengers = 0; station = 0; score = 0;
    trainX = 60; over = false;
    elLog.innerHTML = '';
    btnGo.disabled = false;
    winBox.classList.add('hidden');
    log('Поезд отправлен из Москвы. Уголь 100%, вода 100%.');
    hud();
    if (anim === 0) requestAnimationFrame(draw);
  }

  btnGo.addEventListener('click', travel);
  document.getElementById('btn-coal').addEventListener('click', addCoal);
  document.getElementById('btn-water').addEventListener('click', addWater);
  document.getElementById('btn-rest').addEventListener('click', rest);
  btnAgain.addEventListener('click', reset);

  reset();
})();