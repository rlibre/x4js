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
import { CEventMap, Component, CProps } from './component';
import { EvClick, EventCallback } from './x4_events';
import { Popup, PopupProps } from './popup';
import { IconID } from './icon';
import { Label } from './label';
import { HLayout } from './layout';
export declare class MenuSeparator extends Component {
}
export declare class MenuTitle extends Label {
}
/**
 * Standard Menu
 */
export declare type MenuOrSep = MenuItem | MenuSeparator | MenuTitle;
export interface MenuProps extends PopupProps {
    items?: MenuOrSep[];
}
export declare class Menu extends Popup<MenuProps> {
    private static watchCount;
    private static rootMenu;
    protected m_subMenu: Menu;
    protected m_opener: MenuItem;
    protected m_virtual: boolean;
    protected m_lock: number;
    constructor(props: MenuProps, opener?: MenuItem);
    lock(yes: boolean): void;
    setVirtual(): void;
    setSubMenu(menu: Menu): void;
    hideSubMenu(): void;
    /** @ignore */
    render(props: MenuProps): void;
    /**
    *
    */
    show(): void;
    /**
     *
    */
    close(): void;
    /**
     *
     */
    clear(): void;
    /**
    * @internal
    */
    static _addMenu(menu: any): void;
    static _removeMenu(): void;
    private static _mouseWatcher;
    /**
    * hide all the visible menus
    */
    static _discardAll(): void;
    displayAt(ev: UIEvent): void;
    displayAt(x: number, y?: number, align?: string, offset?: {
        x: any;
        y: any;
    }): void;
}
/**
 * MENU ITEM
 */
interface MenuItemEventMap extends CEventMap {
    click: EvClick;
}
export interface MenuItemProps extends CProps {
    itemId?: any;
    text?: string;
    icon?: IconID;
    items?: MenuOrSep[];
    checked?: boolean;
    cls?: string;
    click?: EventCallback<EvClick>;
}
export declare class MenuItem extends Component<MenuItemProps, MenuItemEventMap> {
    private m_menu;
    private m_isOpen;
    constructor(text: string, click: EventCallback<EvClick>);
    constructor(props: MenuItemProps);
    /** @ignore */
    render(props: MenuItemProps): void;
    get id(): any;
    get text(): string;
    get isPopup(): boolean;
    _close(): void;
    protected _click(ev: MouseEvent): void;
    protected _mousedown(ev: MouseEvent): void;
}
/**
 *
 */
export declare class MenuBar extends HLayout {
    protected m_items: MenuOrSep[];
    constructor(props: MenuProps, opener?: MenuItem);
    /** @ignore */
    render(): void;
}
export {};
