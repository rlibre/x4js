/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file cardview.ts
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
import { Component, CProps, CEventMap } from './component';
import { EvChange } from './x4_events';
import { IconID } from './icon';
export declare type PageOrCallback = Component | (() => Component);
export interface ICardViewItem {
    icon?: IconID;
    name: string;
    title: string;
    page: PageOrCallback;
}
interface CardViewEventMap extends CEventMap {
    change?: EvChange;
}
export interface CardViewProps extends CProps<CardViewEventMap> {
    pages: ICardViewItem[];
    active?: string;
}
interface ICardItemEx extends ICardViewItem {
    selector: Component;
    active: boolean;
}
/**
 * Standard CardView class
 * a card view is composed of multiples pages with only one visible at a time.
 * pages can be selected by a component (like tabs ou sidebar).
 * or by code.
 */
export declare class CardView<P extends CardViewProps = CardViewProps, E extends CardViewEventMap = CardViewEventMap> extends Component<P, E> {
    protected m_cards: ICardItemEx[];
    protected m_ipage: string;
    protected m_cpage: ICardItemEx;
    constructor(props: P);
    /** @ignore */
    render(): void;
    /**
     * switch to a specific card
     * @param name - card name as define in constructor
     */
    switchTo(name?: string): void;
    /**
     *
     */
    setPages(pages: ICardViewItem[]): void;
    /**
     *
     */
    private _initTabs;
    protected _updateSelector(): void;
    /**
     * prepare the cardinfo
     * can be used by derivations to create & set selectors
     */
    protected _prepareSelector(card: ICardViewItem): Component;
    /**
     *
     */
    protected _preparePage(page: Component): void;
}
export {};
