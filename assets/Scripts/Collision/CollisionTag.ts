// assets/scripts/CollisionTag.ts
import { _decorator, Component, Enum } from 'cc';
import { ECollisionLayer } from './CollisionLayers';
const { ccclass, property } = _decorator;

@ccclass('CollisionTag')
export class CollisionTag extends Component {
    @property({ 
        type: Enum(ECollisionLayer),
        tooltip: '设置该节点的碰撞层级' 
    })
    public layer: ECollisionLayer = ECollisionLayer.DEFAULT;

    @property({
        tooltip: '是否需要在碰撞时触发物理效果'
    })
    public enablePhysics: boolean = true;
}