"use strict";
/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file form.ts
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
exports.Form = void 0;
const component_1 = require("./component");
const layout_1 = require("./layout");
const button_1 = require("./button");
const textedit_1 = require("./textedit");
const request_1 = require("./request");
const dialog_1 = require("./dialog");
const i18n_1 = require("./i18n");
/**
 *
 */
class Form extends layout_1.VLayout {
    constructor(props) {
        let content = props.content;
        props.content = null;
        // save height, because real form height is 'height' PLUS button bar height
        let height = props.height;
        props.height = undefined;
        super(props);
        this.setTag(props.disableSuggestions ? 'section' : 'form');
        this.mapPropEvents(props, 'btnClick');
        this.updateContent(content, props.buttons, height);
        this.m_dirty = false;
        this.m_watchChanges = false;
    }
    /**
     * returns the container object
     */
    get container() {
        return this.m_container;
    }
    /**
     *
     */
    componentCreated() {
        super.componentCreated();
        if (this.m_watchChanges) {
            this.watchChanges();
        }
    }
    /**
     *
     */
    updateContent(items, buttons, height = 0) {
        if (height) {
            // keep height for next time
            this.m_height = height;
        }
        this._makeButtons(buttons);
        let content = [
            this.m_container = new layout_1.VLayout({
                cls: 'container',
                height: this.m_height,
                content: items
            }),
            this.m_buttons,
        ];
        super.setContent(content);
    }
    /**
     *
     * @param els
     * @param refreshAll
     */
    setContent(els, refreshAll = true) {
        this.m_container.setContent(els, refreshAll);
    }
    /**
     *
     * @param buttons
     */
    setButtons(buttons) {
        this._makeButtons(buttons);
    }
    /**
     * enable a button by it's name
     */
    enableButton(name, enable = true) {
        let button = this.getButton(name);
        if (button) {
            button.enable(enable);
        }
    }
    /**
     * return a button by it's name
     * @param name
     */
    getButton(name) {
        var _a;
        let button = (_a = this.m_buttons) === null || _a === void 0 ? void 0 : _a.itemWithRef('@' + name);
        return button;
    }
    /**
     *
     */
    _makeButtons(buttons) {
        if (!this.m_buttons) {
            this.m_buttons = new layout_1.HLayout({
                cls: 'footer',
                ref: 'buttons',
            });
        }
        let btns = [];
        if (buttons) {
            for (let b of buttons) {
                if (b instanceof component_1.Component) {
                    btns.push(b);
                }
                else {
                    switch (b) {
                        case 'ok': {
                            btns.push(new button_1.Button({ ref: '@' + b, text: i18n_1._tr.global.ok, click: () => { this._click(b); } }));
                            break;
                        }
                        case 'cancel': {
                            btns.push(new button_1.Button({ ref: '@' + b, text: i18n_1._tr.global.cancel, click: () => { this._click(b); } }));
                            break;
                        }
                        case 'ignore': {
                            btns.push(new button_1.Button({ ref: '@' + b, text: i18n_1._tr.global.ignore, click: () => { this._click(b); } }));
                            break;
                        }
                        case 'yes': {
                            btns.push(new button_1.Button({ ref: '@' + b, text: i18n_1._tr.global.yes, click: () => { this._click(b); } }));
                            break;
                        }
                        case 'no': {
                            btns.push(new button_1.Button({ ref: '@' + b, text: i18n_1._tr.global.no, click: () => { this._click(b); } }));
                            break;
                        }
                        case 'close': {
                            btns.push(new button_1.Button({ ref: '@' + b, text: i18n_1._tr.global.close, click: () => { this._click(b); } }));
                            break;
                        }
                        case 'save': {
                            btns.push(new button_1.Button({ ref: '@' + b, text: i18n_1._tr.global.save, click: () => { this._click(b); } }));
                            break;
                        }
                        case 'dontsave': {
                            btns.push(new button_1.Button({ ref: '@' + b, text: i18n_1._tr.global.dontsave, click: () => { this._click(b); } }));
                            break;
                        }
                    }
                }
            }
        }
        if (btns.length == 1) {
            btns[0].setAttribute('autofocus', true);
        }
        this.m_buttons.setContent(btns);
    }
    /**
     *
     */
    validate() {
        let inputs = this.queryAll('input'), result = true;
        for (let i = 0; i < inputs.length; i++) {
            let input = component_1.Component.getElement(inputs[i], textedit_1.TextEdit);
            if (input && !input.validate()) {
                result = false;
            }
        }
        return result;
    }
    /**
     *
     */
    _click(btn) {
        this.emit('btnClick', (0, dialog_1.EvBtnClick)(btn));
    }
    /**
     * replacement for HTMLFormElement.elements
     * as chrome shows suggestions on form elements even if we ask him (not to do that)
     * we removed <form> element.
     * so we have to get children by hand
     */
    _getElements() {
        console.assert(!!this.dom);
        const els = this.queryAll('[name]');
        return els;
    }
    /**
     *
     */
    setValues(values) {
        let elements = this._getElements();
        for (let e = 0; e < elements.length; e++) {
            let input = elements[e];
            let item = component_1.Component.getElement(input);
            if (!item.hasAttribute("name")) {
                continue;
            }
            let name = item.getAttribute('name'), type = item.getAttribute('type');
            if (values[name] !== undefined) {
                item.setStoreValue(values[name]);
            }
        }
        this.setDirty(false);
    }
    /**
     * values are not escaped
     * checkbox set true when checked
     * radio set value when checked
     */
    getValues() {
        let elements = this._getElements();
        let result = {};
        for (let e = 0; e < elements.length; e++) {
            let el = elements[e];
            let item = component_1.Component.getElement(el);
            if (!item.hasAttribute("name")) {
                continue;
            }
            let name = item.getAttribute('name'), value = item.getStoreValue();
            if (value !== undefined) {
                result[name] = value;
            }
        }
        return result;
    }
    /**
     * send the query to the desired handler
     */
    submit(cfg, cbvalidation) {
        if (!this.validate()) {
            return false;
        }
        let values = this.getValues();
        if (cbvalidation) {
            if (!cbvalidation(values)) {
                return false;
            }
        }
        let form = new FormData();
        for (let n in values) {
            if (values.hasOwnProperty(n)) {
                form.append(n, values[n] === undefined ? '' : values[n]);
            }
        }
        cfg.params = form;
        return (0, request_1.ajaxRequest)(cfg);
    }
    /**
     * to be abble to see the dirty flag, you need to call this method
     * cf. isDirty, setDirty
     */
    watchChanges() {
        if (this.dom) {
            const els = this.queryAll('input[name], textarea[name]');
            els.forEach(el => {
                (0, component_1.flyWrap)(el).setDomEvent('input', () => {
                    this.setDirty();
                });
            });
            this.m_watchChanges = false;
        }
        else {
            this.m_watchChanges = true;
        }
    }
    /**
     * cf. watchChanges
     */
    setDirty(set = true) {
        this.m_dirty = set;
    }
    /**
     * cf. watchChanges
     */
    isDirty() {
        return this.m_dirty;
    }
}
exports.Form = Form;
