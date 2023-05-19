/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file input.ts
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
import { Tooltip } from './tooltips';
import { Component, CProps, CEventMap, EvFocus } from './component'
//import { EvChange } from './x4_events';

export type EditType = 'text' | 'number' | 'email' | 'date' | 'password' | 'file' | 'checkbox' | 'radio';

export interface ValueHook {
	get( ) : any;
	set( v: any ) : void;
}

export interface InputEventMap extends CEventMap {
//	change?: EvChange;
//	focus?: EvFocus;
}

export interface InputProps<P extends InputEventMap = InputEventMap> extends CProps<P> {
	value?: string;
	name?: string;
	type?: EditType
	placeHolder?: string;
	autoFocus?: boolean;
	readOnly?: boolean;
	tabIndex?: number | boolean;
	pattern?: string;
	uppercase?: boolean;
	spellcheck?: boolean;
	value_hook?: ValueHook;
	min?: number;
	max?: number;
	autosel?: boolean;
}


/**
 * base class for elements implementing an input
 * CARE derived classes must set this.ui.input
 */

export class Input extends Component<InputProps,InputEventMap>
{
	private m_error_tip: Tooltip;

	constructor( props: InputProps ) {
		super( props );
	}

	componentDisposed() {
		if (this.m_error_tip) {
			this.m_error_tip.dispose();
		}

		super.componentDisposed();
	}

	/** @ignore */	
	render( props: InputProps ) {

		this.setTag( 'input' );
		this._setTabIndex( props.tabIndex );

		this.setAttributes( {
			value: props.value,
			type: props.type || 'text',
			name: props.name,
			placeholder: props.placeHolder,
			autofocus: props.autoFocus,
			readonly: props.readOnly,
			autocomplete: 'off',	// chrome ignore 'off' but not something else than 'on'
			tabIndex: props.tabIndex,
			spellcheck: props.spellcheck===false ? 'false' : undefined,
			min: props.min,
			max: props.max,
			...props.attrs
		});

		this.m_props.autosel = props.autosel ?? true;
		
		if( props.uppercase ) {
			this.setStyleValue( 'textTransform', 'uppercase' );
		}

		if( this.m_props.autosel ) {
			this.setDomEvent( "focus", ( ) => {
				this.selectAll( );
			});
		}
	}

	public showError(text: string) {

		if (!this.m_error_tip) {
			this.m_error_tip = new Tooltip({ cls: 'error' });
			x4document.body.appendChild(this.m_error_tip._build());
		}

		let rc = this.getBoundingRect();

		this.m_error_tip.text = text;
		this.m_error_tip.displayAt(rc.right, rc.top-8, 'top right');
		this.addClass('@error');
	}

	public clearError() {

		if (this.m_error_tip) {
			this.m_error_tip.hide();
			this.removeClass('@error');
		}
	}

	public getType( ) {
		return this.m_props.type;
	}

	/**
     * return the current editor value
     */

    public get value( ) : string {
		return this.getValue( );
    }

	public getValue( ): string {
		const dom = this.dom as HTMLInputElement;

		if( this.dom ) {
			this.m_props.value = dom.value;
		}
		
		if( this.m_props.uppercase ) {
			let upper = this.m_props.value.toUpperCase( );	// todo: locale ?
			if( dom && upper!=this.m_props.value ) {
				dom.value = upper; // update the input
			}

			this.m_props.value = upper;
		}
		
		return this.m_props.value;
	}

    /**
     * Change the editor value
     * @param value - new value to set
     */
	
	public set value( value: string ) {
		this.setValue( value );
	}
	
	public setValue( value: string ) {
		this.m_props.value = value;

		if( this.dom ) {
			(<HTMLInputElement>this.dom).value = value;
		}
	}

	public getStoreValue( ): any {

		if( this.m_props.value_hook ) {
			return this.m_props.value_hook.get( );
		}
		else {
			let type = this.getAttribute('type');
			if( type ) { type = type.toLowerCase( ); }

			let value;
			const dom = this.dom as HTMLInputElement;

            if( type === "file") {
				value = [];
				
                let files = dom.files;
                for( let file = 0; file < files.length; file++ ) {
                    value.push( files[file].name );
                }
            }
            else if ( type === 'checkbox' ) {
				if( dom.checked ) {
					value = 1;
				}
				else {
					value = 0;
				}
			}
			else if( type === 'radio' ) {
				if( dom.checked ) {
					value = this.value;
				}
			}
			else if( type === 'date' ) {
				debugger;
			}
			else if( type=='number' ) {
				value = this.value;
				if (value.indexOf(",") >= 0) {
					value = value.replace(",", ".");
				} 
			}
			else {
				value = this.value;
			}

			return value;
		}
	}

	public setStoreValue( v: any ) {
		this.clearError( );
		if( this.m_props.value_hook ) {
			return this.m_props.value_hook.set( v );
		}
		else {
			let type = this.getAttribute('type'),
				dom = (<HTMLInputElement>this.dom);

			if( type ) { type = type.toLowerCase( ); }
			if( type==='checkbox' ) {
				let newval = v!==null && v!=='0' && v!==0 && v!==false;
				if( newval!==dom.checked ) {
					dom.setAttribute( 'checked', ''+newval );
					dom.dispatchEvent( new Event( 'change' ) );
				}
			}
			else {
				this.value = v;
			}
		}
	}

	set readOnly( ro: boolean ) {
		this.setAttribute('readonly', ro );
	}

	/**
	 * select all the text
	 */

	public selectAll( ) {
        (<HTMLInputElement>this.dom).select(); 
	}
	
	/**
	 * select a part of the text
	 * @param start 
	 * @param length 
	 */

	public select( start: number, length: number = 9999 ) : void {
		(<HTMLInputElement>this.dom).setSelectionRange( start, start+length );
	}
	
	/**
	 * get the selection as { start, length }
	 */

	public getSelection( ) {
		let idom = (<HTMLInputElement>this.dom);

		return {
			start: idom.selectionStart,
			length: idom.selectionEnd - idom.selectionStart,
		};
	}
}