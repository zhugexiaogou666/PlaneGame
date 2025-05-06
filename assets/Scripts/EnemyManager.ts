import { _decorator, Component, instantiate, Node, Prefab, CCFloat } from "cc";
const { ccclass, property } = _decorator;

@ccclass("EnemyManager")
export class EnemyManager extends Component {
    @property(Prefab)
    enemy: Prefab;
    @property(CCFloat)
    internal: number = 5;
    @property(CCFloat)
    speed: number = 100;
    public activeEnemies: Node[] = [];

    tick: number = this.internal;

    pushEnemy() {
        this.schedule(() => {
            const node = instantiate(this.enemy);
            node.parent = this.node;
            node.setPosition(Math.random() * 320 - 160, 450);
            this.node.addChild(node);
            this.activeEnemies.push(node);
        }, 0.5);
    }

    start() {}

// 在 EnemyManager 中增加维护逻辑
public removeEnemy(node: Node) {
    const index = this.activeEnemies.findIndex(n => n === node);
    if (index > -1) {
        this.activeEnemies.splice(index, 1);
        node.parent = null;
        node.removeFromParent();
    }
}
    

    update(deltaTime: number) { }
}
