# make_placeholder_sprites.gd — генератор placeholder-графики (Этап 1).
# Запуск:
#   & "E:\Godot\Godot_v4.7.2-stable_win64_console.exe" --headless --path . --script res://scripts/tools/make_placeholder_sprites.gd
# Создаёт PNG в assets/sprites: спрайт-лист Инженера, ящик, бочку, столб, землю.
extends SceneTree

# --- Кадр Инженера и раскладка листа ---
const FRAME_W: int = 32
const FRAME_H: int = 64
const IDLE_FRAMES: int = 2
const WALK_FRAMES: int = 4

# --- Палитра Инженера (индустриальный тон: оранжевый комбинезон, ржавый рюкзак) ---
const C_HELMET: Color = Color(0.24, 0.24, 0.27)
const C_FACE: Color = Color(0.55, 0.42, 0.35)
const C_SUIT: Color = Color(0.78, 0.42, 0.15)
const C_SUIT_DARK: Color = Color(0.60, 0.30, 0.10)
const C_PACK: Color = Color(0.45, 0.26, 0.14)
const C_LEGS: Color = Color(0.20, 0.19, 0.18)
const C_BOOTS: Color = Color(0.12, 0.11, 0.10)

# --- Палитра реквизита ---
const C_CRATE: Color = Color(0.42, 0.30, 0.17)
const C_CRATE_DARK: Color = Color(0.28, 0.19, 0.10)
const C_BARREL: Color = Color(0.50, 0.22, 0.12)
const C_BARREL_DARK: Color = Color(0.36, 0.15, 0.08)
const C_POLE: Color = Color(0.25, 0.23, 0.20)
const C_BOARD: Color = Color(0.48, 0.33, 0.16)
const C_BOARD_DARK: Color = Color(0.30, 0.20, 0.09)


func _init() -> void:
	# Фиксированный seed — стабильная регенерация placeholder-графики.
	seed(42)
	_make_engineer_sheet()
	_make_crate()
	_make_barrel()
	_make_signpost()
	_make_ground()
	print("PLACEHOLDER_DONE")
	# quit() прямо из _init игнорируется до инициализации дерева — завершаем отложенно.
	call_deferred("quit")


# ---------- Утилиты ----------

# Создаёт пустое RGBA-изображение.
func _img(w: int, h: int) -> Image:
	return Image.create(w, h, false, Image.FORMAT_RGBA8)


# Сохраняет изображение, при необходимости создавая папки.
func _save(image: Image, path: String) -> void:
	DirAccess.make_dir_recursive_absolute(path.get_base_dir())
	image.save_png(path)
	print("SAVED: ", path)


# Заливает прямоугольник цветом.
func _rect(image: Image, x: int, y: int, w: int, h: int, color: Color) -> void:
	image.fill_rect(Rect2i(x, y, w, h), color)


# ---------- Инженер ----------

# Спрайт-лист: idle (2 кадра) + walk (4 кадра) в одну строку.
func _make_engineer_sheet() -> void:
	var total: int = IDLE_FRAMES + WALK_FRAMES
	var image: Image = _img(total * FRAME_W, FRAME_H)
	for i: int in IDLE_FRAMES:
		_draw_engineer(image, i * FRAME_W, "idle", i)
	for i: int in WALK_FRAMES:
		_draw_engineer(image, (IDLE_FRAMES + i) * FRAME_W, "walk", i)
	_save(image, "res://assets/sprites/engineer/engineer_sheet.png")


