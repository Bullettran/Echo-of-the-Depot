# Промпты для генерации — EchoOfTheDepot

> Живой файл-справочник всех промптов (иконки, текстуры, концепты, меши).
> Стиль проекта: серо-синий обесцвеченный, один тускло-оранжевый акцент, металл, заклёпки, «мир замолчал».

## База стиля (общий хвост для иконок)

```
, flat game UI icon, post-apocalyptic industrial style, desaturated grey-blue palette, single muted orange accent, weathered metal texture, thin riveted frame, centered, dark charcoal background, clean silhouette, vector style --style raw --no text letters watermark --ar 1:1
```

## Приёмы Midjourney

- **Единый стиль набора:** сгенерь одну идеальную иконку → её URL в `--sref` всем остальным → `--sw 200` если стиль «не пробивается».
- **Повторяемость без sref:** одинаковый стиль-блок + `--seed 1234`.
- Прозрачного фона MJ не даёт → remove.bg / вырезание.
- MJ любит рисовать жару/температуру каплями — в `--no` добавлять `water drop liquid rain`.
- Формат предметных иконок `--ar 1:1`, баров `--ar 4:1` или `3:1`, концептов `3:4`.

---

## UI-иконки статов (сгенерированы 21.10)

| Стат | Суть (подставить перед базой стиля) |
|---|---|
| Здоровье | `first aid cross made of riveted metal plates` |
| Выносливость | `lightning bolt inside industrial battery gauge` |
| Голод | `empty dented tin can with bent fork` |
| Жажда | `army canteen with single water drop` |
| Холод | `snowflake frozen on cracked metal, ice crystals` |
| Жара | `scorching sun over rising wavy heat haze lines, cracked dried ground below` (варианты: `industrial mercury thermometer with flame glow at top`, `three rising wavy heat shimmer lines over cracked earth`, `burning gas burner flame with heat waves`; `--no water drop liquid rain`) |

## Текстуры progress bar (сгенерированы 21.10)

**Рамка:**
```
empty horizontal progress bar frame for a survival video game, weathered riveted dark metal frame, scratched desaturated grey-blue military paint, dark empty inner channel, subtle thin top highlight, gritty post-apocalyptic industrial style, clean sharp edges, flat design, isolated on dark charcoal background --style raw --no text letters numbers watermark glass reflection --ar 4:1
```

**Заполнения (цветные, ×4):**
```
horizontal seamless tileable progress bar fill texture, [ЦВЕТ], gritty scratched surface, subtle horizontal streaks, fine noise, post-apocalyptic industrial, even lighting, flat, full frame edge to edge --style raw --no frame border bar text watermark vignette --ar 1:1
```
- HP: `dried-blood muted red with rust streaks`
- Стамина: `muted amber yellow with faint energy lines`
- Голод: `desaturated brown-orange with cracked dry mud cracks`
- Жажда: `desaturated cyan-blue with soft water ripple`

---

## Детали станции и материалы (22.10)

Общий шаблон: `[СУТЬ]` + база стиля иконок (см. выше).

| Предмет | Суть |
|---|---|
| Detail_Reactor (Реакторная ячейка) | `cylindrical reactor fuel cell with glowing faint orange core window, heavy metal casing with bolts and warning stripe` |
| Detail_Gate (Механизм ворот) | `compact hydraulic gate mechanism with gear train and pressure valve, greasy steel housing` |
| Detail_Tower (Радио-блок) | `military radio transceiver box with short antenna and vacuum tubes, dented green-grey metal case` |
| Проводка (кабели) | `coil of thick insulated copper cables tied with worn strap, frayed ends` |
| Металлолом | `bundle of bent rebar and rusty steel plates tied with wire` |
| Медная катушка | `wound copper wire coil on wooden spool, oxidized green tint on edges` |
| Топливо (канистра) | `dented military fuel canister with spout and cap chain, faded stencil markings` |
| Предохранители | `set of three vintage ceramic fuses with metal caps, one cracked` |
| Шестерня | `large weathered steel gear with chipped teeth and oil stains` |
| Изолента | `roll of black friction tape with peeling edge and cloth texture` |

**Совет:** генерировать с одним `--sref` от первой удачной детали — набор предметов будет в одной фактуре.

---

