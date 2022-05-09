/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file button.ts
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


import { Component, CProps, CEventMap, HtmlString } from './component'
import { EventCallback, EvClick, EvChange } from './x4_events'

import { Icon, IconID } from './icon'
import { Label } from './label'
import { Menu, MenuItem, MenuOrSep } from './menu'
import { isFunction } from './tools'

/**
 * Button events
 */

interface ButtonEventMap extends CEventMap {
	click: EvClick;
}

type MenuCallBack = () => MenuOrSep[];

/**
 * Button properties
 */

interface ButtonProps<E extends ButtonEventMap = ButtonEventMap> extends CProps<E> {
	text?: string | HtmlString;	// initial button text
	icon?: IconID;	// optional icon id
	rightIcon?: IconID;	// optional icon id
	align?: 'center' | 'left' | 'right';	// text alignment
	autoRepeat?: number; // time in ms or 0/undefined for none
	menu?: MenuOrSep[] | MenuCallBack;

	click?: EventCallback<EvClick>;	// shortcut to events: { click: ... }
}


/**
 * Base button
 */

export class BaseButton<P extends ButtonProps = ButtonProps, E extends ButtonEventMap = ButtonEventMap> extends Component<P, E> {

	constructor(props: P) {
		super(props);

		this.setProp('tag', 'button');

		this.setDomEvent('click', (e) => this._handleClick(e));
		this.setDomEvent('mousedown', () => { this._startAutoRep(true) });
		this.setDomEvent('mouseup', () => { this._startAutoRep(false) });
		this.setDomEvent('keydown', (e) => this._handleKeyDown(e));

		this.mapPropEvents( props, 'click' );		
	}

	render(props: ButtonProps) {

		let icon = props.icon ? new Icon({ icon: props.icon, cls: 'left', ref: 'l_icon' }) : null;
		let label = new Label({ flex: 1, text: props.text ?? '', align: props.align, ref: 'label' });
		let ricon = props.rightIcon ? new Icon({ icon: props.rightIcon, cls: 'right', ref: 'r_icon' }) : null;

		this.setContent([icon, label, ricon]);
		this._setTabIndex(props.tabIndex);
	}

	/**
	 * starts/stops the autorepeat
	 */

	private _startAutoRep(start: boolean) {

		if (!this.m_props.autoRepeat) {
			return;
		}

		if (start) {
			// 1st timer 1s
			this.startTimer('repeat', 700, false, () => {
				// auto click
				this.startTimer('repeat', this.m_props.autoRepeat, true, this._sendClick);
			});
		}
		else {
			this.stopTimer('repeat');
		}
	}

	/**
	 * 
	 */

	protected _handleKeyDown(ev: KeyboardEvent) {
		if (!ev.ctrlKey && !ev.shiftKey && !ev.altKey) {
			if (ev.key == 'Enter' || ev.key == ' ') {
				this._sendClick();
				ev.preventDefault();
				ev.stopPropagation();
			}
		}
	}

	/**
	 * called by the system on click event
	 */

	protected _handleClick(ev: MouseEvent) {

		if (this.m_props.menu) {
			let menu = new Menu({
				items: isFunction(this.m_props.menu) ? this.m_props.menu() : this.m_props.menu
			});

			let rc = this.getBoundingRect();
			menu.displayAt(rc.left, rc.bottom, 'tl');
		}
		else {
			this._sendClick();
		}

		ev.preventDefault();
		ev.stopPropagation();
	}

	/**
	 * sends a click to the observers
	 */

	protected _sendClick() {
		if (this.m_props.menu) {
			let menu = new Menu({
				items: isFunction(this.m_props.menu) ? this.m_props.menu() : this.m_props.menu
			});

			let rc = this.getBoundingRect();
			menu.displayAt(rc.left, rc.bottom, 'tl');
		}
		else {
			this.emit('click', EvClick());
		}
	}

	/**
	 * change the button text
	 * @example
	 * ```ts
	 * let btn = new Button( {
	 * 	text: 'hello'
	 * });
	 * 
	 * btn.text = 'world';
	 * ```
	 */

	public set text(text: string | HtmlString) {
		this.m_props.text = text;

		let label = this.itemWithRef<Label>('label');
		if (label) { label.text = text; }
	}

	public get text(): string | HtmlString {
		let label = this.itemWithRef<Label>('label');
		return label?.text;
	}

	/**
	 * change the button icon
	 * todo: do nothing if no icon defined at startup
	 *
	 * @example
	 * ```ts
	 * let btn = new Button( {
	 * 	text: 'hello',
	 *  icon: 'close'
	 * });
	 * btn.setIcon( 'open' );
	 * ```
	 */

	public set icon(icon: IconID) {
		this.m_props.icon = icon;

		let ico = this.itemWithRef<Icon>('l_icon');
		if (ico) {
			ico.icon = icon;
		}
		else {
			this.update( );
		}
	}

	public get icon() {
		let ico = this.itemWithRef<Icon>('l_icon');
		return ico?.icon;
	}

	/**
	 * change the button right icon
	 * todo: do nothing if no icon defined at startup
	 *
	 * @example
	 * ```ts
	 * let btn = new Button( {
	 * 	text: 'hello',
	 *  icon: 'close'
	 * });
	 * btn.setIcon( 'open' );
	 * ```
	 */

	public set rightIcon(icon: IconID) {
		this.m_props.rightIcon = icon;
		let ico = this.itemWithRef<Icon>('r_icon');
		if (ico) {
			ico.icon = icon;
		}
	}

	public get rightIcon() {
		let ico = this.itemWithRef<Icon>('l_icon');
		return ico?.icon;
	}

	/**
	 * 
	 */
	
	set menu( items: MenuItem[] ) {
		this.m_props.menu = items;
	}
}

// :: BUTTON ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

/**
 * 
 */

export class Button extends BaseButton<ButtonProps> {
}

// :: TOGGLE BUTTON ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


interface ToggleButtonEventMap extends ButtonEventMap {
	change: EvChange;
}

interface ToggleButtonProps extends ButtonProps<ToggleButtonEventMap> {
	checked: boolean;
	checkedIcon?: IconID;
}

/**
 * 
 */

export class ToggleButton extends BaseButton<ToggleButtonProps, ToggleButtonEventMap> {

	constructor(props: ToggleButtonProps) {
		super(props);
	}

	/**
	 * 
	 */

	render(props: ToggleButtonProps) {
		super.render(props);

		if (props.checked) {
			this.addClass('checked');
			this._updateIcon( );
		}
	}

	/**
	 * 
	 */

	protected _sendClick() {
		super._sendClick();

		this.m_props.checked = !this.m_props.checked;
		this.setClass('checked', this.m_props.checked);
		this.emit('change', EvChange(this.m_props.checked));

		this._updateIcon( );
	}

	private _updateIcon( ) {
		if( this.m_props.checkedIcon ) {
			const ic = this.m_props.checked ? this.m_props.checkedIcon : this.m_props.icon;
			let ico = this.itemWithRef<Icon>('l_icon');
			if (ico) {
				ico.icon = ic;
			}
		}
	}
}



