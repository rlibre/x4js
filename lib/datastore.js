"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataView = exports.EvViewChange = exports.DataStore = exports.DataProxy = exports.AutoRecord = exports.Record = exports.data = void 0;
const request_1 = require("./request");
const tools_1 = require("./tools");
const x4events_1 = require("./x4events");
const base_component_1 = require("./base_component");
function EvDataChange(type, id) {
    return (0, x4events_1.BasicEvent)({ type, id });
}
/**
 *
 */
class MetaInfos {
    name;
    id; // field name holding 'id' record info
    fields; // field list
    constructor(name) {
        this.name = name;
        this.id = undefined;
        this.fields = [];
    }
}
const metaFields = Symbol('metaField');
function _getMetas(obj, create = true) {
    let ctor = obj.constructor;
    let mfld = ctor.hasOwnProperty(metaFields) ? ctor[metaFields] : undefined;
    if (mfld === undefined) {
        if (!create) {
            console.assert(mfld !== undefined);
        }
        // construct our metas
        mfld = new MetaInfos(ctor.name);
        // merge with parent class metas
        let pctor = Object.getPrototypeOf(ctor);
        if (pctor != Record) {
            let pmetas = pctor[metaFields];
            mfld.fields = [...pmetas.fields, ...mfld.fields];
            console.assert(mfld.id === undefined, 'cannot define mutiple record id');
            if (!mfld.id) {
                mfld.id = pmetas.id;
            }
        }
        obj.constructor[metaFields] = mfld;
    }
    return mfld;
}
var data;
(function (data_1) {
    /**
     * define a record id
     * @example
     *	\@data_id()
     *  id: string; // this field is the record id
     **/
    function id() {
        return (ownerCls, fldName) => {
            let metas = _getMetas(ownerCls);
            metas.fields.push({
                name: fldName,
                type: 'any',
                required: true,
            });
            metas.id = fldName;
        };
    }
    data_1.id = id;
    /**
     * @ignore
     */
    function field(data) {
        return (ownerCls, fldName) => {
            let metas = _getMetas(ownerCls);
            metas.fields.push({
                name: fldName,
                ...data
            });
        };
    }
    data_1.field = field;
    /**
     * following member is a string field
     * @example
     * \@data_string()
     * my_field: string;	// this field will be seen as a string
     */
    function string(props) {
        return field({ ...props, type: 'string' });
    }
    data_1.string = string;
    /**
     * following member is an integer field
     * @example
     * \@data_string()
     * my_field: number;	// this field will be seen as an integer
     */
    function int(props) {
        return field({ ...props, type: 'int' });
    }
    data_1.int = int;
    /**
     * following member is a float field
     * @example
     * \@data_float()
     * my_field: number;	// this field will be seen as a float
     */
    function float(props) {
        return field({ ...props, type: 'float' });
    }
    data_1.float = float;
    /**
     * following member is a boolean field
     * @example
     * \@data_bool()
     * my_field: boolean;	// this field will be seen as a boolean
     */
    function bool(props) {
        return field({ ...props, type: 'bool' });
    }
    data_1.bool = bool;
    /**
     * following member is a date field
     * @example
     * \@data_date()
     * my_field: date;	// this field will be seen as a date
     */
    function date(props) {
        return field({ ...props, type: 'date' });
    }
    data_1.date = date;
    /**
     * following member is a calculated field
     * @example
     * \@data_calc( )
     * get my_field(): string => {
     * 	return 'hello';
     * };
     */
    function calc(props) {
        return field({ ...props, type: 'calc' });
    }
    data_1.calc = calc;
    /**
     * following member is a record array
     * @example
     * \@data_array( )
     * my_field(): TypedRecord[];
     */
    function array(ctor, props) {
        return data.field({ ...props, type: 'array', model: new ctor() });
    }
    data_1.array = array;
})(data = exports.data || (exports.data = {}));
/**
 * record model
 */
