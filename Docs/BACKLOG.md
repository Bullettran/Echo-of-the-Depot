# BACKLOG — техдолг и задачи

> Ведёт агент. Пользователь сюда время не тратит — агент сам вносит и актуализирует.
> Формат: `[приоритет] задача — контекст`. Приоритеты: 🔴 сейчас/блокер, 🟡 скоро, 🟢 когда-нибудь.

---

## 🔴 Сейчас (блокеры Ф1)

> Поворот 20.10: Фазы 1 и 2 поменяны местами — сначала выживание/АРХИВ на примитивах, станция в Ф2 (см. GAME_PLAN). Поезд по карте не ездит, переезд = ролик (LORE разд. 2).

- [x] **[Ф1.1]** `BPC_TimeCycle` — готово (день 10 мин, счётчик дней, часы в HUD, бинды). Хвосты: E_DayPeriod + OnPeriodChanged (enum-параметр диспатчера — руками в редакторе; нужен Ф3 для ночи), расписание событий DT_TimeEvents (Ф3-4).
- [x] **[Ф1.2]** Нужды в `BPC_Stats` — готово (дельта-тик голода/жажды от OnTimeChanged, урон при нуле, порог 20 для варнов АРХИВА).
- [x] **[Ф1.3]** Еда/вода — готово (UseItem → OnItemUsing → монтаж → OnCompleted/OnInterrupted → эффекты; CurrentAction enum; эффекты data-driven через S_StatType{CurrentStat,MaxStat}).
- [x] **[Ф1.4]** АРХИВ v1 — готово (`BPC_Archive`: DT_ArchiveLines c voice-MetaSound на строку, очередь+кулдаун+приоритеты, глитчи при Coherence 0, рост связности со 2-го дня, WBP_Archive самодостаточный с автоочисткой).
- [x] **[Ф1.5]** Смерть — механика готова (BPI_Combat.Death → BPC_Respawn: input-лок, телепорт к PlayerStart, `RestartBeginStats(Half)` = статы 50%, Reset input). **Решение 21.10: потеря инвентаря отменена** (лут = мотивация). Осталось: PIE-тест всей цепочки, WBP_DeathScreen (фейд+текст АРХИВА, опционально).
- [ ] **[Идея, Ф2+]** Дебафф «Перезагрузка носителя» после смерти через BPC_Conditions (−25% скорость/стамина на 1-2 игр. часа) — гасит эксплойт «умереть = телепорт домой». Вариант: смерть роняет Coherence АРХИВА на сутки (лор: данные повреждены).
- [ ] **[Чистка после отмены лут-штрафа]** Удалить пустую `RemoveRandomItems` в BPC_Inventory + её вызов в HandleDeath + переменную `LosePercent`.
- [ ] **[Оружие WIP, 01.11 — порядок работ утвердил автор]** Сделано: AND-условия ✓, патронная модель «магазин+резерв» ✓ (экип: Current=Min(FindItemCount,magazineSize), выстрел: RemoveAmmo+Decrement), OnAmmoChanged(Current,Reserve,Magazine) ✓, OnWeaponEmpty(WeaponInfo) ✓ (под DryFire-монтаж в плеере), Aim(): + NOT IsReloading ✓, Knot-чистка ✓. **ПОРЯДОК ДАЛЬШЕ (решение автора 01.11):** (0) мелочи-хвосты — ЗАКРЫТЫ/СНЯТЫ (решения автора 02.11): RowNotFound→Return ×3 ✓; ReserveAmmo удалена ✓; BS-семпл Rifle→Pistol исправлен ✓; `CurrentAmmo > B` без литерала — осознанно (пустой int-пин = 0); Find.Key руками по действию (выстрел=Fire, пустой=Dry, Reload-граф=Reload) — осознанный дизайн, ключи проверены по пинам. **Shoot чист; урон — следующий большой кусок**; **(1) AO — движение во время прицеливания [ПОЧТИ ГОТОВО, 02.11]**: BS_PistolLocomotion (Direction −180..180 × Speed 0..600; Walk 9 семплов, Jog 9, Idle=ADS-заглушка) ✓; AnimBP Idle/WalkRun: BlendPosesByBool(IsAiming), BlendTime 0.1 ✓; EventGraph: IsAiming ← BPC_Combat.GetComponentByClass (без каста к BP_Player — правило 2) ✓, Pitch/Yaw считаются (заготовка под AimOffset) ✓; FOV: Timeline AimCameraTL + Lerp(90,55,AimAlpha) + FollowCamera, Play по Branch(CanAim), Reverse ← StopAiming ✓; юзер сам вычистил мгновенный FOV из BPC Aim/StopAiming и добавил Aim()→CanAim(bool) ✓. Хвосты AO: 1) настоящий AimOffset по Pitch (Layered blend per bone + BS поз) — пока только локомоция; 2) Idle-ADS одна на все направления (заглушка, осознанно). **(2) урон — ПАЙПЛАЙН ГОТОВ 03.11 (доработка автора)**: Shoot→ApplyDamage(HitResult, WeaponInfo, DamageCauser)→[WeaponInfo.Damage + TakeDamageFromAmmo(ammoItem из DT_Items) − DecreaseDamageFromArmor, Clamp min 1]→TakeDamage(×−1→ModifyCurrentStat(HP)→0→OnDeath→рагдолл + ReportDamageEvent). Урон полностью data-driven. Хвосты: 1) **StatsDamageValue (TakeDamageFromStats) не входит в сумму** — выход через Knot в никуда, один провод до «+»; 2) **мёртвый блок** if tag "Breakable"→ApplyPointDamage в ApplyDamage (BaseDamage=0 на момент вызова) — удалить; 3) PrintString в TakeDamage — убрать после PIE; 4) enum-строки "NewEnumerator1" у Modify/GetCurrentStat — хрупко; 5) тег "Enemy" вместо BPI_Combat — решение автора, помним. Затем: IA_Reload событие, Reload(), TakeDamage на BP_Resource (полигон), WBP_Crosshair+патроны. Проверить подписантов OnAmmoChanged/OnWeaponEmpty — сигнатуры менялись дважды за день
- [ ] **[Меши Tripo]** Переименовать `tripo_convert_*` (Panels) → SM_Panel + сателлиты; опечатки SM_PillStandart→Standard, SM_Bake→SM_Stove; коллизии (box/convex) на крупные меши (реактор/ворота/стены/вагон) — с Nanite простой коллизии нет, игрок проваливается.
- [ ] **[Анимации в плеере]** PlayNeededMontage (еда) + WeaponEquip-монтажи живут в BP_Player; триггер «2+ действия» сработал — кандидат на переезд в BPC при следующей чистке (решение автора: пока консистентно в плеере).
- [ ] **[Фантом WBP_Crafting]** BP_Player→WBP_Crafting референс живёт вне читаемых DSL-ом графов; после выноса монтажей из WeaponSpec — перепроверить get_referencers.
- [ ] **[PIE-тест]** клик «Создать» БЕЗ выбранного рецепта → ничего не должно происходить (пустой ActiveItemInfo → HaveEnoughMaterials=false).
- [ ] **git push** — репозиторий init+commit готовы (`b169422`, LFS настроен на 574 файла), пуш ждёт авторизации GitHub. ЛИБО переезд на GitLab (лимит LFS GitHub: 1 ГБ, Content уже 1,11 ГБ).

