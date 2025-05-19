import { _decorator, Collider2D } from "cc";
import { ICollisionHandler } from "../ICollisionHandler";
import { EnemyControl } from "../../ememy0Control";
import { BulletControl } from "../../bulletControl";
import { BulletControl2 } from "../../bullet2Control";

const { ccclass, property } = _decorator;
@ccclass("BulletEnemyHandler")
export class BulletEnemyHandler implements ICollisionHandler {
    handleCollision(
        bulletCollider: Collider2D,
        enemyCollider: Collider2D,
        context?: { updateScore: () => void } // 接收上下文
    ) {
        const enemyControl = enemyCollider.getComponent(EnemyControl);
        const bulletControl = bulletCollider.getComponent(BulletControl);

        if (enemyControl && bulletControl) {
            const bulletHit = bulletControl.curHurt;
            enemyControl.playHit(
                bulletHit,
                context?.updateScore // 传递分数更新回调
            );
            bulletControl.die();
            return;
        }
    }
}

@ccclass("Bullet2EnemyHandler")
export class Bullet2EnemyHandler implements ICollisionHandler {
    handleCollision(
        bulletCollider: Collider2D,
        enemyCollider: Collider2D,
        context?: { updateScore: () => void } // 接收上下文
    ) {
        const enemyControl = enemyCollider.getComponent(EnemyControl);
        const bullet2Control = bulletCollider.getComponent(BulletControl2);

        if (enemyControl && bullet2Control) {
            const bulletHit = bullet2Control.curHurt;
            enemyControl.playHit(
                bulletHit,
                context?.updateScore // 传递分数更新回调
            );
            bullet2Control.die();
            return;
        }
    }
}
