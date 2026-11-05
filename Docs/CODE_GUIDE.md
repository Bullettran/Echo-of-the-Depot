# CODE_GUIDE — справочник кода веб-трека «Эхо Депо»

> Для чего: что делает каждая функция/класс и **что нужно, чтобы её дорабатывать**.
> Обновляется в том же коммите, где меняется публичный API (правило 8 AGENTS.md).
> Стек: TypeScript + Vite + Phaser 3, UI — DOM поверх canvas. Фазы — `Docs/WEB_PLAN.md`.

---

## 0. Карта проекта и поток данных

```
src/
  data/         — чистые данные (JSON) + типы. Баланс правится здесь, код не трогаем
  core/         — EventBus (шина событий) — «нервная система»
  systems/      — глобальные системы (время). Чистый TS, тестируются без браузера
  components/   — логика сущностей (нужды, условия). Чистый TS, тестируются без браузера
  entities/     — Phaser-спрайты (худые: движение+ввод, логики нет)
  scenes/       — Phaser-сцены: строят мир и ОРКЕСТРИРУЮТ тики систем
  ui/           — DOM-интерфейс. ЗНАЕТ только свои данные из событий
  bridge/       — единственное место подписок DOM на шину
```

Поток: `сцена тикает системы → системы эмитят события в шину → bridge → DOM`.
UI никогда не читает мир сам; мир не читает DOM. Команда игрока из UI (будущее: крафт)
пойдёт обратным путём — событием `ui:*` в шину.

**Порядок тика в WorldScene.update():** `TimeSystem → Conditions → Stats → Player`.
Менять порядок нельзя без чтения «Грабли» в скиле web-game-dev.

---

## 1. Слой данных — `src/data/`

### types.ts — контракты
| Экспорт | Что это |
|---|---|
| `E_TimePhase` | фазы суток: Dawn 5–7, Day 7–18, Dusk 18–20, Night 20–5 |
| `E_StatType` | ключи статов: `hp`, `hunger`, `thirst` (значения = ключи в JSON) |
| `E_ConditionId` | id условий: `starving`, `dehydrated`, `carrier-restart` (значения = ключи в effects.json) |
| `S_StatsSnapshot` | текущие статы `{ hp, hunger, thirst }` |
| `S_StatsConfig` | схема stats.json: start/max/decayPerHour |
| `S_EffectConfig` | схема effects.json: name, hpPerHour?, durationHours?, statCapPercent? |
| `S_ConditionView` | payload для UI: id, name, remainingHours |
| `S_ItemConfig` / `S_ItemUse` | схема items.json: name/type/stack + эффект употребления |
| `S_InvSlot` | слот рюкзака: `{ itemId, count }` |
| `S_ResourceConfig` | схема resources.json: name/action/texture/drops/respawnHours |

### stats.json — баланс нужд
- `start` — стартовые значения; `max` — глобальные максимумы (нормировка полосок);
  `decayPerHour` — расход за **игровой** час (день = 10 реальных минут = 24 игровых часа).
- **Крутить для баланса:** decayPerHour. Сейчас голод ~5,5 мин реального времени до нуля —
  пересмотреть после появления еды (W1.2).

### effects.json — дебаффы
- Ключ объекта = `E_ConditionId` (значения енума, kebab-case!).
- `hpPerHour` — урон HP за игровой час (отрицательный); `durationHours` — срок
  (нет поля = активен, пока есть условие-источник); `statCapPercent` — потолок всех статов, %.

### items.json — предметы
- `type`: `material` (строительный ресурс) | `consumable` (можно употребить кликом в инвентаре).
- `stack` — вместимость слота; `use` — эффект употребления (какие статы и на сколько).
- **Как добавить предмет:** блок в items.json (+ CSS-класс `.item-{id}` с цветом для иконки).
  UI подхватит имя/тултип автоматически.

### resources.json — ресурсные ноды
- `action` — глагол промпта («Собрать», «Вскрыть»); `texture` — ключ текстуры из BootScene;
  `drops` — что даёт при сборе; `respawnHours` — через сколько **игровых** часов оживает.
- **Как добавить тип ноды:** блок в resources.json + текстура в BootScene `createNodeTextures()`
  + точка в `NODE_LAYOUT` (WorldScene). С W2 точки переедут в объектный слой Tiled-карты.

