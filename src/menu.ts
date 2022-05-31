/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|  
*  /__/ \__\   |_|
*        
* @file menu.ts
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

import { CEventMap, Component, CProps } from './component'
import { EvClick, EventCallback } from './x4events'

import { Action } from './action'

import { Popup, PopupProps } from './popup'
import { Icon, IconID } from './icon'
import { Label } from './label'
import { HLayout } from './layout'
import { isString, getMousePos } from './tools'

// ============================================================================
// [MENU]
// ============================================================================

export class MenuSeparator extends Component {
}

export class MenuTitle extends Label {
}


/**
 * Standard Menu
 */

export type MenuOrSep = MenuItem | MenuSeparator | MenuTitle;

export interface MenuProps extends PopupProps {
	items?: MenuOrSep[];
}

export class Menu extends Popup<MenuProps>
{
	private static watchCount: number = 0;
	private static rootMenu: Menu = null;

	protected m_subMenu: Menu;
	protected m_opener: MenuItem;
	protected m_virtual: boolean;
	protected m_lock: number;

	constructor(props: MenuProps, opener?: MenuItem) {
		super(props);

		this.addClass('@shadow');

		this.m_opener = opener;
		this.m_virtual = false;
		this.m_lock = 0;

		this.enableMask(false);
	}

	lock(yes: boolean) {
		this.m_lock += yes ? 1 : -1;
	}

	setVirtual() {
		this.m_virtual = true;
	}

	setSubMenu(menu: Menu) {
		this.m_subMenu = menu;
	}

	hideSubMenu() {
		if (this.m_subMenu) {
			this.m_subMenu.m_opener._close();
			this.m_subMenu.hide();
			this.m_subMenu = null;
		}
	}

	/** @ignore */
	render(props: MenuProps) {
		this.setContent(props.items);
	}

	/**
	* 
	*/

	public show() {
		if (!this.m_virtual) {
			Menu._addMenu(this);
		}

		super.show();
	}

	/**
	 * 
	*/

	public close() {

		if (!this.dom && !this.m_virtual) {
			return;
		}

		if (this.m_opener) {
			this.m_opener._close();
		}

		if (this.m_subMenu) {
			this.m_subMenu.close();
			this.m_subMenu = null;
		}

		super.close();
		Menu._removeMenu();
	}

	/**
	 * 
	 */

	public clear() {
		this.m_props.items = [];
	}

	/**
	* @internal
	*/

	public static _addMenu(menu) {
		//console.log( 'addmenu' );
		if (Menu.watchCount == 0) {
			Menu.rootMenu = menu;
			x4document.addEventListener('mousedown', Menu._mouseWatcher);
		}

		Menu.watchCount++;
	}

	public static _removeMenu() {
		//console.log( 'removemenu' );
		console.assert(Menu.watchCount > 0);
		Menu.watchCount--;

		if (Menu.watchCount == 0) {
			x4document.removeEventListener('mousedown', Menu._mouseWatcher);
		}
	}

	private static _mouseWatcher(ev: MouseEvent) {
		if (ev.defaultPrevented) {
			return;
		}

		let elOn = <HTMLElement>ev.target;

		while (elOn) {
			// is mouse on a menu
			let mouseon = Component.getElement(elOn);
			if (mouseon && (mouseon instanceof Menu /*|| elOn.$el instanceof Menubar*/)) {
				return;
			}

			elOn = elOn.parentElement;
		}

		Menu._discardAll();
	}

	/**
	* hide all the visible menus
	*/

	public static _discardAll() {
		if (Menu.rootMenu) {
			Menu.rootMenu.close();
			Menu.rootMenu = null;
		}
	}

	public displayAt(ev: UIEvent ): void;
	public displayAt(x: number, y?: number, align?: string, offset?: { x, y } ): void;
	public displayAt( ...args ) {
		
		if (!this.m_lock) {
			Menu._discardAll();
		}

		let x, y, align, offset;

		if( args.length==1 ) {
			({x,y} = getMousePos( args[0], true ));
		}
		else {
			[x,y,align,offset] = args;
		}

		if( !align ) {
			align = 'top left';
		}

		super.displayAt(x, y, align, offset);
	}
}

