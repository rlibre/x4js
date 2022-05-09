/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file tooltips.ts
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
/**
 *
 */
export declare class Tooltip extends Component {
    private m_text;
    set text(text: any);
    /** @ignore */
    render(): void;
    /**
    * display the menu at a specific position
    * @param x
    * @param y
    */
    displayAt(x: number, y: number, align?: string): void;
}
export declare type TooltipHandler = (text: string) => void;
export declare function initTooltips(cb?: TooltipHandler): void;
