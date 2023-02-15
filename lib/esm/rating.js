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
import { Component } from './component';
import { HLayout } from './layout';
import { Input } from './input';
import { EvChange } from './x4events';
export class Rating extends HLayout {
    m_els;
    m_input;
    constructor(props) {
        super(props);
        props.steps = props.steps ?? 5;
    }
    render(props) {
        let shape = props.shape ?? 'star';
        let value = props.value ?? 0;
        this.m_input = new Input({
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
            let c = new Component({
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
        return this.m_props.value ?? 0;
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
            let comp = Component.getElement(el);
            comp.setClass('checked', on);
            if (el == ev.target) {
                this.m_input.value = comp.getData('value');
                on = false;
            }
        }
        this.emit('change', EvChange(this.m_props.value));
    }
}
