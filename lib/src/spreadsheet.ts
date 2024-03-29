/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|  
*  /__/ \__\   |_|
*        
* @file spreadsheet.ts
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

import { x4document } from './x4dom'

import { Component, SizerOverlay, EvDblClick, EvSize, ContainerEventMap, ContainerProps } from './component'
import { Input, InputProps } from './input';
import { HLayout, VLayout } from './layout';
import { TextEditProps, TextEdit } from './textedit';
import { FormatFunc } from './formatters'
import { asap, parseIntlFloat } from './tools';
import { deferCall } from './tools';
import { EvContextMenu, EvChange, EvSelectionChange, EventCallback } from './x4events'
import { ComboBox } from './combobox';


export interface EditorFactory {
	(props: InputProps, row: number, col: number) : Component;
}



/**
 * 
 */
export interface ColProp {
	title: string;
	width: number;
	formatter?: string;
	align?: string;
	cls?: string;
	min_width?: number;
	renderer?: FormatFunc;
	createEditor?: EditorFactory;		// null => disable edition
}

class CellData {
	text: string;
	cls?: string;

	static empty_cell: CellData = {
		text: ''
	}
}

/**
 * 
 */

export interface SpreadsheetEventSet extends ContainerEventMap {
	change?: EvChange;
	dblClick?: EvDblClick;
	selectionChange?: EvSelectionChange;
	contextMenu?: EvContextMenu;
}


/**
 * 
 */

export interface SpreadsheetProps extends ContainerProps {
	columns: ColProp[];
	maxrows?: number;
	autoedit?: boolean;

	change?: EventCallback<EvChange>;	// shortcut to event { change: ... }
	dblClick?: EventCallback<EvDblClick>;// shortcut to event { dblclick: ... }
	selectionChange?: EventCallback<EvSelectionChange>;// shortcut to event { selectionChange: ... }
	contextMenu?: EventCallback<EvContextMenu>;// shortcut to event { contextMenu: ... }
}


/**
 * 
 */

export class Spreadsheet extends VLayout<SpreadsheetProps, SpreadsheetEventSet> {

	private m_columns: ColProp[];
	private m_row_limit: number;
	private m_cells_data: Map<number, CellData>;
	private m_rows_data: Map<number, string>;

	protected m_view: Component;
	protected m_container: Component;
	protected m_header: Component;

	private m_itemHeight: number;
	private m_topIndex: number;

	private m_visible_cells: Map<number, Component>;
	private m_row_count: number;	// visible row count

	private m_selection: { row: number, col: number };
	private m_editor: Component;
	private m_autoedit: boolean;
	private m_lockupdate: number;
	private m_auto_row_count: boolean;

	private m_recycler: Component[];
	private m_used_cells: Component[];

	constructor(props: SpreadsheetProps) {
		super(props);

		this.m_columns = props.columns;
		this.m_autoedit = props.autoedit;
		this.m_lockupdate = 0;

		this.m_cells_data = new Map<number, CellData>();
		this.m_rows_data = new Map<number, string>();
		this.m_itemHeight = 0;
		this.m_selection = { row: 0, col: 0 };
		this.m_row_count = 0;
		this.m_auto_row_count = false;
		this.m_recycler = [];
		this.m_used_cells = [];

		if (props.maxrows === undefined) {
			this.m_row_limit = 0;
			this.m_auto_row_count = true;
		}
		else if (props.maxrows < 0) {
			this.m_row_limit = 0;
			this.m_auto_row_count = true;
		}
		else {
			this.m_row_limit = props.maxrows;
		}

		this.setAttribute('tabindex', 0);

		this.setDomEvent('click', (e) => this._itemClick(e) );
		this.setDomEvent('dblclick', (e) => this._itemDblClick(e) );
		this.setDomEvent('keydown', (e) => this._handleKey(e) );
		this.setDomEvent('keypress', (e) => this._keyPress(e) );
		this.setDomEvent('focus', () => this._focus(true));
		this.setDomEvent('focusout', () => this._focus(false));
		this.setDomEvent('contextmenu', (e) => this._ctxMenu(e));
		
		this.mapPropEvents( props, 'dblClick', 'selectionChange', 'contextMenu', 'change' );
	}

