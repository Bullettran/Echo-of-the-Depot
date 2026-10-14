---
name: animated-sprites
description: Use when creating or wiring animated sprites for «Последний Редут» — AnimatedSprite2D, SpriteFrames, sprite sheets, placeholder art generation, animation naming, flip_h direction handling, Y-sort setup.
---

# Скилл: Анимированные спрайты

## Когда применяется

Создание персонажей, врагов, интерактивных объектов с анимациями; генерация placeholder-графики; подключение спрайт-листов.

## Соглашения по анимациям

- Узел: `AnimatedSprite2D` + ресурс `SpriteFrames`.
- Имена анимаций — `snake_case`, стандартный набор:
  - `idle` — покой;
  - `walk` — движение (4 направления можно решать flip_h + одна анимация либо 4 анимации `walk_n`, `walk_s`, `walk_e`, `walk_w`);
  - `work` / `repair` — работа, ремонт;
  - `attack` — атака (если применимо);
  - `death` — смерть/разрушение.
- Горизонтальное отражение — `flip_h = true/false`, не дублировать кадры.
- FPS анимации по умолчанию: idle 4–6, walk 8–12. Задавать в SpriteFrames, не в коде, где возможно.
- `animation_finished` для одноразовых анимаций (attack, death) с возвратом на `idle`.

## Placeholder-графика

Пока нет ассетов, генерировать простые спрайты скриптом (однотонные фигуры/прямоугольники с рамкой) — быстрый переход на финальные ассеты без смены кода:

```gdscript
# make_placeholder.gd — утилита генерации placeholder-спрайтов (tool-скрипт).
# Запуск: Godot → F6 или через временную сцену.
```

- Размеры под изометрию: персонаж ~32x64, объекты ~64x64, вагоны ~128x64.
- Прозрачный фон (`Image.FORMAT_RGBA8`), сохранять в `assets/sprites/`.
- Импорт в Godot: фильтрация выключена для пиксель-арта (или включена для сглаженного стиля — согласовать с пользователем).

## Спрайт-листы (готовые ассеты)

- Горизонтальная раскадровка, кадры равной ширины.
- В SpriteFrames задать регион кадра (AnimatedSprite2D → SpriteFrames → Add frames from sprite sheet).
- Имена файлов: `engineer_walk_sheet.png`, `turret_idle.png` — `snake_case`.

## Изометрия и перекрытие

- Родителю персонажа/объекта включать Y-sort.
- Origin спрайта — «ноги» персонажа (низ спрайта), чтобы Y-sort сортировал корректно.
- Тени — отдельным спрайтом под персонажем, полупрозрачные.
