"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeView = void 0;
const component_1 = require("./component");
const icon_1 = require("./icon");
const label_1 = require("./label");
const layout_1 = require("./layout");
const x4_events_1 = require("./x4_events");
function EvExpand(node) {
    return (0, x4_events_1.BasicEvent)({ node });
}
/**
 *
 */
class TreeView extends layout_1.VLayout {
    m_view;
    m_container;
    m_selection;
    constructor(props) {
        super(props);
        props.root = props.root;
        props.indent = props.indent ?? 8;
        props.gadgets = props.gadgets;
        props.sort = props.sort ?? false;
        this.m_selection = null;
        this.m_container = new component_1.Container({ cls: '@scroll-container' });
        this.m_view = new component_1.Container({
            cls: '@scroll-view',
            flex: 1,
            content: this.m_container
        });
        this.setContent([
            this.m_view,
            props.gadgets ? new layout_1.HLayout({
                cls: 'gadgets',
                content: props.gadgets
            }) : null,
        ]);
        this.setDomEvent('click', (e) => this._click(e));
        this.setDomEvent('dblclick', (e) => this._click(e));
        this.setDomEvent('contextmenu', (e) => this._handleCtxMenu(e));
        if (props.canDragItems) {
            this.setDomEvent('dragstart', (ev) => {
                let hit = component_1.Component.getElement(ev.target, component_1.Component);
                let node = hit?.getData("node");
                if (node) {
                    ev.dataTransfer.effectAllowed = 'move';
                    ev.dataTransfer.items.add(JSON.stringify({
                        type: 'treeview',
                        id: node.id
                    }), 'string');
                }
                else {
                    ev.preventDefault();
                    ev.stopPropagation();
                }
            });
            this.setDomEvent('dragover', ev => this._dragEnter(ev));
            this.setDomEvent('dragenter', ev => this._dragEnter(ev));
            this.setDomEvent('dragend', ev => this._dragLeave(ev));
            this.setDomEvent('dragleave', ev => this._dragLeave(ev));
            this.setDomEvent('drop', ev => this._dragLeave(ev));
            this.setDomEvent('drop', ev => this._drop(ev));
        }
        this.mapPropEvents(props, 'dblclick', 'drag', 'selectionchange', 'contextMenu');
    }
    _dragEnter(ev) {
        ev.preventDefault();
        let hit = component_1.Component.getElement(ev.target, component_1.Component);
        let node = hit?.getData("node");
        if (node) {
            hit.addClass('@drag-over');
            ev.dataTransfer.dropEffect = 'move';
        }
    }
    _dragLeave(ev) {
        let hit = component_1.Component.getElement(ev.target, component_1.Component);
        let node = hit?.getData("node");
        if (node) {
            hit.removeClass('@drag-over');
        }
    }
    _drop(ev) {
        let hit = component_1.Component.getElement(ev.target, component_1.Component);
        let node = hit?.getData("node");
        if (!node) {
            node = this.m_props.root;
        }
        if (node) {
            let parent;
            // is a folder
            if (node.children) {
                parent = node;
            }
            // in it's parent node
            else {
                parent = hit.getData("parent");
            }
            for (let i = 0; i < ev.dataTransfer.items.length; i++) {
                ev.dataTransfer.items[0].getAsString((value) => {
                    let data = JSON.parse(value);
                    this.emit('drag', (0, x4_events_1.EvDrag)(node, data, parent));
                });
            }
        }
    }
    render() {
        this.__update();
    }
    __update() {
        if (this.m_props.root) {
            let items = [];
            this._buildBranch(this.m_props.root, -1, items, this.m_props.root);
            this.m_container.setContent(items);
        }
    }
    updateElement(id) {
        const { node: child, item } = this._getNode(id);
        if (child) {
            const pn = child.dom.parentNode;
            const newchild = this._makeNode(item, child.dom.classList.value, child.getData('icon'), child.getData('level'));
            const dm = newchild._build();
            pn.replaceChild(dm, child.dom);
            if (this.m_selection?.el === child) {
                this.m_selection.el = newchild;
            }
        }
    }
    set root(root) {
        this.m_props.root = root;
        this.update();
    }
    /**
     * same as root = xxx but keep elements open
     */
    refreshRoot(root) {
        let openList = [];
        this.forEach((node) => {
            if (node.open) {
                openList.push(node.id);
            }
            return false;
        });
        let oldSel = this.selection;
        this.m_props.root = root;
        this.forEach((node) => {
            if (openList.indexOf(node.id) >= 0) {
                node.open = true;
            }
            return false;
        });
        this.__update();
    }
    _buildBranch(node, level, items, parent) {
        let cls = '@tree-item';
        if (node.cls) {
            cls += ' ' + node.cls;
        }
        if (!node.open && node.children) {
            cls += ' collapsed';
        }
        if (node.children) {
            cls += ' folder';
            if (node.children.length == 0) {
                cls += ' empty';
            }
        }
        let icon = node.icon;
        if (icon === undefined) {
            if (node.children) {
                icon = 'cls(far fa-chevron-down)';
            }
            else {
                icon = 'cls(far fa-file-archive)';
            }
        }
        if (level >= 0) {
            const item = this._makeNode(node, cls, icon, level);
            if (this.m_selection?.id == node.id) {
                this.m_selection.el = item;
                item.addClass('selected');
            }
            items.push(item);
        }
        if (level == -1 || node.open) {
            if (node.children) {
                if (this.m_props.sort) {
                    // sort items case insensitive:
                    //	first folders
                    //	then items 
                    node.children = node.children.sort((a, b) => {
                        let at = (a.children ? '0' + a.text : a.text)?.toLocaleLowerCase();
                        let bt = (b.children ? '0' + b.text : b.text)?.toLocaleLowerCase();
                        return at < bt ? -1 : at > bt ? 1 : 0;
                    });
                }
                node.children.forEach((c) => {
                    this._buildBranch(c, level + 1, items, node);
                });
            }
        }
    }
    _renderDef(node) {
        return new label_1.Label({ cls: 'tree-label', flex: 1, text: node.text });
    }
    _makeNode(node, cls, icon, level) {
        const item = new layout_1.HLayout({
            cls,
            content: [
                new icon_1.Icon({ cls: 'tree-icon', icon }),
                this.m_props.renderItem ? this.m_props.renderItem(node) : this._renderDef(node),
            ],
            data: {
                'node': node,
                'level': level,
                'icon': icon,
            },
            style: {
                paddingLeft: 4 + level * this.m_props.indent
            },
            attrs: {
                draggable: this.m_props.canDragItems ? true : undefined
            },
        });
        return item;
    }
    /**
     *
     */
    forEach(cb) {
        let found = null;
        function scan(node) {
            if (cb(node) == true) {
                return true;
            }
            if (node.children) {
                for (let i = 0; i < node.children.length; i++) {
                    if (scan(node.children[i])) {
                        return true;
                    }
                }
            }
        }
        if (this.m_props.root) {
            scan(this.m_props.root);
        }
        return found;
    }
    ensureVisible(id) {
        const { node } = this._getNode(id);
        if (node) {
            node.scrollIntoView();
        }
    }
    set selection(id) {
        if (this.m_selection?.el) {
            this.m_selection.el.removeClass('selected');
        }
        this.m_selection = null;
        if (id !== undefined) {
            const { node: sel } = this._getNode(id);
            if (sel) {
                this.m_selection = {
                    id: id,
                    el: sel
                };
                sel.addClass('selected');
                sel.scrollIntoView();
            }
        }
    }
    _getNode(id) {
        let found = { node: null, item: null };
        this.m_container.enumChilds((c) => {
            let node = c.getData('node');
            if (node?.id == id) {
                found = { node: c, item: node };
                return true;
            }
        });
        return found;
    }
    get selection() {
        return this.m_selection?.id;
    }
    getNodeWithId(id) {
        return this.forEach((node) => node.id == id);
    }
    /**
     *
     */
    _click(ev) {
        let dom = ev.target;
        let idom = dom;
        let onsub = false;
        // avoid getting click on sub childs
        if (dom.tabIndex !== -1) {
            onsub = true;
        }
        while (dom != this.dom) {
            let el = component_1.Component.getElement(dom);
            let nd = el?.getData('node');
            if (nd) {
                if (nd.children && !onsub) {
                    // on text or on expando ?
                    if (el.hasClass('selected') || idom.classList.contains('tree-icon')) { //expando
                        nd.open = nd.open ? false : true;
                    }
                    this.m_selection = { id: nd.id, el: null };
                    let offset = this.m_view?.dom?.scrollTop;
                    this.update();
                    if (offset) {
                        this.m_view.dom.scrollTo(0, offset);
                    }
                    this.emit('expand', EvExpand(nd));
                }
                else {
                    this.selection = nd.id;
                    if (!onsub) {
                        if (ev.type == 'click') {
                            this.emit('click', (0, x4_events_1.EvClick)(nd));
                        }
                        else {
                            this.emit('dblclick', (0, component_1.EvDblClick)(nd));
                        }
                    }
                }
                this.emit('selectionchange', (0, x4_events_1.EvSelectionChange)(nd));
                return;
            }
            dom = dom.parentElement;
        }
        if (ev.type == 'click') {
            this.m_selection = null;
            this.update();
            this.emit('selectionchange', (0, x4_events_1.EvSelectionChange)(null));
        }
    }
    _handleCtxMenu(ev) {
        ev.preventDefault();
        let dom = ev.target;
        let idom = dom;
        while (dom != this.dom) {
            let el = component_1.Component.getElement(dom);
            let nd = el?.getData('node');
            if (nd) {
                if (nd.children) {
                    // on text or on expando ?
                    if (idom.classList.contains('tree-icon')) { //expando
                        return;
                    }
                }
                this.m_selection = { id: nd.id, el: null };
                this.update();
                this.emit('contextMenu', (0, x4_events_1.EvContextMenu)(ev, nd));
                return;
            }
            dom = dom.parentElement;
        }
        this.m_selection = null;
        this.update();
        this.emit('contextMenu', (0, x4_events_1.EvContextMenu)(ev, null));
    }
    /**
     * constructs a tree node from an array of strings
     * elements are organized like folders (separator = /)
     * @example
     * let root = TreeView.buildFromString( [
     * 	'this/is/a/final/file'
     *  'this/is/another/file'
     * ] );
     */
    static buildFromStrings(paths, separator = '/') {
        let root = {
            id: 0,
            text: '<root>',
            children: []
        };
        function insert(elements, path) {
            let pos = path.indexOf(separator);
            let main = path.substr(0, pos < 0 ? undefined : pos);
            let elem;
            if (pos >= 0) {
                elem = elements.find((el) => {
                    return el.text == main;
                });
            }
            if (!elem) {
                elem = {
                    id: path,
                    text: main,
                };
                elements.push(elem);
            }
            if (pos >= 0) {
                if (!elem.children) {
                    elem.children = [];
                }
                insert(elem.children, path.substr(pos + separator.length));
            }
        }
        paths.forEach((path) => {
            insert(root.children, path);
        });
        return root;
    }
    /**
     * constructs a tree node from an array of nodes like
     * node {
     * 	id: number,
     *  parent: number,
     *  name: string
     * }
     */
    static buildFromHierarchy(nodes, cb) {
        let root = {
            id: 0,
            text: '<root>',
            children: []
        };
        let tree_nodes = [];
        function insert(node) {
            let elem;
            let pelem;
            if (node.parent > 0) {
                pelem = tree_nodes.find((tnode) => tnode.id == node.parent);
                if (!pelem) {
                    pelem = {
                        id: node.parent,
                        text: '',
                        children: []
                    };
                    tree_nodes.push(pelem);
                }
                if (!pelem.children) {
                    pelem.children = [];
                }
            }
            else {
                pelem = root;
            }
            elem = tree_nodes.find((tnode) => tnode.id == node.id);
            if (!elem) {
                elem = {
                    id: node.id,
                    text: node.name,
                    parent: node.parent,
                };
                if (!node.leaf) {
                    elem.children = [];
                }
                else {
                    elem.icon = null;
                }
            }
            else {
                elem.text = node.name;
                elem.parent = node.parent;
            }
            tree_nodes.push(elem);
            pelem.children.push(elem);
        }
        nodes.forEach(insert);
        if (cb) {
            tree_nodes.forEach(cb);
        }
        return root;
    }
}
exports.TreeView = TreeView;
