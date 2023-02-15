"use strict";
/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file gridview.ts
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
exports.GridView = exports.EvGridCheck = void 0;
const T_UPDATE = Symbol('update');
/**
 * todo: sizable column
 * todo: button in a column
 */
const x4dom_1 = require("./x4dom");
const layout_1 = require("./layout");
const component_1 = require("./component");
const label_1 = require("./label");
const i18n_1 = require("./i18n");
const tools_1 = require("./tools");
const datastore_1 = require("./datastore");
const x4events_1 = require("./x4events");
const icon_js_1 = require("./icon.js");
function EvGridCheck(rec, chk) {
    return (0, x4events_1.BasicEvent)({ rec, chk });
}
exports.EvGridCheck = EvGridCheck;
class ColHeader extends component_1.Component {
    constructor(props, title) {
        super(props);
        this.m_sorted = false;
        this.m_sens = 'dn';
        this.setContent([
            new component_1.Component({
                tag: 'span',
                content: title
            }),
            new icon_js_1.Icon({
                ref: 'sorter',
                cls: '@hidden sort',
                icon: 'var( --x4-icon-arrow-down )'
            })
        ]);
    }
    get sorted() {
        return this.m_sorted;
    }
    //set sorted( v ) {
    //	this.m_sorted = v;
    //	this.m_sens = 'dn';
    //	this.itemWithRef<Icon>( 'sorter' ).show( v );
    //}
    sort(v, sens) {
        this.m_sorted = v;
        this.m_sens = sens;
        const ic = this.itemWithRef('sorter');
        ic.icon = this.m_sens == 'up' ? 'var( --x4-icon-arrow-down )' : 'var( --x4-icon-arrow-up )';
        ic.show(v);
    }
    get sens() {
        return this.m_sens;
    }
    toggleSens() {
        this.m_sens = this.m_sens == 'up' ? 'dn' : 'up';
        this.itemWithRef('sorter').icon = this.m_sens == 'up' ? 'var( --x4-icon-arrow-down )' : 'var( --x4-icon-arrow-up )';
    }
}
/**
 * gridview class
 */
