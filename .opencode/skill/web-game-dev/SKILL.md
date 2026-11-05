---
name: web-game-dev
description: Использовать при любой работе с кодом игры — Phaser 3 + TypeScript + Vite: сцены, физика, тайлмапы, сущности, системы. Триггеры: новая механика, правка сцены/сущности/системы, баг в игровом цикле, вопросы «как сделать X в игре»
---

# Паттерны Phaser 3 + TS + Vite (EchoOfTheDepot)

Структура проекта и фазы — в `Docs/WEB_PLAN.md`. Здесь — рабочие паттерны и грабли.

## Конфиг и бут
- `pixelArt: true`, `roundPixels: true`, scale FIT, 1280×720, `parent` — div под DOM-слоем UI.
- Ассеты грузим в BootScene (`this.load.*`), анимации создаём там же один раз (`this.anims.create`).
- Ключи ассетов — kebab-case, совпадают с именами файлов.

## Сцены
- Boot (load) → World (карта, сущности, камера). UI — DOM, НЕ сцена Phaser.
- Подписки EventBus сцена/сущности обязана снять в `this.events.once(Phaser.Scenes.Events.SHUTDOWN, ...)` — иначе утечки и двойные обработчики после рестарта сцены.

## Физика (arcade)
- Столкновения со стенами: Tiled-слой с property `collides: true` → `layer.setCollisionByProperty({ collides: true })` + `physics.add.collider(player, layer)`.
- Interact/лут — `physics.add.overlap`, не collider.
- Хитбокс меньше спрайта: `body.setSize(w, h, true)`.
- Снаряды/партиклы — пул объектов (reuse), не `new` каждый выстрел.

## Сущности и Y-sort
- Все мировые сущности — в одной группе; в `update` сущности: `this.setDepth(this.y)`.
- Сущность = Phaser sprite + компоненты (stats/inventory/interact). Player худой: движение+input, никакой игровой логики.
- FSM врагов: `enum State` + таблица переходов в `components/enemy-brain.ts`, без классов на каждое состояние.

## Игровой цикл и время
- `update(time, delta)` в WorldScene → раздача dt системам. Всегда: `const dt = Math.min(delta, 50) / 1000` — кламп от прыжка после сворачивания вкладки.
- Игровое время (день 10 мин) — только через `TimeSystem` (чистый TS, тестируемый). Системы не читают Phaser-часы напрямую.
- Таймеры респауна — `scene.time.addEvent`, не `setInterval`.
- Одинарные нажатия — `JustDown`, удержание — `isDown`.

## Камера
- `startFollow(player, true, 0.1, 0.1)`, `setBounds` от размера карты, zoom кратный целым (1 или 2) — иначе шиммер пиксель-арта.

## Тестируемость
- Системы (time/stats/crafting/conditions/waves/archiv) — чистый TS без импорта phaser. Phaser-зависимое — только сцены/сущности/рендер.
- Чистые системы получают время извне (параметр dt) — Vitest без браузера.
- Сейв: JSON со `schemaVersion`, ключ `eotd-save-v1`; миграция при смене схемы, не «сломалось — ну ладно».

## Грабли (не наступать)
- `document`/DOM из игровых классов запрещён — только через EventBus → `src/bridge/`.
- Мутации GameState напрямую из UI — только команды через EventBus в мир.
- Новая сущность без `setDepth` = дрожание слоёв.
- Phaser types: не `any`. Строгий TS — guardrail агента.

## Стиль кода
- Классы PascalCase, члены camelCase, файлы kebab-case. Булевы `Is/Has/Can`, функции-глаголы, события `On*`.
- Один файл ≈ одна ответственность; класс > ~300 строк — сигнал на разрез.
