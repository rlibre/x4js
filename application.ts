/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file application.ts
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

import { EvMessage } from './x4_events'
import { BaseComponent, BaseComponentEventMap, BaseComponentProps } from './base_component'
import { Component } from './component'
import { Settings } from './settings'
import { deferCall } from './tools'
import { _tr } from './i18n'


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
	app_uid: string;
	locale: string;			// fr-FR
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
	
	constructor( props : P ) {
		console.assert( Application.self===null, 'application is a singleton' );
		super( props );

		this.m_app_name = props.app_name ?? 'application';
		this.m_app_version = props.app_version ?? '1.0';
		this.m_app_uid = props.app_uid ?? 'application';

		let settings_name = `${this.m_app_name}.${this.m_app_version}.settings`;
		this.m_local_storage = new Settings( settings_name );
		this.m_user_data = {};
	
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
	 * myApp.setMainView( mainView  );
	 */

	 public set mainView( root: Component ) {

		this.m_mainView = root;

		deferCall( ( ) => {
			document.body.appendChild(root._build());
		} );
	}

	public get mainView( ) : Component {
		return this.m_mainView;
	}

	public setTitle( title: string ) {
		document.title = this.m_app_name + ' > ' + title;
	}

	public disableZoomWheel( ) {

		window.addEventListener('mousewheel', function( ev: WheelEvent ) {
			if( ev.ctrlKey ) {
				ev.preventDefault( );
				//ev.stopPropagation( );
			}
		
		}, { passive: false, capture: true } );
	}

	public enterModal( enter: boolean ) {
	}
};



