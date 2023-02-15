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
import { HtmlString, Rect } from './tools';
import { Icon, IconID } from './icon';
import { Label } from './label';
import { HLayout, VLayout } from './layout';
import { EvClick, BasicEvent, EvDrag, EvSelectionChange, EvContextMenu } from './x4events';

export interface EvExpand extends BasicEvent {
	node: TreeNode;
}

function EvExpand(node: TreeNode) {
	return BasicEvent<EvExpand>({ node });
}

export interface HierarchicalNode {
	id: number;
	name: string;
	parent?: number;
	cls?: string;
	leaf?: boolean
	icon?: string;
	data?: any;
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
	root: TreeNode;			// root node
	indent?: number;		// items indentation
	gadgets?: Component[];
	sort?: boolean;	// sort items
	canDragItems?: boolean;
	renderItem?: ( itm: TreeNode ) => Component;

	dblclick?: EventHandler<EvDblClick>;
	selectionchange?: EventHandler<EvSelectionChange>;
	drag?: EventHandler<EvDrag>;
	contextMenu?: EventHandler<EvContextMenu>;	
}


/**
 * 
 */

export class TreeView extends VLayout<TreeViewProps, TreeViewEventMap> {

	m_view: Container;
	m_container: Container;
	m_selection: {
		id: any;
		el: Component
	};

