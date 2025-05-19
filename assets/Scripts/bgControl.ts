import { _decorator, Component, director, Node, PhysicsSystem2D, Contact2DType, Collider2D, Label, Prefab, instantiate } from "cc";
import { BulletControl } from "./bulletControl";
import { BulletControl2 } from "./bullet2Control";
import { PlayerControl } from "./playerControl";
import { EnemyControl } from "./ememy0Control";
import { HitFlash } from "./HitFlash";
import { ECollisionLayer } from "./Collision/CollisionLayers";
import { collisionHandlers } from "./Collision/ICollisionHandler";
import { CollisionTag } from "./Collision/CollisionTag";
import { Bullet2EnemyHandler, BulletEnemyHandler } from "./Collision/CollisionHandle/BulletEnemyHandler";
import { EnemyPlayerHandler } from "./Collision/CollisionHandle/EnemyPlayerHandler";
const { ccclass, property } = _decorator;

@ccclass("bgControl")
export class BgControl extends Component {

    @property({ type: PlayerControl })
    public playerCtrl: PlayerControl | null = null; // 目标节点
    @property(Prefab)
    blood: Prefab;
    @property(Prefab)
    bloodNone: Prefab;
    @property({ type: Node })
    zero: Node | null = null; // 目标节点

    @property({ type: Label })
    private stepLabel: Label | null = null;

    private _bloodNumber: number = 3;
    public _currentBlood: number = 3;
    private bloodNodes: Node[] = []; // 存储血条节点
    public _moveBG: boolean = false;
    private invincible: boolean = false;
    public get bloodNumber() {
        return this._currentBlood;
    }

    public set bloodNumber(value: number) {
        if (this._bloodNumber !== value) {
            this._bloodNumber = Math.max(value, 0);
        }
    }
    // 带 setter 的血量属性
    public get currentBlood() {
        return this._currentBlood;
    }

    public set currentBlood(value: number) {
        if (this._currentBlood !== value) {
            this._currentBlood = Math.min(Math.max(value, 0), this._bloodNumber);
            this.updateBloodUI();
        }
    }

    // 初始化物理系统
    onPhysics2D() {
        PhysicsSystem2D.instance.on(
            Contact2DType.BEGIN_CONTACT,
            this.handleCollisionEvent,
            this
        );
    }

    start() {
        this.updateBloodUI(); // 初始化血条
    }

    // 血条更新方法
    // 更新血条UI
    private updateBloodUI() {
        // 清除旧血条
        this.bloodNodes.forEach(node => node.destroy());
        this.bloodNodes = [];

        // 生成新血条
        const startX = -180;
        const step = 40;
        for (let i = 0; i < this._bloodNumber; i++) {
            // 根据当前血量判断使用哪种血条预制体
            const prefab = i < this._currentBlood ? this.blood : this.bloodNone;
            // 实例化预制体
            const node = instantiate(prefab);
            // 设置位置
            node.setPosition(startX + i * step, 370);
            // 添加到场景中
            this.zero!.addChild(node);
            // 存储节点
            this.bloodNodes.push(node);
        }
    }

    onChangeBlood(value: number = 1, isAdd: boolean = true) {
        let curBlood = this.currentBlood;
        if (!isAdd) {
            curBlood = Math.max(curBlood - value, 0);
        } else {
            curBlood = Math.min(curBlood + value, this._bloodNumber);
        }
        this.currentBlood = curBlood;
    }

    private handleCollisionEvent(self: Collider2D, other: Collider2D) {
        const layers = this.getCollisionLayers(self, other);
        const handlerKey = this.getLayerKey(layers.selfLayer, layers.otherLayer);
        // 查找注册的处理器
        const handler = collisionHandlers.get(handlerKey);
        if (handler) {
            // 保持参数顺序与 layerKey 一致：较小的 layer 对应的 Collider 在前
            const [first, second] = layers.selfLayer < layers.otherLayer
                ? [self, other]
                : [other, self];
            handler.handleCollision(first, second);
        } 
    }

    private getLayerKey(layerA: ECollisionLayer, layerB: ECollisionLayer): string {
        return layerA < layerB
            ? `${layerA}|${layerB}`
            : `${layerB}|${layerA}`;
    }

    private getCollisionLayers(self: Collider2D, other: Collider2D) {
        return {
            selfLayer: this.getLayerTag(self),
            otherLayer: this.getLayerTag(other)
        };
    }

    private getLayerTag(collider: Collider2D): ECollisionLayer {
        // 这里需要根据实际标签系统实现，例如：
        return collider.node.getComponent(CollisionTag)?.layer;
    }

    private initCollisionHandlers() {
        // 玩家子弹 vs 敌人
        collisionHandlers.set(
            this.getLayerKey(ECollisionLayer.PLAYER_BULLET, ECollisionLayer.ENEMY),
            {
                handleCollision: (bullet, enemy) => {
                    new BulletEnemyHandler().handleCollision(bullet, enemy, {
                        updateScore: () => {
                            this.stepLabel.string = (parseInt(this.stepLabel.string) + 1).toString();
                        }
                    });
                }
            }
        );

        collisionHandlers.set(
            this.getLayerKey(ECollisionLayer.PLAYER_MISSILE, ECollisionLayer.ENEMY),
            {
                handleCollision: (bullet, enemy) => {
                    new Bullet2EnemyHandler().handleCollision(bullet, enemy, {
                        updateScore: () => {
                            this.stepLabel.string = (parseInt(this.stepLabel.string) + 1).toString();
                        }
                    });
                }
            }
        );

        // 敌人 vs 玩家
        collisionHandlers.set(
            this.getLayerKey(ECollisionLayer.ENEMY, ECollisionLayer.PLAYER),
            {
                handleCollision: (enemy, player) => {
                    new EnemyPlayerHandler().handleCollision(enemy, player, {
                        onChangeBlood: (v, isAdd) => this.onChangeBlood(v, isAdd),
                        isInvincible: () => this.invincible
                    });
                }
            }
        );
    }

    // 加载函数
    onLoad() {
        // 初始化碰撞处理函数
        this.initCollisionHandlers();
    }

    // 生命周期每帧调用函数
    update(deltaTime: number) {
        // 使用this.node.children获取当前节点下的子节点
        if (this._moveBG) {
            for (let item of this.node.children) {
                // 使用getPosition获取坐标信息
                const { x, y } = item.getPosition();
                // 计算移动坐标
                const moveY = y - 100 * deltaTime;
                item.setPosition(x, moveY);
                // 如果超出屏幕 重新回到顶部，也就是当前位置加上两倍的高度
                if (moveY < -870) {
                    item.setPosition(x, moveY + 851 * 2);
                }
            }
        }

        this.invincible = this.playerCtrl.getComponent(HitFlash).invincible;
    }
}

