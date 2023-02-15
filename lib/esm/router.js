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
import { x4document } from './x4dom';
import { EventSource, EvError } from "./x4events";
function parseRoute(str, loose = false) {
    if (str instanceof RegExp) {
        return {
            keys: null,
            pattern: str
        };
    }
    const arr = str.split('/');
    let keys = [];
    let pattern = '';
    if (arr[0] == '') {
        arr.shift();
    }
    for (const tmp of arr) {
        const c = tmp[0];
        if (c === '*') {
            keys.push('wild');
            pattern += '/(.*)';
        }
        else if (c === ':') {
            const o = tmp.indexOf('?', 1);
            const ext = tmp.indexOf('.', 1);
            keys.push(tmp.substring(1, o >= 0 ? o : ext >= 0 ? ext : tmp.length));
            pattern += o >= 0 && ext < 0 ? '(?:/([^\/]+?))?' : '/([^\/]+?)';
            if (ext >= 0) {
                pattern += (o >= 0 ? '?' : '') + '\\' + tmp.substring(ext);
            }
        }
        else {
            pattern += '/' + tmp;
        }
    }
    return {
        keys,
        pattern: new RegExp(`^${pattern}${loose ? '(?=$|\/)' : '\/?$'}`, 'i')
    };
}
export class Router extends EventSource {
    routes;
    constructor() {
        super();
        this.routes = [];
        window.addEventListener('popstate', (event) => {
            const url = x4document.location.pathname;
            const found = this._find(url);
            found.handlers.forEach(h => {
                h(found.params, url);
            });
        });
    }
    get(uri, handler) {
        let { keys, pattern } = parseRoute(uri);
        this.routes.push({ keys, pattern, handler });
    }
    init() {
        this.navigate(window.location.pathname);
    }
    navigate(uri, notify = true) {
        const found = this._find(uri);
        if (!found || found.handlers.length == 0) {
            //window.history.pushState({}, '', 'error')
            console.log('route not found: ' + uri);
            this.signal("error", EvError(404, "route not found"));
            return;
        }
        window.history.pushState({}, '', uri);
        if (notify) {
            found.handlers.forEach(h => {
                h(found.params, uri);
            });
        }
    }
    _find(url) {
        let matches = [];
        let params = {};
        let handlers = [];
        for (const tmp of this.routes) {
            if (!tmp.keys) {
                matches = tmp.pattern.exec(url);
                if (!matches) {
                    continue;
                }
                if (matches['groups']) {
                    for (const k in matches['groups']) {
                        params[k] = matches['groups'][k];
                    }
                }
                handlers = [...handlers, tmp.handler];
            }
            else if (tmp.keys.length > 0) {
                matches = tmp.pattern.exec(url);
                if (matches === null) {
                    continue;
                }
                for (let j = 0; j < tmp.keys.length;) {
                    params[tmp.keys[j]] = matches[++j];
                }
                handlers = [...handlers, tmp.handler];
            }
            else if (tmp.pattern.test(url)) {
                handlers = [...handlers, tmp.handler];
            }
        }
        return { params, handlers };
    }
}
