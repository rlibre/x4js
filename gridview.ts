/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file gridview.ts
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

const T_UPDATE = Symbol('update');

/**
 * todo: sizable column
 * todo: button in a column
 */


import { HLayout, VLayout } from './layout'
import { Component, ContainerEventMap, EvSize, EvDblClick, CProps, flyWrap, html, HtmlString, SizerOverlay } from './component'
import { Label } from './label'
import { _tr } from './i18n'
import * as Formatters from './formatters'
import { downloadData } from './tools'
import { DataView, DataStore, Record } from './datastore'

import { EvContextMenu, EvSelectionChange, BasicEvent, EventDisposer } from "./x4_events";

export interface EvGridCheck extends BasicEvent {
	rec: Record;
	chk: boolean;
}

export function EvGridCheck(rec: Record, chk: boolean) {
	return BasicEvent<EvGridCheck>( { rec, chk } );
}





/**
 * 
 */

export interface GridColumn {
	id: any;
	title: string;
	width: number;
	flex?: number;
	align?: 'left' | 'center' | 'right';
	renderer?: CellRenderer;
	formatter?: Formatters.FormatFunc;
	cls?: string;
	sortable?: boolean;
}

export type CellRenderer = (rec: Record) => Component;
export type RowClassifier = (rec: Record, Row: Component) => void;
export type ContextMenuGridItem = (event: MouseEvent, item: Record, grid: GridView) => any;

type emptyFn = () => string;

interface GridViewEventMap extends ContainerEventMap {
	dblClick?: EvDblClick;
	selectionChange?: EvSelectionChange;
	contextMenu?: EvContextMenu;
	gridCheck?: EvGridCheck;
}

export interface GridViewProps extends CProps<GridViewEventMap> {
	store: DataStore | DataView;
	columns: GridColumn[];
	calcRowClass?: RowClassifier;
	empty_text?: string | emptyFn;	// set or return '' to avoid message
	hasMarks?: boolean;	// if true add a checkbox on left side cf. clearMarks, getMarksIds
	hasFooter?: boolean;
}


/**
 * gridview class
 */

export class GridView extends VLayout<GridViewProps, GridViewEventMap> {

	protected m_dataview: DataView;
	protected m_data_cx: EventDisposer;

	protected m_columns: GridColumn[];

	protected m_view_el: Component;
	protected m_container: Component;
	protected m_header: Component;

	protected m_footer: Component;
	
	protected m_empty_msg: Label;
	protected m_empty_text: string | emptyFn;

	protected m_selection: any;
	private m_itemHeight: number;
	private m_topIndex: number;
	protected m_visible_rows: Component[];		// shown elements

	protected m_hasMarks: boolean;
	protected m_marks: Set<any>;	// checked elements

	private m_recycler: Component[];

	private m_rowClassifier: RowClassifier;

	constructor(props: GridViewProps) {
		super(props);

		this.m_columns = props.columns;
		this.m_hasMarks = props.hasMarks ?? false;
		this.m_marks = new Set<any>();

		// prepend the checkable column
		if (this.m_hasMarks) {
			this.m_columns.unshift({
				id: 'id',
				title: '',
				width: 30,
				renderer: (e) => this._renderCheck( e )
			});
		}

		this.setAttribute('tabindex', 0);

		this.m_topIndex = 0;
		this.m_itemHeight = 0;
		this.m_recycler = [];
		this.m_rowClassifier = props.calcRowClass;

		this.m_empty_text = props.empty_text ?? _tr.global.empty_list;

		//this.setDomEvent('create', this._handleCreate, this);
		this.setDomEvent('click', (e)=>this._itemClick(e));
		this.setDomEvent('dblclick', (e)=>this._itemDblClick(e));
		this.setDomEvent('contextmenu', (e)=>this._itemMenu(e));
		this.setDomEvent('keydown', (e)=>this._handleKey(e));

		this.setStore(props.store);
	}

	componentCreated() {
		this._updateScroll(true);
	}

	/**
	 * 
	 */

	private _moveSel(sens: number, select = true) {

		let sel = this.m_selection;
		let scrolltype = null;

		if (sel === undefined) {
			sel = this.m_dataview.getByIndex(0).getID();
		}
		else {

			let index = this.m_dataview.indexOfId(this.m_selection);

			if (sens == 1) {
				index++;
			}
			else if (sens == -1) {
				index--;
			}
			else if (sens == 2) {
				index += this.m_visible_rows.length - 1;
			}
			else if (sens == -2) {
				index -= this.m_visible_rows.length - 1;
			}

			if (sens < 0) {
				scrolltype = 'start';
			}
			else {
				scrolltype = 'end';
			}

			if (index < 0) {
				index = 0;
			}
			else if (index >= this.m_dataview.count) {
				index = this.m_dataview.count - 1;
			}

			sel = this.m_dataview.getByIndex(index).getID();
		}

		if (this.m_selection != sel && select) {
			this._selectItem(sel, null, scrolltype);
		}

		return sel;
	}

