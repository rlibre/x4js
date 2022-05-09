/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file popup.ts
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
import { Container, CProps, ContainerEventMap, EvSize } from './component';
import { Point } from './tools';
import { BasicEvent } from './x4_events';
export interface EvMove extends BasicEvent {
    pos: Point;
}
export declare function EvMove(pos: Point): EvMove;
export interface PopupEventMap extends ContainerEventMap {
    size: EvSize;
    move: EvMove;
}
export interface PopupProps<E extends PopupEventMap = PopupEventMap> extends CProps<E> {
    sizable?: boolean;
}
/**
 * base class for all popup elements
 */
export declare class Popup<P extends PopupProps = PopupProps, E extends PopupEventMap = PopupEventMap> extends Container<P, E> {
    protected m_ui_mask: HTMLElement;
    private m_hasMask;
    static modal_stack: HTMLElement[];
    constructor(props: P);
    enableMask(enable?: boolean): void;
    /**
     * display the popup on screen
     */
    show(modal?: boolean): void;
    centerOnScreen(): void;
    /**
    * display the popup at a specific position
    * @param x
    * @param y
    */
    displayAt(x: number, y: number, align?: string, offset?: {
        x: any;
        y: any;
    }): void;
    /**
     * close the popup
     */
    close(): void;
    componentCreated(): void;
    /**
     * resize for 'all' resize attribute
     */
    private _mouseResize;
}
