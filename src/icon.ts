/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file icon.ts
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

import { Component, CProps } from './component'
import { Stylesheet } from './styles'
import { HtmlString, isString } from './tools';
import { BasicEvent, EvChange, EventMap, EventSource } from './x4events';

// ============================================================================
// [ICON]
// ============================================================================

/**
 * iconID can be:
 * - "url( <path to image> )" ex: "url(my/path/to/my/image.svg)"
 * - "var( <css variable> )"
 * - "cls( <font class> )"
 * - "char( <character> )" ex: "font-char( \uf00d )"
 */

export type IconID = string | number;

export interface IconProps extends CProps {
	icon: IconID;
	size?: number;
}

export interface EvLoaded extends BasicEvent {
	url: string;
	svg: string;
}

export function EvLoaded( url: string, svg: string, context = null ) {
	return BasicEvent<EvLoaded>({ url, svg, context });
}

interface LoadingEventMap extends EventMap {
	loaded: EvLoaded;
}

function trimQuotes( str:string ): string {
	const l = str.length;

	//chrome
	if( str[0]=='"' && str[l-1]=='"' ) {
		str = str.substring( 1, l-1 )
		str = str.replaceAll( '\\"', "'" );
		return str;
	}

	//firefox
	if( str[0]=="'" && str[l-1]=="'" ) {
		str = str.substring( 1, l-1 )
		return str;
	}

	return str;
}

class Loader extends EventSource<LoadingEventMap> {
	svgs: Map<string,string>;

	constructor( ) {
		super( );
		this.svgs = new Map( );
	}

	load( url: string ) {
		if( this.svgs.has(url) ) {
			const svg = this.svgs.get( url );
			if( svg ) {
				//console.log( 'cached=', url );
				this.signal( 'loaded', EvLoaded(url,svg) );
			}
		}
		else {
			// mark it as loading
			this.svgs.set( url, null );

			// then start loading
			const _load = async ( url ) => {
					
				// shortcut
				if( url.substring(0,24)=="data:image/svg+xml;utf8,") {
					const svg = url.substring(24);
					this.svgs.set( url, svg );
					this.signal( 'loaded', EvLoaded(url,svg) );
				}
				else {
					const r = await fetch( url );
					if( r.ok ) {
						const svg = await r.text();
						// check response, must be svg
						//TODO: find better
						if (!svg.startsWith("<svg") && !svg.startsWith('<?xml') ) {
							console.error( "svg loading error (svg files must start with <svg... ): ", svg );
							this.signal( 'loaded', EvLoaded(url,"") );
						}
						else {
							this.svgs.set( url, svg );
							this.signal( 'loaded', EvLoaded(url,svg) );
						}
					}
				}
			}

			_load( url );			
		}
	}
}

const svgLoader = new Loader( );


/**
 * standard icon
 */
export class Icon extends Component<IconProps>
{
	private m_icon: string;
	private m_iconName: IconID;

	constructor( props: IconProps | string ) {

		if( isString(props) ) {
			super( { icon: props } );
		}
		else {
			super( props );
		}

		this._setIcon( this.m_props.icon, false );
		if( this.m_props.size ) {
			this.setStyleValue( 'fontSize', this.m_props.size );
		}
	}

