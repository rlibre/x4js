/**
*  ___  ___ __
*  \  \/  /  / _
*   \    /  /_| |_
*   /    \____   _|  
*  /__/\__\   |_|
*        
* @file base64.ts
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

const _alphabet: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
let _lookup: any = null;


export class Base64 {
	lookup: any = null;

	static encode(s: string | Uint8Array ) {
		let buffer;

		if( s instanceof Uint8Array ) {
			buffer = []
			s.forEach( (v) => {
				buffer.push( v );
			});
		}
		else {
			buffer = Base64._toUtf8(s);
		}

		let position = -1;
		let len = buffer.length;
		let nan1, nan2;
		let enc = [, , ,];

		let result = '';
		while (++position < len) {
			nan1 = buffer[position + 1], nan2 = buffer[position + 2];
			enc[0] = buffer[position] >> 2;
			enc[1] = ((buffer[position] & 3) << 4) | (buffer[++position] >> 4);

			if (isNaN(nan1)) {
				enc[2] = enc[3] = 64;
			}
			else {
				enc[2] = ((buffer[position] & 15) << 2) | (buffer[++position] >> 6);
				enc[3] = (isNaN(nan2)) ? 64 : buffer[position] & 63;
			}

			result += _alphabet[enc[0]] + _alphabet[enc[1]] + _alphabet[enc[2]] + _alphabet[enc[3]];
		}

		return result;
	}

	static decode(s: string) {
		let buffer = Base64._fromUtf8(s);

		let position = 0;
		let len = buffer.length;

		let result = '';
		while (position < len) {
			if (buffer[position] < 128) {
				result += String.fromCharCode(buffer[position++]);
			}
			else if (buffer[position] > 191 && buffer[position] < 224) {
				result += String.fromCharCode(((buffer[position++] & 31) << 6) | (buffer[position++] & 63));
			}
			else {
				result += String.fromCharCode(((buffer[position++] & 15) << 12) | ((buffer[position++] & 63) << 6) | (buffer[position++] & 63));
			}
		}

		return result;
	}

	private static _toUtf8(s) {
		let position = -1;
		let len = s.length;

		let chr;
		let buffer = [];

		if (/^[\x00-\x7f]*$/.test(s)) {
			while (++position < len) {
				buffer.push(s.charCodeAt(position));
			}
		}
		else {
			while (++position < len) {
				chr = s.charCodeAt(position);
				if (chr < 128) {
					buffer.push(chr);
				}
				else if (chr < 2048) {
					buffer.push((chr >> 6) | 192, (chr & 63) | 128);
				}
				else {
					buffer.push((chr >> 12) | 224, ((chr >> 6) & 63) | 128, (chr & 63) | 128);
				}
			}
		}

		return buffer;
	}

	private static _fromUtf8(s) {
		let position = -1;
		let len;
		let buffer = [];
		let enc = [, , ,];

		if (!_lookup) {
			len = _alphabet.length;
			_lookup = {};
			while (++position < len) {
				_lookup[_alphabet[position]] = position;
			}

			position = -1;
		}

		len = s.length;
		while (position < len) {
			enc[0] = _lookup[s.charAt(++position)];
			enc[1] = _lookup[s.charAt(++position)];
			buffer.push((enc[0] << 2) | (enc[1] >> 4));

			enc[2] = _lookup[s.charAt(++position)];
			if (enc[2] == 64) {
				break;
			}

			buffer.push(((enc[1] & 15) << 4) | (enc[2] >> 2));
			enc[3] = _lookup[s.charAt(++position)];

			if (enc[3] == 64) {
				break;
			}

			buffer.push(((enc[2] & 3) << 6) | enc[3]);
		}

		return buffer;
	}
}
