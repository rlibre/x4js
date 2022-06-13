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

import { x4document } from './x4dom'

import { Container, Component, ContainerProps, ContainerEventMap, EvDblClick } from './component'
import { IconID } from './icon';
import { HLayout, VLayout } from './layout'
import { Popup, PopupEventMap, PopupProps } from './popup';
import { HtmlString, isFunction } from './tools';
import { Menu, MenuItem } from "./menu";

import { EvContextMenu, EvSelectionChange, EvClick, EventCallback, BasicEvent, EvChange } from "./x4events";

/**
 * item definition
 */

export interface ListViewItem {
	id: any;
	text?: string | HtmlString;		// if you need pure text
	html?: boolean;		// if text is html
	icon?: IconID;
	data?: any;
};

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
	gadgets?: Component[]; // gadgets to instert at bottom

	virtual?: boolean;	// if true, items will be rendered on demand
	itemHeight?: number;	// in case of a virtual list, item height

	renderItem?: RenderListItem;

	click?: EventCallback<EvClick>;	// shortcut to events: { click: ... }
	dblClick?: EventCallback<EvDblClick>;// shortcut to events: { dblClick: ... }
	contextMenu?: EventCallback<EvContextMenu>;// shortcut to events: { contentMenu: ... }
	selectionChange?: EventCallback<EvSelectionChange>;// shortcut to events: { selectionChange: ... }
	cancel?: EventCallback<EvCancel>;	// shortcut to events: { cancel: ... }
}

/**
 * Standard listview class
 */

export class ListView extends VLayout<ListViewProps,ListViewEventMap> {

	protected m_selection: {
		item: ListViewItem;
		citem: Component;
	}

	protected m_defer_sel: any;

	protected m_container: Container;
	protected m_view: Container;

	protected m_topIndex: number;
	protected m_itemHeight: number;

	protected m_cache: Map<number, Component>; // recycling elements

	constructor(props: ListViewProps) {
		super(props);

		this.setDomEvent('keydown', (e) => this._handleKey(e));
		this.setDomEvent('click', (e) => this._handleClick(e));
		this.setDomEvent('dblclick', (e) => this._handleClick(e));
		this.setDomEvent('contextmenu', (e) => this._handleCtxMenu(e));

		this._setTabIndex(props.tabIndex, 0);
		this.mapPropEvents(props, 'click', 'dblClick', 'contextMenu', 'selectionChange', 'cancel' );
	}

	componentCreated() {

		if (this.m_props.virtual) {
			this._buildItems();
		}
		else if( this.m_props.populate ) {
			this.items = this.m_props.populate( );
		}
	}

	render(props: ListViewProps) {

		props.items = props.items || [];
		props.gadgets = props.gadgets;
		props.renderItem = props.renderItem;
		props.virtual = props.virtual ?? false;

		this.m_topIndex = 0;

		if (props.virtual) {
			console.assert(props.itemHeight !== undefined);
			this.m_itemHeight = props.itemHeight;
			this.m_cache = new Map<number, Component>();
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

	public set items(items: ListViewItem[]) {
		this.setItems( items );
	}

	public get items( ) {
		return this.m_props.items;
	}

	/**
	 * change the list of item displayed
	 * @param items - new array of items
	 */
	
	public setItems( items: ListViewItem[], keepSel = true ) {
		this.m_props.items = items;

		if( !keepSel ) {
			this.m_selection = null;
		}
		
		if( !this.m_container ) {
			this._buildContent( );
		}
		else {
			this._buildItems( );
		}
	}

	private _handleKey(ev: KeyboardEvent) {

		let moveSel = (sens) => {

			let items: ListViewItem[];
			if (isFunction(this.m_props.items)) {
				items = this.m_props.items();
				this.m_props.items = items;
			}
			else {
				items = this.m_props.items;
			}

			let newsel: ListViewItem;
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
					newsel = this.selection
				}
			}

			let citem = this._findItemWithId(newsel?.id);
			this._selectItem(newsel, citem, true);
		}

		switch (ev.key) {
			case 'ArrowDown': {
				moveSel(1);
				ev.stopPropagation();
				break;
			}

			case 'ArrowUp': {
				moveSel(-1);
				ev.stopPropagation();
				break;
			}
		}
	}

	/** @ignore */
	private _buildContent() {

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

			this.setContent(
				[
					this.m_view,
					props.gadgets ? new HLayout({
						cls: 'gadgets',
						content: props.gadgets
					}) : null,
				]
			);
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

		if (this.dom || !props.virtual ) {
			this._buildItems();
		}
	}

	/**
	 * 
	 */

	private _updateScroll(forceUpdate: boolean) {

		const update = () => {
			let newTop = Math.floor(this.m_view.dom.scrollTop / this.m_itemHeight);

			if (newTop != this.m_topIndex || forceUpdate) {
				this.m_topIndex = newTop;
				this._buildItems();
			}
		}

		if (forceUpdate) {
			this.startTimer('scroll', 10, false, update);
		}
		else {
			update();
		}
	}

