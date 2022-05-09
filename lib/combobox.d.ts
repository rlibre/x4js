/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file combobox.ts
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
 * TODO: replace custom combo list by listview or gridview
 */
import { Component, CProps, ContainerEventMap } from './component';
import { EvChange, EvSelectionChange, EventCallback } from './x4_events';
import { Input } from './input';
import { HLayout } from './layout';
import { ListViewItem, PopulateItems, EvCancel } from './listview';
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
    items?: ListViewItem[];
    populate?: PopulateItems;
    value?: any;
    renderer?: ComboItemRender;
    selectionChange?: EventCallback<EvSelectionChange>;
}
/**
 * @review use textedit
 */
export declare class ComboBox extends HLayout<ComboBoxProps, ComboBoxEventMap> {
    private m_ui_input;
    private m_ui_button;
    private m_popup;
    private m_selection;
    private m_defer_sel;
    constructor(props: ComboBoxProps);
    set items(items: ListViewItem[]);
    /** @ignore */
    render(props: ComboBoxProps): void;
    componentDisposed(): void;
    /**
     * display the popup
     */
    showPopup(): void;
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
    static storeProxy(props: ComboStoreProxyProps): PopulateItems;
}
export {};
