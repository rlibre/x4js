/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file listview.ts
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
import { Container, Component, ContainerProps, ContainerEventMap, EvDblClick } from './component';
import { IconID } from './icon';
import { VLayout } from './layout';
import { Popup, PopupEventMap, PopupProps } from './popup';
import { HtmlString } from './tools';
import { EvContextMenu, EvSelectionChange, EvClick, EventCallback, BasicEvent } from "./x4events";
/**
 * item definition
 */
export interface ListViewItem {
    id: any;
    text?: string | HtmlString;
    html?: boolean;
    icon?: IconID;
    data?: any;
}
/**
 * callback to render item
 */
export interface RenderListItem {
    (item: ListViewItem): any;
}
/**
 * callback to fill the list
 */
export interface PopulateItems {
    (): ListViewItem[];
}
/**
 * listview can generate these events
 */
export interface ListViewEventMap extends ContainerEventMap {
    click?: EvClick;
    dblClick?: EvDblClick;
    contextMenu?: EvContextMenu;
    selectionChange?: EvSelectionChange;
    cancel?: EvCancel;
}
/**
 * listview properties
 */
export interface ListViewProps<E extends ListViewEventMap = ListViewEventMap> extends ContainerProps<E> {
    items?: ListViewItem[];
    populate?: PopulateItems;
    gadgets?: Component[];
    virtual?: boolean;
    itemHeight?: number;
    renderItem?: RenderListItem;
    click?: EventCallback<EvClick>;
    dblClick?: EventCallback<EvDblClick>;
    contextMenu?: EventCallback<EvContextMenu>;
    selectionChange?: EventCallback<EvSelectionChange>;
    cancel?: EventCallback<EvCancel>;
}
/**
 * Standard listview class
 */
export declare class ListView extends VLayout<ListViewProps, ListViewEventMap> {
    protected m_selection: {
        item: ListViewItem;
        citem: Component;
    };
    protected m_defer_sel: any;
    protected m_container: Container;
    protected m_view: Container;
    protected m_topIndex: number;
    protected m_itemHeight: number;
    protected m_cache: Map<number, Component>;
    constructor(props: ListViewProps);
    componentCreated(): void;
    render(props: ListViewProps): void;
    /**
     * change the list of item displayed
     * @param items - new array of items
     * @deprecated
     */
    set items(items: ListViewItem[]);
    get items(): ListViewItem[];
    /**
     * change the list of item displayed
     * @param items - new array of items
     */
    setItems(items: ListViewItem[], keepSel?: boolean): void;
    private _handleKey;
    /** @ignore */
    private _buildContent;
    /**
     *
     */
    private _updateScroll;
    private _buildItems;
    /** @ignore
     * default rendering of an item
     */
    private _renderItem;
    onRenderItem(item: ListViewItem): Component;
    /** @ignore */
    private _handleClick;
    /** @ignore */
    private _handleCtxMenu;
    /**
     * @ignore
     * called when an item is selected by mouse
     */
    protected _selectItem(item: ListViewItem, citem: Component, notify?: boolean): void;
    /**
     * return the current selection or null
     */
    get selection(): any;
    set selection(id: any);
    private _findItemWithId;
    /**
     * append or prepend a new item
     * @param item
     * @param prepend
     * @param select
     */
    appendItem(item: ListViewItem, prepend?: boolean, select?: boolean): void;
    /**
     * update an item
     */
    updateItem(id: any, item: ListViewItem): void;
}
/**
 * Cancel Event
 */
export interface EvCancel extends BasicEvent {
}
export declare function EvCancel(context?: any): EvCancel;
interface PopupListViewEventMap extends PopupEventMap {
    cancel: EvCancel;
}
interface PopupListViewProps extends PopupProps<PopupListViewEventMap> {
}
/**
 *
 */
export declare class PopupListView extends Popup<PopupListViewProps, PopupListViewEventMap> {
    m_list: ListView;
    constructor(props: ListViewProps);
    set items(items: ListViewItem[]);
    private _handleClick;
    show(modal?: boolean): void;
    hide(): void;
    close(): void;
    get selection(): any;
    set selection(itemId: any);
}
export {};
