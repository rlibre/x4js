/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file cardview.ts
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
import { Component, CProps, CEventMap } from './component';
import { EvChange } from './x4events';
import { IconID } from './icon';
export type PageOrCallback = Component | (() => Component);
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
