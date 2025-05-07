import { _decorator, resources, Component, Sprite, SpriteFrame } from "cc";
import { EnemyManager } from "./EnemyManager";
import { BgControl } from "./bgControl";
const { ccclass, property } = _decorator;

@ccclass("EnemyControl")
export class EnemyControl extends Component {
    isDead: boolean = false;
    airplaneDeadImages = [];

    @property({ type: Number })
    maxHealth: number = 2;  // 默认2点血

    @property({ type: Number })
    currentHealth: number = 2;  // 当前血量

    private bgControl: BgControl | null = null;

    start() {
        this.loadImages();
        this.bgControl = this.node.scene.getComponentInChildren(BgControl);
        this.currentHealth = this.maxHealth; // 初始化血量
    }

    // 更新函数，deltaTime为时间间隔
    update(deltaTime: number) {
        // 如果角色已经死亡，则直接返回
        if (this.isDead) return;
        // 获取角色的位置
        const { x, y } = this.node.getPosition();
        // 计算角色的移动距离
        const moveY = y - 500 * deltaTime;
        // 设置角色的位置
        this.node.setPosition(x, moveY);
        // 如果角色的位置小于-450，则销毁角色，并调用bgControl的onChangeBlood函数
        if (moveY < -450 && !this.isDead) {
            this.handleBottomHit();
        }
    }

    private handleBottomHit() {
        this.bgControl?.onChangeBlood(1, false); // 扣玩家血
        this.die(); // 不触发得分
    }

    // 加载图片
    loadImages() {
        resources.loadDir(
            "EnemyDie",
            SpriteFrame,
            (_err, spriteFrames) => {
                this.airplaneDeadImages = spriteFrames;
            }
        );
    }

    playHit(blood: number, onHit?: () => void) {
        this.currentHealth -= blood;
        if (this.currentHealth <= 0) {
            this.die(onHit);
        }
    }

    // 播放死亡动画
    playDead() {
        for (let i = 0; i < this.airplaneDeadImages.length; i++) {
            setTimeout(() => {
                if (this.node?.getComponent) {
                    this.node.getComponent(Sprite).spriteFrame =
                        this.airplaneDeadImages[i];
                }
            }, i * 80);
        }
    }

    // 敌机死亡调用
    die(onDied?: () => void) {
        if (this.isDead) return;
        onDied?.();
        this.isDead = true;
        this.playDead();
        setTimeout(() => {
            this.node?.destroy?.();
            const enemyManager = this.node?.parent.getComponent(EnemyManager);
            enemyManager?.removeEnemy(this.node);
        }, 300);
    }
}
