/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file input.ts
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
}


/**
 * base class for elements implementing an input
 * CARE derived classes must set this.ui.input
 */

export class Input extends Component<InputProps,InputEventMap>
{
	constructor( props: InputProps ) {
		super( props );
	}

	/** @ignore */	
	render( props: InputProps ) {

		this.setProp( 'tag', 'input' );
		this._setTabIndex( props.tabIndex );

		this.setAttributes( {
			value: props.value,
			type: props.type || 'text',
			name: props.name,
			placeholder: props.placeHolder,
			autofocus: props.autoFocus,
			readonly: props.readOnly,
			autocomplete: 'new-password',	// chrome ignore 'off' but not something else than 'on'
			tabindex: props.tabIndex,
			spellcheck: props.spellcheck===false ? 'false' : undefined,
			min: props.min,
			max: props.max,
			...props.attrs
		});

		if( props.uppercase ) {
			this.setStyleValue( 'textTransform', 'uppercase' );
		}
	}

	public getType( ) {
		return this.m_props.type;
	}

	/**
     * return the current editor value
     */

    public get value( ) : string {
		
		if( this.dom ) {
			this.m_props.value = (<HTMLInputElement>this.dom).value;
		}
		
		if( this.m_props.uppercase ) {
			let upper = this.m_props.value.toUpperCase( );	// todo: locale ?
			if( this.dom && upper!=this.m_props.value ) {
				(<HTMLInputElement>this.dom).value = upper; // update the input
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

			let value,
				dom = (<HTMLInputElement>this.dom);

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
			else {
				value = this.value;
			}

			return value;
		}
	}

	public setStoreValue( v: any ) {
		
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