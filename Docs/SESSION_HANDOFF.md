# SESSION HANDOFF — контекст для новой сессии (24.10, конец сессии)

> Прочитай AGENTS.md (правила+ловушки MCP), GAME_PLAN.md (фазы), LORE.md (лор).
> Этот файл — снимок «где мы и что дальше». После разбора можно удалить.

## Роли и режим работы (изменено этой сессией!)

- **Агент НИЧЕГО не пишет/не создаёт сам, пока пользователь прямо не попросил** («сделай/собери/почини»). Режим по умолчанию: рецепт/объяснение/проверка по пинам. См. скилл component-check.
- Пользователь пишет сам (учится), агент — критик+тестировщик, даёт оценки 0-10 с расшифровкой.
- Проверки по пинам, НЕ по readback DSL (он врёт: else-формы, категории, overlap-галлюцинации — все кейсы в AGENTS.md).

## Статус фаз

- **Ф1 ВЫЖАНИЕ — ГОТОВО ЦЕЛИКОМ** (TimeCycle, нужды-в-статах, еда/вода с анимациями, АРХИВ v1 с озвучкой, смерть+респаун).
- **Ф2 СТАНЦИЯ — механика готова**: BP_StationModule (крафт через WBP_CraftStation, аура-conditions, сфера), BP_Station-агрегатор (проценты→финал: свет/гудок/титр «Депо 12-й километр»). **Перенесено к работе над локацией:** расстановка ресурсов вокруг станции, АРХИВ↔Coherence, PIE «друг» (решение автора 24.10).
- **ТЕКУЩАЯ РАБОТА: Оружие/пистолет** (вытащено из Ф3 по запросу автора). Статус ниже.

## Пистолет: что уже есть

| Ассет | Состояние |
|---|---|
| `DT_Weapons` + `S_WeaponInfo` | damage/FireType(Hitscan\|Ammo)/magazineSize/ammoItem(handle)/weaponMesh/sounds(Map по E_WeaponSounds)/weaponType(E_WeaponType). Монтажи СПЕЦИАЛЬНО вынесены (решение: анимации = свойство владельца, не предмета) |
| `S_ItemInfo` | + поле-**handle** на DT_Weapons (мостик «Б»). Связь: handle → GetDataTableRow, НЕ по имени строки |
| `DT_Items` | строки `Pistol`, `PistolBullet`; itemType имеет значения Pistol/Ammo |
| `BPI_Combat` | += `TakeDamage(Damage, DamageInstigator)` ✅ |
| Инпуты | `IA_Attack`, `IA_Aim`, `IA_Reload` ассеты есть; в BP_Player события IA_Attack/IA_Aim добавлены, IA_Reload — ещё нет; проверить добавление в IMC_Default |
| `BPC_Combat` | скелет + EquipWeapon (мостик→WeaponInfo→CurrentAmmo=magazine→broadcast) + **Shoot() почти готов** (см. баги) + EndFireCooldown-таймер. Диспетчеры: OnAmmoChanged, OnWeaponEquiping, OnWeaponEmpty, OnPlayFireMontage, OnAim |
| Анимации | весь Pistol-комплект шаблонный в `/Game/Characters/Mannequins/Anims/Pistol/` (Fire_Montage готов, DryFire, Reload, Equip, ADS, локомоции). Монтажи играются BP_Player через OnPlayFireMontage (осознанный выбор автора — консистентно с едой; критик настаивал на BPC — автор выбрал своё, ок) |
| Аура станции | EventInRangeStation/OutOfRangeStation(Condition) живут на BP_Player, StationModule их зовёт. Conditions включает HealthRegenFromStation |

## ТРИ БАГА/ХВОСТА Shoot() (проверено по пинам 24.10)

