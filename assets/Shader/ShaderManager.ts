/**
 * shader effect 的枚举
 */
export enum ShaderEffectType {
    /** 图片中间挖圆形的透明洞 */
    ShockWave = 1,
    SimpleUV = 2,
}

/**
 * 枚举对应的 effect 的name，为啥需要这个呢，因为 ShaderEffectType 是string的话。cc.enum 无法在界面上显示出来
 */
const ShaderEffectType2Name = {
    1: "ShockWave",
    2: "SimpleUV",
}

/**
 * 主要管理shader的加载
 */
export class ShaderManager {
    static effects: { [key: string]: cc.EffectAsset } = {}

    /**
     * 通过 ShaderEffectType 获得 effect asset
     * @param type 
     */
    static GetEffectNameByType(type: ShaderEffectType): string {
        return ShaderEffectType2Name[type]
    }

    /**
     * 通过 ShaderEffectType 获得 effect asset
     * @param type 
     */
    static GetEffectByType(type: ShaderEffectType): cc.EffectAsset {
        return ShaderManager.effects[ShaderEffectType2Name[type]]
    }
}

/**
 * 当引擎初始化，加载shader并建立索引
 */
cc.game.on(cc.game.EVENT_ENGINE_INITED, () => {
    cc.dynamicAtlasManager.enabled = false;
    cc.loader.loadResDir('shader', cc.EffectAsset, (error, res) => {
        ShaderManager.effects = {}
        res.forEach((item) => {
            ShaderManager.effects[item._name] = item
        })
    });
})