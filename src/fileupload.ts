/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file fileupload.ts
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

import { x4document } from './x4dom'
import { Component, CProps } from './component'

import { HLayout } from './layout'
import { Input } from './input'
import { Image } from './image'

// ============================================================================
// [FILEUPLOAD]
// ============================================================================

export interface FileUploadProps extends CProps {
	name: string;
	value: string;
}

export class FileUpload extends HLayout<FileUploadProps> {
	constructor(props: FileUploadProps) {
		super(props);
	}

	clear() {
		this.m_props.value = '';
	}
}

/**
 * 
 */

export class ImageUpload extends FileUpload {

	private m_path: any;
	private m_ui_img: Image;
	private m_ui_input: Input;

	/** @ignore */
	render(props: FileUploadProps) {

		let ename = "up" + this.uid;

		this.setContent([

			new Component({
				tag: 'label', attrs: { for: ename }, content: [
					this.m_ui_img = new Image({ src: this.m_props.value }),
				]
			}),

			this.m_ui_input = new Input({
				cls: '@hidden',
				id: ename,
				type: 'file',
				name: this.m_props.name,
				value_hook: {
					get: () => { return this._get_value() },
					set: (v) => { this._set_value(v); }
				},
				attrs: {
					accept: 'image/*'
				},
				dom_events: {
					change: (e) => { this._handleChange(e) }
				}
			}),
		]);
	}

	clear() {
		super.clear();
		(<HTMLInputElement>this.m_ui_input.dom).value = '';
		this.m_ui_img.setImage(null, false);
	}

	private _get_value() {
		return this.m_path;
	}

	private _set_value(v) {
		debugger;
	}

	private _handleChange(e) {

		let self = this;
		function createThumbnail(file) {

			let reader = new FileReader();
			reader.addEventListener('load', (e) => {
				self.m_ui_img.setImage(reader.result.toString());
			});

			reader.readAsDataURL(file);
		}

		const allowedTypes = ['png', 'jpg', 'jpeg', 'gif'];

		let files = e.target.files,
			filesLen = files.length;

		for (let i = 0; i < filesLen; i++) {

			let imgType: string = files[i].name.split('.');
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

let g_file_input: Component = null;

function _createFileInput() {
	if (!g_file_input) {
		g_file_input = new Component({
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
		x4document.body.appendChild(g_file_input._build());
	}

	g_file_input.clearDomEvent('change');
	return g_file_input;
}

/**
 * show openfile dialog
 * @param extensions - string - ex: '.doc,.docx'
 * @param cb - callback to call when user select a file
 */

export function openFile(extensions: string, cb: (filename: FileList) => void, multiple = false) {

	let fi = _createFileInput();

	fi.removeAttribute('nwsaveas');
	fi.setAttribute('accept', extensions);
	fi.setAttribute('multiple', multiple);

	// Set up the file chooser for the on change event
	fi.setDomEvent("change", (evt) => {
		// When we reach this point, it means the user has selected a file,
		let files = (<HTMLInputElement>fi.dom).files
		cb(files);
	});

	fi.dom.click();
}

/**
 * open saveas dialog
 * @param defFileName - string - proposed filename 
 * @param cb - callback to call when user choose the destination
 */

export function saveFile(defFileName: string, extensions: string, cb: (filename: File) => void) {

	let fi = _createFileInput();
	fi.setAttribute('nwsaveas', defFileName);
	fi.setAttribute('accept', extensions);

	// Set up the file chooser for the on change event
	fi.setDomEvent("change", (evt) => {
		// When we reach this point, it means the user has selected a file,
		let files = (<HTMLInputElement>fi.dom).files
		cb(files[0]);
	});

	fi.dom.click();
}

