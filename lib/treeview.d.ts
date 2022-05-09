/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file treeview.ts
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
import { Component, Container, ContainerEventMap, ContainerProps, EvDblClick, EventHandler } from './component';
import { HtmlString } from './tools';
import { IconID } from './icon';
import { VLayout } from './layout';
import { EvClick, BasicEvent, EvDrag, EvSelectionChange, EvContextMenu } from './x4_events';
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
