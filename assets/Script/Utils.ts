export class Utils {
    /** 设置引擎的时间缩放速度 */
    static engine_time_scale: number = 1
    static SetEngineTimeScale(scale: number) {
        if (scale < 0)
            return

        let _deltaTime: number = 0
        Utils.engine_time_scale = scale
        Object.defineProperty(cc.director, "_deltaTime", {
            get: () => {
                let value = _deltaTime * scale
                return value
            },
            set: (value) => {
                _deltaTime = value
            },
            enumerable: true,
            configurable: true
        });
    }
}