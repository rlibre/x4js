/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|  
*  /__/ \__\   |_|
*        
* @file radiobtn.ts
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

import { Component, CProps, CEventMap } from './component'
import { EvChange, EventCallback } from './x4events'

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
		let nlist = x4document.querySelectorAll( query );		//todo: document ?

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