	componentCreated() {
		super.componentCreated( );
		this._updateScroll(true);
	}

	setColWidth(col: number, width: number) {
		this._on_col_resize(col, width);
		this.update(10);
	}

	getColWidth(col: number): number {
		if (!this.m_columns[col]) {
			return;
		}

		return this.m_columns[col].width;
	}

	setColTitle(col: number, title: string) {
		console.assert(this.m_columns[col] !== undefined); // what ?
		this.m_columns[col].title = title;
		this.update(10);
	}

	/**
	 * reset the spreadsheet
	 * @param columns 
	 */
	reset(columns?: ColProp[]) {
		if( columns ) {
			this.m_columns = columns;
		}
		
		this.m_cells_data = new Map<number, CellData>();
		this.m_rows_data = new Map<number, string>();
		this.update(10);
	}

	/**
	 * insert a row
	 * @param before row number before wich insert the new row 
	 */

	public insertRow(before: number) {

		let new_cells_data = new Map<number, CellData>();
		this.m_cells_data.forEach((celldata, key) => {

			let { row, col } = _getid(key);

			if (row >= before) {
				new_cells_data.set(_mkid(row + 1, col), celldata);
			}
			else {
				new_cells_data.set(key, celldata);
			}
		});

		let new_rows_data = new Map<number, string>();
		this.m_rows_data.forEach((rowdata, row) => {

			if (row >= before) {
				new_rows_data.set(row + 1, rowdata);
			}
			else {
				new_rows_data.set(row, rowdata);
			}
		});

		this.m_cells_data = new_cells_data;
		this.m_rows_data = new_rows_data;

		this._buildItems();
	}

	/**
	 * remove a row
	 * @param rowtodel row number to remove
	 */

	public deleteRow(rowtodel: number) {
		let new_cells_data = new Map<number, CellData>();
		let new_rows_data = new Map<number, string>();

		this.m_cells_data.forEach((celldata, key) => {

			let { row, col } = _getid(key);

			if (row > rowtodel) {
				new_cells_data.set(_mkid(row - 1, col), celldata);
			}
			else if (row < rowtodel) {
				new_cells_data.set(key, celldata);
			}
		});

		this.m_rows_data.forEach((rowdata, row) => {

			if (row > rowtodel) {
				new_rows_data.set(row - 1, rowdata);
			}
			else if (row < rowtodel) {
				new_rows_data.set(row, rowdata);
			}
		});

		this.m_cells_data = new_cells_data;
		this.m_rows_data = new_rows_data;

		this._buildItems();
	}

	/**
	 * insert a new column
	 * @param before column index before to insert the new column or <0 to append
	 */

	public insertCol(before: number, column: ColProp) {

		let inspos = before;
		if (inspos < 0) {
			inspos = this.m_columns.length + 1;
		}

		// insert the col at the right place
		this.m_columns.splice(inspos, 0, column);

		if (before >= 0) {
			let new_cells_data = new Map<number, CellData>();

			this.m_cells_data.forEach((celldata, key) => {

				let { row, col } = _getid(key);

				if (col >= before) {
					new_cells_data.set(_mkid(row, col + 1), celldata);
				}
				else {
					new_cells_data.set(key, celldata);
				}
			});

			this.m_cells_data = new_cells_data;
		}

		this.update();
	}

	/**
	 * remove a column
	 * @param coltodel 
	 */

	public deleteCol(coltodel: number) {

		// insert the col at the right place
		this.m_columns.splice(coltodel, 1);

		let new_cells_data = new Map<number, CellData>();
		this.m_cells_data.forEach((celldata, key) => {

			let { row, col } = _getid(key);

			if (col > coltodel) {
				new_cells_data.set(_mkid(row, col - 1), celldata);
			}
			else if (col < coltodel) {
				new_cells_data.set(key, celldata);
			}
		});

		this.m_cells_data = new_cells_data;
		this.update();
	}

	/**
	 * 
	 * @param row 
	 * @param col 
	 */