	/**
	 * 
	 */

	private _handleKey(event: KeyboardEvent) {
		//debugger;

		if (!this.m_dataview || this.m_dataview.count == 0) {
			return;
		}

		switch (event.key) {
			case 'ArrowDown':
			case 'Down': {
				this._moveSel(1);
				break;
			}

			case 'ArrowUp':
			case 'Up': {
				this._moveSel(-1);
				break;
			}

			case 'PageUp': {
				this._moveSel(-2);
				break;
			}

			case 'PageDown': {
				this._moveSel(2);
				break;
			}
		}
	}

	/**
	 * 
	 */

	getNextSel(sens: number) {
		return this._moveSel(sens, false);
	}

	private _scrollIntoView(id: any, sens?: string) {

		let itm = this._findItem(id);
		if (itm) {
			itm.scrollIntoView({
				block: 'center'	//<ScrollLogicalPosition>sens ?? 'nearest'
			});
		}
		else {
			this.m_topIndex = this.m_dataview.indexOfId(id);
			this.m_view_el.dom.scrollTop = this.m_topIndex * this.m_itemHeight;
			this._buildItems();

			this._scrollIntoView(id);
		}

	}

	/**
	 * change the list of item displayed
	 * @param items - new array of items
	 */

	public setStore(store: DataStore | DataView) {

		this.m_selection = undefined;

		if (store instanceof DataStore) {
			this.m_dataview = store.createView();
		}
		else {
			this.m_dataview = store;
		}

		if( this.m_hasMarks ) {
			this.clearMarks( );
		}

		// unlink previous observer
		if (this.m_data_cx) {
			this.m_data_cx.dispose( );
		}

		if (this.m_dataview) {

			this.m_data_cx = this.m_dataview.on( 'view_change', ( ev ) => {
				if (ev.action == 'change') {
					this.m_selection = undefined;
				}

				this._updateScroll(true);
			});

			//this.update( );
			this._updateScroll(true);
		}
	}

	public getView(): DataView {
		return this.m_dataview;
	}

	/**
	 * return the current selection (row id) or null 
	 */

	public getSelection(): any {
		return this.m_selection;
	}

	public getSelRec(): Record {
		if (this.m_selection) {
			return this.m_dataview.getById(this.m_selection);
		}

		return null;
	}

	public setSelection(recId: any) {
		this._selectItem(recId, null, 'center');
	}

	/** @ignore */
	render() {

		this.m_recycler = [];
		this.m_container = new Component({
			cls: 'content',
		});

		this.m_empty_msg = new Label({
			cls: 'empty-msg',
			text: ''
		});

		this.m_view_el = new Component({
			cls: '@scroll-view',
			flex: 1,
			dom_events: {
				sizechange: ( ) => this._updateScroll(true),
				scroll: ( ) => this._updateScroll(false)
			},
			content: this.m_container
		});

		let cols = this.m_columns.map((col, index) => {

			let cls = '@cell';
			if (col.cls) {
				cls += ' ' + col.cls;
			}

			let comp = new Component({
				cls,
				content: new Component({
					tag: 'span',
					content: col.title
				}),
				flex: col.flex,
				sizable: 'right',
				style: {
					width: col.width
				},
				dom_events: {
					click: (ev: MouseEvent) => {
						let t = flyWrap(<HTMLElement>ev.target);
						if (!t.hasClass('@sizer-overlay')) { // avoid sizer click
							this._sortCol(col);
							ev.preventDefault();
						}
					}
				}
			});

			const resizeCol = ( ev: EvSize ) => {
				this._on_col_resize(index, ev.size.width);

				if( this.m_footer ) {
					let col = Component.getElement( this.m_footer.dom.childNodes[index] as HTMLElement );
					if( col ) {
						col.setStyleValue( 'width', ev.size.width ); 
					}
				}
			}

			new SizerOverlay({
				target: comp,
				sens: 'right',
				events: {resize: ( e ) => resizeCol(e )}
			});

			(<any>col).$col = comp;
			return comp;
		});

		// compute full width
		let full_width = 0;
		this.m_columns.forEach((col) => {
			full_width += col.width ?? 0;
		});

		this.m_header = new HLayout({
			cls: '@header',
			content: <any>cols,
			style: {
				minWidth: full_width
			}
		});
	

		if( this.m_props.hasFooter ) {
			let foots = this.m_columns.map((col, index) => {

				let cls = '@cell';

				if (col.align) {
					cls += ' ' + col.align;
				}
				
				if (col.cls) {
					cls += ' ' + col.cls;
				}

				let comp = new Component({
					cls,
					data: { col: index },
					flex: col.flex,
					style: {
						width: col.width
					}
				});

				return comp;
			});

			this.m_footer = new HLayout({
				cls: '@footer',
				content: <any>foots,
				style: {
					minWidth: full_width
				}
			});
		}
		else {
			this.m_footer = null;
		}

		this.setContent([
			this.m_header,
			this.m_view_el,
			this.m_footer,
			this.m_empty_msg,
		]);

	}

