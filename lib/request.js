"use strict";
/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file request.ts
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
exports.ajax = exports.ajaxAsText = exports.ajaxAsJSON = exports.ajaxRequest = void 0;
/**
 * TODO: use fetch api
 *

async function xx( resp, cb ) {
    cb( await resp.json() );
}

async function getToto( cb ) {
    fetch('home/toto', { method: 'GET' }).then( (resp) => { xx(resp,cb); } );
}

function dump( resp ) {
    console.log( resp );
}

getToto( dump );

*/
const tools_1 = require("./tools");
const DEFAULT_TIMEOUT = 10000;
function ajaxRequest(cfg) {
    let params, url = cfg.url, method = cfg.method || 'GET', formdata = false;
    if (cfg.params instanceof FormData) {
        params = cfg.params;
        formdata = true;
    }
    else if (method == 'POST') {
        params = buildQuery(cfg.params, false);
    }
    else {
        url += buildQuery(cfg.params, true);
    }
    url = encodeURI(url);
    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.upload.addEventListener('progress', progress, false);
    xhr.addEventListener('timeout', failure);
    xhr.addEventListener('error', failure);
    xhr.addEventListener('load', success);
    if (!formdata) {
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
    }
    if (method != 'POST') {
        xhr.responseType = cfg.responseType || 'json';
        xhr.timeout = cfg.timeout || DEFAULT_TIMEOUT;
    }
    if (cfg.headers) {
        for (let h in cfg.headers) {
            xhr.setRequestHeader(h, cfg.headers[h]);
        }
    }
    function progress(ev) {
        console.log(ev);
        if (cfg.progress) {
            try {
                if (ev.lengthComputable) {
                    let disp = humanSize(ev.loaded) + ' / ' + humanSize(ev.total);
                    cfg.progress(ev.loaded, ev.total, disp);
                }
            }
            catch (e) {
                console.error('unhandled exception:', e);
            }
        }
    }
    function humanSize(bytes) {
        let unit, value;
        if (bytes >= 1e9) {
            unit = 'Gb';
            value = bytes / 1e9;
        }
        else if (bytes >= 1e6) {
            unit = 'Mb';
            value = bytes / 1e6;
        }
        else if (bytes >= 1e3) {
            unit = 'Kb';
            value = bytes / 1e3;
        }
        else {
            unit = 'bytes';
            value = bytes;
        }
        return value.toFixed(2) + unit;
    }
    function failure() {
        if (cfg.failure) {
            cfg.failure(xhr.status, xhr.statusText, cfg.userData);
        }
    }
    function success() {
        if (xhr.status >= 200 && xhr.status < 300) {
            if (cfg.success) {
                try {
                    cfg.success(xhr.response, cfg.userData);
                }
                catch (e) {
                    console.error('unhandled exception:', e);
                }
            }
        }
        else {
            failure();
        }
    }
    if (formdata || method == 'POST') {
        xhr.send(params);
    }
    else {
        xhr.send();
    }
    return function () {
        xhr.abort();
    };
}
exports.ajaxRequest = ajaxRequest;
function buildQuery(params, getMethod) {
    if (!params) {
        return '';
    }
    let query = [];
    for (let key in params) {
        let param = params[key];
        // array
        if ((0, tools_1.isArray)(param)) {
            for (let i = 0, n = param.length; i < n; i++) {
                query.push(encodeURIComponent(key) + '[]=' + encodeURIComponent('' + param[i]));
            }
        }
        // simple string ...
        else {
            if (param === undefined) {
                param = '';
            }
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent('' + param));
        }
    }
    let result = query.join('&');
    if (getMethod) {
        return '?' + result;
    }
    else {
        return result;
    }
}
async function ajaxAsJSON(url, init) {
    let response = await ajax(url, init, 'application/json');
    return response.json();
}
exports.ajaxAsJSON = ajaxAsJSON;
async function ajaxAsText(url, init) {
    let response = await ajax(url, init, 'text/plain');
    return response.text();
}
exports.ajaxAsText = ajaxAsText;
/**
 * use encodeURIComponent for elements in url
 */
async function ajax(url, init, type) {
    let options = {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };
    if (type) {
        options.headers['Content-Type'] = type;
    }
    if (init) {
        options = { ...options, ...init };
        if (init.body && !(0, tools_1.isString)(init.body)) {
            let cvt = false;
            if ((0, tools_1.isLiteralObject)(init.body)) {
                cvt = true;
            }
            else if (!(init.body instanceof Blob) && !(init.body instanceof ArrayBuffer) && !(init.body instanceof FormData) &&
                !(init.body instanceof URLSearchParams) && !(init.body instanceof ReadableStream)) {
                cvt = true;
            }
            if (cvt) {
                options.body = JSON.stringify(init.body);
            }
            else {
                options.body = init.body;
            }
        }
    }
    let response = await fetch(url, options);
    if (init && init.noGenX) {
        return response;
    }
    else {
        if (!response.ok) {
            throw new tools_1.NetworkError(response);
        }
        return response;
    }
}
exports.ajax = ajax;
