// QA-модуль Russia Games — звук, прогресс, пауза, mute.
// Подключается после game.js. Автодетект game-имени из document.title.
(() => {
  const GAME = (document.title || 'game').split('—')[0].trim();
  const STORE_KEY = 'rg_' + GAME;
  const store = {
    get: (k, d) => { try { const v = localStorage.getItem(STORE_KEY+'_'+k); return v===null?d:JSON.parse(v); } catch(_) { return d; } },
    set: (k, v) => { try { localStorage.setItem(STORE_KEY+'_'+k, JSON.stringify(v)); } catch(_) {} }
  };

  // --- WebAudio (простой синт, без сэмплов) ---
  const AC = window.AudioContext || window.webkitAudioContext;
  let actx = null, muted = store.get('muted', false);
  function ensureAC() {
    if (!actx && AC) {
      try { actx = new AC(); } catch(_) { actx = null; }
    }
    return actx;
  }
  function beep(freq, dur, type, gain) {
    if (muted) return;
    const a = ensureAC(); if (!a) return;
    if (a.state === 'suspended') a.resume();
    const o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq || 440;
    g.gain.value = gain === undefined ? 0.08 : gain;
    o.connect(g); g.connect(a.destination);
    const t0 = a.currentTime;
    g.gain.setValueAtTime(g.gain.value, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + (dur||0.15));
    o.start(t0); o.stop(t0 + (dur||0.15) + 0.02);
  }
  const SFX = {
    click: () => beep(660, 0.06, 'square', 0.05),
    move:  () => beep(440, 0.08, 'triangle', 0.07),
    good:  () => { beep(660,0.10,'sine',0.08); setTimeout(()=>beep(880,0.14,'sine',0.08),90); },
    win:   () => { [523,659,784,1046].forEach((f,i)=>setTimeout(()=>beep(f,0.18,'sine',0.10),i*110)); },
    lose:  () => { [440,330,220].forEach((f,i)=>setTimeout(()=>beep(f,0.20,'sawtooth',0.08),i*120)); }
  };

  // --- Mute-кнопка ---
  function addMuteBtn() {
    const hud = document.getElementById('hud');
    if (!hud || document.getElementById('qa-mute')) return;
    const b = document.createElement('button');
    b.id = 'qa-mute';
    b.type = 'button';
    b.title = 'Звук вкл/выкл (M)';
    b.textContent = muted ? '🔇' : '🔊';
    b.addEventListener('click', (e) => { e.stopPropagation(); toggleMute(); });
    hud.appendChild(b);
  }
  function toggleMute() {
    muted = !muted; store.set('muted', muted);
    const b = document.getElementById('qa-mute');
    if (b) b.textContent = muted ? '🔇' : '🔊';
    if (!muted) SFX.click();
  }

  // --- Пауза ---
  let paused = false;
  function togglePause() {
    paused = !paused;
    document.body.classList.toggle('qa-paused', paused);
    const b = document.getElementById('qa-pause');
    if (b) b.textContent = paused ? '▶' : '⏸';
  }
  function addPauseBtn() {
    const hud = document.getElementById('hud');
    if (!hud || document.getElementById('qa-pause')) return;
    const b = document.createElement('button');
    b.id = 'qa-pause';
    b.type = 'button';
    b.title = 'Пауза (Space)';
    b.textContent = '⏸';
    b.addEventListener('click', (e) => { e.stopPropagation(); togglePause(); });
    hud.appendChild(b);
  }

  // --- Клавиши ---
  document.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M' || e.key === 'ь' || e.key === 'Ь') { toggleMute(); }
    if (e.key === ' ' || e.code === 'Space') {
      if (document.activeElement && document.activeElement.tagName === 'BUTTON') return;
      e.preventDefault(); togglePause();
    }
  });

  // --- Адаптив canvas ---
  function fitCanvas() {
    const cv = document.querySelector('canvas');
    if (!cv) return;
    const maxW = Math.min(window.innerWidth - 32, cv.width);
    const maxH = Math.max(240, window.innerHeight - 220);
    const scale = Math.min(1, maxW / cv.width, maxH / cv.height);
    cv.style.width  = Math.round(cv.width  * scale) + 'px';
    cv.style.height = Math.round(cv.height * scale) + 'px';
  }
  window.addEventListener('resize', fitCanvas);
  setTimeout(fitCanvas, 0);

  // --- Хук на клики (SFX) ---
  document.addEventListener('pointerdown', () => { if (!muted) ensureAC(); }, {once:false});

  // --- Публичный API для игр ---
  window.QA = {
    sfx: SFX,
    mute: toggleMute,
    isMuted: () => muted,
    isPaused: () => paused,
    togglePause,
    store,
    game: GAME
  };

  // Инициализация после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { addMuteBtn(); addPauseBtn(); fitCanvas(); });
  } else {
    addMuteBtn(); addPauseBtn(); fitCanvas();
  }
})();