	private _on_col_resize(col, width) {
		this.m_columns[col].width = width;
		this.m_columns[col].flex = undefined;
		this._updateScroll(true);
	}

	/**
	 * 
	 */

	private _sortCol(col: GridColumn ) {

		if (col.sortable === false) {
			return;
		}

		this.m_columns.forEach((c) => {
			if (c !== col) {
				(<any>c).$sorted = false;
				(<any>c).$col.removeClass('sort desc');
			}
		});

		const $col = col as any;

		if ($col.$sorted) {
			$col.$sens = $col.$sens ? 0 : 1;
			$col.$col.setClass('desc', $col.$sens);
		}
		else {
			$col.$sens = 0;
			$col.$sorted = true;
			$col.$col.addClass('sort');
			$col.$col.removeClass('desc');
		}

		if (this.m_dataview) {
			this.m_dataview.sort([
				{ field: col.id, ascending: $col.$sens ? false : true }
			]);
		}
	}

	/**
	 * 
	 */

	private _computeItemHeight() {
		let gr = document.createElement('div');
		gr.classList.add('x-row');

		let gv = document.createElement('div');
		gv.classList.add('x-grid-view');
		gv.style.position = 'absolute';
		gv.style.top = '-1000px';
		gv.appendChild(gr);

		this.dom.appendChild(gv);
		let rc = gr.getBoundingClientRect();
		this.dom.removeChild(gv);

		this.m_itemHeight = rc.height;
	}

	private _createRow( props: CProps ): Component {

		let row: Component;
		if (this.m_recycler.length) {
			row = this.m_recycler.pop();
			row.clearClasses();
			row.addClass( props.cls );
			row.setContent( props.content );
			row.setStyle( props.style );

			for( let n in props.data ) {
				row.setData( n, props.data[n] );
			}
		}
		else {
			row = new HLayout( props );
		}

		if (!row.dom) {
			this.m_container.appendChild(row);
		}

		return row;
	}

