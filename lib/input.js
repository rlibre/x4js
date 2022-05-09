"use strict";
/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file input.ts
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
exports.Input = void 0;
const component_1 = require("./component");
/**
 * base class for elements implementing an input
 * CARE derived classes must set this.ui.input
 */
class Input extends component_1.Component {
    constructor(props) {
        super(props);
    }
    /** @ignore */
    render(props) {
        this.setProp('tag', 'input');
        this._setTabIndex(props.tabIndex);
        this.setAttributes({
            value: props.value,
            type: props.type || 'text',
            name: props.name,
            placeholder: props.placeHolder,
            autofocus: props.autoFocus,
            readonly: props.readOnly,
            autocomplete: 'new-password',
            tabindex: props.tabIndex,
            spellcheck: props.spellcheck === false ? 'false' : undefined,
            min: props.min,
            max: props.max,
            ...props.attrs
        });
        if (props.uppercase) {
            this.setStyleValue('textTransform', 'uppercase');
        }
    }
    getType() {
        return this.m_props.type;
    }
    /**
     * return the current editor value
     */
    get value() {
        if (this.dom) {
            this.m_props.value = this.dom.value;
        }
        if (this.m_props.uppercase) {
            let upper = this.m_props.value.toUpperCase(); // todo: locale ?
            if (this.dom && upper != this.m_props.value) {
                this.dom.value = upper; // update the input
            }
            this.m_props.value = upper;
        }
        return this.m_props.value;
    }
    /**
     * Change the editor value
     * @param value - new value to set
     */
    set value(value) {
        this.m_props.value = value;
        if (this.dom) {
            this.dom.value = value;
        }
    }
    getStoreValue() {
        if (this.m_props.value_hook) {
            return this.m_props.value_hook.get();
        }
        else {
            let type = this.getAttribute('type');
            if (type) {
                type = type.toLowerCase();
            }
            let value, dom = this.dom;
            if (type === "file") {
                value = [];
                let files = dom.files;
                for (let file = 0; file < files.length; file++) {
                    value.push(files[file].name);
                }
            }
            else if (type === 'checkbox') {
                if (dom.checked) {
                    value = 1;
                }
                else {
                    value = 0;
                }
            }
            else if (type === 'radio') {
                if (dom.checked) {
                    value = this.value;
                }
            }
            else if (type === 'date') {
                debugger;
            }
            else {
                value = this.value;
            }
            return value;
        }
    }
    setStoreValue(v) {
        if (this.m_props.value_hook) {
            return this.m_props.value_hook.set(v);
        }
        else {
            let type = this.getAttribute('type'), dom = this.dom;
            if (type) {
                type = type.toLowerCase();
            }
            if (type === 'checkbox') {
                let newval = v !== null && v !== '0' && v !== 0 && v !== false;
                if (newval !== dom.checked) {
                    dom.setAttribute('checked', '' + newval);
                    dom.dispatchEvent(new Event('change'));
                }
            }
            else {
                this.value = v;
            }
        }
    }
    set readOnly(ro) {
        this.setAttribute('readonly', ro);
    }
    /**
     * select all the text
     */
    selectAll() {
        this.dom.select();
    }
    /**
     * select a part of the text
     * @param start
     * @param length
     */
    select(start, length = 9999) {
        this.dom.setSelectionRange(start, start + length);
    }
    /**
     * get the selection as { start, length }
     */
    getSelection() {
        let idom = this.dom;
        return {
            start: idom.selectionStart,
            length: idom.selectionEnd - idom.selectionStart,
        };
    }
}
exports.Input = Input;
