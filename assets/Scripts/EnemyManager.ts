import { _decorator, Component, instantiate, Node, Prefab, CCFloat, Label } from "cc";
const { ccclass, property } = _decorator;

@ccclass("EnemyManager")
export class EnemyManager extends Component {
    @property(Prefab)
    enemy: Prefab;
    @property(Prefab)
    boss01: Prefab;
    @property(CCFloat)
    internal: number = 5;
    @property(CCFloat)
    speed: number = 100;
    public activeEnemies: Node[] = [];
    @property({ type: Label })
    private stepLabel: Label | null = null;
    tick: number = this.internal;

    private _isBossShow: boolean = false;
    private _isBossEntering: boolean = false;
    private _bossInstance: Node | null = null;
    private _bossTargetPosition = 310;
    @property(CCFloat)
    bossEnterSpeed: number = 200; 
    pushEnemy() {
        this.schedule(this.scheduleEnemy, 0.5);
    }


    private scheduleEnemy() {
        if (!this._isBossShow) {
            const node = instantiate(this.enemy);
            node.parent = this.node;
            node.setPosition(Math.random() * 320 - 160, 450);
            this.node.addChild(node);
            this.activeEnemies.push(node);
        }
    }

    private initBoss() {
        if (this._isBossShow) return;

        this._isBossShow = true;
        this._isBossEntering = true;
        
        // 创建 Boss 实例并设置初始位置（屏幕外上方）
        this._bossInstance = instantiate(this.boss01);
        this._bossInstance.parent = this.node;
        this._bossInstance.setPosition(0, 700); // 初始在屏幕外
        this.node.addChild(this._bossInstance);
    }


    start() { }

    clearEnemies() {
        this.unschedule(this.scheduleEnemy);
        this.activeEnemies.forEach(enemy => {
            enemy.destroy();
        })
        this.activeEnemies = [];
    }

    // 在 EnemyManager 中增加维护逻辑
    public removeEnemy(node: Node) {
        const index = this.activeEnemies.findIndex(n => n === node);
        if (index > -1) {
            this.activeEnemies.splice(index, 1);
            node.parent = null;
            node.removeFromParent();
        }
    }


    update(deltaTime: number) { 
        // 原有逻辑保持不变...
        if (Number(this.stepLabel.string) >= 5 && !this._isBossShow) {
            this.initBoss();
        }

        // Boss 入场动画
        if (this._isBossEntering && this._bossInstance) {
            const targetY = this._bossTargetPosition; // 最终停留位置
            const currentPos = this._bossInstance.position;

            const newY = currentPos.y - this.bossEnterSpeed * deltaTime;
            this._bossInstance.setPosition(currentPos.x, newY);
            if (newY <= targetY) {
                this._isBossEntering = false;
                this._bossInstance.setPosition(currentPos.x, targetY);
                this.onBossEnterComplete();
            }
        }
    }

    private onBossEnterComplete() {
        console.log("Boss 入场完成，开始攻击!");
    }

}
