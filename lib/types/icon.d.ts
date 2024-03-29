/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file icon.ts
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
import { Component, CProps } from './component';
import { BasicEvent } from './x4events';
/**
 * iconID can be:
 * - "url( <path to image> )" ex: "url(my/path/to/my/image.svg)"
 * - "var( <css variable> )"
 * - "cls( <font class> )"
 * - "char( <character> )" ex: "font-char( \uf00d )"
 */
export type IconID = string | number;
export interface IconProps extends CProps {
    icon: IconID;
    size?: number;
}
export interface EvLoaded extends BasicEvent {
    url: string;
    svg: string;
}
export declare function EvLoaded(url: string, svg: string, context?: any): EvLoaded;
/**
 * standard icon
 */
export declare class Icon extends Component<IconProps> {
    private m_icon;
    private m_iconName;
    constructor(props: IconProps | string);
    private _setIcon;
    /**
     * change the icon
     * @param icon - new icon
     */
    set icon(icon: IconID);
    get icon(): IconID;
    private _setSVG;
    /**
     * todo: try to extract viewbox
     */
    private _setSVGPath;
    /**
     *
     */
    private static icon_cache;
}
