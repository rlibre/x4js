/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file color.ts
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

import { Stylesheet } from './styles'


const colorValues = {
	'lightsalmon': 0xFFFFA07A,
	'lightseagreen': 0xFF20B2AA,
	'lightskyblue': 0xFF87CEFA,
	'lightslategray': 0xFF778899,
	'lightsteelblue': 0xFFB0C4DE,
	'lightyellow': 0xFFFFFFE0,
	'lime': 0xFF00FF00,
	'limegreen': 0xFF32CD32,
	'linen': 0xFFFAF0E6,
	'magenta': 0xFFFF00FF,
	'maroon': 0xFF800000,
	'mediumaquamarine': 0xFF66CDAA,
	'mediumblue': 0xFF0000CD,
	'mediumorchid': 0xFFBA55D3,
	'mediumpurple': 0xFF9370DB,
	'mediumseagreen': 0xFF3CB371,
	'mediumslateblue': 0xFF7B68EE,
	'mediumspringgreen': 0xFF00FA9A,
	'mediumturquoise': 0xFF48D1CC,
	'mediumvioletred': 0xFFC71585,
	'midnightblue': 0xFF191970,
	'mintcream': 0xFFF5FFFA,
	'mistyrose': 0xFFFFE4E1,
	'moccasin': 0xFFFFE4B5,
	'navajowhite': 0xFFFFDEAD,
	'navy': 0xFF000080,
	'oldlace': 0xFFFDF5E6,
	'olive': 0xFF808000,
	'olivedrab': 0xFF6B8E23,
	'orange': 0xFFFFA500,
	'orangered': 0xFFFF4500,
	'orchid': 0xFFDA70D6,
	'palegoldenrod': 0xFFEEE8AA,
	'palegreen': 0xFF98FB98,
	'paleturquoise': 0xFFAFEEEE,
	'palevioletred': 0xFFDB7093,
	'papayawhip': 0xFFFFEFD5,
	'peachpuff': 0xFFFFDAB9,
	'peru': 0xFFCD853F,
	'pink': 0xFFFFC0CB,
	'plum': 0xFFDDA0DD,
	'powderblue': 0xFFB0E0E6,
	'purple': 0xFF800080,
	'red': 0xFFFF0000,
	'rosybrown': 0xFFBC8F8F,
	'royalblue': 0xFF4169E1,
	'saddlebrown': 0xFF8B4513,
	'salmon': 0xFFFA8072,
	'sandybrown': 0xFFFAA460,
	'seagreen': 0xFF2E8B57,
	'seashell': 0xFFFFF5EE,
	'sienna': 0xFFA0522D,
	'silver': 0xFFC0C0C0,
	'skyblue': 0xFF87CEEB,
	'slateblue': 0xFF6A5ACD,
	'slategray': 0xFF708090,
	'snow': 0xFFFFFAFA,
	'springgreen': 0xFF00FF7F,
	'steelblue': 0xFF4682B4,
	'tan': 0xFFD2B48C,
	'teal': 0xFF008080,
	'thistle': 0xFFD8BFD8,
	'tomato': 0xFFFF6347,
	'turquoise': 0xFF40E0D0,
	'violet': 0xFFEE82EE,
	'wheat': 0xFFF5DEB3,
	'white': 0xFFFFFFFF,
	'whitesmoke': 0xFFF5F5F5,
	'yellow': 0xFFFFFF00,
	'yellowgreen': 0xFF9ACD32,
	'aliceblue': 0xFFF0F8FF,
	'antiquewhite': 0xFFFAEBD7,
	'aqua': 0xFF00FFFF,
	'aquamarine': 0xFF7FFFD4,
	'azure': 0xFFF0FFFF,
	'beige': 0xFFF5F5DC,
	'bisque': 0xFFFFE4C4,
	'black': 0xFF000000,
	'blanchedalmond': 0xFFFFEBCD,
	'blue': 0xFF0000FF,
	'blueviolet': 0xFF8A2BE2,
	'brown': 0xFFA52A2A,
	'burlywood': 0xFFDEB887,
	'cadetblue': 0xFF5F9EA0,
	'chartreuse': 0xFF7FFF00,
	'chocolate': 0xFFD2691E,
	'coral': 0xFFFF7F50,
	'cornflowerblue': 0xFF6495ED,
	'cornsilk': 0xFFFFF8DC,
	'crimson': 0xFFDC143C,
	'cyan': 0xFF00FFFF,
	'darkblue': 0xFF00008B,
	'darkcyan': 0xFF008B8B,
	'darkgoldenrod': 0xFFB8860B,
	'darkgray': 0xFFA9A9A9,
	'darkgreen': 0xFF006400,
	'darkkhaki': 0xFFBDB76B,
	'darkmagenta': 0xFF8B008B,
	'darkolivegreen': 0xFF556B2F,
	'darkorange': 0xFFFF8C00,
	'darkorchid': 0xFF9932CC,
	'darkred': 0xFF8B0000,
	'darksalmon': 0xFFE9967A,
	'darkseagreen': 0xFF8FBC8F,
	'darkslateblue': 0xFF483D8B,
	'darkslategray': 0xFF2F4F4F,
	'darkturquoise': 0xFF00CED1,
	'darkviolet': 0xFF9400D3,
	'deeppink': 0xFFFF1493,
	'deepskyblue': 0xFF00BFFF,
	'dimgray': 0xFF696969,
	'dodgerblue': 0xFF1E90FF,
	'firebrick': 0xFFB22222,
	'floralwhite': 0xFFFFFAF0,
	'forestgreen': 0xFF228B22,
	'fuchsia': 0xFFFF00FF,
	'gainsboro': 0xFFDCDCDC,
	'ghostwhite': 0xFFF8F8FF,
	'gold': 0xFFFFD700,
	'goldenrod': 0xFFDAA520,
	'gray': 0xFF808080,
	'green': 0xFF008000,
	'greenyellow': 0xFFADFF2F,
	'honeydew': 0xFFF0FFF0,
	'hotpink': 0xFFFF69B4,
	'indianred': 0xFFCD5C5C,
	'indigo': 0xFF4B0082,
	'ivory': 0xFFFFFFF0,
	'khaki': 0xFFF0E68C,
	'lavender': 0xFFE6E6FA,
	'lavenderblush': 0xFFFFF0F5,
	'lawngreen': 0xFF7CFC00,
	'lemonchiffon': 0xFFFFFACD,
	'lightblue': 0xFFADD8E6,
	'lightcoral': 0xFFF08080,
	'lightcyan': 0xFFE0FFFF,
	'lightgoldenrodyellow': 0xFFFAFAD2,
	'lightgreen': 0xFF90EE90,
	'lightgrey': 0xFFD3D3D3,
	'lightpink': 0xFFFFB6C1,
	'none': 0,
	'transparent': 0,
}



