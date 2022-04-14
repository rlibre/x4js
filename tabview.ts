/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|  
*  /__/ \__\   |_|
*        
* @file tabview.ts
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

import { Component, CProps } from './component'
import { HLayout } from './layout'
import { Button } from './button'
import { CardView, CardViewProps, ICardViewItem } from './cardview'
import { MenuItem } from './menu'

interface TabProps extends CardViewProps
{
	tab_selector?: boolean;
	menu?: MenuItem;
}

/**
 * Standard TabView class
 */

export class TabView extends CardView<TabProps>
{
	protected m_tab_selector: boolean;
	protected m_menu: MenuItem;
	
	constructor( props: TabProps ) {
		super( props );

		this.m_tab_selector = props.tab_selector ? true : false;
		this.m_menu = props.menu;

		this.addClass( '@vlayout' );
	}
	
	/** @ignore */
	render() {

		let tabs = [];
		let pages = [];

		if( this.m_menu ) {
			this.m_menu.addClass( '@button @tab-btn' );
			this.m_menu.removeClass( '@menu-item' );
			tabs.push( this.m_menu );
		}

		this.m_cards.forEach( (p) => {
			tabs.push( p.selector );
			if( !(p.page instanceof Function) ) {
				pages.push( p.page );
			}
		} );

		if( this.m_tab_selector ) {
			pages.unshift( new HLayout( {
				cls: '@tab-switch',
				content: tabs
			}) );
		}

		this.setContent( pages );
	}

	protected _updateSelector( ) {
	
	}

	protected _prepareSelector( card: ICardViewItem ): Component {
		
		return new Button( {
			cls: '@tab-btn',
			text: card.title,
			icon: card.icon,
			click: ( ) => { this.switchTo(card.name); }
		});
	}

	protected _preparePage( page: Component ) {
		super._preparePage( page );

		if( !page.dom ) {
			this.appendChild( page );
		}
	}
}