class Record {
    constructor(data, id) {
        if (data !== undefined) {
            this.unSerialize(data, id);
        }
    }
    clone(source) {
        let rec = new this.constructor();
        if (source) {
            rec.unSerialize(source);
        }
        return rec;
    }
    /**
     * get the record unique identifier
     * by default the return value is the first field
     * @return unique identifier
     */
    getID() {
        let metas = _getMetas(this, false);
        return this[metas.id];
    }
    /**
     * MUST IMPLEMENT
     * @returns fields descriptors
     */
    getFields() {
        let metas = _getMetas(this, false);
        return metas.fields;
    }
    /**
     *
     */
    validate() {
        let errs = null;
        let fields = this.getFields();
        fields.forEach((fi) => {
            if (fi.required && !this.getField(fi.name)) {
                if (errs) {
                    errs = [];
                }
                errs.push(new Error(`field ${fi.name} is required.`));
            }
        });
        return errs;
    }
    //mapAnyFields() {
    //	this.getFields = ( ) => {
    //		return Object.keys( this ).map( (name) => {
    //			return <FieldInfo>{ name };
    //		});			
    //	}
    //}
    getFieldIndex(name) {
        let fields = this.getFields();
        return fields.findIndex((fd) => fd.name == name);
    }
    /**
     * default serializer
     * @returns an object with known record values
     */
    serialize() {
        let rec = {};
        this.getFields().forEach((f) => {
            if (f.calc === undefined) {
                rec[f.name] = rec[f.name];
            }
        });
        return rec;
    }
    /**
     * default unserializer
     * @param data - input data
     * @returns a new Record
     */
    unSerialize(data, id) {
        let fields = this.getFields();
        fields.forEach((sf) => {
            let value = data[sf.name];
            if (value !== undefined) {
                this[sf.name] = this._convertField(sf, value);
            }
        });
        if (id !== undefined) {
            this[fields[0].name] = id;
        }
        else {
            console.assert(this.getID() !== undefined); // store do not have ID field
        }
        return this;
    }
    /**
     * field conversion
     * @param field - field descriptor
     * @param input - value to convert
     * @returns the field value in it's original form
     */
    _convertField(field, input) {
        //TODO: boolean
        switch (field.type) {
            case 'float': {
                let ffv = typeof (input) === 'number' ? input : parseFloat(input);
                if (field.prec !== undefined) {
                    let mul = Math.pow(10, field.prec);
                    ffv = Math.round(ffv * mul) / mul;
                }
                return ffv;
            }
            case 'int': {
                return typeof (input) === 'number' ? input : parseInt(input);
            }
            case 'date': {
                return (0, tools_1.isString)(input) ? new Date(input) : input;
            }
            case 'array': {
                let result = [];
                if (field.model) {
                    input.forEach((v) => {
                        result.push(field.model.clone(v));
                    });
                    return result;
                }
                break;
            }
        }
        return input;
    }
    /**
     * get raw value of a field
     * @param name - field name or field index
     */
    getRaw(name) {
        let idx;
        let fields = this.getFields();
        if (typeof (name) === 'string') {
            idx = fields.findIndex(fi => fi.name == name);
            if (idx < 0) {
                console.assert(false, 'unknown field: ' + name);
                return undefined;
            }
        }
        else if (name >= 0 && name < fields.length) {
            idx = name;
        }
        else {
            console.assert(false, 'bad field name: ' + name);
            return undefined;
        }
        let fld = fields[idx];
        if (fld.calc !== undefined) {
            return fld.calc(this);
        }
        return this[fld.name];
    }
    /**
     *
     * @param name
     * @param data
     */
    setRaw(name, data) {
        this[name] = data;
    }
    /**
     * get field value (as string)
     * @param name - field name
     * @example
     * let value = record.get('field1');
     */
    getField(name) {
        let v = this.getRaw(name);
        return (v === undefined || v === null) ? '' : '' + v;
    }
    /**
     * set field value
     * @param name - field name
     * @param value - value to set
     * @example
     * record.set( 'field1', 7 );
     */
    setField(name, value) {
        let fields = this.getFields();
        let idx = fields.findIndex(fi => fi.name == name);
        if (idx < 0) {
            console.assert(false, 'unknown field: ' + name);
            return;
        }
        let fld = fields[idx];
        if (fld.calc !== undefined) {
            console.assert(false, 'cannot set calc field: ' + name);
            return;
        }
        this.setRaw(fld.name, value);
    }
}
exports.Record = Record;
/**
 * by default, the field id is rhe first member or the record
 */