## 🟡 Скоро (по ходу Ф1–Ф2)

**Станция (Фаза 2):**
- [ ] **[Ф2.1]** `BP_Station` — актор станции-депо + 3 узла-заглушки на примитивах: реакторная, ворота депо, сигнальная вышка.
- [ ] **[Ф2.2]** `BPC_StationModules` — узлы 0→100%, починка деталями через BPI_Interact (+ UI прогресса узла).
- [ ] **[Ф2.3]** 5 рецептов деталей станции в DT_Items + верстак в мастерской (точка размещения крафта).
- [ ] **[Ф2.4]** Финал среза: все узлы 100% → оживление станции (свет/ворота/гудок) → фейд + титр «Глава 2».
- [ ] **[Ф2.5]** Расставить ресурсы 3 типов (металлолом, медь, топливо) вокруг станции + респаун (BPC_ActorSpawner).
- [ ] **[Ф2.6]** Связать «связность» АРХИВА (Ф1) с % восстановления станции.

- [ ] **[Аудит 20.10]** Дубль `CheckExistingRecipes` — идентичные функции в BPC_Craft и BPC_Inventory. Оставить одну (кандидат в BFL_GlobalFunctions) и звать из обоих.
- [ ] **[Аудит 20.10]** Нейминг переменных (пробелы/префиксы): `Respawn Duration` (BPC_ActorSpawner), `Attributes Points` (BPC_Stats), `In Row`/`In Column` (WBP_Inventory), `WBP_InventoryRef` (WBP_InventoryIcon — префикс ассета на переменной), опечатка `LocalQuiantityNeeded` (Quiantity).
- [ ] **[Аудит 20.10]** Ассеты: `BP_GeometryColletionActor` (опечатка Colletion), текстура `dizzahn_small_game_UI_card_...` → переименовать с T_ префиксом; `WBP_Notify` vs `WBP_NotifyBox` — оба используются (HUD создаёт WBP_Notify в бокс WBP_NotifyBox?), имена неразличимы → переименовать (напр. WBP_NotifyEntry).
- [ ] **[Аудит 20.10]** Мусор: пустой `EventTick` в BPC_Inventory (exec не подключён), пустой `SetupVariables` в BP_Player (+ BeginPlay его вызывает), пустое `SetCraftInfoTextSuccess` в WBP_Crafting, два пустых Construct в WBP_NotifyBox.
- [ ] **[Аудит 20.10]** `Local*`/`Temp*` member-переменные как промежуточные значения функций (LocalIndex, LocalQuantityHave, LocalItemFound*, TempWbpCraftButtonRef...) — перевести в локальные переменные функций.
- [ ] **[Аудит 20.10]** Enum-литералы `NewEnumerator0/2/3/4` в графах (PickUpItem, CraftItem, OnInventoryChanged-вызовы) — значения E_ без DisplayName; назвать значения енумов.
- [ ] **[Аудит 20.10]** BP_Player: инлайн-логика InteractRadius-overlap (трекинг интерактивов) — кандидат на переезд в BPC_Interaction (правило 1, не блокер).
- [ ] **Тултип предмета (по наведению)**: описание, статы, редкость, цена. WBP_Tooltip из старого проекта перенести/пересобрать; иконка прокидывает ItemInfo в тултип при hover.
- [ ] **Причесать виджеты перед Ф2-ресурсами**: убрать PrintString, якоря/выравнивание, единый шрифт, нейминг, мёртвые узлы.

