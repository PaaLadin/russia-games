// Городки — бросок биты, сбивание фигур. 3 фигуры, счёт по броскам.
(() => {
  const cv = document.getElementById('view');
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;

  const elFig = document.getElementById('fig');
  const elThrows = document.getElementById('throws');
  const elScore = document.getElementById('score');
  const elPower = document.getElementById('power');
  const elAngle = document.getElementById('angle');
  const elPowerVal = document.getElementById('power-val');
  const elAngleVal = document.getElementById('angle-val');
  const btnThrow = document.getElementById('btn-throw');
  const winBox = document.getElementById('win');
  const elTitle = document.getElementById('end-title');
  const elText = document.getElementById('end-text');
  const btnAgain = document.getElementById('btn-again');

  // фигуры: набор точек (кирпичиков) в локальных координатах, шаг 22
  const STEP = 16;
  const FIGURES = [
    { name: 'Пушка', bricks: [[0,0],[0,-1],[0,-2],[1,-2],[-1,-2]] },
    { name: 'Звезда', bricks: [[0,0],[0,-1],[0,1],[-1,0],[1,0]] },
    { name: 'Колодец', bricks: [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]] },
  ];

  let figIdx = 0;
  let throws = 0;
  let score = 0;
  let bricks = [];        // мировые координаты оставшихся кирпичиков
  let bat = null;         // { x, y, vx, vy, flying }
  let over = false;
  let figOrigin = { x: 0, y: 0 };
  let msg = '', msgT = 0;

  function loadFigure(i) {
    figIdx = i;
    const f = FIGURES[i];
    figOrigin = { x: W/2, y: 110 };
    bricks = f.bricks.map(([dx, dy]) => ({
      x: figOrigin.x + dx * STEP,
      y: figOrigin.y + dy * STEP,
      alive: true
    }));
    elFig.textContent = (i + 1) + '/' + FIGURES.length;
    msg = 'Фигура: ' + f.name;
    msgT = 2.5;
    draw();
  }

  function throwBat() {
    if (over || bat) return;
    const power = parseInt(elPower.value, 10) / 100;
    const angle = parseInt(elAngle.value, 10) * Math.PI / 180;
    // старт прямо под фигурой; при angle=0 летит вверх и попадает
    bat = {
      x: W/2, y: H - 80,
      vx: Math.sin(angle) * power * 12,
      vy: -power * 20,
      flying: true,
      trail: []
    };
    throws++;
    elThrows.textContent = throws;
    score = Math.max(0, score - 1);
    elScore.textContent = score;
  }

  function distPointSeg(px, py, x0, y0, x1, y1) {
    const dx = x1 - x0, dy = y1 - y0;
    const l2 = dx*dx + dy*dy;
    let t = l2 > 0 ? ((px - x0)*dx + (py - y0)*dy) / l2 : 0;
    t = Math.max(0, Math.min(1, t));
    const cx = x0 + t*dx, cy = y0 + t*dy;
    return Math.hypot(px - cx, py - cy);
  }

  function stepBat() {
    if (!bat || !bat.flying) return;
    bat.trail.push({ x: bat.x, y: bat.y });
    if (bat.trail.length > 12) bat.trail.shift();

    const x0 = bat.x, y0 = bat.y;
    const x1 = bat.x + bat.vx;
    const y1 = bat.y + bat.vy;
    for (const b of bricks) {
      if (!b.alive) continue;
      if (distPointSeg(b.x, b.y, x0, y0, x1, y1) < 20) {
        b.alive = false;
        score += 5;
        elScore.textContent = score;
      }
    }
    bat.x = x1; bat.y = y1;
    bat.vy += 0.4;

    if (bat.y > H + 40 || bat.x < -40 || bat.x > W + 40 || bat.y < -60) {
      bat = null;
      checkState();
    }
  }

  function checkState() {
    const left = bricks.filter(b => b.alive).length;
    if (left === 0) {
      if (figIdx < FIGURES.length - 1) {
        setTimeout(() => loadFigure(figIdx + 1), 600);
        msg = 'Фигура сбита!';
        msgT = 2.0;
      } else {
        finish(true);
      }
    } else if (throws > 25) {
      finish(false);
    }
  }

  function draw() {
    // фон: поле, трава, город
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1a2010');
    g.addColorStop(0.6, '#2a3018');
    g.addColorStop(1, '#3a4020');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // линия кона
    ctx.strokeStyle = '#6a7030'; ctx.lineWidth = 2;
    ctx.setLineDash([10, 6]);
    ctx.beginPath(); ctx.moveTo(0, H - 100); ctx.lineTo(W, H - 100); ctx.stroke();
    ctx.setLineDash([]);

    // кирпичики (фигура)
    for (const b of bricks) {
      if (!b.alive) continue;
      ctx.fillStyle = '#a08040';
      ctx.fillRect(b.x - 11, b.y - 11, 22, 22);
      ctx.strokeStyle = '#5a4020'; ctx.lineWidth = 2;
      ctx.strokeRect(b.x - 11, b.y - 11, 22, 22);
    }

    // бита
    if (bat) {
      // след
      for (let i = 0; i < bat.trail.length; i++) {
        const t = bat.trail[i];
        ctx.fillStyle = 'rgba(220,200,120,' + (i / bat.trail.length * 0.4) + ')';
        ctx.beginPath(); ctx.arc(t.x, t.y, 3, 0, 7); ctx.fill();
      }
      // бита (палка)
      ctx.save();
      ctx.translate(bat.x, bat.y);
      ctx.rotate(Math.atan2(bat.vy, bat.vx));
      ctx.fillStyle = '#8a6020';
      ctx.fillRect(-20, -4, 40, 8);
      ctx.fillStyle = '#c8a050';
      ctx.fillRect(-20, -3, 40, 3);
      ctx.restore();
    }

    // метка броска (позиция)
    ctx.fillStyle = 'rgba(216,192,96,.25)';
    ctx.beginPath(); ctx.arc(W/2, H - 80, 12, 0, 7); ctx.fill();

    // HUD на канвасе
    ctx.fillStyle = '#d8c060';
    ctx.font = 'bold 16px Georgia';
    ctx.textAlign = 'left';
    ctx.fillText('Фигура: ' + (figIdx + 1) + '/' + FIGURES.length, 16, 30);
    ctx.fillText('Броски: ' + throws, 16, 52);
    ctx.fillText('Очки: ' + score, 16, 74);
    const left = bricks.filter(b => b.alive).length;
    ctx.fillText('Осталось: ' + left, 16, 96);

    // сообщение
    if (msgT > 0) {
      ctx.globalAlpha = Math.min(1, msgT);
      ctx.fillStyle = '#f0ecd0';
      ctx.font = 'bold 20px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText(msg, W/2, 60);
      ctx.globalAlpha = 1;
      msgT -= 0.02;
    }

    if (bat) stepBat();
    requestAnimationFrame(draw);
  }

  function finish(win) {
    over = true;
    btnThrow.disabled = true;
    elTitle.textContent = win ? 'ГОРОД ВЗЯТ' : 'ПРОМАХ ЗА ПРОМАХОМ';
    elTitle.style.color = win ? '#7ad07a' : '#d06a4a';
    elText.textContent = 'Фигур сбито: ' + (win ? FIGURES.length : figIdx) +
      ', бросков: ' + throws + ', очки: ' + score + '.';
    winBox.classList.remove('hidden');
  }

  function reset() {
    figIdx = 0; throws = 0; score = 0; over = false; bat = null; msg = ''; msgT = 0;
    elThrows.textContent = 0;
    elScore.textContent = 0;
    btnThrow.disabled = false;
    winBox.classList.add('hidden');
    loadFigure(0);
  }

  elPower.addEventListener('input', () => { elPowerVal.textContent = elPower.value; });
  elAngle.addEventListener('input', () => { elAngleVal.textContent = elAngle.value; });
  btnThrow.addEventListener('click', throwBat);
  btnAgain.addEventListener('click', reset);

  // API
  window.__g = {
    state: () => ({ figIdx, throws, score, over, bricks_left: bricks.filter(b => b.alive).length, flying: !!bat }),
    throwBat, reset,
    setPower: (p) => { elPower.value = p; elPowerVal.textContent = p; },
    setAngle: (a) => { elAngle.value = a; elAngleVal.textContent = a; },
    // прямое сбивание для тестов
    smash: (i) => { if (bricks[i]) { bricks[i].alive = false; checkState(); } }
  };

  reset();
})();