	constructor(props: TreeViewProps) {
		super(props);

		props.root = props.root;
		props.indent = props.indent ?? 8;
		props.gadgets = props.gadgets;
		props.sort = props.sort ?? false;

		this.m_selection = null;

		this.m_container = new Container({ cls: '@scroll-container' });
		this.m_view = new Container({
			cls: '@scroll-view',
			flex: 1,
			content: this.m_container
		});

		this.setContent([
			this.m_view,
			props.gadgets ? new HLayout({
				cls: 'gadgets',
				content: props.gadgets
			}) : null,
		])

		this.setDomEvent( 'click', (e) => this._click(e) );
		this.setDomEvent( 'dblclick', (e) => this._click(e) );
		this.setDomEvent('contextmenu', (e) => this._handleCtxMenu(e));
		
		if (props.canDragItems) {
			this.setDomEvent('dragstart', (ev: DragEvent) => {
				let hit = Component.getElement(ev.target as HTMLElement, Component);
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

			this.setDomEvent('drop', ev => this._drop(ev) );
		}

		this.mapPropEvents(props, 'dblclick', 'drag', 'selectionchange', 'contextMenu' );
	}

	private _dragEnter(ev: DragEvent) {
		ev.preventDefault();

		let hit = Component.getElement(ev.target as HTMLElement, Component);
		let node = hit?.getData("node");

		if (node) {
			hit.addClass('@drag-over');
			ev.dataTransfer.dropEffect = 'move';
		}
	}

	private _dragLeave(ev: Event) {

		let hit = Component.getElement(ev.target as HTMLElement, Component);
		let node = hit?.getData("node");

		if (node) {
			hit.removeClass('@drag-over');
		}
	}

	private _drop(ev: DragEvent) {
		let hit = Component.getElement(ev.target as HTMLElement, Component);
		let node = hit?.getData("node");

		if (!node) {
			node = this.m_props.root;
		}

		if (node) {
			let parent: TreeNode;

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
					this.emit('drag', EvDrag( node, data, parent) );
				});
			}
		}
	}

	render() {
		this.__update( );
	}

	private __update( ) {
		if (this.m_props.root) {
			let items = [];
			this._buildBranch(this.m_props.root, -1, items, this.m_props.root);
			this.m_container.setContent(items);
		}
	}

	updateElement( id: any ) {
		const { node: child, item } = this._getNode( id );
		if( child ) {
			const pn = child.dom.parentNode;
			const newchild = this._makeNode( item, child.dom.classList.value, child.getData('icon'), child.getData('level') );
			const dm = newchild._build( );
			pn.replaceChild( dm, child.dom );

			if( this.m_selection?.el===child ) {
				this.m_selection.el = newchild;
			}
		}
	}

	set root(root: TreeNode) {
		this.m_props.root = root;
		this.update();
	}

	openAll( open = true) {
		this.forEach((node: TreeNode) => {
			if( node.children ) {
				node.open = open;
			}
		});

		this.__update( )
	}

	/**
	 * same as root = xxx but keep elements open
	 */

	refreshRoot(root: TreeNode) {

		let openList = [];

		this.forEach((node: TreeNode): boolean => {
			if (node.open) {
				openList.push(node.id);
			}
			return false;
		});

		let oldSel = this.selection;
		if( root ) {
			this.m_props.root = root;
		}

		this.forEach((node: TreeNode): boolean => {

			if (openList.indexOf(node.id) >= 0) {
				node.open = true;
			}

			return false;
		});

		this.__update( );
	}

	private _buildBranch(node: TreeNode, level: number, items: Component[], parent: TreeNode) {
		
		let cls = '@tree-item';

		if( node.cls ) {
			cls += ' '+node.cls;
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

		let icon: IconID = node.icon;
		if (icon === undefined ) {
			if (node.children) {
				if( node.open===true ) {
					icon = 'var(--x4-icon-chevron-down)';
				}
				else {
					icon = 'var(--x4-icon-chevron-right)';
				}
			}
		}

		if (level >= 0) {

			const item = this._makeNode( node, cls, icon, level );

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
					this._buildBranch(c, level + 1, items, node)
				});
			}
		}
	}

	private _renderDef( node: TreeNode ) {
		return new Label({ cls: 'tree-label', flex:1, text: node.text });
	}

	private _makeNode( node: TreeNode, cls: string, icon: IconID, level: number ): Component {
		
		const item = new HLayout({
			cls,
			content: [
				new Icon({ cls: 'tree-icon', icon }),
				this.m_props.renderItem ? this.m_props.renderItem( node ) : this._renderDef( node ),
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

	forEach(cb: (node: TreeNode) => boolean | void ) {
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

	ensureVisible( id: any ) {
		const { node } = this._getNode( id );
		if( node ) {
			node.scrollIntoView( );
		}
	}

	set selection(id: any) {
		this.select( id, false );
	}

	/**
	 * care, component should have been created, to select an item at startup,
	 * use something like 
	 * componentCreated( ) {
	 * 	mytree.select( id );
	 * }
	 */

	select( id: any, notify = true ) {
		
		if (this.m_selection?.el) {
			this.m_selection.el.removeClass('selected');
		}

		this.m_selection = null;

		if (id !== undefined) {
			const { node: sel } = this._getNode( id );
			if( sel ) {
				this.m_selection = {
					id: id,
					el: sel
				};

				sel.addClass('selected');
				sel.scrollIntoView(  );

				if( notify ) {
					let nd = sel.getData('node') as TreeNode;
					this.emit('selectionchange', EvSelectionChange(nd));
				}
			}
		}
		else {
			if( notify ) {
				this.emit('selectionchange', EvSelectionChange(null));
			}
		}
	}
	

	private _getNode( id ): {node:Component,item:TreeNode} {
		let found = { node: null, item: null };

		this.m_container.enumChilds((c) => {
			let node = c.getData('node');
			if (node?.id == id) {
				found = {node:c,item:node};
				return true;
			}
		});

		return found;
	}

	get selection() {
		return this.m_selection?.id;
	}

	getNodeWithId(id: any): TreeNode {
		return this.forEach((node) => node.id == id);
	}

	/**
	 * 
	 */

	private _click(ev: MouseEvent) {

		let dom = ev.target as HTMLElement;
		let idom = dom;
		let onsub = false;

		// avoid getting click on sub childs
		if( dom.tabIndex!==-1 ) {
			onsub = true;
		}

		while (dom != this.dom) {

			let el = Component.getElement(dom);
			let nd = el?.getData('node') as TreeNode;
			if (nd) {

				if (nd.children && !onsub ) {
					// on text or on expando ?
					if (el.hasClass('selected') || idom.classList.contains('tree-icon') ) {	//expando
						nd.open = nd.open ? false : true;
					}

					this.m_selection = { id: nd.id, el: null };

					let offset = this.m_view?.dom?.scrollTop;
					this.update( );
					if (offset) {
						this.m_view.dom.scrollTo(0, offset);
					}

					this.emit('expand', EvExpand(nd));
				}
				else {
					this.selection = nd.id;

					if( !onsub ) {
						if (ev.type == 'click') {
							this.emit('click', EvClick(nd));
						}
						else {
							this.emit('dblclick', EvDblClick(nd));
						}
					}
				}
				
				this.emit('selectionchange', EvSelectionChange(nd));
				return;
			}

			dom = dom.parentElement;
		}

		if (ev.type == 'click') {
			this.m_selection = null;
			this.update( );
			this.emit('selectionchange', EvSelectionChange(null) );	
		}
	}

	private _handleCtxMenu(ev: MouseEvent) {
		ev.preventDefault();
		
		let dom = ev.target as HTMLElement;
		let idom = dom;

		while (dom != this.dom) {

			let el = Component.getElement(dom);
			let nd = el?.getData('node') as TreeNode;
			if (nd) {
				if (nd.children) {
					// on text or on expando ?
					if ( idom.classList.contains('tree-icon') ) {	//expando
						return;
					}
				}

				this.selection = nd.id;
				
				this.emit('click', EvClick(nd) );
				this.emit('contextMenu', EvContextMenu(ev, nd));
				
				return;
			}

			dom = dom.parentElement;
		}

		this.selection = null;
		this.emit('contextMenu', EvContextMenu(ev, null));
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

	static buildFromStrings(paths: string[], separator = '/'): TreeNode {

		let root: TreeNode = {
			id: 0,
			text: '<root>',
			children: []
		};

		function insert(elements: TreeNode[], path: string) {

			let pos = path.indexOf(separator);
			let main = path.substr(0, pos < 0 ? undefined : pos);

			let elem: TreeNode;

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

	static buildFromHierarchy(nodes: HierarchicalNode[], cb?: (node: TreeNode) => void): TreeNode {

		let root: TreeNode = {
			id: 0,
			text: '<root>',
			children: []
		};

		let tree_nodes: TreeNode[] = [];

		function insert(node: HierarchicalNode) {

			let elem: TreeNode;
			let pelem: TreeNode;

			if (node.parent > 0) {
				pelem = tree_nodes.find((tnode: TreeNode) => tnode.id == node.parent);

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

			elem = tree_nodes.find((tnode: TreeNode) => tnode.id == node.id);
			if (!elem) {
				elem = {
					id: node.id,
					text: node.name,
					parent: node.parent,
					cls: node.cls,
					icon: node.icon,
					data: node.data,
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
			pelem.children.push(elem)
		}

		nodes.forEach(insert);
		if (cb) {
			tree_nodes.forEach(cb);
		}

		return root;
	}
}


