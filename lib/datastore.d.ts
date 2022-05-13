/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file datastore.ts
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
import { BasicEvent, EvChange, EventSource, EventMap } from './x4_events';
import { BaseComponent, BaseComponentEventMap, BaseComponentProps } from './base_component';
export declare type ChangeCallback = (type: string, id?: any) => void;
export declare type CalcCallback = () => string;
export declare type FieldType = 'string' | 'int' | 'float' | 'date' | 'bool' | 'array' | 'object' | 'any' | 'calc';
export declare type DataIndex = Uint32Array;
interface EvDataChange extends BasicEvent {
    type: string;
    id: any;
}
declare function EvDataChange(type: 'create' | 'update' | 'delete' | 'data' | 'change', id?: any): EvDataChange;
/**
 * fields definition
 * 	field with index=0 is record id
 */
export interface MetaData {
    type?: FieldType;
    prec?: number;
    required?: boolean;
    calc?: (rec: Record) => any;
    model?: Record;
}
export interface FieldInfo extends MetaData {
    name: string;
}
export declare namespace data {
    /**
     * define a record id
     * @example
     *	\@data_id()
     *  id: string; // this field is the record id
     **/
    export function id(): (ownerCls: any, fldName: any) => void;
    /**
     * @ignore
     */
    export function field(data: MetaData): (ownerCls: any, fldName: any) => void;
    /**
     * following member is a string field
     * @example
     * \@data_string()
     * my_field: string;	// this field will be seen as a string
     */
    export function string(props?: MetaData): (ownerCls: any, fldName: any) => void;
    /**
     * following member is an integer field
     * @example
     * \@data_string()
     * my_field: number;	// this field will be seen as an integer
     */
    export function int(props?: MetaData): (ownerCls: any, fldName: any) => void;
    /**
     * following member is a float field
     * @example
     * \@data_float()
     * my_field: number;	// this field will be seen as a float
     */
    export function float(props?: MetaData): (ownerCls: any, fldName: any) => void;
    /**
     * following member is a boolean field
     * @example
     * \@data_bool()
     * my_field: boolean;	// this field will be seen as a boolean
     */
    export function bool(props?: MetaData): (ownerCls: any, fldName: any) => void;
    /**
     * following member is a date field
     * @example
     * \@data_date()
     * my_field: date;	// this field will be seen as a date
     */
    export function date(props?: MetaData): (ownerCls: any, fldName: any) => void;
    /**
     * following member is a calculated field
     * @example
     * \@data_calc( )
     * get my_field(): string => {
     * 	return 'hello';
     * };
     */
    export function calc(props?: MetaData): (ownerCls: any, fldName: any) => void;
    /**
     *
     */
    interface RecordConstructor {
        new (data?: any, id?: any): Record;
    }
    /**
     * following member is a record array
     * @example
     * \@data_array( )
     * my_field(): TypedRecord[];
     */
    export function array(ctor: RecordConstructor, props?: MetaData): (ownerCls: any, fldName: any) => void;
    export {};
}
/**
 * record model
 */
export declare class Record {
    constructor(data?: any, id?: any);
    clone(source?: any): any;
    /**
     * get the record unique identifier
     * by default the return value is the first field
     * @return unique identifier
     */
    getID(): any;
    /**
     * MUST IMPLEMENT
     * @returns fields descriptors
     */
    getFields(): FieldInfo[];
    /**
     *
     */
    validate(): Error[];
    getFieldIndex(name: string): number;
    /**
     * default serializer
     * @returns an object with known record values
     */
    serialize(): any;
    /**
     * default unserializer
     * @param data - input data
     * @returns a new Record
     */
    unSerialize(data: any, id?: any): Record;
    /**
     * field conversion
     * @param field - field descriptor
     * @param input - value to convert
     * @returns the field value in it's original form
     */
    protected _convertField(field: FieldInfo, input: any): any;
    /**
     * get raw value of a field
     * @param name - field name or field index
     */
    getRaw(name: string | number): any;
    /**
     *
     * @param name
     * @param data
     */
    setRaw(name: string, data: string): void;
    /**
     * get field value (as string)
     * @param name - field name
     * @example
     * let value = record.get('field1');
     */
    getField(name: string): string;
    /**
     * set field value
     * @param name - field name
     * @param value - value to set
     * @example
     * record.set( 'field1', 7 );
     */
    setField(name: string, value: any): void;
}
/**
 * by default, the field id is rhe first member or the record
 */
