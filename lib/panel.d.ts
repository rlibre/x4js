/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file panel.ts
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
import { Component, ComponentContent, ContainerProps, ContainerEventMap } from './component';
import { VLayout } from './layout';
import { IconID } from './icon';
export interface PanelProps<E extends ContainerEventMap = ContainerEventMap> extends ContainerProps<E> {
    icon?: IconID;
    title: string;
    gadgets?: Component[];
    sens?: 'horizontal' | 'vertical';
}
export declare class Panel<T extends PanelProps = PanelProps, E extends ContainerEventMap = ContainerEventMap> extends VLayout<T, E> {
    private m_ui_title;
    private m_ui_body;
    constructor(props: T);
    /** @ignore */
    render(): void;
    setContent(els: ComponentContent): void;
    set title(text: string);
}
