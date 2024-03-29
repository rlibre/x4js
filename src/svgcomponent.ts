/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|  
*  /__/ \__\   |_|
*        
* @file svgcomponent.ts
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

import { Component, CProps, _x4_unitless } from './component'
import { isNumber, isString } from "./tools"

const reNumber = /^-?\d+(\.\d+)?$/;

// degrees to radian
function d2r( d: number ): number {
	return d * Math.PI / 180.0;
}

// polar to cartesian
function p2c( x: number, y: number, r: number, deg: number ): {x: number,y: number} {
	const rad = d2r( deg );
	return {
		x: x + r * Math.cos( rad ),
		y: y + r * Math.sin( rad )
	};
}

function num( x: number ): number {
	return Math.round( x * 1000 ) / 1000;
}

function clean( a, ...b ) {

	// just round number values to 3 digits
	b = b.map( v => {
		if( typeof v === 'number' && isFinite(v) ) {
			return num(v);
		}

		return v;
	});

	return String.raw( a, ...b );
}

/**
 * 
 */

export abstract class SVGItem {
	private m_tag: string
	private m_attrs: Map<string,string>;
	private m_style: Map<string,string>;

	constructor( tag: string ) {
		this.m_tag = tag;
		this.m_attrs = new Map( );
		this.m_style = new Map( );
	}

	/**
	 * render the item
	 * @returns 
	 */
	render( ) : string {
		return `<${this.m_tag} ${this.renderAttrs()} ${this.renderStyle()}>${this.renderContent( )}</${this.m_tag}>`;
	}

	/**
	 * change the stroke color
	 * @param color 
	 */

	stroke( color: string, width?: number ): this {
		this.attr( 'stroke', color );
		if( width!==undefined ) {
			this.attr( 'stroke-width', width+'px' );	
		}
		return this;
	}

	/**
	 * change the stroke width
	 * @param width 
	 */
	strokeWidth( width: number ): this {
		this.attr( 'stroke-width', width+'px' );
		return this;
	}

	/**
	 * change the fill color
	 * @param color 
	 */

	fill( color: string ): this {
		this.attr( 'fill', color );
		return this;
	}

	/**
	 * define a new attribute
	 * @param name attibute name
	 * @param value attribute value
	 * @returns this
	 */

	attr( name: string, value: string ) : this {
		this.m_attrs.set( name, value );
		return this;
	}

	style( name: string, value: string | number ) : this {
		
		if (value === undefined || value==='' || value===undefined ) {
			this.m_style.delete( name );
			return this;
		}
		
		if (!_x4_unitless[name] && (isNumber(value) || reNumber.test(value))) {
			value = value + 'px';
		}

		this.m_style.set( name, ''+value );
		return this;
	}

	/**
	 * add a class
	 * @param name class name to add 
	 */
	
	class( name: string ): this {
		let c = this.m_attrs.get( 'class' );
		this.m_attrs.set( 'class', (c??'' + ' ' + name).trim() );
		return this;
	}
	
	/**
	 * 
	 */
	
	renderAttrs( ): string {
		if( !this.m_attrs.size ) {
			return "";
		}

		let result = '';
		this.m_attrs.forEach( (v,k) => {
			result += ` ${k} = "${v}"`
		});

		return result;
	}

	/**
	 * 
	 */
	
	 renderStyle( ): string {

		if( !this.m_style.size ) {
			return "";
		}

		let result = 'style="';
		this.m_style.forEach( (v,k) => {
			result += `${k}:${v};`
		});

		return result+'"';
	}
	
	/**
	 * 
	 */

	renderContent( ): string {
		return '';
	}

	/**
	 * 
	 */

	clip( id: string ): this {
		this.attr( "clip-path", `url(#${id})` );
		return this;
	}

	/**
	 * 
	 */

	transform( tr: string ): this {
		this.attr( "transform", tr );
		return this;
	}

	/**
	 * 
	 */

