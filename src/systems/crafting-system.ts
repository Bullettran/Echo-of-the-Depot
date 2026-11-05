import type { EventBus, GameEventMap } from '../core/event-bus'
import type { S_RecipeConfig } from '../data/types'
import { InventoryComponent } from '../components/inventory-component'

/** Таблица рецептов: ключ = id рецепта из data/recipes.json. */
export type RecipesTable = Record<string, S_RecipeConfig>

/**
 * Крафт: пре-чек материалов, атомарный расход, выдача результата.
 * Гарантия против потери материалов: результат должен помещаться в рюкзак
 * С УЧЁТОМ освободившихся после списания затрат слотов (canFitAfterRemoving),
 * иначе крафт отклоняется целиком. Аналог BPC_Crafting из UE-плана.
 */
export class CraftingSystem {
  private readonly bus: EventBus<GameEventMap>
  private readonly recipes: RecipesTable
  private readonly inventory: InventoryComponent

  constructor(bus: EventBus<GameEventMap>, recipes: RecipesTable, inventory: InventoryComponent) {
    this.bus = bus
    this.recipes = recipes
    this.inventory = inventory
  }

  /** Существует ли рецепт. */
  has(recipeId: string): boolean {
    return this.recipes[recipeId] !== undefined
  }

  /** Хватает ли всех материалов (без изменений в рюкзаке). */
  canCraft(recipeId: string): boolean {
    const recipe = this.recipes[recipeId]
    if (!recipe) return false
    return Object.entries(recipe.cost).every(([itemId, count]) => this.inventory.count(itemId) >= count)
  }

  /**
   * Скрафтить: списать затраты и положить результат (атомарно).
   * @returns успех; при неудаче рюкзак не изменён.
   * Эмитит 'crafting:crafted' при успехе.
   */
  craft(recipeId: string): boolean {
    const recipe = this.recipes[recipeId]
    if (!recipe || !this.canCraft(recipeId)) return false
    if (
      !this.inventory.canFitAfterRemoving(
        Object.entries(recipe.cost).map(([itemId, count]) => ({ itemId, count })),
        [{ itemId: recipe.result.itemId, count: recipe.result.count }],
      )
    ) {
      this.bus.emit('inventory:full', { itemId: recipe.result.itemId })
      return false
    }

    for (const [itemId, count] of Object.entries(recipe.cost)) {
      this.inventory.remove(itemId, count)
    }
    this.inventory.add(recipe.result.itemId, recipe.result.count)
    this.bus.emit('crafting:crafted', {
      recipeId,
      itemId: recipe.result.itemId,
      count: recipe.result.count,
    })
    return true
  }
}
