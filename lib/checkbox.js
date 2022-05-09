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
exports.CheckBox = void 0;
const component_1 = require("./component");
const x4_events_1 = require("./x4_events");
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
    }
    /** @ignore */
    render(props) {
        // checkbox
        let labelWidth = props.labelWidth ?? -1;
        let uid = '__cb_' + this.uid;
        this.addClass('@hlayout');
        this.addClass(props.align ?? 'left');
        this.setProp('tag', 'label');
        this.setContent([
            new input_1.Input({
                ref: 'input',
                type: 'checkbox',
                name: props.name,
                id: uid,
                tabIndex: props.tabIndex,
                value: props.value ?? 'on',
                attrs: {
                    checked: props.checked ? '' : undefined
                },
                dom_events: {
                    change: this._change.bind(this),
                }
            }),
            new label_1.Label({
                text: props.text ?? '',
                width: labelWidth < 0 ? undefined : labelWidth,
                flex: labelWidth < 0 ? -labelWidth : undefined,
                align: props.labelAlign ?? 'left',
                style: {
                    order: props.align == 'right' ? -1 : 1,
                },
                attrs: {
                    "for": uid
                }
            })
        ]);
    }
    /**
     * check state changed
     */
    _change() {
        this.emit('change', (0, x4_events_1.EvChange)(this.check));
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
