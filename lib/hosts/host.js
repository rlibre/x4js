"use strict";
/**
* @file host.ts
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
exports.host = exports.Host = void 0;
class Host {
    constructor() {
        exports.host = this;
    }
    makePath(...els) {
        return els.join('/');
    }
    readBinary(path) {
        return Promise.reject('not imp');
    }
    writeBinary(path, data) {
        return Promise.reject('not imp');
    }
    readUtf8(path) {
        return Promise.reject('not imp');
    }
    writeUtf8(path, data) {
        return Promise.reject('not imp');
    }
    compress(data) {
        return Promise.reject('not imp');
    }
    decompress(data) {
        return Promise.reject('not imp');
    }
    readLocalStorage(name) {
        return localStorage.getItem(name);
    }
    writeLocalStorage(name, data) {
        localStorage.setItem(name, data);
    }
    stat(name) {
        throw 'not imp';
    }
    readDir(path) {
        throw 'not imp';
    }
    require(name) {
        throw 'not imp';
    }
    cwd() {
        throw 'not imp';
    }
    getPath(type) {
        throw 'not imp';
    }
    getPathPart(path, type) {
        throw 'not imp';
    }
}
exports.Host = Host;
exports.host = null;