	private _getCellData(row: number, col: number, raw: boolean = false): CellData {
		let value = this.m_cells_data.get(_mkid(row, col));
		if (value === undefined) {
			return raw ? null : CellData.empty_cell;
		}

		return value;
	}

	private _focus(focus: boolean) {
		this.setClass('@focus', focus);
	}

	private _ctxMenu(e) {

		let dom = e.target,
			self = this.dom;

		while (dom && dom != self) {
			let itm = Component.getElement(dom),
				row = itm.getData('row-id'),
				col = itm.getData('col-id');

			if (row !== undefined) {
				this._selectItem(row, col);
				this.emit( 'contextMenu', EvContextMenu(e, { row, col, item: itm }));
				e.preventDefault();
				return;
			}

			dom = dom.parentElement;
		}
	}

	/** @ignore */

	render() {

		this.m_recycler = [];
		this.m_container = new Component({
			cls: 'content',
		});

		this.m_view = new Component({
			cls: '@scroll-view',
			flex: 1,
			dom_events: {
				sizechange: ( ) => this._updateScroll(true),
				scroll: ( ) => this._updateScroll(false)
			},
			content: this.m_container
		});

		let cols = this.m_columns.map((col, index) => {

			let comp = new Component({
				cls: '@cell c'+index,
				content: col.title ? col.title : '&nbsp',
				flex: col.width < 0 ? -col.width : undefined,
				attrs: {
					title: col.title
				},
				style: {
					width: col.width >= 0 ? col.width : undefined,
					minWidth: col.min_width
				},
			});

			new SizerOverlay({
				target: comp,
				sens: 'right',
				resize:  (ev: EvSize) => {
					this._on_col_resize(index, ev.size.width);
				}
			});

			(<any>col).$col = comp;
			return comp;
		});

		this.m_header = new HLayout({
			cls: '@header',
			content: <any>cols,
		});

		this.setContent([
			this.m_header,
			this.m_view
		]);
	}

	/**
	 * 
	 */

	private _on_col_resize(col, width) {

		if (!this.m_columns[col]) {
			return;
		}

		// -> flex
		if (width <= 0) {
			this.m_columns[col].width = -1;	// flex default
		}
		else {
			this.m_columns[col].width = width;
		}

		this._updateScroll(true);
	}

	/**
	 * compute misc dimensions
	 * - item height
	 * - scroll width
	 */

	private _computeItemHeight() {
		let g1 = x4document.createElement('div');
		g1.classList.add('x-spreadsheet');

		let g2 = x4document.createElement('div');
		g2.classList.add('content');

		let g3 = x4document.createElement('div');
		g3.classList.add('x-cell');
		g3.append( '&nbsp;' )

		g2.appendChild(g3);
		g1.appendChild(g2);

		this.dom.appendChild(g1);
		let rc = g3.getBoundingClientRect();
		this.dom.removeChild(g1);

		this.m_itemHeight = rc.height;
	}

	/**
	 * compute columns widths 
	 * use col.width for fixed size columns
	 * if col.width < 0 that mean that this is a proportion of the remaining space
	 */

	private _calcColWidths(width: number) {

		let fullw = 0;
		let nwide = 0;

		let calcw = new Int32Array(this.m_columns.length);
		let calcz = new Int32Array(this.m_columns.length);
		let calcm = new Int32Array(this.m_columns.length);

		this.m_columns.forEach((col, colIdx) => {

			let minw = Math.max(10, col.min_width ?? 0);

			if (col.width > 0) {
				let cw = Math.max(col.width, minw);
				fullw += cw;
				calcw[colIdx] = cw;
			}
			else {
				let z = -col.width;
				calcz[colIdx] = z;
				nwide += z;
			}

			calcm[colIdx] = minw;
		});

		if (nwide) {
			let restw = width - fullw;

			for (let i = 0; i < this.m_columns.length && nwide; i++) {

				if (!calcw[i]) {
					let rest = Math.round(restw / nwide) * calcz[i];
					if (rest < calcm[i]) {
						rest = calcm[i];
					}

					calcw[i] = rest;
					restw -= rest;
					nwide -= calcz[i];
				}
			}
		}

		return calcw;
	}