export class Color
{
	private m_value:number;
	private static custom: Color[] = []

	/**
	 * @example
	 * ```ts
	 * let c = new Color( 255, 255, 255, 0.2 );
	 * let d = new Color( "fff" );
	 * let e = new Color( "css:selection-color" );
	 * let f = new Color( "rgba(255,0,255,0.6)" );
	 * ```
	 */

	constructor( );
	constructor( value: number | string );
	constructor( value: number | string, alpha: number );
	constructor( r: number, g: number, b: number );
	constructor( r: number, g: number, b: number, a: number );
	constructor( r?: any, g?: any, b?: any, a?: any ) {
		
		let argc = arguments.length;
		let self = this;

		function _init( ) {

			if( !argc ) {
				return 0xff000000;
			}

			if( argc==1 ) {

				if( Number.isSafeInteger(r) ) {
					return 0xff000000|(r&0xffffff);
				}

				return self._getCustomColor( r )
			}
			else if( argc==2 ) {
			
				let base,
					alpha = (((g*255)|0)&0xff)<<24;
			
				if( Number.isSafeInteger(r) ) {
					base = r;
				}
				else {
					base = self._getCustomColor( r );
				}

				return (base&0xffffff) | alpha;
			}
			else if( argc==4 && a!==undefined && a<=1.0 ) {
			
				if( a<=0 ) {
					return 0;
				}

				a = a*255;
				a |= 0; 	// convert to int
					
				return ((a&0xff)<<24)  | ((r&0xff)<<16) | ((g&0xff)<<8) | (b&0xff);
			}
			
			return 0xff000000 | ((r&0xff)<<16) | ((g&0xff)<<8) | (b&0xff);
		}
	
		this.m_value = _init( );
	}

