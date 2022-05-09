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
exports.PropertyEditor = void 0;
const component_1 = require("./component");
const x4_events_1 = require("./x4_events");
const input_1 = require("./input");
const textedit_1 = require("./textedit");
const checkbox_1 = require("./checkbox");
const spreadsheet_1 = require("./spreadsheet");
const i18n_1 = require("./i18n");
class PropertyEditor extends component_1.Component {
    m_fields;
    m_record;
    m_sheet;
    m_label_w;
    constructor(props) {
        super(props);
        this.mapPropEvents(props, 'change');
    }
    render(props) {
        this.m_record = props.record;
        this.m_fields = props.fields ?? [];
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
        this.emit('change', (0, x4_events_1.EvChange)(text, fld));
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
