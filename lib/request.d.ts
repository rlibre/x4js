/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file request.ts
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
export interface RequestProps {
    url: string;
    method?: 'GET' | 'POST';
    headers?: string[];
    params?: any;
    timeout?: number;
    responseType?: 'text' | 'json' | 'arraybuffer';
    userData?: any;
    success: (data: any, userData: any) => void;
    failure?: (status: number, statusText: string, userData: any) => void;
    progress?: (length: number, total: number, display: string) => void;
}
export declare function ajaxRequest(cfg: RequestProps): Function;
interface AjaxRequestInit extends Omit<RequestInit, 'body'> {
    body?: BodyInit | null | object;
    noGenX?: boolean;
}
export declare function ajaxAsJSON(url: string, init?: AjaxRequestInit): Promise<any>;
export declare function ajaxAsText(url: string, init?: AjaxRequestInit): Promise<any>;
/**
 * use encodeURIComponent for elements in url
 */
export declare function ajax(url: string, init?: AjaxRequestInit, type?: string): Promise<Response>;
export {};