	private _buildItems( canOpt = true ) {
		let rc = this.getBoundingRect();
		let rh = this.m_header.getBoundingRect();
		let height = rc.height - rh.height + this.m_itemHeight;

		if (this.m_itemHeight == 0) {
			this._computeItemHeight();
		}

		let top = this.m_topIndex * this.m_itemHeight;
		let y = 0;
		let cidx = 0;
		let index = this.m_topIndex;
		let count = this.m_dataview ? this.m_dataview.count : 0;
		let full_width = 0;
		let even = this.m_topIndex & 1 ? true : false;

		// compute full width
		this.m_columns.forEach((col) => {
			full_width += col.width ?? 0;
		});

		// if items height make scroll visible, update header width
		if (((count + 1) * this.m_itemHeight) >= height) {
			let w = Component.getScrollbarSize();
			this.m_header.setStyleValue("paddingRight", w);
			this.m_footer?.setStyleValue("paddingRight", w);
		}
		else {
			this.m_header.setStyleValue("paddingRight", 0);
			this.m_footer?.setStyleValue("paddingRight", 0);
		}

		// passe 0 - all created cells are moved to the recycler
		if( this.m_visible_rows ) {
			this.m_visible_rows.forEach((c) => {
				this.m_recycler.push(c);
			});
		}

		this.m_visible_rows = [];
		let limit = 100;
		while (y < height && index < count && --limit > 0) {

			let rec = this.m_dataview.getByIndex(index);
			let rowid = rec.getID();

			let crow = canOpt ? this.m_recycler.findIndex( ( r ) => r.getData('row-id')==rowid ) : -1;
			if( crow>=0 ) {
				let rrow = this.m_recycler.splice( crow, 1 )[ 0 ];
				rrow.setStyle( {
					top: y + top,
					minWidth: full_width,
				} );

				if (this.m_hasMarks) {
					rrow.setClass( '@marked', this.m_marks.has(rowid) );
				}

				rrow.removeClass( '@hidden' );
				rrow.setClass( '@selected', this.m_selection === rowid );

				this.m_visible_rows[cidx] = rrow;
			}
			else {
				let cols = this.m_columns.map( col => {

					let cls = '@cell';
					if (col.align) {
						cls += ' ' + col.align;
					}

					if (col.cls) {
						cls += ' ' + col.cls;
					}

					let cell: Component;
					if (col.renderer) {
						cell = col.renderer(rec);
						if (cell) {
							cell.addClass(cls);
							cell.setStyleValue('width', col.width);
							if (col.flex !== undefined) {
								cell.addClass('@flex');
								cell.setStyleValue('flex', col.flex);
							}
						}
					}
					else {

						let fmt = col.formatter;
						let text;

						if (fmt && fmt instanceof Function) {
							text = fmt(rec.getRaw(col.id), rec);
						}
						else {
							text = rec.getField(col.id);
						}

						cell = new Component({
							cls,
							width: col.width,
							content: html`<span>${text}</span>`,
							flex: col.flex
						})
					}

					return cell;
				});

				let cls = '@row @hlayout center';
				if (this.m_hasMarks) {
					if (this.m_marks.has(rowid)) {
						cls += ' @marked';
					}
				}

				if (this.m_selection === rowid) {
					cls += ' @selected';
				}

				let row = this.m_visible_rows[cidx] = this._createRow( {
					cls,
					content: <any>cols,
					style: {
						top: y + top,
						minWidth: full_width,
					},
					data: {
						'row-id': rowid,
						'row-idx': index
					}
				});

				row.addClass(even ? 'even' : 'odd');
				even = !even;

				if (this.m_rowClassifier) {
					this.m_rowClassifier(rec, row);
				}
			}

			y += this.m_itemHeight;

			index++;
			cidx++;
		}

		// if some cells are still in cache, hide them
		this.m_recycler.forEach((c) => {
			c.addClass('@hidden');
		})

		//this.m_container.setContent(<ComponentContent>this.m_visible_rows);

		let show = !count;
		let msg = (this.m_empty_text instanceof Function) ? this.m_empty_text() : this.m_empty_text;
		this.m_empty_msg.text = msg;

		if (show && msg.length == 0) {
			show = false;
		}

		this.m_empty_msg.show(show);

		if (full_width < rc.width) {
			this.m_header.setStyleValue('width', null);
			this.m_footer?.setStyleValue('width', null);
			this.m_container.setStyle({
				height: count * this.m_itemHeight,
				width: null
			});
		}
		else {
			this.m_header.setStyleValue('width', full_width);
			this.m_footer?.setStyleValue('width', full_width);

			this.m_container.setStyle({
				height: count * this.m_itemHeight,
				width: full_width
			});
		}
	}

	/**
	 * 
	 */

	private _updateScroll(forceUpdate) {
		if (!this.m_view_el || !this.m_view_el.dom) {
			return;
		}

		const update = () => {
			let newTop = Math.floor(this.m_view_el.dom.scrollTop / (this.m_itemHeight || 1));

			if (newTop != this.m_topIndex || forceUpdate) {
				this.m_topIndex = newTop;
				this._buildItems( !forceUpdate );
			}

			let newLeft = this.m_view_el.dom.scrollLeft;
			this.m_header.setStyleValue('left', -newLeft);
			this.m_footer?.setStyleValue('left', -newLeft);
		}

		if (forceUpdate) {
			this.singleShot( update, 10 );
		}
		else {
			update();
		}
	}

	/** @ignore */

	private _rowFromTarget(dom) {
		let self = this.dom;

		while (dom && dom != self) {
			let itm = Component.getElement(dom);

			if (itm) {
				let id = itm.getData('row-id');
				if (id !== undefined) {
					return { id, itm };
				}
			}

			dom = dom.parentElement;
		}

		return undefined;
	}

	private _itemClick(e: MouseEvent) {
		let hit = this._rowFromTarget(e.target);
		if (hit) {
			this._selectItem(hit.id, hit.itm);
		}
		else {
			this._selectItem(undefined, undefined);
		}
	}

	private _itemDblClick(e: MouseEvent) {
		let hit = this._rowFromTarget(e.target);
		if (hit) {
			this._selectItem(hit.id, hit.itm);

			let rec = this.m_dataview.getById(hit.id);
			this.emit( 'dblClick', EvDblClick(rec) );

			if (this.m_hasMarks) {
				this._toggleMark(rec);
			}
		}

	}

