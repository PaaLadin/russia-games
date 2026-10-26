# ROADMAP — Russia Games (10 игр для itch.io)

**Папка:** projects/russia_games/
**Публичный URL:** https://sovintel.itch.io/<slug>
**Канал:** D (Димон), порт 8769, CDP 9225.
**Обновлено:** 2026-10-27 (11D).

## Статус

Все 10 игр опубликованы на itch.io, обложки и скриншоты залиты.
Текущий этап — улучшение качества и публикация на GitHub.

## Игры

| # | Slug | Механика | itch.io ID |
|---|------|----------|------------|
| 01 | matryoshka | рекурсивный паззл (5 слоёв) | 5238824 |
| 02 | banya | жар/пар, 5 гостей | 5238825 |
| 03 | transsib | топливо/вода, 10 станций | 5238829 |
| 04 | pech | 6 блюд, жар/время | 5238833 |
| 05 | konstruktivizm | 5 зданий по образцу | 5238839 |
| 06 | lukomorye | рогалик, 3 уровня | 5238844 |
| 07 | rybalka | лёд/поклёвка/холод | 5238848 |
| 08 | samovar | 6 гостей, угли/заварка | 5238853 |
| 09 | gorodki | бросок биты, 3 фигуры | 5238856 |
| 10 | gagarin | орбита, 3 витка | 5238860 |

## История

### Этап 1. Публикация (10D, 2026-10-26) — ЗАКРЫТ
- [x] 10 прототипов: index.html + js/game.js + css/style.css + cover + 3 shot.
- [x] ZIP-упаковка (projects/itch_builds/<NN>_<slug>.zip).
- [x] HTML5-тип через инжект `option value='html'`.
- [x] Публикация: 10/10 на itch.io, проверено (iframe поднимается).

### Этап 2. Обложки и скриншоты (10D, 2026-10-27) — ЗАКРЫТ
- [x] Cover Image на всех 10 страницах (og:image=yes).
- [x] Screenshots: 3 на каждой (347x500).
- [x] Скрипт: sandbox/upload_assets.py.
### Этап 3. Улучшение и QA (11D, 2026-10-27) — В РАБОТЕ
- [ ] QA-эталон на 01_matryoshka: адаптив + звук + localStorage + пауза.
- [ ] Применить к 02-10.
- [ ] Прогон через нативный CDP (по 2 игры за раз).
- [ ] Перепаковка ZIP.
- [ ] Reupload на itch.io (если оператор подтвердит).

### Этап 4. Git-публикация (11D, 2026-10-27) — В РАБОТЕ
- [ ] git init projects/russia_games.
- [ ] .gitignore (*.bak*, cover дубликаты не игнорируем).
- [ ] README.md в корне.
- [ ] Push в PaaLadin/russia-games.

## QA-стандарт (эталон)

1. **Адаптив:** canvas масштабируется под viewport (max-width 100%,
   максимальная высота vh-20). CSS media-query для мобильных (<600px).
2. **Звук:** WebAudio (простой синт: click/capture/win/lose), mute
   кнопка в HUD, состояние в localStorage.
3. **Прогресс:** localStorage — счёт/лучший результат/уровень.
4. **Пауза:** клавиша Space / кнопка.
5. **Debug API:** `window.__m.state()` / `window.__m.reset()`.
6. **Метатеги:** `<meta name="description">`, `<meta property="og:title">`.
7. **Без ошибок:** 0 pageerror в CDP-прогоне.
8. **Победа достижима:** тест «форсировать победу» + тест «форсировать поражение».

Dixi. 11D (Димон), 2026-10-27.
### Этап 3. Улучшение и QA (11D, 2026-10-27) — ЗАКРЫТ
- [x] QA-модуль: projects/russia_games/_shared/qa.js + qa.css.
      Подключён во все 10 игр (копия + link/script в index.html).
- [x] Mute (M / кнопка), пауза (Space / кнопка), WebAudio-синт
      (click/move/good/win/lose), localStorage (game-префикс).
- [x] Адаптив: fitCanvas() — canvas вписывается в viewport,
      CSS media-query для <640px.
- [x] Smoke (десктоп 9225): 10/10 PASS. errs=0, QA=object,
      кнопки на месте, canvas отрисован.
- [x] Геймплейные тесты 10/10 PASS:
      01 matryoshka — слои, поворот, solved0→1;
      02 banya — 5 гостей, score 95, win;
      03 transsib — 9 станций, Владивосток, 7 пассажиров;
      04 pech — блюдо готовится, done 0→1;
      05 konstruktivizm — 5 зданий, over=true, win;
      06 lukomorye — 3 уровня, over=true, win;
      07 rybalka — победа (time=0) + поражение (cold=100);
      08 samovar — 6 гостей, score 264, win;
      09 gorodki — бросок, 8 фигур, over=true, win;
      10 gagarin — победа (Поехали!) + поражение (Сгорел).
- [x] Мобильный прогон (viewport 375×667, Emulation): 10/10 PASS,
      overflow_x=false, QA-кнопки видимы, canvas вписан.
- [x] Артефакты: sandbox/_11d_mobile_all.json,
      sandbox/_11d_rg_inv.json, sandbox/_11d_page_test3.py,
      sandbox/_11d_page_test_mobile.py.

### Этап 4. Git-публикация (11D, 2026-10-27) — В РАБОТЕ
- [ ] .gitignore.
- [ ] README.md в корне.
- [ ] git init + commit.
- [ ] Push в PaaLadin/russia-games.