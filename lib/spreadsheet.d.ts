/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file spreadsheet.ts
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
import { Component, EvDblClick, ContainerEventMap, ContainerProps } from './component';
import { InputProps } from './input';
import { VLayout } from './layout';
import * as Formatters from './formatters';
import { EvContextMenu, EvChange, EvSelectionChange, EventCallback } from './x4_events';
export interface EditorFactory {
    (props: InputProps, row: number, col: number): Component;
}
/**
 *
 */
export interface ColProp {
    title: string;
    width: number;
    formatter?: string;
    align?: string;
    cls?: string;
    min_width?: number;
    renderer?: Formatters.FormatFunc;
    createEditor?: EditorFactory;
}
/**
 *
 */
export interface SpreadsheetEventSet extends ContainerEventMap {
    change?: EvChange;
    dblClick?: EvDblClick;
    selectionChange?: EvSelectionChange;
    contextMenu?: EvContextMenu;
}
/**
 *
 */
export interface SpreadsheetProps extends ContainerProps {
    columns: ColProp[];
    maxrows?: number;
    autoedit?: boolean;
    change?: EventCallback<EvChange>;
    dblClick?: EventCallback<EvDblClick>;
    selectionChange?: EventCallback<EvSelectionChange>;
    contextMenu?: EventCallback<EvContextMenu>;
}
/**
 *
 */
export declare class Spreadsheet extends VLayout<SpreadsheetProps, SpreadsheetEventSet> {
    private m_columns;
    private m_row_limit;
    private m_cells_data;
    private m_rows_data;
    protected m_view: Component;
    protected m_container: Component;
    protected m_header: Component;
    private m_itemHeight;
    private m_topIndex;
    private m_visible_cells;
    private m_row_count;
    private m_selection;
    private m_editor;
    private m_autoedit;
    private m_lockupdate;
    private m_auto_row_count;
    private m_recycler;
    private m_used_cells;
    constructor(props: SpreadsheetProps);
    componentCreated(): void;
    setColWidth(col: number, width: number): void;
    getColWidth(col: number): number;
    setColTitle(col: number, title: string): void;
    reset(columns: ColProp[]): void;
    /**
     * insert a row
     * @param before row number before wich insert the new row
     */
    insertRow(before: number): void;
    /**
     * remove a row
     * @param rowtodel row number to remove
     */
    deleteRow(rowtodel: number): void;
    /**
     * insert a new column
     * @param before column index before to insert the new column or <0 to append
     */
    insertCol(before: number, column: ColProp): void;
    /**
     * remove a column
     * @param coltodel
     */
    deleteCol(coltodel: number): void;
    /**
     *
     * @param row
     * @param col
     */
    private _getCellData;
    private _focus;
    private _ctxMenu;
    /** @ignore */
    render(): void;
    /**
     *
     */
    private _on_col_resize;
    /**
     * compute misc dimensions
     * - item height
     * - scroll width
     */
    private _computeItemHeight;
    /**
     * compute columns widths
     * use col.width for fixed size columns
     * if col.width < 0 that mean that this is a proportion of the remaining space
     */
    private _calcColWidths;
    /**
     * create a cell (component)
     * and append it to the parent view
     * if a cell was reviously recyled, use it
     */
    private _createCell;
    /**
     * build cells of the spreadsheet
     * cells are recycled when scrolling,
     * only visibles cells exists
     */
    private _buildItems;
    /** @ignore */
    private _itemClick;
    private _itemDblClick;
    /**
     *
     * @param rowIdx
     * @param colIdx
     * @param scrollIntoView
     */
    protected _selectItem(rowIdx: number, colIdx: number, scrollIntoView?: boolean): void;
    private _scrollIntoView;
    /**
     *
     * @param row
     * @param col
     */
    private _findItem;
    /**
     *
     */
    private _updateScroll;
    /**
     *
     * @param event
     * @param t
     */
    private _moveSel;
    private _handleKey;
    private _keyPress;
    /**
     * return the selection
     * { row, col }
     */
    getSelection(): {
        row: number;
        col: number;
    };
    select(row: number, col: number, scrollIntoView?: boolean): void;
    /**
     * return the row count
     */
    rowCount(): number;
    /**
     * return the maximum row index filled with something
     */
    getMaxRowCount(): number;
    getColCount(): number;
    setRowStyle(row: number, cls: string): void;
    getRowStyle(row: number): string;
    setCellStyle(row: number, col: number, cls: string): void;
    getCellText(row: number, col: number): string;
    getCellNumber(row: number, col: number): number;
    clearRow(row: number): void;
    clearCell(row: number, col: number): void;
    editCurCell(forceText?: string): void;
    editCell(row: number, col: number, forcedText?: string): void;
    _setupEditor(): void;
    killEditor(save: boolean): void;
    clearData(): void;
    setCellText(row: number, col: number, value: string): void;
    lockUpdate(start: boolean): void;
}