## Концепты (АРХИВ и экран)

**Устройство целиком:**
```
portable emergency advisor device, rugged riveted metal box with carrying handle, small round CRT screen showing a minimal fragmented human female face made of glowing phosphor lines and dots, green-cyan phosphor glow, scanlines, glitch fragments, weathered grey-blue desaturated paint, muted orange accent stripe, railway equipment aesthetic, post-apocalyptic, dark charcoal background, product shot, cinematic lighting --style raw --ar 3:4
```

**Лицо на экране (крупно):**
```
close-up of an old CRT screen displaying a minimal wireframe human female face, made of thin glowing cyan phosphor lines and scanlines, face partially fragmented and glitched, missing fragments, one eye fully formed and human-like, phosphor glow bleeding into dark glass, screen curvature, dust and scratches, melancholic mood, post-apocalyptic --style raw --ar 1:1 --no realistic skin photo human
```

**Разбитые фрагменты (под анимацию сборки):**
```
rugged portable device with a small round CRT screen, the screen shows a human female face broken into separated floating fragments, wireframe phosphor lines and dots, fragments scattered with visible gaps between them, some fragments displaced and rotated, one eye and part of jaw intact, cyan-green phosphor glow, scanlines, glitch noise between fragments, weathered grey-blue metal body, muted orange accent, dark background, cinematic product shot --style raw --ar 3:4
```

Заготовка под нарезку (фрагменты на тёмном фоне):
```
minimal wireframe female face split into 8-12 clearly separated fragments, thin glowing cyan phosphor lines, even dark charcoal background, each fragment isolated with wide gaps, no screen no device, flat front view, centered, symmetrical layout, asset sheet style --style raw --ar 1:1 --no realistic skin photo text
```

Голографический вариант (сравнение):
```
small transparent holographic female face floating above a rugged metal device, volumetric amber light, face made of flickering fragments and data noise, half the face missing, dark workshop background, post-apocalyptic, cinematic --style raw --ar 3:4
```

---

## Референсы окружения (Soul: City-стиль)

**Станция-депо:**
```
abandoned railway depot in a dead post-apocalyptic city, rusted corrugated metal shacks, wooden barricades, scaffolding, old freight train cars, overcast rainy sky, thick fog, wet concrete, no electricity, single dim lantern, muted desaturated blue-grey palette, cinematic wide shot, volumetric light, photorealistic --ar 16:9 --style raw
```

**Рельсы через пустошь:**
```
endless abandoned railway stretching into wasteland, dead leafless trees, muddy swamp ground, fog, ruined city silhouette on horizon, overcast, post-apocalyptic, desaturated cold colors, cinematic atmosphere, photorealistic --ar 16:9 --style raw
```

**Улица мёртвого города:**
```
dead cyberpunk favela slum without power, broken corrugated metal houses, dark unlit neon signs, wooden barricades and debris, rain, puddles reflecting grey sky, scaffolding, no people, heavy fog, muted blue-grey tones, cinematic, photorealistic --ar 16:9 --style raw
```

---

## Предметные иконки: еда / вода / медицина / броня / валюта / материалы

Суть-строки — приклеивать к базе стиля иконок (см. верх файла). Генерировать с одним `--sref` от эталонной детали.

### Еда
| Предмет | Суть |
|---|---|
| Консервы | `sealed round tin can with pull tab, dented lid, faded unreadable label` |
| Тушёнка открытая | `opened tin can with fork stuck in meat chunks, single steam swirl` |
| Суп | `dented metal bowl of thin soup with spoon, two potato slices floating` |
| Сухпаёк | `stack of dark hardtack crackers tied with twine` |
| Грибы жареные | `small handful of fried mushrooms on folded cloth` |
| Блюдо (готовка T2) | `metal plate with sliced roasted meat and few greens` |

### Вода
| Предмет | Суть |
|---|---|
| Вода чистая | `glass jar of clear water sealed with cloth and twine` |
| Вода грязная | `glass jar of murky brown water with floating debris` |
| Чай | `chipped enamel mug of dark tea, single steam swirl` |
| Кофе | `dented metal mug of black coffee with steam` |
| Сок (ягодный) | `small corked bottle of dark amber berry juice` |

