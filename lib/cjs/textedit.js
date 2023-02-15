"use strict";
/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file textedit.ts
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
exports.TextEdit = void 0;
const x4dom_1 = require("./x4dom");
const component_1 = require("./component");
const input_1 = require("./input");
const button_1 = require("./button");
const layout_1 = require("./layout");
const label_1 = require("./label");
const calendar_1 = require("./calendar");
const tools_1 = require("./tools");
const tooltips_1 = require("./tooltips");
const x4events_1 = require("./x4events");
const i18n_1 = require("./i18n");
/** @ignore */
const reEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
/**
 * TextEdit is a single line editor, it can have a label and an error descriptor.
 */
class TextEdit extends component_1.Component {
    constructor(props) {
        super(props);
        this.addClass('@hlayout');
        this.mapPropEvents(props, 'change', 'click', 'focus');
    }
    componentCreated() {
        super.componentCreated();
        if (this.m_props.autoFocus) {
            this.focus();
        }
    }
    componentDisposed() {
        if (this.m_error_tip) {
            this.m_error_tip.dispose();
        }
        super.componentDisposed();
    }
    focus() {
        this.m_ui_input.focus();
    }
    /** @ignore */
    render(props) {
        var _a, _b, _c, _d;
        let eprops = {
            flex: 1,
            dom_events: {
                focus: () => this._focus(),
                focusout: () => this._blur(),
                input: () => this._change()
            },
            value: props.value,
            name: props.name,
            type: props.type,
            placeHolder: props.placeHolder,
            autoFocus: props.autoFocus,
            readOnly: props.readOnly,
            value_hook: props.value_hook,
            uppercase: props.uppercase,
            spellcheck: props.spellcheck,
            tabIndex: props.tabIndex === undefined ? true : props.tabIndex,
            attrs: props.attrs,
            min: props.min,
            max: props.max,
            autosel: props.autosel,
        };
        // date is handled manually with popupcalendar
        if (props.type == 'date') {
            props.format = (_a = props.format) !== null && _a !== void 0 ? _a : 'Y-M-D';
            eprops.type = 'text';
            let def_hook = {
                get: () => this._date_get_hook(),
                set: (e) => this._date_set_hook(e)
            };
            eprops.value_hook = (_b = props.value_hook) !== null && _b !== void 0 ? _b : def_hook;
        }
        this.m_ui_input = new input_1.Input(eprops);
        //	button
        let button = undefined;
        if (props.icon) {
            button = new button_1.Button({
                icon: props.icon,
                click: () => this._btnClick(),
                tabIndex: false
            });
        }
        else if (props.type == 'date') {
            button = new button_1.Button({
                cls: 'gadget',
                icon: 'var( --x4-icon-calendar-days )',
                tabIndex: false,
                click: () => this._showDatePicker(button)
            });
            if (!props.validator) {
                props.validator = this._date_validator;
            }
        }
        let ag = (_c = props.gadgets) !== null && _c !== void 0 ? _c : [];
        ag.forEach(b => {
            b.addClass('gadget');
        });
        let gadgets = [button, ...ag];
        this.setClass('@required', props.required);
        if (props.gadgets && props.gadgets.length) {
            this.addClass('with-gadgets');
        }
        let width = undefined, flex = undefined, labelWidth = props.labelWidth;
        if (labelWidth > 0) {
            width = labelWidth;
        }
        if (labelWidth < 0) {
            flex = -labelWidth;
        }
        let label = undefined;
        let labelAlign = props.labelAlign;
        let top = false;
        if (props.label) {
            if (labelAlign == 'top') {
                labelAlign = 'left';
                top = true;
                flex = 1;
            }
            label = new label_1.Label({
                ref: 'label',
                tag: 'label',
                cls: 'label1' + (props.label ? '' : ' @hidden'),
                text: (_d = props.label) !== null && _d !== void 0 ? _d : '',
                width,
                flex,
                align: labelAlign
            });
        }
        if (top) {
            this.removeClass('@hlayout');
            this.addClass('@vlayout vertical');
            this.setContent([
                label,
                new layout_1.HLayout({ width, content: [this.m_ui_input, ...gadgets] })
            ]);
        }
        else {
            this.addClass('@hlayout');
            this.setContent([label, this.m_ui_input, ...gadgets]);
        }
    }
    enable(ena) {
        if (ena === true) {
            this.m_ui_input.enable();
        }
        super.enable(ena);
    }
    disable() {
        this.m_ui_input.disable();
        super.disable();
    }
    _btnClick() {
        this.emit('click', (0, x4events_1.EvClick)(this.value));
    }
    /**
     * select the value format for input/output on textedit of type date
     * cf. formatIntlDate / parseIntlDate
     * @param fmt
     */
    setDateStoreFormat(fmt) {
        this.m_props.format = fmt;
    }
    setStoreValue(value) {
        this.m_ui_input.setStoreValue(value);
    }
    getStoreValue() {
        return this.m_ui_input.getStoreValue();
    }
    _date_get_hook() {
        let date = (0, tools_1.parseIntlDate)(this.value);
        let props = this.m_props;
        if (props.format == 'native') {
            return date;
        }
        else {
            return date ? (0, tools_1.formatIntlDate)(date, props.format) : null;
        }
    }
    _date_set_hook(dte) {
        let props = this.m_props;
        if (props.format == 'native') {
            this.value = (0, tools_1.formatIntlDate)(dte);
        }
        else if (dte) {
            let date = (0, tools_1.parseIntlDate)(dte, props.format);
            this.value = (0, tools_1.formatIntlDate)(date);
        }
        else {
            this.value = '';
        }
    }
    showError(text) {
        if (!this.m_error_tip) {
            this.m_error_tip = new tooltips_1.Tooltip({ cls: 'error' });
            x4dom_1.x4document.body.appendChild(this.m_error_tip._build());
        }
        let rc = this.m_ui_input.getBoundingRect();
        this.m_error_tip.text = text;
        this.m_error_tip.displayAt(rc.right, rc.top, 'top left');
        this.addClass('@error');
    }
    clearError() {
        if (this.m_error_tip) {
            this.m_error_tip.hide();
            this.removeClass('@error');
        }
    }
    get value() {
        if (this.m_ui_input) {
            return this.m_ui_input.value;
        }
        else {
            return this.m_props.value;
        }
    }
    set value(value) {
        if (this.m_ui_input) {
            this.m_ui_input.value = value;
        }
        else {
            this.m_props.value = value;
        }
    }
    /**
     * select all the text
     */
    selectAll() {
        this.m_ui_input.selectAll();
    }
    select(start, length = 9999) {
        this.m_ui_input.select(start, length);
    }
    getSelection() {
        return this.m_ui_input.getSelection();
    }
    set readOnly(ro) {
        this.m_ui_input.readOnly = ro;
    }
    get label() {
        var _a;
        return (_a = this.itemWithRef('label')) === null || _a === void 0 ? void 0 : _a.text;
    }
    set label(text) {
        this.itemWithRef('label').text = text;
    }
    /**
     * content changed
     * todo: should move into Input
     */
    _change() {
        let value = this.m_ui_input.value;
        this.emit('change', (0, x4events_1.EvChange)(value));
    }
    /**
     * getting focus
     */
    _focus() {
        this.clearError();
        this.emit('focus', (0, component_1.EvFocus)(true));
    }
    /**
     * loosing focus
     * @param value
     */
    _blur() {
        this._validate(this.m_ui_input.value);
        this.emit('focus', (0, component_1.EvFocus)(false));
    }
    /**
     * todo: should move into Input
     * @returns
     */
    validate() {
        return this._validate(this.value);
    }
    _validate(value) {
        let props = this.m_props;
        let update = false;
        if (props.required && value.length == 0) {
            this.showError(i18n_1._tr.global.required_field);
            return false;
        }
        if (value != '') {
            let pattern = this.getAttribute('pattern');
            if (pattern) {
                let re = new RegExp(pattern);
                if (re && !re.test(value)) {
                    this.showError(i18n_1._tr.global.invalid_format);
                    return false;
                }
            }
            if (props.type == 'email') {
                if (!reEmail.test(value.toLowerCase())) {
                    this.showError(i18n_1._tr.global.invalid_email);
                    return false;
                }
            }
            else if (props.type == 'number') {
                const v = parseFloat(value);
                if (isNaN(v)) {
                    this.showError(i18n_1._tr.global.invalid_number);
                    return false;
                }
                let min = parseFloat(this.m_ui_input.getAttribute('min'));
                if (min !== undefined && v < min) {
                    value = '' + min;
                    update = true;
                }
                let max = parseFloat(this.m_ui_input.getAttribute('max'));
                if (max !== undefined && v > max) {
                    value = '' + max;
                    update = true;
                }
            }
        }
        if (props.validator) {
            try {
                this.value = props.validator(value);
            }
            catch (err) {
                this.showError(err instanceof Error ? err.message : err);
                return false;
            }
        }
        else if (update) {
            this.value = value;
        }
        return true;
    }
    _date_validator(value) {
        value = value.trim();
        if (value == '') {
            return '';
        }
        let date;
        if (value == '@') {
            date = new Date();
        }
        else {
            date = (0, tools_1.parseIntlDate)(value);
            if (!date) {
                throw (0, tools_1.sprintf)(i18n_1._tr.global.invalid_date, i18n_1._tr.global.date_format);
            }
        }
        return (0, tools_1.formatIntlDate)(date);
    }
    //onKeyDown( e ) {
    //    if( this.readOnly ) {
    //        if( this.type=='date' && (e.key==' ' || e.key=='Enter') ) {
    //            this.showDatePicker( );
    //            e.stopPropagation( );
    //            e.preventDefault( );
    //        }
    //    }
    //}
    //onClick( e ) {
    //    if( this.readOnly ) {
    //        if( this.type=='date' ) {
    //            this.showDatePicker( );
    //            e.stopPropagation( );
    //            e.preventDefault( );
    //        }
    //    }
    //}
    _showDatePicker(btn) {
        if (!this.m_cal_popup) {
            this.m_cal_popup = new calendar_1.PopupCalendar({
                change: (ev) => {
                    this.value = (0, tools_1.formatIntlDate)(ev.value);
                    this.m_cal_popup.close();
                }
            });
        }
        let rc = this.m_ui_input.getBoundingRect();
        this.m_cal_popup.displayAt(rc.left, rc.bottom, 'top left');
    }
    get input() {
        return this.m_ui_input;
    }
    get type() {
        return this.m_props.type;
    }
}
exports.TextEdit = TextEdit;
