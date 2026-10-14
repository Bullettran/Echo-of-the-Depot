---
name: godot-debug
description: Use when running, testing, validating, or debugging the Godot project «Echo of the Depot» via CLI — script syntax checks, headless import, capturing debug output, taking screenshots, reading PNGs. Trigger words: --check-only, headless, console exe, скриншот, запуск игры, ошибки Godot.
---

# Скилл: Запуск и отладка Godot через CLI

## Исполняемые файлы

- **Консольный** (выводит лог в stdout — использовать всегда): `E:\Godot\Godot_v4.7.2-stable_win64_console.exe`
- Обычный: `E:\Godot\Godot_v4.7.2-stable_win64.exe`

В bash вызывать через call-оператор из корня проекта:

```powershell
& "E:\Godot\Godot_v4.7.2-stable_win64_console.exe" --headless --path . --import
```

## Основные команды

| Задача | Команда (ключи после exe) |
|--------|---------------------------|
| Импорт/переимпорт ассетов | `--headless --path . --import` |
| Проверка синтаксиса скрипта | `--headless --path . --check-only --script scripts/player.gd` |
| Быстрый прогон на ошибки (без рендера) | `--headless --path . --quit-after 120` |
| Запуск с рендером (для скриншотов) | `--path . --quit-after 180 -- --shot-after=3` |

## Правила экономии токенов

1. После каждой правки `.gd` — сначала `--check-only`, потом запуск. Не запускать игру со сломанным скриптом.
2. Длинный вывод лога грепать по `SCRIPT ERROR`, `ERROR`, `WARNING` — не читать целиком.
3. После добавления новых файлов (спрайты, сцены) — всегда `--import`, иначе Godot их не увидит.
4. Файлы `.tscn` и `.tres` писать как текст напрямую, не через редактор.
5. Скриншоты читать Read-инструментом (PNG отображается как изображение) — не просить пользователя описывать экран.

## Дебаг-автолоад DebugTools (создаётся в Этапе 1)

- Автолоад `res://scripts/debug/debug_tools.gd`, активен только при `OS.is_debug_build()`.
- **F12** — скриншот в `debug/screenshots/shot_N.png`.
- Пользовательские аргументы после `--` (читаются через `OS.get_cmdline_user_args()`):
  - `--shot-after=СЕК` — автоскриншот через СЕК секунд после старта;
  - `--quit-after-shot` — закрыть игру после скриншота (для CI-прогона).
- Скриншот снимать после `await RenderingServer.frame_post_draw`.
- Папка `debug/` добавлена в `.gitignore`.
