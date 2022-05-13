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