/**
 * MENU ITEM
 */

interface MenuItemEventMap extends CEventMap {
	click: EvClick;
}

export interface MenuItemProps extends CProps {
	itemId?: any;
	text?: string;
	icon?: IconID;		// pass -1 to avoid space for icon
	items?: MenuOrSep[];
	checked?: boolean;
	cls?: string;
	click?: EventCallback<EvClick>;	// shortcut to events: { click ... }
	
	action?: Action;
}



export class MenuItem extends Component<MenuItemProps, MenuItemEventMap> {

	private m_menu: Menu;
	private m_isOpen: boolean;
	private m_action: Action;

	constructor( action: Action );
	constructor( text: string, click: EventCallback<EvClick> );
	constructor( props: MenuItemProps);
	constructor( a, b? ) {

		if( a instanceof Action ) {
			super( {
				click: ( ) => { a.fire(); }
			});

			this.m_action = a;
		}
		else if( isString(a) ) {
			super( {
				text: a,
				click: b
			});
		}
		else {
			super(a);
		}

		this.mapPropEvents( this.m_props, 'click');

		this.m_menu = null;
		this.m_isOpen = false;

		this.setDomEvent('mousedown', (e) => this._mousedown(e));
		this.setDomEvent('click', (e) => this._click(e));
	}

	/** @ignore */
	render(props: MenuItemProps) {

		let icon = props.icon ?? 0x20;
		let text = props.text;

		if (props.checked !== undefined) {
			icon = props.checked ? 'cls(far fa-check)' : 0;	//todo: use stylesheet
		}

		if( this.m_action ) {
			if( !icon ) {
				icon = this.m_action.props.icon;
			}

			if( text===undefined ) {
				text = this.m_action.props.text;
			}
		}

		let popIco = null;
		if (this.isPopup) {
			this.addClass('@popup-menu-item');
			popIco = new Icon( "var( --x4-icon-chevron-right )" );
		}

		if (!text && !icon) {
			this.addClass('@separator');
		}

		if (props.cls) {
			this.addClass(props.cls);
		}

		this.setProp('tag', 'a');
		//@bug: do not kill focus on click 
		//	this.setAttribute( 'tabindex', '0' );

		this.setContent([
			icon < 0 ? null : new Icon({ icon }),
			new Label({ flex: 1, text }),
			popIco
		]);
	}

	get id(): any {
		return this.m_props.itemId;
	}

	get text(): string {
		return this.m_props.text;
	}

	get isPopup(): boolean {
		return !!this.m_props.items;
	}

	public _close() {
		this.removeClass('@opened');
		this.m_isOpen = false;
	}

	protected _click(ev: MouseEvent) {
		if (!this.isPopup) {
			this.emit('click', EvClick());
			Menu._discardAll();
		}
	}

	protected _mousedown(ev: MouseEvent) {

		if (this.isPopup) {
			if (!this.m_menu) {
				this.m_menu = new Menu({ items: this.m_props.items }, this);
			}

			let doClose = this.m_isOpen;

			// if parent menu has an opened sub menu, close it
			let parent_menu = Component.getElement(this.dom, Menu);

			if (parent_menu) {
				parent_menu.hideSubMenu();
			}

			if (!doClose) {
				if (parent_menu) {
					parent_menu.setSubMenu(this.m_menu);
				}

				this.m_isOpen = true;

				let rc = this.getBoundingRect();

				this.m_menu.lock(true);
				if (parent_menu) {
					// standard menu
					this.m_menu.displayAt(rc.right, rc.top);
				}
				else {
					// menubar / menubutton
					this.m_menu.displayAt(rc.left, rc.bottom);
				}
				this.m_menu.lock(false);
				this.addClass('@opened');
			}

			ev.preventDefault();
		}
	}
}

/**
 * 
 */

export class MenuBar extends HLayout {
	protected m_items: MenuOrSep[];

	constructor(props: MenuProps, opener?: MenuItem) {
		super(props);

		console.assert(false, 'not imp');

		this.addClass('@shadow');
		this.m_items = props.items;
	}

	/** @ignore */
	render() {
		this.setContent(this.m_items);
	}
}