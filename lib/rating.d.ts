/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file rating.ts
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
import { CProps, ContainerEventMap } from './component';
import { HLayout } from './layout';
import { EvChange, EventCallback } from './x4_events';
interface RatingEventMap extends ContainerEventMap {
    change: EvChange;
}
export interface RatingProps extends CProps<RatingEventMap> {
    steps?: number;
    value?: number;
    shape?: string;
    name?: string;
    change?: EventCallback<EvChange>;
}
export declare class Rating extends HLayout<RatingProps, RatingEventMap> {
    private m_els;
    private m_input;
    constructor(props: RatingProps);
    render(props: RatingProps): void;
    getValue(): number;
    set value(v: number);
    set steps(n: number);
    set shape(shape: string);
    private _onclick;
}
export {};
