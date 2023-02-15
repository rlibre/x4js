/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file layout.ts
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
*/
import { Component, Container } from './component';
import { isArray } from './tools';
// ============================================================================
// [ABSLAYOUT]
// ============================================================================
export class AbsLayout extends Container {
}
// ============================================================================
// [HLAYOUT]
// ============================================================================
export class HLayout extends Container {
}
// ============================================================================
// [VLAYOUT]
// ============================================================================
export class VLayout extends Container {
}
export class AutoLayout extends Container {
    constructor(props) {
        super(props);
        this.setDomEvent('sizechange', () => this._updateLayout());
    }
    componentCreated() {
        super.componentCreated();
        this._updateLayout();
    }
    _updateLayout() {
        let horz = this.m_props.defaultLayout == 'horizontal' ? true : false;
        if (this.m_props.switchSize <= 0 && window.screen.height > window.screen.width) {
            horz = !horz;
        }
        else {
            let rc = this.getBoundingRect();
            if ((horz && rc.width < this.m_props.switchSize) || (!horz && rc.height < this.m_props.switchSize)) {
                horz = !horz;
            }
        }
        if (horz) {
            this.removeClass('@vlayout');
            this.addClass('@hlayout');
        }
        else {
            this.addClass('@vlayout');
            this.removeClass('@hlayout');
        }
    }
}
export class GridLayout extends Container {
    constructor(props) {
        /// @ts-ignore
        // Argument of type 'GridLayoutProps' is not assignable to parameter of type 'P'.
        // 'GridLayoutProps' is assignable to the constraint of type 'P', but 'P' could be instantiated with a different subtype of constraint 'GridLayoutProps'.
        super(props);
    }
    /** @ignore */
    render() {
        if (this.m_props.colSizes) {
            this.setStyleValue('grid-template-columns', this.m_props.colSizes);
        }
        if (this.m_props.rowSizes) {
            this.setStyleValue('grid-template-rows', this.m_props.rowSizes);
        }
        if (this.m_props.colGap) {
            this.setStyleValue('grid-gap', this.m_props.colGap);
        }
        if (this.m_props.template) {
            this.setStyleValue('grid-template-areas', this.m_props.template.join('\n'));
        }
    }
}
export class TableLayout extends Container {
    m_cells;
    constructor(props) {
        super(props);
        this.setTag('table');
        this.m_cells = new Map();
    }
    _getCell(row, col, create = true) {
        let idx = _mkid(row, col);
        return this.m_cells.get(idx) ?? (create ? { item: undefined } : null);
    }
    _setCell(row, col, cell, update = false) {
        let idx = _mkid(row, col);
        this.m_cells.set(idx, cell);
        if (this.dom && cell.item && update) {
            if (cell.item instanceof Component) {
                cell.item.update();
            }
            else {
                this.enumChilds((c) => {
                    let crow = c.getData('row');
                    if (crow == row) {
                        let ccol = c.getData('col');
                        if (ccol == col) {
                            c.setContent(cell.item);
                            c.update();
                            return true;
                        }
                    }
                });
            }
        }
    }
    setCell(row, col, item) {
        let cell = this._getCell(row, col);
        cell.item = item;
        this._setCell(row, col, cell, true);
    }
    merge(row, col, rowCount, colCount) {
        let cell = this._getCell(row, col);
        cell.rowSpan = rowCount;
        cell.colSpan = colCount;
        this._setCell(row, col, cell);
    }
    setCellWidth(row, col, width) {
        let cell = this._getCell(row, col);
        cell.width = width;
        this._setCell(row, col, cell);
    }
    setCellHeight(row, col, height) {
        let cell = this._getCell(row, col);
        cell.height = height;
        this._setCell(row, col, cell);
    }
    setCellClass(row, col, cls) {
        let cell = this._getCell(row, col);
        cell.cls = cls;
        this._setCell(row, col, cell);
    }
    setColClass(col, cls) {
        let cell = this._getCell(-1, col);
        cell.cls = cls;
        this._setCell(-1, col, cell);
    }
    setRowClass(row, cls) {
        let cell = this._getCell(row, 999);
        cell.cls = cls;
        this._setCell(row, 999, cell);
    }
    getCell(row, col) {
        let cell = this._getCell(row, col);
        return cell?.item;
    }
    render() {
        let rows = [];
        let skip = [];
        for (let r = 0; r < this.m_props.rows; r++) {
            let cols = [];
            for (let c = 0; c < this.m_props.columns; c++) {
                let idx = _mkid(r, c);
                if (skip.indexOf(idx) >= 0) {
                    continue;
                }
                let cell = this.m_cells.get(idx);
                let cdata = this.m_cells.get(_mkid(-1, c));
                let cls = '';
                if (cell && cell.cls) {
                    cls = cell.cls;
                }
                if (cdata && cdata.cls) {
                    cls += ' ' + cdata.cls;
                }
                let cc = new Component({
                    tag: 'td',
                    content: cell?.item,
                    width: cell?.width,
                    height: cell?.height,
                    data: { row: r, col: c },
                    cls
                });
                if (cell) {
                    let rs = cell.rowSpan ?? 0, cs = cell.colSpan ?? 0;
                    if (rs > 0) {
                        cc.setAttribute('rowspan', rs + 1);
                    }
                    if (cs > 0) {
                        cc.setAttribute('colspan', cs + 1);
                    }
                    if (rs || cs) {
                        for (let sr = 0; sr <= rs; sr++) {
                            for (let sc = 0; sc <= cs; sc++) {
                                skip.push(_mkid(sr + r, sc + c));
                            }
                        }
                    }
                }
                cols.push(cc);
            }
            let rdata = this._getCell(r, 999, false);
            let rr = new Component({
                tag: 'tr',
                data: { row: r },
                content: cols,
                cls: rdata?.cls
            });
            rows.push(rr);
        }
        this.setContent(rows);
    }
}
/**
 * @ignore
 */
