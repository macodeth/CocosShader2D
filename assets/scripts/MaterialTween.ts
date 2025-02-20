import { _decorator, Component, Material, UIRenderer } from "cc";

const {ccclass, property, menu} = _decorator;

@ccclass
@menu ("Support/MaterialTween")
export class MaterialTween extends Component {
    _material: Material = null;
    _lstData = new Map<string, TweenData>()
    getMaterial () {
        if (this._material == null) {
            this._material = this.node.getComponent(UIRenderer).material
        }
        return this._material;
    }
    set (property: string, value: number) {
        this.getMaterial().setProperty(property, value)
    }
    animate (property: string, duration: number, from: number, to: number, ease: Function = null, cb: Function = null) {
        console.log(`animate ${property} in ${duration}s from ${from} to ${to}`)
        let mat = this.getMaterial()
        if (!this._lstData.has(property))
            this._lstData.set(property, new TweenData(mat.getProperty(property, 0) as number))
        this._lstData.get(property).set(from, duration, to - from, ease, cb)
        mat.setProperty(property, from);
    }
    reset (property: string) {
        this._lstData.get(property).reset()
    }
    resetAll () {
        this._lstData.forEach((value, key) => {
            value.reset()
            this.getMaterial().setProperty(key, value.init)
        })
    }
    update (dt: number) {
        this._lstData.forEach((data, key) => {
            if (data.runAnimation) {
                data.totalTime += dt;
                let t = Math.min(1, data.totalTime / data.duration)
                if (data.ease)
                    t = data.ease(t)
                this.getMaterial().setProperty(key, t * data.delta + data.from)
                if (t >= 1) {
                    data.runAnimation = false;
                    if (data.cb) {
                        data.cb()
                    }
                }
            }
        })
    }
}

class TweenData {
    runAnimation: boolean
    totalTime: number
    duration: number
    delta: number
    ease: Function
    init: number
    cb: Function
    from: number
    constructor (init: number) {
        this.init = init;
    }
    set (from: number, duration: number, delta: number, ease: Function, cb: Function) {
        this.from = from;
        this.runAnimation = true;
        this.totalTime = 0;
        this.duration = duration;
        this.delta = delta;
        this.ease = ease;
        this.cb = cb;
    }
    reset () {
        this.from = 0
        this.runAnimation = false;
        this.totalTime = 0;
        this.duration = 0;
        this.delta = 0;
        this.ease = null;
        this.cb = null;
    }
}