- [ ] **OnInventoryChanged: добавить payload** (ChangeType: E_NotifyTypes, Item: S_ItemInfo, Count) — без него WBP_NotifyBox не знает, ЧТО подобрать → тост пикапа не собрать.
- [ ] **bSilent-параметр** в RemoveItem/PickUpItem — убрать шум тостов при крафте (списание материалов × N) и фальшивое «подобрано» при выдаче результата.
- [ ] **WBP_Crafting: bind OnCrafted** → перерисовка списка/материалов после крафта.
- [ ] **CraftWidgetRef в WBP_CraftButton** — проверить, что родитель передаёт self при создании (иначе клики уходят в None).
- [ ] **WBP_Interface: свитчер вкладок** (задания/инвентарь/статы) + фокус для OnKeyDown (Is Focusable + SetKeyboardFocus после AddToViewport).
- [ ] **OnKeyDown: закрытие интерфейса** через BaseWidget (сейчас CreateWidget по B безусловно — дубликаты).
- [ ] **Уборка:** `BP_ThirdPersonGameMode` всё ещё жив И активен (GlobalDefaultGameMode в DefaultEngine.ini), при этом `BP_PlayerGameMode` уже создан, но не подключён → переключить Project Settings на BP_PlayerGameMode, удалить старый (при закрытом редакторе), проверить дефолтную карту. Починить/удалить `BP_WobbleTarget` (LevelPrototyping/Interactable/Target, битый материал DemoTemplate).
- [ ] **[Найдено аудитом 19.10]** Осиротевшие `__ExternalActors__/Survival_01/Maps/Overview/...` — карта Survival_01 удалена, внешние акторы остались. Удалить папку (2 файла).
- [ ] **[Найдено аудитом 19.10]** Нейминг виджетов: `WBP_InteractPromt` → опечатка (Prompt), переименовать пока ссылок мало. `BG_1/2/3` — нет BaseName (что это за фоны?). Казус регистра `T_BgInventoryIcon` vs `T_BGInterfaceInventory`. Шрифты `SigmaBoy-Regular*` без префикса конвенции. Префикс `BG_` — легализовать в AGENTS.md или переименовать на T_.
- [ ] **[Найдено аудитом 19.10]** `BP_Test` — что это и живо ли? Если тестовый мусор — удалить. `ItemWeght` (опечатка в имени переменной) — проверить, жива ли после правок 18:29, переименовать.
- [ ] **LearnNewRecipe: проверить** — Broadcast должен быть `OnRecipeLearned`, а не OnCrafted (пользователь говорил, что исправил — проверить при ревью).
- [ ] **PickupTokens: добавить Broadcast** когда появится отображение токенов в HUD.
- [ ] **Textures-монстры:** T_Backpack_Normal (150 МБ), T_Jacket_Normal (118 МБ) — ужать до 4K при реимпорте (если останется GitHub; на GitLab не критично).