function _mkid(row, col) {
    return row * 1000 + col;
}
/**
 * @ignore
 */
function _getid(key) {
    return {
        row: Math.floor(key / 1000) | 0,
        col: (key % 1000) | 0
    };
}
export class ScrollView extends Component {
    constructor(props) {
        super(props);
        this.setContent(props.content);
    }
    setContent(content) {
        if (!content) {
            super.setContent(null);
        }
        else {
            let container;
            if (isArray(content)) {
                container = new VLayout({ content });
            }
            else {
                container = content;
            }
            container.addClass('@scroll-container');
            super.setContent(container);
        }
    }
}
// :: MASONERY ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// from a nice article of Andy Barefoot
//	https://medium.com/@andybarefoot/a-masonry-style-layout-using-css-grid-8c663d355ebb
export class Masonry extends Container {
    constructor(props) {
        const items = props.items;
        props.items = undefined;
        super(props);
        this.setDomEvent('sizechange', () => {
            this.resizeAllItems();
        });
        if (items) {
            items.forEach(i => {
                this.addItem(i);
            });
        }
    }
    resizeItem(item) {
        const style = this.getComputedStyle();
        const rowHeight = style.parse('grid-auto-rows');
        const rowGap = style.parse('grid-row-gap');
        let content = item.queryItem('.content');
        if (!content) {
            content = item;
        }
        if (content && (rowHeight + rowGap)) {
            const rc = content.getBoundingRect();
            const rowSpan = Math.ceil((rc.height + rowGap) / (rowHeight + rowGap));
            item.setStyleValue('gridRowEnd', "span " + rowSpan);
        }
    }
    resizeAllItems() {
        this.queryAll(".item", (itm) => {
            ;
            this.resizeItem(itm);
        });
    }
    addItem(itm) {
        itm.addClass('content');
        this.appendChild(new Container({
            cls: 'item',
            content: itm
        }));
    }
}
