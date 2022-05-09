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
import { EvMessage } from './x4_events';
import { BaseComponent, BaseComponentEventMap, BaseComponentProps } from './base_component';
import { Component } from './component';
import { Settings } from './settings';
interface ApplicationEventMap extends BaseComponentEventMap {
    message: EvMessage;
    global: EvMessage;
}
/**
 *
 */
export interface ApplicationProps extends BaseComponentProps<ApplicationEventMap> {
    app_name: string;
    app_version: string;
    app_uid?: string;
    locale?: string;
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
export declare class Application<P extends ApplicationProps = ApplicationProps, E extends ApplicationEventMap = ApplicationEventMap> extends BaseComponent<P, E> {
    private static self;
    /**
     * the application singleton
     */
    static instance(): Application;
    private m_mainView;
    private m_app_name;
    private m_app_version;
    private m_app_uid;
    private m_local_storage;
    private m_user_data;
    constructor(props: P);
    ApplicationCreated(): void;
    get app_name(): string;
    get app_uid(): string;
    get app_version(): string;
    get local_storage(): Settings;
    get user_data(): any;
    get history(): any;
    /**
     * define the application root object (MainView)
     * @example ```ts
     *
     * let myApp = new Application( ... );
     * let mainView = new VLayout( ... );
     * myApp.setMainView( mainView  );
     */
    set mainView(root: Component);
    get mainView(): Component;
    setTitle(title: string): void;
    disableZoomWheel(): void;
    enterModal(enter: boolean): void;
}
export {};
