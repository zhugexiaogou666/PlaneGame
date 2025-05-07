import { _decorator, Component, director, Node, PhysicsSystem2D, Contact2DType, Collider2D, Label, Prefab, instantiate } from "cc";
import { BulletControl } from "./bulletControl";
import { BulletControl2 } from "./bullet2Control";
import { PlayerControl } from "./playerControl";
import { EnemyControl } from "./ememy0Control";
import { HitFlash } from "./HitFlash";
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
            this.onBeginContact,
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


    onBeginContact(self: Collider2D, other: Collider2D) {
        // 定义子弹标签集合
        const bulletTags = new Set([0, 2]);
        // 定义玩家标签
        const playerTag = 3;
        // 定义敌人标签
        const enemyTag = 1;

        // 组合所有可能的碰撞情况，包括敌人和玩家
        const combinations = [
            { bullet: self, enemy: other },
            { bullet: other, enemy: self },
            { enemy: self, player: other },
            { enemy: other, player: self }
        ];

        for (const combo of combinations) {
            const bullet = combo.bullet;
            const enemy = combo.enemy;
            const player = combo.player;

            // 处理子弹与敌人碰撞
            if (bullet && enemy && bulletTags.has(bullet.tag) && enemy.tag === enemyTag) {
                const enemyControl = enemy.getComponent(EnemyControl);
                const bulletControl = bullet.getComponent(BulletControl) || bullet.getComponent(BulletControl2);
                const bulletHit = bulletControl.curHurt;
                if (enemyControl && bulletControl) {
                    enemyControl.playHit(bulletHit, () => { this.stepLabel.string = (parseInt(this.stepLabel.string) + 1).toString() });
                    bulletControl.die();
                }
                return;
            }

            // 处理敌人与玩家碰撞
            if (enemy && player && enemy.tag === enemyTag && player.tag === playerTag) {
                const enemyControl = enemy.getComponent(EnemyControl);
                const playerControl = player.getComponent(PlayerControl);
                if (playerControl && enemyControl) {
                    playerControl.hit();
                    if (!this.invincible) {
                        this.onChangeBlood(1, false); // 扣血
                    }
                    // enemyControl.die();  
                }
                return;
            }
        }
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