	/**
	 * create a cell (component)
	 * and append it to the parent view
	 * if a cell was reviously recyled, use it
	 */
	private _createCell(): Component {

		let cell;
		if (this.m_recycler.length) {
			cell = this.m_recycler.pop();
			cell.clearClasses();
			cell.addClass( '@comp' );	// todo: find better to reset to default
		}
		else {
			cell = new Component({
				cls: '@cell'
			});
		}

		if (!cell.dom) {
			this.m_container.appendChild(cell);
		}

		return cell;
	}

	/**
	 * build cells of the spreadsheet
	 * cells are recycled when scrolling,
	 * only visibles cells exists
	 */

	private _buildItems() {

		let rc = this.getBoundingRect();
		let rh = this.m_header.getBoundingRect();
		let height = rc.height - rh.height;

		if (this.m_itemHeight == 0) {
			this._computeItemHeight();
		}

		let top = this.m_topIndex * this.m_itemHeight;
		let y = 0;
		let cidx = 0;
		let rowIdx = this.m_topIndex;
		let count = this.m_row_limit;

		if (this.m_auto_row_count) {
			//@review should be evaluated only when row count change
			this.m_row_limit = count = this.getMaxRowCount();
		}

		let right_pos = 0;
		if ((count * this.m_itemHeight) > height) {
			let w = Component.getScrollbarSize();
			rc.width -= w;
			right_pos = w;
		}

		let even = this.m_topIndex & 1 ? true : false;
		this.m_visible_cells = new Map<number, Component>();

		// passe 0 - all created cells are moved to the recycler
		this.m_used_cells.forEach((c) => {
			this.m_recycler.push(c);
		});

		this.m_used_cells = [];

		// pass 1 - compute column widths
		let calcw = this._calcColWidths(rc.width);

		//
		let full_width = 0;
		for (let i = 0; i < calcw.length; i++) {
			full_width += calcw[i];
		}

		if (full_width <= rc.width) {

			this.m_view.setStyleValue('overflow-x', 'hidden');
			this.m_header.setStyleValue('width', rc.width);
			this.m_container.setStyleValue('width', rc.width);

			this.m_container.setStyle({
				height: count * this.m_itemHeight,
			});
		}
		else {
			this.m_header.setStyleValue('width', full_width);
			this.m_container.setStyleValue('width', full_width);
			this.m_view.setStyleValue('overflow-x', 'visible');

			this.m_container.setStyle({
				height: count * this.m_itemHeight,
				width: full_width
			});
		}

		this.m_view.addClass('@hidden');

		// pass 2 - build cells
		let limit = 100;
		while (y < height && rowIdx < count && --limit > 0) {

			let rowdata = this.m_rows_data.get(rowIdx);
			let x = 0;

			let cols = this.m_columns.map((col, colIdx) => {

				let cls = '@cell c'+colIdx ;
				if (col.align) {
					cls += ' ' + col.align;
				}

				if (col.cls) {
					cls += ' ' + col.cls;
				}

				let cell: Component;
				let celldata = this._getCellData(rowIdx, colIdx);

				let text: string = celldata.text;

				if (col.renderer && text.length) {
					text = col.renderer(text, { row: rowIdx, col: colIdx });
				}

				//if( text.length==0 ) {
				//	text = '&nbsp;'
				//}

				cls += (even ? ' even' : ' odd');
				if (rowdata) {
					cls += ' ' + rowdata;
				}

				cell = this._createCell();
				this.m_used_cells.push(cell);

				cell.setContent(text);	// always because cell reuse

				cell.addClass(cls);
				cell.setStyle({
					left: x,
					top: top + y,
					width: calcw[colIdx],
					height: this.m_itemHeight
				});

				if (this.m_selection.row == rowIdx && this.m_selection.col == colIdx) {
					cell.addClass('@selected');
				}

				cell.setData('row-id', rowIdx);
				cell.setData('col-id', colIdx);

				if (celldata.cls) {
					cell.addClass(celldata.cls);
				}

				this.m_visible_cells.set(_mkid(rowIdx, colIdx), cell);

				x += calcw[colIdx];
				return cell;
			});

			even = !even;

			y += this.m_itemHeight;

			rowIdx++;
			cidx++;

			//rows.splice( rows.length, 0, ...cols );
		}

		// if some cells are still in cache, hide them
		this.m_recycler.forEach((c) => {
			c.addClass('@hidden');
		})

		this.m_row_count = cidx;
		//this.m_container.setContent( <ComponentContent>rows);

		this.m_view.removeClass('@hidden');
		this.setClass('empty', count == 0);
	}

