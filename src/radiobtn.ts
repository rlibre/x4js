/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|  
*  /__/ \__\   |_|
*        
* @file radiobtn.ts
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

import { Component, CProps, CEventMap } from './component'
import { EvChange, EventCallback } from './x4_events'

import { IconID } from './icon';
import { Input } from './input'
import { Label } from './label'

// ============================================================================
// [RADIOBTN]
// ============================================================================

interface RadioBtnEventMap extends CEventMap {
	change?: EvChange;
}

export interface RadioBtnProps extends CProps {

	group: string;	// same as 'name' but required
	value: string;
	
	tabIndex?: number | boolean;
	name?: string;

	icon?: IconID;
	text?: string;
	checked?: boolean;
	labelWidth?: number | 'flex';	// flex | value
	align?: 'left' | 'right';

	change?: EventCallback<EvChange>; // shortcut to events: { change: xxx }
}


/**
 * Standard RadioBtn
 */

export class RadioBtn extends Component<RadioBtnProps,RadioBtnEventMap> {

	protected m_ui_input: Input;	// todo: remove that / use ref

	constructor(props: RadioBtnProps) {

		super( props );
		this.mapPropEvents( props, 'change' );
	}

	/** @ignore */
	render( props: RadioBtnProps) {

		let text = props.text ?? '';
		let name = props.name ?? props.group;
		let labelWidth = props.labelWidth ?? -1;
		let checked = props.checked ?? false;
		let align = props.align ?? 'left';
		let value = props.value;
		let icon = props.icon;
		
		this.addClass( '@hlayout' );
		this.setProp( 'tag', 'label' );

		this.addClass( align );
		this._setTabIndex( props.tabIndex );

		if( checked ) {
			this.addClass( 'checked' );
		}

		this.setContent( [
			this.m_ui_input = new Input({
				type: 'radio',				
				name: name,
				tabIndex: props.tabIndex,
				value: value,
				attrs: {
					checked: checked ? '' : undefined
				},
				dom_events: {
					change: ( ) => this._change( ),
					focus: 	( ) => this.m_ui_input.focus( ),
				}
			}),
			new Label( {
				ref: 'label',
				icon: icon,
				text: text,
				width: labelWidth==='flex' ? undefined : labelWidth,
				flex: labelWidth==='flex' ? 1 : undefined,
				style: {
					order: align=='right' ? -1 : undefined,
				},		
			} )
		] );
	}

	/**
	 * check state changed
	 */

	private _change( ) {

		let props = this.m_props;

		let query = '.x-input[name='+props.name+']';
		let nlist = document.querySelectorAll( query );		//todo: document ?

		nlist.forEach( (dom) => {
			let radio = Component.getElement( <HTMLElement>dom, RadioBtn );
			radio.removeClass( 'checked' );
		});

		let dom = (<HTMLInputElement>this.m_ui_input.dom);
		this.setClass( 'checked', dom.checked )

		this.emit( 'change', EvChange( true ) );
	}

	/**
     * @return the checked value
     */

    public get check( ) {
		if( this.m_ui_input ) {
			return (<HTMLInputElement>this.m_ui_input.dom).checked;
		}
		
		return this.m_props.checked;
    }

    /**
     * change the checked value
     * @param {boolean} ck new checked value	
     */

    public set check( ck ) {

		let dom = (<HTMLInputElement>this.m_ui_input.dom);
		
        if ( ck ) {
			//this.addClass( 'checked' );
			if( dom ) {
				dom.checked = true;
			}
			
			this.m_props.checked = true;
        }
        else {
			//this.removeClass( 'checked' );
            if( dom ) {
				dom.checked = false;
			}

			this.m_props.checked = false;
		}
	}

	get text( ) {
		return this.itemWithRef<Label>('label').text;
	}

	set text( text ) {
		this.itemWithRef<Label>('label').text = text;
	}
}

