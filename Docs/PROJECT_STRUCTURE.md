# Структура проекта EchoOfTheDepot

> Что где лежит и что выполняет. Обновляется при полных проверках (последняя: 18.10).
> Правила работы агента — см. `AGENTS.md`. План фаз — `Docs/GAME_PLAN.md`. Лор — `Docs/LORE.md`.

---

## Карта папок Content

| Папка | Содержимое |
|---|---|
| `/Game/Components/Inventory` | `BPC_Inventory` — данные + операции инвентаря |
| `/Game/Components/Craft` | `BPC_Craft` — рецепты, крафт |
| `/Game/Components/Stats` | `BPC_Stats` — характеристики |
| `/Game/Components/Items` | `BP_Items` (базовый предмет), `BP_InteractableItem` (дроп в мире), `BP_Axe`, `BP_Test` |
| `/Game/Components/IconCreator` | рендер иконок предметов (`BP_IconCapture`) |
| `/Game/Widgets/Inventory` | `WBP_Interface` (свитчер вкладок), `WBP_Inventory`, `WBP_InventoryIcon`, `WBP_InteractPromt`, `WBP_EquipmentSlot` |
| `/Game/Widgets/Craft` | `WBP_Crafting`, `WBP_CraftButton` (строка рецепта), `WBP_CraftMaterials` |
| `/Game/Widgets/NotifyBox` | `WBP_NotifyBox` (контейнер тостов), `WBP_Notify` (один тост) |
| `/Game/Widgets` | `WBP_PlayerHUD` (главный HUD), `WBP_BaseWidget` (база: input mode, закрытие) |
| `/Game/Structures` | `S_ItemInfo`, `S_Craft`, `S_ItemCosts`, `S_StatType`, `DT_Items` |
| `/Game/Enums` | `E_ItemTypes`, `E_Stats`, `E_Rarity`, `E_Conditions`, `E_Recipes`, `E_InteractType` (E_SurvivalNeeds удалён 21.10 — нужды переехали в E_Stats) |
| `/Game/Interfaces` | `BPI_Interact` |
| `/Game/Global` | `BFL_GlobalFunctions` |
| `/Game/ThirdPerson/Blueprints` | `BP_Player`, `BP_PlayerController`, `BP_PlayerGameMode`, `BP_PlayerHUD`, (шаблонный `BP_ThirdPersonGameMode` — кандидат на удаление) |
| `/Game/LevelPrototyping` | Door, JumpPad, Target (прототипы взаимодействий) |
| `/Game/Survival_Character` | модульный персонаж (меши/текстуры/материалы) |

---

## Архитектурные потоки (кто с кем говорит)

```
BP_Player (худой: input, камера, InteractRadius)
  └─ компонент BPC_Inventory (инстанс)
  └─ компонент BPC_Stats (инстанс)

UI → данные: GetOwningPlayerPawn → GetComponentByClass(BPC_*) → IsValid → ссылка
Компонент → компонент: GetOwner → GetComponentByClass → IsValid
Компонент → UI: ТОЛЬКО Event Dispatchers (OnInventoryChanged, OnCrafted)
Взаимодействие: Player Interact → BPI_Interact.Interact(Instigator) → предмет → PickUpItem
Тосты: компонент Broadcast → WBP_NotifyBox (bind) → ShowNotify
```

**Правило №1:** BP_Player не содержит игровой логики. **Правило №2:** компоненты не знают класс игрока. **Правило №3:** UI не опрашивает — слушает.

---

## Статус систем (после аудита 18.10)

| Система | Статус | Компиляция (strict) |
|---|---|---|
| BPC_Inventory | работает: PickUpItem/RemoveItem/UseItem/FindItemCount/PickupTokens/QuickSlots, dispatcher OnInventoryChanged | ✅ |
| BPC_Craft | LearnNewRecipe/CheckExistingRecipes/RemoveCraftingMaterials/CraftItem/CraftMultiple, dispatcher OnCrafted + OnRecipeLearned | ✅ |
| BPC_Stats | перенесён, компилируется | ✅ |
| Инвентарный UI | WBP_Inventory + Icon: сетка, ComponentRef-паттерн, RefreshInventory | ✅ |
| Крафт UI | WBP_Crafting + Button + Materials: выбор рецепта, материалы have/need | ✅ |
| HUD | WBP_PlayerHUD + BP_PlayerHUD, отображается | ✅ |
| NotifyBox | контейнер + тост, бинды на dispatcher'ы | ✅ |
| Interaction | InteractRadius → массив Interactable → BPI_Interact | ✅ |

## Открытые хвосты (техдолг)

1. **CraftItem: нет вызова из UI** (кнопка «Создать») и **нет пре-чека материалов** — порядок «результат → списание» сохраняется; `HasMaterials` готов в компоненте, осталось вставить 3 узла.
2. **OnInventoryChanged без payload** — NotifyBox не знает, ЧТО подобралось (тосты от пикапа не соберутся).
3. **CraftItem: нет bSilent** — двойные тосты при будущем связывании.
4. **WBP_Interface** — свитчер вкладок почти пуст (Construct + PreConstruct + Tick — Tick держать пустым).
5. **BP_ThirdPersonGameMode** — удалить после проверки GameMode в настройках проекта.
6. **BP_WobbleTarget** — битая ссылка на `/Game/DemoTemplate/_Core/MI_Intro_Colorway` (мусор шаблона; удалить или переназначить материал).
7. **LearnNewRecipe → CallOnCrafted** — исправлено на OnRecipeLearned? (проверить при следующем ревью).
8. Нет git-репозитория.

## Не переносить/не делать (из опыта)

- Логика в виджетах — только отображение и вызовы компонента.
- `Set Members`-узлы вручную через API не создаются — правки таких функций в редакторе.
- Конфиги UE править при закрытом редакторе.
- Parallel MCP-вызовы запрещены.
