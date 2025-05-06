import { _decorator, Component, Label, Node, Vec3 } from 'cc';
import { PlayerControl } from './playerControl';
import { BgControl } from './bgControl';
import { EnemyManager } from './EnemyManager';
const { ccclass, property } = _decorator;

enum GameState {
    GS_INIT,
    GS_START,
    GS_PAUSE,
    GS_PLAYING,
    GS_END,
};

@ccclass('GameManager')
export class GameManager extends Component {
    @property({ type: Label })
    public stepsLabel: Label | null = null; // 计步器
    @property({ type: PlayerControl })
    public playerCtrl: PlayerControl | null = null; // 目标节点
    @property({ type: Node, tooltip: "同级敌人管理器" })
    enemyManagerNode: Node = null;
    @property({ type: BgControl })
    public BgCtrl: BgControl | null = null; // 目标节点
    @property({ type: Node })
    public startMenu: Node | null = null;
    start() {
        this.setCurState(GameState.GS_INIT); // 第一初始化要在 start 里面调用
    }

    init() {
        this.resetGame();
    }

    begin() {
        if (this.startMenu) {
            this.startMenu.active = false;
        }

        if (this.BgCtrl) {
            this.BgCtrl.onPhysics2D();
            this.BgCtrl._moveBG = true;
        }

        setTimeout(() => {
            if (this.playerCtrl) {
                this.playerCtrl.setInputActive(true);
            }
            const enemyManager = this.enemyManagerNode.getComponent(EnemyManager);
            if (enemyManager) {
                enemyManager.pushEnemy();
            }

        }, 0.1);

    }

    resetGame() {
        if (this.startMenu) {
            this.startMenu.active = true;
        }

        if (this.BgCtrl) {
            this.BgCtrl._moveBG = false;
        }


        if (this.playerCtrl) {
            this.playerCtrl.setInputActive(false);
            this.playerCtrl.node.setPosition(new Vec3(0, -313.715, 0));
            this.playerCtrl.reset();
        }
    }

    onStartButtonClicked() {
        this.setCurState(GameState.GS_PLAYING);
    }

    onPauseButtonClicked() {
        this.setCurState(GameState.GS_PAUSE);
    }

    onEndButtonClicked() {
        this.setCurState(GameState.GS_END);
    }

    setCurState(value: GameState) {
        switch (value) {
            case GameState.GS_INIT:
                this.init();
                break;
            case GameState.GS_PLAYING:
                this.begin();
                break;
            case GameState.GS_PAUSE:
                break;
            case GameState.GS_END:
                break;
        }
    }


    update(deltaTime: number) {

    }
}

