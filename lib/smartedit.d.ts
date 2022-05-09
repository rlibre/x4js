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
import { TextEdit, TextEditProps } from './textedit';
import { DataStore, DataView, Record } from './datastore';
import { Popup, PopupProps, PopupEventMap } from './popup';
import { EvClick } from './x4_events';
declare type Renderer = (rec: Record) => CellData[];
export interface ToolItem {
    text: string;
    callback: (target: TextEdit) => void;
}
export interface SmartEditProps extends TextEditProps {
    store: DataStore;
    field: string;
    minDisplay?: number;
    maxCount?: number;
    autoFill?: boolean;
    renderer: Renderer;
    tools?: ToolItem[];
    searchCallback?: (value: string, view: DataView) => boolean;
}
export declare class SmartEdit extends TextEdit<SmartEditProps> {
    m_popup: PopupTable;
    m_dataview: DataView;
    m_field: string;
    m_minDisplay: number;
    m_maxCount: number;
    m_autoFill: boolean;
    m_renderer: Renderer;
    m_tools: ToolItem[];
    m_searchCallback: (value: string, view: DataView) => boolean;
    constructor(props: SmartEditProps);
    render(props: SmartEditProps): void;
    private _onChange;
    private _onFocus;
    private _onKey;
    private _showSugg;
    isOpen(): boolean;
    componentDisposed(): void;
    private _checkTool;
    private _callTool;
    private _moveNext;
    private _showPopup;
}
interface CellData {
    text: string;
    cls?: string;
}
interface PopupTableEventMap extends PopupEventMap {
    click: EvClick;
}
interface PopupTableProps extends PopupProps<PopupTableEventMap> {
    rows?: number;
    cols?: number;
    minWidth?: number;
}
export declare class PopupTable extends Popup<PopupTableProps, PopupTableEventMap> {
    private m_rows;
    private m_cols;
    private m_cells;
    private m_data;
    private m_minw;
    private m_defcell;
    private m_sel;
    constructor(props: PopupTableProps);
    setRowData(row: number, data: any): void;
    getRowData(row: number): any;
    setCell(row: number, col: number, text: string, cls?: string): void;
    getCell(row: any, col: any): CellData;
    /** @ignore */
    render(): void;
    /**
    * display the popup at a specific position
    * @param x
    * @param y
    */
    displayAt(x: number, y: number, align?: string): void;
    selNext(next: boolean): number;
    get selection(): number;
}
export {};
