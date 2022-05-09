"use strict";
/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file base_component.ts
* @author Etienne Cochard
* @copyright (c) 2022 R-libre ingenierie, all rights reserved.
*
**/
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseComponent = void 0;
const x4_events_1 = require("./x4_events");
/**
 * BaseComponent class
 */
class BaseComponent extends x4_events_1.EventSource {
    m_props;
    #m_timers;
    constructor(props) {
        super();
        //this.m_props = { ...props };
        this.m_props = props;
        if (props.events) {
            this.listen(props.events);
        }
    }
    /**
     * start a new timer
     * @param name timer name
     * @param timeout time out in ms
     * @param repeat if true this is an auto repeat timer
     * @param callback if !null, the callback to call else a EvTimer is fired
     */
    startTimer(name, timeout, repeat = true, callback = null) {
        if (!this.#m_timers) {
            this.#m_timers = new Map();
        }
        else {
            this.stopTimer(name);
        }
        const id = (repeat ? setInterval : setTimeout)((tm) => {
            if (callback) {
                callback(name, tm);
            }
            else {
                this.emit('timer', (0, x4_events_1.EvTimer)(name, tm));
            }
        }, timeout);
        this.#m_timers.set(name, () => { (repeat ? clearInterval : clearTimeout)(id); });
    }
    /**
     * stop the given timer
     * @param name
     */
    stopTimer(name) {
        const clear = this.#m_timers.get(name);
        if (clear) {
            clear();
        }
    }
    /**
     * stop all timers
     */
    disposeTimers() {
        this.#m_timers?.forEach(v => v());
        this.#m_timers = undefined;
    }
    /**
     *
     * @param callback
     * @param timeout
     */
    singleShot(callback, timeout = 0) {
        setTimeout(callback, timeout);
    }
}
exports.BaseComponent = BaseComponent;
