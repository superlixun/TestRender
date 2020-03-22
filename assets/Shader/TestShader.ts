import { Utils } from "../Script/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TestShader extends cc.Component {
    start() {
        // 将引擎时间设置为2倍速，shader 的 cc_time 也会受这种方式的影响
        // Utils.SetEngineTimeScale(2)
    }
}
