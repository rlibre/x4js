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
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _BaseComponent_m_timers;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseComponent = void 0;
const x4events_1 = require("./x4events");
/**
 * BaseComponent class
 */
class BaseComponent extends x4events_1.EventSource {
    constructor(props) {
        super();
        _BaseComponent_m_timers.set(this, void 0);
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
        if (!__classPrivateFieldGet(this, _BaseComponent_m_timers, "f")) {
            __classPrivateFieldSet(this, _BaseComponent_m_timers, new Map(), "f");
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
        __classPrivateFieldGet(this, _BaseComponent_m_timers, "f").set(name, () => { (repeat ? clearInterval : clearTimeout)(id); });
    }
    /**
     * stop the given timer
     * @param name
     */
    stopTimer(name) {
        const clear = __classPrivateFieldGet(this, _BaseComponent_m_timers, "f").get(name);
        if (clear) {
            clear();
        }
    }
    /**
     * stop all timers
     */
    disposeTimers() {
        var _a;
        (_a = __classPrivateFieldGet(this, _BaseComponent_m_timers, "f")) === null || _a === void 0 ? void 0 : _a.forEach(v => v());
        __classPrivateFieldSet(this, _BaseComponent_m_timers, undefined, "f");
    }
    /**
     *
     * @param callback
     * @param timeout
     */
    singleShot(callback, timeout = 0) {
        setTimeout(callback, timeout);
    }
    /**
     *
     * @param props
     * @param elements
     */
    mapPropEvents(props, ...elements) {
        elements.forEach(name => {
            const n = name;
            if (props[n]) {
                this._on(n, props[n]);
            }
        });
    }
}
exports.BaseComponent = BaseComponent;
_BaseComponent_m_timers = new WeakMap();
