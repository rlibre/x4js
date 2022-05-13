/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file smartedit.ts
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
