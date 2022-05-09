/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|
*  /__/\__\   |_|
*
* @file formatters.ts
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
export declare type FormatFunc = (input: any, rec: any) => string;
export declare function setCurrencySymbol(symbol: string | null): void;
export declare function sql_date_formatter(input: any): string;
export declare function date_formatter(input: any): string;
export declare function money_formatter(input: any): string;
export declare function money_formatter_nz(input: any): string;
export declare function bool_formatter(input: any): string;