### Лекарства
| Предмет | Суть |
|---|---|
| Шприц | `vintage glass syringe with metal needle in felt-lined case` |
| Таблетки | `brown pill bottle with cork stopper, few pills spilled beside` |
| Колба | `lab flask filled with murky green liquid, corked, bubbles inside` |
| Адреналин | `single glass ampoule with orange liquid and needle cap` |

### Улучшения брони
| Предмет | Суть |
|---|---|
| Ткань (T1) | `folded bolt of thick canvas fabric rolled and tied with strap` |
| Стальные пластины (T2) | `stack of three steel armor plates with rivet holes along edges` |
| Кожа выделанная | `rolled tanned leather hide with leather straps` |
| Крепёж | `small cloth pouch of rivets and bolts, few spilled` |
| Ткань «Гелиоса» (T3) | `rare layered hexagon-weave fabric pad with faint orange shimmer` |

### Валюта
| Предмет | Суть |
|---|---|
| Токены | `stack of worn square metal tokens with punched hole in center` |

### Рецепты (находки-чертежи, LORE разд. 6)
| Предмет | Суть |
|---|---|
| Рецепт (свёрнутый чертёж) | `rolled blueprint tied with worn string, yellowed paper edges, faded technical drawing visible at the rolled end, slight creases and grease stains` |
| Чертёж развёрнутый (UI изучения на верстаке, Ф5) | `unrolled aged blueprint sheet with corners pinned by metal washers, faded technical drawing of a machine part with dimension lines, yellowed paper, worn edges, single muted orange highlight on one dimension line` |

### Материалы
| Предмет | Суть |
|---|---|
| Слиток стали | `rough steel ingot bar with uneven casting surface` |
| Металлический порошок | `cloth pouch of dark grey metal powder, small pile spilled` |
| Медный слиток | `copper ingot bar with green oxidation spots` |
| Уголь | `few chunks of shiny black coal on folded cloth` |
| Крепёж (болты/гайки) | `handful of bolts and nuts tied in cloth bundle` |
| Смола | `lump of dark glossy resin with dripping shape` |

---

## Меши — референсы для моделинга (Blender)

**Важно:** MJ не даёт точных чертежей — референс даёт формы/фактуру/настроение, размеры и точную геометрию решаешь в Blender. Генерь 2-4 варианта и комбинируй лучшее.

**Базовый шаблон (одиночный проп):**
```
[ОБЪЕКТ], [МАТЕРИАЛ + СОСТОЯНИЕ], game asset concept for 3D modeling, single object fully visible, orthographic front view, neutral studio lighting, isolated on plain dark charcoal background, weathered desaturated grey-blue metal with single muted orange accent, rivets and welded seams, scratches and grime, post-apocalyptic industrial design, clean readable silhouette --style raw --no text watermark hands people --ar 1:1
```

**Три вида сразу (front / side / top):**
```
[ОБЪЕКТ], three orthographic views arranged in a row: front view, side view, top view, game asset reference sheet for 3D modeling, even flat lighting, no perspective distortion, plain dark charcoal background, weathered grey-blue post-apocalyptic industrial style with muted orange accent --style raw --no text watermark --ar 16:9
```

**Изометрия (понять компоновку):**
```
[ОБЪЕКТ], isometric view, game diorama asset, [МАТЕРИАЛ + СОСТОЯНИЕ], soft ambient occlusion, plain dark charcoal background, post-apocalyptic industrial, desaturated grey-blue with muted orange accent --style raw --no text watermark --ar 1:1
```

**Модульный кит-элемент:**
```
modular [КИТ-ЭЛЕМЕНТ] piece, kitbash part, flat clean surfaces with visible panel lines and bolt holes, designed for tileable/modular assembly, game asset concept, orthographic, plain dark charcoal background, weathered grey-blue metal, muted orange accent stripe, post-apocalyptic industrial --style raw --no text watermark --ar 1:1
```

**Переменные:**
- `[ОБЪЕКТ]` — «reactor generator unit», «train depot gate», «workbench with vise», «water tower»…
- `[МАТЕРИАЛ + СОСТОЯНИЕ]` — «rusted corrugated steel, paint peeling», «oiled heavy machinery steel», «rotted wood and iron brackets», «copper pipes with green oxidation»…

**Примеры под Ф2 (станция):**

