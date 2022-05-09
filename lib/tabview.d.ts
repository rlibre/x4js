/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file tabview.ts
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
import { Component } from './component';
import { CardView, CardViewProps, ICardViewItem } from './cardview';
import { MenuItem } from './menu';
interface TabProps extends CardViewProps {
    tab_selector?: boolean;
    menu?: MenuItem;
}
/**
 * Standard TabView class
 */
export declare class TabView extends CardView<TabProps> {
    protected m_tab_selector: boolean;
    protected m_menu: MenuItem;
    constructor(props: TabProps);
    /** @ignore */
    render(): void;
    protected _updateSelector(): void;
    protected _prepareSelector(card: ICardViewItem): Component;
    protected _preparePage(page: Component): void;
}
export {};
