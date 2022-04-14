/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|  
*  /__/ \__\   |_|
*        
* @file rating.ts
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

import { CProps, Component, ContainerEventMap } from './component'
import { HLayout } from './layout';
import { Input } from './input'
import { EvChange, EventCallback } from './x4_events';

interface RatingEventMap extends ContainerEventMap {
	change: EvChange;
}

export interface RatingProps extends CProps<RatingEventMap> {
	steps?: number;
	value?: number;
	shape?: string;
	name?: string; 

	change?: EventCallback<EvChange>;
}


export class Rating extends HLayout<RatingProps,RatingEventMap> {

	private m_els: Component[];
	private m_input: Input;
	
	constructor( props: RatingProps ) {
		super( props );

		props.steps = props.steps ?? 5;
	}

	render( props: RatingProps ) {
		
		let shape = props.shape ?? 'star';
		let value = props.value ?? 0;

		this.m_input = new Input( {
			cls: '@hidden',
			name: props.name,
			value: ''+value
		} );

		this.addClass( shape );
		this.setDomEvent( 'click', (e) => this._onclick(e) );

		this.m_els = [];
		for( let i=0; i<props.steps; i++ ) {
			
			let cls = 'item';
			if( i+1 <= value ) {
				cls += ' checked';
			}

			let c = new Component( { 
				tag: 'option',
				cls,
				data: { value: i+1 }
			} );

			this.m_els.push( c );
		}

		this.m_els.push( this.m_input );
		this.setContent( this.m_els );
	}

	getValue( ) {
		return this.m_props.value ?? 0;
	}

	set value( v: number ) {
		this.m_props.value = v;

		for( let c=0; c<this.m_props.steps; c++ ) {
			this.m_els[c].setClass( 'checked', this.m_els[c].getData('value')<=v );
		}

		this.m_input.value = ''+this.m_props.value;
	}

	set steps( n: number ) {
		this.m_props.steps = n;
		this.update( );
	}

	set shape( shape: string ) {
		this.removeClass( this.m_props.shape );
		this.m_props.shape = shape;
		this.addClass( this.m_props.shape );
	}

	private _onclick( ev: MouseEvent ) {

		let on = true;
		for( let el=this.dom.firstChild; el; el = el.nextSibling ) {
			let comp = Component.getElement( <HTMLElement>el );
			comp.setClass( 'checked', on )

			if( el==ev.target ) {
				this.m_input.value = comp.getData( 'value' );
				on = false;
			}
		}

		this.emit( 'change', EvChange( this.m_props.value) );
	} 
}