class AutoRecord extends Record {
    m_data;
    m_fid;
    constructor(data) {
        super();
        this.m_data = data;
    }
    getID() {
        if (!this.m_fid) {
            let fnames = Object.keys(this.m_data);
            this.m_fid = fnames[0];
        }
        return this.m_data[this.m_fid];
    }
    getFields() {
        let fnames = Object.keys(this.m_data);
        let fields = fnames.map((n) => {
            return {
                name: n
            };
        });
        return fields;
    }
    getRaw(name) {
        return this.m_data[name];
    }
    setRaw(name, data) {
        this.m_data[name] = data;
    }
    clone(data) {
        return new AutoRecord({ ...data });
    }
}
exports.AutoRecord = AutoRecord;
class DataProxy extends base_component_1.BaseComponent {
    constructor(props) {
        super(props);
    }
    load() {
        this._refresh();
    }
    save(data) {
        if (this.m_props.type == 'local') {
            console.assert(false); // not imp
            /*
            const fs = require('fs');
            fs.writeFileSync( this.m_path, data );
            */
        }
    }
    _refresh(delay = 0) {
        if (this.m_props.type == 'local') {
            console.assert(false); // not imp
            /*
            const fs = require('fs');
            fs.readFile( this.m_path, ( _, bdata ) => {;
                let data = JSON.parse(bdata);
                this.emit( 'dataready', data );
            } );
            */
        }
        else {
            setTimeout(() => {
                (0, request_1.ajaxRequest)({
                    url: this.m_props.path,
                    method: 'GET',
                    params: this.m_props.params,
                    success: (data) => {
                        this.emit('change', (0, x4events_1.EvChange)(data));
                    }
                });
            }, delay);
        }
    }
}
exports.DataProxy = DataProxy;
/**
 *
 */