### inventory.json
- `capacity` — число слотов рюкзака (используют InventoryComponent и сетка UI).

**Как добавить дебафф:** 1) значение в `E_ConditionId` → 2) блок в effects.json →
3) триггер включения/выключения в `StatsComponent.syncConditions()` или новом источнике →
4) тесты → 5) строку в этот справочник. UI подхватит бейдж автоматически.

---

## 2. Ядро — `src/core/event-bus.ts`

### `EventBus<M>`
| Метод | Делает | События |
|---|---|---|
| `on(event, handler)` | подписка; возвращает **функцию отписки** | — |
| `off(event, handler)` | отписка | — |
| `emit(event, payload)` | синхронная рассылка подписчикам канала | — |

### `gameEvents` — синглтон шины
Мост к DOM и сцена используют его. Системы/компоненты получают шину **инжектом**
в конструктор (тестируемость) — в тестах создаётся свой `EventBus`.

### Карта событий (GameEventMap) — на 05.11
| Канал | Payload | Эмиттер → потребитель |
|---|---|---|
| `time:minute` / `time:newDay` / `time:phase` | время | TimeSystem → HUD (часы) |
| `stats:changed` | статы 0..1 | StatsComponent → HUD полоски |
| `conditions:changed` | активные дебаффы | Conditions → HUD бейджи |
| `player:died` | — | Stats → сцена (респаун) + HUD (сообщение) |
| `interact:prompt` | label \| null | Interact → HUD промпт «[E] …» |
| `loot:collected` | itemId, count | ResourceNode → тост «+N Предмет» |
| `inventory:changed` | слоты | Inventory → панель рюкзака |
| `inventory:full` | itemId | ResourceNode → тост «Рюкзак полон» |
| `ui:use-item` | itemId | панель рюкзака → сцена (употребить) |

**Как добавить событие:** ключ `domain:name` в `GameEventMap` (тип payload обязательно),
эмит из системы, подписка в bridge (если нужен UI). UI не подписывается нигде больше.

---

## 3. Системы — `src/systems/time-system.ts`

### `TimeSystem`
| Член | Делает |
|---|---|
| `update(dtMs)` | двигает время; эмитит `time:minute` / `time:newDay` / `time:phase`; **возвращает игровые часы** — их кормят Conditions/Stats |
| `day` / `hour` / `minute` | текущее время суток |
| `phase` | фаза суток (границы — в `computePhase`) |

- Длина дня: константа `DEFAULT_DAY_LENGTH_MS` = 600 000 (10 мин, WEB_PLAN §2).
- **Доработка (W4):** расписание событий волн — подписчик `time:newDay` в WaveDirector,
  сам TimeSystem менять не нужно. Ночные эффекты (W3) — слушатели `time:phase`.

---

## 4. Компоненты выживания — `src/components/`

### `ConditionsComponent` (conditions-component.ts)
| Метод | Делает | События |
|---|---|---|
| `activate(id)` | включить условие (идемпотентно) | `conditions:changed` |
| `deactivate(id)` | выключить (если было) | `conditions:changed` |
| `tick(dtHours)` | списывает сроки временных условий, истёкшие снимает | `conditions:changed` |
| `isActive(id)` | проверка | — |
| `getStatCapPercent()` | минимальный потолок статов среди активных, % | — |
| `getHpDrainPerHour()` | суммарный урон HP за игровой час | — |

- Не знает про статы: решает StatsComponent, когда включать/выключать.
- **Доработка:** баффы (лечение, скорость) — тот же механизм, `hpPerHour` может быть
  положительным, кап — 100+ (но >100 не завышать без нужды).

### `StatsComponent` (stats-component.ts)
| Член | Делает | События |
|---|---|---|
| `tick(dtHours)` | расход нужд → пороговые дебаффы → урон HP от них; hp≤0 → смерть | `stats:changed`, `player:died` |
| `add(type, amount)` | изменить стат (еда/вода/урон); урон в 0 убивает **сразу** | `stats:changed`, возможно `player:died` |
| `respawn()` | статы 50% + условие `carrier-restart`; снимает смерть. Вызывает сцена | `stats:changed` |
| `effectiveMax(type)` | максимум с учётом капов условий | — |
| `snapshot` / `IsDeadState` | чтение (копия/флаг) | — |

