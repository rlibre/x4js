/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file menu.ts
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