	rotate( deg: number, cx: number, cy: number ): this {
		this.transform( `rotate( ${deg} ${cx} ${cy} )` );
		return this;
	}

	translate( dx: number, dy: number ): this {
		this.transform( `translate( ${dx} ${dy} )` );
		return this;
	}

	scale( x: number ): this {
		this.transform( `scale( ${x} )` );
		return this;
	}
}

/**
 * 
 */

export class SVGPath extends SVGItem {
	private m_path: string;

	constructor( ) {
		super( 'path' );
		this.m_path = '';
	}

	override renderAttrs(): string {
		this.attr( 'd', this.m_path );
		return super.renderAttrs( );
	}

	/**
	 * move the current pos
	 * @param x new pos x
	 * @param y new pos y
	 * @returns this
	 */

	moveTo( x: number, y: number ) : this {
		this.m_path += clean`M${x},${y}`;
		return this;
	}

	/**
	 * draw aline to the given point
	 * @param x end x
	 * @param y end y
	 * @returns this
	 */

	lineTo( x: number, y: number ): this {
		this.m_path += clean`L${x},${y}`;
		return this;
	}

	/**
	 * close the currentPath
	 */

	closePath( ): this {
		this.m_path += 'Z';
		return this;
	}

	/**
	 * draw an arc
	 * @param x center x
	 * @param y center y
	 * @param r radius
	 * @param start angle start in degrees
	 * @param end angle end in degrees
	 * @returns this
	 */

	arc( x: number, y: number, r: number, start: number, end: number ): this {

		const st = p2c( x, y, r, start-90 );
		const en = p2c( x, y, r, end-90 );

		const flag = end - start <= 180 ? "0" : "1";
		this.m_path += clean`M${st.x},${st.y}A${r},${r} 0 ${flag} 1 ${en.x},${en.y}`;
		
		return this;
	}
}

/**
 * 
 */

export class SVGText extends SVGItem {

	private m_text;

	constructor( x: number, y: number, txt: string ) {
		super( 'text' );
		this.m_text = txt;
		this.attr( 'x', num(x)+'' );
		this.attr( 'y', num(y)+'' );
	}

	font( font: string ): this {
		this.attr( 'font-family', font );
		return this;
	}

	fontSize( size: number | string ): this {
		this.attr( 'font-size', size+'' );
		return this;
	}

	fontWeight( weight: 'light' | 'normal' | 'bold' ): this {
		this.attr( 'font-weight', weight );
		return this;
	}

	textAlign( align: 'left' | 'center' | 'right' ): this {

		let al;
		switch( align ) {
			case 'left': al = 'start'; break;
			case 'center': al = 'middle'; break;
			case 'right': al = 'end'; break;
			default: return this;
		}

		this.attr( 'text-anchor', al );
		return this;
	}

	verticalAlign( align: 'top' | 'center' | 'bottom' ): this {

		let al;
		switch( align ) {
			case 'top': al = 'hanging'; break;
			case 'center': al = 'middle'; break;
			case 'bottom': al = 'baseline'; break;
			default: return;
		}

		this.attr( 'alignment-baseline', al );
		return this;
	}

	override renderContent( ) {
		return this.m_text;
	}
}

/**
 * 
 */

export class SVGShape extends SVGItem {
	constructor( tag: string ) {
		super( tag );
	}
}

/**
 * 
 */

type number_or_perc = number | `${string}%`

export class SVGGradient extends SVGItem {

	private static g_id = 1;

	private m_id: string;
	private m_stops: { offset: number_or_perc, color: string } [];

	constructor( x1: number_or_perc, y1: number_or_perc, x2: number_or_perc, y2: number_or_perc ) {
		super( 'linearGradient')
		
		this.m_id = 'gx-'+SVGGradient.g_id;
		this.attr( 'id', this.m_id );
		this.attr( 'x1', isString(x1) ? x1 : num(x1)+'' );
		this.attr( 'x2', isString(x2) ? x2 : num(x2)+'' );
		this.attr( 'y1', isString(y1) ? y1 : num(y1)+'' );
		this.attr( 'y2', isString(y2) ? y2 : num(y2)+'' );

		this.m_stops = [];
		SVGGradient.g_id++;
	}

