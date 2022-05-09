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
 * language definition
 * x4 specific strings
 */

let fr = {
	global: {
		ok: 'OK',
		cancel: 'Annuler',
		ignore: 'Ignorer',
		yes: 'Oui',
		no: 'Non',

		open: 'Ouvrir',
		new: 'Nouveau',
		delete: 'Supprimer',
		close: 'Fermer',
		save: 'Enregistrer',

		search: 'Rechercher',
		search_tip: 'Saisissez le texte à rechercher. <b>Enter</b> pour lancer la recherche. <b>Esc</b> pour annuler.',

		required_field: "information requise",
		invalid_format: "format invalide",
		invalid_email: 'adresse mail invalide',
		invalid_number: 'valeur numérique invalide',

		diff_date_seconds: '{0} seconds',
		diff_date_minutes: '{0} minutes',
		diff_date_hours: '{0} hours',

		invalid_date: 'Date non reconnue ({0})',
		empty_list: 'Liste vide',

		date_input_formats: 'd/m/y|d.m.y|d m y|d-m-y|dmy',
		date_format: 'D/M/Y',

		day_short: [ 'dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam' ],
		day_long: [ 'dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi' ],

		month_short: [ 'jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jui', 'aoû', 'sep', 'oct', 'nov', 'déc' ],
		month_long: [ 'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre' ],

		property: 'Propriété',
		value: 'Valeur',

		err_403: `Vous n'avez pas les droits suffisants pour effectuer cette action`,

		copy: 'Copier',
		cut: 'Couper',
		paste: 'Coller'
	}
};

/** @ignore */
let en = {
	global: {
		ok: 'OK',
		cancel: 'Cancel',
		ignore: 'Ignore',
		yes: 'Yes',
		no: 'No',

		required_field: "required field",
		invalid_format: "invalid format",

		diff_date_seconds: '{0} seconds',
		diff_date_minutes: '{0} minutes',
		diff_date_hours: '{0} hours',

		invalid_date: 'Bad date format {0}',

		copy: 'Copy',
		cut: 'Cut',
		paste: 'Paste'
	}
}

/** @ignore */
let all_langs = {
	'fr': fr,
	'en': _mk_proxy( _patch( {}, en ) )
};

/**
 * current language
 * FR by default
 * @example ```typescript
 * console.log( _tr.global.ok );
 */

export let _tr: any = all_langs['fr'];

/**
 * check if the language is known
 * @param name - language name to test 
 * @example ```typescript
 * if( isLanguage('fr') ) {
 * }
 */

export function isLanguage( name ) {
	return all_langs[name]!==undefined;
}

/**
 * select the current language
 * @param name - language name
 * @example ```typescript
 * selectLanguage( 'en' );
 */

export function selectLanguage( name ) {

	if( !isLanguage(name) ) {
		return;
	}

	_tr = all_langs[name];
}

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

export function extendTranslation( name, definition ) {
	
	if( !isLanguage(name) ) {
		return;
	}

	_patch( all_langs[name], definition );
}


function _patch( obj, by ) {
	for( let n in by ) {
		if( obj[n] instanceof Object ) {
			_patch( obj[n], by[n] );
		}
		else {
			obj[n] = by[n];
			if( obj[n] instanceof Object ) {
				obj[n] = _mk_proxy( obj[n] );
			}
		}
	}

	return obj;
}

function _mk_proxy( obj: any ) : any {
	return new Proxy( obj, {
		get: function(target, prop, receiver) {
			let value = target[prop];
			if( value===undefined ) {
				return fr[prop];
			}
			return value;
		}
	});
}