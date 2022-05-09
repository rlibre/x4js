/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file md5.ts
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
export declare class Md5 {
    static hashStr(str: string, raw?: false): string;
    static hashStr(str: string, raw?: true): Int32Array;
    static hashAsciiStr(str: string, raw?: false): string;
    static hashAsciiStr(str: string, raw?: true): Int32Array;
    private static stateIdentity;
    private static buffer32Identity;
    private static hexChars;
    private static hexOut;
    private static onePassHasher;
    private static _hex;
    private static _md5cycle;
    private _dataLength;
    private _bufferLength;
    private _state;
    private _buffer;
    private _buffer8;
    private _buffer32;
    constructor();
    start(): this;
    appendStr(str: string): this;
    appendAsciiStr(str: string): this;
    appendByteArray(input: Uint8Array): this;
    getState(): {
        buffer: any;
        buflen: number;
        length: number;
        state: number[];
    };
    setState(state: any): void;
    end(raw?: boolean): string | Int32Array;
}