| Меш | [ОБЪЕКТ] |
|---|---|
| Узел реакторной | `railway depot reactor generator unit, cylindrical core with bolted hatches, external pipes and gauges, heavy industrial base` |
| Ворота депо | `heavy sliding depot gate with counterweight mechanism and riveted steel panels` |
| Сигнальная вышка | `railway signal tower with ladder, signal lights and antenna array, lattice steel structure` |
| Верстак | `worn carpenter workbench with metal vise, drawers and tool pegboard` |
| Горн | `old forge furnace with chimney pipe, brick and riveted steel, ash tray` |
| Водокачка | `small railway water tower with pipe valve and ladder, wooden staves and iron hoops` |

Стратегия: ортографический лист → Blender блокат → изометрия для проверки пропорций → детали по одиночным пропам.

### Полные промпты сета станции (23.10)

**Узел реакторной:**
```
heavy cylindrical railway depot reactor generator unit, tall vertical cylinder core with bolted maintenance hatches, external pipes and valves, analog pressure gauges, small oval window with faint orange glow inside, thick industrial base plate, weathered desaturated grey-blue steel with rivets and welded seams, single muted orange warning stripe, scratches and rust streaks, grime, game asset concept for 3D modeling, single object fully visible, three-quarter view, neutral studio lighting, isolated on plain dark charcoal background, post-apocalyptic industrial design, clean readable silhouette --style raw --no text watermark hands people --ar 3:4
```

**Ворота депо:**
```
heavy sliding railway depot gate, single large steel panel with deep horizontal ribs and rows of rivets, industrial rollers on top rail, counterweight chain mechanism on the side, weathered desaturated grey-blue paint with chipped edges, single muted orange hazard stripe along the bottom, rust streaks and oil stains, game asset concept for 3D modeling, single object fully visible, front view, neutral studio lighting, isolated on plain dark charcoal background, post-apocalyptic industrial design, clean readable silhouette --style raw --no text watermark hands people --ar 3:4
```

**Сигнальная вышка:**
```
railway signal tower, tall lattice steel mast with diagonal cross-bracing, attached ladder with safety cage, signal lamp housings and small antenna array on top, junction boxes and cable conduits along the frame, weathered desaturated grey-blue steel with rivets, one signal lamp glowing faint muted orange, rust and grime, game asset concept for 3D modeling, single object fully visible, three-quarter view, neutral studio lighting, isolated on plain dark charcoal background, post-apocalyptic industrial design, clean readable silhouette --style raw --no text watermark hands people --ar 3:4
```

**Диспетчерская консоль (лампы зажигаются в финале Ф2):**
```
old railway dispatcher control console, slanted steel desk with rows of analog switches, dials and indicator lamps all dark, one large lever in the center, riveted panel sections, worn keys, weathered desaturated grey-blue paint, scratches and grime, muted orange emergency lamp housing, game asset concept for 3D modeling, single object fully visible, three-quarter view, neutral studio lighting, isolated on plain dark charcoal background, post-apocalyptic industrial --style raw --no text watermark people --ar 3:4
```

**Остановившиеся часы (лор: мир замолчал):**
```
old railway station wall clock in round metal housing, cracked glass, both hands frozen at the same minute, faded dial with worn numerals, rust ring around the rim, weathered desaturated grey-blue metal frame, dust, game asset concept for 3D modeling, single object fully visible, front view flat, neutral studio lighting, isolated on plain dark charcoal background, post-apocalyptic industrial --style raw --no text watermark people --ar 3:4
```

**Табличка станции (текст накладываем в UE):**
```
old cast metal railway station name plaque, rectangular plate with raised empty border frame for name text, four bolt heads on corners, heavy patina and rust streaks, weathered desaturated grey-blue paint chipped to dark metal, game asset concept for 3D modeling, single object fully visible, front view flat, neutral studio lighting, isolated on plain dark charcoal background, post-apocalyptic industrial --style raw --no text letters words --ar 3:4
```

**Грузовой вагон («Последний Редут», стоит у станции):**
```
old heavy freight train boxcar converted to living quarters, riveted steel body with welded patch plates, small barred window with shutters, side sliding door half open showing dark interior with bunk, stove pipe through the roof, ladder on the end, weathered desaturated grey-blue paint with large chipped areas, rust streaks, muted orange stripe along the frame, game asset concept for 3D modeling, single object fully visible, side three-quarter view, neutral studio lighting, isolated on plain dark charcoal background, post-apocalyptic industrial --style raw --no text watermark people --ar 16:9
```

