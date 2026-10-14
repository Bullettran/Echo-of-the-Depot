---
name: godot-conventions
description: Use when writing GDScript code (.gd) or creating Godot scenes (.tscn), nodes, or project files for «Последний Редут». Enforces typed GDScript, Russian comments on all code, naming, signals, and folder conventions.
---

# Скилл: Соглашения Godot / GDScript проекта

## Движок и язык

- Godot 4.x, GDScript. Не использовать синтаксис Godot 3 (`onready var` без `@`, `export(...)`, `yield` и т.п.).

## Комментарии (строго)

Весь код комментируется на русском языке:

```gdscript
# player.gd — управление движением Инженера в мировых координатах.

# Скорость движения, пикселей в секунду.
const MOVE_SPEED: float = 120.0

# Перемещает персонажа по вектору direction.
# direction: нормализованный вектор ввода.
func move(direction: Vector2) -> void:
	# Нормализация защищает от ускорения по диагонали.
	position += direction.normalized() * MOVE_SPEED * get_process_delta_time()
```

- Заголовочный комментарий скрипта: назначение.
- Каждая функция: что делает, аргументы, возврат если неочевидно.
- Неочевидная логика — построчные пояснения.

## Типизация и именование

- Типы везде, где возможно: `var hp: int = 100`, `func take_damage(value: int) -> void`.
- Файлы и функции — `snake_case` (`player_movement.gd`, `take_damage()`).
- Сцены и узлы — `PascalCase` (`Player.tscn`, узел `InventoryUI`).
- Константы — `SCREAMING_SNAKE_CASE`.
- Сигналы — прошедшее время: `signal damage_taken(value: int)`.

## Сцены и архитектура

- Один скрипт — одна ответственность.
- Композиция сцен и сигналы вместо жёстких ссылок между узлами.
- `@export` для параметров, которые тюнятся в редакторе.
- Корневой узел сцены называть по роли: `Player`, `Train`, `Turret`, `World`.

## Изометрия

- Y-sort включать для правильного перекрытия объектов.
- Движение персонажа — в мировых координатах (Vector2), без «ступенек» по тайлам.
- Для изометрического тайлмапа — TileMap с isometric-режимом тайлсета.

## Структура каталогов

```
scenes/      — сцены (.tscn)
scripts/     — скрипты (.gd)
assets/
  sprites/   — спрайты и спрайт-листы
  audio/     — звуки и музыка
data/        — конфиги (предметы, вагоны, рецепты) в JSON или .tres
docs/        — документация и дизайн-решения
```

Создавать каталоги по мере необходимости, не заранее.
