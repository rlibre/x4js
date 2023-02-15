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
import { VLayout } from './layout';
import { Component, ContainerEventMap, EvDblClick, CProps, HtmlString } from './component';
import { Label } from './label';
import { FormatFunc } from './formatters';
import { DataView, DataStore, Record } from './datastore';
import { EvContextMenu, EvSelectionChange, BasicEvent, EventDisposer } from "./x4events";
export interface EvGridCheck extends BasicEvent {
    rec: Record;
    chk: boolean;
}
export declare function EvGridCheck(rec: Record, chk: boolean): EvGridCheck;
/**
 *
 */
export interface GridColumn {
    id: any;
    title: string;
    width: number;
    flex?: number;
    align?: 'left' | 'center' | 'right';
    renderer?: CellRenderer;
    formatter?: FormatFunc;
    cls?: string;
    sortable?: boolean;
}
export type CellRenderer = (rec: Record) => Component;
export type RowClassifier = (rec: Record, Row: Component) => void;
export type ContextMenuGridItem = (event: MouseEvent, item: Record, grid: GridView) => any;
type emptyFn = () => string;
interface GridViewEventMap extends ContainerEventMap {
    dblClick?: EvDblClick;
    selectionChange?: EvSelectionChange;
    contextMenu?: EvContextMenu;
    gridCheck?: EvGridCheck;
}
export interface GridViewProps extends CProps<GridViewEventMap> {
    store: DataStore | DataView;
    columns: GridColumn[];
    calcRowClass?: RowClassifier;
    empty_text?: string | emptyFn;
    hasMarks?: boolean;
    hasFooter?: boolean;
}
/**
 * gridview class
 */
export declare class GridView extends VLayout<GridViewProps, GridViewEventMap> {
    protected m_dataview: DataView;
    protected m_data_cx: EventDisposer;
    protected m_columns: GridColumn[];
    protected m_view_el: Component;
    protected m_container: Component;
    protected m_header: Component;
    protected m_footer: Component;
    protected m_empty_msg: Label;
    protected m_empty_text: string | emptyFn;
    protected m_selection: any;
    private m_itemHeight;
    private m_topIndex;
    protected m_visible_rows: Component[];
    protected m_hasMarks: boolean;
    protected m_marks: Set<any>;
    private m_recycler;
    private m_rowClassifier;
    constructor(props: GridViewProps);
    componentCreated(): void;
    /**
     *
     */
    private _moveSel;
    /**
     *
     */
    private _handleKey;
    /**
     *
     */
    getNextSel(sens: number): any;
    private _scrollIntoView;
    /**
     * change the list of item displayed
     * @param items - new array of items
     */
    setStore(store: DataStore | DataView): void;
    getView(): DataView;
    /**
     * return the current selection (row id) or null
     */
    getSelection(): any;
    getSelRec(): Record;
    setSelection(recId: any): void;
    /** @ignore */
    render(): void;
    private _on_col_resize;
    /**
     *
     */
    sortCol(name: string, asc?: boolean): void;
    /**
     *
     */
    private _sortCol;
    /**
     *
     */
    private _computeItemHeight;
    private _createRow;
    private _buildItems;
    /**
     *
     */
    private _updateScroll;
    /** @ignore */
    private _rowFromTarget;
    private _itemClick;
    private _itemDblClick;
    /** @ignore */
    private _itemMenu;
    /**
     *
     */
    private _findItem;
    /**
     * @ignore
     * called when an item is selected by mouse
     */
    protected _selectItem(item: any, dom_item: Component, scrollIntoView?: string): void;
    /**
     *
     */
    protected _showItemContextMenu(event: MouseEvent, item: Record): void;
    /**
     *
     */
    clearSelection(): void;
    /**
     * todo: moveto datastore
     */
    exportData(filename: any): void;
    set empty_text(text: string | HtmlString);
    private _renderCheck;
    private _toggleMark;
    getMarks(): any[];
    clearMarks(): void;
    setFooterData(rec: any): void;
}
export {};
