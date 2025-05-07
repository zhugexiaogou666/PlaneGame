
import { _decorator, Component, find, isValid, Node, CCFloat, v3, Vec3, Rect, view, UITransform, v2 } from "cc";
import { PlayerControl } from "./playerControl";
const { ccclass, property } = _decorator;

@ccclass("bullet2Control")
export class BulletControl2 extends Component {
    isDead: boolean = false;
    @property(CCFloat)
    rotateSpeed: number = 10;
    @property(CCFloat)
    destroyY: number = 800;

    private _currentTarget: Node | null = null;
    private _initialized: boolean = false;
    private _zeroNode: Node | null = null;
    private _playerControl: PlayerControl | null = null;
    private _playerNode: Node | null = null;
    private _enemyListLength: number = 0;

    @property({ type: Number })
    _curHurt: number = 1;  // 当前伤害

    // 获取当前伤害值
    public get curHurt() {
        return this._curHurt;
    }

    public set curHurt(value: number) {
        this._curHurt = value;
    }

    checkInView() {
        const screenSize = view.getVisibleSize();
        const screenRect = new Rect(
            -screenSize.width / 2,
            -screenSize.height / 2,
            screenSize.width,
            screenSize.height
        );

        const worldPos = this.node.getWorldPosition();
        this.initZeroNode();
        const uiTransform = this._zeroNode.getComponent(UITransform);
        if (!uiTransform) return;

        const screenPos = uiTransform.convertToNodeSpaceAR(worldPos);
        if (screenRect.contains(v2(screenPos.x, screenPos.y))) {
            return true;
        } else {
            return false;
        }
    }



    start() {
        this.initPlayerReference();
        this.scheduleOnce(() => {
            if (!this.checkInitialization()) return;
            this.initCurrentTarget();
        }, 0.1);
    }

    private initPlayerReference() {
        const playerNode = find("Canvas/player");
        if (playerNode && isValid(playerNode)) {
            this._playerControl = playerNode.getComponent(PlayerControl);
            this._playerNode = playerNode;
        }
    }

    private initZeroNode() {
        const zeroNode = find("Canvas/zeroNode");
        if (zeroNode && isValid(zeroNode)) {
            this._zeroNode = zeroNode;
        }
    }

    private checkInitialization(): boolean {
        if (!this._playerControl || !this._playerNode) {
            console.warn("初始化失败，销毁子弹");
            this.die();
            return false;
        }
        return true;
    }

    private initCurrentTarget() {
        const enemies = this._playerControl?.getVisibleEnemies() ?? [];
        this._currentTarget = this.updateEnemy(enemies);
        this._initialized = true;
    }

    private updateEnemy(enemyList: Node[] = []): Node | null {
        if (!this._playerControl || !this._playerNode) return null;

        if (enemyList.length === 0) return null;

        const playerWorldPos = this._playerNode.worldPosition;
        let closestEnemy: Node | null = null;
        let minSqrDistance = Number.MAX_VALUE;

        for (const enemy of enemyList) {
            if (!isValid(enemy)) continue;

            const enemyWorldPos = enemy.worldPosition;
            const dx = playerWorldPos.x - enemyWorldPos.x;
            const dy = playerWorldPos.y - enemyWorldPos.y;
            const sqrDistance = dx * dx + dy * dy;

            if (sqrDistance < minSqrDistance) {
                minSqrDistance = sqrDistance;
                closestEnemy = enemy;
            }
        }

        return closestEnemy;
    }


    update(deltaTime: number) {
        if (this.isDead) return;
        const enemyList = this._playerControl.getVisibleEnemies() ?? [];
        this._enemyListLength = enemyList.length;
        const isInView = this.checkInView();
        if (!isInView) {
            this.die();
            return;
        }
        if (this._enemyListLength > 0) {
            let position = this.node.position;
            let targetPos = new Vec3(0, 0, 0);
            if (isValid(this._currentTarget)) {
                targetPos = this.updateEnemy([this._currentTarget])?.getPosition();
            } else {
                const newEnemy = this.updateEnemy(enemyList);
                targetPos = newEnemy?.getPosition();
                this._currentTarget = newEnemy;
            }

            let dir = targetPos.subtract(position).normalize();
            this.node.angle = Math.atan2(-dir.y, -dir.x) * 90 / Math.PI;
            this.node.setPosition(position.x + dir.x * 600 * deltaTime, position.y + dir.y * 600 * deltaTime, position.z);
        } else {
            const { x, y } = this.node.getPosition();
            const moveY = y + 600 * deltaTime;
            this.node.setPosition(x, moveY);
            if (moveY > this.destroyY) {
                this.node.destroy();
            }
        }

    }

    die() {
        if (this.isDead) return;
        this.isDead = true;
        setTimeout(() => {
            this.node?.destroy?.();
        }, this.rotateSpeed);
    }
}
