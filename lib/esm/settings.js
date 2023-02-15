/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file local_storage.ts
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
export class Settings {
    m_data;
    m_name;
    constructor(name) {
        this.m_data = null;
        this.m_name = name ?? 'settings';
    }
    set(name, value) {
        this._load();
        this.m_data[name] = value;
        this._save();
    }
    get(name, defValue) {
        this._load();
        return this.m_data[name] ?? defValue;
    }
    _save() {
        let data = JSON.stringify(this.m_data);
        localStorage.setItem(this.m_name, data);
    }
    _load() {
        if (this.m_data) {
            return;
        }
        this.m_data = {};
        let data = localStorage.getItem(this.m_name);
        if (data !== null) {
            data = JSON.parse(data);
            if (data) {
                this.m_data = data;
            }
            else {
                console.info('There was an error attempting to read your settings.');
            }
        }
        // console.info('There was an error attempting to read your settings.');
    }
}
