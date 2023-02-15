"use strict";
/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file rating.ts
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
exports.Rating = void 0;
const component_1 = require("./component");
const layout_1 = require("./layout");
const input_1 = require("./input");
const x4events_1 = require("./x4events");
class Rating extends layout_1.HLayout {
    constructor(props) {
        var _a;
        super(props);
        props.steps = (_a = props.steps) !== null && _a !== void 0 ? _a : 5;
    }
    render(props) {
        var _a, _b;
        let shape = (_a = props.shape) !== null && _a !== void 0 ? _a : 'star';
        let value = (_b = props.value) !== null && _b !== void 0 ? _b : 0;
        this.m_input = new input_1.Input({
            cls: '@hidden',
            name: props.name,
            value: '' + value
        });
        this.addClass(shape);
        this.setDomEvent('click', (e) => this._onclick(e));
        this.m_els = [];
        for (let i = 0; i < props.steps; i++) {
            let cls = 'item';
            if (i + 1 <= value) {
                cls += ' checked';
            }
            let c = new component_1.Component({
                tag: 'option',
                cls,
                data: { value: i + 1 }
            });
            this.m_els.push(c);
        }
        this.m_els.push(this.m_input);
        this.setContent(this.m_els);
    }
    getValue() {
        var _a;
        return (_a = this.m_props.value) !== null && _a !== void 0 ? _a : 0;
    }
    set value(v) {
        this.m_props.value = v;
        for (let c = 0; c < this.m_props.steps; c++) {
            this.m_els[c].setClass('checked', this.m_els[c].getData('value') <= v);
        }
        this.m_input.value = '' + this.m_props.value;
    }
    set steps(n) {
        this.m_props.steps = n;
        this.update();
    }
    set shape(shape) {
        this.removeClass(this.m_props.shape);
        this.m_props.shape = shape;
        this.addClass(this.m_props.shape);
    }
    _onclick(ev) {
        let on = true;
        for (let el = this.dom.firstChild; el; el = el.nextSibling) {
            let comp = component_1.Component.getElement(el);
            comp.setClass('checked', on);
            if (el == ev.target) {
                this.m_input.value = comp.getData('value');
                on = false;
            }
        }
        this.emit('change', (0, x4events_1.EvChange)(this.m_props.value));
    }
}
exports.Rating = Rating;
