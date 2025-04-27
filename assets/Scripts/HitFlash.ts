import { _decorator, Component, Material, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HitFlash')
export class HitFlash extends Component {
    @property(Material)
    hitFlashMaterial: Material = null;
    oldFlashMaterial: Material = null;
    sprite: Sprite;
    start() {
        this.sprite = this.node.getComponent(Sprite);
        this.oldFlashMaterial = this.sprite.getSharedMaterial(0);
    }

    public showHitFlash() {
        this.sprite.setSharedMaterial(this.hitFlashMaterial, 0);
        this.scheduleOnce(() => {
            this.sprite.setSharedMaterial(this.oldFlashMaterial, 0);
        }, 0.1);
    }

    update(deltaTime: number) {

    }
}

