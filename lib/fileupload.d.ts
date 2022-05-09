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
import { CProps } from './component';
import { HLayout } from './layout';
export interface FileUploadProps extends CProps {
    name: string;
    value: string;
}
export declare class FileUpload extends HLayout<FileUploadProps> {
    constructor(props: FileUploadProps);
    clear(): void;
}
/**
 *
 */
export declare class ImageUpload extends FileUpload {
    private m_path;
    private m_ui_img;
    private m_ui_input;
    /** @ignore */
    render(props: FileUploadProps): void;
    clear(): void;
    private _get_value;
    private _set_value;
    private _handleChange;
}
/**
 * show openfile dialog
 * @param extensions - string - ex: '.doc,.docx'
 * @param cb - callback to call when user select a file
 */
export declare function openFile(extensions: string, cb: (filename: FileList) => void, multiple?: boolean): void;
/**
 * open saveas dialog
 * @param defFileName - string - proposed filename
 * @param cb - callback to call when user choose the destination
 */
export declare function saveFile(defFileName: string, extensions: string, cb: (filename: File) => void): void;