# Рисует кадр Инженера со смещением fx (kind: "idle"/"walk", idx — номер кадра).
func _draw_engineer(image: Image, fx: int, kind: String, idx: int) -> void:
	# Лёгкое «дыхание» — корпус поднят на 1px во втором кадре idle.
	var bob: int = 1 if (kind == "idle" and idx == 1) else 0
	# Фаза шага: ноги расходятся в противофазе.
	var leg_a: int = 0
	var leg_b: int = 0
	if kind == "walk":
		match idx:
			0: leg_a = 2; leg_b = -2
			1: leg_a = 0; leg_b = 0
			2: leg_a = -2; leg_b = 2
			3: leg_a = 0; leg_b = 0
	# Рюкзак за спиной (ржавый).
	_rect(image, fx + 5, 28 + bob, 4, 14, C_PACK)
	# Корпус — оранжевый комбинезон.
	_rect(image, fx + 9, 26 + bob, 14, 20, C_SUIT)
	_rect(image, fx + 9, 26 + bob, 14, 3, C_SUIT_DARK)
	# Руки по бокам.
	_rect(image, fx + 7, 28 + bob, 2, 14, C_SUIT_DARK)
	_rect(image, fx + 23, 28 + bob, 2, 14, C_SUIT_DARK)
	# Голова: каска + лицо.
	_rect(image, fx + 10, 13 + bob, 12, 11, C_HELMET)
	_rect(image, fx + 12, 19 + bob, 8, 4, C_FACE)
	# Ноги.
	_rect(image, fx + 11 + leg_a, 46, 4, 14, C_LEGS)
	_rect(image, fx + 17 + leg_b, 46, 4, 14, C_LEGS)
	# Тяжёлые ботинки.
	_rect(image, fx + 10 + leg_a, 60, 6, 4, C_BOOTS)
	_rect(image, fx + 16 + leg_b, 60, 6, 4, C_BOOTS)


# ---------- Реквизит ----------

# Ящик 40x40: доски + X-перевязь.
func _make_crate() -> void:
	var s: int = 40
	var image: Image = _img(s, s)
	_rect(image, 0, 0, s, s, C_CRATE)
	# Рамка.
	_rect(image, 0, 0, s, 2, C_CRATE_DARK)
	_rect(image, 0, s - 2, s, 2, C_CRATE_DARK)
	_rect(image, 0, 0, 2, s, C_CRATE_DARK)
	_rect(image, s - 2, 0, 2, s, C_CRATE_DARK)
	# Диагональные доски (X) — рисуем по пикселям.
	for i: int in range(4, s - 4):
		image.set_pixel(i, i, C_CRATE_DARK)
		image.set_pixel(s - 1 - i, i, C_CRATE_DARK)
	_save(image, "res://assets/sprites/props/crate.png")


# Бочка 36x52: вертикальный цилиндр с обручами.
func _make_barrel() -> void:
	var w: int = 36
	var h: int = 52
	var image: Image = _img(w, h)
	_rect(image, 0, 0, w, h, C_BARREL)
	# Крышка.
	_rect(image, 0, 0, w, 4, C_BARREL_DARK)
	# Обручи.
	_rect(image, 0, 14, w, 3, C_BARREL_DARK)
	_rect(image, 0, 34, w, 3, C_BARREL_DARK)
	# Пятно ржавчины сбоку.
	_rect(image, 6, 20, 8, 10, Color(0.42, 0.30, 0.12))
	_save(image, "res://assets/sprites/props/barrel.png")


# Столб 32x96: высокий объект для проверки Y-sort.
func _make_signpost() -> void:
	var w: int = 32
	var h: int = 96
	var image: Image = _img(w, h)
	# Доска-указатель.
	_rect(image, 2, 8, 28, 20, C_BOARD)
	_rect(image, 2, 8, 28, 2, C_BOARD_DARK)
	_rect(image, 2, 26, 28, 2, C_BOARD_DARK)
	# Шесть «надписей» — тёмные штрихи.
	_rect(image, 6, 14, 14, 3, C_BOARD_DARK)
	_rect(image, 6, 20, 10, 3, C_BOARD_DARK)
	# Столб.
	_rect(image, 14, 28, 4, h - 28, C_POLE)
	_save(image, "res://assets/sprites/props/signpost.png")


# ---------- Земля ----------

# Земля 2048x2048: пыльная пустошь с пиксельным шумом.
# Размер больше экрана (1152x648), чтобы пустошь заполняла весь кадр.
func _make_ground() -> void:
	var s: int = 2048
	var image: Image = _img(s, s)
	image.fill(Color(0.14, 0.13, 0.11))
	# Пиксельный шум — гравий и пыль.
	var rng := RandomNumberGenerator.new()
	rng.seed = 7
	for i: int in 240000:
		var x: int = rng.randi_range(0, s - 1)
		var y: int = rng.randi_range(0, s - 1)
		var v: float = rng.randf_range(-0.03, 0.03)
		image.set_pixel(x, y, Color(0.14 + v, 0.13 + v, 0.11 + v))
	_save(image, "res://assets/sprites/test/ground.png")