1. **Логика условий сломана (Де Морган):** сейчас `(and IsAiming (or (not IsReloading) (not IsOnCooldown)))` — OR пропускает выстрел при перезарядке (если не на кулдауне) и наоборот. Правильно: `(and IsAiming (not IsReloading) (not IsOnCooldown) IsWeaponEquiped)`.
2. **Урон не применяется:** LineTrace → `_outhit` и всё. Нет: Branch(BlockingHit) → Hit.Actor → DoesImplementInterface(BPI_Combat) → TakeDamage(WeaponInfo.damage, GetOwner). Это главный недостающий кусок.
3. **EquipWeapon без RowNotFound-ветки:** GetDataTableRowDT_Weapons даёт exec RowNotFound — повесить Return.

## Дальше по шагам (оружие)

1. Фикс трёх пунктов выше
2. IA_Reload событие в BP_Player + проверка IMC_Default
3. `Reload()`: IsReloading → Reload-монтаж (через диспатчер к плееру, как Fire) → по завершении: FindItemCount(PistolBullet) → CurrentAmmo=min(magazine, есть) → RemoveItem → Broadcast
4. `SetAiming(bool)`: флаг + FOV камеры 90↔55 (сначала SetFieldOfView напрямую, лерп потом)
5. Урон-полигон: BP_Resource реализует BPI_Combat.TakeDamage (минус HP — у ресурсов HP уже есть) + расставить мишени
6. UI: WBP_Crosshair + счётчик патронов (bind OnAmmoChanged, паттерн баров)
7. PIE: экип→ADS→8 выстрелов→DryFire-клик→R→снова стрельба; мишень ломается
8. Гильза-выброс (Niagara/спавн) — v1.5 сочность, промпт гильзы в Docs/promts.md

## Инструменты новой сессии (ЭКОНОМИЯ ТОКЕНОВ)

- **`Tools/mcp.ps1`** — универсальный MCP-раннер. Использование одной строкой:
  `iex (Get-Content -Raw E:\projects\EchoOfTheDepot\Tools\mcp.ps1); Mcp-BP 'list_variables' '{"blueprint":{"refPath":"/Game/..."}}'`
  Хелперы: `Mcp-BP` (BlueprintTools), `Mcp-DT` (DataTableTools), `Mcp-AT` (AssetTools). Параметр `-Filter 'regex'` режет вывод. Авто-реконнект сессии встроен. Пустой вывод compile = успех (returnValue null).
- НЕ пиши большие PS-скрипты для MCP-вызовов — одна строка через раннер.
- Порт 8000, редактор должен быть запущен. Скилл mcp-recovery — если молчит.
- Blender: `E:\Blender\blender.exe`, headless-пайплайн (bpy-скрипт → FBX → Content/_Import). Tripo-меши уже импортированы в /Game/Meshes/** (Nanite вкл, 19 мешей; хвосты: tripo_convert_* в Panels переименовать, опечатки SM_PillStandart/SM_Bake, коллизии на крупные).

## Скиллы (5 новых от 24.10, подхватятся в новой сессии)

`.opencode/skill/`: unreal-mcp, create-toolset, unreal-skill (Epic), unreal-engine-mcp-codex (references+headless), ue5-level-design-cn (левел-дизайн, CN — перевести при первом использовании). Плагины UEBridge/ViewportPerception в Plugins/ НЕ включены (включать при закрытом редакторе, потом).

## Прочие решения сессии (кратко, детали в GAME_PLAN/LORE/BACKLOG)

- Нужды = статы (SurvivalNeeds-компонент убран); смерть без потери лута (дебафф-идея в BACKLOG); допуски ЖД вместо XP (LORE разд.6); верстак «создай→улучшай», рецепты-находки; станции: горн/медпункт/водокачка/радиорубка; арбалет вместо лука; оружие = ItemInfo+handle→DT_Weapons; звуки оружия в Map спеки (Find по E_WeaponSounds).
- Промпты ВСЕ в `Docs/promts.md` (иконки/текстуры/меши/локации/рецепты/патроны).
- Открытые вопросы: WBP_Crafting←BP_Player фантомная ссылка так и не нашлась (юзер искал монтаж — версия: цепочка через WeaponSpec-монтажи; актуальность упала после выноса монтажей).
