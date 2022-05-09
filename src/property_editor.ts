/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|  
*  /__/ \__\   |_|
*        
* @file propertyeditor.ts
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

import { CEventMap, Component, CProps } from './component'
import { EvChange, EventCallback } from './x4_events'

import { InputProps, Input } from './input'
import { TextEdit } from './textedit'
import { CheckBox } from './checkbox'
import { Spreadsheet } from './spreadsheet'
import { DataView, Record } from './datastore'
import { _tr } from './i18n'


//@TODO: review all

export interface SaveCallback {
	(id: any, record: any[]) : void;
}

export type IPropertyField = {
	id: any;
	title: string;
	type: Function | "string" | 'number' | 'boolean' | 'choice' | 'password' | 'button' | 'color';
	value?: any;

	data?: any;	// associated data if needed
	editorProps?: InputProps;
	readOnly?: boolean;
	//values?: any[] | DataView;
}

interface PropertyEditorEventMap extends CEventMap {
	change: EvChange;
}

export interface PropertyEditorProps extends CProps<PropertyEditorEventMap> {
	fields: IPropertyField[];
	labelWidth?: number;
	record?: Record;
	change: EventCallback<EvChange>;
}


export class PropertyEditor extends Component<PropertyEditorProps, PropertyEditorEventMap> {

	m_fields: IPropertyField[];
	m_record: Record;
	m_sheet: Spreadsheet;
	m_label_w: number;

	constructor(props: PropertyEditorProps) {
		super(props);
		this.mapPropEvents( props, 'change' );
	}

	render(props: PropertyEditorProps) {

		this.m_record = props.record;
		this.m_fields = props.fields ?? [];
		this.m_label_w = props.labelWidth;

		this.m_sheet = new Spreadsheet({
			cls: '@fit',
			columns: [
				{ 
					title: _tr.global.property, 
					width: this.m_label_w > 0 ? this.m_label_w : -1, 
					cls: 'property' 
				},
				{ 
					title: _tr.global.value, 
					width: -1, 
					createEditor: ( ...a ) => this._editCell(...a), 
					renderer: (...a) => this._renderCell(...a) 
				},
			],
			autoedit: true,
			change: ( e ) => this._cellChange(e)
		});

		this._updateProperties();
		this.setContent( this.m_sheet );
	}

	setFields(fields: IPropertyField[]) {
		if (fields) {
			this.m_fields = fields;
			this._updateProperties();
		}
		else {
			this.m_sheet.clearData();
		}
	}

	setRecord(record: Record) {
		this.m_record = record;
		this._updateProperties();
	}

	private _updateProperties() {
		this.m_sheet.lockUpdate(true);
		this.m_sheet.clearData();

		this.m_fields.forEach((fld, lno) => {
			this.m_sheet.setCellText(lno, 0, fld.title);

			if (this.m_record) {
				this.m_sheet.setCellText(lno, 1, this.m_record.getField(fld.id));
			}
			else {
				this.m_sheet.setCellText(lno, 1, fld.value);
			}
		});

		this.m_sheet.lockUpdate(false);
	}


	private _cellChange(ev: EvChange) {

		let ctx: { row: number, col: number } = ev.context;
		let text: number = ev.value as number;

		if (ctx.col != 1) {
			return;
		}

		let fld = this.m_fields[ctx.row];

		switch (fld.type) {
			default:
			case 'string': {
				break;
			}

			case 'number': {
				break;
			}

			case 'password': {
				break;
			}

			case 'boolean': {
				break;
			}

			case 'choice': {
				/*
				let cprops = <ComboBoxProps>fprops;
				if( cprops!==fld.props ) {
					
					let choices;
					if( isArray(fld.values) ) {
						choices = this._choicesFromArray( fld.values );
					}
					else if( fld.values instanceof DataStore ) {
						choices = this._choicesFromStore( fld.values, 'name' );
					}
												
					cprops.items = choices;
				}

				editor = new ComboBox( cprops ); 
				*/
				break;
			}
		}

		if (this.m_record) {
			this.m_record.setField(fld.id, text);
		}
		else {
			fld.value = text;
		}

		this.emit( 'change', EvChange(text, fld) );
	}

	_renderCell(text, rec) {

		let fld = this.m_fields[rec.row];

		switch (fld.type) {
			default:
			case 'string': {
				break;
			}

			case 'number': {
				break;
			}

			case 'password': {
				text = '●●●●●●';
				break;
			}

			case 'boolean': {
				break;
			}

			case 'choice': {
				/*
				let cprops = <ComboBoxProps>fprops;
				if( cprops!==fld.props ) {
					
					let choices;
					if( isArray(fld.values) ) {
						choices = this._choicesFromArray( fld.values );
					}
					else if( fld.values instanceof DataStore ) {
						choices = this._choicesFromStore( fld.values, 'name' );
					}
												
					cprops.items = choices;
				}

				editor = new ComboBox( cprops ); 
				*/
				break;
			}
		}

		return text;
	}

	_editCell(props, row: number, col: number) {

		let fld = this.m_fields[row];

		let editor: Component;
		switch (fld.type) {
			default:
			case 'string': {
				editor = new TextEdit(props);
				break;
			}

			case 'number': {
				editor = new TextEdit(props);
				break;
			}

			case 'password': {
				props.type = 'password';
				props.value = this.m_record.getField(fld.id);
				editor = new Input(props);
				break;
			}

			case 'boolean': {
				editor = new CheckBox(props);
				break;
			}

			case 'choice': {
				/*let cprops = <ComboBoxProps>props;
				if( cprops!==fld.props ) {
					
					let choices;
					if( isArray(fld.values) ) {
						choices = this._choicesFromArray( fld.values );
					}
					else if( fld.values instanceof DataStore ) {
						choices = this._choicesFromStore( fld.values, 'name' );
					}
												
					cprops.items = choices;
				}

				editor = new ComboBox( cprops ); 
				*/
				break;
			}
		}

		return editor;
	}

	private _choicesFromArray(values): any[] {
		let choices = values.map((e) => {

			if (typeof (e) == 'object') {
				return { id: e.id, text: e.value };
			}
			else {
				return { id: e, text: '' + e };
			}
		});

		return choices;
	}

	private _choicesFromStore(view: DataView, field: string): any[] {

		let choices = [];

		for (let i = 0, n = view.count; i < n; i++) {
			let rec = view.getByIndex(i);
			choices.push({ id: rec.getID(), text: rec.getField(field) });
		}

		return choices;
	}


}


