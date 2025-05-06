import { _decorator, Component, EventTouch, Node, Prefab, v3, instantiate, view, Rect, UITransform, v2, isValid, Vec3 } from "cc";
import { EnemyManager } from "./EnemyManager";
import { HitFlash } from "./HitFlash";
import { GameManager } from "./GameManager";
const { ccclass, property } = _decorator;

@ccclass("PlayerControl")
export class PlayerControl extends Component {
    @property(Prefab)
    bullet: Prefab = null;
    @property(Prefab)
    bullet2: Prefab = null;
    @property({ type: Node, tooltip: "同级敌人管理器" })
    enemyManagerNode: Node = null;
    @property({ type: GameManager })
    gameManager: GameManager = null;

    private hitFlash: HitFlash = null;

    public getVisibleEnemies(): Node[] {
        const visibleEnemies = [];
        const enemyManager = this.enemyManagerNode.getComponent(EnemyManager);
        const screenSize = view.getVisibleSize();
        const screenRect = new Rect(
            -screenSize.width / 2,
            -screenSize.height / 2,
            screenSize.width,
            screenSize.height + 40
        );


        enemyManager.activeEnemies.forEach(enemy => {
            // 增加有效性验证
            if (!isValid(enemy) || !enemy.parent) return;

            try {
                const worldPos = enemy.getWorldPosition();
                const uiTransform = enemy.parent.getComponent(UITransform);
                if (!uiTransform) return;

                const screenPos = uiTransform.convertToNodeSpaceAR(worldPos);
                if (screenRect.contains(v2(screenPos.x, screenPos.y))) {
                    visibleEnemies.push(enemy);
                }
            } catch (e) {
                console.error("节点异常:", enemy.name, e);
            }
        });

        return visibleEnemies;
    }

    hit() {
        if (this.hitFlash) {
            this.hitFlash.showHitFlash();
        }
    }
    reset() {
        this.gameManager.stepsLabel.string = "0";
    }

    onTouchMove(e: EventTouch) {
        const { x, y } = e.getUILocation();
        this.node.setWorldPosition(v3(x, y));
    }

    setInputActive(active: boolean) {
        if (active) {
            this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.schedule(this.scheduleBullet, 0.2);
            this.schedule(this.scheduleSpecialBullet, 0.5);
        } else {
            this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.unschedule(this.scheduleBullet);
            this.unschedule(this.scheduleSpecialBullet);
        }
    }
    
    private scheduleBullet() {
        const { x, y } = this.node.getPosition();
        const node = instantiate(this.bullet);
        node.setParent(this.node.parent);
        node.setPosition(x, y + 70);
    }
    
    private scheduleSpecialBullet() {
        const { x, y } = this.node.getPosition();
        const curEnemy = this.getVisibleEnemies();
        if (curEnemy.length > 0) {
            const node2 = instantiate(this.bullet2);
            const node2x = instantiate(this.bullet2);
            node2x.setParent(this.node.parent);
            node2.setParent(this.node.parent);
            node2.setPosition(x - 32, y + 23);
            node2x.setPosition(x + 32, y + 23);
        }
    }
    // 开始函数
    start() {
        this.hitFlash = this.node.getComponent(HitFlash);
    }
}
