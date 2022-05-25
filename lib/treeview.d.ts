/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file treeview.ts
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
import { Component, Container, ContainerEventMap, ContainerProps, EvDblClick, EventHandler } from './component';
import { HtmlString } from './tools';
import { IconID } from './icon';
import { VLayout } from './layout';
import { EvClick, BasicEvent, EvDrag, EvSelectionChange, EvContextMenu } from './x4events';
export interface EvExpand extends BasicEvent {
    node: TreeNode;
}
export interface HierarchicalNode {
    id: number;
    parent: number;
    name: string;
    leaf: boolean;
}
export interface TreeNode {
    id: any;
    text?: string | HtmlString;
    icon?: IconID;
    children?: TreeNode[];
    open?: boolean;
    data?: any;
    parent?: number;
    cls?: string;
}
interface TreeViewEventMap extends ContainerEventMap {
    click: EvClick;
    dblclick: EvDblClick;
    expand: EvExpand;
    drag: EvDrag;
    selectionchange: EvSelectionChange;
    contextMenu: EvContextMenu;
}
export interface TreeViewProps extends ContainerProps<TreeViewEventMap> {
    root: TreeNode;
    indent?: number;
    gadgets?: Component[];
    sort?: boolean;
    canDragItems?: boolean;
    renderItem?: (itm: TreeNode) => Component;
    dblclick?: EventHandler<EvDblClick>;
    selectionchange?: EventHandler<EvSelectionChange>;
    drag?: EventHandler<EvDrag>;
    contextMenu?: EventHandler<EvContextMenu>;
}
/**
 *
 */
export declare class TreeView extends VLayout<TreeViewProps, TreeViewEventMap> {
    m_view: Container;
    m_container: Container;
    m_selection: {
        id: any;
        el: Component;
    };
    constructor(props: TreeViewProps);
    private _dragEnter;
    private _dragLeave;
    private _drop;
    render(): void;
    private __update;
    updateElement(id: any): void;
    set root(root: TreeNode);
    /**
     * same as root = xxx but keep elements open
     */
    refreshRoot(root: TreeNode): void;
    private _buildBranch;
    private _renderDef;
    private _makeNode;
    /**
     *
     */
    forEach(cb: (node: any) => boolean): any;
    ensureVisible(id: any): void;
    set selection(id: any);
    private _getNode;
    get selection(): any;
    getNodeWithId(id: any): TreeNode;
    /**
     *
     */
    private _click;
    private _handleCtxMenu;
    /**
     * constructs a tree node from an array of strings
     * elements are organized like folders (separator = /)
     * @example
     * let root = TreeView.buildFromString( [
     * 	'this/is/a/final/file'
     *  'this/is/another/file'
     * ] );
     */
    static buildFromStrings(paths: string[], separator?: string): TreeNode;
    /**
     * constructs a tree node from an array of nodes like
     * node {
     * 	id: number,
     *  parent: number,
     *  name: string
     * }
     */
    static buildFromHierarchy(nodes: HierarchicalNode[], cb?: (node: TreeNode) => void): TreeNode;
}
export {};
