"use strict";
/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file styles.ts
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
exports.ComputedStyle = exports.CSSParser = exports.Stylesheet = void 0;
const x4dom_1 = require("./x4dom");
const tools_1 = require("./tools");
/**
 *  -- [ @STYLESHEET ] -----------------------------------------------------------------
 */
class Stylesheet {
    m_sheet;
    m_rules = new Map();
    constructor() {
        function getStyleSheet(name) {
            for (let i = 0; i < x4dom_1.x4document.styleSheets.length; i++) {
                let sheet = x4dom_1.x4document.styleSheets[i];
                if (sheet.title === name) {
                    return sheet;
                }
            }
        }
        this.m_sheet = getStyleSheet('@dynamic-css');
        if (!this.m_sheet) {
            let dom = x4dom_1.x4document.createElement('style');
            dom.setAttribute('id', '@dynamic-css');
            x4dom_1.x4document.head.appendChild(dom);
            this.m_sheet = dom.sheet;
        }
    }
    /**
     * add a new rule to the style sheet
     * @param {string} name - internal rule name
     * @param {string} definition - css definition of the rule
     * @example
     * setRule('xbody', "body { background-color: #ff0000; }" );
     */
    setRule(name, definition) {
        if ((0, tools_1.isString)(definition)) {
            let index = this.m_rules.get(name);
            if (index !== undefined) {
                this.m_sheet.deleteRule(index);
            }
            else {
                index = this.m_sheet.cssRules.length;
            }
            this.m_rules.set(name, this.m_sheet.insertRule(definition, index));
        }
        else {
            let idx = 1;
            for (let r in definition) {
                let rule = r + " { ", css = definition[r];
                for (let i in css) {
                    let values = css[i]; // this is an array !
                    for (let j = 0; j < values.length; j++) {
                        rule += i + ": " + values[j] + "; ";
                    }
                }
                rule += '}';
                //console.log( rule );
                this.setRule(name + '--' + idx, rule);
                idx++;
            }
        }
    }
    /**
     * return the style variable value
     * @param name - variable name
     * @example
     * ```
     * let color = Component.getCss( ).getVar( 'button-color' );
     * ```
     */
    static getVar(name) {
        if (!Stylesheet.doc_style) {
            Stylesheet.doc_style = getComputedStyle(x4dom_1.x4document.documentElement);
        }
        if (name[0] != '-') {
            name = '--' + name;
        }
        return Stylesheet.doc_style.getPropertyValue(name); // #999999
    }
    static guid = 1;
    static doc_style;
}
exports.Stylesheet = Stylesheet;
/**
 *  -- [ @CSSPARSER ] -----------------------------------------------------------------
 *
 * adaptation of jss-for-node-js
 */
class CSSParser {
    result = {};
    parse(css) {
        this.result = {};
        this.parse_json('', css);
        return CSSParser.mk_string(this.result);
    }
    static mk_string(rules) {
        // output result:	
        let ret = '';
        for (let a in rules) {
            let css = rules[a];
            ret += a + " { ";
            for (let i in css) {
                let values = css[i]; // this is an array !
                for (let j = 0; j < values.length; j++) {
                    ret += i + ": " + values[j] + "; ";
                }
            }
            ret += "}\n";
        }
        return ret;
    }
    parse_json(scope, css) {
        if (scope && !this.result[scope]) {
            this.result[scope] = {};
        }
        for (let property in css) {
            let value = css[property];
            if ((0, tools_1.isArray)(value)) {
                let values = value;
                for (let i = 0; i < values.length; i++) {
                    this.addProperty(scope, property, values[i]);
                }
            }
            /*else if (value instanceof Color) {
                this.addProperty(scope, property, value.toString());
            }*/
            else {
                switch (typeof (value)) {
                    case "number": {
                        this.addProperty(scope, property, value);
                        break;
                    }
                    case "string": {
                        this.addProperty(scope, property, value);
                        break;
                    }
                    case "object": {
                        this.parse_json(this.makeSelectorName(scope, property), value);
                        break;
                    }
                    default: {
                        console.error("ignoring unknown type " + typeof (value) + " in property " + property);
                        break;
                    }
                }
            }
        }
    }
    makePropertyName(n) {
        return (0, tools_1.pascalCase)(n);
    }
    makeSelectorName(scope, name) {
        let snames = [];
        let names = name.split(/\s*,\s*/);
        let scopes = scope.split(/\s*,\s*/);
        for (let s = 0; s < scopes.length; s++) {
            let scope = scopes[s];
            for (let i = 0; i < names.length; i++) {
                let name = names[i], sub = false;
                if (name.charAt(0) == "&") {
                    name = name.substr(1);
                    sub = true;
                }
                if (name.charAt(0) === '%') {
                    name = '.o-' + name.substr(1);
                }
                if (sub) {
                    snames.push(scope + name);
                }
                else {
                    snames.push(scope ? scope + " " + name : name);
                }
            }
        }
        return snames.join(", ");
    }
    addProperty(scope, property, value) {
        let properties = property.split(/\s*,\s*/);
        for (let i = 0; i < properties.length; i++) {
            let property = this.makePropertyName(properties[i]);
            if (this.result[scope][property]) {
                this.result[scope][property].push(value);
            }
            else {
                this.result[scope][property] = [value];
            }
            let specials = {
                "box-shadow": [
                    "-moz-box-shadow",
                    "-webkit-box-shadow"
                ],
                "border-radius": [
                    "-moz-border-radius",
                    "-webkit-border-radius"
                ],
                "border-radius-topleft": [
                    "-moz-border-radius-topleft",
                    "-webkit-border-top-left-radius"
                ],
                "border-radius-topright": [
                    "-moz-border-radius-topright",
                    "-webkit-border-top-right-radius"
                ],
                "border-radius-bottomleft": [
                    "-moz-border-radius-bottomleft",
                    "-webkit-border-bottom-left-radius"
                ],
                "border-radius-bottomright": [
                    "-moz-border-radius-bottomright",
                    "-webkit-border-bottom-right-radius"
                ]
            };
            let browser_specials = specials[property];
            for (let j = 0; browser_specials && j < browser_specials.length; j++) {
                this.addProperty(scope, browser_specials[j], value);
            }
        }
    }
}
exports.CSSParser = CSSParser;
class ComputedStyle {
    m_style;
    constructor(style) {
        this.m_style = style;
    }
    /**
     * return the raw value
     */
    value(name) {
        name = (0, tools_1.pascalCase)(name);
        return this.m_style[name];
    }
    /**
     * return the interpreted value
     */
    parse(name) {
        name = (0, tools_1.pascalCase)(name);
        return parseInt(this.m_style[name]);
    }
    /**
     *
     */
    get style() {
        return this.m_style;
    }
}
exports.ComputedStyle = ComputedStyle;