class DataStore extends x4events_1.EventSource {
    m_model;
    m_fields;
    m_records;
    m_proxy;
    m_rec_index;
    constructor(props) {
        super();
        this.m_fields = undefined;
        this.m_records = [];
        this.m_rec_index = null;
        this.m_model = props.model;
        this.m_fields = props.model.getFields();
        if (props.data) {
            this.setRawData(props.data);
        }
        else if (props.url) {
            this.load(props.url);
        }
    }
    /**
     *
     * @param records
     */
    load(url) {
        //todo: that
        if (url.substr(0, 7) === 'file://') {
            this.m_proxy = new DataProxy({
                type: 'local',
                path: url.substr(7),
                events: { change: (ev) => { this.setData(ev.value); } }
            });
            this.m_proxy.load();
        }
        else {
            this.m_proxy = new DataProxy({
                type: 'ajax',
                path: url,
                events: { change: (ev) => { this.setData(ev.value); } }
            });
            this.m_proxy.load();
        }
    }
    reload() {
        this.m_proxy.load();
    }
    /**
     * convert raw objects to real records from model
     * @param records
     */
    setData(records) {
        let realRecords = [];
        records.forEach((rec) => {
            realRecords.push(this.m_model.clone(rec));
        });
        this.setRawData(realRecords);
    }
    /**
     * just set the records
     * @param records - must be of the same type as model
     */
    setRawData(records) {
        this.m_records = records;
        this._rebuildIndex();
        this.emit('data_change', EvDataChange('change'));
    }
    _rebuildIndex() {
        this.m_rec_index = null; // null to signal that we have to run on records instead of index
        this.m_rec_index = this.createIndex(null); // prepare index (remove deleted)
        this.m_rec_index = this.sortIndex(this.m_rec_index, null); // sort by id
    }
    /**
     *
     */
    update(rec) {
        let id = rec.getID();
        let index = this.indexOfId(id);
        if (index < 0) {
            return false;
        }
        this.m_records[this.m_rec_index[index]] = rec;
        this.emit('data_change', EvDataChange('update', id));
        return true;
    }
    /**
     *
     * @param data
     */
    append(rec) {
        if (!(rec instanceof Record)) {
            let nrec = this.m_model.clone();
            rec = nrec.unSerialize(rec);
        }
        console.assert(rec.getID());
        this.m_records.push(rec);
        this._rebuildIndex();
        this.emit('data_change', EvDataChange('create', rec.getID()));
    }
    /**
     *
     */
    getMaxId() {
        let maxID = undefined;
        this.m_records.forEach((r) => {
            let rid = r.getID();
            if (maxID === undefined || maxID < rid) {
                maxID = rid;
            }
        });
        return maxID;
    }
    /**
     *
     * @param id
     */
    delete(id) {
        let idx = this.indexOfId(id);
        if (idx < 0) {
            return false;
        }
        idx = this.m_rec_index[idx];
        // mark as deleted
        this.m_records.splice(idx, 1);
        this._rebuildIndex();
        this.emit('data_change', EvDataChange('delete', id));
        return true;
    }
    /**
     * return the number of records
     */
    get count() {
        return this.m_rec_index ? this.m_rec_index.length : this.m_records.length;
    }
    /**
     * return the fields
     */
    get fields() {
        return this.m_fields;
    }
    /**
     * find the index of the element with the given id
     */
    indexOfId(id) {
        //if( this.count<10 ) {
        //	this.forEach( (rec) => rec.getID() == id );
        //}
        for (let lim = this.count, base = 0; lim != 0; lim >>= 1) {
            let p = base + (lim >> 1); // int conversion
            let idx = this.m_rec_index[p];
            let rid = this.m_records[idx].getID();
            if (rid == id) {
                return p;
            }
            if (rid < id) {
                base = p + 1;
                lim--;
            }
        }
        return -1;
    }
    /**
     * return the record by it's id
     * @returns record or null
     */
    getById(id) {
        let idx = this.indexOfId(id);
        if (idx < 0) {
            return null;
        }
        idx = this.m_rec_index[idx];
        return this.m_records[idx];
    }
    /**
     * return a record by it's index
     * @returns record or null
     */
    getByIndex(index) {
        let idx = this.m_rec_index[index];
        return this._getRecord(idx);
    }
    _getRecord(index) {
        return this.m_records[index] ?? null;
    }
    moveTo(other) {
        other.setRawData(this.m_records);
    }
    /**
     * create a new view on the DataStore
     * @param opts
     */
    createView(opts) {
        let eopts = { ...opts, store: this };
        return new DataView(eopts);
    }
    /**
     *
     */
    createIndex(filter) {
        if (filter && filter.op === 'empty-result') {
            return new Uint32Array(0);
        }
        let index = new Uint32Array(this.m_records.length);
        let iidx = 0;
        if (!filter) {
            // reset filter
            this.forEach((rec, idx) => {
                index[iidx++] = idx;
            });
        }
        else {
            if (typeof (filter.op) === 'function') {
                let fn = filter.op;
                // scan all records and append only interesting ones
                this.forEach((rec, idx) => {
                    // skip deleted
                    if (!rec) {
                        return;
                    }
                    if (fn(rec)) {
                        index[iidx++] = idx;
                    }
                });
            }
            else {
                let filterFld = this.m_model.getFieldIndex(filter.field); // field index to filter on
                if (filterFld < 0) {
                    // unknown filter field, nothing inside
                    console.assert(false, 'unknown field name in filter');
                    return new Uint32Array(0);
                }
                let filterValue = filter.value;
                if ((0, tools_1.isString)(filterValue) && !filter.caseSensitive) {
                    filterValue = filterValue.toUpperCase();
                }
                function _lt(recval) {
                    return recval < filterValue;
                }
                function _le(recval) {
                    return recval <= filterValue;
                }
                function _eq(recval) {
                    return recval == filterValue;
                }
                function _neq(recval) {
                    return recval != filterValue;
                }
                function _ge(recval) {
                    return recval >= filterValue;
                }
                function _gt(recval) {
                    return recval > filterValue;
                }
                function _re(recval) {
                    filterRe.lastIndex = -1;
                    return filterRe.test(recval);
                }
                let filterFn; // filter fn 
                let filterRe; // if fielter is regexp
                if (filterValue instanceof RegExp) {
                    filterRe = filterValue;
                    filterFn = _re;
                }
                else {
                    switch (filter.op) {
                        case '<': {
                            filterFn = _lt;
                            break;
                        }
                        case '<=': {
                            filterFn = _le;
                            break;
                        }
                        case '=': {
                            filterFn = _eq;
                            break;
                        }
                        case '>=': {
                            filterFn = _ge;
                            break;
                        }
                        case '>': {
                            filterFn = _gt;
                            break;
                        }
                        case '<>': {
                            filterFn = _neq;
                            break;
                        }
                    }
                }
                // scan all records and append only interesting ones
                this.forEach((rec, idx) => {
                    // skip deleted
                    if (!rec) {
                        return;
                    }
                    let field = rec.getRaw(filterFld);
                    if (field === null || field === undefined) {
                        field = '';
                    }
                    else {
                        field = '' + field;
                        if (!filter.caseSensitive) {
                            field = field.toUpperCase();
                        }
                    }
                    let keep = filterFn(field);
                    if (keep) {
                        index[iidx++] = idx;
                    }
                    ;
                });
            }
        }
        return index.slice(0, iidx);
    }
    sortIndex(index, sort) {
        let bads = 0; // unknown fields
        let fidxs = []; // fields indexes
        // if no fields are given, reset sort by id
        if (sort === null) {
            fidxs.push({ fidx: 0, asc: true });
        }
        else {
            fidxs = sort.map((si) => {
                let fi = this.m_model.getFieldIndex(si.field);
                if (fi == -1) {
                    console.assert(false, 'unknown field name in sort');
                    bads++;
                }
                return { fidx: fi, asc: si.ascending };
            });
        }
        // unknown field or nothing to sort on ??
        if (bads || fidxs.length == 0) {
            return index;
        }
        // sort only by one field : optimize it
        if (fidxs.length == 1) {
            let field = fidxs[0].fidx;
            index.sort((ia, ib) => {
                let va = this.getByIndex(ia).getRaw(field) ?? '';
                let vb = this.getByIndex(ib).getRaw(field) ?? '';
                if (va > vb) {
                    return 1;
                }
                if (va < vb) {
                    return -1;
                }
                return 0;
            });
            // just reverse if 
            if (!fidxs[0].asc) {
                index.reverse();
            }
        }
        else {
            index.sort((ia, ib) => {
                for (let fi = 0; fi < fidxs.length; fi++) {
                    let fidx = fidxs[fi].fidx;
                    let mul = fidxs[fi].asc ? 1 : -1;
                    let va = this.getByIndex(ia).getRaw(fidx) ?? '';
                    let vb = this.getByIndex(ib).getRaw(fidx) ?? '';
                    if (va > vb) {
                        return mul;
                    }
                    if (va < vb) {
                        return -mul;
                    }
                }
                return 0;
            });
        }
        return index;
    }
    /**
     *
     */
    forEach(cb) {
        if (this.m_rec_index) {
            this.m_rec_index.some((ri, index) => {
                if (cb(this.m_records[ri], index)) {
                    return index;
                }
            });
        }
        else {
            this.m_records.some((rec, index) => {
                if (rec) {
                    if (cb(rec, index)) {
                        return index;
                    }
                }
            });
        }
    }
    export() {
        return this.m_records;
    }
    changed() {
        this.emit('data_change', EvDataChange('change'));
    }
}
exports.DataStore = DataStore;
function EvViewChange(action) {
    return (0, x4events_1.BasicEvent)({ action });
}
exports.EvViewChange = EvViewChange;
/**
 * Dataview allow different views of the DataStore.
 * You can sort the columns & filter data
 * You can have multiple views for a single DataStore
 */
