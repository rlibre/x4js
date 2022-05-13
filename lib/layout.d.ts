/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file layout.ts
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
