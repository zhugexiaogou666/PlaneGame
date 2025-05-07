import { _decorator, Component, Material, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HitFlash')
export class HitFlash extends Component {
    @property(Material)
    hitFlashMaterial: Material = null;

    @property({ type: Number })
    flashDuration: number = 0.1; // 单次闪烁持续时间

    @property({ type: Number })    
    flashInterval: number = 0.1; // 闪烁间隔时间

    @property({ type: Number })
    flashTimes: number = 3;      // 闪烁总次数

    private isInvincible: boolean = false; // 公开的无敌状态标记

    private sprite: Sprite;
    private originalMaterial: Material;
    private flashCount: number = 0;

    start() {
        this.sprite = this.node.getComponent(Sprite);
        this.originalMaterial = this.sprite.getSharedMaterial(0);
    }

    public triggerHitEffect() {
        if (this.isInvincible) return;

        // 初始化状态
        this.isInvincible = true;
        this.flashCount = 0;
        
        // 开始闪烁流程
        this.executeFlashCycle();
    }

    public get invincible() {
        return this.isInvincible;
    }

    private executeFlashCycle() {
        if (!this.isInvincible || this.flashCount >= this.flashTimes) return;

        // 应用闪光材质
        this.sprite.setSharedMaterial(this.hitFlashMaterial, 0);

        // 设置材质恢复定时器
        this.scheduleOnce(() => {
            // 恢复原始材质
            this.sprite.setSharedMaterial(this.originalMaterial, 0);
            this.flashCount++;

            // 判断是否需要继续闪烁
            if (this.flashCount < this.flashTimes) {
                // 设置下一次闪烁间隔
                this.scheduleOnce(
                    () => this.executeFlashCycle(), 
                    this.flashInterval
                );
            } else {
                // 所有闪烁完成，解除无敌状态
                this.isInvincible = false;
            }
        }, this.flashDuration);
    }
}