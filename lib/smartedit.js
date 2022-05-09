"use strict";
/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file smartedit.ts
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
exports.PopupTable = exports.SmartEdit = void 0;
const textedit_1 = require("./textedit");
const popup_1 = require("./popup");
const component_1 = require("./component");
const x4_events_1 = require("./x4_events");
class SmartEdit extends textedit_1.TextEdit {
    m_popup;
    m_dataview;
    m_field;
    m_minDisplay;
    m_maxCount;
    m_autoFill;
    m_renderer;
    m_tools;
    m_searchCallback;
    constructor(props) {
        super(props);
        this.m_dataview = props.store.createView();
        this.m_field = props.field;
        this.m_renderer = props.renderer;
        this.m_minDisplay = props.minDisplay ?? 0;
        this.m_maxCount = props.maxCount ?? 10;
        this.m_autoFill = props.autoFill === undefined ? true : props.autoFill;
        this.m_popup = null;
        this.m_tools = props.tools ?? [];
        this.m_searchCallback = props.searchCallback;
        this.on('change', (e) => this._onChange(e));
        this.on('focus', (e) => this._onFocus(e));
    }
    render(props) {
        super.render(props);
        this.m_ui_input.setDomEvent('keydown', (e) => this._onKey(e));
    }
    _onChange(ev) {
        this._showPopup(ev.value);
    }
    _onFocus(ev) {
        if (ev.focus) {
            this._showPopup(this.value);
        }
        else if (this.m_popup) {
            this.m_popup.close();
        }
    }
    _onKey(e) {
        console.log(e.key);
        switch (e.key) {
            case 'Backspace': {
                // remove selection
                let start = e.target.selectionStart;
                let end = e.target.selectionEnd;
                if (start > end) {
                    let t = start;
                    start = end;
                    end = t;
                }
                let v = this.value;
                let a = v.substr(0, start);
                let b = v.substr(end);
                this.value = a + b;
                break;
            }
            case 'ArrowUp':
            case 'Up': {
                if (this.m_popup) {
                    this._moveNext(false);
                    e.preventDefault();
                }
                break;
            }
            case 'ArrowDown':
            case 'Down': {
                if (this.m_popup) {
                    this._moveNext(true);
                    e.preventDefault();
                }
                break;
            }
            case 'Enter': {
                if (this.m_popup) {
                    this._checkTool(e);
                }
                break;
            }
        }
    }
    _showSugg(text) {
        let sel = this.getSelection();
        this.value = text;
        this.select(sel.start, sel.length);
    }
    isOpen() {
        return this.m_popup !== null;
    }
    componentDisposed() {
        if (this.m_popup) {
            this.m_popup.close();
        }
        super.componentDisposed();
    }
    // enter pressed on an element
    _checkTool(e) {
        let sel = this.m_popup.selection;
        if (this._callTool(sel)) {
            e.preventDefault();
        }
    }
    _callTool(sel) {
        let data = this.m_popup.getRowData(sel);
        if (data) {
            if (this.m_popup) {
                this.m_popup.close();
            }
            data.callback(this);
            return true;
        }
        else {
            return false;
        }
    }
    _moveNext(next) {
        let sel = this.m_popup.selNext(next);
        console.log('movenext: ', sel);
        let data = this.m_popup.getRowData(sel);
        if (!data) {
            let text = this.m_popup.getCell(sel, 0).text;
            this._showSugg(text);
        }
    }
    //_onKey( e: KeyboardEvent ) {
    //	if( e.key==' ' ) {
    //		this._showPopup( this.value )
    //	}
    //}
    _showPopup(v) {
        if (this.m_popup) {
            this.m_popup.close();
            this.m_popup = null;
        }
        let cnt;
        let sel = this.getSelection();
        let search = sel.length ? v.substr(0, sel.start) : v;
        if (search.length < this.m_minDisplay) {
            return;
        }
        let autoFill = this.m_autoFill;
        if (search.length == 0) {
            cnt = this.m_dataview.filter(null);
        }
        else {
            if (this.m_searchCallback) {
                autoFill = this.m_searchCallback(search, this.m_dataview);
                cnt = this.m_dataview.count;
            }
            else {
                cnt = this.m_dataview.filter({
                    op: '=',
                    field: this.m_field,
                    value: new RegExp('^' + search.trim() + '.*', 'mi')
                });
            }
        }
        if (cnt > 0) {
            let rec = this.m_dataview.getByIndex(0);
            if (autoFill) {
                this.value = rec.getField(this.m_field);
            }
            this.select(v.length);
            let count = Math.min(this.m_dataview.count, this.m_maxCount);
            let r2 = this.m_ui_input.getBoundingRect();
            this.m_popup = new PopupTable({
                cls: '@editor-popup',
                minWidth: r2.width
            });
            this.m_popup.on('click', (ev) => {
                let { row, text } = ev.context;
                if (!this._callTool(row)) {
                    this.value = text;
                    this.emit('click', (0, x4_events_1.EvClick)());
                }
            });
            let i;
            for (i = 0; i < count; i++) {
                let rec = this.m_dataview.getByIndex(i);
                let texts = this.m_renderer(rec);
                this.m_popup.setCell(i, 0, texts[0].text, texts[0].cls);
                this.m_popup.setCell(i, 1, texts[1].text, texts[1].cls);
            }
            for (let j = 0; j < this.m_tools.length; j++, i++) {
                this.m_popup.setCell(i, 0, this.m_tools[j].text);
                this.m_popup.setCell(i, 1, '');
                this.m_popup.setRowData(i, this.m_tools[j]);
                console.log('fill: ', i);
            }
            this.m_popup.displayAt(r2.left, r2.bottom);
        }
        else if (this.m_tools.length) {
            let r2 = this.m_ui_input.getBoundingRect();
            this.m_popup = new PopupTable({
                cls: '@editor-popup',
                minWidth: r2.width
            });
            this.m_popup.on('click', (ev) => {
                let { row, text } = ev.context;
                if (!this._callTool(row)) {
                    this.value = text;
                }
            });
            for (let j = 0, i = 0; j < this.m_tools.length; j++, i++) {
                this.m_popup.setCell(i, 0, this.m_tools[j].text);
                this.m_popup.setCell(i, 1, '');
                this.m_popup.setRowData(i, this.m_tools[j]);
                console.log('fill: ', i);
            }
            this.m_popup.displayAt(r2.left, r2.bottom);
        }
    }
}
exports.SmartEdit = SmartEdit;
class PopupTable extends popup_1.Popup {
    m_rows;
    m_cols;
    m_cells;
    m_data;
    m_minw;
    m_defcell;
    m_sel;
    constructor(props) {
        super(props);
        this.m_rows = props.rows ?? 0;
        this.m_cols = props.cols ?? 0;
        this.m_minw = props.minWidth;
        this.m_cells = new Map();
        this.m_data = new Map();
        this.m_defcell = { text: '', cls: undefined };
        this.m_sel = 0;
        this.enableMask(false);
        this.setDomEvent('create', () => {
            this.dom.cellPadding = '0px';
        });
        this.setDomEvent('mousedown', (e) => {
            e.preventDefault();
            let el = component_1.Component.getElement(e.target);
            let row = el.getData('row');
            this.m_sel = row;
            this.update();
            this.emit('click', (0, x4_events_1.EvClick)({ row, text: this.getCell(row, 0).text }));
        });
    }
    setRowData(row, data) {
        this.m_data.set(row, data);
    }
    getRowData(row) {
        return this.m_data.get(row);
    }
    setCell(row, col, text, cls) {
        this.m_cells.set(_cid(row, col), { text, cls });
        if (this.m_rows < (row + 1)) {
            this.m_rows = (row + 1);
        }
        if (this.m_cols < (col + 1)) {
            this.m_cols = (col + 1);
        }
    }
    getCell(row, col) {
        let cd = this.m_cells.get(_cid(row, col));
        if (cd == null) {
            return this.m_defcell;
        }
        return cd;
    }
    /** @ignore */
    render() {
        this.setProp('tag', 'table');
        if (this.m_minw) {
            this.setStyleValue('minWidth', this.m_minw);
        }
        let rows = [];
        for (let r = 0; r < this.m_rows; r++) {
            let cols = [];
            let data = { row: r };
            for (let c = 0; c < this.m_cols; c++) {
                let cell = this.getCell(r, c);
                let col = new component_1.Component({
                    tag: 'td',
                    content: cell.text,
                    cls: cell.cls,
                    data
                });
                cols.push(col);
            }
            let cls = undefined;
            if (r === this.m_sel) {
                cls = '@selected';
            }
            let row = new component_1.Component({
                tag: 'tr',
                cls,
                content: cols,
                data
            });
            rows.push(row);
        }
        this.setContent(rows);
    }
    /**
    * display the popup at a specific position
    * @param x
    * @param y
    */
    displayAt(x, y, align = 'top left') {
        this.show();
        let halign = 'l', valign = 't';
        if (align.indexOf('right') >= 0) {
            halign = 'r';
        }
        if (align.indexOf('bottom') >= 0) {
            valign = 'b';
        }
        // @TODO: this is a minimal overflow problem solution
        let rc = document.body.getBoundingClientRect(), rm = this.getBoundingRect();
        if (halign == 'r') {
            x -= rm.width;
        }
        if (valign == 'b') {
            y -= rm.height;
        }
        if (x < 4) {
            x = 4;
        }
        if ((x + rm.width) > rc.right - 4) {
            x = rc.right - 4 - rm.width;
        }
        if (y < 4) {
            y = 4;
        }
        if ((y + rm.height) > rc.bottom - 4) {
            y = rc.bottom - 4 - rm.height;
        }
        this.setStyle({ left: x, top: y });
    }
    selNext(next) {
        this.m_sel += next ? 1 : -1;
        if (this.m_sel >= this.m_rows) {
            this.m_sel = 0;
        }
        else if (this.m_sel < 0) {
            this.m_sel = this.m_rows - 1;
        }
        this.update();
        return this.m_sel;
    }
    get selection() {
        return this.m_sel;
    }
}
exports.PopupTable = PopupTable;
function _cid(row, col) {
    return row * 1000 + col;
}