- Эмитит `stats:changed` только при изменении ≥0.1 (не спамит HUD каждый кадр);
  payload **нормирован 0..1** к глобальному максимуму.
- **Как добавить стат (чек-лист):** 1) значение в `E_StatType` → 2) поле в
  `S_StatsSnapshot` → 3) start/max (+decay, если расход) в stats.json →
  4) строка в `StatsComponent.tick` → 5) `BAR_DEFS` + CSS в hud → 6) тесты →
  7) эта страница. Пример-образец: `thirst`.
- **Смерть/респаун:** позицию игрока восстанавливает сцена (см. WorldScene), статы —
  сам компонент. Экран смерти — будущий DOM-оверлей на `player:died` (BACKLOG).

### `InventoryComponent` (inventory-component.ts) — рюкзак
| Метод | Делает | События |
|---|---|---|
| `add(itemId, count)` | докладывает в стаки, затем в пустые слоты; возвращает сколько поместилось | `inventory:changed` |
| `remove(itemId, count)` | атомарно забирает (не хватает — false, ничего не тронуто) | `inventory:changed` |
| `count(itemId)` / `slotsView` | чтение | — |
| `canFit(entries)` | сухой прогон «влезет ли весь набор» — ноды тратятся только при полном помещении | — |

- Число слотов — data/inventory.json; стеки предметов — items.json (`stack`).
- **Доработка (по GAME_PLAN):** весовой лимит/Overburdened — добавить поле `weight` в
  items.json и подсчёт в этом компоненте; UI перегруза — слушатель `inventory:changed`.

### `InteractComponent` (interact-component.ts) — взаимодействие по E
| Метод | Делает | События |
|---|---|---|
| `bindKey()` / `destroy()` | window-листенер E (`!e.repeat` — без авто-повтора) | — |
| `update()` | ближайшая доступная цель в радиусе; промпт эмитится при смене цели | `interact:prompt` |

- Радиус — константа `INTERACT_RADIUS` в WorldScene (96 px).
- Цели — всё, что реализует `I_Interactable` (entities/interactable.ts):
  `getLabel / IsAvailable / interact / getInteractCenter`. Станция-модули (W2) и верстак
  реализуют этот же интерфейс — система подхватит их без изменений.

---

## 5. Сущности и сцены

### `Player` (entities/player.ts) — худой, правило №1
| Член | Делает |
|---|---|
| `constructor` | спрайт+arcade body (12×10, меньше спрайта), input: `event.code` (раскладко-независимо) + стрелки, `addCapture`, window-листенеры |
| `update()` | скорость по зажатым клавишам, нормализация диагонали, flipX, Y-сортировка `depth=y`. **Вызывается сценой явно** (UpdateList не зовёт update!) |
| `destroy()` | снимает window-листенеры |
| `onBlur` | чистит зажатые клавиши при потере фокуса окна |

- **Доработка:** анимация ходьбы — `sprite.play()` здесь; экипировка/оружие — отдельные
  компоненты, НЕ в Player (правило 1).

### `BootScene` — генератор текстур-заглушек
- `createPlayerTexture()` → `player` 16×16; `createGroundTexture()` → `ground` 32×32;
  `createNodeTextures()` → `node-scrap`, `node-copper`, `node-cache` (ключи = texture в resources.json).
- **Доработка (W1.3):** подключение Kenney-паков — `this.load.atlasXML(...)` в preload,
  генераторы удалить, ключи текстур сохранить.

### `ResourceNode` (entities/resource-node.ts) — ресурсная нода
| Метод | Делает | События |
|---|---|---|
| `getLabel()` / `IsAvailable()` / `getInteractCenter()` | контракт `I_Interactable` | — |
| `interact()` | если дроп влезает целиком (`canFit`) — добавить в рюкзак и истощить (alpha 0.25); иначе `inventory:full` | `loot:collected`, `inventory:full` |
| `tick(dtHours)` | отсчёт `respawnHours`, затем оживание (alpha 1) | — |