class DataView extends base_component_1.BaseComponent {
    m_index;
    m_store;
    m_sort;
    m_filter;
    constructor(props) {
        super(props);
        this.m_store = props.store;
        this.m_index = null;
        this.m_filter = null;
        this.m_sort = null;
        this.filter(props.filter);
        if (props.order) {
            if ((0, tools_1.isString)(props.order)) {
                this.sort([{ field: props.order, ascending: true }]);
            }
            else if ((0, tools_1.isArray)(props.order)) {
                this.sort(props.order);
            }
            else {
                this.sort([props.order]);
            }
        }
        else {
            this.sort(null);
        }
        this.m_store.on('data_change', (e) => this._storeChange(e));
    }
    _storeChange(ev) {
        this._filter(this.m_filter, ev.type != 'change');
        this._sort(this.m_sort, ev.type != 'change');
        this.emit('view_change', EvViewChange('change'));
    }
    /**
     *
     * @param filter
     */
    filter(filter) {
        this.m_index = null; // null to signal that we have to run on records instead of index
        return this._filter(filter, true);
    }
    _filter(filter, notify) {
        this.m_index = this.m_store.createIndex(filter);
        this.m_filter = filter;
        // need to sort again:
        if (this.m_sort) {
            this.sort(this.m_sort);
        }
        if (notify) {
            this.emit('view_change', EvViewChange('filter'));
        }
        return this.m_index.length;
    }
    /**
     *
     * @param columns
     * @param ascending
     */
    sort(props) {
        this._sort(props, true);
    }
    _sort(props, notify) {
        this.m_index = this.m_store.sortIndex(this.m_index, props);
        this.m_sort = props;
        if (notify) {
            this.emit('view_change', EvViewChange('sort'));
        }
    }
    /**
     *
     */
    get store() {
        return this.m_store;
    }
    /**
     *
     */
    get count() {
        return this.m_index.length;
    }
    /**
     *
     * @param id
     */
    indexOfId(id) {
        let ridx = this.m_store.indexOfId(id);
        return this.m_index.findIndex((rid) => rid === ridx);
    }
    /**
     *
     * @param index
     */
    getByIndex(index) {
        if (index >= 0 && index < this.m_index.length) {
            let rid = this.m_index[index];
            return this.m_store.getByIndex(rid);
        }
        return null;
    }
    /**
     *
     * @param id
     */
    getById(id) {
        return this.m_store.getById(id);
    }
    changed() {
        this.emit('view_change', EvViewChange('change'));
    }
    /**
     *
     */
    forEach(cb) {
        debugger;
        this.m_index.some((index) => {
            let rec = this.m_store.getByIndex(index);
            if (rec) {
                if (cb(rec, index)) {
                    return index;
                }
            }
        });
    }
}
exports.DataView = DataView;
