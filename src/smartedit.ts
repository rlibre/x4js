/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|  
*  /__/ \__\   |_|
*        
* @file smartedit.ts
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

import { InputProps } from './input'
import { TextEdit, TextEditProps } from './textedit'
import { DataStore, DataView, Record } from './datastore'
import { Popup, PopupProps, PopupEventMap } from './popup';
import { Component, CProps, EvFocus } from './component';
import { EvChange, EvClick } from './x4_events';

type Renderer = (rec: Record) => CellData[];

export interface ToolItem {
	text: string;
	callback: (target: TextEdit) => void;
}

export interface SmartEditProps extends TextEditProps {
	store: DataStore;
	field: string;
	minDisplay?: number;	// min char number before displaying items
	maxCount?: number;		// max count elements to display
	autoFill?: boolean;		// force selected element into edit (cannot select empty)
	renderer: Renderer;
	tools?: ToolItem[];		// elements to add at end
	searchCallback?: (value: string, view: DataView) => boolean
}

export class SmartEdit extends TextEdit<SmartEditProps> {

	m_popup: PopupTable;
	m_dataview: DataView;
	m_field: string;
	m_minDisplay: number;
	m_maxCount: number;
	m_autoFill: boolean;
	m_renderer: Renderer;
	m_tools: ToolItem[];
	m_searchCallback: (value: string, view: DataView) => boolean;

	constructor(props: SmartEditProps) {
		super(props);

		this.m_dataview = props.store.createView();
		this.m_field = props.field;
		this.m_renderer = props.renderer;
		this.m_minDisplay = props.minDisplay ?? 0;
		this.m_maxCount = props.maxCount ?? 10;
		this.m_autoFill = props.autoFill === undefined ? true : props.autoFill;
		this.m_popup = null;
		this.m_tools = props.tools ?? [];
		this.m_searchCallback = props.searchCallback;

		this.on('change', (e) => this._onChange(e));
		this.on('focus', (e) => this._onFocus(e));
	}

	render(props: SmartEditProps) {
		super.render(props);

		this.m_ui_input.setDomEvent('keydown', (e) => this._onKey(e));
	}

	private _onChange(ev: EvChange) {
		this._showPopup(ev.value as string);
	}

	private _onFocus(ev: EvFocus) {
		if (ev.focus) {
			this._showPopup(this.value);
		}
		else if (this.m_popup) {
			this.m_popup.close();
		}
	}

	private _onKey(e) {

		console.log(e.key);

		switch (e.key) {
			case 'Backspace': {

				// remove selection
				let start = e.target.selectionStart;
				let end = e.target.selectionEnd;

				if (start > end) {
					let t = start;
					start = end;
					end = t;
				}

				let v = this.value;
				let a = v.substr(0, start);
				let b = v.substr(end);

				this.value = a + b;
				break;
			}

			case 'ArrowUp':
			case 'Up': {
				if (this.m_popup) {
					this._moveNext(false);
					e.preventDefault();
				}

				break;
			}

			case 'ArrowDown':
			case 'Down': {
				if (this.m_popup) {
					this._moveNext(true);
					e.preventDefault();
				}

				break;
			}

			case 'Enter': {
				if (this.m_popup) {
					this._checkTool(e);
				}
				break;
			}
		}
	}

	private _showSugg(text) {
		let sel = this.getSelection();
		this.value = text;
		this.select(sel.start, sel.length);
	}

	isOpen() {
		return this.m_popup !== null;
	}


	componentDisposed() {
		if (this.m_popup) {
			this.m_popup.close();
		}

		super.componentDisposed();
	}

	// enter pressed on an element
	private _checkTool(e: KeyboardEvent) {

		let sel = this.m_popup.selection;
		if (this._callTool(sel)) {
			e.preventDefault();
		}
	}

	private _callTool(sel: number): boolean {
		let data = this.m_popup.getRowData(sel) as ToolItem;
		if (data) {
			if (this.m_popup) {
				this.m_popup.close();
			}

			data.callback(this);
			return true;
		}
		else {
			return false;
		}
	}

