# Russia Games — 10 игр

10 небольших браузерных игр про русскую культуру, быт и историю.
Стек: ванильный HTML + CSS + Canvas 2D + WebAudio. Без сборки.
Каждая — самодостаточная папка: `index.html` + `js/game.js` + `css/style.css`.

## Игры

| # | Папка | Механика |
|---|-------|----------|
| 01 | `01_matryoshka` | рекурсивный паззл, 5 слоёв |
| 02 | `02_banya` | симулятор парения, 5 гостей |
| 03 | `03_transsib` | менеджмент поезда, 10 станций |
| 04 | `04_pech` | тайм-менеджмент томления, 6 блюд |
| 05 | `05_konstruktivizm` | архитектурный паззл, 5 зданий |
| 06 | `06_lukomorye` | сказочный рогалик, 3 уровня |
| 07 | `07_rybalka` | зимняя рыбалка |
| 08 | `08_samovar` | чайная церемония, 6 гостей |
| 09 | `09_gorodki` | городки, 3 фигуры |
| 10 | `10_gagarin` | орбитальный симулятор, 3 витка |

Опубликованы на itch.io: https://sovintel.itch.io/<slug>
(список slug — в ROADMAP.md).

## Запуск

Открыть `index.html` в браузере. Никакой сборки не требуется.
Или локальный сервер:

    python -m http.server 8080
    # http://localhost:8080/01_matryoshka/

## QA-модуль

Папка `_shared/` содержит общий модуль `qa.js` + `qa.css`,
копируемый в каждую игру (самодостаточность ZIP):

- WebAudio-синт (click/move/good/win/lose) без сэмплов.
- Mute (M / кнопка).
- Пауза (Space / кнопка).
- Адаптив canvas (`fitCanvas()`).
- localStorage с префиксом игры.

## Тесты

Все 10 игр прошли:
- Desktop smoke: errs=0, QA-кнопки работают.
- Gameplay: победа достижима в каждой.
- Mobile (375×667): canvas вписан, overflow_x=false.

Артефакты тестов: `sandbox/_11d_mobile_all.json`,
`sandbox/_11d_rg_inv.json` (в родительском репо DeepSeek, не в этом).

## Структура

    russia_games/
    ├── 01_matryoshka/
    │   ├── index.html
    │   ├── css/style.css
    │   ├── css/qa.css
    │   ├── js/game.js
    │   ├── js/qa.js
    │   ├── cover.png
    │   └── shot_*.png
    ├── 02_banya/  ...  10_gagarin/
    ├── _shared/qa.js, qa.css
    ├── ROADMAP.md
    └── README.md

## Лицензия

MIT (см. LICENSE).