	/**
	 * 
	 */

	private _shade( percent: number ) {   
		let t = percent < 0 ? 0 : 255,
			p = percent < 0 ? -percent : percent;

		let v = this._split( );
			
		return new Color( 
			Math.round( (t-v.r) * p ) + v.r, 
			Math.round( (t-v.g) * p ) + v.g, 
			Math.round( (t-v.b) * p ) + v.b, 
			v.a / 255 
		);
	}

	/**
	 * return a color darken by percent
	 * @param percent 
	 */

	darken( percent: number ) {

		if( percent<0 ) percent = 0;
		if( percent>100 ) percent = 100;

		return this._shade( -percent/100 );
	}

	/**
	 * return a color lighten by percent
	 * @param percent 
	 */
	lighten( percent: number ) {

		if( percent<0 ) percent = 0;
		if( percent>100 ) percent = 100;

		return this._shade( percent/100 );
	}

	/**
	 * mix 2 colors
	 * @param {rgb} c1 - color 1
	 * @param {rgb} c2 - color 2
	 * @param {float} percent - 0.0 to 1.0
	 * @example 
	 * ```js
	 * let clr = Color.mix( color1, color2, 0.5 );
	 * ```
	 */

	static mix( c1: Color, c2: Color, p: number ) {

		let e1 = c1._split( ),
			e2 = c2._split( );
			
		let A  = e1.a===e2.a ? e1.a : Math.round( e2.a*p + e1.a*(1-p) ),
			R  = e1.r===e2.r ? e1.r : Math.round( e2.r*p + e1.r*(1-p) ),
			G  = e1.g===e2.g ? e1.g : Math.round( e2.g*p + e1.g*(1-p) ),
			B  = e1.b===e2.b ? e1.b : Math.round( e2.b*p + e1.b*(1-p) );

		return new Color( R, G, B, A/255 );
	}

	/**
	 * split the color into it's base element r,g,b & a (!a 1-255)
	 */
	private _split( ) {
		let f = this.m_value;

		return { 
			a: (f >> 24) & 0xff, 
			r: (f >> 16) & 0xff, 
			g: (f >> 8) & 0xff, 
			b: (f & 0xff)
		};
	}

	/**
	 * change the alpha value
	 */

	fadeout( percent: number ) {
		let el = this._split();
		el.a = el.a / 255;

		el.a = el.a - el.a * percent / 100.0;
		if( el.a>1.0 ) {
			el.a = 1.0;
		}
		else if( el.a<=0.0 ) {
			return Color.NONE;
		}
		
		return new Color( el.r, el.g, el.b, el.a );
	}

	/**
	 * 
	 */

	public static fromHSV( h: number, s: number, v: number, a = 1 ) {
		
		let i = Math.min(5, Math.floor(h * 6)),
            f = h * 6 - i,
            p = v * (1 - s),
            q = v * (1 - f * s),
            t = v * (1 - (1 - f) * s);

		let R, G, B;

        switch (i) {
        case 0:
            R = v;
            G = t;
            B = p;
            break;
        case 1:
            R = q;
            G = v;
            B = p;
            break;
        case 2:
            R = p;
            G = v;
            B = t;
            break;
        case 3:
            R = p;
            G = q;
            B = v;
            break;
        case 4:
            R = t;
            G = p;
            B = v;
            break;
        case 5:
            R = v;
            G = p;
            B = q;
            break;
        }

        return new Color( R*255, G*255, B*255, a );
	}

	/**
	 * 
	 */

