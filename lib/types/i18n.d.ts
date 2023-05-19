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
 * create a new language
 * @param name language name (code)
 * @param base base language (code)
 * @example:
 * ```js
 * createLanguage( 'en', 'fr' );
 * ```
 */
export declare function createLanguage(name: string, base: string): void;
/**
 * check if the given language is known
 * @param name language name (code)
 */
export declare function isLanguage(name: string): boolean;
/**
 * build the language with given fragments
 * @param name language name (code)
 * @param parts misc elements that make the language
 * @example:
 * ```js
 * createLanguage( 'en', 'fr' );
 * const app = {
 * 	clients: {
 * 		translation1: "hello",
 *  }
 * }
 * addTranslation( 'en', app );
 * ```
  */
export declare function addTranslation(name: any, ...parts: any[]): void;
export declare let _tr: any;
/**
 * select the given language as current
 * @param name laguage name (code)
 */
export declare function selectLanguage(name: string): any;
/**
 *
 */
export declare function getCurrentLanguage(): string;
/**
 *
 */
export declare function getAvailableLanguages(): string[];
