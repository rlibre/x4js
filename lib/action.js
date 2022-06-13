"use strict";
/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file action.ts
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
**/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = exports.EvAction = void 0;
const x4events_1 = require("./x4events");
const base_component_1 = require("./base_component");
const x4js_1 = require("x4js");
function EvAction(source) {
    return (0, x4events_1.BasicEvent)({ source });
}
exports.EvAction = EvAction;
class Action extends base_component_1.BaseComponent {
    constructor(props) {
        super(props);
        this.mapPropEvents(props, "run");
    }
    get props() {
        return this.m_props;
    }
    set text(t) {
        this.m_props.text = t;
        this.emit("change", (0, x4js_1.EvChange)(this));
    }
    set icon(i) {
        this.m_props.icon = i;
        this.emit("change", (0, x4js_1.EvChange)(this));
    }
    fire() {
        this.emit("run", EvAction(this));
    }
}
exports.Action = Action;