	/** @ignore */
	private _itemClick(e: MouseEvent) {
		let dom = e.target as HTMLElement;
		if (this.m_editor && this.m_editor.dom.contains(dom)) {
			return;
		}

		let itm = Component.getElement(dom, Component);

		if (!itm) {
			return;
		}

		let rowIdx = itm.getData('row-id'),
			colIdx = itm.getData('col-id');

		if (rowIdx === undefined || colIdx === undefined) {
			return;
		}

		this._selectItem(rowIdx, colIdx);
	}

	private _itemDblClick(e: MouseEvent) {
		let dom = e.target as HTMLElement;
		if (this.m_editor && this.m_editor.dom.contains(dom)) {
			return;
		}

		let itm = Component.getElement(dom),
			rowIdx = itm.getData('row-id'),
			colIdx = itm.getData('col-id');

		if (rowIdx === undefined || colIdx === undefined) {
			return;
		}

		this.emit( 'dblClick', EvDblClick({ row: rowIdx, col: colIdx }));
		this.editCell(rowIdx, colIdx);
	}

	/**
	 * 
	 * @param rowIdx 
	 * @param colIdx 
	 * @param scrollIntoView 
	 */

	protected _selectItem(rowIdx: number, colIdx: number, scrollIntoView?: boolean) {

		if (rowIdx < 0) {
			rowIdx = 0;
		}

		if (rowIdx > this.m_row_limit - 1) {
			rowIdx = this.m_row_limit - 1;
		}

		if (colIdx < 0) {
			colIdx = 0;
		}

		let lastcol = this.m_columns.length - 1;
		if (colIdx > lastcol) {
			colIdx = lastcol;
		}

		if (this.m_selection.row == rowIdx && this.m_selection.col == colIdx) {
			return;
		}

		this.select(rowIdx, colIdx, scrollIntoView);
	}

	private _scrollIntoView(row: number, col: number) {

		let doscroll = (itm: Component, mode: string = 'nearest') => {
			itm.scrollIntoView({
				block: <ScrollLogicalPosition>mode	//<ScrollLogicalPosition>sens ?? 'nearest'
			});
		}

		let last = this.m_topIndex + this.m_row_count - 1;

		if (row < this.m_topIndex) {
			this.m_topIndex = row;
			this.m_view.dom.scrollTop = this.m_topIndex * this.m_itemHeight;
			this._buildItems();
			doscroll(this._findItem(row, col), 'start');
		}
		else if (row > last) {
			this.m_topIndex = row - this.m_row_count + 1;
			this.m_view.dom.scrollTop = this.m_topIndex * this.m_itemHeight;
			this._buildItems();
			doscroll(this._findItem(row, col), 'end');
		}
		else {
			doscroll(this._findItem(row, col));
		}
	}

	/**
	 * 
	 * @param row 
	 * @param col 
	 */

	private _findItem(row, col): Component {
		if (!this.m_visible_cells) {
			return null;
		}

		return this.m_visible_cells.get(_mkid(row, col));
	}

	/**
	 * 
	 */

	private _updateScroll(forceUpdate) {
		if (!this?.m_view?.dom) {
			return;
		}

		let newTop = Math.floor(this.m_view.dom.scrollTop / (this.m_itemHeight || 1));

		if (newTop != this.m_topIndex || forceUpdate) {
			this.m_topIndex = newTop;
			this._buildItems();
		}

		let newLeft = this.m_view.dom.scrollLeft;
		this.m_header.setStyleValue('left', -newLeft);
	}

