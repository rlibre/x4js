/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file listview.ts
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
import { Container, Component, CProps, ContainerEventMap, EvDblClick } from './component';
import { IconID } from './icon';
import { VLayout } from './layout';
import { Popup, PopupEventMap, PopupProps } from './popup';
import { HtmlString } from './tools';
import { EvContextMenu, EvSelectionChange, EvClick, EventCallback, BasicEvent } from "./x4_events";
/**
 * item definition
 */
export declare class ListViewItem {
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
export interface ListViewProps<E extends ListViewEventMap = ListViewEventMap> extends CProps<E> {
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
export declare class ListView<T extends ListViewProps = ListViewProps, E extends ListViewEventMap = ListViewEventMap> extends VLayout<T, E> {
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
    constructor(props: T);
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
    get selection(): ListViewItem;
    set selection(id: ListViewItem);
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
