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
import { x4document } from './x4dom';
import { Container, Component, EvDblClick } from './component';
import { HLayout, VLayout } from './layout';
import { Popup } from './popup';
import { isFunction } from './tools';
import { MenuItem } from "./menu";
import { EvContextMenu, EvSelectionChange, EvClick, BasicEvent } from "./x4events";
;
/**
 * Standard listview class
 */
export class ListView extends VLayout {
    m_selection;
    m_defer_sel;
    m_container;
    m_view;
    m_topIndex;
    m_itemHeight;
    m_cache; // recycling elements
    constructor(props) {
        super(props);
        this.setDomEvent('keydown', (e) => this.handleKey(e));
        this.setDomEvent('click', (e) => this._handleClick(e));
        this.setDomEvent('dblclick', (e) => this._handleClick(e));
        this.setDomEvent('contextmenu', (e) => this._handleCtxMenu(e));
        this._setTabIndex(props.tabIndex, 0);
        this.mapPropEvents(props, 'click', 'dblClick', 'contextMenu', 'selectionChange', 'cancel');
    }
    componentCreated() {
        if (this.m_props.virtual) {
            this._buildItems();
        }
        else if (this.m_props.populate) {
            this.items = this.m_props.populate(null);
        }
    }
    render(props) {
        props.items = props.items || [];
        props.gadgets = props.gadgets;
        props.renderItem = props.renderItem;
        props.virtual = props.virtual ?? false;
        this.m_topIndex = 0;
        if (props.virtual) {
            console.assert(props.itemHeight !== undefined);
            this.m_itemHeight = props.itemHeight;
            this.m_cache = new Map();
            this.addClass('virtual');
        }
        else {
            this.m_itemHeight = undefined;
            this.m_cache = undefined;
        }
        this._buildContent();
    }
    /**
     * change the list of item displayed
     * @param items - new array of items
     * @deprecated
     */
    set items(items) {
        this.setItems(items);
    }
    get items() {
        return this.m_props.items;
    }
    /**
     * change the list of item displayed
     * @param items - new array of items
     */
    setItems(items, keepSel = true) {
        this.m_props.items = items;
        if (!keepSel) {
            this.m_selection = null;
        }
        if (!this.m_container) {
            this._buildContent();
        }
        else {
            this._buildItems();
        }
    }
    handleKey(ev) {
        let moveSel = (sens) => {
            let items;
            if (isFunction(this.m_props.items)) {
                items = this.m_props.items();
                this.m_props.items = items;
            }
            else {
                items = this.m_props.items;
            }
            let newsel;
            if (!this.m_selection) {
                if (items) {
                    newsel = items[0];
                }
            }
            else {
                let index = items.findIndex((item) => item === this.m_selection.item);
                if (sens > 0 && index < (items.length - 1)) {
                    newsel = items[index + 1];
                }
                else if (sens < 0 && index > 0) {
                    newsel = items[index - 1];
                }
                else {
                    newsel = this.selection;
                }
            }
            let citem = this._findItemWithId(newsel?.id);
            this._selectItem(newsel, citem, true);
        };
        switch (ev.key) {
            case 'ArrowDown': {
                moveSel(1);
                ev.preventDefault();
                ev.stopPropagation();
                break;
            }
            case 'ArrowUp': {
                moveSel(-1);
                ev.preventDefault();
                ev.stopPropagation();
                break;
            }
        }
    }
    /** @ignore */
    _buildContent() {
        let props = this.m_props;
        if (props.virtual) {
            this.m_container = new Container({
                cls: '@scroll-container',
                content: []
            });
            this.m_view = new Container({
                cls: '@scroll-view',
                flex: 1,
                content: this.m_container,
                dom_events: {
                    sizechange: () => this._updateScroll(true),
                    scroll: () => this._updateScroll(false),
                }
            });
            this.setContent([
                this.m_view,
                props.gadgets ? new HLayout({
                    cls: 'gadgets',
                    content: props.gadgets
                }) : null,
            ]);
        }
        else {
            this.m_view = undefined;
            this.m_container = new VLayout({
                cls: '@scroll-container',
                content: []
            });
            this.addClass('@scroll-view');
            this.setContent(this.m_container, false);
        }
        if (props.virtual) {
            this.m_container.setStyleValue('height', props.items.length * this.m_itemHeight);
        }
        if (this.dom || !props.virtual) {
            this._buildItems();
        }
    }
    /**
     *
     */
    _updateScroll(forceUpdate) {
        const update = () => {
            let newTop = Math.floor(this.m_view.dom.scrollTop / this.m_itemHeight);
            if (newTop != this.m_topIndex || forceUpdate) {
                this.m_topIndex = newTop;
                this._buildItems();
            }
        };
        if (forceUpdate) {
            this.startTimer('scroll', 10, false, update);
        }
        else {
            update();
        }
    }
    async _buildItems() {
        let props = this.m_props;
        let items = [];
        let list_items = props.items;
        if (isFunction(list_items)) {
            list_items = list_items();
        }
        let selId = this.m_selection?.item.id;
        let selFnd = false;
        if (props.virtual) {
            let rc = this.getBoundingRect();
            let limit = 100;
            let y = 0;
            let top = this.m_topIndex * this.m_itemHeight;
            let index = this.m_topIndex;
            let height = rc.height;
            let count = props.items.length;
            let newels = [];
            let cache = this.m_cache;
            this.m_cache = new Map();
            while (y < height && index < count && --limit > 0) {
                let it = props.items[index];
                let itm;
                if (cache.has(it.id)) {
                    itm = cache.get(it.id); // reuse it
                    cache.delete(it.id); // cache will contain only elements to remove
                }
                else {
                    itm = this._renderItem(it);
                    newels.push(itm);
                }
                if (selId == it.id) {
                    itm.addClass('@selected');
                    selFnd = true;
                }
                itm.setStyleValue('top', top + y);
                items.push(itm);
                this.m_cache.set(it.id, itm); // keep it for next time
                y += this.m_itemHeight;
                index++;
            }
            // all element remaining here are to remove
            cache.forEach((c) => {
                c.dispose();
            });
            //	append new elements
            this.m_container.appendChild(newels);
            this.m_container.setStyleValue('height', count * this.m_itemHeight);
            // check that it's still existing
            if (!selFnd) {
                if (!list_items.some(it => selId == it.id)) {
                    this.m_selection = null;
                }
            }
        }
        else {
            list_items.forEach((it) => {
                let itm = this._renderItem(it);
                if (selId == it.id) {
                    itm.addClass('@selected');
                    selFnd = true;
                }
                items.push(itm);
            });
            this.m_container.setContent(items, false);
            if (!selFnd) {
                this.m_selection = null;
            }
        }
        if (this.m_defer_sel) {
            let t = this.m_defer_sel;
            this.m_defer_sel = undefined;
            this.selection = t;
        }
    }
    /** @ignore
     * default rendering of an item
     */
    _renderItem(item) {
        const newItem = this.onRenderItem(item);
        newItem.setAttribute('data-id', item.id);
        newItem.addClass('@list-item');
        newItem.setData('item-id', item.id);
        return newItem;
    }
    onRenderItem(item) {
        if (this.m_props.renderItem) {
            return this.m_props.renderItem(item);
        }
        else {
            return new HLayout({ content: item.text });
        }
    }
    /** @ignore */
    _handleClick(e) {
        e.stopImmediatePropagation();
        e.preventDefault();
        let dom = e.target, self = this.dom, list_items = this.m_props.items; // already created by build
        // go up until we find something interesting
        while (dom && dom != self) {
            let itm = Component.getElement(dom), id = itm?.getData('item-id');
            if (id !== undefined) {
                // find the element
                let item = list_items.find((item) => item.id == id);
                if (item) {
                    let event;
                    if (e.type == 'click') {
                        event = EvClick(item);
                        this.emit('click', event);
                    }
                    else {
                        event = EvDblClick(item);
                        this.emit('dblClick', event);
                    }
                    if (!event.defaultPrevented) {
                        this._selectItem(item, itm);
                    }
                }
                else {
                    this._selectItem(null, null);
                }
                return;
            }
            dom = dom.parentElement;
        }
        this._selectItem(null, null);
    }
    /** @ignore */
    _handleCtxMenu(e) {
        e.preventDefault();
        let dom = e.target, self = this.dom, list_items = this.m_props.items; // already created by build;
        while (dom && dom != self) {
            let itm = Component.getElement(dom), id = itm?.getData('item-id');
            if (id) {
                // find the element
                let item = list_items.find((item) => item.id == id);
                if (item) {
                    this._selectItem(item, itm);
                    this.emit('contextMenu', EvContextMenu(e, item));
                }
                return;
            }
            dom = dom.parentElement;
        }
        this.emit('contextMenu', EvContextMenu(e, null));
    }
    /**
     * @ignore
     * called when an item is selected by mouse
     */
    _selectItem(item, citem, notify = true) {
        if (this.m_selection && this.m_selection.citem) {
            this.m_selection.citem.removeClass('@selected');
        }
        this.m_selection = item ? {
            item: item,
            citem: citem
        } : null;
        if (this.m_selection && this.m_selection.citem) {
            this.m_selection.citem.addClass('@selected');
        }
        if (notify) {
            this.emit('selectionChange', EvSelectionChange(item));
        }
    }
    /**
     * return the current selection or null
     */
    get selection() {
        return this.m_selection ? this.m_selection.item : null;
    }
    set selection(id) {
        if (id === null || id === undefined) {
            this._selectItem(null, null);
        }
        else {
            if (isFunction(this.m_props.items)) {
                this.m_defer_sel = id;
            }
            else {
                let item = this.m_props.items.find((item) => item.id == id);
                let citem = this._findItemWithId(item.id);
                this._selectItem(item, citem, false);
            }
        }
    }
    _findItemWithId(id) {
        let citem = null;
        if (this.dom) {
            // make the element visible to user
            // todo: problem with virtual listview
            this.m_container.enumChilds((c) => {
                if (c.getData('item-id') == id) {
                    c.scrollIntoView();
                    citem = c;
                    return true;
                }
            });
        }
        return citem;
    }
    /**
     * append or prepend a new item
     * @param item
     * @param prepend
     * @param select
     */
    appendItem(item, prepend = false, select = true) {
        if (prepend) {
            this.m_props.items.unshift(item);
        }
        else {
            this.m_props.items.push(item);
        }
        if (select) {
            this.selection = null;
        }
        if (!this.m_container) {
            this._buildContent();
        }
        else {
            this._buildItems();
        }
        if (select) {
            this.selection = item.id;
        }
    }
    /**
     * update an item
     */
    updateItem(id, item) {
        // find item
        const idx = this.m_props.items.findIndex(itm => itm.id === id);
        if (idx < 0) {
            return;
        }
        // take care of selection
        let was_sel = false;
        if (this.m_selection && this.m_selection.item === this.m_props.items[idx]) {
            was_sel = true;
        }
        // replace it in the list
        this.m_props.items[idx] = item;
        // rebuild & replace it's line
        const oldDOM = this.queryItem(`[data-id="${item.id}"]`)?.dom;
        if (oldDOM) {
            const _new = this._renderItem(item);
            if (was_sel) {
                _new.addClass('@selected');
                this.m_selection.citem = _new;
                this.m_selection.item = item;
            }
            const newDOM = _new._build();
            this.m_container.dom.replaceChild(newDOM, oldDOM);
        }
    }
}
export function EvCancel(context = null) {
    return BasicEvent({ context });
}
/**
 *
 */
