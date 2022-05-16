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
        buffer: string;
        buflen: number;
        length: number;
        state: number[];
    };
    setState(state: any): void;
    end(raw?: boolean): string | Int32Array;
}
