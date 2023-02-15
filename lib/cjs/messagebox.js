"use strict";
/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|
*  /__/ \__\   |_|
*
* @file messagebox.ts
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptDialogBox = exports.MessageBox = void 0;
const dialog_1 = require("./dialog");
const tools_1 = require("./tools");
const layout_1 = require("./layout");
const icon_1 = require("./icon");
const label_1 = require("./label");
const textedit_1 = require("./textedit");
class MessageBox extends dialog_1.Dialog {
    constructor(props) {
        var _a;
        // remove overloaded elements from DialogBoxProps
        let icon = (_a = props.icon) !== null && _a !== void 0 ? _a : 'var( --x4-icon-exclamation )'; // todo: resolve that
        props.icon = undefined;
        let buttons = props.buttons === undefined ? ['ok'] : props.buttons;
        props.buttons = undefined;
        super(props);
        let msg = props.message;
        this.form.updateContent(new layout_1.HLayout({
            style: { padding: 8 },
            content: [
                icon ? new icon_1.Icon({ cls: 'icon', icon }) : null,
                this.m_label = new label_1.Label({ cls: 'text', text: msg, multiline: true })
            ]
        }), buttons);
        this.on('btnClick', (ev) => {
            // no prevent default -> always close the messagebox
            if (!this.m_props.click) {
                return;
            }
            (0, tools_1.asap)(() => {
                this.m_props.click(ev.button);
            });
        });
    }
    set text(txt) {
        this.m_label.text = txt;
    }
    /**
     * display a messagebox
     */
    static show(props) {
        let msg;
        if ((0, tools_1.isString)(props) || (0, tools_1.isHtmlString)(props)) {
            msg = new MessageBox({ message: props, click: () => { } });
        }
        else {
            msg = new MessageBox(props);
        }
        msg.show();
        return msg;
    }
    static showAsync(props) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let _props;
                const cb = (btn) => {
                    resolve(btn);
                };
                if ((0, tools_1.isString)(props) || (0, tools_1.isHtmlString)(props)) {
                    _props = { message: props, click: cb };
                }
                else {
                    _props = Object.assign(Object.assign({}, props), { click: cb });
                }
                const msg = new MessageBox(_props);
                msg.show();
            });
        });
    }
    /**
     * display an alert message
     */
    static alert(text, title = null) {
        new MessageBox({
            cls: 'warning',
            title,
            message: text,
            buttons: ['ok'],
            click: () => { },
        }).show();
    }
}
exports.MessageBox = MessageBox;
class PromptDialogBox extends dialog_1.Dialog {
    constructor(props) {
        var _a;
        // remove overloaded elements from DialogBoxProps
        //let icon = props.icon;	// ?? 'cls(far fa-comment-check)';	// todo: resolve that
        //props.icon = undefined;
        props.buttons = undefined;
        props.width = (_a = props.width) !== null && _a !== void 0 ? _a : 500;
        super(props);
        this.form.updateContent(new layout_1.HLayout({
            cls: 'panel',
            content: [
                //icon ? new Icon({
                //	cls: 'icon',
                //	icon: icon
                //}) : null,
                this.m_edit = new textedit_1.TextEdit({
                    flex: 1,
                    autoFocus: true,
                    label: props.message,
                    value: props.value
                }),
            ]
        }), ['ok', 'cancel']);
        if (props.click) {
            this.on('btnClick', (ev) => {
                if (ev.button === 'ok') {
                    // no prevent default -> always close the messagebox
                    // asap to allow
                    (0, tools_1.asap)(() => {
                        this.m_props.click(this.m_edit.value);
                    });
                }
            });
        }
    }
    set text(txt) {
        this.m_edit.label = txt;
    }
    /**
     * display a messagebox
     */
    static show(props, inputCallback) {
        let msg;
        if ((0, tools_1.isString)(props) || (0, tools_1.isHtmlString)(props)) {
            msg = new PromptDialogBox({ message: props, click: inputCallback });
        }
        else {
            msg = new PromptDialogBox(props);
        }
        msg.show();
        return msg;
    }
}
exports.PromptDialogBox = PromptDialogBox;
