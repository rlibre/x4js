/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file i18n.ts
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
