/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file router.ts
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
import { EventSource, EvError, EventMap } from "./x4events";
type RouteHandler = (params: any, path: string) => void;
interface RouterEventMap extends EventMap {
    error: EvError;
}
/**
 * micro router
 *
 * ```
 * const router = new Router( );
 *
 * router.get( "/detail/:id", ( params: any ) => {
 * 	this._showDetail( detail );
 * } );
 *
 * router.get( "/:id", ( params: any ) => {
 *   if( params.id==0 )
 * 		router.navigate( '/home' );
 *	 }
 * });
 *
 * router.on( "error", ( ) => {
 * 	router.navigate( '/home' );
 * })
 *
 * router.init( );
 * ```
 */
export declare class Router extends EventSource<RouterEventMap> {
    private m_routes;
    private m_useHash;
    constructor(useHash?: boolean);
    get(uri: string | RegExp, handler: RouteHandler): void;
    init(): void;
    private _getLocation;
    navigate(uri: string, notify?: boolean, replace?: boolean): void;
    private _find;
}
export {};