	private _setIcon(icon: IconID, remove_old: boolean) {

		if( !icon ) {
			this.m_iconName = '';
			return;
		}

		this.removeClass( '@svg' );

		//	todo: deprecated
		let name, url: string;
		if (typeof (icon) === 'number') {
			icon = icon.toString(16);
			name = icon;
			console.error( "deprecation error: invalid icon name" );	
		}
		else {
			// var( <var-name> )
			//	
			//	in the .css
			//  --------------------------
			//	:root {
			//		--chevron-up: data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M0 96C0 78.33 14.33 64 32 64H416C433.7 64 448 78.33 448 96C448 113.7 433.7 128 416 128H32C14.33 128 0 113.7 0 96z"/></svg>';
			//	}
			//
			//	var( "--chevron-up" )
			const reVar = /\s*var\s*\(\s*(.+)\s*\)\s*/gi;
			let match_var = reVar.exec( icon );
			while( match_var ) {
				const varname = match_var[1].trim( );
				icon = (Stylesheet.getVar(varname) as string).trim( );
                if (icon == '' || icon === undefined) {
					console.error( `icon: unable to find variable named '${varname}'` );
					return;
				}
				else {
					icon = trimQuotes( icon );
				}

				match_var = reVar.exec( icon );
			}

			// <svg ...>
			if( icon.startsWith('<svg') ) {
				this._setSVG( 'data:image/svg+xml;utf8,'+icon);
				return;
			}
			
			//	svg( <svg-filename> )	-> 	svg( "mysvgfile.svg" )	
			//	<svg-filename>.svg 		->  "mysvgfile.svg"

			const reSvg = /\s*svg\s*\(\s*(.+)\s*\)\s*/gi;
			const reSvg2 = /(.*\.svg)$/gi;
			
			let match_svg = reSvg.exec( icon ) || reSvg2.exec(icon);
			if( match_svg ) {
				const url  = match_svg[1].trim( );
				this._setSVG( url );
				return;
			}

			//	data( <direct> )
			//	data( "data:image/svg+xml;utf8,<svg...></svg>" )

			const reSvg4 = /^\s*(data\:image\/.+)\s*$/gi;
			let match_dta = reSvg4.exec( icon );
			if( match_dta ) {
				this._setSVG( match_dta[1] );
				return;
			}
			
			//	cls( "fas fa-angle-up" )
			//
			const reCls = /\s*cls\s*\(\s*(.+)\s*\)\s*/gi;
			let match_cls = reCls.exec( icon );
			if( match_cls ) {
				const classes  = match_cls[1].trim( );
				this.addClass( classes );
				return;
			}
			
			//	url( "www.google.com" )
			//
			const reUrl = /\s*url\s*\(\s*(.+)\s*\)\s*/gi;
			let match_url = reUrl.exec( icon );
			if( match_url ) {
				url  = trimQuotes( match_url[1].trim( ) );
				// this value is escaped				
				url = url.replaceAll( "\\", "" );
				this._setSVG( url );
				return;
			}

			//	url( "www.google.com" )
			//
			const reChar = /\s*font-char\s*\(\s*(.+)\s*\)\s*/gi;
			let match_char = reChar.exec( icon );
			if( match_char ) {
				this.removeClass( '@svg-icon' );
				this.setContent( match_char[1], false );
				return;
			}
			
			else {
				// todo: deprecated
				console.error( "deprecation error: invalid icon name" );	

				name = icon;
				icon = Stylesheet.getVar( 'icon-'+icon ) as string;

				if( icon=='' || icon===undefined ) { 
					// name your icon 'icon-xxx'
					// ex:
					// :root { --icon-zoom-p: f00e; }
					icon = '0'; 
				}
			}
		}

		this.m_iconName = name;
		if( this.m_icon===icon ) {
			return;
		}

		let css = Component.getCss(),
			rulename: string;

		if (remove_old && this.m_icon) {
			rulename = 'icon-' + name;
			this.removeClass(rulename);
		}
				
		// generate dynamic css icon rule
		rulename = 'icon-' + name;
		
		if( Icon.icon_cache[rulename]===undefined ) {
			Icon.icon_cache[rulename] = true;

			let rule: string;

			if( url ) {
				rule =  `display: block; content: ' '; background-image: url(${url}); background-size: contain; width: 100%; height: 100%; background-repeat: no-repeat; color: white;`;
			}
			else {
				rule = `content: "\\${icon}";`;
			}

			css.setRule(rulename, `.${rulename}::before {${rule}}`);
		}

		this.addClass(rulename);
		this.m_icon = icon;
	}

	/**
	 * change the icon
	 * @param icon - new icon
	 */
	
	public set icon( icon: IconID ) {
		this._setIcon( icon, true );
	}

	public get icon( ) : IconID {
		return this.m_iconName;
	}

	private _setSVG( url: string ) {

		const set = ( ev: EvLoaded ) => {
			//console.log( 'set=', ev.url, 'url=', url );
			
			if( ev.url==url ) {
				this.addClass( '@svg-icon' );
				this.setContent( HtmlString.from(ev.svg), false );
				svgLoader.off( 'loaded', set );
			}
		}

		svgLoader.on( 'loaded', set );
		svgLoader.load( url );
	}

	/**
	 * todo: try to extract viewbox
	 */

	private _setSVGPath( pth: string ) {
		this.addClass( '@svg-icon' );
		this.setContent( HtmlString.from(`<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="${pth}/></svg>`), false );
	}

	/**
	 * 
	 */
	
	private static icon_cache = [];
}

