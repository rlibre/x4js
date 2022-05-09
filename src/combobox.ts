/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file combobox.ts
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

/**
 * TODO: replace custom combo list by listview or gridview
 */

import { Component, CProps, ContainerEventMap } from './component'
import { EvChange, EvSelectionChange, EventCallback } from './x4_events'

import { Input } from './input'
import { Label } from './label'
import { Button } from './button'
import { HLayout } from './layout'
import { PopupListView, ListViewItem, PopulateItems, EvCancel } from './listview';
import { DataStore, DataView, Record } from './datastore'
import { isFunction, HtmlString } from './tools'

export interface ComboStoreProxyProps {
	store: DataView | DataStore;
	display: ( rec: Record ) => string | HtmlString;
}

// ============================================================================
// [COMBOBOX]
// ============================================================================

export interface ComboItemRender {
	( itm: ListViewItem ) : Component;
}

interface ComboBoxEventMap extends ContainerEventMap {
	readonly change: EvChange;	// value change  (event.value = new value as id)
	readonly selectionChange?: EvSelectionChange; // ( event.value = new value as ListItem)
	readonly cancel?: EvCancel;
}

export interface ComboBoxProps extends CProps<ComboBoxEventMap> {
	tabIndex?: number | boolean;
	name?: string;
	readOnly?: boolean;
	
	label?: string;							
	labelWidth?: number; // < 0 for flex 
						 // =0 to adjust label width 
						 // > 0 to specify a width

	labelAlign?: 'left' | 'right';	

	items?: ListViewItem[];
	populate?: PopulateItems; // if not specified, fire 'populate' event
	value?: any; // shown value at init

	renderer?: ComboItemRender;
	selectionChange?: EventCallback<EvSelectionChange>;// shortcut to events: { selectionChange: ... }
}

/**
 * @review use textedit
 */

export class ComboBox extends HLayout<ComboBoxProps,ComboBoxEventMap> {
	
	private m_ui_input: Component;
	private m_ui_button: Button;
	private m_popup: PopupListView;

	private m_selection: ListViewItem;
	private m_defer_sel: any;
	
	constructor(props: ComboBoxProps) {
		super(props);

		this.setDomEvent( 'keypress', () => this.showPopup() );
		this.setDomEvent( 'click', () => this.showPopup() );

		this.mapPropEvents(props, 'selectionChange' );
	}

	set items( items: ListViewItem[] ) {
		this.m_props.items = items;
		if( this.m_popup ) {
			this.m_popup.items = items;
		}
	}

	/** @ignore */	
	render( props: ComboBoxProps ) {

		if( !props.renderer ) {
			this.m_ui_input = new Input( {
				flex 	: 1,
				readOnly : true,
				tabIndex : 0,
				name: props.name,
				value_hook: {
					get: (): string => { return this.value; },
					set: (v: string) => { this.value = v; }
				}
			});
		}
		else {
			this.m_ui_input = new Component( { 
				flex: 1, 
				cls: '@fake-input @hlayout', 
				tabIndex: 1 
			} );
		}

		let width = undefined,
			flex = undefined;

		let labelWidth = props.labelWidth ?? 0;
				
		if( labelWidth>0 ) {
			width = labelWidth;
		}
		else if( labelWidth<0 ) {
			flex = -labelWidth;
		}

		this.setContent([
			// todo: why 'label1' class name
			new Label({
				cls: 'label1' + (props.label ? '' : ' @hidden'),	
				text: props.label,
				width,
				flex,
				align: props.labelAlign
			}),
			new HLayout({
				flex: 1,
				content: [
					this.m_ui_input,
					this.m_ui_button = new Button({
						cls: 'gadget',
						icon: 'cls(far fa-angle-down)',
						tabIndex: false,
						click: () => this.showPopup(),
						dom_events: {
							focus: () => { this.dom.focus(); },
						}
					})
				]
			}),
		]);

		if (props.value !== undefined) {
			this.value = props.value;
		}
	}

	componentDisposed( ) {
		if( this.m_popup ) {
			this.m_popup.close( );
		}

		super.componentDisposed( );
	}

	/** 
	 * display the popup 
	 */

	showPopup() {

		let props = this.m_props;
		if (props.readOnly) {
			return;
		}

		// need creation ?
		
		if( !this.m_popup ) {
			let cstyle = this.getComputedStyle( );
			let fontFamily = cstyle.value( 'fontFamily' );
			let fontSize = cstyle.value( 'fontSize' );

			// prepare the combo listview
			this.m_popup = new PopupListView({
				cls: '@combo-popup',
				items: props.items,
				populate: props.populate,
				renderItem: this.m_props.renderer,
				selectionChange: (e) => this._selectItem(e),
				cancel: ( e ) => this.signal( 'cancel', e ),
				style: {
					fontFamily,
					fontSize
				}
			});
		}
	
		let r1 = this.m_ui_button.getBoundingRect(),
			r2 = this.m_ui_input.getBoundingRect();

		this.m_popup.setStyle({
			minWidth: r1.right - r2.left,
		});

		this.m_popup.displayAt(r2.left, r2.bottom);

		if( this.value!==undefined ) {
			this.m_popup.selection = this.value;
		}
	}

	/** @ignore
	  */

	private _selectItem( ev: EvSelectionChange ) {

		let item: ListViewItem = ev.selection as ListViewItem;
		if( !item ) {
			return;
		}

		this._setInput( item, true );

		this.m_selection = {
			id: 	item.id,
			text: 	item.text
		};

		this.emit( 'selectionChange', EvSelectionChange( item ) );
		this.emit( 'change', EvChange(item.id) );
		this.m_ui_input.focus( );

		this.m_popup.hide( );
	}

	/**
	 * 
	 */

	private _setInput( item, fireEv = false ) {

		if( item ) {
			if( this.m_ui_input ) {
				if( this.m_ui_input instanceof Input ) {
					this.m_ui_input.value = item.text;
					// fires a change event
					if( fireEv ) {
						this.m_ui_input.dom.dispatchEvent( new Event('input') );
					}
				}
				else {
					this.m_ui_input.setContent( this.m_props.renderer( item ) );
				}
			}
			else {
				this.m_props.value = item.id;
			}
		}
	}

	/**
	 * 
	 */

	public get value() {
		return this.m_selection ? this.m_selection.id : undefined;
	}

	public get valueText( ) {
		return this.m_selection ? this.m_selection.text : undefined;
	}

	/**
	 * 
	 */
	
	public set value(id) {
		let items = this.m_props.items;

		if( isFunction(items) ) {
			items = items( );
		}

		items.some( (v) => {
			if (v.id === id) {
				this._setInput( v );
				this.m_selection = v;
				return true;
			}
		});
	}

	get input( ) : Input {
		return this.m_ui_input instanceof Input ? this.m_ui_input : null;
	}

	static storeProxy( props: ComboStoreProxyProps ): PopulateItems { 

		let view: DataView = props.store instanceof DataStore ? props.store.createView() : props.store;
		
		return ( ) => {
			let result: ListViewItem[] = new Array( props.store.count );
			
			props.store.forEach( ( rec, index ) => {
				result[index] = {
					id: rec.getID( ),
					text: props.display( rec )
				}
			});

			return result;
		};
	} 
}



/*
 export type CBComboBoxRenderer = ( rec: Record ) => string;
export interface ComboBoxStore {
	store: DataStore;
	display: string | CBComboBoxRenderer;		// if string, the field name to display
}

*/