- Имена состояний — `nodeState` (НЕ `state`: у Phaser-спрайта это занято, strict TS не даст).

### `WorldScene` — оркестратор мира
| Член | Делает |
|---|---|
| `create()` | земля, стены-рамка, игрок, камера, системы, ноды из `NODE_LAYOUT`, Interact, обработчики `ui:use-item` и `player:died`, dev-хук `__eotd` |
| `update()` | порядок тиков: время → условия → статы → ноды → промпт → игрок; dt клампится до 50 мс |
| `useItem(itemId)` | consumable из рюкзака → статы (`S_ItemUse`); валидация в мире |
| `createWalls()` | статические прямоугольники по периметру (до Tiled-коллизий) |

- Отписки (`ui:use-item`, `player:died`, `interact.destroy()`) — на `SHUTDOWN` сцены.
- **Доработка:** карта из Tiled (W2) заменит tileSprite+стены+NODE_LAYOUT: слои
  ground/decor/collision + объектный слой нод (см. скил web-graphics).

---

## 6. UI и мост

### `Hud` (ui/hud/hud.ts)
| Метод | Делает | Данные из события |
|---|---|---|
| `setClock(day, hour, minute)` | строка «День N · ЧЧ:ММ» | `time:minute` |
| `setStats(stats)` | ширины полосок (значения 0..1) | `stats:changed` |
| `setConditions(active)` | бейджи состояний | `conditions:changed` |
| `setPrompt(label \| null)` | промпт «[E] …» по центру-низу | `interact:prompt` |
| `showStatus(text, durationMs?)` | одноразовое сообщение (смерть и т.п.) | точечные вызовы моста |

### `InventoryPanel` (ui/inventory/inventory-panel.ts)
| Метод | Делает |
|---|---|
| `toggle()` | открыть/закрыть (Tab ловится в мосту) |
| `render(slots)` | сетка слотов; тултип через `title`; клик по consumable → команда |

### `Toasts` (ui/toasts/toasts.ts)
| Метод | Делает |
|---|---|
| `show(text)` | тост справа-снизу, максимум 4, авто-скрытие 2.5 с |

- **Как добавить элемент HUD/панель:** разметка в конструкторе → метод-сеттер → подписка в
  bridge. Никаких таймеров опроса: только события.
- Drag-n-drop слотов отложен (W2+, BACKLOG): без сортировки/экипировки он ничего не даёт.
- **Доработка (W2):** терминал АРХИВА — отдельный модуль в `ui/archiv-terminal/`,
  стиль и глитчи — скил web-dom-ui.

### `bridge/world-to-dom.ts` — `mountWorldToDomBridge()`
Единственное место подписок DOM на шину + единственное место, где DOM-клавиши (Tab)
превращаются в команды `ui:*`. Вызывается один раз из main.ts.

---

## 7. Инструменты проверки (что запускать)

1. **Гейты:** `npm run typecheck` → `lint` → `test` → `build` (все зелёные = коммит).
2. **Смоук вживую** (после каждой механики, скил web-quality-check):
   ```powershell
   $job = Start-Job { Set-Location E:\projects\echoofthedepotweb; npm.cmd run dev -- --port 5173 }
   playwright-cli.cmd open http://localhost:5173
   playwright-cli.cmd eval "() => window.__eotd.stats.snapshot"   # читать состояние
   playwright-cli.cmd console error                               # должно быть пусто
   playwright-cli.cmd close; Stop-Job $job; Remove-Job $job
   ```
3. **Dev-хук** `window.__eotd` (только DEV-сборка): `player` (спрайт: `.setPosition`),
   `stats` (StatsComponent: `.add()`, `.snapshot`, `.IsDeadState`), `inventory`
   (InventoryComponent: `.slotsView`, `.count()`), `E_StatType`.
   Прод-сборка хук не содержит.

## 8. Чек-лист доработки (перед «готово»)

- [ ] Гейты зелёные; новая логика покрыта тестами.
- [ ] JSDoc на новых/изменённых функциях (правило 8).
- [ ] Публичный API отражён здесь (этот файл в том же коммите).
- [ ] Смоук в playwright-cli пройден, консоль чистая.
- [ ] Правила 1–7 AGENTS.md не нарушены (худой Player, события, данные в JSON).
