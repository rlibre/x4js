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
import { HtmlString } from './tools';
import { BasicEvent, EvChange, EventMap, EventSource } from './x4_events';

// ============================================================================
// [ICON]
// ============================================================================

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
				const r = await fetch( url );
				if( r.ok ) {
					const svg = await r.text();
					this.svgs.set( url, svg );

					//console.log( 'signal=', url );
					this.signal( 'loaded', EvLoaded(url,svg) );
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

	constructor( props: IconProps ) {
		super( props );
				
		this._setIcon( props.icon, false );

		if( props.size ) {
			this.setStyleValue( 'fontSize', props.size );
		}
	}

	private _setIcon(icon: IconID, remove_old: boolean) {

		const reUrl = /\s*url\s*\(\s*(.+)\s*\)\s*/gi;
		const reSvg = /\s*svg\s*\(\s*(.+)\s*\)\s*/gi;
		const reSvg2 = /(.*\.svg)$/gi;
		const reCls = /\s*cls\s*\(\s*(.+)\s*\)\s*/gi;
		
		if( !icon ) {
			this.m_iconName = '';
			return;
		}

		this.removeClass( '@svg' );
		
		let name, url;
		if (typeof (icon) === 'number') {
			icon = icon.toString(16);
			name = icon;
		}
		else {
			let match_svg = reSvg.exec( icon ) || reSvg2.exec(icon);
			if( match_svg ) {
				const url  = match_svg[1].trim( );
				this._setSVG( url );
				return;
			}
			
			let match_cls = reCls.exec( icon );
			if( match_cls ) {
				const classes  = match_cls[1].trim( );
				this.addClass( classes );
				return;
			}
			
			let match_url = reUrl.exec( icon );
			if( match_url ) {
				url  = match_url[1].trim( );
				name = url.replace( /[/\\\.\* ]/g, '_' );
			}
			else {
				name = icon;
				icon = Stylesheet.getVar( 'icon-'+icon ) as string;

				if( icon=='' || icon===undefined ) { 
					// name your icon 'icon-xxx'
					// ex:
					// :root { --icon-zoom-p: f00e; }
					console.assert( false );	
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
	 * 
	 */
	
	private static icon_cache = [];
}

