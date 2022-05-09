"use strict";
/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file fileupload.ts
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
exports.saveFile = exports.openFile = exports.ImageUpload = exports.FileUpload = void 0;
const component_1 = require("./component");
const layout_1 = require("./layout");
const input_1 = require("./input");
const image_1 = require("./image");
class FileUpload extends layout_1.HLayout {
    constructor(props) {
        super(props);
    }
    clear() {
        this.m_props.value = '';
    }
}
exports.FileUpload = FileUpload;
/**
 *
 */
class ImageUpload extends FileUpload {
    m_path;
    m_ui_img;
    m_ui_input;
    /** @ignore */
    render(props) {
        let ename = "up" + this.uid;
        this.setContent([
            new component_1.Component({
                tag: 'label', attrs: { for: ename }, content: [
                    this.m_ui_img = new image_1.Image({ src: this.m_props.value }),
                ]
            }),
            this.m_ui_input = new input_1.Input({
                cls: '@hidden',
                id: ename,
                type: 'file',
                name: this.m_props.name,
                value_hook: {
                    get: () => { return this._get_value(); },
                    set: (v) => { this._set_value(v); }
                },
                attrs: {
                    accept: 'image/*'
                },
                dom_events: {
                    change: (e) => { this._handleChange(e); }
                }
            }),
        ]);
    }
    clear() {
        super.clear();
        this.m_ui_input.dom.value = '';
        this.m_ui_img.setImage(null, false);
    }
    _get_value() {
        return this.m_path;
    }
    _set_value(v) {
        debugger;
    }
    _handleChange(e) {
        let self = this;
        function createThumbnail(file) {
            let reader = new FileReader();
            reader.addEventListener('load', (e) => {
                self.m_ui_img.setImage(reader.result.toString());
            });
            reader.readAsDataURL(file);
        }
        const allowedTypes = ['png', 'jpg', 'jpeg', 'gif'];
        let files = e.target.files, filesLen = files.length;
        for (let i = 0; i < filesLen; i++) {
            let imgType = files[i].name.split('.');
            imgType = imgType[imgType.length - 1];
            imgType = imgType.toLowerCase();
            if (allowedTypes.indexOf(imgType) != -1) {
                createThumbnail(files[i]);
                this.m_path = files[i];
                break;
            }
        }
    }
}
exports.ImageUpload = ImageUpload;
let g_file_input = null;
function _createFileInput() {
    if (!g_file_input) {
        g_file_input = new component_1.Component({
            tag: 'input',
            style: {
                display: 'none',
                id: 'fileDialog',
            },
            attrs: {
                type: 'file'
            }
        });
        // ajoute un input type:file caché pour pouvoir choir un fichier a ouvrir
        document.body.appendChild(g_file_input._build());
    }
    g_file_input.clearDomEvent('change');
    return g_file_input;
}
/**
 * show openfile dialog
 * @param extensions - string - ex: '.doc,.docx'
 * @param cb - callback to call when user select a file
 */
function openFile(extensions, cb, multiple = false) {
    let fi = _createFileInput();
    fi.removeAttribute('nwsaveas');
    fi.setAttribute('accept', extensions);
    fi.setAttribute('multiple', multiple);
    // Set up the file chooser for the on change event
    fi.setDomEvent("change", (evt) => {
        // When we reach this point, it means the user has selected a file,
        let files = fi.dom.files;
        cb(files);
    });
    fi.dom.click();
}
exports.openFile = openFile;
/**
 * open saveas dialog
 * @param defFileName - string - proposed filename
 * @param cb - callback to call when user choose the destination
 */
function saveFile(defFileName, extensions, cb) {
    let fi = _createFileInput();
    fi.setAttribute('nwsaveas', defFileName);
    fi.setAttribute('accept', extensions);
    // Set up the file chooser for the on change event
    fi.setDomEvent("change", (evt) => {
        // When we reach this point, it means the user has selected a file,
        let files = fi.dom.files;
        cb(files[0]);
    });
    fi.dom.click();
}
exports.saveFile = saveFile;
