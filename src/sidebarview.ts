/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|  
*  /__/ \__\   |_|
*        
* @file sidebarview.ts
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

import { Component, CProps, Flex } from './component'
import { HLayout, VLayout } from './layout'
import { Button } from './button'
import { CardView, CardViewProps, ICardViewItem } from './cardview'

export interface SideBarItem extends ICardViewItem {
}

export interface SideBarProps extends CardViewProps {
	bar_sizable?: boolean;
}

/**
 * 
 */

export class SideBarView extends CardView {
	m_sidebar: VLayout;
	m_content: Component;

	constructor( props: SideBarProps ) {

		super( props );

		this.addClass( '@hlayout' );

		this.m_sidebar = new VLayout( {
			cls: '@side-bar',
			sizable: props.bar_sizable ? 'right' : undefined,
		});

		this.m_content = new HLayout( { flex: 1, cls: '@tab-container' } );
	}

	/** @ignore */
	render() {

		let tabs = [];
		
		this.m_cards.forEach( (p) => {
			tabs.push( p.selector );
		} );

		this.m_sidebar.setContent( new VLayout( {
			flex: 1,
			cls: 'content',
			content: tabs
		}) );

		this.setContent( [
			this.m_sidebar,
			this.m_content
		] );
	}

	protected _prepareSelector( card: ICardViewItem ): Component {
		return new Button( {
			text: card.title,
			icon: card.icon,
			tooltip: card.title,
			click: ( ) => { this.switchTo( card.name); }
		});
	}

	protected _preparePage( page: Component ) {
		super._preparePage( page );
		
		if( !page.dom ) {
			this.m_content.appendChild( page );
		}
	}
}