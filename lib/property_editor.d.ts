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
import { CEventMap, Component, CProps } from './component';
import { EvChange, EventCallback } from './x4_events';
import { InputProps } from './input';
import { Spreadsheet } from './spreadsheet';
import { Record } from './datastore';
export interface SaveCallback {
    (id: any, record: any[]): void;
}
export declare type IPropertyField = {
    id: any;
    title: string;
    type: Function | "string" | 'number' | 'boolean' | 'choice' | 'password' | 'button' | 'color';
    value?: any;
    data?: any;
    editorProps?: InputProps;
    readOnly?: boolean;
};
interface PropertyEditorEventMap extends CEventMap {
    change: EvChange;
}
export interface PropertyEditorProps extends CProps<PropertyEditorEventMap> {
    fields: IPropertyField[];
    labelWidth?: number;
    record?: Record;
    change: EventCallback<EvChange>;
}
export declare class PropertyEditor extends Component<PropertyEditorProps, PropertyEditorEventMap> {
    m_fields: IPropertyField[];
    m_record: Record;
    m_sheet: Spreadsheet;
    m_label_w: number;
    constructor(props: PropertyEditorProps);
    render(props: PropertyEditorProps): void;
    setFields(fields: IPropertyField[]): void;
    setRecord(record: Record): void;
    private _updateProperties;
    private _cellChange;
    _renderCell(text: any, rec: any): any;
    _editCell(props: any, row: number, col: number): Component<CProps<import("./base_component").BaseComponentEventMap>, import("./base_component").BaseComponentEventMap>;
    private _choicesFromArray;
    private _choicesFromStore;
}
export {};