	get id( ) {
		return 'url(#'+this.m_id+')';
	}

	addStop( offset: number_or_perc, color: string ): this {
		this.m_stops.push( {offset,color} );
		return this;
	}

	override renderContent(): string {

		const result = [];
		this.m_stops.forEach( s => {
			result.push( `<stop offset="${s.offset}%" stop-color="${s.color}"></stop>`);
		});

		return result.join('\n' );
	}
}

/**
 * 
 */

export class SVGGroup extends SVGItem {
	protected m_items: SVGItem[];

	constructor( tag = "g" ) {
		super( tag )

        this.m_items = [];
	}

	path( ) {
		const path = new SVGPath( );
		this.m_items.push( path );
		return path;
	}

	text( x, y, txt ) {
		const text = new SVGText( x, y, txt );
		this.m_items.push( text );
		return text;
	}

	ellipse( x, y, r1, r2 = r1 ) {
		const shape = new SVGShape( 'ellipse' );
		shape.attr( 'cx', num(x)+'' );
		shape.attr( 'cy', num(y)+'' );
		shape.attr( 'rx', num(r1)+'' );
		shape.attr( 'ry', num(r2)+'' );
		this.m_items.push( shape );
		return shape;
	}

	rect( x, y, w, h ) {
		const shape = new SVGShape( 'rect' );
		shape.attr( 'x', num(x)+'' );
		shape.attr( 'y', num(y)+'' );
		shape.attr( 'width', num(w)+'' );
		shape.attr( 'height', num(h)+'' );
		this.m_items.push( shape );
		return shape;
	}

	group( ) {
		const group = new SVGGroup( );
		this.m_items.push( group );
		return group;
	}

	/**
	 * 
	 * example
	 * ```ts
	 * const g = c.linear_gradient( '0%', '0%', '0%', '100%' )
	 * 				.addStop( 0, 'red' )
	 * 				.addStop( 100, 'green' );
	 * 
	 * p.rect( 0, 0, 100, 100 )
	 * 		.stroke( g.id );
	 * 
	 * ```
	 */

	linear_gradient( x1: number_or_perc, y1: number_or_perc, x2: number_or_perc, y2: number_or_perc ) {
		const grad = new SVGGradient( x1, y1, x2, y2 );
		this.m_items.push( grad );
		return grad;
	}

	/**
	 * clear 
	 */

	clear( ) {
		this.m_items = [];
	}

	renderContent( ) {
		let result: string[] = [];
		this.m_items.forEach( i => {
			result.push( i.render() );
		});

		return result.join( '\n' );
	}
}


/**
 * 
 */

export class SVGPathBuilder extends SVGGroup
{
	private static g_clip_id = 1;
	
	constructor( ) {
		super( '' );
	}

	addClip( x: number, y: number, w: number, h: number ) {
        
		const id = 'c-'+SVGPathBuilder.g_clip_id++;
		const clip = new SVGGroup( 'clipPath' );
		clip.attr('id', id );
		clip.rect( x, y, w, h );

		this.m_items.push(clip);
        return id;
    }
    
    render() {

		let result = [];
        this.m_items.forEach(i => {
            result.push(i.render());
        });

		return result.join('\n');
     }
}

/**
 * 
 */


export interface SVGProps extends CProps {
	viewBox?: string;
	path?: string;
}


export class SVGComponent<P extends SVGProps = SVGProps> extends Component<P> {

	constructor( props: P ) {
		super( props );

		this.setTag('svg','http://www.w3.org/2000/svg');
		this.setAttribute('xmlns','http://www.w3.org/2000/svg');

		this.setAttributes( {
			viewBox: props.viewBox,
		});

		this.setContent( props.path );
	}

	
}



