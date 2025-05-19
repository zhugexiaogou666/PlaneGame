export enum ECollisionLayer {
    // 基础对象层 (0000 0001 - 0000 1000)
    DEFAULT     = 0b000000000001, // 默认层
    PLAYER      = 0b000000000010,
    ENEMY       = 0b110000000100,
    BOSS01      = 0b110000001000,

    // 玩家子弹类别 (0010 0001 - 0010 1000)
    PLAYER_PROJECTILE_GROUP = 0b001000000000, // 类别标识头
    PLAYER_BULLET           = 0b001000000001, // 普通子弹
    PLAYER_LASER            = 0b001000000010, // 激光
    PLAYER_MISSILE          = 0b001000000100, // 导弹
    PLAYER_GRENADE          = 0b001000001000, // 榴弹

    // 敌人子弹类别 (0100 0001 - 0100 1000)
    ENEMY_PROJECTILE_GROUP  = 0b010000000000,
    ENEMY_BULLET            = 0b010000000001,
    ENEMY_FIREBALL         = 0b010000000010,
    ENEMY_PLASMA           = 0b010000000100,

    // 特殊效果层 (1000 0001 - 1000 1000)
    SHIELD                 = 0b100000000001,
    POWERUP                = 0b100000000010
}