	/** @ignore */
	private _itemMenu(e: MouseEvent) {

		let dom = e.target as HTMLElement,
			self = this.dom;

		while (dom && dom != self) {
			let itm = Component.getElement(dom),
				id = itm?.getData('row-id');

			if (id !== undefined) {
				this._selectItem(id, itm);

				let idx = itm.getData('row-idx');
				let rec = this.m_dataview.getByIndex(idx);

				this._showItemContextMenu(e, rec);
				e.preventDefault();
				return;
			}

			dom = dom.parentElement;
		}
	}

	/**
	 * 
	 */

	private _findItem(id): Component {

		for (let i = 0; i < this.m_visible_rows.length; i++) {
			let itm = this.m_visible_rows[i];
			if (itm.getData('row-id') === id) {
				return itm;
			}
		}

		return null;
	}

	/**
	 * @ignore
	 * called when an item is selected by mouse
	 */

	protected _selectItem(item: any, dom_item: Component, scrollIntoView?: string) {

		if (this.m_selection !== undefined) {
			let old = this._findItem(this.m_selection);
			if (old) {
				old.removeClass('@selected');
			}
		}

		this.m_selection = item;

		if (item) {
			if (scrollIntoView) {
				this._scrollIntoView(item, scrollIntoView);
			}

			if (!dom_item) {
				dom_item = this._findItem(item);
			}

			if (dom_item) {
				dom_item.addClass('@selected');
			}

			let rec = this.m_dataview.getById(item);
			this.emit( 'selectionChange', EvSelectionChange(rec));
		}
		else {
			this.emit( 'selectionChange', EvSelectionChange(null));
		}
	}

	/**
	 * 
	 */

	protected _showItemContextMenu(event: MouseEvent, item: Record) {
		this.emit( 'contextMenu', EvContextMenu(event,item));
	}

	/**
	 * 
	 */

	public clearSelection() {
		this._selectItem(null, null);
	}

	/**
	 * todo: moveto datastore
	 */

	public exportData(filename) {

		let data = '';
		const fsep = '\t';
		const lsep = '\r\n';

		let rec = '';
		this.m_columns.map((col) => {

			if (rec.length) {
				rec += fsep;
			}

			rec += col.title;
		});

		data += rec + lsep;

		let count = this.m_dataview.count;

		for (let i = 0; i < count; i++) {

			let record = this.m_dataview.getByIndex(i);

			rec = '';
			let cols = this.m_columns.map((col) => {

				let text = record.getField(col.id);
				let fmt = col.formatter;

				if (fmt && fmt instanceof Function) {
					text = fmt(text, record);
				}

				if (rec.length > 0) {
					rec += fsep;
				}

				rec += text;
			});

			data += rec + lsep;
		}

		//todo: review that
		data = data.replace(/[àâä]/gm, 'a');
		data = data.replace(/[éèê]/gm, 'e');
		data = data.replace(/[îï]/gm, 'i');
		data = data.replace(/[ûüù]/gm, 'u');
		data = data.replace(/ /gm, ' '); 	// non breaking space

		downloadData(data, 'text/csv', filename);
	}

	set empty_text(text: string | HtmlString) {
		this.m_empty_msg.text = text;
	}

	private _renderCheck(rec: Record) {
		let cls = '';
		if (this.m_marks.has(rec.getID())) {
			cls = ' checked';
		}

		return new Component({ cls: '@grid-checkbox' + cls });
	}

	private _toggleMark(rec: Record) {

		let id = rec.getID();
		let chk = false;

		if (this.m_marks.has(id)) {
			this.m_marks.delete(id);
		}
		else {
			this.m_marks.add(id);
			chk = true;
		}

		this.emit( 'gridCheck', EvGridCheck(rec, chk));
		this._buildItems( false );
	}

	public getMarks(): any[] {
		let ids = [];
		for (const v of this.m_marks.values()) {
			ids.push(v);
		}

		return ids;
	}

	public clearMarks() {
		if (this.m_marks.size) {
			this.m_marks = new Set<any>();
			this._buildItems( false );
		}
	}

	public setFooterData( rec: any ) {
		if( !this.m_footer ) {
			return;
		}

		this.m_footer.enumChilds( (c) => {
			let cid = c.getData( 'col' );
			let col = this.m_columns[cid];

			let fmt = col.formatter;
			
			let text;
			if (fmt && fmt instanceof Function) {
				text = fmt(rec[col.id], rec);
			}
			else {
				text = rec[col.id];
			}

			c.setContent( text, false );
		});
	}
}

