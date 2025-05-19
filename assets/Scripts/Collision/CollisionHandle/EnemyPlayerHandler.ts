import { _decorator, Collider2D } from "cc";
import { ICollisionHandler } from "../ICollisionHandler";
import { EnemyControl } from "../../ememy0Control";
import { PlayerControl } from "../../playerControl";


const { ccclass, property } = _decorator;
@ccclass("EnemyPlayerHandler")
export class EnemyPlayerHandler implements ICollisionHandler {
    handleCollision(playerCollider: Collider2D, enemyCollider: Collider2D, context?: {
        onChangeBlood: (value: number, isAdd: boolean) => void,
        isInvincible: () => boolean
    }) {
        const enemy = enemyCollider.getComponent(EnemyControl);
        const playerControl = playerCollider.getComponent(PlayerControl);

        if (enemy && playerControl) {
            playerControl.hit();
            if (context && !context.isInvincible()) {
                context.onChangeBlood(1, false); // 扣血逻辑
            }
            return;
        }
    }
}
