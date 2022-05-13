"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendTranslation = exports.selectLanguage = exports.isLanguage = exports._tr = void 0;
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
        day_short: ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'],
        day_long: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
        month_short: ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jui', 'aoû', 'sep', 'oct', 'nov', 'déc'],
        month_long: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
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
};
/** @ignore */
let all_langs = {
    'fr': fr,
    'en': _mk_proxy(_patch({}, en))
};
/**
 * current language
 * FR by default
 * @example ```typescript
 * console.log( _tr.global.ok );
 */
exports._tr = all_langs['fr'];
/**
 * check if the language is known
 * @param name - language name to test
 * @example ```typescript
 * if( isLanguage('fr') ) {
 * }
 */
function isLanguage(name) {
    return all_langs[name] !== undefined;
}
exports.isLanguage = isLanguage;
/**
 * select the current language
 * @param name - language name
 * @example ```typescript
 * selectLanguage( 'en' );
 */
function selectLanguage(name) {
    if (!isLanguage(name)) {
        return;
    }
    exports._tr = all_langs[name];
}
exports.selectLanguage = selectLanguage;
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
function extendTranslation(name, definition) {
    if (!isLanguage(name)) {
        return;
    }
    _patch(all_langs[name], definition);
}
exports.extendTranslation = extendTranslation;
function _patch(obj, by) {
    for (let n in by) {
        if (obj[n] instanceof Object) {
            _patch(obj[n], by[n]);
        }
        else {
            obj[n] = by[n];
            if (obj[n] instanceof Object) {
                obj[n] = _mk_proxy(obj[n]);
            }
        }
    }
    return obj;
}
function _mk_proxy(obj) {
    return new Proxy(obj, {
        get: function (target, prop, receiver) {
            let value = target[prop];
            if (value === undefined) {
                return fr[prop];
            }
            return value;
        }
    });
}
