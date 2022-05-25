/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file popup.ts
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
import { Container, CProps, ContainerEventMap, EvSize } from './component';
import { Point } from './tools';
import { BasicEvent } from './x4events';
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