class GridView extends layout_1.VLayout {
    constructor(props) {
        var _a, _b;
        super(props);
        this.m_columns = props.columns;
        this.m_hasMarks = (_a = props.hasMarks) !== null && _a !== void 0 ? _a : false;
        this.m_marks = new Set();
        // prepend the checkable column
        if (this.m_hasMarks) {
            this.m_columns.unshift({
                id: 'id',
                title: '',
                width: 30,
                renderer: (e) => this._renderCheck(e)
            });
        }
        this.setAttribute('tabindex', 0);
        this.m_topIndex = 0;
        this.m_itemHeight = 0;
        this.m_recycler = [];
        this.m_rowClassifier = props.calcRowClass;
        this.m_empty_text = (_b = props.empty_text) !== null && _b !== void 0 ? _b : i18n_1._tr.global.empty_list;
        //this.setDomEvent('create', this._handleCreate, this);
        this.setDomEvent('click', (e) => this._itemClick(e));
        this.setDomEvent('dblclick', (e) => this._itemDblClick(e));
        this.setDomEvent('contextmenu', (e) => this._itemMenu(e));
        this.setDomEvent('keydown', (e) => this._handleKey(e));
        this.setStore(props.store);
    }
    componentCreated() {
        this._updateScroll(true);
    }
    /**
     *
     */
    _moveSel(sens, select = true) {
        let sel = this.m_selection;
        let scrolltype = null;
        if (sel === undefined) {
            sel = this.m_dataview.getByIndex(0).getID();
        }
        else {
            let index = this.m_dataview.indexOfId(this.m_selection);
            if (sens == 1) {
                index++;
            }
            else if (sens == -1) {
                index--;
            }
            else if (sens == 2) {
                index += this.m_visible_rows.length - 1;
            }
            else if (sens == -2) {
                index -= this.m_visible_rows.length - 1;
            }
            if (sens < 0) {
                scrolltype = 'start';
            }
            else {
                scrolltype = 'end';
            }
            if (index < 0) {
                index = 0;
            }
            else if (index >= this.m_dataview.count) {
                index = this.m_dataview.count - 1;
            }
            sel = this.m_dataview.getByIndex(index).getID();
        }
        if (this.m_selection != sel && select) {
            this._selectItem(sel, null, scrolltype);
        }
        return sel;
    }
    /**
     *
     */
    _handleKey(event) {
        if (!this.m_dataview || this.m_dataview.count == 0) {
            return;
        }
        switch (event.key) {
            case 'ArrowDown':
            case 'Down': {
                this._moveSel(1);
                break;
            }
            case 'ArrowUp':
            case 'Up': {
                this._moveSel(-1);
                break;
            }
            case 'PageUp': {
                this._moveSel(-2);
                break;
            }
            case 'PageDown': {
                this._moveSel(2);
                break;
            }
        }
    }
    /**
     *
     */
    getNextSel(sens) {
        return this._moveSel(sens, false);
    }
    _scrollIntoView(id, sens) {
        let itm = this._findItem(id);
        if (itm) {
            itm.scrollIntoView({
                block: 'center' //<ScrollLogicalPosition>sens ?? 'nearest'
            });
        }
        else {
            this.m_topIndex = this.m_dataview.indexOfId(id);
            this.m_view_el.dom.scrollTop = this.m_topIndex * this.m_itemHeight;
            this._buildItems();
            this._scrollIntoView(id);
        }
    }
    /**
     * change the list of item displayed
     * @param items - new array of items
     */
    setStore(store) {
        this.m_selection = undefined;
        if (store instanceof datastore_1.DataStore) {
            this.m_dataview = store.createView();
        }
        else {
            this.m_dataview = store;
        }
        if (this.m_hasMarks) {
            this.clearMarks();
        }
        // unlink previous observer
        if (this.m_data_cx) {
            this.m_data_cx.dispose();
        }
        if (this.m_dataview) {
            this.m_data_cx = this.m_dataview.on('view_change', (ev) => {
                if (ev.action == 'change') {
                    this.m_selection = undefined;
                }
                this._updateScroll(true);
            });
            //this.update( );
            this._updateScroll(true);
        }
    }
    getView() {
        return this.m_dataview;
    }
    /**
     * return the current selection (row id) or null
     */
    getSelection() {
        return this.m_selection;
    }
    getSelRec() {
        if (this.m_selection) {
            return this.m_dataview.getById(this.m_selection);
        }
        return null;
    }
    setSelection(recId) {
        this._selectItem(recId, null, 'center');
    }
    /** @ignore */
    render() {
        this.m_recycler = [];
        this.m_container = new component_1.Component({
            cls: 'content',
        });
        this.m_empty_msg = new label_1.Label({
            cls: 'empty-msg',
            text: ''
        });
        this.m_view_el = new component_1.Component({
            cls: '@scroll-view',
            flex: 1,
            dom_events: {
                sizechange: () => this._updateScroll(true),
                scroll: () => this._updateScroll(false)
            },
            content: this.m_container
        });
        let flex = false;
        let cols = this.m_columns.map((col, index) => {
            let cls = '@cell';
            if (col.cls) {
                cls += ' ' + col.cls;
            }
            let comp = new ColHeader({
                cls,
                flex: col.flex,
                sizable: 'right',
                style: {
                    width: col.width
                },
                dom_events: {
                    click: (ev) => {
                        let t = (0, component_1.flyWrap)(ev.target);
                        if (!t.hasClass('@sizer-overlay')) { // avoid sizer click
                            this._sortCol(col);
                            ev.preventDefault();
                        }
                    }
                }
            }, col.title);
            const resizeCol = (ev) => {
                this._on_col_resize(index, ev.size.width);
                if (this.m_footer) {
                    let col = component_1.Component.getElement(this.m_footer.dom.childNodes[index]);
                    if (col) {
                        col.setStyleValue('width', ev.size.width);
                    }
                }
            };
            new component_1.SizerOverlay({
                target: comp,
                sens: 'right',
                events: { resize: (e) => resizeCol(e) }
            });
            if (col.flex) {
                flex = true;
            }
            col.$hdr = comp;
            return comp;
        });
        cols.push(new component_1.Flex({
            ref: 'flex',
            cls: flex ? '@hidden' : ''
        }));
        // compute full width
        let full_width = 0;
        this.m_columns.forEach((col) => {
            var _a;
            full_width += (_a = col.width) !== null && _a !== void 0 ? _a : 0;
        });
        this.m_header = new layout_1.HLayout({
            cls: '@header',
            content: cols,
            style: {
                minWidth: full_width
            }
        });
        if (this.m_props.hasFooter) {
            let foots = this.m_columns.map((col, index) => {
                let cls = '@cell';
                if (col.align) {
                    cls += ' ' + col.align;
                }
                if (col.cls) {
                    cls += ' ' + col.cls;
                }
                let comp = new component_1.Component({
                    cls,
                    data: { col: index },
                    flex: col.flex,
                    style: {
                        width: col.width
                    }
                });
                col.$ftr = comp;
                return comp;
            });
            foots.push(new component_1.Flex({
                ref: 'flex',
                cls: flex ? '@hidden' : ''
            }));
            this.m_footer = new layout_1.HLayout({
                cls: '@footer',
                content: foots,
                style: {
                    minWidth: full_width
                }
            });
        }
        else {
            this.m_footer = null;
        }
        this.setContent([
            this.m_header,
            this.m_view_el,
            this.m_footer,
            this.m_empty_msg,
        ]);
    }
    _on_col_resize(col, width) {
        var _a, _b, _c, _d;
        const _col = this.m_columns[col];
        let updateFlex = false;
        if (width >= 0) {
            _col.width = width;
            if (_col.flex) {
                _col.$hdr.removeClass('@flex');
                (_a = _col.$ftr) === null || _a === void 0 ? void 0 : _a.removeClass('@flex');
                _col.flex = undefined;
                updateFlex = true;
            }
        }
        else if (width < 0 && !_col.flex) {
            _col.$hdr.addClass('@flex');
            (_b = _col.$ftr) === null || _b === void 0 ? void 0 : _b.addClass('@flex');
            _col.flex = 1;
            updateFlex = true;
        }
        if (updateFlex) {
            let flex = false;
            this.m_columns.forEach(c => {
                if (c.flex) {
                    flex = true;
                }
            });
            (_c = this.m_header.itemWithRef('flex')) === null || _c === void 0 ? void 0 : _c.show(flex ? false : true);
            if (this.m_footer) {
                (_d = this.m_footer.itemWithRef('flex')) === null || _d === void 0 ? void 0 : _d.show(flex ? false : true);
            }
        }
        this._updateScroll(true);
    }
    /**
     *
     */
    sortCol(name, asc = true) {
        const col = this.m_columns.find(c => c.id == name);
        if (col === undefined) {
            console.assert(false, "unknown field " + name + " in grid.sortCol");
            return;
        }
        this._sortCol(col, asc ? "dn" : "up");
    }
    /**
     *
     */
    _sortCol(col, sens = "up") {
        if (col.sortable === false) {
            return;
        }
        this.m_columns.forEach((c) => {
            if (c !== col) {
                c.$hdr.sort(false, "dn");
            }
        });
        const $hdr = col.$hdr;
        if ($hdr.sorted) {
            $hdr.toggleSens();
        }
        else {
            $hdr.sort(true, sens);
        }
        if (this.m_dataview) {
            this.m_dataview.sort([
                { field: col.id, ascending: $hdr.sens == 'dn' ? false : true }
            ]);
        }
    }
    /**
     *
     */
    _computeItemHeight() {
        let gr = x4dom_1.x4document.createElement('div');
        gr.classList.add('x-row');
        let gv = x4dom_1.x4document.createElement('div');
        gv.classList.add('x-grid-view');
        gv.style.position = 'absolute';
        gv.style.top = '-1000px';
        gv.appendChild(gr);
        this.dom.appendChild(gv);
        let rc = gr.getBoundingClientRect();
        this.dom.removeChild(gv);
        this.m_itemHeight = rc.height;
    }
    _createRow(props) {
        let row;
        if (this.m_recycler.length) {
            row = this.m_recycler.pop();
            row.clearClasses();
            row.addClass(props.cls);
            row.setContent(props.content);
            row.setStyle(props.style);
            for (let n in props.data) {
                row.setData(n, props.data[n]);
            }
        }
        else {
            row = new layout_1.HLayout(props);
        }
        if (!row.dom) {
            this.m_container.appendChild(row);
        }
        return row;
    }
    _buildItems(canOpt = true) {
        var _a, _b, _c, _d;
        let rc = this.getBoundingRect();
        let rh = this.m_header.getBoundingRect();
        let height = rc.height - rh.height + this.m_itemHeight;
        if (this.m_itemHeight == 0) {
            this._computeItemHeight();
        }
        let top = this.m_topIndex * this.m_itemHeight;
        let y = 0;
        let cidx = 0;
        let index = this.m_topIndex;
        let count = this.m_dataview ? this.m_dataview.count : 0;
        let full_width = 0; // todo: +4 pixel of left border
        let even = this.m_topIndex & 1 ? true : false;
        // compute full width
        this.m_columns.forEach((col) => {
            var _a;
            full_width += (_a = col.width) !== null && _a !== void 0 ? _a : 0;
        });
        // if items height make scroll visible, update header width
        if (((count + 1) * this.m_itemHeight) >= height) {
            let w = component_1.Component.getScrollbarSize();
            this.m_header.setStyleValue("paddingRight", w);
            (_a = this.m_footer) === null || _a === void 0 ? void 0 : _a.setStyleValue("paddingRight", w);
        }
        else {
            this.m_header.setStyleValue("paddingRight", 0);
            (_b = this.m_footer) === null || _b === void 0 ? void 0 : _b.setStyleValue("paddingRight", 0);
        }
        // passe 0 - all created cells are moved to the recycler
        if (this.m_visible_rows) {
            this.m_visible_rows.forEach((c) => {
                this.m_recycler.push(c);
            });
        }
        this.m_visible_rows = [];
        let limit = 100;
        while (y < height && index < count && --limit > 0) {
            let rec = this.m_dataview.getByIndex(index);
            let rowid = rec.getID();
            let crow = canOpt ? this.m_recycler.findIndex((r) => r.getData('row-id') == rowid) : -1;
            if (crow >= 0) {
                let rrow = this.m_recycler.splice(crow, 1)[0];
                rrow.setStyle({
                    top: y + top,
                    minWidth: full_width,
                });
                if (this.m_hasMarks) {
                    rrow.setClass('@marked', this.m_marks.has(rowid));
                }
                rrow.removeClass('@hidden');
                rrow.setClass('@selected', this.m_selection === rowid);
                this.m_visible_rows[cidx] = rrow;
            }
            else {
                let cols = this.m_columns.map(col => {
                    let cls = '@cell';
                    if (col.align) {
                        cls += ' ' + col.align;
                    }
                    if (col.cls) {
                        cls += ' ' + col.cls;
                    }
                    let cell;
                    if (col.renderer) {
                        cell = col.renderer(rec);
                        if (cell) {
                            cell.addClass(cls);
                            cell.setStyleValue('width', col.width);
                            if (col.flex !== undefined) {
                                cell.addClass('@flex');
                                cell.setStyleValue('flex', col.flex);
                            }
                        }
                    }
                    else {
                        let fmt = col.formatter;
                        let text;
                        if (fmt && fmt instanceof Function) {
                            text = fmt(rec.getRaw(col.id), rec);
                        }
                        else {
                            text = rec.getField(col.id);
                        }
                        cell = new component_1.Component({
                            cls,
                            width: col.width,
                            content: (0, component_1.html) `<span>${text}</span>`,
                            flex: col.flex
                        });
                    }
                    return cell;
                });
                let cls = '@row @hlayout center';
                if (this.m_hasMarks) {
                    if (this.m_marks.has(rowid)) {
                        cls += ' @marked';
                    }
                }
                if (this.m_selection === rowid) {
                    cls += ' @selected';
                }
                let row = this.m_visible_rows[cidx] = this._createRow({
                    cls,
                    content: cols,
                    style: {
                        top: y + top,
                        minWidth: full_width,
                    },
                    data: {
                        'row-id': rowid,
                        'row-idx': index
                    }
                });
                row.addClass(even ? 'even' : 'odd');
                even = !even;
                if (this.m_rowClassifier) {
                    this.m_rowClassifier(rec, row);
                }
            }
            y += this.m_itemHeight;
            index++;
            cidx++;
        }
        // if some cells are still in cache, hide them
        this.m_recycler.forEach((c) => {
            c.addClass('@hidden');
        });
        //this.m_container.setContent(<ComponentContent>this.m_visible_rows);
        let show = !count;
        let msg = (this.m_empty_text instanceof Function) ? this.m_empty_text() : this.m_empty_text;
        this.m_empty_msg.text = msg;
        if (show && msg.length == 0) {
            show = false;
        }
        this.m_empty_msg.show(show);
        if (full_width < rc.width) {
            this.m_header.setStyleValue('width', null);
            (_c = this.m_footer) === null || _c === void 0 ? void 0 : _c.setStyleValue('width', null);
            this.m_container.setStyle({
                height: count * this.m_itemHeight,
                width: null
            });
        }
        else {
            this.m_header.setStyleValue('width', full_width + 1000);
            (_d = this.m_footer) === null || _d === void 0 ? void 0 : _d.setStyleValue('width', full_width + 1000);
            this.m_container.setStyle({
                height: count * this.m_itemHeight,
                width: full_width
            });
        }
    }
    /**
     *
     */
    _updateScroll(forceUpdate) {
        if (!this.m_view_el || !this.m_view_el.dom) {
            return;
        }
        const update = () => {
            var _a;
            // element destroyed between updateScroll and now
            if (!this.dom) {
                return;
            }
            let newTop = Math.floor(this.m_view_el.dom.scrollTop / (this.m_itemHeight || 1));
            if (newTop != this.m_topIndex || forceUpdate) {
                this.m_topIndex = newTop;
                this._buildItems(!forceUpdate);
            }
            let newLeft = this.m_view_el.dom.scrollLeft;
            this.m_header.setStyleValue('left', -newLeft);
            (_a = this.m_footer) === null || _a === void 0 ? void 0 : _a.setStyleValue('left', -newLeft);
        };
        if (forceUpdate) {
            this.singleShot(update, 10);
        }
        else {
            update();
        }
    }
    /** @ignore */
    _rowFromTarget(dom) {
        let self = this.dom;
        while (dom && dom != self) {
            let itm = component_1.Component.getElement(dom);
            if (itm) {
                let id = itm.getData('row-id');
                if (id !== undefined) {
                    return { id, itm };
                }
            }
            dom = dom.parentElement;
        }
        return undefined;
    }
    _itemClick(e) {
        let hit = this._rowFromTarget(e.target);
        if (hit) {
            this._selectItem(hit.id, hit.itm);
        }
        else {
            this._selectItem(undefined, undefined);
        }
    }
    _itemDblClick(e) {
        let hit = this._rowFromTarget(e.target);
        if (hit) {
            this._selectItem(hit.id, hit.itm);
            let rec = this.m_dataview.getById(hit.id);
            this.emit('dblClick', (0, component_1.EvDblClick)(rec));
            if (this.m_hasMarks) {
                this._toggleMark(rec);
            }
        }
    }
    /** @ignore */
    _itemMenu(e) {
        let dom = e.target, self = this.dom;
        while (dom && dom != self) {
            let itm = component_1.Component.getElement(dom), id = itm === null || itm === void 0 ? void 0 : itm.getData('row-id');
            if (id !== undefined) {
                this._selectItem(id, itm);
                let idx = itm.getData('row-idx');
                let rec = this.m_dataview.getByIndex(idx);
                this._showItemContextMenu(e, rec);
                e.preventDefault();
                return;
            }
            dom = dom.parentElement;
        }
    }
    /**
     *
     */
    _findItem(id) {
        for (let i = 0; i < this.m_visible_rows.length; i++) {
            let itm = this.m_visible_rows[i];
            if (itm.getData('row-id') === id) {
                return itm;
            }
        }
        return null;
    }
    /**
     * @ignore
     * called when an item is selected by mouse
     */
    _selectItem(item, dom_item, scrollIntoView) {
        if (this.m_selection !== undefined) {
            let old = this._findItem(this.m_selection);
            if (old) {
                old.removeClass('@selected');
            }
        }
        this.m_selection = item;
        if (item) {
            if (scrollIntoView) {
                this._scrollIntoView(item, scrollIntoView);
            }
            if (!dom_item) {
                dom_item = this._findItem(item);
            }
            if (dom_item) {
                dom_item.addClass('@selected');
            }
            let rec = this.m_dataview.getById(item);
            this.emit('selectionChange', (0, x4events_1.EvSelectionChange)(rec));
        }
        else {
            this.emit('selectionChange', (0, x4events_1.EvSelectionChange)(null));
        }
    }
    /**
     *
     */
    _showItemContextMenu(event, item) {
        this.emit('contextMenu', (0, x4events_1.EvContextMenu)(event, item));
    }
    /**
     *
     */
    clearSelection() {
        this._selectItem(null, null);
    }
    /**
     * todo: moveto datastore
     */
    exportData(filename) {
        let data = '';
        const fsep = '\t';
        const lsep = '\r\n';
        let rec = '';
        this.m_columns.map((col) => {
            if (rec.length) {
                rec += fsep;
            }
            rec += col.title;
        });
        data += rec + lsep;
        let count = this.m_dataview.count;
        for (let i = 0; i < count; i++) {
            let record = this.m_dataview.getByIndex(i);
            rec = '';
            let cols = this.m_columns.map((col) => {
                let text = record.getField(col.id);
                let fmt = col.formatter;
                if (fmt && fmt instanceof Function) {
                    text = fmt(text, record);
                }
                if (rec.length > 0) {
                    rec += fsep;
                }
                rec += text;
            });
            data += rec + lsep;
        }
        //todo: review that
        data = data.replace(/[àâä]/gm, 'a');
        data = data.replace(/[éèê]/gm, 'e');
        data = data.replace(/[îï]/gm, 'i');
        data = data.replace(/[ûüù]/gm, 'u');
        data = data.replace(/ /gm, ' '); // non breaking space
        (0, tools_1.downloadData)(data, 'text/csv', filename);
    }
    set empty_text(text) {
        this.m_empty_msg.text = text;
    }
    _renderCheck(rec) {
        let icon = '--x4-icon-square';
        if (this.m_marks.has(rec.getID())) {
            icon = '--x4-icon-square-check';
        }
        return new icon_js_1.Icon({ icon: `var(${icon})` });
    }
    _toggleMark(rec) {
        let id = rec.getID();
        let chk = false;
        if (this.m_marks.has(id)) {
            this.m_marks.delete(id);
        }
        else {
            this.m_marks.add(id);
            chk = true;
        }
        this.emit('gridCheck', EvGridCheck(rec, chk));
        this._buildItems(false);
    }
    getMarks() {
        let ids = [];
        for (const v of this.m_marks.values()) {
            ids.push(v);
        }
        return ids;
    }
    clearMarks() {
        if (this.m_marks.size) {
            this.m_marks = new Set();
            this._buildItems(false);
        }
    }
    setFooterData(rec) {
        if (!this.m_footer) {
            return;
        }
        this.m_footer.enumChilds((c) => {
            let cid = c.getData('col');
            if (cid) {
                let col = this.m_columns[cid];
                let value = rec[col.id];
                if (value !== undefined) {
                    if ((0, tools_1.isFunction)(value)) { // FooterRenderer
                        value(c);
                    }
                    else {
                        let text;
                        const fmt = col.formatter;
                        if (fmt && fmt instanceof Function) {
                            text = fmt(value, rec);
                        }
                        else {
                            text = value;
                        }
                        c.setContent(text, false);
                    }
                }
            }
        });
    }
}
exports.GridView = GridView;
