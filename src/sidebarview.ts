/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|  
*  /__/ \__\   |_|
*        
* @file sidebarview.ts
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

import { Component, CProps, Flex, Separator } from './component'
import { HLayout, VLayout } from './layout'
import { Button } from './button'
import { CardView, CardViewProps, ICardViewItem } from './cardview'

export interface SideBarItem extends ICardViewItem {
}

export interface SideBarProps extends CardViewProps {
	bar_sizable?: boolean;
	bar_width?: number;
}

/**
 * 
 */

export class SideBarView extends CardView<SideBarProps> {
	m_sidebar: VLayout;
	m_content: Component;

	constructor( props: SideBarProps ) {

		super( props );

		this.addClass( '@hlayout' );

		this.m_sidebar = new VLayout( {
			cls: '@side-bar',
			width: props.bar_width ?? undefined,
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
			this.m_props.bar_sizable ? new Separator( { orientation: "horizontal", sizing: "before" }) : undefined,
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