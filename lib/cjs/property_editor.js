"use strict";
/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file propertyeditor.ts
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
exports.PropertyEditor = void 0;
const component_1 = require("./component");
const x4events_1 = require("./x4events");
const input_1 = require("./input");
const textedit_1 = require("./textedit");
const checkbox_1 = require("./checkbox");
const spreadsheet_1 = require("./spreadsheet");
const i18n_1 = require("./i18n");
class PropertyEditor extends component_1.Component {
    constructor(props) {
        super(props);
        this.mapPropEvents(props, 'change');
    }
    render(props) {
        var _a;
        this.m_record = props.record;
        this.m_fields = (_a = props.fields) !== null && _a !== void 0 ? _a : [];
        this.m_label_w = props.labelWidth;
        this.m_sheet = new spreadsheet_1.Spreadsheet({
            cls: '@fit',
            columns: [
                {
                    title: i18n_1._tr.global.property,
                    width: this.m_label_w > 0 ? this.m_label_w : -1,
                    cls: 'property'
                },
                {
                    title: i18n_1._tr.global.value,
                    width: -1,
                    createEditor: (...a) => this._editCell(...a),
                    renderer: (...a) => this._renderCell(...a)
                },
            ],
            autoedit: true,
            change: (e) => this._cellChange(e)
        });
        this._updateProperties();
        this.setContent(this.m_sheet);
    }
    setFields(fields) {
        if (fields) {
            this.m_fields = fields;
            this._updateProperties();
        }
        else {
            this.m_sheet.clearData();
        }
    }
    setRecord(record) {
        this.m_record = record;
        this._updateProperties();
    }
    _updateProperties() {
        this.m_sheet.lockUpdate(true);
        this.m_sheet.clearData();
        this.m_fields.forEach((fld, lno) => {
            this.m_sheet.setCellText(lno, 0, fld.title);
            if (this.m_record) {
                this.m_sheet.setCellText(lno, 1, this.m_record.getField(fld.id));
            }
            else {
                this.m_sheet.setCellText(lno, 1, fld.value);
            }
        });
        this.m_sheet.lockUpdate(false);
    }
    _cellChange(ev) {
        let ctx = ev.context;
        let text = ev.value;
        if (ctx.col != 1) {
            return;
        }
        let fld = this.m_fields[ctx.row];
        switch (fld.type) {
            default:
            case 'string': {
                break;
            }
            case 'number': {
                break;
            }
            case 'password': {
                break;
            }
            case 'boolean': {
                break;
            }
            case 'choice': {
                /*
                let cprops = <ComboBoxProps>fprops;
                if( cprops!==fld.props ) {
                    
                    let choices;
                    if( isArray(fld.values) ) {
                        choices = this._choicesFromArray( fld.values );
                    }
                    else if( fld.values instanceof DataStore ) {
                        choices = this._choicesFromStore( fld.values, 'name' );
                    }
                                                
                    cprops.items = choices;
                }

                editor = new ComboBox( cprops );
                */
                break;
            }
        }
        if (this.m_record) {
            this.m_record.setField(fld.id, text);
        }
        else {
            fld.value = text;
        }
        this.emit('change', (0, x4events_1.EvChange)(text, fld));
    }
    _renderCell(text, rec) {
        let fld = this.m_fields[rec.row];
        switch (fld.type) {
            default:
            case 'string': {
                break;
            }
            case 'number': {
                break;
            }
            case 'password': {
                text = '●●●●●●';
                break;
            }
            case 'boolean': {
                break;
            }
            case 'choice': {
                /*
                let cprops = <ComboBoxProps>fprops;
                if( cprops!==fld.props ) {
                    
                    let choices;
                    if( isArray(fld.values) ) {
                        choices = this._choicesFromArray( fld.values );
                    }
                    else if( fld.values instanceof DataStore ) {
                        choices = this._choicesFromStore( fld.values, 'name' );
                    }
                                                
                    cprops.items = choices;
                }

                editor = new ComboBox( cprops );
                */
                break;
            }
        }
        return text;
    }
    _editCell(props, row, col) {
        let fld = this.m_fields[row];
        let editor;
        switch (fld.type) {
            default:
            case 'string': {
                editor = new textedit_1.TextEdit(props);
                break;
            }
            case 'number': {
                editor = new textedit_1.TextEdit(props);
                break;
            }
            case 'password': {
                props.type = 'password';
                props.value = this.m_record.getField(fld.id);
                editor = new input_1.Input(props);
                break;
            }
            case 'boolean': {
                editor = new checkbox_1.CheckBox(props);
                break;
            }
            case 'choice': {
                /*let cprops = <ComboBoxProps>props;
                if( cprops!==fld.props ) {
                    
                    let choices;
                    if( isArray(fld.values) ) {
                        choices = this._choicesFromArray( fld.values );
                    }
                    else if( fld.values instanceof DataStore ) {
                        choices = this._choicesFromStore( fld.values, 'name' );
                    }
                                                
                    cprops.items = choices;
                }

                editor = new ComboBox( cprops );
                */
                break;
            }
        }
        return editor;
    }
    _choicesFromArray(values) {
        let choices = values.map((e) => {
            if (typeof (e) == 'object') {
                return { id: e.id, text: e.value };
            }
            else {
                return { id: e, text: '' + e };
            }
        });
        return choices;
    }
    _choicesFromStore(view, field) {
        let choices = [];
        for (let i = 0, n = view.count; i < n; i++) {
            let rec = view.getByIndex(i);
            choices.push({ id: rec.getID(), text: rec.getField(field) });
        }
        return choices;
    }
}
exports.PropertyEditor = PropertyEditor;