	private async _buildItems() {
		let props = this.m_props;
		let items: Component[] = [];

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
			this.m_cache = new Map<number, Component>();

			while (y < height && index < count && --limit > 0) {

				let it = props.items[index];
				let itm: Component;

				if (cache.has(it.id)) {
					itm = cache.get(it.id);	// reuse it
					cache.delete(it.id);		// cache will contain only elements to remove
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

				this.m_cache.set(it.id, itm);	// keep it for next time

				y += this.m_itemHeight;
				index++;
			}

			// all element remaining here are to remove
			cache.forEach((c) => {
				c.dispose();
			});

			//	append new elements
			this.m_container.appendChild(newels);
			this.m_container.setStyleValue( 'height', count*this.m_itemHeight );

			// check that it's still existing
			if( !selFnd ) {
				if( !list_items.some( it => selId == it.id ) ) {
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

			if( !selFnd ) {
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

	private _renderItem(item: ListViewItem): Component {
		
		const newItem = this.onRenderItem( item );

		newItem.setAttribute( 'data-id', item.id );
		newItem.addClass('@list-item');
		newItem.setData('item-id', item.id);
					
		return newItem;
	}

	onRenderItem( item: ListViewItem): Component {
		if (this.m_props.renderItem) {
			return this.m_props.renderItem(item);
		}
		else {
			return new HLayout({ content: item.text });
		}
	}

	/** @ignore */
	private _handleClick(e: MouseEvent) {

		let dom = e.target as HTMLElement,
			self = this.dom,
			list_items = this.m_props.items as ListViewItem[];	// already created by build

		// go up until we find something interesting
		while (dom && dom != self) {
			let itm = Component.getElement(dom),
				id = itm?.getData('item-id');

			if (id!==undefined) {
				// find the element
				let item = list_items.find((item) => item.id == id);
				if (item) {
					let event: BasicEvent;
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
	private _handleCtxMenu(e: MouseEvent) {

		e.preventDefault();		

		let dom = e.target as HTMLElement,
			self = this.dom,
			list_items = this.m_props.items as ListViewItem[];	// already created by build;

		while (dom && dom != self) {
			let itm = Component.getElement(dom),
				id = itm?.getData('item-id');

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

	protected _selectItem(item: ListViewItem, citem: Component, notify = true) {

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

	public get selection() {
		return this.m_selection ? this.m_selection.item : null;
	}

	public set selection(id: any) {
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

	private _findItemWithId(id: any) {
		let citem: Component = null;

		if (this.dom) {
			// make the element visible to user
			// todo: problem with virtual listview
			this.m_container.enumChilds((c: Component) => {
				if (c.getData('item-id') == id) {
					c.scrollIntoView();
					citem = c;
					return true;
				}
			})
		}

		return citem;
	}

	/**
	 * append or prepend a new item
	 * @param item 
	 * @param prepend 
	 * @param select 
	 */

	appendItem( item: ListViewItem, prepend = false, select = true ) {
		
		if( prepend ) {
			this.m_props.items.unshift( item );
		}
		else {
			this.m_props.items.push( item );
		}

		if( select ) {
			this.selection = null;
		}

		if( !this.m_container ) {
			this._buildContent();
		}
		else {
			this._buildItems();
		}
		
		if( select ) {
			this.selection = item.id;
		}
	}

	/**
	 * update an item
	 */

	 updateItem( id: any, item: ListViewItem ) {

		// find item
		const idx = this.m_props.items.findIndex( itm => itm.id === id );
		if( idx<0 ) {
			return;
		}
		
		// take care of selection
		let was_sel = false;
		if( this.m_selection && this.m_selection.item===this.m_props.items[idx] ) {
			was_sel = true;
		}

		// replace it in the list
		this.m_props.items[idx] = item;

		// rebuild & replace it's line
		const oldDOM = this.queryItem( `[data-id="${item.id}"]` )?.dom;
		if( oldDOM ) {
			const _new = this._renderItem( item );

			if( was_sel ) {
				_new.addClass( '@selected' );
				this.m_selection.citem = _new;
				this.m_selection.item = item;
			}
			
			const newDOM = _new._build( );
			this.m_container.dom.replaceChild( newDOM, oldDOM );
		}
	}

	
}



/**
 * Cancel Event
 */

export interface EvCancel extends BasicEvent {
}

export function EvCancel( context = null ) {
	return BasicEvent<EvCancel>({ context });
}

interface PopupListViewEventMap extends PopupEventMap {
	cancel: EvCancel;
}

interface PopupListViewProps extends PopupProps<PopupListViewEventMap> {

}


/**
 * 
 */

export class PopupListView extends Popup<PopupListViewProps,PopupListViewEventMap> {

	m_list: ListView;

	constructor(props: ListViewProps) {
		super({ tabIndex: false });

		this.enableMask(false);

		props.tabIndex = false;
		this.m_list = new ListView(props);
		//this.m_list.addClass( '@fit' );

		this.setContent(this.m_list);
		this.mapPropEvents( props, 'cancel' );
	}

	set items( items: ListViewItem[] ) {
		this.m_list.items = items;
	}

	// @override
	// todo: move into popup
	private _handleClick = (e: MouseEvent) => {
		if (!this.dom) {
			return;
		}

		let newfocus = <HTMLElement>e.target;

		// child of this: ok
		if (this.dom.contains(newfocus)) {
			return;
		}

		// menu: ok
		let dest = Component.getElement(newfocus, MenuItem);
		if (dest) {
			return;
		}

		this.signal( 'cancel', EvCancel() );
		this.close();
	}

	// todo: move into popup
	show(modal?: boolean) {
		x4document.addEventListener('mousedown', this._handleClick);
		super.show(modal);
	}

	hide( ) {
		x4document.removeEventListener('mousedown', this._handleClick);
		super.hide( );
	}

	// todo: move into popup
	close() {
		x4document.removeEventListener('mousedown', this._handleClick);
		super.close();
	}

	get selection(): any {
		return this.m_list.selection;
	}

	set selection(itemId: any) {
		this.m_list.selection = itemId;
	}
}