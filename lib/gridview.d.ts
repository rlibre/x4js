/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file gridview.ts
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
/**
 * todo: sizable column
 * todo: button in a column
 */
import { VLayout } from './layout';
import { Component, ContainerEventMap, EvDblClick, CProps, HtmlString } from './component';
import { Label } from './label';
import * as Formatters from './formatters';
import { DataView, DataStore, Record } from './datastore';
import { EvContextMenu, EvSelectionChange, BasicEvent, EventDisposer } from "./x4_events";
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
    formatter?: Formatters.FormatFunc;
    cls?: string;
    sortable?: boolean;
}
export declare type CellRenderer = (rec: Record) => Component;
export declare type RowClassifier = (rec: Record, Row: Component) => void;
export declare type ContextMenuGridItem = (event: MouseEvent, item: Record, grid: GridView) => any;
declare type emptyFn = () => string;
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