export declare class AutoRecord extends Record {
    private m_data;
    private m_fid;
    constructor(data: any);
    getID(): any;
    getFields(): FieldInfo[];
    getRaw(name: string): string;
    setRaw(name: string, data: string): void;
    clone(data: any): AutoRecord;
}
/**
 *
 */
interface DataEventMap extends BaseComponentEventMap {
    change?: EvChange;
}
export interface DataProxyProps extends BaseComponentProps<DataEventMap> {
    type: 'local' | 'immediate' | 'ajax';
    path?: string;
    params?: any;
}
export declare class DataProxy extends BaseComponent<DataProxyProps, DataEventMap> {
    constructor(props: DataProxyProps);
    load(): void;
    save(data: any): void;
    private _refresh;
}
/**
 *
 */
interface DataStoreProps extends BaseComponentProps<DataStoreEventMap> {
    model: Record;
    data?: Record[];
    url?: string;
}
interface DataStoreEventMap extends EventMap {
    data_change: EvDataChange;
}
/**
 *
 */
export declare class DataStore extends EventSource<DataStoreEventMap> {
    protected m_model: Record;
    protected m_fields: FieldInfo[];
    protected m_records: Record[];
    protected m_proxy: DataProxy;
    protected m_rec_index: DataIndex;
    constructor(props: DataStoreProps);
    /**
     *
     * @param records
     */
    load(url: string): void;
    reload(): void;
    /**
     * convert raw objects to real records from model
     * @param records
     */
    setData(records: any[]): void;
    /**
     * just set the records
     * @param records - must be of the same type as model
     */
    setRawData(records: any[]): void;
    private _rebuildIndex;
    /**
     *
     */
    update(rec: Record): boolean;
    /**
     *
     * @param data
     */
    append(rec: Record | any): void;
    /**
     *
     */
    getMaxId(): any;
    /**
     *
     * @param id
     */
    delete(id: any): boolean;
    /**
     * return the number of records
     */
    get count(): number;
    /**
     * return the fields
     */
    get fields(): FieldInfo[];
    /**
     * find the index of the element with the given id
     */
    indexOfId(id: any): number;
    /**
     * return the record by it's id
     * @returns record or null
     */
    getById(id: any): Record;
    /**
     * return a record by it's index
     * @returns record or null
     */
    getByIndex(index: number): Record;
    private _getRecord;
    moveTo(other: DataStore): void;
    /**
     * create a new view on the DataStore
     * @param opts
     */
    createView(opts?: DataViewProps): DataView;
    /**
     *
     */
    createIndex(filter: FilterInfo): DataIndex;
    sortIndex(index: DataIndex, sort: SortProp[]): Uint32Array;
    /**
     *
     */
    forEach(cb: (rec: Record, index: number) => any): void;
    export(): Record[];
    changed(): void;
}
export interface EvViewChange extends BasicEvent {
    action: string;
}
export declare function EvViewChange(action: 'filter' | 'sort' | 'change'): EvViewChange;
interface DataViewEventMap extends BaseComponentEventMap {
    view_change: EvViewChange;
}
interface DataViewProps extends BaseComponentProps<DataViewEventMap> {
    store?: DataStore;
    filter?: FilterInfo;
    order?: string | SortProp[] | SortProp;
}
export declare type FilterFunc = (rec: Record) => boolean;
export interface FilterInfo {
    op: '<' | '<=' | '=' | '>=' | '>' | '<>' | 'empty-result' | FilterFunc;
    field?: string;
    value?: string | RegExp;
    caseSensitive?: boolean;
}
export interface SortProp {
    field: string;
    ascending: boolean;
}
/**
 * Dataview allow different views of the DataStore.
 * You can sort the columns & filter data
 * You can have multiple views for a single DataStore
 */
export declare class DataView extends BaseComponent<DataViewProps, DataViewEventMap> {
    protected m_index: DataIndex;
    protected m_store: DataStore;
    protected m_sort: SortProp[];
    protected m_filter: FilterInfo;
    constructor(props: DataViewProps);
    private _storeChange;
    /**
     *
     * @param filter
     */
    filter(filter?: FilterInfo): number;
    private _filter;
    /**
     *
     * @param columns
     * @param ascending
     */
    sort(props: SortProp[]): void;
    private _sort;
    /**
     *
     */
    get store(): DataStore;
    /**
     *
     */
    get count(): number;
    /**
     *
     * @param id
     */
    indexOfId(id: any): number;
    /**
     *
     * @param index
     */
    getByIndex(index: number): Record;
    /**
     *
     * @param id
     */
    getById(id: any): Record;
    changed(): void;
    /**
     *
     */
    forEach(cb: (rec: Record, index: number) => any): void;
}
export {};
