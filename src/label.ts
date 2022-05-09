/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file label.ts
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

import { Component, CProps } from './component'
import { HtmlString } from './tools'
import { Icon, IconID } from './icon'

// ============================================================================
// [LABEL]
// ============================================================================

export interface LabelProps extends CProps {
	text: string | HtmlString;
	icon?: IconID;
	align?: 'left' | 'right' | 'center';
	multiline?: boolean;	// understand \n as newlines
}

/**
 * Standard label 
 */

export class Label extends Component<LabelProps>
{
	/**
	 * double constructor, from string/html or as usual
	 */

	constructor( props: LabelProps );
	constructor( text: string | HtmlString );
	constructor( param: any ) {

		if( typeof(param)==='string' || param instanceof HtmlString ) {
			super( { text: param } );
		}
		else {
			super( param );
		}
	}

	/** @ignore */
	render( props: LabelProps ) {

		let text: any = this.m_props.text;
		if( this.m_props.multiline && !(text instanceof HtmlString) ) {
			text = new HtmlString( (text as string).replace( /\n/g, '<br/>' ) );
		}

		if( !props.icon ) {
			this.setContent( text );
		}
		else {
			this.setProp( 'tag', 'span' );
			this.addClass( '@hlayout' );

			this.setContent( [
				new Icon( { icon: props.icon } ),
				new Component( { content: text, ref: 'text' } )
			] );
		}

		this.addClass( props.align ?? 'left' );
	}

	/**
	 * change the displayed text
	 * @param text - new text
	 */

	public set text( txt: string | HtmlString ) {

		let props = this.m_props;	

		if( props.text!==txt ) {
			props.text = txt;

			let text: any = this.m_props.text;
			if( this.m_props.multiline && !(text instanceof HtmlString) ) {
				text = new HtmlString( (text as string).replace( '/\n/g', '<br/>' ) );
			}

			if( this.dom ) {

				let comp: Component = this;
				if( this.m_props.icon ) {
					comp = this.itemWithRef<Component>( 'text' );
				}

				comp.setContent( text );
			}
		}
	}

	/**
	 * 
	 */

	public get text( ) : string | HtmlString {
		return this.m_props.text;
	}
}