	private _moveNext(next: boolean) {
		let sel = this.m_popup.selNext(next);
		console.log('movenext: ', sel);

		let data = this.m_popup.getRowData(sel);

		if (!data) {
			let text = this.m_popup.getCell(sel, 0).text;
			this._showSugg(text);
		}
	}

	//_onKey( e: KeyboardEvent ) {
	//	if( e.key==' ' ) {
	//		this._showPopup( this.value )
	//	}
	//}

	private _showPopup(v: string) {

		if (this.m_popup) {
			this.m_popup.close();
			this.m_popup = null;
		}

		let cnt: number;

		let sel = this.getSelection();
		let search = sel.length ? v.substr(0, sel.start) : v;

		if (search.length < this.m_minDisplay) {
			return;
		}

		let autoFill = this.m_autoFill;

		if (search.length == 0) {
			cnt = this.m_dataview.filter(null);
		}
		else {
			if (this.m_searchCallback) {
				autoFill = this.m_searchCallback(search, this.m_dataview);
				cnt = this.m_dataview.count;
			}
			else {
				cnt = this.m_dataview.filter({
					op: '=',
					field: this.m_field,
					value: new RegExp('^' + search.trim() + '.*', 'mi')
				});
			}
		}

		if (cnt > 0) {
			let rec = this.m_dataview.getByIndex(0);

			if (autoFill) {
				this.value = rec.getField(this.m_field);
			}

			this.select(v.length);

			let count = Math.min(this.m_dataview.count, this.m_maxCount);
			let r2 = this.m_ui_input.getBoundingRect();

			this.m_popup = new PopupTable({
				cls: '@editor-popup',
				minWidth: r2.width
			});

			this.m_popup.on('click', (ev: EvClick) => {

				let { row, text } = ev.context;

				if (!this._callTool(row)) {
					this.value = text;
					this.emit('click', EvClick());
				}
			});

			let i;
			for (i = 0; i < count; i++) {

				let rec = this.m_dataview.getByIndex(i);
				let texts = this.m_renderer(rec);

				this.m_popup.setCell(i, 0, texts[0].text, texts[0].cls);
				this.m_popup.setCell(i, 1, texts[1].text, texts[1].cls);
			}

			for (let j = 0; j < this.m_tools.length; j++, i++) {
				this.m_popup.setCell(i, 0, this.m_tools[j].text);
				this.m_popup.setCell(i, 1, '');
				this.m_popup.setRowData(i, this.m_tools[j]);
				console.log('fill: ', i);
			}

			this.m_popup.displayAt(r2.left, r2.bottom);
		}
		else if (this.m_tools.length) {
			let r2 = this.m_ui_input.getBoundingRect();

			this.m_popup = new PopupTable({
				cls: '@editor-popup',
				minWidth: r2.width
			});

			this.m_popup.on('click', (ev: EvClick) => {

				let { row, text } = ev.context;
				if (!this._callTool(row)) {
					this.value = text;
				}
			});

			for (let j = 0, i = 0; j < this.m_tools.length; j++, i++) {
				this.m_popup.setCell(i, 0, this.m_tools[j].text);
				this.m_popup.setCell(i, 1, '');
				this.m_popup.setRowData(i, this.m_tools[j]);
				console.log('fill: ', i);
			}

			this.m_popup.displayAt(r2.left, r2.bottom);
		}
	}
}

interface CellData {
	text: string;
	cls?: string;
}

type CellMap = Map<number, CellData>;

interface PopupTableEventMap extends PopupEventMap {
	click: EvClick;
}

interface PopupTableProps extends PopupProps<PopupTableEventMap> {
	rows?: number;
	cols?: number;
	minWidth?: number;
}



export class PopupTable extends Popup<PopupTableProps, PopupTableEventMap> {

