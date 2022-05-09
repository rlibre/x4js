/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file icon.ts
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
import { Component, CProps } from './component';
import { BasicEvent } from './x4_events';
export declare type IconID = string | number;
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
    constructor(props: IconProps);
    private _setIcon;
    /**
     * change the icon
     * @param icon - new icon
     */
    set icon(icon: IconID);
    get icon(): IconID;
    private _setSVG;
    /**
     *
     */
    private static icon_cache;
}
