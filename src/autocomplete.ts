/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file autocomplete.ts
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

import { RenderListItem, ListViewItem, PopupListView } from "./listview";
import { TextEdit, TextEditProps } from './textedit';

/**
 * 
 */

interface AutoCompleteProps extends TextEditProps {
	// return an array of values to display in the popup list
	enumValues: ( filter: string ) => string[] | Promise<string[]>;

	// a way to change the real value vs displayed value in the popup list
	selectValue?: ( text: string ) => string;
	renderItem?: RenderListItem
}

/**
 * 
 */

export class AutoComplete extends TextEdit<AutoCompleteProps> {
	
	private m_popup: PopupListView;
	private m_popvis: boolean;
	private m_needval: boolean;
	private m_lockpop: boolean;
	
	constructor( props: AutoCompleteProps ) {
		super( props );

		this.setDomEvent( "input", ( ) => this._onChange( ) );
		this.setDomEvent( "focusin", ( ) => this._onFocus( ) );
		this.startTimer( "focus-check", 100, true, () => this._checkFocus() );

		this.m_popvis = false;
		this.m_needval = false;
		this.m_lockpop = false;

		this.setDomEvent( "keydown", e => this._onKey(e) );
	}

	_onKey( e: KeyboardEvent ) {
		if( this.m_popvis ) {
			if( e.key=="ArrowUp" || e.key=="ArrowDown" ) {
				this.m_lockpop = true;
				this.m_popup.handleKey( e );
				this.m_lockpop = false;

				e.preventDefault( );
				e.stopPropagation( );
			}
			else if( e.key=="Escape" ) {
				this._hidePopup( );

				e.preventDefault( );
				e.stopPropagation( );
			}
		}
		else if( e.key=="ArrowDown" ) {
			this._onChange( );
			e.preventDefault( );
			e.stopPropagation( );
		}
	}

	private async _onChange( ) {
		let items = this.m_props.enumValues( this.value );
		if( items instanceof Promise ) {
			items = await items;
		}
		
		if( items.length==0 ) {
			this._hidePopup( );
			return;
		}

		this._showPopup( items );
	}

	componentDisposed( ) {
		if( this.m_popup ) {
			this._hidePopup( );
		}

		super.componentDisposed( );
	}

	showPopup( show = true ) {
		if( show ) {
			this._onChange( );
		}
		else {
			this._hidePopup( );
		}
	}

	/** 
	 * display the popup 
	 */

	private _showPopup( items: string[] ) {

		let props = this.m_props;
		if (props.readOnly || this.hasClass("@disable") ) {
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
				attrs: {
					tabindex: 0
				},
				selectionChange: (e) => {
					let value = (e.selection as ListViewItem).id
					if( this.m_props.selectValue ) {
						value = this.m_props.selectValue( value );
					}

					this.value = value;
					if( !this.m_lockpop ) {
						this._hidePopup( );
						this.focus( );
					}
				},
				style: {
					fontFamily,
					fontSize
				},
				renderItem: props.renderItem,
			});
		}

		if( items ) {
			this.m_popup.items = items.map( c => ({ id: c, text: c }) );
		}
	
		let r1 = this.m_ui_input.getBoundingRect();
		this.m_popup.setStyle({
			minWidth: r1.width,
		});

		this.m_popup.displayAt(r1.left, r1.bottom);
		this.m_popvis = true;
		
		//if( this.value!==undefined ) {
		//	this.m_popup.selection = this.value;
		//}
	}

	protected override _validate(value: string): boolean {
		return true;
	}

	override validate( ): boolean {
		return super._validate( this.value );
	}

	private _checkFocus( ) {
		const focus = document.activeElement;
		if( this.dom && this.dom.contains(focus) ) {
			return;
		}

		if( this.m_popup && this.m_popup.dom && this.m_popup.dom.contains(focus) ) {
			return;
		}

		this._hidePopup( );
	}

	private _hidePopup( ) {
		
		if( this.m_popvis ) {
			this.m_popup.close();
			this.m_popvis = false;
		}

		if( this.m_needval ) {
			this.validate( );
			this.m_needval = false;
		}
	}

	private _onFocus( ) {
		if( this.value.length==0 ) {
			this._onChange( );
		}

		this.m_needval = true;
	}

	isPopupVisible( ) {
		return this.m_popvis;
	}
}