export class PopupListView extends Popup {
    m_list;
    constructor(props) {
        super({ tabIndex: false });
        this.enableMask(false);
        this.addClass("@non-maskable");
        props.tabIndex = false;
        this.m_list = new ListView(props);
        //this.m_list.addClass( '@fit' );
        this.setContent(this.m_list);
        this.mapPropEvents(props, 'cancel');
    }
    set items(items) {
        this.m_list.items = items;
    }
    handleKey(ev) {
        this.m_list.handleKey(ev);
    }
    // todo: move into popup
    _handleClick = (e) => {
        if (!this.dom) {
            return;
        }
        let newfocus = e.target;
        // child of this: ok
        if (this.dom.contains(newfocus)) {
            return;
        }
        // menu: ok
        let dest = Component.getElement(newfocus, MenuItem);
        if (dest) {
            return;
        }
        this.signal('cancel', EvCancel());
        this.close();
    };
    // todo: move into popup
    show(modal) {
        x4document.addEventListener('mousedown', this._handleClick);
        super.show(modal);
    }
    hide() {
        x4document.removeEventListener('mousedown', this._handleClick);
        super.hide();
    }
    // todo: move into popup
    close() {
        x4document.removeEventListener('mousedown', this._handleClick);
        super.close();
    }
    get selection() {
        return this.m_list.selection;
    }
    set selection(itemId) {
        this.m_list.selection = itemId;
    }
}
