/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
 * @file layout.ts
 * @author Etienne Cochard
 * @license
 * Copyright (c) 2019-2021 R-libre ingenierie
 *
 *	This program is free software; you can redistribute it and/or modify
 *	it under the terms of the GNU General Public License as published by
 *	the Free Software Foundation; either version 3 of the License, or
 *	(at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU General Public License for more details.
 *
 *	You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>..
 */
import { Component, CProps, ComponentContent, Container, ContainerProps, ContainerEventMap } from './component';
export declare class AbsLayout<P extends ContainerProps = ContainerProps, E extends ContainerEventMap = ContainerEventMap> extends Container<P, E> {
}
export declare class HLayout<P extends ContainerProps = ContainerProps, E extends ContainerEventMap = ContainerEventMap> extends Container<P, E> {
}
export declare class VLayout<P extends ContainerProps = ContainerProps, E extends ContainerEventMap = ContainerEventMap> extends Container<P, E> {
}
interface AutoLayoutProps extends CProps {
    defaultLayout: 'horizontal' | 'vertical';
    switchSize: number;
}
export declare class AutoLayout extends Container<AutoLayoutProps> {
    constructor(props: AutoLayoutProps);
    componentCreated(): void;
    private _updateLayout;
}
export interface GridLayoutProps extends ContainerProps {
    colSizes?: string;
    rowSizes?: string;
    colGap?: number;
    template?: string[];
}
export declare class GridLayout<P extends GridLayoutProps = GridLayoutProps> extends Container<P> {
    constructor(props: GridLayoutProps);
    /** @ignore */
    render(): void;
}
export interface TableLayoutProps extends CProps {
    rows: number;
    columns: number;
}
export declare class TableLayout extends Container<TableLayoutProps> {
    private m_cells;
    constructor(props: TableLayoutProps);
    private _getCell;
    private _setCell;
    setCell(row: number, col: number, item: ComponentContent): void;
    merge(row: number, col: number, rowCount: number, colCount: number): void;
    setCellWidth(row: number, col: number, width?: number): void;
    setCellHeight(row: number, col: number, height?: number): void;
    setCellClass(row: number, col: number, cls: string): void;
    setColClass(col: any, cls: any): void;
    setRowClass(row: any, cls: any): void;
    getCell(row: any, col: any): ComponentContent;
    render(): void;
}
interface ScrollViewProps extends CProps {
}
export declare class ScrollView extends Component<ScrollViewProps> {
    constructor(props: ScrollViewProps);
    setContent(content: ComponentContent): void;
}
export {};