	public static toHSV( c: Color ) {
		let el = c._split();

		el.r /= 255.0;
		el.g /= 255.0;
		el.b /= 255.0;
		el.a /= 255.0;

		let max = Math.max(el.r, el.g, el.b),
			min = Math.min(el.r, el.g, el.b),
			delta = max - min,
			saturation = (max === 0) ? 0 : (delta / max),
			value = max;

		let hue;

		if (delta === 0) {
			hue = 0;
		}
		else {
			switch (max) {
			case el.r:
				hue = (el.g - el.b) / delta / 6 + (el.g < el.b ? 1 : 0);
				break;

			case el.g:
				hue = (el.b - el.r) / delta / 6 + 1 / 3;
				break;

			case el.b:
				hue = (el.r - el.g) / delta / 6 + 2 / 3;
				break;
			}
		}

		return { h: hue, s: saturation, v: value, a: el.a };
	}

	/**
	 * 
	 */

	public static fromHLS( h: number, l: number, s: number ) {
	
		let r, g, b;
		if( s == 0 ){
			r = g = b = l; // achromatic
		}
		else{
			function hue2rgb(p, q, t){
				if(t < 0) t += 1.0;
				if(t > 1) t -= 1.0;
				if(t < 1/6) return p + (q - p) * 6 * t;
				if(t < 1/2) return q;
				if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
				return p;
			}

			let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			let p = 2 * l - q;
			
			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}
		
		r = ((r*255) | 0) & 0xff;
		g = ((g*255) | 0) & 0xff;
		b = ((b*255) | 0) & 0xff;

		return new Color( r, g, b );
	}

	/**
	 * 
	 */

	public static toHLS( color: Color ) {

		let f = color.m_value,
			r = ((f >> 16) & 0xff) / 255,
			g = ((f >> 8) & 0xff) / 255,
			b = (f & 0xff) / 255;

		let minval = r,
			maxval = r;
		
		if (g < minval) {
			minval = g;
		}

		if (b < minval) {
			minval = b;
		}
		
		if (g > maxval) {
			maxval = g;
		}

		if (b > maxval) {
			maxval = b;
		}

		let rnorm = 0,
			gnorm = 0,
			bnorm = 0;

		let mdiff = maxval - minval;
		let msum  = maxval + minval;
		let light = 0.5 * msum;
		let satur, hue;

		if (maxval != minval) {
			rnorm = (maxval - r)/mdiff;
			gnorm = (maxval - g)/mdiff;
			bnorm = (maxval - b)/mdiff;
		} 
		else {
			return { h: 0, l: light, s: 0 };
		}

		if( light < 0.5 ) {
			satur = mdiff/msum;
		}
		else {
			satur = mdiff/(2.0 - msum);
		}

		if (r == maxval) {
			hue = 60.0 * (6.0 + bnorm - gnorm);
		}
		else if (g == maxval) {
			hue = 60.0 * (2.0 + rnorm - bnorm);
		}
		else {
			hue = 60.0 * (4.0 + gnorm - rnorm);
		}

		if (hue > 360) {
			hue = hue - 360;
		}

		return { h: hue/360.0, l: light, s: satur };
	}

	/**
	 * get the red value of the color
	 */

	red( ) {
		return (this.m_value >> 16) & 0xff;
	}

	/**
	 * get the green value of the color
	 */

	green( ) {
		return (this.m_value >> 8) & 0xff;
	}

	/**
	 * get the blue value of the color
	 */

	blue( ) {
		return this.m_value & 0xff;	 
	}

	/**
	 * get the alpha value of the color
	 */

	alpha( ) {
		return ( (this.m_value >> 24) & 0xff ) / 255;
	}

	/**
	 * 
	 */

	value( ) {
		return this.m_value;
	}

	/**
	 * convert the color into string value
	 */

	toString( ) {

		let color = this.m_value;
		if( color===0 ) {
			return 'transparent';
		}

		let el = this._split( );

		if( el.a===0xff ) {
			return `rgb(${el.r},${el.g},${el.b})`;
		}
		else {
			el.a /= 255;
			let alpha = el.a.toFixed( 3 );
			return `rgba(${el.r},${el.g},${el.b},${alpha})`;
		}
	}

