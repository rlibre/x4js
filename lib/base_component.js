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
*
* Copyright (c) 2019-2022 R-libre ingenierie
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
* of the Software, and to permit persons to whom the Software is furnished to do so,
* subject to the following conditions:
* The above copyright notice and this permission notice shall be included in all copies
* or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
* INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
* PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
* OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
* SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
**/
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseComponent = void 0;
const x4events_1 = require("./x4events");
/**
 * BaseComponent class
 */
class BaseComponent extends x4events_1.EventSource {
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
                this.emit('timer', (0, x4events_1.EvTimer)(name, tm));
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