## 🟢 Когда-нибудь (Ф3+)

- [ ] **[Идея 21.10, НЕ канон — обсудить перед внесением в LORE]** Твист финала: АРХИВ — нейрокопия человека (диспетчера Железной Дороги?), деградировавшая до советника. Объясняет «логичный юмор», устаревшие данные, фрагменты личности; связность = возвращение памяти (станция 100% → вспоминает имя у Северного Узла). Сеять намёки репликами с Главы 2 («…мне снилось… запись повреждена… неверная формулировка»). Формулировка «не ИИ» в LORE сохраняется: не ИИ, а распавшаяся копия. Цена: ноль механик, только строки в DT_ArchivLines.

- [ ] **BPC_Travel**: переходы между биомами. Текущее решение — слайд-шоу/AI-видео в стиле «архивные кадры АРХИВА», внутри компонента (заменимо на реальную езду). См. Docs/USEFUL.md.
- [ ] **BPC_Equipment**: данные `EquippedItems` — в BPC_Inventory; визуал (AttachedActors, сокеты) — отдельный компонент. Только когда появятся модели оружия.
- [ ] **Сохранения** (Ф6): BP_Save — станция, инвентарь, время, постройки.
- [ ] **Docs/CODE_GUIDE.md**: русское описание графов по всем BP (создать, когда пользователь подтвердит).
- [ ] **Апгрейд предметов** (AddRandomStats + пулы из старого проекта) — решить: в BPC_Craft или отдельный BPC_Upgrade.

## ✅ Сделано (архив)

- [x] **[Фикс 20.10, проверен по пинам]** `RemoveCraftingMaterials` else-ветка: Quantity теперь `LocalQuiantityNeeded` (ровно остаток долга, then-ветка не тронута). `ChangeStats`: второй цикл берёт индекс цикла (MacroInstance_1.out2) вместо литерала 0. Оба фикса пользователем, встали точно по адресату.
- [x] **[Аудит 20.10]** Полная проверка: компиляция 19 BP (warnings_as_errors=true) — 0 ошибок; PrintString — 0; кастов к BP_Player — 0 (радио-схема соблюдена); save_assets — ок; лог двух сессий с PIE — 0 Blueprint Runtime Error / 0 Accessed None; ввод BP_Player работает (IA_Move/Look/Jump/Interact подключены — DSL-дамп врал про «пустые» обработчики).
- [x] **[закрыто 19.10]** `UseItem` — исправлено пользователем, работает (подтверждено verbally; PIE-прогон опционален при следующей сессии).

- [x] **[MCP-чек 19.10]** compile_blueprint (warnings_as_errors=true) по WBP_Interface, WBP_InventoryIcon, WBP_Inventory, BPC_Inventory, BP_Player — 0 ошибок/варнингов; save_assets; зависимости живые; PIE-прогон сценария «подбор ×3 → инвентарь → листание → закрытие» — 0 Accessed None (WBP_InventoryRef/StatsRef починены правками 18:29).

- [x] **Кнопка «Создать» → CraftItem** (18.10 вечер, подтверждено PIE 19.10 19:01, 0 ошибок в логе) — цикл крафта замкнут. Пре-чек материалов решён на уровне виджета (HaveEnoughMaterials); вернуть пре-чек в компонент, когда появится АРХИВ-автокрафт (не-UI вызовы).

- [x] BPC_Inventory: данные + PickUpItem/RemoveItem/UseItem/FindItemCount/PickupTokens/QuickSlots — работает
- [x] Dispatcher OnInventoryChanged + Broadcast в PickUpItem (правильная точка) + Bind в WBP_Inventory
- [x] BPC_Craft: 5 функций + OnCrafted/OnRecipeLearned
- [x] HasMaterials — собран агентом, скомпилирован
- [x] Инвентарный UI (сетка, иконки, ComponentRef-паттерн без cast'ов)
- [x] Крафт-UI (выбор рецепта, материалы have/need через FindItemCount)
- [x] HUD + NotifyBox
- [x] Interaction (InteractRadius → BPI_Interact)
- [x] Perforce: сервер локальный, депо //EchoOfTheDepot, 592 файла импортированы, автостарт
- [x] Git: init + LFS + initial commit (локальный архив)
- [x] Фундамент: папки, eнумы, структуры, худой BP_Player
- [x] WBP_BaseWidget: убран CastToBP_Player (сделано пользователем вручную); игрок более не хранит InterfaceRef — виджеты самодостаточны.
