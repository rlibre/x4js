"use strict";
/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file menu.ts
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
exports.MenuBar = exports.MenuItem = exports.Menu = exports.MenuTitle = exports.MenuSeparator = void 0;
const component_1 = require("./component");
const x4_events_1 = require("./x4_events");
const popup_1 = require("./popup");
const icon_1 = require("./icon");
const label_1 = require("./label");
const layout_1 = require("./layout");
const tools_1 = require("./tools");
// ============================================================================
// [MENU]
// ============================================================================
class MenuSeparator extends component_1.Component {
}
exports.MenuSeparator = MenuSeparator;
class MenuTitle extends label_1.Label {
}
exports.MenuTitle = MenuTitle;
class Menu extends popup_1.Popup {
    static watchCount = 0;
    static rootMenu = null;
    m_subMenu;
    m_opener;
    m_virtual;
    m_lock;
    constructor(props, opener) {
        super(props);
        this.addClass('@shadow');
        this.m_opener = opener;
        this.m_virtual = false;
        this.m_lock = 0;
        this.enableMask(false);
    }
    lock(yes) {
        this.m_lock += yes ? 1 : -1;
    }
    setVirtual() {
        this.m_virtual = true;
    }
    setSubMenu(menu) {
        this.m_subMenu = menu;
    }
    hideSubMenu() {
        if (this.m_subMenu) {
            this.m_subMenu.m_opener._close();
            this.m_subMenu.hide();
            this.m_subMenu = null;
        }
    }
    /** @ignore */
    render(props) {
        this.setContent(props.items);
    }
    /**
    *
    */
    show() {
        if (!this.m_virtual) {
            Menu._addMenu(this);
        }
        super.show();
    }
    /**
     *
    */
    close() {
        if (!this.dom && !this.m_virtual) {
            return;
        }
        if (this.m_opener) {
            this.m_opener._close();
        }
        if (this.m_subMenu) {
            this.m_subMenu.close();
            this.m_subMenu = null;
        }
        super.close();
        Menu._removeMenu();
    }
    /**
     *
     */
    clear() {
        this.m_props.items = [];
    }
    /**
    * @internal
    */
    static _addMenu(menu) {
        //console.log( 'addmenu' );
        if (Menu.watchCount == 0) {
            Menu.rootMenu = menu;
            document.addEventListener('mousedown', Menu._mouseWatcher);
        }
        Menu.watchCount++;
    }
    static _removeMenu() {
        //console.log( 'removemenu' );
        console.assert(Menu.watchCount > 0);
        Menu.watchCount--;
        if (Menu.watchCount == 0) {
            document.removeEventListener('mousedown', Menu._mouseWatcher);
        }
    }
    static _mouseWatcher(ev) {
        if (ev.defaultPrevented) {
            return;
        }
        let elOn = ev.target;
        while (elOn) {
            // is mouse on a menu
            let mouseon = component_1.Component.getElement(elOn);
            if (mouseon && (mouseon instanceof Menu /*|| elOn.$el instanceof Menubar*/)) {
                return;
            }
            elOn = elOn.parentElement;
        }
        Menu._discardAll();
    }
    /**
    * hide all the visible menus
    */
    static _discardAll() {
        if (Menu.rootMenu) {
            Menu.rootMenu.close();
            Menu.rootMenu = null;
        }
    }
    displayAt(...args) {
        if (!this.m_lock) {
            Menu._discardAll();
        }
        let x, y, align, offset;
        if (args.length == 1) {
            ({ x, y } = (0, tools_1.getMousePos)(args[0], true));
        }
        else {
            [x, y, align, offset] = args;
        }
        if (!align) {
            align = 'top left';
        }
        super.displayAt(x, y, align, offset);
    }
}
exports.Menu = Menu;
class MenuItem extends component_1.Component {
    m_menu;
    m_isOpen;
    constructor(a, b) {
        if ((0, tools_1.isString)(a)) {
            super({
                text: a,
                click: b
            });
        }
        else {
            super(a);
        }
        this.mapPropEvents(this.m_props, 'click');
        this.m_menu = null;
        this.m_isOpen = false;
        this.setDomEvent('mousedown', (e) => this._mousedown(e));
        this.setDomEvent('click', (e) => this._click(e));
    }
    /** @ignore */
    render(props) {
        let icon = props.icon ?? 0x20;
        let text = props.text;
        if (props.checked !== undefined) {
            icon = props.checked ? 'cls(far fa-check)' : 0; //todo: use stylesheet
        }
        if (this.isPopup) {
            this.addClass('@popup-menu-item');
        }
        if (!text && !icon) {
            this.addClass('@separator');
        }
        if (props.cls) {
            this.addClass(props.cls);
        }
        this.setProp('tag', 'a');
        //@bug: do not kill focus on click 
        //	this.setAttribute( 'tabindex', '0' );
        this.setContent([
            icon < 0 ? null : new icon_1.Icon({ icon }),
            new label_1.Label({ flex: 1, text })
        ]);
    }
    get id() {
        return this.m_props.itemId;
    }
    get text() {
        return this.m_props.text;
    }
    get isPopup() {
        return !!this.m_props.items;
    }
    _close() {
        this.removeClass('@opened');
        this.m_isOpen = false;
    }
    _click(ev) {
        if (!this.isPopup) {
            this.emit('click', (0, x4_events_1.EvClick)());
            Menu._discardAll();
        }
    }
    _mousedown(ev) {
        if (this.isPopup) {
            if (!this.m_menu) {
                this.m_menu = new Menu({ items: this.m_props.items }, this);
            }
            let doClose = this.m_isOpen;
            // if parent menu has an opened sub menu, close it
            let parent_menu = component_1.Component.getElement(this.dom, Menu);
            if (parent_menu) {
                parent_menu.hideSubMenu();
            }
            if (!doClose) {
                if (parent_menu) {
                    parent_menu.setSubMenu(this.m_menu);
                }
                this.m_isOpen = true;
                let rc = this.getBoundingRect();
                this.m_menu.lock(true);
                if (parent_menu) {
                    // standard menu
                    this.m_menu.displayAt(rc.right, rc.top);
                }
                else {
                    // menubar / menubutton
                    this.m_menu.displayAt(rc.left, rc.bottom);
                }
                this.m_menu.lock(false);
                this.addClass('@opened');
            }
            ev.preventDefault();
        }
    }
}
exports.MenuItem = MenuItem;
/**
 *
 */
class MenuBar extends layout_1.HLayout {
    m_items;
    constructor(props, opener) {
        super(props);
        console.assert(false, 'not imp');
        this.addClass('@shadow');
        this.m_items = props.items;
    }
    /** @ignore */
    render() {
        this.setContent(this.m_items);
    }
}
exports.MenuBar = MenuBar;
