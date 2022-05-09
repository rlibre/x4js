/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file texthiliter.ts
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
/**
 * idea came from https://www.cdolivet.com/editarea
 */
import { Component, CProps, CEventMap } from './component';
import { EvChange } from './x4_events';
interface TextHiliterEventMap extends CEventMap {
    change: EvChange;
}
interface TextHiliterProps extends CProps {
    text: string;
    kwList?: Set<string>;
    change?: EvChange;
}
export declare class TextHiliter extends Component<TextHiliterProps, TextHiliterEventMap> {
    private m_text;
    private m_ed;
    private m_hi;
    private m_top;
    private m_kwList;
    constructor(props: TextHiliterProps);
    /** @ignore */
    render(): void;
    componentCreated(): void;
    get value(): string;
    set value(t: string);
    private _keydown;
    private _hiliteText;
    private _updateScroll;
    private _escape;
    private _tokenize;
}
export {};
