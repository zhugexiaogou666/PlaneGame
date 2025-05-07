
import { _decorator, Component } from "cc";
const { ccclass, property } = _decorator;

@ccclass("bulletControl")
export class BulletControl extends Component {
    isDead: boolean = false;
    start() { }


    @property({ type: Number })
    _curHurt: number = 2;  // 当前伤害

    public get curHurt() {
        return this._curHurt;
    }

    public set curHurt(value: number) {
        this._curHurt = value;
    }
    // 更新函数，每帧调用一次
    update(deltaTime: number) {
        // 如果对象已经死亡，则直接返回
        if (this.isDead) return;
        // 获取对象当前位置
        const { x, y } = this.node.getPosition();
        // 计算对象下一帧的y坐标
        const moveY = y + 500 * deltaTime;
        // 设置对象下一帧的位置
        this.node.setPosition(x, moveY);
        // 如果对象下一帧的y坐标大于800，则销毁对象
        if (moveY > 400) {
            this.node.destroy();
        }
    }


    die() {
        if (this.isDead) return;
        this.isDead = true;
        setTimeout(() => {
            this.node?.destroy?.();
        }, 10);
    }
}
