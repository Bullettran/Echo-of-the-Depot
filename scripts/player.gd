# player.gd — управление движением Инженера в мировых координатах (Этап 1).
# WASD/стрелки, анимации idle/walk, отражение спрайта через flip_h.
extends CharacterBody2D

# Скорость ходьбы, пикселей в секунду (тюнится в редакторе).
@export var move_speed: float = 140.0

# Текущее направление ввода (нормализованный вектор).
var _direction: Vector2 = Vector2.ZERO

# Ссылка на анимированный спрайт Инженера.
@onready var _sprite: AnimatedSprite2D = $AnimatedSprite2D


func _ready() -> void:
	# Стартовая анимация — покой.
	_sprite.play("idle")


func _physics_process(_delta: float) -> void:
	_read_input()
	# Движение в мировых координатах, без привязки к тайлам.
	velocity = _direction * move_speed
	move_and_slide()
	_update_animation()


# Читает ввод действий move_* в единый нормализованный вектор.
func _read_input() -> void:
	# get_vector сам нормализует диагонали и применяет deadzone.
	_direction = Input.get_vector("move_left", "move_right", "move_up", "move_down")


# Переключает анимацию idle/walk и отражение по горизонтали.
func _update_animation() -> void:
	# Отражаем спрайт только при явном горизонтальном вводе,
	# чтобы направление не «дёргалось» при вертикальном движении.
	if _direction.x < 0.0:
		_sprite.flip_h = true
	elif _direction.x > 0.0:
		_sprite.flip_h = false
	# Анимация: walk при любом вводе, иначе idle.
	var next: StringName = &"walk" if _direction != Vector2.ZERO else &"idle"
	if _sprite.animation != next:
		_sprite.play(next)
