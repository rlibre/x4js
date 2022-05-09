"use strict";
/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file local_storage.ts
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = void 0;
const host_1 = require("./hosts/host");
class Settings {
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
        host_1.host.writeLocalStorage(this.m_name, data);
    }
    _load() {
        if (this.m_data) {
            return;
        }
        this.m_data = {};
        let data = host_1.host.readLocalStorage(this.m_name);
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
exports.Settings = Settings;