	/**
	 * 
	 * @param event 
	 * @param t 
	 */

	private _moveSel(sensy: number, sensx: number) {

		let sel = this.m_selection;

		let newRow = sel.row ?? 0;
		let newCol = sel.col ?? 0;

		if (sensy == 1) {
			newRow++;
		}
		else if (sensy == -1) {
			newRow--;
		}
		else if (sensy == 2) {
			newRow += this.m_row_count - 1;
		}
		else if (sensy == -2) {
			newRow -= this.m_row_count - 1;
		}
		else if (sensy == 3) {
			newRow = this.m_row_limit - 1;
		}
		else if (sensy == -3) {
			newRow = 0;
		}

		if (sensx == 1) {
			newCol++;
		}
		else if (sensx == -1) {
			newCol--;
		}
		else if (sensx == 2) {
			newCol = this.m_columns.length - 1;
		}
		else if (sensx == -2) {
			newCol = 0;
		}
		else if (sensx == 3) { // new editable cell skip line if needed
			newCol++;

			let lastcol = this.m_columns.length - 1;

			l1: for (let trys = 0; trys < 2; trys++) {
				while (newCol < lastcol) {
					if (this.m_columns[newCol].createEditor !== null) {
						break l1;
					}

					newCol++;
				}

				if (newCol > lastcol) {
					newRow++;
					newCol = 0;
				}
			}


		}
		else if (sensx == -3) {
			newCol--;

			let lastcol = this.m_columns.length - 1;

			l2: for (let trys = 0; trys < 2; trys++) {
				while (newCol >= 0) {
					if (this.m_columns[newCol].createEditor !== null) {
						break l2;
					}

					newCol--;
				}

				if (newCol < 0) {
					newRow--;
					newCol = lastcol;
				}
			}
		}

		this._selectItem(newRow, newCol, true);
	}

	private _handleKey(event: KeyboardEvent) {
		let dom = <Node>event.target;
		if (this.m_editor && this.m_editor.dom.contains(dom)) {
			return;
		}

		switch (event.key) {
			case 'ArrowDown':
			case 'Down': {
				this._moveSel(1, 0);
				break;
			}

			case 'ArrowUp':
			case 'Up': {
				this._moveSel(-1, 0);
				break;
			}

			case 'PageUp': {
				this._moveSel(-2, 0);
				break;
			}

			case 'PageDown': {
				this._moveSel(2, 0);
				break;
			}

			case 'ArrowLeft':
			case 'Left': {
				this._moveSel(0, -1);
				break;
			}

			case 'ArrowRight':
			case 'Right': {
				this._moveSel(0, 1);
				break;
			}

			case 'Home': {
				if (event.ctrlKey) {
					this._moveSel(-3, 0);
				}
				else {
					this._moveSel(0, -2);
				}
				break;
			}

			case 'End': {
				if (event.ctrlKey) {
					this._moveSel(3, 0);
				}
				else {
					this._moveSel(0, 2);
				}

				break;
			}

			case 'Enter': {
				this.editCurCell();
				event.stopPropagation( );
				event.preventDefault( );
				break;
			}

			case 'Delete': {
				this.clearCell(this.m_selection.row, this.m_selection.col);
				break;
			}

			default: {
				//console.log( "unknown key: ", event.key);
				break;
			}
		}
	}

	private _keyPress(event: KeyboardEvent) {
		let dom = <Node>event.target;
		if (this.m_editor && this.m_editor.dom.contains(dom)) {
			return;
		}

		if (event.ctrlKey || event.altKey) {
			return;
		}

		this.editCurCell(event.key);
	}

	/**
	 * return the selection
	 * { row, col }
	 */

	getSelection() {
		return this.m_selection;
	}

