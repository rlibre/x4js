/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file propertyeditor.ts
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
import { CEventMap, Component, CProps } from './component';
import { EvChange, EventCallback } from './x4events';
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