**Семафор:**
```
old railway semaphore signal on lattice mast, mechanical arm signal with red lamp housing, ladder rungs on the mast, counterweight, cable pulleys, weathered desaturated grey-blue steel, rust, one faded muted orange lamp lens, game asset concept for 3D modeling, single object fully visible, three-quarter view, neutral studio lighting, isolated on plain dark charcoal background, post-apocalyptic industrial --style raw --no text watermark people --ar 3:4
```

**Костёр с котелком (заглушка готовки Ф1.3):**
```
small campfire pit with ring of grey stones, charred firewood with faint muted orange embers, blackened kettle on a metal tripod, few tin cans nearby, burnt ground spots, game asset concept for 3D modeling, single object fully visible, three-quarter view, neutral studio lighting, isolated on plain dark charcoal background, post-apocalyptic --style raw --no text watermark people fire flames --ar 3:4
```

**Ставни ворот (полуоткрытые, запасной проём):**
```
heavy steel gate shutter panels, two ambarny shutters with horizontal ribs and rows of rivets, slightly ajar with a dark gap between them, mounted on thick steel frame hinges, locking bar with handle, weathered desaturated grey-blue paint with chipped edges, muted orange painted lock handle, rust streaks and oil grime, game asset concept for 3D modeling, single object fully visible, front view flat, neutral studio lighting, isolated on plain dark charcoal background, post-apocalyptic industrial design, clean readable silhouette --style raw --no text watermark people --ar 3:4
```

**Стены/потолок:**

| Секция | Суть (перед общим хвостом меша) |
|---|---|
| Ровная стена | `plain modular depot wall panel section, flat vertical corrugated steel sheet, riveted steel frame border, perfectly straight, tileable` |
| Потолок ровный | `modular depot ceiling panel, perfectly flat riveted steel plate, straight square edges, uniform surface, tileable` + `--no hanging elements wires beams` |
| Стена с пробоиной | `damaged corrugated steel depot wall section, torn hole with bent metal edges, hanging torn cables, riveted frame` |
| Угловая с трубами | `depot wall corner section, vertical corrugated panels meeting at angle, thick pipes with valves up the corner, junction box` |
| С окном-решёткой | `depot wall section with small barred window, heavy half-open steel shutter, broken glass shards on sill` |

⚠️ Ровные модули Tripo делает криво — план Б: регулярные стены из Soul: City, Tripo — только уникальные секции.

**Забор (два состояния):**
- Рваный: `ruined chain-link fence section, two steel posts leaning at different angles, mesh sagging with large torn hole, edges curled and twisted outward, broken wire strands hanging, top rail detached on one side, rust at the base, bent bottom edge` (каждое повреждение — отдельной фразой с глаголом: leaning/sagging/torn/curled/detached)
- Целый: `chain-link fence section with steel posts still straight and solid, mesh intact but slightly sagging between posts, rusted base plate and bolts`

### Кухня / медпункт / спальня / склад (полные, Ф5)

| Объект | Суть |
|---|---|
| Печь-буржуйка | `old cast iron potbelly stove with single round cooking burner, firewood door with latch, short chimney pipe, soot stains, muted orange flame through grate` |
| Разделочный стол | `worn kitchen prep table, scarred wooden countertop with cutting marks, chopping board with knife, damp cloth over edge, steel frame, pots underneath` |
| Бочка воды | `old wooden water barrel with iron hoops, small brass tap, metal ladle on side hook, moisture stains` |
| Шкаф-аптека | `old military medical cabinet with two glass doors, grid of compartments with bottles, faded red cross stencil, steel frame, muted orange interior lamp` |
| Кушетка | `old field medical cot with metal frame and worn canvas mattress, folded grey blanket, pillow, steel legs with casters` |
| Стол с инструментами | `old field medical table, steel top, instrument tray with forceps and scalpel, brass mechanical scales, glass flask, bandages, drawer unit` |
| Койка-нары | `simple two-tier metal bunk bed, welded frame with rivets, thin worn mattresses with rolled blankets, dented tin box nightstand` |
| Стеллаж | `tall industrial steel shelving rack, four riveted tiers, scattered small crates and tin cans, rust on edges` |
| Верстак | `worn industrial workbench, thick wooden top with oil stains, steel cross-braced legs, mounted metal vise, drawer shelf, small pegboard` |
| Лампочка на проводе | `simple hanging light bulb in ceramic socket on cloth-covered wire, faint warm muted orange glow` |

