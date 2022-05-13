"use strict";
/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file textarea.ts
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
exports.TextArea = void 0;
const component_1 = require("./component");
const x4_events_1 = require("./x4_events");
const tools_1 = require("./tools");
class TextArea extends component_1.Component {
    constructor(props) {
        super(props);
        this.mapPropEvents(props, 'change');
    }
    /** @ignore */
    render(props) {
        props.text = props.text ?? '';
        this.setAttribute('tabindex', props.tabIndex ?? 0);
        if (props.spellcheck === false) {
            this.setAttribute('spellcheck', 'false');
        }
        if (props.readOnly !== undefined) {
            this.setAttribute('readonly', props.readOnly);
        }
        if (props.rows) {
            this.setAttribute('rows', props.rows);
        }
        if (props.placeHolder) {
            this.setAttribute('placeholder', props.placeHolder);
        }
        if (props.autoFocus) {
            this.setAttribute('autofocus', props.autoFocus);
        }
        if (props.name) {
            this.setAttribute('name', props.name);
        }
        if (props.autoGrow) {
            this.setProp('autoGrow', true);
            this.setAttribute('rows', this._calcHeight(props.text));
            this.setDomEvent('keydown', () => {
                (0, tools_1.asap)(() => this._updateHeight());
            });
        }
        // avoid going to next element on enter
        this.setDomEvent('keydown', (e) => {
            e.stopPropagation();
        });
        this.setDomEvent('input', () => this._change());
        this.setProp('tag', 'textarea');
    }
    _change() {
        this.emit('change', (0, x4_events_1.EvChange)(this.value));
    }
    componentCreated() {
        this.value = this.m_props.text;
    }
    get value() {
        if (this.dom) {
            return this.dom.value;
        }
        return this.m_props.text;
    }
    set value(t) {
        this.m_props.text = t ?? '';
        if (this.dom) {
            this.dom.value = this.m_props.text;
            if (this.m_props.autoGrow) {
                this.setAttribute('rows', this._calcHeight(this.m_props.text));
            }
        }
    }
    _calcHeight(text) {
        return 1 + (text.match(/\n/g) || []).length;
    }
    _updateHeight() {
        const text = this.value;
        const lines = this._calcHeight(text);
        if (this.getData('lines') != lines) {
            this.setAttribute('rows', lines);
            this.setData('lines', lines);
        }
    }
    /**
     * insert text at cursor position
     */
    insertText(text) {
        if (this.dom) {
            let dom = this.dom;
            let start = dom.selectionStart;
            dom.setRangeText(text);
            dom.selectionStart = start;
            dom.selectionEnd = start + text.length;
        }
    }
    getStoreValue() {
        return this.value;
    }
    setStoreValue(value) {
        this.value = value;
    }
}
exports.TextArea = TextArea;
