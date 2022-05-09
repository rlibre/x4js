/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file sidebarview.ts
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
import { VLayout } from './layout';
import { CardView, CardViewProps, ICardViewItem } from './cardview';
export interface SideBarItem extends ICardViewItem {
}
export interface SideBarProps extends CardViewProps {
    bar_sizable?: boolean;
}
/**
 *
 */
export declare class SideBarView extends CardView {
    m_sidebar: VLayout;
    m_content: Component;
    constructor(props: SideBarProps);
    /** @ignore */
    render(): void;
    protected _prepareSelector(card: ICardViewItem): Component;
    protected _preparePage(page: Component): void;
}
