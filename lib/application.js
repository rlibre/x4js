"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const base_component_1 = require("./base_component");
const settings_1 = require("./settings");
const tools_1 = require("./tools");
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
class Application extends base_component_1.BaseComponent {
    static self = null;
    /**
     * the application singleton
     */
    static instance() {
        return Application.self;
    }
    m_mainView;
    m_app_name;
    m_app_version;
    m_app_uid;
    m_local_storage;
    m_user_data;
    constructor(props) {
        console.assert(Application.self === null, 'application is a singleton');
        super(props);
        this.m_app_name = props.app_name ?? 'application';
        this.m_app_version = props.app_version ?? '1.0';
        this.m_app_uid = props.app_uid ?? 'application';
        let settings_name = `${this.m_app_name}.${this.m_app_version}.settings`;
        this.m_local_storage = new settings_1.Settings(settings_name);
        this.m_user_data = {};
        Application.self = this;
        if ('onload' in globalThis) {
            globalThis.addEventListener('load', () => {
                this.ApplicationCreated();
            });
        }
        else {
            this.ApplicationCreated();
        }
    }
    ApplicationCreated() {
    }
    get app_name() {
        return this.m_app_name;
    }
    get app_uid() {
        return this.m_app_uid;
    }
    get app_version() {
        return this.m_app_version;
    }
    get local_storage() {
        return this.m_local_storage;
    }
    get user_data() {
        return this.m_user_data;
    }
    get history() {
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
    set mainView(root) {
        this.m_mainView = root;
        this.mainView.addClass('x4-root-element');
        (0, tools_1.deferCall)(() => {
            const dest = this.m_props.renderTo ?? document.body;
            while (dest.firstChild) {
                dest.removeChild(dest.firstChild);
            }
            dest.appendChild(root._build());
        });
    }
    get mainView() {
        return this.m_mainView;
    }
    setTitle(title) {
        document.title = this.m_app_name + ' > ' + title;
    }
    disableZoomWheel() {
        window.addEventListener('wheel', function (ev) {
            if (ev.ctrlKey) {
                ev.preventDefault();
                //ev.stopPropagation( );
            }
        }, { passive: false, capture: true });
    }
    enterModal(enter) {
    }
}
exports.Application = Application;
;