	toHex( with_alpha = true ) {
		let color = this.m_value;
		if( color===0 ) {
			return 'transparent';
		}

		let el = this._split( );

		if( el.a===0xff || !with_alpha ) {
			return `#${_hx(el.r)}${_hx(el.g)}${_hx(el.b)}`;
		}
		else {
			return `#${_hx(el.r)}${_hx(el.g)}${_hx(el.b)}${_hx(el.a)}`;
		}
	}

	public static addCustomColor( name: string, value: Color ) {
		Color.custom[name] = value;
	}

	public static addCssColor( name: string ) {
		let c = Stylesheet.getVar( name );
		Color.custom['css:'+name] = Color.parse( c.trim() );
	}

	public static parse( str: string ) : Color {
		let m;
	
		if( str[0]=='#' ) {
			const re1 = /#(?<r>[a-fA-F0-9]{2})(?<g>[a-fA-F0-9]{2})(?<b>[a-fA-F0-9]{2})(?<a>[a-fA-F0-9]{2})?/;
			if( (m=re1.exec(str))!==null ) {
				let g = m.groups;
				return new Color( parseInt(g.r,16), parseInt(g.g,16), parseInt(g.b,16), g.a!==undefined ? parseInt(g.a,16)/255.0 : 1.0 );
			}

			const re4 = /#(?<r>[a-fA-F0-9])(?<g>[a-fA-F0-9])(?<b>[a-fA-F0-9])/;
			if( (m=re4.exec(str))!==null ) {
				let gr = m.groups;
				const r = parseInt(gr.r,16);
				const g = parseInt(gr.g,16);
				const b = parseInt(gr.b,16);

				return new Color( r<<4|r, g<<4|g, b<<4|b, 1.0 );
			}
		}

		if( str[0]=='r' ) {
			const re2 = /rgb\(\s*(?<r>\d+)\s*\,\s*(?<g>\d+)\s*\,\s*(?<b>\d+)\s*\)/;
			if( (m=re2.exec(str))!==null ) {
				let g = m.groups;
				return new Color( parseInt(g.r,10), parseInt(g.g,10), parseInt(g.b,10), 1.0 );
			}

			const re3 = /rgba\(\s*(?<r>\d+)\s*\,\s*(?<g>\d+)\s*\,\s*(?<b>\d+)\s*\,\s*(?<a>[0-9.]+)\s*\)/;
			if( (m=re3.exec(str))!==null ) {
				let g = m.groups;
				return new Color( parseInt(g.r,10), parseInt(g.g,10), parseInt(g.b,10), parseFloat(g.a) );
			}
		}

		
		console.log( "invalid color value: "+str );
		return new Color(0);
	}

	private _getCustomColor( name: string ) : number {

		if( name===null ) {
			return 0;
		}

		let std = colorValues[name];
		if( std!==undefined ) {
			return std;
		}
			
		if( Color.custom[name]!==undefined ) {
			return Color.custom[name].m_value;
		}

		if( name.substr(0,4)=='css:' ) {
			Color.addCssColor( name.substr(4) );
			return Color.custom[name].m_value;
		}

		return Color.parse( name ).m_value;
	}
	

	public static contrastColor( color: Color ) : Color {
		let el = color._split( );
		   
		// Calculate the perceptive luminance (aka luma) - human eye favors green color... 
   		let luma = ((0.299 * el.r ) + (0.587 * el.g ) + (0.114 * el.b)) / 255;

   		// Return black for bright colors, white for dark colors
   		return luma > 0.5 ? Color.BLACK : Color.WHITE;
	}

	/**
	 * 
	 */

	public static WHITE = new Color(255,255,255);

	/**
	 * 
	 */

	public static BLACK = new Color(0,0,0);

	/**
	 * 
	 */

	public static NONE = new Color(0,0,0,0);

	static valueFromColorName( name: string ): Color {
	
		let v = colorValues[name];
		
		if( v ) {
			return new Color( v );
		}
		else {
			return null;
		}
		
	}

	static fromCssVar( varName: string ) {
		return new Color( varName ).toString();
	}
}


function _hx( n: number ) {
	return ('00'+n.toString(16)).substr(-2).toUpperCase();
}

