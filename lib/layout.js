"use strict";
/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
 * @file layout.ts
 * @author Etienne Cochard
 * @license
 * Copyright (c) 2019-2021 R-libre ingenierie
 *
 *	This program is free software; you can redistribute it and/or modify
 *	it under the terms of the GNU General Public License as published by
 *	the Free Software Foundation; either version 3 of the License, or
 *	(at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU General Public License for more details.
 *
 *	You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>..
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrollView = exports.TableLayout = exports.GridLayout = exports.AutoLayout = exports.VLayout = exports.HLayout = exports.AbsLayout = void 0;
const component_1 = require("./component");
const tools_1 = require("./tools");
// ============================================================================
// [ABSLAYOUT]
// ============================================================================
class AbsLayout extends component_1.Container {
}
exports.AbsLayout = AbsLayout;
// ============================================================================
// [HLAYOUT]
// ============================================================================
class HLayout extends component_1.Container {
}
exports.HLayout = HLayout;
// ============================================================================
// [VLAYOUT]
// ============================================================================
class VLayout extends component_1.Container {
}
exports.VLayout = VLayout;
class AutoLayout extends component_1.Container {
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
exports.AutoLayout = AutoLayout;
class GridLayout extends component_1.Container {
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
exports.GridLayout = GridLayout;
class TableLayout extends component_1.Container {
    m_cells;
    constructor(props) {
        super(props);
        this.setProp('tag', 'table');
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
            if (cell.item instanceof component_1.Component) {
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
                let cc = new component_1.Component({
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
            let rr = new component_1.Component({
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
exports.TableLayout = TableLayout;
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
class ScrollView extends component_1.Component {
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
            if ((0, tools_1.isArray)(content)) {
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
exports.ScrollView = ScrollView;
