
const { ccclass, property, executeInEditMode } = cc._decorator;

/** 该类是可以在编辑器下运行，编辑器下调试shader */
@ccclass
@executeInEditMode
export default class ShaderTime extends cc.Component {
    private _material: cc.Material;

    @property
    _max: number = 65535;
    @property
    step: number = 0.01;
    @property
    get max(): number {
        return this._max;
    }
    set max(value) {
        this._max = value;
        if (!CC_EDITOR) {
            return;
        }
        let sprite = this.node.getComponent(cc.Sprite);
        if (sprite) {
            this._material = this.getComponent(cc.Sprite).sharedMaterials[0];
            //@ts-ignore
            if (this._material.effect._properties.iTime) {
                let material: any = sprite.sharedMaterials[0];
                material.effect.setProperty('iTime', value);
            }
        }
    }

    @property
    editer_can_update: boolean = false;

    private _start = 0;

    update(dt: number) {
        if (CC_EDITOR && !this.editer_can_update) {
            return;
        }
        this._material = this.node.getComponent(cc.Sprite).sharedMaterials[0];
        //@ts-ignore
        if (this.node.active && this._material && this._material.effect._properties.iTime) {
            this._setShaderTime(dt);
        }
    }

    private _setShaderTime(dt) {
        let start = this._start;
        if (start > this.max) start = 0;
        start += this.step * dt;
        //@ts-ignore
        this._material.effect.setProperty('iTime', start);

        this._start = start;
    }
}
