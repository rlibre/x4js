/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file combobox.ts
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

/**
 * TODO: replace custom combo list by listview or gridview
 */

import { Component, CProps, ContainerEventMap } from './component'
import { EvChange, EvSelectionChange, EventCallback } from './x4events'

import { Input } from './input'
import { Label } from './label'
import { Button } from './button'
import { HLayout } from './layout'
import { PopupListView, ListViewItem, EvCancel, PopulateItems } from './listview';
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

	items?: ListViewItem[] | PopulateItems;
	value?: any; // shown value at init

	renderer?: ComboItemRender;
	selectionChange?: EventCallback<EvSelectionChange>;// shortcut to events: { selectionChange: ... }
	editable?: boolean;
}

/**
 * @review use textedit
 */

export class ComboBox extends HLayout<ComboBoxProps,ComboBoxEventMap> {
	
	private m_ui_input: Input | Component;
	private m_ui_button: Button;
	private m_popup: PopupListView;
	private m_lockpop: boolean;
	private m_lockchg: boolean;
	private m_popvis: boolean;
	private m_selection: ListViewItem;
		
	constructor(props: ComboBoxProps) {
		super(props);

		if( !props.editable ) {
			this.setDomEvent( 'keypress', () => this.showPopup() );
		}

		this.setDomEvent( 'click', () => {
			if( this.m_props.editable ) {
				this.m_ui_input.focus( );
			}
			
			this.showPopup();
		} );

		this.setDomEvent("keydown", e => this._onKey(e));
		this.mapPropEvents(props, 'selectionChange' );
		
		this.m_popvis = false;
		this.m_lockpop = false;
		this.m_lockchg = false;
	}

	_onKey(e) {
        if (this.m_popvis) {
            if (e.key == "ArrowUp" || e.key == "ArrowDown") {
				this.m_lockpop = true;
                this.m_popup.handleKey(e);
                this.m_lockpop = false;
                e.preventDefault();
                e.stopPropagation();
            }
            else if (e.key == "Escape") {
                this._hidePopup();
                e.preventDefault();
                e.stopPropagation();
            }
        }
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
			
			const input = new Input( {
				flex 	: 1,
				readOnly : this.m_props.editable ? false : true,
				tabIndex : 0,
				name: props.name,
				value_hook: {
					get: (): string => { return this.value; },
					set: (v: string) => { this.value = v; }
				},
				dom_events: {
					focus: () => {
						if( this.m_props.editable && input.value.length==0 ) {
							this.showPopup( );
						}
					},
					input: ( ) => {
						if( this.m_lockchg ) {
							return;
						}

						const text = input.value;
						this.m_selection = { id: undefined, text };
						let items = this.showPopup( );
						if( items && items.length && items[0].text==text ) {
							this.m_selection = { id: items[0].id, text };
						}
					}
				}
			});

			this.m_ui_input = input;
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
						icon: 'var( --x4-icon-angle-down )',
						tabIndex: false,
						click: () => {
							this.showPopup( false )
						},
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

	showPopup( filter_items: boolean = true ) {

		let props = this.m_props;
		if (props.readOnly || this.hasClass("@disable") ) {
			return null;
		}

		let items = props.items;
		if( isFunction( items ) ) {
			const filter = filter_items ? (this.m_ui_input as Input).value : null;
			items = items( filter );
		}
		
		if( items.length==0 ) {
			return null;
		}

		// need creation ?
		
		if( !this.m_popup ) {
			let cstyle = this.getComputedStyle( );
			let fontFamily = cstyle.value( 'fontFamily' );
			let fontSize = cstyle.value( 'fontSize' );

			// prepare the combo listview
			this.m_popup = new PopupListView({
				cls: '@combo-popup',
				populate: props.populate,
				renderItem: this.m_props.renderer,
				selectionChange: (e) => {

					this._selectItem(e);
					
					if (!this.m_lockpop) {
                        this._hidePopup();
                        this.focus();
                    }
				},
				cancel: ( e ) => this.signal( 'cancel', e ),
				style: {
					fontFamily,
					fontSize
				}
			});
		}

		this.m_popup.items = items;
	
		let r1 = this.m_ui_button.getBoundingRect(),
			r2 = this.m_ui_input.getBoundingRect();

		this.m_popup.setStyle({
			minWidth: r1.right - r2.left,
		});

		this.m_popup.displayAt(r2.left, r2.bottom);
		this.m_popvis = true;
		this.startTimer("focus-check", 100, true, () => this._checkFocus());

		if( this.value!==undefined ) {
			this.m_popup.selection = this.value;
		}

		return items;
	}

	/** @ignore
	  */

	private _selectItem( ev: EvSelectionChange ) {

		let item: ListViewItem = ev.selection as ListViewItem;
		if( !item ) {
			return;
		}

		this.m_lockchg = true;
		this._setInput( item, true );
		this.m_lockchg = false;
					
		this.m_selection = {
			id: 	item.id,
			text: 	item.text
		};

		this.emit( 'selectionChange', EvSelectionChange( item ) );
		this.emit( 'change', EvChange(item.id) );
		//this.m_ui_input.focus( );
		//this.m_popup.hide( );
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
		else {
			if( this.m_ui_input && this.m_ui_input instanceof Input ) {
				this.m_ui_input.value = "";
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
		if( this.m_selection ) {
			return this.m_selection.text;
		}

		if( this.m_props.editable ) {
			return (this.m_ui_input as Input).value;
		}

		return '';
	}

	/**
	 * 
	 */
	
	public set value(id) {
		let items = this.m_props.items;

		if( isFunction(items) ) {
			items = items( null );
		}
		
		const found = items.some( (v) => {
			if (v.id === id) {
				this._setInput( v );
				this.m_selection = v;
				return true;
			}
		});

		if( !found ) {
			this._setInput( null );
			this.m_selection = null;
		}
	}

	get input( ) : Input {
		return this.m_ui_input instanceof Input ? this.m_ui_input : null;
	}

	_checkFocus() {
        const focus = document.activeElement;
        if (this.dom && this.dom.contains(focus) || focus==document.body ) {
            return;
        }

        if (this.m_popup && this.m_popup.dom && this.m_popup.dom.contains(focus)) {
            return;
        }

        this._hidePopup();
    }

	_hidePopup() {
        if (this.m_popvis) {
            this.m_popup.close();
            this.m_popvis = false;
			this.stopTimer("focus-check");
        }
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

	focus( ) {
		if( this.m_props.editable ) {
			this.m_ui_input.focus( );
		}
		else {
			super.focus( );
		}
	}
}

