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
exports.PromptDialogBox = exports.MessageBox = void 0;
const dialog_1 = require("./dialog");
const tools_1 = require("./tools");
const layout_1 = require("./layout");
const icon_1 = require("./icon");
const label_1 = require("./label");
const textedit_1 = require("./textedit");
class MessageBox extends dialog_1.Dialog {
    m_label;
    constructor(props) {
        // remove overloaded elements from DialogBoxProps
        let icon = props.icon ?? 'cls(far fa-circle-exclamation)'; // todo: resolve that
        props.icon = undefined;
        let buttons = props.buttons === undefined ? ['ok'] : props.buttons;
        props.buttons = undefined;
        super(props);
        let msg = props.message;
        this.form.updateContent(new layout_1.HLayout({
            style: { padding: 8 },
            content: [
                new icon_1.Icon({ cls: 'icon', icon }),
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
    m_edit;
    constructor(props) {
        // remove overloaded elements from DialogBoxProps
        //let icon = props.icon;	// ?? 'cls(far fa-comment-check)';	// todo: resolve that
        //props.icon = undefined;
        props.buttons = undefined;
        props.width = props.width ?? 500;
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
