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
* @license
* Copyright (c) 2019-2021 R-libre ingenierie
*
* This program is free software; you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation; either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
**/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rating = void 0;
const component_1 = require("./component");
const layout_1 = require("./layout");
const input_1 = require("./input");
const x4_events_1 = require("./x4_events");
class Rating extends layout_1.HLayout {
    m_els;
    m_input;
    constructor(props) {
        super(props);
        props.steps = props.steps ?? 5;
    }
    render(props) {
        let shape = props.shape ?? 'star';
        let value = props.value ?? 0;
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
            let comp = component_1.Component.getElement(el);
            comp.setClass('checked', on);
            if (el == ev.target) {
                this.m_input.value = comp.getData('value');
                on = false;
            }
        }
        this.emit('change', (0, x4_events_1.EvChange)(this.m_props.value));
    }
}
exports.Rating = Rating;