	select(row: number, col: number, scrollIntoView: boolean = true) {

		if (this.m_selection.row == row && this.m_selection.col == col) {
			return;
		}

		let oldSel = this._findItem(this.m_selection.row, this.m_selection.col);
		if (oldSel) {
			oldSel.removeClass('@selected');
		}

		this.m_selection = { row, col };

		if (scrollIntoView) {
			this._scrollIntoView(row, col);
		}

		let newSel = this._findItem(row, col);
		if (newSel) {
			newSel.addClass('@selected');
		}

		this.emit( 'selectionChange', EvSelectionChange({ row, col }));
	}

	/**
	 * return the row count
	 */

	rowCount() {
		return this.m_row_limit;
	}

	/**
	 * return the maximum row index filled with something
	 */

	getMaxRowCount() {

		let max_row = 0;

		this.m_cells_data.forEach((c, uid) => {
			let row = Math.round(uid / 1000) + 1;
			if (max_row < row) {
				max_row = row;
			}
		});

		return max_row;
	}

	getColCount() {
		return this.m_columns.length;
	}

	setRowStyle(row: number, cls: string) {
		this.m_rows_data.set(row, cls);

		if (this.m_lockupdate == 0) {
			this._buildItems();
		}
	}

	getRowStyle(row: number) {
		return this.m_rows_data.get(row);
	}

	setCellStyle(row: number, col: number, cls: string) {
		let cell = this._getCellData(row, col, true);
		if (!cell) {
			cell = { text: '' };
			this.m_cells_data.set(_mkid(row, col), cell);
		}

		cell.cls = cls;

		if (this.m_lockupdate == 0 && this.m_visible_cells) {
			let itm = this._findItem(row, col);
			if (itm) {
				itm.setClass(cls, true); //todo: pb when changing classes
			}
			else {
				this._buildItems();
			}
		}
	}

	getCellText(row: number, col: number): string {
		return this._getCellData(row, col).text;
	}

	getCellNumber(row: number, col: number): number {
		let text = this._getCellData(row, col).text;
		return parseIntlFloat(text);
	}

	clearRow(row: number) {
		for (let c = 0; c < this.m_columns.length; c++) {
			this.clearCell(row, c);
		}
		this.update(10);
	}

	clearCell(row: number, col: number) {
		this.setCellText(row, col, null);
	}

	editCurCell(forceText?: string) {
		this.editCell(this.m_selection.row, this.m_selection.col, forceText);
	}

	editCell(row: number, col: number, forcedText?: string) {

		if (!this.m_autoedit) {
			return;
		}

		// disable edition
		if (this.m_columns[col].createEditor === null) {
			return;
		}

		this._scrollIntoView(row, col);

		let item = this._findItem(row, col);
		let place = item.dom;
		let parent = place.parentElement;

		let rc = place.getBoundingClientRect();
		let prc = parent.getBoundingClientRect();

		let cell = this._getCellData(row, col, true);

		let edtBuilder = (props: TextEditProps, col, row): Component => {
			return new TextEdit(props);
		}

		if (this.m_columns[col].createEditor) {
			edtBuilder = this.m_columns[col].createEditor;
		}

		let cellvalue = forcedText ? forcedText : (cell ? cell.text : '');

		this.m_editor = edtBuilder({
			cls: '@editor',
			style: {
				left: rc.left - prc.left,
				top: rc.top - prc.top,
				width: rc.width - 1,
				height: rc.height - 1
			},
			tabIndex: false,
			value: cellvalue,
			data: {
				row,
				col
			},
		}, row, col);

		if( !this.m_editor ) {
			return;
		}

		parent.appendChild(this.m_editor._build());

		this._setupEditor( );
		
		this.m_editor.setData('old-value', cellvalue);
		this.m_editor.focus();

		if (this.m_editor instanceof TextEdit) {
			this.m_editor.selectAll();
		}
	}

