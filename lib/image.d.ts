/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file image.ts
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
import { Component, CProps } from './component';
interface ImageProps extends CProps {
    src: string;
    alt?: string;
    lazy?: boolean;
    alignment?: 'fill' | 'contain' | 'cover' | 'scale-down' | 'none';
}
/**
 * Standard image class
 */
export declare class Image extends Component<ImageProps> {
    protected m_created: boolean;
    protected m_lazysrc: string;
    constructor(props: ImageProps);
    /** @ignore */
    render(): void;
    /**
     * change the image
     * @param src - image path
     */
    setImage(src: string, force?: boolean): void;
    private _update_image;
    private static lazy_images_waiting;
    private static lazy_image_timer;
    private static lazyWatch;
}
export {};
