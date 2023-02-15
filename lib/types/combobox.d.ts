/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file combobox.ts
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
/**
 * TODO: replace custom combo list by listview or gridview
 */
import { Component, CProps, ContainerEventMap } from './component';
import { EvChange, EvSelectionChange, EventCallback } from './x4events';
import { Input } from './input';
import { HLayout } from './layout';
import { ListViewItem, EvCancel, PopulateItems } from './listview';
import { DataStore, DataView, Record } from './datastore';
import { HtmlString } from './tools';
export interface ComboStoreProxyProps {
    store: DataView | DataStore;
    display: (rec: Record) => string | HtmlString;
}
export interface ComboItemRender {
    (itm: ListViewItem): Component;
}
interface ComboBoxEventMap extends ContainerEventMap {
    readonly change: EvChange;
    readonly selectionChange?: EvSelectionChange;
    readonly cancel?: EvCancel;
}
export interface ComboBoxProps extends CProps<ComboBoxEventMap> {
    tabIndex?: number | boolean;
    name?: string;
    readOnly?: boolean;
    label?: string;
    labelWidth?: number;
    labelAlign?: 'left' | 'right';
    items?: ListViewItem[] | PopulateItems;
    value?: any;
    renderer?: ComboItemRender;
    selectionChange?: EventCallback<EvSelectionChange>;
    editable?: boolean;
}
/**
 * @review use textedit
 */
export declare class ComboBox extends HLayout<ComboBoxProps, ComboBoxEventMap> {
    private m_ui_input;
    private m_ui_button;
    private m_popup;
    private m_lockpop;
    private m_lockchg;
    private m_popvis;
    private m_selection;
    constructor(props: ComboBoxProps);
    _onKey(e: any): void;
    set items(items: ListViewItem[]);
    /** @ignore */
    render(props: ComboBoxProps): void;
    componentDisposed(): void;
    /**
     * display the popup
     */
    showPopup(filter_items?: boolean): ListViewItem[];
    /** @ignore
      */
    private _selectItem;
    /**
     *
     */
    private _setInput;
    /**
     *
     */
    get value(): any;
    get valueText(): string | HtmlString;
    /**
     *
     */
    set value(id: any);
    get input(): Input;
    _checkFocus(): void;
    _hidePopup(): void;
    static storeProxy(props: ComboStoreProxyProps): PopulateItems;
    focus(): void;
}
export {};