	_setupEditor( ) {
		
		let movesel = (sensy, sensx) => {
			deferCall(() => {
				this.killEditor(true);
				this._moveSel(sensy, sensx);
				this.editCurCell();
			});
		}

		// todo: better
		if( this.m_editor instanceof TextEdit ) {
			let editor = this.m_editor as TextEdit;
			let input: Input = editor.input;

			input.setDomEvent( 'blur', () => {
				this.killEditor(true);
			} );

			input.setDomEvent( 'keydown', (e: KeyboardEvent) => {
				// prevented by edit...
				if( e.defaultPrevented ) {
					return;
				}

				switch (e.key) {
					case 'Escape': {
						this.killEditor(false);
						e.stopPropagation();
						e.preventDefault( );
						break;
					}

					case 'Enter':
					case 'Tab': {
						let sens = 3;
						if (e.shiftKey) {
							sens = -3;
						}

						movesel(0, sens);
						e.stopPropagation();
						e.preventDefault( );
						break;
					}

					case 'ArrowUp':
					case 'Up': {
						movesel(-1, 0);
						e.stopPropagation();
						e.preventDefault( );
						break;
					}

					case 'ArrowDown':
					case 'Down': {
						movesel(1, 0);
						e.stopPropagation();
						e.preventDefault( );
						break;
					}
				}
			});
		}
		else if( this.m_editor instanceof ComboBox ) {
			
			let input: Input = (this.m_editor as ComboBox).input;
			input.setDomEvent( 'blur', () => {
				this.killEditor(true);
			} );

			input.setDomEvent( 'keydown', (e: KeyboardEvent) => {
				
				switch (e.key) {
					case 'Escape': {
						this.killEditor(false);
						e.stopPropagation();
						e.preventDefault( );
						break;
					}

					case 'Enter':
					case 'Tab': {
						let sens = 3;
						if (e.shiftKey) {
							sens = -3;
						}

						movesel(0, sens);
						e.stopPropagation();
						e.preventDefault( );
						break;
					}
				}
			});

			this.m_editor.showPopup( );
			this.m_editor.on( 'change', ( ev ) => {
				this.killEditor(true);
			});

			this.m_editor.on( 'cancel', ( ev ) => {
				this.killEditor(false);
			});
		}
	}

	killEditor(save: boolean) {
		if (this.m_editor) {
			if (save) {
				
				let text, id;
				
				if( this.m_editor instanceof TextEdit ) {
					text = (this.m_editor as TextEdit).value;
				}
				else if( this.m_editor instanceof ComboBox ) {
					id = (this.m_editor as ComboBox).value;
					text = (this.m_editor as ComboBox).valueText;
				}

				let row = this.m_editor.getData('row');
				let col = this.m_editor.getData('col');
				let old = this.m_editor.getData('old-value');

				this.setCellText(row, col, text);
				const ev = EvChange(text, { row, col, oldValue: old, id });
				this.emit('change', ev );

				if( ev.defaultPrevented ) {
					this.setCellText(row, col, old);
				}
			}

			// cannot dipose while handling blur event, so we defer...
			let t = this.m_editor;
			asap( ( ) => {
				t.dispose();
			})
			
			this.m_editor = null;
			this.focus();
		}
	}

	clearData() {
		this.m_cells_data = new Map<number, CellData>();
		this.m_rows_data = new Map<number, string>();
	}

	setCellText(row: number, col: number, value: string) {

		if (value == null || value.length == 0) {
			this.m_cells_data.delete(_mkid(row, col));
			value = '';	//'&nbsp';
		}
		else {
			let cell: any = this._getCellData(row, col, true);
			if (!cell) {
				cell = {};
			}

			cell.text = value;
			this.m_cells_data.set(_mkid(row, col), cell);
		}

		if (this.m_lockupdate == 0 && this.m_visible_cells) {
			let itm = this._findItem(row, col);
			if (itm) {

				if (this.m_columns[col].renderer) {
					value = this.m_columns[col].renderer(value, { row, col });
				}

				itm.setContent(value);
			}
			else {
				this._buildItems();
			}
		}
	}

	lockUpdate(start: boolean) {
		if (start) {
			this.m_lockupdate++;
		}
		else {
			if (--this.m_lockupdate == 0) {
				this._updateScroll(true);
			}
		}
	}
}

/**
 * @ignore
 */

function _mkid(row: number, col: number): number {
	return row * 1000 + col;
}

/**
 * @ignore
 */

function _getid(key: number) {
	return {
		row: Math.floor(key / 1000) | 0,
		col: (key % 1000) | 0
	}
}