/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file image.ts
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
import { Component, CProps, html } from './component'

interface LazyLoad {
	el: Component;
	src: string;
}

// ============================================================================
// [IMAGE]
// ============================================================================

export interface ImageProps extends CProps
{
	src: string;
	alt?: string;
	lazy?: boolean;	// mark image as lazy loading
	alignment?: 'fill' | 'contain' | 'cover' | 'scale-down' | 'none';
	overlays?: Component[];
}

const emptyImageSrc = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

function _isStaticImage( src: string ) {
	return src.substring(0,5)=='data:';
}



/**
 * Standard image class
 */
export class Image extends Component<ImageProps>
{
	protected m_created: boolean;
	protected m_lazysrc: string;		// expected 
	private m_img: Component;
	
	constructor(props: ImageProps) {
		super(props);

		this.m_created = false;
		
		this.m_props.lazy = props.lazy===false ? false : true;
		this.m_props.alt = props.alt;
		
		if( props.lazy!==false ) {
			this.m_lazysrc = props.src;
			props.src = emptyImageSrc;
		}
		
		this.setDomEvent( 'create', ( ) => {
			if( props.lazy ) {
				this.setImage( this.m_lazysrc, true );
			}
		});
	}

	/** @ignore */
	render( ) {
		let mp = this.m_props;

		this.m_img = new Component( {
			tag: 'img',
			attrs: {
				draggable: false,
				alt: mp.alt ?? '',
				decoding: mp.lazy ? 'async' : undefined,
			},
			style: {
				objectFit: mp.alignment ? mp.alignment : undefined
			}
		});

		if( mp.overlays ) {
			mp.overlays.forEach( x => x.addClass('@fit') );
			this.setContent( [this.m_img,...mp.overlays] );
		}
		else {
			this.setContent( this.m_img );
		}
	}
	
	/**
	 * change the image
	 * @param src - image path
	 */

	public setImage( src: string, force?: boolean ) {

		if( !src ) {
			src = emptyImageSrc;
			this.addClass( 'empty' );
		}
		else {
			this.removeClass( 'empty' );
		}
		
		if( !this.m_props.lazy ) {
			this.m_props.src = src;
			this.m_lazysrc = src;

			if( this.m_img.dom ) {
				this.m_img.dom.setAttribute( 'src', src );
			}
		}
		else if( force || this.m_lazysrc!=src ) {
			if( _isStaticImage(src) ) {
				// not to download -> direct display
				this.m_props.src = src;
				this.m_lazysrc = src;

				if( this.m_img.dom ) {
					this.m_img.dom.setAttribute( 'src', this.m_props.src );
				}
			}
			else {
				// clear current image while waiting
				this.m_props.src = emptyImageSrc;
				if( this.m_img.dom ) {
					this.m_img.dom.setAttribute( 'src', this.m_props.src );
				}
				
				this.m_lazysrc = src;
				if( this.dom ) {
					this._update_image( );			
				}
			}
		}
	}

	private _update_image( ) {

		console.assert( !!this.dom );

		if( this.m_lazysrc && !_isStaticImage(this.m_lazysrc) ) {
			// we do not push Components in a static array...
			Image.lazy_images_waiting.push( { 
				el: this, 
				src: this.m_lazysrc 
			} );

			if( Image.lazy_image_timer===undefined ) {
				Image.lazy_image_timer = setInterval( Image.lazyWatch as TimerHandler, 10 );
			}
		}
	}

	private static lazy_images_waiting: LazyLoad[] = [];
	private static lazy_image_timer: number = undefined;

	private static lazyWatch( ) {

		let newList = [];
		let done = 0;
			
		Image.lazy_images_waiting.forEach( ( lazy ) => {

			let dom = lazy.el.dom,
				src = lazy.src;
				
			// skip deleted elements
			if( !dom || dom.offsetParent === null ) {
				// do not append to newList
				return;
			}

			let rc = dom.getBoundingClientRect();

			// if it is visible & inserted inside the document
			if( !done && dom.offsetParent!==null && 
				rc.bottom >= 0 && rc.right >= 0 &&  
				rc.top <= (window.innerHeight || x4document.documentElement.clientHeight) && 
				rc.left <= (window.innerWidth || x4document.documentElement.clientWidth) ) {

				// ok, we load the image
				let img = <HTMLElement>dom.firstChild;
				img.setAttribute( 'src', src );
				lazy.el.removeClass( 'empty' );
				done++;
			}
			else {
				// still not visible: may be next time
				newList.push( lazy );
			}
		} );

		Image.lazy_images_waiting = newList;

		// no more elements to watch...
		if( newList.length==0 ) {
			clearInterval( Image.lazy_image_timer );
			Image.lazy_image_timer = undefined;
		}
	}
}