### Декор-базис и интерьер (суть)

| Объект | Суть |
|---|---|
| Бочка стальная | `old steel barrel with two ridged bands, lid slightly ajar, faded stencil, chipped paint showing rust` |
| Стремянка | `old wooden step ladder, one rail cracked and reinforced with metal plate, paint chipped` |
| Стопка колёс | `stack of three old train wagon wheels on wooden sleepers, rust and grease, bolted hubs` |
| Огнетушитель | `vintage red fire extinguisher with hose and handle, faded paint, dents` |
| Лопата и лом на стене | `wall-mounted shovel and crowbar on steel brackets with hooks` |
| Дисковый телефон | `old rotary dial telephone in bakelite case, cracked cord` |
| Карта жд-узла | `wall map board with faded railway network chart, wooden frame, cracked glass` |
| Стол диспетчера | `dispatcher desk with drawers, desk lamp with green shade, scattered papers` |
| Спецовка и каска | `wall hook with worn railway worker jacket and dented hard hat` |
| Канистра+маслёнка | `dented oil canister and small oiler with long spout` |
| Столб ЛЭП | `old concrete power line pole with cross-arm and cracked ceramic insulators, sagging wire stubs` |
| Шпалы-стек | `stack of old wooden railway sleepers, creosote darkened, crooked stack` |

**НЕ генерить:** мутанты (Ф3, свой визуал шлейфа), оружие-меши (иконок хватит), рельсы (Spline в UE), вторая станция/топи (Ф6).

### Локация «Станция» — референсы по фактическим мешам (23.10)

Шесть кадров, сгенерить #1 первым → его `--sref` остальным (единый свет). #4/#5 = пара «до/после» для финала Ф2 (холодное↔тёплое — визуальный язык оживления станции).

1. **Общий план (establishing):** `wide establishing shot of an abandoned railway depot station in a post-apocalyptic wasteland, long single-story building with riveted corrugated steel walls in desaturated grey-blue, rust streaks, lattice signal tower with dark lamps, old freight boxcar at the platform with muted orange stripe, semaphore with lowered arm, broken chain-link fence, muddy puddles, dead trees, thick fog, overcast, no electricity, cold palette with faint muted orange accents, cinematic, volumetric light --ar 21:9 --style raw --no people text neon`
2. **Площадка у ворот:** `medium shot of heavy sliding depot gate in corrugated steel wall, horizontal ribs and rivets, closed, muted orange hazard stripe, counterweight chain, damaged chain-link beside, debris and barrels, wet cracked asphalt, grey overcast morning --ar 16:9`
3. **Интерьер цеха:** `depot workshop interior, riveted corrugated walls grey-blue, workbench with vise, potbelly stove with chimney, steel shelving, frozen station clock with cracked glass, unlit hanging bulb, dust beams from barred window, oil stains --ar 16:9`
4. **Реакторный зал:** `reactor hall in old depot, tall cylindrical generator with bolted hatches and pipes, dark gauges, dead control console foreground, riveted floor plates, dim cold light from high windows --ar 16:9`
5. **Финал — ожила:** `same depot at night restored, warm bulbs and lanterns, reactor window glowing orange, console lamps lit, kettle steaming on stove, lit boxcar windows outside, moths around bulb, cold blue night vs warm interior contrast, hopeful mood --ar 21:9`
6. **Мудборд-детали:** `mood board: frozen clock close-up, steaming kettle on stove, stack of metal tokens on rusted table, shallow DOF, muted orange highlights on grey-blue --ar 16:9`

---

## Чек-лист перед генерацией

1. Взят базовый стиль-хвост? (иконки/текстуры/концепты — разные)
2. `--sref` от эталона набора установлен?
3. `--no` закрывает типовые артефакты (текст, вода, рамки)?
4. Для наборов — один `--seed` между итерациями.
