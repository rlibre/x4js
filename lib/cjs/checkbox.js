"use strict";
/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file checkbox.ts
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
exports.CheckBox = void 0;
const component_1 = require("./component");
const x4events_1 = require("./x4events");
const input_1 = require("./input");
const label_1 = require("./label");
/**
 * Standard CheckBox
 */
class CheckBox extends component_1.Component {
    constructor(props) {
        super(props);
        this.setDomEvent('focus', () => this._setFocus());
        this.mapPropEvents(props, 'change');
        if (props.slider) {
            this.addClass('slider');
        }
    }
    /** @ignore */
    render(props) {
        // checkbox
        var _a, _b, _c, _d, _e;
        let labelWidth = (_a = props.labelWidth) !== null && _a !== void 0 ? _a : -1;
        let uid = '__cb_' + this.uid;
        this.setTag('label');
        this.addClass('@hlayout');
        this.addClass((_b = props.align) !== null && _b !== void 0 ? _b : 'left');
        this.setContent([
            new input_1.Input({
                ref: 'input',
                type: 'checkbox',
                name: props.name,
                id: uid,
                tabIndex: props.tabIndex,
                value: (_c = props.value) !== null && _c !== void 0 ? _c : 'on',
                attrs: {
                    checked: props.checked ? '' : undefined
                },
                dom_events: {
                    change: this._change.bind(this),
                }
            }),
            props.slider ? new component_1.Component({ cls: '@slide-el' }) : null,
            new label_1.Label({
                text: (_d = props.text) !== null && _d !== void 0 ? _d : '',
                width: labelWidth < 0 ? undefined : labelWidth,
                flex: labelWidth < 0 ? -labelWidth : undefined,
                align: (_e = props.labelAlign) !== null && _e !== void 0 ? _e : 'left',
                style: {
                    order: props.align == 'right' ? -1 : 1,
                },
                attrs: {
                    "for": uid
                }
            }),
        ]);
    }
    /**
     * check state changed
     */
    _change() {
        this.emit('change', (0, x4events_1.EvChange)(this.check));
    }
    /**
     * focus gained/loosed
     */
    _setFocus() {
        let input = this.itemWithRef('input');
        input.focus();
    }
    /**
     * @return the checked value
     */
    get check() {
        if (this.dom) {
            let input = this.itemWithRef('input');
            let dom = input.dom;
            return dom.checked;
        }
        return this.m_props.checked;
    }
    /**
     * change the checked value
     * @param {boolean} ck new checked value
     */
    set check(ck) {
        if (this.dom) {
            let input = this.itemWithRef('input');
            const dom = input.dom;
            if (dom) {
                dom.checked = ck;
            }
        }
        this.m_props.checked = ck;
        //this._change();	// todo: is it needed when changed by code ? -> no
    }
    get text() {
        return this.itemWithRef('label').text;
    }
    set text(text) {
        this.itemWithRef('label').text = text;
    }
    /**
     * toggle the checkbox
     */
    toggle() {
        this.check = !this.check;
    }
}
exports.CheckBox = CheckBox;
