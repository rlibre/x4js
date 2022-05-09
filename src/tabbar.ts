/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|  
*  /__/ \__\   |_|
*        
* @file tabbar.ts
* @author Etienne Cochard 
* @copyright (c) 2021 R-libre ingenierie, all rights reserved.
*
* @description Tab 
**/

import { Component, Container, ContainerEventMap, CProps, EventHandler } from './component';
import { Button } from './button';
import { EvChange } from './x4_events';
import { IconID } from './icon.js';

interface TabBarEventMap extends ContainerEventMap {
	change: EvChange;
}

interface TabBarProps extends CProps<TabBarEventMap> {
	pages?: ITabPage[];
	default?: string;
	vertical?: boolean;
	change: EventHandler<EvChange>;
}

export interface ITabPage {
	id: string;
	title?: string;
	icon?: IconID;
	page: Component;
}

interface TabPage extends ITabPage {
	btn?: Component;
}

export class TabBar extends Container<TabBarProps,TabBarEventMap> {

	private m_pages: TabPage[];
	private m_curPage: TabPage;

	constructor( props: TabBarProps ) {
		super( props );

		this.m_pages = [];
		this.m_curPage = null;

		this.mapPropEvents( props, 'change' );

		if( props.vertical ) {
			this.addClass( '@vlayout')
		}
		else {
			this.addClass( '@hlayout')
		}

		this.m_props.pages?.forEach( p => this.addPage(p) );
		if( this.m_props.default ) {
			this.select( this.m_props.default );
		}
	}

	addPage( page: ITabPage ) {
		this.m_pages.push( { ...page } );
		this._updateContent( );
	}

	render( ) {
		let buttons = [];
		this.m_pages.forEach( p => {
			p.btn = new Button( { cls: p===this.m_curPage ? 'selected' : '', text: p.title, icon: p.icon, click: () => this._select(p) } );
			buttons.push( p.btn );
		});

		this.setContent( buttons );
	}

	select( id: string ) {
		let page = this.m_pages.find( x => x.id===id );
		if( page ) {
			this._select( page );
		}
	}

	private _select( p: TabPage ) {

		if( this.dom && this.m_curPage && this.m_curPage.page ) {
			this.m_curPage.btn.removeClass( 'selected' );
			this.m_curPage.page.hide( );
		}

		this.m_curPage = p;
		this.signal( 'change', EvChange(p ? p.id : null) );

		if( this.dom && this.m_curPage && this.m_curPage.page ) {
			this.m_curPage.btn.addClass( 'selected' );
			this.m_curPage.page.show( );
		}
	}
}
