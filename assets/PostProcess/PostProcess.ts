const { ccclass, property } = cc._decorator;

@ccclass
export default class PostProcess extends cc.Component {
    @property({ type: cc.Camera, tooltip: "渲染的相机。" })
    camera: cc.Camera = null;
    @property({ type: cc.Node, tooltip: "场景中的动的东西。" })
    coco: cc.Node = null;
    @property({ type: cc.Node, tooltip: "场景中的动的东西。" })
    coco1: cc.Node = null;
    @property({ type: cc.Node, tooltip: "需要渲染的内容的跟节点。" })
    node_context: cc.Node = null;
    @property({ type: cc.Sprite, tooltip: "处理之后的图片。" })
    spr_effect: cc.Sprite = null;

    private renderTexture: cc.RenderTexture = null

    start() {
        this.renderTexture = new cc.RenderTexture()
        this.renderTexture.initWithSize(cc.winSize.width, cc.winSize.height)

        this.spr_effect.spriteFrame = new cc.SpriteFrame(this.renderTexture)
    }

    update() {
        this.coco.angle += 1
        this.coco1.angle -= 1

        this.camera.targetTexture = this.renderTexture
        this.camera.render(this.node_context)
        this.camera.targetTexture = null
        // this.spr_effect.sharedMaterials[0].effect.setProperty('texture', this.renderTexture);
    }
}
