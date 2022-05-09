/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file i18n.ts
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
/**
 * current language
 * FR by default
 * @example ```typescript
 * console.log( _tr.global.ok );
 */
export declare let _tr: any;
/**
 * check if the language is known
 * @param name - language name to test
 * @example ```typescript
 * if( isLanguage('fr') ) {
 * }
 */
export declare function isLanguage(name: any): boolean;
/**
 * select the current language
 * @param name - language name
 * @example ```typescript
 * selectLanguage( 'en' );
 */
export declare function selectLanguage(name: any): void;
/**
 * define a translation
 * you can also patch 'global' elements witch are defined by x4
 * @param name - language name
 * @param definition - definition of the language
 * @example ```typescript
 * setTranslation( 'fr', {
 * 	this_is_an_example: 'ceci est un exemple',
 * 	this_is: {
 * 		another_example: 'ceci est un autre exemple'
 *  },
 *  global: {
 *    ok: 'O.K.'
 *  }
 * });
 * console.log( _tr.this_is_an_example ); // defined by the previous line
 * selectLanguage( 'en' );
 * console.log( _tr.this_is_an_example ); // 'en' do not define this, so we get 'fr' one
 *
 */
export declare function extendTranslation(name: any, definition: any): void;
