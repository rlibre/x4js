/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file link.ts
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
import { Component, CProps, CEventMap, HtmlString } from './component';
import { EvClick, EventCallback } from './x4_events';
interface LinkEventMap extends CEventMap {
    click: EvClick;
}
export interface LinkProps extends CProps<LinkEventMap> {
    text?: string | HtmlString;
    href?: string;
    target?: string;
    click?: EventCallback<EvClick>;
}
/**
 * Standard Link
 */
export declare class Link extends Component<LinkProps, LinkEventMap> {
    constructor(props?: LinkProps);
    private _handleClick;
    /** @ignore */
    render(props: LinkProps): void;
    set text(text: string | HtmlString);
}
export {};
