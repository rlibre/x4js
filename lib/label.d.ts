/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file label.ts
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
import { HtmlString } from './tools';
import { IconID } from './icon';
export interface LabelProps extends CProps {
    text: string | HtmlString;
    icon?: IconID;
    align?: 'left' | 'right' | 'center';
    multiline?: boolean;
}
/**
 * Standard label
 */
export declare class Label extends Component<LabelProps> {
    /**
     * double constructor, from string/html or as usual
     */
    constructor(props: LabelProps);
    constructor(text: string | HtmlString);
    /** @ignore */
    render(props: LabelProps): void;
    /**
     * change the displayed text
     * @param text - new text
     */
    set text(txt: string | HtmlString);
    /**
     *
     */
    get text(): string | HtmlString;
}
