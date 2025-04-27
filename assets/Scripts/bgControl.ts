import { _decorator, Component, director, Node, PhysicsSystem2D, Contact2DType, Collider2D, Label } from "cc";
import { BulletControl } from "./bulletControl";
import { BulletControl2 } from "./bullet2Control";
import { PlayerControl } from "./playerControl";
import { EnemyControl } from "./ememy0Control";
const { ccclass, property } = _decorator;

@ccclass("bgControl")
export class BgControl extends Component {

    @property({ type: PlayerControl })
    public playerCtrl: PlayerControl | null = null; // 目标节点

    @property({ type: Label })
    private stepLabel: Label | null = null;

    onPhysics2D() {
        PhysicsSystem2D.instance.on(
            Contact2DType.BEGIN_CONTACT,
            this.onBeginContact,
            this
        );
    }
    start() { }

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
                if (enemyControl && bulletControl) {
                    enemyControl.die();
                    bulletControl.die();
                    this.stepLabel.string = (parseInt(this.stepLabel.string) + 1).toString();
                }
                return;
            }

            // 处理敌人与玩家碰撞
            if (enemy && player && enemy.tag === enemyTag && player.tag === playerTag) {
                const enemyControl = enemy.getComponent(EnemyControl);
                const playerControl = player.getComponent(PlayerControl);
                if (playerControl && enemyControl) {
                    playerControl.hit();
                    // enemyControl.die();  
                }
                return;
            }
        }
    }

    // 生命周期每帧调用函数
    update(deltaTime: number) {
        // 使用this.node.children获取当前节点下的子节点
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
}

