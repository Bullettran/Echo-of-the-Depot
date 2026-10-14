# verify_stage1.gd — автотест Этапа 1: рендер сцены и движение Инженера.
# Запуск (оконный, нужен рендер для пиксельных проб):
#   & "E:\Godot\Godot_v4.7.2-stable_win64_console.exe" --path . --script res://scripts/tools/verify_stage1.gd
# Проверяет: наличие Инженера в центре экрана (оранжевый комбинезон),
# землю в углах, реквизит в ожидаемых точках, смещение по move_right.
extends SceneTree

# Допуск сравнения цвета по каждому каналу (узкий: у placeholder чистые цвета).
const COLOR_TOLERANCE: int = 12


func _init() -> void:
	# Ждём готовности дерева, затем запускаем тест отложенно.
	call_deferred("_run")


func _run() -> void:
	# Загружаем тестовый мир и ставим его в корень.
	var world: Node = (load("res://scenes/test/test_world.tscn") as PackedScene).instantiate()
	root.add_child(world)
	var player: CharacterBody2D = world.get_node("Player") as CharacterBody2D
	# Даём два кадра на инициализацию камеры и рендер.
	await process_frame
	await process_frame
	var image: Image = root.get_viewport().get_texture().get_image()

	# --- Пиксельные пробы: viewport 1152x648, игрок в (0,0) => центр (576, 324) ---
	var failures: int = 0
	failures += _check_color(image, Vector2i(576, 300), Color(0.78, 0.42, 0.15), "engineer_suit")
	failures += _check_color(image, Vector2i(10, 10), Color(0.14, 0.13, 0.11), "ground_tl")
	failures += _check_color(image, Vector2i(1140, 630), Color(0.14, 0.13, 0.11), "ground_br")
	# Проба в чистое дерево ящика: центр текстуры на экране (676,184), пиксель (8,14) — вне X-досок.
	failures += _check_color(image, Vector2i(664, 178), Color(0.42, 0.30, 0.17), "crate2")
	failures += _check_color(image, Vector2i(716, 118), Color(0.50, 0.22, 0.12), "barrel2")
	# Столб знака SignPost3: центр текстуры экран (636,436), столб x=634..638, y=416..484.
	failures += _check_color(image, Vector2i(636, 430), Color(0.25, 0.23, 0.20), "signpost3_pole")

	# --- Тест движения: зажимаем move_right на 0.5 с (по таймеру, не по кадрам) ---
	Input.action_press("move_right")
	await create_timer(0.5).timeout
	Input.action_release("move_right")
	var moved_x: float = player.position.x
	# За 0.5 с при скорости 140 px/s ожидаем ~70 px; порог с запасом.
	if moved_x > 50.0:
		print("MOVE_RESULT: PASS (x=", moved_x, ")")
	else:
		failures += 1
		print("MOVE_RESULT: FAIL (x=", moved_x, ")")

	# Итог.
	if failures == 0:
		print("VERIFY_STAGE1: ALL PASS")
	else:
		print("VERIFY_STAGE1: FAILURES=", failures)
	quit()


# Сравнивает цвет пикселя с ожидаемым в пределах допуска; печатает PASS/FAIL.
func _check_color(image: Image, pos: Vector2i, expected: Color, label: String) -> int:
	var actual: Color = image.get_pixelv(pos)
	# Разница по каждому каналу отдельно (у Color нет abs()).
	var dr: float = absf(actual.r - expected.r)
	var dg: float = absf(actual.g - expected.g)
	var db: float = absf(actual.b - expected.b)
	if dr <= COLOR_TOLERANCE / 255.0 and dg <= COLOR_TOLERANCE / 255.0 and db <= COLOR_TOLERANCE / 255.0:
		print("PIXEL ", label, ": PASS ", actual)
		return 0
	print("PIXEL ", label, ": FAIL expected=", expected, " actual=", actual)
	return 1