	private m_rows: number;
	private m_cols: number;
	private m_cells: CellMap;
	private m_data: Map<number, any>;
	private m_minw: number;
	private m_defcell: CellData;
	private m_sel: number;

	constructor(props: PopupTableProps) {
		super(props);

		this.m_rows = props.rows ?? 0;
		this.m_cols = props.cols ?? 0;
		this.m_minw = props.minWidth;
		this.m_cells = new Map<number, CellData>();
		this.m_data = new Map<number, any>();
		this.m_defcell = { text: '', cls: undefined };
		this.m_sel = 0;
		this.enableMask(false);

		this.setDomEvent('create', () => {
			(<HTMLTableElement>this.dom).cellPadding = '0px';
		});

		this.setDomEvent('mousedown', (e: MouseEvent) => {
			e.preventDefault();

			let el = Component.getElement(<HTMLElement>e.target);
			let row = el.getData('row');

			this.m_sel = row;
			this.update();

			this.emit('click', EvClick({ row, text: this.getCell(row, 0).text }));
		})
	}

	setRowData(row: number, data: any) {
		this.m_data.set(row, data);
	}

	getRowData(row: number): any {
		return this.m_data.get(row);
	}

	setCell(row: number, col: number, text: string, cls?: string) {
		this.m_cells.set(_cid(row, col), { text, cls });

		if (this.m_rows < (row + 1)) {
			this.m_rows = (row + 1);
		}

		if (this.m_cols < (col + 1)) {
			this.m_cols = (col + 1);
		}
	}

	getCell(row, col): CellData {

		let cd = this.m_cells.get(_cid(row, col));
		if (cd == null) {
			return this.m_defcell;
		}

		return cd;
	}

	/** @ignore */
	render() {
		this.setProp('tag', 'table');

		if (this.m_minw) {
			this.setStyleValue('minWidth', this.m_minw);
		}

		let rows = [];

		for (let r = 0; r < this.m_rows; r++) {

			let cols = [];
			let data = { row: r };

			for (let c = 0; c < this.m_cols; c++) {

				let cell = this.getCell(r, c);

				let col = new Component({
					tag: 'td',
					content: cell.text,
					cls: cell.cls,
					data
				});

				cols.push(col);
			}

			let cls = undefined;
			if (r === this.m_sel) {
				cls = '@selected';
			}

			let row = new Component({
				tag: 'tr',
				cls,
				content: cols,
				data
			});

			rows.push(row);
		}

		this.setContent(rows);
	}

	/**
	* display the popup at a specific position
	* @param x 
	* @param y 
	*/

	public displayAt(x: number, y: number, align: string = 'top left') {

		this.show();

		let halign = 'l',
			valign = 't';

		if (align.indexOf('right') >= 0) {
			halign = 'r';
		}

		if (align.indexOf('bottom') >= 0) {
			valign = 'b';
		}

		// @TODO: this is a minimal overflow problem solution
		let rc = document.body.getBoundingClientRect(),
			rm = this.getBoundingRect();

		if (halign == 'r') {
			x -= rm.width;
		}

		if (valign == 'b') {
			y -= rm.height;
		}

		if (x < 4) {
			x = 4;
		}

		if ((x + rm.width) > rc.right - 4) {
			x = rc.right - 4 - rm.width;
		}

		if (y < 4) {
			y = 4;
		}

		if ((y + rm.height) > rc.bottom - 4) {
			y = rc.bottom - 4 - rm.height;
		}

		this.setStyle({ left: x, top: y });
	}

	selNext(next: boolean): number {

		this.m_sel += next ? 1 : -1;
		if (this.m_sel >= this.m_rows) {
			this.m_sel = 0;
		}
		else if (this.m_sel < 0) {
			this.m_sel = this.m_rows - 1;
		}

		this.update();
		return this.m_sel;
	}

	get selection() {
		return this.m_sel;
	}
}


function _cid(row: number, col: number) {
	return row * 1000 + col;
}