/**
* @file host.ts
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

export interface FileStat {
	atime: number;
	isDir: boolean;
}

export type PathType = 'home' | 'appData' | 'userData' | 'cache' | 'temp' | 'exe' | 'desktop' | 'documents' | 'downloads' | 'music'
						| 'pictures'| 'videos' | 'recent' | 'logs' | 'crashDumps';

export type PartType = 'filename' | 'extname' | 'basename' | 'dirname';

export abstract class Host {

	constructor( ) {
		host = this;
	}

	makePath( ...els: string[] ) {
		return els.join( '/' );
	}

	readBinary( path: string ): Promise<Uint8Array> {
		return Promise.reject( 'not imp' );	
	}

	writeBinary( path: string, data: Uint8Array ): Promise<boolean> {
		return Promise.reject( 'not imp' );
	}

	readUtf8( path: string ): Promise<string> {
		return Promise.reject( 'not imp' );
	}

	writeUtf8( path: string, data: string ): Promise<boolean> {
		return Promise.reject( 'not imp' );
	}

	compress( data: Uint8Array ): Promise<Uint8Array> {
		return Promise.reject( 'not imp' );
	}

	decompress( data: Uint8Array ): Promise<Uint8Array> {
		return Promise.reject( 'not imp' );
	}

	readLocalStorage( name: string ): string {
		return localStorage.getItem( name );
	}

	writeLocalStorage( name: string, data: string ): void {
		localStorage.setItem( name, data );
	}

	stat( name: string ): FileStat {
		throw 'not imp';
	}

	readDir( path: string ): Promise<string[]> {
		throw 'not imp';
	}

	require( name: string ): any {
		throw 'not imp';
	}

	cwd( ): string {
		throw 'not imp';
	}

	getPath( type: PathType ) : string {
		throw 'not imp';
	}

	getPathPart( path: string, type: PartType ) : string {
		throw 'not imp';
	}

	abstract createCanvas( );
}


export let host: Host = null;