/**
 * 该类的作用是动态修改 sprite 的 shader,编辑器可运行
 * 如果是静态的话当然建议直接创建材质拖上去更好一些
 */
const { ccclass, property, executeInEditMode } = cc._decorator;

import { ShaderEffectType, ShaderManager } from "./ShaderManager";

/** shader 属性类，简单属性 */
@ccclass('ShaderFloatProperty')
export class ShaderFloatProperty {
    @property({ readonly: true })
    key = '';
    @property(cc.Float)
    value = 0.0;
};

/** shader 
 * 属性类，图片属性，sprite 上的图片就不用设置了，这里是设置额外的图片
 */
@ccclass('ShaderTexProperty')
export class ShaderTexProperty {
    @property({ readonly: true })
    key = '';
    @property({ type: cc.Texture2D })
    value: cc.Texture2D = null;
};

/** shader 基类，编辑器下可运行 
 *  可以这样设置 属性 this._material.effect.setProperty('iTime', start);
 */
@ccclass
@executeInEditMode
export default class ShaderBase extends cc.Component {
    /** 选择自己使用的shader */
    @property({ type: cc.Enum(ShaderEffectType) })
    effect_type = 0
    @property({ type: cc.Enum(ShaderEffectType) })
    get effectType() {
        return this.effect_type;
    }
    set effectType(value) {
        if (this.effect_type === value) {
            return;
        }
        this.effect_type = value;
        this.ApplyEffect();
    }

    /** shader的一些基本的属性 */
    @property({ type: [ShaderFloatProperty] }) // 这个这样写是为了保存编辑器界面设置的属性，没有这个是不会保存该属性的，这东西会被隐藏
    _float_props: ShaderFloatProperty[] = [];
    @property({ type: [ShaderFloatProperty] }) // 这个是为了在编辑器界面，修改的数值实时生效。
    get floatProps(): ShaderFloatProperty[] {
        return this._float_props;
    }
    set floatProps(value: ShaderFloatProperty[]) {
        this._float_props = value;
        this.ApplyEffect();
    }

    /** shader的一些基本的属性 */
    @property({ type: [ShaderTexProperty] }) // 这个这样写是为了保存编辑器界面设置的属性，没有这个是不会保存该属性的，这东西会被隐藏
    _tex_props: ShaderTexProperty[] = [];
    @property({ type: [ShaderTexProperty] }) // 这个是为了在编辑器界面，修改的数值实时生效。
    get texProps(): ShaderTexProperty[] {
        return this._tex_props;
    }
    set texProps(value: ShaderTexProperty[]) {
        this._tex_props = value;
        this.ApplyEffect();
    }

    @property({ tooltip: "该 shader 在运行时是否自动生效" })
    auto_effect: boolean = true;

    /** 材质对象 */
    protected _material: cc.Material = null;

    start() {
        if (CC_EDITOR) {
            // @ts-ignore 当 props 的数量是0的话不显示
            cc.Class.Attr.setClassAttr(ShaderBase, 'effect_type', 'visible', false);
            // @ts-ignore 当 props 的数量是0的话不显示
            cc.Class.Attr.setClassAttr(ShaderBase, '_float_props', 'visible', false);
            // @ts-ignore 当 props 的数量是0的话不显示
            cc.Class.Attr.setClassAttr(ShaderBase, '_tex_props', 'visible', false);
            // 给一个加载的时间
            setTimeout(() => { this.ApplyEffect(); }, 1000);
        } else {
            if (this.auto_effect) {
                this.ApplyEffect();
            }
        }
    }

    update(dt: number) { }

    /**
     * 将图片搞成 normal
     */
    public ApplyNormal() {
        let sprite = this.node.getComponent(cc.Sprite);
        if (!sprite || !cc.isValid(sprite, true)) return
        let material = cc.Material.getBuiltinMaterial('2d-sprite', sprite);
        material.define('USE_TEXTURE', true);
        sprite.setMaterial(0, material);
    }

    /**
     * 将设置的材质生效
     */
    public ApplyEffect() {
        // 获取精灵组件
        let sprite = this.node.getComponent(cc.Sprite);
        if (!sprite) {
            return;
        }
        // 获取对应的 effect
        let effectAsset = ShaderManager.GetEffectByType(this.effect_type)
        if (!effectAsset) {
            return;
        }
        if (this._material &&
            this._material.name === ShaderManager.GetEffectNameByType(this.effect_type) &&
            this._material.name === sprite.sharedMaterials[0].name) {
            return
        }
        if (!this._material || this._material.name != ShaderManager.GetEffectNameByType(this.effect_type)) {
            // 实例化一个材质对象
            let material = new cc.Material();

            // 为材质设置effect，也是就绑定Shader了
            material.effectAsset = effectAsset;
            material.name = effectAsset.name;
            this._material = material;
        }

        // 将材质绑定到精灵组件上,精灵可以绑定多个材质
        // 这里我们替换0号默认材质,否则我还不知道怎么设置让某个材质生效
        sprite.setMaterial(0, this._material);
        // 为啥呢？
        this._material = sprite.getMaterial(0);
        this.setProperty(effectAsset);
        // 发送事件
        this.node.emit('effect-changed', this, this._material);
    }

    /** 更新材质的方法 */
    private setProperty(effectAsset) {
        if (CC_EDITOR) {
            let oldFloatProps = this._float_props;
            let oldTexProps = this._tex_props;
            this._float_props = [];
            this._tex_props = [];

            // 获得 effect 上 所有的 参数的 key 
            let keys = Object.keys(effectAsset._effect._properties);

            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let prop = effectAsset._effect._properties[key];
                let type = prop.type;
                // 数字类型
                if (prop !== null && (type === 4 || type === 13)) {
                    let value: number = prop.value;
                    let oldItem = oldFloatProps.find(item => item.key === key);
                    if (oldItem) {
                        value = oldItem.value;
                    }
                    let sp = new ShaderFloatProperty()
                    sp.key = key;
                    sp.value = typeof (value) === 'object' ? value[0] : value;
                    this._float_props.push(sp);
                }
                // 图片类型，默认texture是自己的 sprite 的图片，就不在参数这里显示了。
                else if (prop !== null && type === 29 && key != "texture") {
                    let value = prop.value
                    let oldItem = oldTexProps.find(item => item.key === key);
                    if (oldItem) {
                        value = oldItem.value;
                    }
                    let sp = new ShaderTexProperty()
                    sp.key = key;
                    sp.value = value;
                    this._tex_props.push(sp);
                }
            }
            // 设置时间
            let shaderTimer = this.getComponent('ShaderTime');
            if (shaderTimer) {
                shaderTimer.max = shaderTimer.max;
            }
        }
        // 设置基本属性
        if (this._float_props.length) {
            this._float_props.forEach(
                (item) => {
                    if (item.key) {
                        this._material.setProperty(item.key, item.value || 0)
                    }
                }
            );
        }
        // 设置图片属性
        if (this._tex_props.length) {
            this._tex_props.forEach(
                (item) => {
                    if (item.key && item.key != "texture") {
                        this._material.setProperty(item.key, item.value)
                    }
                }
            );
        }
    }
}