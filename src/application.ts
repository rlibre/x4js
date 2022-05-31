/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file application.ts
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
import { EvMessage } from './x4events'
import { BaseComponent, BaseComponentEventMap, BaseComponentProps } from './base_component'
import { Component } from './component'
import { Settings } from './settings'
import { deferCall } from './tools'
import { _tr } from './i18n'
import { flyWrap } from 'x4js'

const _x4_touch_time = Symbol( );


interface ApplicationEventMap extends BaseComponentEventMap {
	message: EvMessage;
	global: EvMessage;
}

/**
 * 
 */

export interface ApplicationProps extends BaseComponentProps<ApplicationEventMap> {
	app_name: string;		// 
	app_version: string;	//
	app_uid?: string;
	locale?: string;		// fr-FR
	renderTo?: HTMLElement;
}

/**
 * Represents an x4 application, which is typically a single page app.
 * You should inherit Application to define yours.
 * Application derives from BaseComponent so you can use that to implement a global messaging system.
 * @example ```ts
 * 
 * // in yout main caode
 * let app = new Application( );
 * 
 * app.events.close.on( ( ev ) => {
 * 	... do something
 * });
 * 
 * // somewhere else in the source
 * function xxx( ) {
 * 	let app = Application.instance( );
 * 	app.events.close.emit( new Events.close() );
 * }
 */

export class Application<P extends ApplicationProps = ApplicationProps, E extends ApplicationEventMap = ApplicationEventMap> extends BaseComponent<P,E> {
	
	private static self: Application = null;

	/**
	 * the application singleton
	 */

	static 	instance( ) : Application {
		return Application.self;
	}

	private m_mainView: Component;

	private m_app_name: string;
	private m_app_version: string;
	private m_app_uid: string;
	
	private m_local_storage: Settings;
	private m_user_data: any;

	private m_touch_time: number;
	private m_touch_count: number;
	
	constructor( props : P ) {
		console.assert( Application.self===null, 'application is a singleton' );
		super( props );

		this.m_app_name = props.app_name ?? 'application';
		this.m_app_version = props.app_version ?? '1.0';
		this.m_app_uid = props.app_uid ?? 'application';

		let settings_name = `${this.m_app_name}.${this.m_app_version}.settings`;
		this.m_local_storage = new Settings( settings_name );
		this.m_user_data = {};

		this.m_touch_time = 0;
		this.m_touch_count = 0;
	
		(Application.self as any) = this;

		if( 'onload' in globalThis ) {
			globalThis.addEventListener( 'load', ( ) => {
				this.ApplicationCreated( );
			})
		}
		else {
			this.ApplicationCreated( );
		}
	}

	ApplicationCreated( ) {
	}

	public get app_name( ) {
		return this.m_app_name;
	}

	public get app_uid( ) {
		return this.m_app_uid;
	}

	public get app_version( ) {
		return this.m_app_version;
	}

	public get local_storage( ) {
		return this.m_local_storage;
	}

	public get user_data( ) {
		return this.m_user_data;
	}

	public get history( ) {
		//if( !this.m_history ) {
		//	this.m_history = new NavigationHistory( );
		//}
		//
		//return this.m_history;
		debugger;
		return null;
	}

	/**
	 * define the application root object (MainView)
	 * @example ```ts
	 * 
	 * let myApp = new Application( ... );
	 * let mainView = new VLayout( ... );
	 * myApp.mainView = mainView;
	 */

	 public setMainView( root: Component, clearBefore: boolean ) {

		const ddom = this.m_props.renderTo ?? x4document.body;
		const dest = flyWrap( ddom );

		dest.addClass( 'x4-root-element' );
		if( clearBefore ) {
			dest._empty( );
		}

		this.m_mainView = root;

		root.setStyleValue( 'position', 'absolute' );
		root._build();

		ddom.appendChild( root.dom );
	}

	set mainView( root: Component ) {
		this.setMainView( root, false );
	}

	public get mainView( ) : Component {
		return this.m_mainView;
	}

	public setTitle( title: string ) {
		x4document.title = this.m_app_name + ' > ' + title;
	}

	public disableZoomWheel( ) {

		window.addEventListener('wheel', function( ev: WheelEvent ) {
			if( ev.ctrlKey ) {
				ev.preventDefault( );
				//ev.stopPropagation( );
			}
		
		}, { passive: false, capture: true } );
	}

	public enterModal( enter: boolean ) {
	}

	public enableTouchDblClick( ) {
		x4document.addEventListener( 'touchstart', ( ev: TouchEvent ) => {

			let now = Date.now( );
			if( (now-this.m_touch_time) > 700 ) {
				this.m_touch_count = 1;
			}
			else {
				this.m_touch_count++;
			}

			this.m_touch_time = now;

			if( this.m_touch_count==2 ) {
				this.m_touch_count = 0;

				// dirty fake dblclick event
				const tch = ev.touches[0];
				let fake: any = {type: "dblclick" };
				for( const n in tch ) {
					fake[n] = tch[n];
				}

				// ignore -> private: dirty x2
				(Component as any)._dispatchEvent( fake );
				ev.stopPropagation( );
			}
		});
	}
};



