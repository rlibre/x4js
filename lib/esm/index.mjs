var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/x4dom.ts
var x4document = document;

// src/x4events.ts
var stopPropagation = /* @__PURE__ */ __name(function() {
  this.propagationStopped = true;
}, "stopPropagation");
var preventDefault = /* @__PURE__ */ __name(function() {
  this.defaultPrevented = true;
}, "preventDefault");
function BasicEvent(params) {
  return {
    stopPropagation,
    preventDefault,
    ...params
  };
}
__name(BasicEvent, "BasicEvent");
function EvClick(context = null) {
  return BasicEvent({ context });
}
__name(EvClick, "EvClick");
function EvChange(value, context = null) {
  return BasicEvent({ value, context });
}
__name(EvChange, "EvChange");
function EvSelectionChange(selection, context = null) {
  return BasicEvent({ selection, context });
}
__name(EvSelectionChange, "EvSelectionChange");
function EvContextMenu(uievent, context = null) {
  return BasicEvent({ uievent, context });
}
__name(EvContextMenu, "EvContextMenu");
function EvTimer(timer, time = 0, context = null) {
  return BasicEvent({ timer, time, context });
}
__name(EvTimer, "EvTimer");
function EvMessage(msg, params, source) {
  return BasicEvent({ msg, params, source });
}
__name(EvMessage, "EvMessage");
function EvDrag(element, data2, ctx) {
  return BasicEvent({ element, data: data2, context: ctx });
}
__name(EvDrag, "EvDrag");
function EvError(code, message) {
  return BasicEvent({ code, message });
}
__name(EvError, "EvError");
var EventSource = class {
  m_source;
  m_eventRegistry;
  m_defaultHandlers;
  constructor(source = null) {
    this.m_source = source ?? this;
  }
  /**
   * emit an event
   * you can stop propagation of event or prevent default
   * @param eventName - name of event to emit
   * @param event - event data 
   */
  emit(type, event) {
    this._emit(type, event);
  }
  _emit(eventName, e) {
    let listeners = this.m_eventRegistry?.get(eventName);
    const defaultHandler = this.m_defaultHandlers?.get(eventName);
    if (!e) {
      e = {};
    }
    if (!e.source) {
      e.source = this.m_source;
    }
    if (!e.type) {
      e.type = eventName;
    }
    if (listeners && listeners.length) {
      if (!e.preventDefault) {
        e.preventDefault = preventDefault;
      }
      if (!e.stopPropagation) {
        e.stopPropagation = stopPropagation;
      }
      if (listeners.length == 1) {
        listeners[0](e);
      } else {
        const temp = listeners.slice();
        for (let i = 0, n = temp.length; i < n; i++) {
          temp[i](e);
          if (e.propagationStopped) {
            break;
          }
        }
      }
    }
    if (defaultHandler && defaultHandler.length && !e.defaultPrevented) {
      return defaultHandler[0](e);
    }
  }
  /**
   * signal en event
   * signaled event are notification : no way to prevent default not stop propagation
   * @param eventName name of event to signal
   * @param event event data 
   */
  signal(type, event, delay = -1) {
    this._signal(type, event, delay);
  }
  _signal(eventName, e, delay = -1) {
    if (!this.m_eventRegistry) {
      return;
    }
    const listeners = this.m_eventRegistry.get(eventName);
    if (!listeners || !listeners.length) {
      return;
    }
    if (!e) {
      e = {};
    }
    if (!e.type) {
      e.type = eventName;
    }
    if (!e.source) {
      e.source = this.m_source;
    }
    e.preventDefault = e.stopPropagation = () => {
      console.error("this event cannot be stopped not default prevented");
    };
    if (listeners.length == 1 && delay == -1) {
      listeners[0](e);
    } else {
      const temp = listeners.slice();
      const call = /* @__PURE__ */ __name(() => {
        for (let i = 0, n = temp.length; i < n; i++) {
          temp[i](e);
        }
      }, "call");
      if (delay == -1) {
        call();
      } else {
        setTimeout(call, delay);
      }
    }
  }
  /**
   * handle an event one time
   * @param eventName - event name to handle
   * @param callback - callback to call when event is signaled
   * @returns Promise if callback is null
   * 
   * take care with that because if the event is never fired and you await it,
   * the system may overflow
   */
  once(type, callback) {
    this._once(type, callback);
  }
  _once(eventName, callback) {
    const newCallback = /* @__PURE__ */ __name((ev) => {
      this._off(eventName, newCallback);
      callback(ev);
    }, "newCallback");
    this._on(eventName, newCallback);
    if (!callback) {
      return new Promise(function(resolve) {
        callback = resolve;
      });
    }
  }
  /**
   * set the event default handler
   * @param eventName - name of the event
   * @param callback - callback to call when the event is not handled (and preventDeault has not been called)
   */
  setDefaultHandler(eventName, callback) {
    let handlers = this.m_defaultHandlers;
    if (!handlers) {
      handlers = this.m_defaultHandlers = /* @__PURE__ */ new Map();
    }
    let stack = handlers.get(eventName);
    if (stack) {
      const idx = stack.indexOf(callback);
      if (idx != -1) {
        stack.splice(idx, 1);
      }
      stack.unshift(callback);
    } else {
      handlers.set(eventName, [callback]);
    }
  }
  /**
   * remove the previous default handler installed for an event
   * @param eventName - event name
   * @param callback - callback handler to remove (must be the same as in setDefaultHandler)
   */
  removeDefaultHandler(eventName, callback) {
    const handlers = this.m_defaultHandlers;
    if (!handlers) {
      return;
    }
    const stack = handlers.get(eventName);
    if (stack) {
      const idx = stack.indexOf(callback);
      if (idx != -1) {
        stack.splice(idx, 1);
      }
    }
  }
  /**
   * define a set of listeners in one call
   * @param events 
   */
  listen(events) {
    for (let n in events) {
      this._on(n, events[n]);
    }
  }
  /**
   * define a set of default handlers in one call
   * @param events 
   */
  defaults(events) {
    for (let n in events) {
      this.setDefaultHandler(n, events[n]);
    }
  }
  /**
   * listen for an event
   * @param eventName - event name to listen on
   * @param callback - callback to call
   * @param capturing - if true, capture event before other registred event handlers
   */
  on(type, callback) {
    return this._on(type, callback);
  }
  _on(eventName, callback, capturing = false) {
    if (!this.m_eventRegistry) {
      this.m_eventRegistry = /* @__PURE__ */ new Map();
    }
    let listeners = this.m_eventRegistry.get(eventName);
    if (!listeners) {
      listeners = [];
      this.m_eventRegistry.set(eventName, listeners);
    }
    if (listeners.indexOf(callback) == -1) {
      if (capturing) {
        listeners.unshift(callback);
      } else {
        listeners.push(callback);
      }
    }
    return {
      dispose: () => {
        this._off(eventName, callback);
      }
    };
  }
  /**
   * stop listening to an event
   * @param eventName - event name
   * @param callback - callback to remove (must be the same as in on )
   */
  off(type, callback) {
    return this._off(type, callback);
  }
  _off(eventName, callback) {
    if (!this.m_eventRegistry) {
      return;
    }
    let listeners = this.m_eventRegistry.get(eventName);
    if (!listeners) {
      return;
    }
    const idx = listeners.indexOf(callback);
    if (idx !== -1) {
      listeners.splice(idx, 1);
    }
  }
  /**
   * remove all listeners for an event
   * @param eventName - event name 
   */
  removeAllListeners(eventName) {
    if (!eventName) {
      this.m_eventRegistry = this.m_defaultHandlers = void 0;
    } else {
      if (this.m_eventRegistry) {
        this.m_eventRegistry[eventName] = void 0;
      }
      if (this.m_defaultHandlers) {
        this.m_defaultHandlers[eventName] = void 0;
      }
    }
  }
};
__name(EventSource, "EventSource");

// src/base_component.ts
var BaseComponent = class extends EventSource {
  m_props;
  #m_timers;
  constructor(props) {
    super();
    this.m_props = props;
    if (props.events) {
      this.listen(props.events);
    }
  }
  /**
   * start a new timer
   * @param name timer name 
   * @param timeout time out in ms
   * @param repeat if true this is an auto repeat timer
   * @param callback if !null, the callback to call else a EvTimer is fired
   */
  startTimer(name, timeout, repeat = true, callback = null) {
    if (!this.#m_timers) {
      this.#m_timers = /* @__PURE__ */ new Map();
    } else {
      this.stopTimer(name);
    }
    const id = (repeat ? setInterval : setTimeout)((tm) => {
      if (callback) {
        callback(name, tm);
      } else {
        this.emit("timer", EvTimer(name, tm));
      }
    }, timeout);
    this.#m_timers.set(name, () => {
      (repeat ? clearInterval : clearTimeout)(id);
    });
  }
  /**
   * stop the given timer
   * @param name 
   */
  stopTimer(name) {
    const clear = this.#m_timers.get(name);
    if (clear) {
      clear();
    }
  }
  /**
   * stop all timers
   */
  disposeTimers() {
    this.#m_timers?.forEach((v) => v());
    this.#m_timers = void 0;
  }
  /**
   * 
   * @param callback 
   * @param timeout 
   */
  singleShot(callback, timeout = 0) {
    setTimeout(callback, timeout);
  }
  /**
   * 
   * @param props 
   * @param elements 
   */
  mapPropEvents(props, ...elements) {
    elements.forEach((name) => {
      const n = name;
      if (props[n]) {
        this._on(n, props[n]);
      }
    });
  }
};
__name(BaseComponent, "BaseComponent");

// src/i18n.ts
var sym_lang = Symbol("i18n");
var languages = {};
function createLanguage(name, base) {
  languages[name] = {
    name,
    base,
    src_translations: {},
    translations: {}
  };
}
__name(createLanguage, "createLanguage");
function isLanguage(name) {
  return languages[name] !== void 0;
}
__name(isLanguage, "isLanguage");
function addTranslation(name, ...parts) {
  if (!isLanguage(name)) {
    return;
  }
  const lang = languages[name];
  parts.forEach((p) => {
    _patch(lang.src_translations, p);
  });
  lang.translations = _proxyfy(lang.src_translations, lang.base, true);
}
__name(addTranslation, "addTranslation");
function _patch(obj, by) {
  for (let n in by) {
    const src = by[n];
    if (typeof src === "string") {
      obj[n] = src;
    } else {
      if (Array.isArray(src) && (!obj[n] || !Array.isArray(obj[n]))) {
        obj[n] = [...src];
      } else if (!obj[n] || typeof obj[n] !== "object") {
        obj[n] = { ...src };
      } else {
        _patch(obj[n], by[n]);
      }
    }
  }
}
__name(_patch, "_patch");
function _proxyfy(obj, base, root) {
  const result = {};
  for (const n in obj) {
    if (typeof obj[n] !== "string" && !Array.isArray(obj[n])) {
      result[n] = _proxyfy(obj[n], base, false);
    } else {
      result[n] = obj[n];
    }
  }
  return _mk_proxy(result, base, root);
}
__name(_proxyfy, "_proxyfy");
function _mk_proxy(obj, base, root) {
  return new Proxy(obj, {
    get: (target, prop) => {
      if (root) {
        req_path = [prop];
      } else {
        req_path.push(prop);
      }
      let value = target[prop];
      if (value === void 0 && base) {
        value = _findBaseTrans(base);
      }
      return value;
    }
  });
}
__name(_mk_proxy, "_mk_proxy");
var req_path;
function _findBaseTrans(base) {
  while (base) {
    const lang = languages[base];
    let trans = lang.translations;
    let value;
    for (const p of req_path) {
      value = trans[p];
      if (value === void 0) {
        break;
      }
      trans = value;
    }
    if (value !== void 0) {
      return trans;
    }
    base = lang.base;
  }
  console.error("I18N error: unable to find", "_tr." + req_path.join("."));
  return void 0;
}
__name(_findBaseTrans, "_findBaseTrans");
var _tr = {};
function selectLanguage(name) {
  if (!isLanguage(name)) {
    return;
  }
  _tr = languages[name].translations;
  _tr[sym_lang] = name;
  return _tr;
}
__name(selectLanguage, "selectLanguage");
function getCurrentLanguage() {
  return _tr[sym_lang];
}
__name(getCurrentLanguage, "getCurrentLanguage");
function getAvailableLanguages() {
  return Object.keys(languages);
}
__name(getAvailableLanguages, "getAvailableLanguages");
var fr = {
  global: {
    ok: "OK",
    cancel: "Annuler",
    ignore: "Ignorer",
    yes: "Oui",
    no: "Non",
    open: "Ouvrir",
    new: "Nouveau",
    delete: "Supprimer",
    close: "Fermer",
    save: "Enregistrer",
    search: "Rechercher",
    search_tip: "Saisissez le texte \xE0 rechercher. <b>Enter</b> pour lancer la recherche. <b>Esc</b> pour annuler.",
    required_field: "information requise",
    invalid_format: "format invalide",
    invalid_email: "adresse mail invalide",
    invalid_number: "valeur num\xE9rique invalide",
    diff_date_seconds: "{0} secondes",
    diff_date_minutes: "{0} minutes",
    diff_date_hours: "{0} heures",
    invalid_date: "Date non reconnue ({0})",
    empty_list: "Liste vide",
    date_input_formats: "d/m/y|d.m.y|d m y|d-m-y|dmy",
    date_format: "D/M/Y",
    day_short: ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"],
    day_long: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
    month_short: ["jan", "f\xE9v", "mar", "avr", "mai", "jun", "jui", "ao\xFB", "sep", "oct", "nov", "d\xE9c"],
    month_long: ["janvier", "f\xE9vrier", "mars", "avril", "mai", "juin", "juillet", "ao\xFBt", "septembre", "octobre", "novembre", "d\xE9cembre"],
    property: "Propri\xE9t\xE9",
    value: "Valeur",
    err_403: `Vous n'avez pas les droits suffisants pour effectuer cette action`,
    copy: "Copier",
    cut: "Couper",
    paste: "Coller"
  }
};
var en = {
  global: {
    ok: "OK",
    cancel: "Cancel",
    ignore: "Ignore",
    yes: "Yes",
    no: "No",
    open: "Open",
    new: "New",
    delete: "Delete",
    close: "Close",
    save: "Save",
    search: "Search",
    search_tip: "Type in the text to search. <b>Enter</b> to start the search. <b>Esc</b> to cancel.",
    required_field: "missing information",
    invalid_format: "invalid format",
    invalid_email: "invalid email address",
    invalid_number: "bad numeric value",
    diff_date_seconds: "{0} seconds",
    diff_date_minutes: "{0} minutes",
    diff_date_hours: "{0} hours",
    invalid_date: "Unrecognized date({0})",
    empty_list: "Empty list",
    date_input_formats: "m/d/y|m.d.y|m d y|m-d-y|mdy",
    date_format: "M/D/Y",
    day_short: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
    day_long: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    month_short: ["jan", "feb", "mar", "apr", "may", "jun", "jui", "aug", "sep", "oct", "nov", "dec"],
    month_long: ["january", "february", "march", "april", "mau", "june", "jully", "august", "september", "october", "november", "december"],
    property: "Property",
    value: "Value",
    err_403: `You do not have sufficient rights to do that action`,
    copy: "Copy",
    cut: "Cut",
    paste: "Paste"
  }
};
createLanguage("fr", null);
addTranslation("fr", fr);
createLanguage("en", "fr");
addTranslation("en", en);
selectLanguage("fr");

// src/tools.ts
function isTouchDevice() {
  return "ontouchstart" in window;
}
__name(isTouchDevice, "isTouchDevice");
function roundTo(num2, ndec) {
  let mul = Math.pow(10, ndec);
  let res = Math.round(num2 * mul) / mul;
  if (Object.is(res, -0)) {
    res = 0;
  }
  return res;
}
__name(roundTo, "roundTo");
function parseIntlFloat(num2) {
  num2 = num2.replace(/\s*/g, "");
  num2 = num2.replace(",", ".");
  if (num2.length == 0) {
    return 0;
  }
  return parseFloat(num2);
}
__name(parseIntlFloat, "parseIntlFloat");
function pascalCase(string) {
  let result = string;
  result = result.replace(/([a-z])([A-Z])/g, "$1 $2");
  result = result.toLowerCase();
  result = result.replace(/[^- a-z0-9]+/g, " ");
  if (result.indexOf(" ") < 0) {
    return result;
  }
  result = result.trim();
  return result.replace(/ /g, "-");
}
__name(pascalCase, "pascalCase");
function camelCase(text) {
  let result = text.toLowerCase();
  result = result.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => {
    return chr.toUpperCase();
  });
  return result;
}
__name(camelCase, "camelCase");
var Point = class {
  x;
  y;
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
};
__name(Point, "Point");
var Size = class {
  width;
  height;
  constructor(w = 0, h = 0) {
    this.width = w;
    this.height = h;
  }
};
__name(Size, "Size");
var Rect = class {
  left;
  top;
  width;
  height;
  constructor(left, top, width, height) {
    if (left === void 0) {
      this.left = this.top = this.right = this.bottom = 0;
    } else if (left instanceof Rect || left instanceof DOMRect) {
      let rc = left;
      this.left = rc.left;
      this.top = rc.top;
      this.width = rc.width;
      this.height = rc.height;
    } else {
      this.left = left;
      this.top = top;
      this.width = width;
      this.height = height;
    }
  }
  set(left, top, width, height) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
  }
  get bottom() {
    return this.top + this.height;
  }
  set bottom(bottom) {
    this.height = bottom - this.top;
  }
  get right() {
    return this.left + this.width;
  }
  set right(right) {
    this.width = right - this.left;
  }
  get topLeft() {
    return new Point(this.left, this.top);
  }
  get bottomRight() {
    return new Point(this.right, this.bottom);
  }
  get size() {
    return new Size(this.width, this.height);
  }
  moveTo(left, top) {
    this.left = left;
    this.top = top;
    return this;
  }
  movedTo(left, top) {
    return new Rect(left, top, this.width, this.height);
  }
  moveBy(dx, dy) {
    this.left += dx;
    this.top += dy;
    return this;
  }
  movedBy(dx, dy) {
    return new Rect(this.left + dx, this.top + dy, this.width, this.height);
  }
  isEmpty() {
    return this.width == 0 && this.height == 0;
  }
  normalize() {
    let w = this.width, h = this.height;
    if (w < 0) {
      this.left += w;
      this.width = -w;
    }
    if (h < 0) {
      this.top += h;
      this.height = -h;
    }
    return this;
  }
  normalized() {
    let rc = new Rect(this);
    let w = rc.width, h = rc.height;
    if (w < 0) {
      rc.left += w;
      rc.width = -w;
    }
    if (h < 0) {
      rc.top += h;
      rc.height = -h;
    }
    return rc;
  }
  /**
   * @deprecated
   */
  containsPt(x, y) {
    return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
  }
  contains(arg) {
    if (arg instanceof Rect) {
      return arg.left >= this.left && arg.right <= this.right && arg.top >= this.top && arg.bottom <= this.bottom;
    } else {
      return arg.x >= this.left && arg.x < this.right && arg.y >= this.top && arg.y < this.bottom;
    }
  }
  touches(rc) {
    if (this.left > rc.right || this.right < rc.left || this.top > rc.bottom || this.bottom < rc.top) {
      return false;
    }
    return true;
  }
  inflate(dx, dy) {
    if (dy === void 0) {
      dy = dx;
    }
    this.left -= dx;
    this.top -= dy;
    this.width += dx + dx;
    this.height += dy + dy;
  }
  inflatedBy(dx, dy) {
    if (dy === void 0) {
      dy = dx;
    }
    return new Rect(this.left - dx, this.top - dy, this.width + dx + dx, this.height + dy + dy);
  }
  combine(rc) {
    let left = Math.min(this.left, rc.left);
    let top = Math.min(this.top, rc.top);
    let right = Math.max(this.right, rc.right);
    let bottom = Math.max(this.bottom, rc.bottom);
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
  }
};
__name(Rect, "Rect");
function sprintf(format, ...args) {
  return format.replace(/{(\d+)}/g, function(match, index) {
    return typeof args[index] != "undefined" ? args[index] : match;
  });
}
__name(sprintf, "sprintf");
function escapeHtml(unsafe, nl_br = false) {
  if (!unsafe || unsafe.length == 0) {
    return "";
  }
  let result = unsafe.replace(/[<>\&\"\']/g, function(c) {
    return "&#" + c.charCodeAt(0) + ";";
  });
  if (nl_br) {
    result = result.replace(/(\r\n|\n\r|\r|\n)/g, "<br/>");
  }
  return result;
}
__name(escapeHtml, "escapeHtml");
function removeHtmlTags(unsafe, nl_br = false) {
  if (unsafe === void 0 || unsafe === null || !isString(unsafe) || unsafe.length == 0) {
    return "";
  }
  let ret_val = "";
  for (let i = 0; i < unsafe.length; i++) {
    const ch = unsafe.codePointAt(i);
    if (ch > 127) {
      ret_val += "&#" + ch + ";";
    } else if (ch == 60) {
      ret_val += "&lt;";
    } else {
      ret_val += unsafe.charAt(i);
    }
  }
  return ret_val;
}
__name(removeHtmlTags, "removeHtmlTags");
var cur_locale = "fr-FR";
function _date_set_locale(locale2) {
  cur_locale = locale2;
}
__name(_date_set_locale, "_date_set_locale");
function date_format(date, options) {
  return formatIntlDate(date);
}
__name(date_format, "date_format");
function date_diff(date1, date2, options) {
  var dt = (date1.getTime() - date2.getTime()) / 1e3;
  let sec = dt;
  if (sec < 60) {
    return sprintf(_tr.global.diff_date_seconds, Math.round(sec));
  }
  let min = Math.floor(sec / 60);
  if (min < 60) {
    return sprintf(_tr.global.diff_date_minutes, Math.round(min));
  }
  let hrs = Math.floor(min / 60);
  return sprintf(_tr.global.diff_date_hours, hrs, min % 60);
}
__name(date_diff, "date_diff");
function date_to_sql(date, withHours) {
  if (withHours) {
    return formatIntlDate(date, "Y-M-D H:I:S");
  } else {
    return formatIntlDate(date, "Y-M-D");
  }
}
__name(date_to_sql, "date_to_sql");
function date_sql_utc(date) {
  let result = /* @__PURE__ */ new Date(date + " GMT");
  return result;
}
__name(date_sql_utc, "date_sql_utc");
function date_hash(date) {
  return date.getFullYear() << 16 | date.getMonth() << 8 | date.getDate();
}
__name(date_hash, "date_hash");
Date.prototype.hash = function() {
  return date_hash(this);
};
function date_clone(date) {
  return new Date(date.getTime());
}
__name(date_clone, "date_clone");
function date_calc_weeknum(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.valueOf() - firstDayOfYear.valueOf()) / 864e5;
  return Math.floor((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
__name(date_calc_weeknum, "date_calc_weeknum");
function parseIntlDate(value, fmts = _tr.global.date_input_formats) {
  let formats = fmts.split("|");
  for (let fmatch of formats) {
    let smatch = "";
    for (let c of fmatch) {
      if (c == "d" || c == "D") {
        smatch += "(?<day>\\d{1,2})";
      } else if (c == "m" || c == "M") {
        smatch += "(?<month>\\d{1,2})";
      } else if (c == "y" || c == "Y") {
        smatch += "(?<year>\\d{1,4})";
      } else if (c == "h" || c == "H") {
        smatch += "(?<hour>\\d{1,2})";
      } else if (c == "i" || c == "I") {
        smatch += "(?<min>\\d{1,2})";
      } else if (c == "s" || c == "S") {
        smatch += "(?<sec>\\d{1,2})";
      } else if (c == " ") {
        smatch += "\\s+";
      } else {
        smatch += "\\s*\\" + c + "\\s*";
      }
    }
    let rematch = new RegExp("^" + smatch + "$", "m");
    let match = rematch.exec(value);
    if (match) {
      const now = /* @__PURE__ */ new Date();
      let d = parseInt(match.groups.day ?? "1");
      let m = parseInt(match.groups.month ?? "1");
      let y = parseInt(match.groups.year ?? now.getFullYear() + "");
      let h = parseInt(match.groups.hour ?? "0");
      let i = parseInt(match.groups.min ?? "0");
      let s = parseInt(match.groups.sec ?? "0");
      if (y > 0 && y < 100) {
        y += 2e3;
      }
      let result = new Date(y, m - 1, d, h, i, s, 0);
      let ty = result.getFullYear(), tm = result.getMonth() + 1, td = result.getDate();
      if (ty != y || tm != m || td != d) {
        return null;
      }
      return result;
    }
  }
  return null;
}
__name(parseIntlDate, "parseIntlDate");
function formatIntlDate(date, fmt = _tr.global.date_format) {
  if (!date) {
    return "";
  }
  let now = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    wday: date.getDay(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
    milli: date.getMilliseconds()
  };
  let result = "";
  let esc = 0;
  for (let c of fmt) {
    if (c == "{") {
      if (++esc == 1) {
        continue;
      }
    } else if (c == "}") {
      if (--esc == 0) {
        continue;
      }
    }
    if (esc) {
      result += c;
      continue;
    }
    if (c == "d") {
      result += now.day;
    } else if (c == "D") {
      result += pad(now.day, -2);
    } else if (c == "j") {
      result += _tr.global.day_short[now.wday];
    } else if (c == "J") {
      result += _tr.global.day_long[now.wday];
    } else if (c == "w") {
      result += date_calc_weeknum(date);
    } else if (c == "W") {
      result += pad(date_calc_weeknum(date), -2);
    } else if (c == "m") {
      result += now.month;
    } else if (c == "M") {
      result += pad(now.month, -2);
    } else if (c == "o") {
      result += _tr.global.month_short[now.month - 1];
    } else if (c == "O") {
      result += _tr.global.month_long[now.month - 1];
    } else if (c == "y" || c == "Y") {
      result += pad(now.year, -4);
    } else if (c == "a" || c == "A") {
      result += now.hours < 12 ? "am" : "pm";
    } else if (c == "h") {
      result += now.hours;
    } else if (c == "H") {
      result += pad(now.hours, -2);
    } else if (c == "i") {
      result += now.minutes;
    } else if (c == "I") {
      result += pad(now.minutes, -2);
    } else if (c == "s") {
      result += now.seconds;
    } else if (c == "S") {
      result += pad(now.seconds, -2);
    } else if (c == "l") {
      result += now.milli;
    } else if (c == "L") {
      result += pad(now.milli, -3);
    } else {
      result += c;
    }
  }
  return result;
}
__name(formatIntlDate, "formatIntlDate");
function calcAge(birth, ref) {
  if (ref === void 0) {
    ref = /* @__PURE__ */ new Date();
  }
  if (!birth) {
    return 0;
  }
  let age = ref.getFullYear() - birth.getFullYear();
  if (ref.getMonth() < birth.getMonth() || ref.getMonth() == birth.getMonth() && ref.getDate() < birth.getDate()) {
    age--;
  }
  return age;
}
__name(calcAge, "calcAge");
Date.prototype.isSameDay = function(date) {
  return this.getDate() == date.getDate() && this.getMonth() == date.getMonth() && this.getFullYear() == date.getFullYear();
};
Date.prototype.hash = function() {
  return date_hash(this);
};
Date.prototype.clone = function() {
  return date_clone(this);
};
Date.prototype.weekNum = function() {
  return date_calc_weeknum(this);
};
Date.prototype.format = function(fmt) {
  return formatIntlDate(this, fmt);
};
Date.prototype.addDays = function(days) {
  this.setDate(this.getDate() + days);
  return this;
};
function downloadData(data2, mimetype, filename) {
  let blob = new Blob([data2], { type: mimetype });
  let url = window.URL.createObjectURL(blob);
  let a = x4document.createElement("a");
  a.style["display"] = "none";
  a.href = url;
  a.download = filename;
  x4document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
}
__name(downloadData, "downloadData");
function isString(val) {
  return typeof val === "string";
}
__name(isString, "isString");
function isArray(val) {
  return val instanceof Array;
}
__name(isArray, "isArray");
function isFunction(val) {
  return val instanceof Function;
}
__name(isFunction, "isFunction");
function isLiteralObject(val) {
  return !!val && val.constructor === Object;
}
__name(isLiteralObject, "isLiteralObject");
function pad(what, size, ch = "0") {
  let value;
  if (!isString(what)) {
    value = "" + what;
  } else {
    value = what;
  }
  if (size > 0) {
    return value.padEnd(size, ch);
  } else {
    return value.padStart(-size, ch);
  }
}
__name(pad, "pad");
function isNumber(val) {
  return typeof val === "number" && isFinite(val);
}
__name(isNumber, "isNumber");
function waitFontLoading(name) {
  let ct = x4document.createElement("div");
  ct.style.position = "absolute";
  ct.style.fontFamily = name;
  ct.style.fontSize = "44px";
  ct.style.opacity = "0.001";
  ct.innerText = "X";
  x4document.body.appendChild(ct);
  return new Promise((resolve) => {
    let irc = ct.getBoundingClientRect();
    let tm = setInterval(() => {
      let nrc = ct.getBoundingClientRect();
      if (nrc.height != irc.height) {
        clearInterval(tm);
        x4document.body.removeChild(ct);
        resolve();
      }
    }, 0);
  });
}
__name(waitFontLoading, "waitFontLoading");
function deferCall(fn, tm = 0, ...args) {
  setTimeout(fn, tm, ...args);
}
__name(deferCall, "deferCall");
function asap(cb) {
  requestAnimationFrame(cb);
}
__name(asap, "asap");
function markdownToHtml(text) {
  if (!text) {
    return "";
  }
  let lines = text.split("\n");
  let state = "para";
  let div = "p";
  let result = [];
  lines.forEach((l) => {
    let txt = l.trim();
    if (state == "para") {
      if (txt[0] == "-") {
        txt = txt.substr(1);
        result.push("<ul>");
        state = "list";
        div = "li";
      } else if (txt[0] == ">") {
        txt = txt.substr(1);
        result.push("<blockquote>");
        state = "quote";
        div = "p";
      } else if (txt[0] == "#") {
        let lvl = 0;
        do {
          txt = txt.substr(1);
          lvl++;
        } while (txt[0] == "#" && lvl < 5);
        div = "h" + lvl;
        state = "title";
      }
    } else if (state == "list") {
      if (txt[0] != "-") {
        result.push("</ul>");
        state = "para";
        div = "p";
      } else {
        txt = txt.substr(1);
      }
    } else if (state == "quote") {
      if (txt[0] != ">") {
        result.push("</blockquote>");
        state = "para";
        div = "p";
      } else {
        txt = txt.substr(1);
      }
    }
    let reBold = /\*\*([^*]+)\*\*/gi;
    txt = escapeHtml(txt, false);
    txt = txt.replace(reBold, (sub, ...a) => {
      return "<b>" + sub.substr(2, sub.length - 4) + "</b>";
    });
    let reItalic = /\*([^*]+)\*/gi;
    txt = txt.replace(reItalic, (sub, ...a) => {
      return "<i>" + sub.substr(1, sub.length - 2) + "</i>";
    });
    if (txt == "") {
      txt = "&nbsp;";
    }
    result.push(`<${div}>` + txt + `</${div}>`);
    if (state == "title") {
      state = "para";
      div = "p";
    }
  });
  if (state == "list") {
    result.push("</ul>");
  } else if (state == "quote") {
    result.push("</blockquote>");
  }
  return result.join("");
}
__name(markdownToHtml, "markdownToHtml");
var NetworkError = class extends Error {
  m_code;
  constructor(a, b) {
    if (a instanceof Response) {
      super(a.statusText);
      this.m_code = a.status;
    } else {
      super(b);
      this.m_code = a;
    }
  }
  get code() {
    return this.m_code;
  }
};
__name(NetworkError, "NetworkError");
function getMousePos(ev, fromDoc) {
  let x_name = "offsetX", y_name = "offsetY";
  if (fromDoc) {
    x_name = "clientX";
    y_name = "clientY";
  }
  if (ev.type == "mousemove" || ev.type == "mousedown" || ev.type == "mouseup") {
    let em = ev;
    return new Point(em[x_name], em[y_name]);
  } else if (ev.type == "pointermove" || ev.type == "pointerdown" || ev.type == "pointerup") {
    let em = ev;
    return new Point(em[x_name], em[y_name]);
  } else if (ev.type == "touchmove" || ev.type == "touchstart") {
    let et = ev;
    return new Point(et.touches[0][x_name], et.touches[0][y_name]);
  } else if (ev.type == "contextmenu") {
    let em = ev;
    return new Point(em[x_name], em[y_name]);
  } else {
    return new Point(0, 0);
  }
}
__name(getMousePos, "getMousePos");
function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}
__name(clamp, "clamp");
var HtmlString = class extends String {
  constructor(text) {
    super(text);
  }
  static from(text) {
    return new HtmlString(text);
  }
};
__name(HtmlString, "HtmlString");
function html(a, ...b) {
  return HtmlString.from(String.raw(a, ...b));
}
__name(html, "html");
function isHtmlString(val) {
  return val instanceof HtmlString;
}
__name(isHtmlString, "isHtmlString");
var Clipboard = class {
  static copy(data2) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(data2));
    }
  }
  static paste(cb) {
    if (navigator.clipboard) {
      navigator.clipboard.readText().then((v) => cb(v));
    } else {
      console.error("no clipboard, are you in https ?");
    }
  }
};
__name(Clipboard, "Clipboard");
function crc32(str) {
  let crc = ~0;
  let buf = Buffer.from(str);
  let i = 0, l = buf.length;
  while (i < l) {
    crc = crc >>> 8 ^ crc32tab[(crc ^ buf[i]) & 255];
    i++;
  }
  return (crc ^ -1) >>> 0;
}
__name(crc32, "crc32");
var crc32tab = new Int32Array([
  0,
  1996959894,
  3993919788,
  2567524794,
  124634137,
  1886057615,
  3915621685,
  2657392035,
  249268274,
  2044508324,
  3772115230,
  2547177864,
  162941995,
  2125561021,
  3887607047,
  2428444049,
  498536548,
  1789927666,
  4089016648,
  2227061214,
  450548861,
  1843258603,
  4107580753,
  2211677639,
  325883990,
  1684777152,
  4251122042,
  2321926636,
  335633487,
  1661365465,
  4195302755,
  2366115317,
  997073096,
  1281953886,
  3579855332,
  2724688242,
  1006888145,
  1258607687,
  3524101629,
  2768942443,
  901097722,
  1119000684,
  3686517206,
  2898065728,
  853044451,
  1172266101,
  3705015759,
  2882616665,
  651767980,
  1373503546,
  3369554304,
  3218104598,
  565507253,
  1454621731,
  3485111705,
  3099436303,
  671266974,
  1594198024,
  3322730930,
  2970347812,
  795835527,
  1483230225,
  3244367275,
  3060149565,
  1994146192,
  31158534,
  2563907772,
  4023717930,
  1907459465,
  112637215,
  2680153253,
  3904427059,
  2013776290,
  251722036,
  2517215374,
  3775830040,
  2137656763,
  141376813,
  2439277719,
  3865271297,
  1802195444,
  476864866,
  2238001368,
  4066508878,
  1812370925,
  453092731,
  2181625025,
  4111451223,
  1706088902,
  314042704,
  2344532202,
  4240017532,
  1658658271,
  366619977,
  2362670323,
  4224994405,
  1303535960,
  984961486,
  2747007092,
  3569037538,
  1256170817,
  1037604311,
  2765210733,
  3554079995,
  1131014506,
  879679996,
  2909243462,
  3663771856,
  1141124467,
  855842277,
  2852801631,
  3708648649,
  1342533948,
  654459306,
  3188396048,
  3373015174,
  1466479909,
  544179635,
  3110523913,
  3462522015,
  1591671054,
  702138776,
  2966460450,
  3352799412,
  1504918807,
  783551873,
  3082640443,
  3233442989,
  3988292384,
  2596254646,
  62317068,
  1957810842,
  3939845945,
  2647816111,
  81470997,
  1943803523,
  3814918930,
  2489596804,
  225274430,
  2053790376,
  3826175755,
  2466906013,
  167816743,
  2097651377,
  4027552580,
  2265490386,
  503444072,
  1762050814,
  4150417245,
  2154129355,
  426522225,
  1852507879,
  4275313526,
  2312317920,
  282753626,
  1742555852,
  4189708143,
  2394877945,
  397917763,
  1622183637,
  3604390888,
  2714866558,
  953729732,
  1340076626,
  3518719985,
  2797360999,
  1068828381,
  1219638859,
  3624741850,
  2936675148,
  906185462,
  1090812512,
  3747672003,
  2825379669,
  829329135,
  1181335161,
  3412177804,
  3160834842,
  628085408,
  1382605366,
  3423369109,
  3138078467,
  570562233,
  1426400815,
  3317316542,
  2998733608,
  733239954,
  1555261956,
  3268935591,
  3050360625,
  752459403,
  1541320221,
  2607071920,
  3965973030,
  1969922972,
  40735498,
  2617837225,
  3943577151,
  1913087877,
  83908371,
  2512341634,
  3803740692,
  2075208622,
  213261112,
  2463272603,
  3855990285,
  2094854071,
  198958881,
  2262029012,
  4057260610,
  1759359992,
  534414190,
  2176718541,
  4139329115,
  1873836001,
  414664567,
  2282248934,
  4279200368,
  1711684554,
  285281116,
  2405801727,
  4167216745,
  1634467795,
  376229701,
  2685067896,
  3608007406,
  1308918612,
  956543938,
  2808555105,
  3495958263,
  1231636301,
  1047427035,
  2932959818,
  3654703836,
  1088359270,
  936918e3,
  2847714899,
  3736837829,
  1202900863,
  817233897,
  3183342108,
  3401237130,
  1404277552,
  615818150,
  3134207493,
  3453421203,
  1423857449,
  601450431,
  3009837614,
  3294710456,
  1567103746,
  711928724,
  3020668471,
  3272380065,
  1510334235,
  755167117
]);
var mix = /* @__PURE__ */ __name((superclass) => new MixinBuilder(superclass), "mix");
var MixinBuilder = class {
  superclass;
  constructor(superclass) {
    this.superclass = superclass;
  }
  with(...mixins) {
    return mixins.reduce((c, mixin) => mixin(c), this.superclass);
  }
};
__name(MixinBuilder, "MixinBuilder");
function classNames(...args) {
  let result = "";
  for (const cls of args) {
    if (typeof cls === "string") {
      result += " " + cls;
    } else if (cls) {
      for (const c in cls) {
        if (cls[c])
          result += " " + c;
      }
    }
  }
  return result;
}
__name(classNames, "classNames");
function generatePassword(length, rules) {
  if (!length || length == void 0) {
    length = 8;
  }
  if (!rules) {
    rules = [
      { chars: "abcdefghijklmnopqrstuvwxyz", min: 3 },
      // As least 3 lowercase letters
      { chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", min: 2 },
      // At least 2 uppercase letters
      { chars: "0123456789", min: 2 },
      // At least 2 digits
      { chars: "!@#$*|%+-_.;", min: 2 }
      // At least 1 special char
    ];
  }
  let allChars = "";
  let allMin = 0;
  rules.forEach(function(rule) {
    allChars += rule.chars;
    allMin += rule.min;
  });
  if (length < allMin) {
    length = allMin;
  }
  rules.push({ chars: allChars, min: length - allMin });
  let pswd = "";
  rules.forEach(function(rule) {
    if (rule.min > 0) {
      pswd += shuffle(rule.chars, rule.min);
    }
  });
  return shuffle(pswd);
}
__name(generatePassword, "generatePassword");
function shuffle(str, maxlength) {
  let shuffled = str.split("").sort(() => {
    return 0.5 - Math.random();
  }).join("");
  if (maxlength > 0) {
    shuffled = shuffled.substr(0, maxlength);
  }
  return shuffled;
}
__name(shuffle, "shuffle");
function installHMR(host = "127.0.0.1", port = "9876", reloadCallback) {
  let tm;
  function refreshCSS() {
    document.body.style.visibility = "hidden";
    let sheets = [].slice.call(document.getElementsByTagName("link"));
    let head = document.getElementsByTagName("head")[0];
    for (let i = 0; i < sheets.length; ++i) {
      let elem = sheets[i];
      head.removeChild(elem);
      let rel = elem.rel;
      if (elem.href && typeof rel != "string" || rel.length == 0 || rel.toLowerCase() == "stylesheet") {
        let url = elem.href.replace(/(&|\?)_cacheOverride=\d+/, "");
        elem.href = url + (url.indexOf("?") >= 0 ? "&" : "?") + "_cacheOverride=" + (/* @__PURE__ */ new Date()).valueOf();
      }
      head.appendChild(elem);
    }
    if (tm) {
      clearTimeout(tm);
    }
    tm = setTimeout(() => {
      document.body.style.visibility = "unset";
    }, 50);
  }
  __name(refreshCSS, "refreshCSS");
  const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
  const address = `${protocol}${host}:${port}/ws`;
  const socket = new WebSocket(address);
  socket.onmessage = function(msg) {
    if (msg.data == "reload") {
      if (reloadCallback) {
        reloadCallback();
      } else {
        window.location.reload();
      }
    } else if (msg.data == "refreshcss") {
      refreshCSS();
    }
  };
  console.log("Live reload enabled.");
}
__name(installHMR, "installHMR");

// src/styles.ts
var _Stylesheet = class {
  m_sheet;
  m_rules = /* @__PURE__ */ new Map();
  constructor() {
    function getStyleSheet(name) {
      for (let i = 0; i < x4document.styleSheets.length; i++) {
        let sheet = x4document.styleSheets[i];
        if (sheet.title === name) {
          return sheet;
        }
      }
    }
    __name(getStyleSheet, "getStyleSheet");
    this.m_sheet = getStyleSheet("@dynamic-css");
    if (!this.m_sheet) {
      let dom = x4document.createElement("style");
      dom.setAttribute("id", "@dynamic-css");
      x4document.head.appendChild(dom);
      this.m_sheet = dom.sheet;
    }
  }
  /**
   * add a new rule to the style sheet
   * @param {string} name - internal rule name 
   * @param {string} definition - css definition of the rule 
   * @example
   * setRule('xbody', "body { background-color: #ff0000; }" );
   */
  setRule(name, definition) {
    if (isString(definition)) {
      let index = this.m_rules.get(name);
      if (index !== void 0) {
        this.m_sheet.deleteRule(index);
      } else {
        index = this.m_sheet.cssRules.length;
      }
      this.m_rules.set(name, this.m_sheet.insertRule(definition, index));
    } else {
      let idx = 1;
      for (let r in definition) {
        let rule = r + " { ", css = definition[r];
        for (let i in css) {
          let values = css[i];
          for (let j = 0; j < values.length; j++) {
            rule += i + ": " + values[j] + "; ";
          }
        }
        rule += "}";
        this.setRule(name + "--" + idx, rule);
        idx++;
      }
    }
  }
  /**
   * return the style variable value
   * @param name - variable name 
   * @example
   * ```
   * let color = Component.getCss( ).getVar( 'button-color' );
   * ```
   */
  static getVar(name) {
    if (!_Stylesheet.doc_style) {
      _Stylesheet.doc_style = getComputedStyle(x4document.documentElement);
    }
    if (name[0] != "-") {
      name = "--" + name;
    }
    return _Stylesheet.doc_style.getPropertyValue(name);
  }
};
var Stylesheet = _Stylesheet;
__name(Stylesheet, "Stylesheet");
__publicField(Stylesheet, "guid", 1);
__publicField(Stylesheet, "doc_style");
var CSSParser = class {
  result = {};
  parse(css) {
    this.result = {};
    this.parse_json("", css);
    return CSSParser.mk_string(this.result);
  }
  static mk_string(rules) {
    let ret = "";
    for (let a in rules) {
      let css = rules[a];
      ret += a + " { ";
      for (let i in css) {
        let values = css[i];
        for (let j = 0; j < values.length; j++) {
          ret += i + ": " + values[j] + "; ";
        }
      }
      ret += "}\n";
    }
    return ret;
  }
  parse_json(scope, css) {
    if (scope && !this.result[scope]) {
      this.result[scope] = {};
    }
    for (let property in css) {
      let value = css[property];
      if (isArray(value)) {
        let values = value;
        for (let i = 0; i < values.length; i++) {
          this.addProperty(scope, property, values[i]);
        }
      } else {
        switch (typeof value) {
          case "number": {
            this.addProperty(scope, property, value);
            break;
          }
          case "string": {
            this.addProperty(scope, property, value);
            break;
          }
          case "object": {
            this.parse_json(this.makeSelectorName(scope, property), value);
            break;
          }
          default: {
            console.error("ignoring unknown type " + typeof value + " in property " + property);
            break;
          }
        }
      }
    }
  }
  makePropertyName(n) {
    return pascalCase(n);
  }
  makeSelectorName(scope, name) {
    let snames = [];
    let names = name.split(/\s*,\s*/);
    let scopes = scope.split(/\s*,\s*/);
    for (let s = 0; s < scopes.length; s++) {
      let scope2 = scopes[s];
      for (let i = 0; i < names.length; i++) {
        let name2 = names[i], sub = false;
        if (name2.charAt(0) == "&") {
          name2 = name2.substr(1);
          sub = true;
        }
        if (name2.charAt(0) === "%") {
          name2 = ".o-" + name2.substr(1);
        }
        if (sub) {
          snames.push(scope2 + name2);
        } else {
          snames.push(scope2 ? scope2 + " " + name2 : name2);
        }
      }
    }
    return snames.join(", ");
  }
  addProperty(scope, property, value) {
    let properties = property.split(/\s*,\s*/);
    for (let i = 0; i < properties.length; i++) {
      let property2 = this.makePropertyName(properties[i]);
      if (this.result[scope][property2]) {
        this.result[scope][property2].push(value);
      } else {
        this.result[scope][property2] = [value];
      }
      let specials = {
        "box-shadow": [
          "-moz-box-shadow",
          "-webkit-box-shadow"
        ],
        "border-radius": [
          "-moz-border-radius",
          "-webkit-border-radius"
        ],
        "border-radius-topleft": [
          "-moz-border-radius-topleft",
          "-webkit-border-top-left-radius"
        ],
        "border-radius-topright": [
          "-moz-border-radius-topright",
          "-webkit-border-top-right-radius"
        ],
        "border-radius-bottomleft": [
          "-moz-border-radius-bottomleft",
          "-webkit-border-bottom-left-radius"
        ],
        "border-radius-bottomright": [
          "-moz-border-radius-bottomright",
          "-webkit-border-bottom-right-radius"
        ]
      };
      let browser_specials = specials[property2];
      for (let j = 0; browser_specials && j < browser_specials.length; j++) {
        this.addProperty(scope, browser_specials[j], value);
      }
    }
  }
};
__name(CSSParser, "CSSParser");
var ComputedStyle = class {
  m_style;
  constructor(style) {
    this.m_style = style;
  }
  /**
   * return the raw value
   */
  value(name) {
    name = pascalCase(name);
    return this.m_style[name];
  }
  /**
   * return the interpreted value
   */
  parse(name) {
    name = pascalCase(name);
    return parseInt(this.m_style[name]);
  }
  /**
   * 
   */
  get style() {
    return this.m_style;
  }
};
__name(ComputedStyle, "ComputedStyle");

// src/component.ts
var _x4_ns_prefix = "x-";
var _x4_el_store = Symbol();
var _x4_el_sym = Symbol();
var _x4_unitless = {
  animationIterationCount: 1,
  borderImageOutset: 1,
  borderImageSlice: 1,
  borderImageWidth: 1,
  boxFlex: 1,
  boxFlexGroup: 1,
  boxOrdinalGroup: 1,
  columnCount: 1,
  flex: 1,
  flexGrow: 1,
  flexPositive: 1,
  flexShrink: 1,
  flexNegative: 1,
  flexOrder: 1,
  gridRow: 1,
  gridColumn: 1,
  fontWeight: 1,
  lineClamp: 1,
  lineHeight: 1,
  opacity: 1,
  order: 1,
  orphans: 1,
  tabSize: 1,
  widows: 1,
  zIndex: 1,
  zoom: 1,
  // SVG-related _properties
  fillOpacity: 1,
  floodOpacity: 1,
  stopOpacity: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1,
  strokeMiterlimit: 1,
  strokeOpacity: 1,
  strokeWidth: 1
};
var unbubbleEvents = {
  mouseleave: 1,
  mouseenter: 1,
  load: 1,
  unload: 1,
  scroll: 1,
  focus: 1,
  blur: 1,
  rowexit: 1,
  beforeunload: 1,
  stop: 1,
  dragdrop: 1,
  dragenter: 1,
  dragexit: 1,
  draggesture: 1,
  dragover: 1,
  contextmenu: 1,
  create: 2,
  sizechange: 2
};
var passiveEvents = {
  touchstart: 1,
  touchmove: 1,
  touchend: 1
  //pointerdown: 1, pointermove: 1, pointerup: 1,
};
var reNumber = /^-?\d+(\.\d+)?$/;
function EvDblClick(context = null) {
  return BasicEvent({ context });
}
__name(EvDblClick, "EvDblClick");
function EvFocus(focus = true, context = null) {
  return BasicEvent({ focus, context });
}
__name(EvFocus, "EvFocus");
var _Component = class extends BaseComponent {
  m_dom;
  m_iprops;
  constructor(props = null) {
    super(props ?? {});
    this.m_iprops = {
      classes: {},
      dom_events: {},
      uid: _Component.__comp_guid++,
      inrender: false,
      created: false
    };
    if (this.m_props.cls) {
      this.addClass(this.m_props.cls);
    }
  }
  /**
   * 
   */
  get uid() {
    return this.m_iprops.uid;
  }
  /**
   * change the component content
   * @param content new content or null
   */
  setContent(content, refreshAll = false) {
    this.m_props.content = content ?? [];
    if (this.m_iprops.inrender || !this.m_dom) {
      return;
    }
    if (refreshAll) {
      this.update();
    } else {
      this._updateContent();
    }
  }
  getContent() {
    return this.m_props.content;
  }
  /**
   * add a new child to the component content
   * @param content 
   */
  appendChild(content) {
    if (!content) {
      return;
    }
    const append = /* @__PURE__ */ __name((c) => {
      if (!this.m_props.content) {
        this.m_props.content = [];
      } else if (!isArray(this.m_props.content)) {
        this.m_props.content = [this.m_props.content];
      }
      this.m_props.content.push(c);
      if (this.m_dom) {
        this._appendChild(c);
      }
    }, "append");
    if (isArray(content)) {
      content.forEach(append);
    } else {
      append(content);
    }
  }
  removeChild(item) {
    if (this.m_props.content) {
      if (!isArray(this.m_props.content)) {
        this.m_props.content = [this.m_props.content];
      }
      this.m_props.content = this.m_props.content.filter((x) => x !== item);
    }
    if (this.dom && item.dom) {
      this.dom.removeChild(item.dom);
    }
  }
  /**
   * 
   */
  setTag(tag, namespace) {
    this.m_props.tag = tag;
    if (namespace) {
      this.m_props.ns = namespace;
    }
  }
  /**
   * get the Component data value
   * @param name name to get
   */
  getData(name) {
    if (this.m_props.data !== void 0) {
      return this.m_props.data[name.toString()];
    }
    return void 0;
  }
  /**
   * set the Component data value
   * @param name name to get
   * @param value
   */
  setData(name, value) {
    let data2 = this.m_props.data;
    if (data2 === void 0) {
      data2 = this.m_props.data = {};
    }
    data2[name.toString()] = value;
  }
  /**
   * return the DOM associated with the Component (if any)
   */
  get dom() {
    return this.m_dom;
  }
  /**
   * shows the element
   * @param show
   */
  show(show) {
    if (show === void 0 || show === true) {
      this.removeClass("@hidden");
    } else {
      this.addClass("@hidden");
    }
  }
  /**
   * hides the element
   */
  hide() {
    this.addClass("@hidden");
  }
  /**
   * enable or disable the element
   * @param enable 
   */
  enable(enable) {
    if (enable === void 0 || enable === true) {
      this.removeClass("@disable");
      this.removeAttribute("disabled");
    } else {
      this.disable();
    }
  }
  /**
   * disable the element
   */
  disable() {
    this.addClass("@disable");
    this.setAttribute("disabled", "");
  }
  /**
   * set the focus on the element
   */
  focus() {
    console.assert(!!this.m_dom);
    this.m_dom.focus();
  }
  /**
   * change the object style
   * @param style - style to add
   * @example ```typescript
   * el.setStyle( {left:100} );
   */
  setStyle(style) {
    for (let s in style) {
      this.setStyleValue(s, style[s]);
    }
  }
  /**
   * change a style value
   * @param name string style nale
   * @param value any style value or null to remove style
   */
  setStyleValue(name, value) {
    let style = this.m_props.style;
    if (!style) {
      style = this.m_props.style = {};
    }
    style[name] = value;
    this._setDomStyleValue(name, value);
  }
  _setDomStyleValue(name, value) {
    if (this.m_dom) {
      if (value === void 0) {
        value = null;
      } else if (!_x4_unitless[name] && (isNumber(value) || reNumber.test(value))) {
        value = value + "px";
      }
      this.m_dom.style[name] = value;
    }
  }
  /**
   * compute the element style 
   * @return all styles computed
   */
  getComputedStyle(pseudoElt) {
    if (this.dom) {
      return new ComputedStyle(getComputedStyle(this.dom, pseudoElt ?? null));
    }
    return new ComputedStyle(this.m_props.style);
  }
  /**
   * return a single stype value
   * @param name - value to get
   */
  getStyleValue(name) {
    return this.getComputedStyle()[name];
  }
  /**
   * define the elements attributes
   * @param attrs 
   */
  setAttributes(attrs) {
    for (let a in attrs) {
      this.setAttribute(a, attrs[a]);
    }
  }
  /**
   * change a single attribute
   * @param name attribute name
   * @param value new value 
   */
  setAttribute(name, value) {
    if (value === false || value === void 0) {
      this.removeAttribute(name);
    } else {
      if (value === true) {
        value = "";
      } else if (isNumber(value)) {
        value = "" + value;
      }
      let attrs = this.m_props.attrs;
      if (!attrs) {
        attrs = this.m_props.attrs = {};
      }
      attrs[name] = value;
      this._setDomAttribute(name, value);
    }
  }
  _setDomAttribute(name, value) {
    if (this.m_dom) {
      this.m_dom.setAttribute(name, value);
    }
  }
  /**
   * remove an atrribute
   * @param name name of the attribute
   */
  removeAttribute(name) {
    let attrs = this.m_props.attrs;
    if (!attrs) {
      return;
    }
    delete attrs[name];
    if (this.m_dom) {
      this.m_dom.removeAttribute(name);
    }
  }
  /**
   * get an attribute value
   * @param {string} name - attribute name
   * @return {string} attribute value
   * @example ```typescript
   * let chk = el.getAttribute( 'checked' );
   * @review double cache
   */
  getAttribute(name) {
    if (this.m_dom) {
      return this.m_dom.getAttribute(name);
    } else {
      if (name == "id") {
        return this.m_props.id;
      }
      return this.m_props.attrs ? this.m_props.attrs[name] : void 0;
    }
  }
  /**
   * check if the element has an attribute
   * @param name attribute name
   * @return true is attribute is present
   * @example ```typescript
   * if( el.hasAttribute('checked') ) {
   * }
   */
  hasAttribute(name) {
    if (this.m_dom) {
      return this.m_dom.hasAttribute(name);
    } else {
      return this.m_props.attrs.hasOwnProperty(name);
    }
  }
  /**
   * a some classnames to the component
   * classes can be separated by a space
   * @param cls class to add
   * @example ```typescript
   * addClass( 'my class name @flex' );
   */
  addClass(name) {
    if (name === null || name === void 0) {
      return;
    }
    name = name.trim();
    if (name === "") {
      return;
    }
    let add = /* @__PURE__ */ __name((c) => {
      if (c === void 0 || c === null || c === "") {
        return;
      }
      c = this._makeCls(c);
      classes[c] = true;
      if (this.m_dom) {
        this.m_dom.classList.add(c);
      }
    }, "add");
    let classes = this.m_iprops.classes;
    if (name.indexOf(" ") < 0) {
      add(name);
    } else {
      let names = name.split(" ");
      names.forEach((n) => add(n));
    }
  }
  /**
   * Remove a class from the element
   * @param {string|array} name - classes in string form can be space separated
   * 
   * @example ```typescript
   * el.removeClass( 'myclass' );
   * el.removeClass( 'myclass1 myclass2' );
   */
  removeClass(name) {
    if (name === void 0) {
      return;
    }
    let remove = /* @__PURE__ */ __name((c) => {
      if (c === void 0 || c === null || c === "") {
        return;
      }
      c = this._makeCls(c);
      delete this.m_iprops.classes[c];
      if (this.m_dom) {
        this.m_dom.classList.remove(c);
      }
    }, "remove");
    if (name.indexOf(" ") < 0) {
      remove(name);
    } else {
      let classes = name.trim().split(" ");
      for (let c of classes) {
        if (c !== void 0 && c !== null && c !== "") {
          remove(c);
        }
      }
    }
  }
  /**
   * 
   * @param cls 
   * @param set 
   */
  setClass(cls, set) {
    if (set) {
      this.addClass(cls);
    } else {
      this.removeClass(cls);
    }
    return this;
  }
  /**
   * Toggle a class from the element (if present remove, if absent add)
   * @param {string|string[]} name - classes in string form can be space separated
   * @example ```typescript
   * el.toggleClass( 'myclass' );
   * el.toggleClass( 'myclass1 myclass2');
   * el.toggleClass( ['myclass1','myclass2']);
   */
  toggleClass(name) {
    let toggle = /* @__PURE__ */ __name((c) => {
      if (c === void 0 && c === null && c === "") {
        return;
      }
      c = this._makeCls(c);
      if (this.m_iprops.classes[c]) {
        delete this.m_iprops.classes[c];
      } else {
        this.m_iprops.classes[c] = true;
      }
      if (this.m_dom) {
        this.m_dom.classList.toggle(c);
      }
    }, "toggle");
    if (name.indexOf(" ") < 0) {
      toggle(name);
    } else {
      let classes = name.trim().split(" ");
      for (let c of classes) {
        toggle(c);
      }
    }
  }
  /**
   * check if the object has the class
   * @param cls 
   */
  hasClass(cls) {
    let c = this._makeCls(cls);
    if (this.m_dom) {
      return this.dom.classList.contains(c);
    } else {
      return !!this.m_iprops.classes[c];
    }
  }
  /**
   * remove all classes from the object 
   * this is usefull for component recycling & reusing
   */
  clearClasses() {
    this.m_iprops.classes = {};
    if (this.m_dom) {
      return this.m_dom.classList.value = "";
    }
  }
  _build() {
    if (this.m_dom) {
      return this.m_dom;
    }
    this._createDOM();
    return this.m_dom;
  }
  render(props) {
  }
  _createDOM() {
    if (this.m_dom) {
      return this.m_dom;
    }
    const props = this.m_props;
    if (props.tabIndex !== void 0) {
      this._setTabIndex(props.tabIndex);
    }
    this.render(props);
    if (props.left !== void 0) {
      this.setStyleValue("left", props.left);
    }
    if (props.top !== void 0) {
      this.setStyleValue("top", props.top);
    }
    if (props.width !== void 0) {
      this.setStyleValue("width", props.width);
    }
    if (props.height !== void 0) {
      this.setStyleValue("height", props.height);
    }
    if (props.flex !== void 0) {
      this.addClass("@flex");
      if (props.flex != 1) {
        this.setStyleValue("flex", props.flex);
      }
    }
    if (props.enabled === false) {
      this.disable();
    }
    if (props.tooltip !== void 0) {
      this.setAttribute("tip", props.tooltip.replace(/\n/gi, "<br/>"));
    }
    if (props.dom_events) {
      for (let ename in props.dom_events) {
        this._setDomEvent(ename, props.dom_events[ename]);
      }
    }
    this._genClassName();
    this.m_props.cls = void 0;
    let vdom = this.m_iprops;
    if (props.ns) {
      this.m_dom = x4document.createElementNS(props.ns, props.tag ?? "div");
    } else {
      this.m_dom = x4document.createElement(props.tag ?? "div");
    }
    this.m_dom[_x4_el_sym] = this;
    this.m_dom.classList.add(...Object.keys(vdom.classes));
    let sty = props.style;
    if (sty) {
      for (let s in sty) {
        this._setDomStyleValue(s, sty[s]);
      }
    }
    let att = props.attrs;
    if (att) {
      for (let a in att) {
        const attr = att[a];
        if (attr !== false && attr !== void 0) {
          this._setDomAttribute(a, att[a]);
        }
      }
    }
    if (this.m_props.id) {
      this._setDomAttribute("id", this.m_props.id);
    }
    let evt = this.m_iprops.dom_events;
    if (evt) {
      for (let e in evt) {
        let handlers = evt[e];
        for (let h of handlers) {
          this._createEvent(e, h.listener, h.passive);
        }
      }
    }
    let content = props.content;
    if (content) {
      if (!isArray(content)) {
        content = [content];
      }
      content.forEach((el) => {
        if (!el) {
          return;
        }
        if (isString(el)) {
          this.m_dom.insertAdjacentText("beforeend", el);
        } else if (isHtmlString(el)) {
          this.m_dom.insertAdjacentHTML("beforeend", el);
        } else if (el instanceof _Component) {
          this.m_dom.append(el._build());
        } else {
          console.log("unknown element type: ", el);
        }
      });
    }
    if (!_Component.__createObserver) {
      _Component.__createObserver = new MutationObserver(_Component._observeCreation);
      _Component.__createObserver.observe(x4document.body, { childList: true, subtree: true });
    }
    return this.m_dom;
  }
  _setTabIndex(tabIndex, defValue = 0) {
    if (tabIndex === true) {
      tabIndex = 0;
    } else if (tabIndex === void 0) {
      tabIndex = defValue;
    }
    if (tabIndex !== false && tabIndex !== void 0) {
      this.setAttribute("tabindex", tabIndex);
    }
    this.m_props.tabIndex = tabIndex;
  }
  static _observeCreation(mutations) {
    const notify = /* @__PURE__ */ __name((c) => {
      if (!c.m_iprops.created) {
        if (c.dom && c.m_iprops.dom_events && c.m_iprops.dom_events.create) {
          c.dom.dispatchEvent(new Event("create"));
        }
        c.componentCreated();
        c.m_iprops.created = true;
      }
    }, "notify");
    for (let mutation of mutations) {
      if (mutation.type == "childList") {
        for (let i = 0, n = mutation.addedNodes.length; i < n; i++) {
          let add = mutation.addedNodes[i];
          let el = add[_x4_el_sym];
          if (el) {
            el.enumChilds((c) => {
              notify(c);
            }, true);
            notify(el);
          }
        }
      }
    }
  }
  dispose() {
    if (this.m_dom) {
      this._dispose(true, true);
    }
  }
  _dispose(with_dom, timers) {
    let _dom = this.m_dom;
    delete _dom[_x4_el_sym];
    delete _dom[_x4_el_store];
    if (with_dom) {
      _dom.remove();
    }
    this.enumChilds((c) => {
      c._dispose(false, true);
    });
    this.m_dom = null;
    if (timers) {
      this.disposeTimers();
    }
    this.componentDisposed();
    this.m_iprops.created = false;
  }
  componentDisposed() {
  }
  componentCreated() {
  }
  /**
   * 
   */
  update(delay = 0) {
    if (this.m_dom) {
      const _update = /* @__PURE__ */ __name(() => {
        let oldDOM = this.m_dom;
        this._dispose(false, false);
        let newDOM = this._build();
        console.assert(!!oldDOM.parentNode, "update in componentCreated is not allowed, use updateContent");
        oldDOM.parentNode.replaceChild(newDOM, oldDOM);
      }, "_update");
      if (delay) {
        this.singleShot(_update, delay);
      } else {
        _update();
      }
    }
  }
  /**
   * empty the node
   */
  _empty() {
    const el = this.m_dom;
    if (!el) {
      return;
    }
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }
  _updateContent() {
    if (!this.m_dom) {
      return;
    }
    this._empty();
    let content = this.m_props.content;
    if (content) {
      if (!isArray(content)) {
        content = [content];
      }
      content.forEach((el) => {
        if (!el) {
          return;
        }
        if (isHtmlString(el)) {
          this.m_dom.insertAdjacentHTML("beforeend", el);
        } else if (el instanceof _Component) {
          this.m_dom.append(el._build());
        } else {
          this.m_dom.insertAdjacentText("beforeend", el + "");
        }
      });
    }
  }
  /**
   * @return the bounding rectangle
   * @example ```typescript
   * let rc = el.getBoundingRect( );
   * console.log( rc.left, rc.top, rc.right, rc.bottom );
   */
  getBoundingRect(withMargins = false) {
    console.assert(this.dom != null, "cannot get bounding rect of an non DOM element");
    let r = this.dom.getBoundingClientRect();
    let rc = new Rect(r.left, r.top, r.width, r.height);
    if (withMargins) {
      let st = this.getComputedStyle();
      let tm = st.parse("marginTop"), bm = st.parse("marginBottom"), lm = st.parse("marginLeft"), rm = st.parse("marginRight");
      rc.left -= lm;
      rc.width += lm + rm;
      rc.top -= tm;
      rc.height += tm + bm;
    }
    return rc;
  }
  /**
   * append a new dom event handler
   * @param name - you can specify multiple names separated by a space
   * @param handler 
   * @example
   * 
   * this.setDomEvent( 'drag drop', this._handleDrag, this );
   * this.setDomEvent( 'dblclick', this._handleDblClick, this );
   */
  setDomEvent(type, listener, passive) {
    let _listener = listener;
    this._setDomEvent(type, _listener, passive);
  }
  _setDomEvent(type, listener, passive) {
    if (!this.m_iprops.dom_events) {
      this.m_iprops.dom_events = {};
    }
    let listeners = this.m_iprops.dom_events[type];
    if (!listeners) {
      listeners = this.m_iprops.dom_events[type] = [{ listener, passive }];
    } else {
      listeners.push({ listener, passive });
    }
    if (this.m_dom) {
      this._createEvent(type, listener, passive);
    }
  }
  /**
   * 
   */
  clearDomEvent(type) {
    if (!this.m_iprops.dom_events) {
      return;
    }
    delete this.m_iprops.dom_events[type];
    let _dom = this.m_dom;
    if (_dom) {
      let store = _dom[_x4_el_store];
      if (store) {
        delete store[type];
      }
    }
  }
  /**
   * 
   * @param name 
   * @param handler 
   */
  _createEvent(name, handler, passive) {
    let _dom = this.m_dom;
    let store = _dom[_x4_el_store];
    if (!store) {
      store = _dom[_x4_el_store] = {};
    }
    if (!store[name]) {
      store[name] = [handler];
    } else {
      store[name].push(handler);
    }
    if (unbubbleEvents[name] === 1) {
      _dom["on" + name] = _Component._dispatchUnbubbleEvent;
    } else if (!_Component.__privateEvents[name]) {
      _Component.__privateEvents[name] = true;
      if (passive === void 0) {
        if (passiveEvents[name]) {
          x4document.addEventListener(name, _Component._dispatchEvent, { passive: false, capture: true });
        } else {
          x4document.addEventListener(name, _Component._dispatchEvent, true);
        }
      } else {
        x4document.addEventListener(name, _Component._dispatchEvent, { passive, capture: passive ? true : false });
      }
    }
    if (name === "sizechange") {
      if (!_Component.__sizeObserver) {
        _Component.__sizeObserver = new ResizeObserver(_Component._observeSize);
      }
      _Component.__sizeObserver.observe(this.m_dom);
    }
  }
  /**
   * dispatch a dom event to the appropriated component
   * called by the system
   */
  static _dispatchEvent(ev) {
    let target = ev.target, noup = unbubbleEvents[ev.type] === 2;
    while (target) {
      if (target[_x4_el_store]) {
        let store = target[_x4_el_store][ev.type];
        if (store) {
          let el = target[_x4_el_sym];
          let root = el?.root ?? null;
          if (store instanceof Array) {
            store.some((fn) => {
              fn(ev, root);
              if (!el.dom) {
                return true;
              }
            });
          } else {
            store(ev, root);
          }
          if (ev.cancelBubble || ev.defaultPrevented || noup) {
            break;
          }
        }
      }
      target = target.parentNode;
      if (target == document) {
        break;
      }
    }
  }
  /**
   * dispatch a dom event to the appropriated component
   * called by the system
   */
  static _dispatchUnbubbleEvent(ev) {
    let target = ev.currentTarget || ev.target, eventType = ev.type;
    let eventStore = target[_x4_el_store], store = eventStore && eventStore[eventType];
    if (store) {
      let el = target[_x4_el_sym];
      let root = el?.root ?? null;
      if (store instanceof Array) {
        store.forEach((fn) => {
          fn(ev, root);
        });
      } else {
        store(ev, root);
      }
    }
  }
  /**
   * called when a size change on an observed component
   */
  static _observeSize(entries) {
    entries.forEach((entry) => {
      let dom = entry.target;
      if (dom.offsetParent !== null) {
        dom.dispatchEvent(new Event("sizechange"));
      }
    });
  }
  /**
   * enum all children recursively
   * @param recursive - if true do a full sub-child search 
   * @param cb - callback
   * return true to stop enumeration
   */
  enumChilds(cb, recursive = false) {
    if (this.m_dom) {
      let el = this.m_dom.firstChild;
      while (el) {
        let cel = el[_x4_el_sym];
        if (cel) {
          cb(cel);
          if (recursive && cel.enumChilds(cb, true) === true) {
            return true;
          }
        }
        el = el.nextSibling;
      }
    } else {
      let content = this.m_props.content;
      if (!content) {
        return;
      }
      if (!isArray(content)) {
        content = [content];
      }
      content.some((el) => {
        if (!el || isString(el) || isHtmlString(el)) {
          return;
        }
        if (cb(el)) {
          return true;
        }
        if (recursive && el.enumChilds(cb, true) === true) {
          return true;
        }
      });
    }
    return false;
  }
  /**
   * apprend a child to the DOM
   * @param props child to append (or string)
   */
  _appendChild(el) {
    if (isString(el)) {
      this.m_dom.insertAdjacentText("beforeend", el);
    } else if (isHtmlString(el)) {
      this.m_dom.insertAdjacentHTML("beforeend", el);
    } else {
      let component = el;
      try {
        component._build();
        this.m_dom.appendChild(component.m_dom);
      } catch (e) {
        console.error(e);
      }
    }
  }
  /**
   * generate classes from the component inheritance 
   * @example
   * Button extends Component will give
   * x-comp x-button
   */
  _genClassName() {
    this.addClass("@comp");
    let me = Object.getPrototypeOf(this);
    while (me && me.constructor !== _Component) {
      let clsname = me.constructor.name;
      this.addClass("@" + pascalCase(clsname));
      me = Object.getPrototypeOf(me);
    }
  }
  /**
   * prepend the system class name prefix on a name if needed (if class starts with @)
   */
  _makeCls(cls) {
    if (cls[0] == "@") {
      return cls = _x4_ns_prefix + cls.substring(1);
    } else {
      return cls;
    }
  }
  /**
   * 
   */
  static dispatchCaptures(event) {
    _Component.__capture.handler(event);
  }
  /**
   * capture mouse events
   * @param capture name of the current capture 
   * @param callback funciton to call on captured mouse events
   * 
   * @example
   * Component.setCapture( this, ( ev: MouseEvent, initiator: Component ) => {
   *		if( ev.type=='mousemove' ) {
   *			this.setStyle( {
   *				left: ev.clientX,
   *				top: ev.clientY
   *			} );
   *		}
   *		else if( ev.type=='mouseup' ) {
   *			Component.releaseCapture( );
   *		}
   *	} );
   */
  static setCapture(initiator, listener) {
    console.assert(!_Component.__capture);
    if (_Component.__capture) {
      debugger;
    }
    let iframes = x4document.querySelectorAll("iframe");
    iframes.forEach((f) => {
      flyWrap(f).setStyleValue("pointer-events", "none");
    });
    let overs = x4document.querySelectorAll(":hover");
    let cursor = null;
    if (overs.length) {
      let elementOver = overs[overs.length - 1];
      let style = window.getComputedStyle(elementOver);
      cursor = style.cursor;
    }
    _Component.__capture_mask = x4document.createElement("div");
    let mask = flyWrap(_Component.__capture_mask);
    mask.addClass("@capture-mask");
    if (cursor) {
      mask.setStyleValue("cursor", cursor);
    }
    x4document.body.appendChild(mask.dom);
    x4document.addEventListener("mousedown", _Component.dispatchCaptures);
    x4document.addEventListener("mousemove", _Component.dispatchCaptures);
    x4document.addEventListener("mouseup", _Component.dispatchCaptures);
    x4document.addEventListener("touchstart", _Component.dispatchCaptures);
    x4document.addEventListener("touchmove", _Component.dispatchCaptures);
    x4document.addEventListener("touchend", _Component.dispatchCaptures);
    _Component.__capture = {
      initiator,
      handler: listener,
      iframes
    };
  }
  static releaseCapture() {
    console.assert(!!_Component.__capture);
    x4document.removeEventListener("touchstart", _Component.dispatchCaptures);
    x4document.removeEventListener("touchmove", _Component.dispatchCaptures);
    x4document.removeEventListener("touchend", _Component.dispatchCaptures);
    x4document.removeEventListener("mousedown", _Component.dispatchCaptures);
    x4document.removeEventListener("mousemove", _Component.dispatchCaptures);
    x4document.removeEventListener("mouseup", _Component.dispatchCaptures);
    _Component.__capture.iframes.forEach((f) => {
      flyWrap(f).setStyleValue("pointer-events", null);
    });
    _Component.__capture = null;
    if (_Component.__capture_mask) {
      x4document.body.removeChild(_Component.__capture_mask);
      _Component.__capture_mask = null;
    }
  }
  /**
   * ensure the component is visible
   * @param: alignToTop 
   */
  scrollIntoView(arg) {
    if (this.m_dom) {
      const rel = new Rect(this.dom.getBoundingClientRect());
      let top = void 0;
      let bot = void 0;
      let left = void 0;
      let right = void 0;
      let pn = this.dom.parentElement;
      const bdy = x4document.body;
      while (pn && pn != bdy) {
        const pr = pn.getBoundingClientRect();
        if (top === void 0 || top < pr.top) {
          top = pr.top;
        }
        if (bot === void 0 || bot > pr.bottom) {
          bot = pr.bottom;
        }
        if (left === void 0 || left < pr.left) {
          left = pr.left;
        }
        if (right === void 0 || right > pr.right) {
          right = pr.right;
        }
        pn = pn.parentElement;
      }
      if (top === void 0 || rel.top < top || rel.bottom > bot || rel.left < left || rel.right > right) {
        this.m_dom.scrollIntoView({ behavior: "auto", block: "nearest", inline: "start" });
      }
    }
  }
  /**
   * search for a given css selector 
   * @param selector 
   * @returns child or null
   */
  queryItem(selector) {
    let result = this.dom.querySelector(selector);
    return result ? _Component.getElement(result) : null;
  }
  queryAll(selector, cb) {
    let elements = Array.from(this.m_dom.querySelectorAll(selector));
    if (cb) {
      elements.forEach((el) => {
        cb(flyWrap(el));
      });
    }
    return elements;
  }
  /**
   * find a child with the given ID
   * @param id id (without '#')
   * @returns child or null
   * 
   * @example
   * let btn = this.childWithId<Button>( 'myButtonId' );
   */
  itemWithId(id) {
    let result = this.dom.querySelector("#" + id);
    return result ? _Component.getElement(result) : null;
  }
  /**
   * find a child with given ref
   * @param ref 
   * @return found child or null
   */
  itemWithRef(ref) {
    let result = null;
    this.enumChilds((c) => {
      if (c.m_props.ref === ref) {
        result = c;
        return true;
      }
    }, true);
    return result;
  }
  /**
   * 
   */
  get ref() {
    return this.m_props.ref;
  }
  /**
   * 
   */
  static getCss() {
    if (!_Component.__css) {
      _Component.__css = new Stylesheet();
    }
    return _Component.__css;
  }
  /**
   * return the parent element
   * care, object must have been created (dom!=null)
   */
  getParent() {
    console.assert(!!this.m_dom);
    let elParent = this.dom.parentNode;
    return _Component.getElement(elParent);
  }
  /**
   * get a component from a DOM element
   * move up to the hierarchy to find the request class type.
   * @param dom 
   * @param classname 
   * @returns 
   * 
   * @example
   * 
   * with a DOM like that:
   * 	 Button
   * 	 	Label
   * 		Icon <- the DOM you have (dom-icon)
   *  
   *  let btn = Component.getElement( dom-icon, Button );
   */
  static getElement(dom, classname) {
    if (classname) {
      const srhCls = isString(classname);
      while (dom) {
        let el = dom[_x4_el_sym];
        if (srhCls) {
          if (el && el.hasClass(classname)) {
            return el;
          }
        } else if (el instanceof classname) {
          return el;
        }
        dom = dom.parentElement;
      }
      return null;
    } else {
      return dom ? dom[_x4_el_sym] : null;
    }
  }
  /**
   * compute the scrollbar size ( width = height)
   */
  static getScrollbarSize() {
    if (_Component.__sb_width === void 0) {
      let outerDiv = x4document.createElement("div");
      outerDiv.style.cssText = "overflow:auto;position:absolute;top:0;width:100px;height:100px";
      let innerDiv = x4document.createElement("div");
      innerDiv.style.width = "200px";
      innerDiv.style.height = "200px";
      outerDiv.appendChild(innerDiv);
      x4document.body.appendChild(outerDiv);
      _Component.__sb_width = outerDiv.offsetWidth - outerDiv.clientWidth;
      x4document.body.removeChild(outerDiv);
    }
    return _Component.__sb_width;
  }
  /**
   * check if the Component is visible to the user
   */
  isUserVisible() {
    if (!this.m_dom) {
      return false;
    }
    return this.m_dom.offsetParent !== null;
  }
};
var Component = _Component;
__name(Component, "Component");
__publicField(Component, "__sb_width");
// scrollbar width
__publicField(Component, "__comp_guid", 1e3);
// component global unique id
__publicField(Component, "__privateEvents", {});
__publicField(Component, "__sizeObserver");
// resize observer
__publicField(Component, "__createObserver");
// creation observer
//private static __intersectionObserver: IntersectionObserver;	// visibility observer
__publicField(Component, "__capture", null);
__publicField(Component, "__capture_mask", null);
__publicField(Component, "__css", null);
var fly_element = null;
function flyWrap(dom) {
  if (dom[_x4_el_sym]) {
    return dom[_x4_el_sym];
  }
  let f = fly_element;
  if (!f) {
    f = fly_element = new Component({});
  }
  f.m_dom = dom;
  return f;
}
__name(flyWrap, "flyWrap");
var Flex = class extends Component {
  constructor(props = {}) {
    if (!props.flex) {
      props.flex = 1;
    }
    super(props);
  }
};
__name(Flex, "Flex");
var Space = class extends Component {
  m_size;
  constructor(size) {
    super({});
    this.m_size = size;
  }
  componentCreated() {
    let dom = this.dom;
    let style = null;
    while (dom) {
      let el = dom[_x4_el_sym];
      if (el.hasClass("@hlayout")) {
        style = { width: this.m_size };
        break;
      } else if (el.hasClass("@vlayout")) {
        style = { height: this.m_size };
        break;
      }
      dom = dom.parentElement;
    }
    if (!style) {
      style = { width: this.m_size, height: this.m_size };
    }
    this.setStyle(style);
  }
};
__name(Space, "Space");
function EvSize(size, mode = null, context = null) {
  return BasicEvent({ size, mode, context });
}
__name(EvSize, "EvSize");
var Separator = class extends Component {
  m_irect;
  m_delta;
  m_target;
  constructor(props) {
    super(props);
    this.setDomEvent("mousedown", (e) => this._mousedown(e));
    this.setDomEvent("touchstart", (e) => this._mousedown(e));
    this.setDomEvent("dblclick", (e) => this._collapse(e));
  }
  render() {
    this.addClass(this.m_props.orientation);
  }
  _collapse(ev) {
    if (this.m_props.collapsible) {
      this._findTarget();
      if (this.m_target) {
        this.m_target.toggleClass("@collapsed");
      }
    }
  }
  _mousedown(ev) {
    if (ev.type == "touchstart") {
      let te = ev;
      if (te.touches.length == 1) {
        this._startMoving(te.touches[0].pageX, te.touches[0].pageY, ev);
      }
    } else {
      let me = ev;
      this._startMoving(me.pageX, me.pageY, ev);
    }
  }
  _startMoving(x, y, ev) {
    {
      this._findTarget();
      if (this.m_target) {
        if (this.m_props.orientation == "horizontal") {
          if (this.m_props.sizing == "before") {
            this.m_delta = x - this.m_irect.right;
          } else {
            this.m_delta = x - this.m_irect.left;
          }
        } else {
          if (this.m_props.sizing == "before") {
            this.m_delta = y - this.m_irect.bottom;
          } else {
            this.m_delta = y - this.m_irect.top;
          }
        }
        ev.preventDefault();
        ev.stopPropagation();
        this.m_target.addClass("sizing");
        Component.setCapture(this, (e) => this._pointerMoved(e));
      }
    }
  }
  _pointerMoved(ev) {
    let __move = /* @__PURE__ */ __name((ex, ey) => {
      if (this.m_props.orientation == "horizontal") {
        let width;
        if (this.m_props.sizing == "after") {
          width = this.m_irect.right - (ex - this.m_delta);
        } else {
          width = ex - this.m_delta - this.m_irect.left;
        }
        if (width > 0) {
          let size = new Size(width, 0);
          this.emit("resize", EvSize(size));
          this.m_target.setStyleValue("width", size.width);
          this.m_target.setStyleValue("flex", null);
          this.m_target.removeClass("@flex");
        }
      } else {
        let height;
        if (this.m_props.sizing == "after") {
          height = this.m_irect.bottom - (ey - this.m_delta);
        } else {
          height = ey - this.m_delta - this.m_irect.top;
        }
        if (height > 0) {
          let size = new Size(0, height);
          this.emit("resize", EvSize(size));
          this.m_target.setStyleValue("height", size.height);
          this.m_target.setStyleValue("flex", null);
          this.m_target.removeClass("@flex");
        }
      }
    }, "__move");
    if (ev.type == "mousemove") {
      let mev = ev;
      __move(mev.pageX, mev.pageY);
      ev.preventDefault();
      ev.stopPropagation();
    } else if (ev.type == "touchmove") {
      let tev = ev;
      __move(tev.touches[0].pageX, tev.touches[0].pageY);
      ev.preventDefault();
      ev.stopPropagation();
    } else if (ev.type == "mouseup" || ev.type == "touchend") {
      this.m_target.removeClass("sizing");
      Component.releaseCapture();
      ev.preventDefault();
      ev.stopPropagation();
    }
  }
  _findTarget() {
    if (!this.m_target) {
      if (this.m_props.sizing == "before") {
        let prevDom = this.dom.previousElementSibling;
        let prevEl = prevDom ? Component.getElement(prevDom) : null;
        this.m_target = prevEl;
      } else {
        let nextDom = this.dom.nextElementSibling;
        let nextEl = nextDom ? Component.getElement(nextDom) : null;
        this.m_target = nextEl;
      }
    }
    if (this.m_target) {
      this.m_irect = this.m_target.getBoundingRect();
    } else {
      this.m_irect = null;
    }
  }
};
__name(Separator, "Separator");
function EvOverlayResize(ui_event, sens, context = null) {
  return BasicEvent({ ui_event, sens, context });
}
__name(EvOverlayResize, "EvOverlayResize");
var SizerOverlay = class extends Component {
  m_delta;
  m_irect;
  constructor(props) {
    super(props);
    this.addClass(props.sens);
    this.setDomEvent("mousedown", (e) => this._mousedown(e));
    this.setDomEvent("touchstart", (e) => this._mousedown(e));
    this.setDomEvent("dblclick", (e) => this.resetflex(e));
    props.target.appendChild(this);
    if (props.resize) {
      this.on("resize", this.m_props.resize);
    }
  }
  resetflex(event) {
    this.m_props.target.addClass("@flex");
    this.emit("resize", EvSize({ width: -1, height: 0 }));
    event.preventDefault();
    event.stopPropagation();
  }
  // @review move that in component
  _mousedown(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    let eev = EvOverlayResize(ev, this.m_props.sens);
    this.emit("rawresize", eev);
    if (eev.defaultPrevented) {
      return;
    }
    let pos = getMousePos(ev, true);
    this.m_irect = this.m_props.target.getBoundingRect();
    if (this.m_props.sens == "right") {
      this.m_delta = pos.x - this.m_irect.right;
    } else if (this.m_props.sens == "left") {
      this.m_delta = pos.x - this.m_irect.left;
    } else if (this.m_props.sens == "bottom") {
      this.m_delta = pos.y - this.m_irect.bottom;
    } else if (this.m_props.sens == "top") {
      this.m_delta = pos.y - this.m_irect.top;
    }
    this.m_props.target.addClass("sizing");
    Component.setCapture(this, (e) => this._handle_mouse(e));
  }
  _is_horz() {
    return this.m_props.sens == "left" || this.m_props.sens == "right";
  }
  get sens() {
    return this.m_props.sens;
  }
  _handle_mouse(ev) {
    let __move = /* @__PURE__ */ __name((ex, ey) => {
      if (this._is_horz()) {
        let width;
        if (this.m_props.sens == "left") {
          width = this.m_irect.right - (ex - this.m_delta);
        } else {
          width = ex - this.m_delta - this.m_irect.left;
        }
        if (width > 0) {
          let size = {
            width,
            height: void 0
          };
          this.emit("resize", EvSize(size));
          this.m_props.target.setStyleValue("width", size.width);
          this.m_props.target.setStyleValue("flex", null);
          this.m_props.target.removeClass("@flex");
        }
      } else {
        let height;
        if (this.m_props.sens == "top") {
          height = this.m_irect.bottom - (ey - this.m_delta);
        } else {
          height = ey - this.m_delta - this.m_irect.top;
        }
        if (height > 0) {
          let size = new Size(0, height);
          this.emit("resize", EvSize(size));
          this.m_props.target.setStyleValue("height", size.height);
          this.m_props.target.setStyleValue("flex", null);
          this.m_props.target.removeClass("@flex");
        }
      }
    }, "__move");
    if (ev.type == "mousemove") {
      let mev = ev;
      __move(mev.pageX, mev.pageY);
      ev.preventDefault();
      ev.stopPropagation();
    } else if (ev.type == "touchmove") {
      let tev = ev;
      __move(tev.touches[0].pageX, tev.touches[0].pageY);
      ev.preventDefault();
      ev.stopPropagation();
    } else if (ev.type == "mouseup" || ev.type == "touchend") {
      this.m_props.target.removeClass("sizing");
      Component.releaseCapture();
      ev.preventDefault();
      ev.stopPropagation();
    }
  }
};
__name(SizerOverlay, "SizerOverlay");
function EvShortcut(name) {
  return BasicEvent({ name });
}
__name(EvShortcut, "EvShortcut");
var Container = class extends Component {
  m_shortcuts;
  constructor(props, cls) {
    if (isArray(props)) {
      super({ content: props, cls });
    } else {
      super(props);
    }
  }
  /**
   * add an application shortcut
   * @param sequence key sequence Shift+Ctrl+Alt+K
   * @param callback callback to call
   */
  addShortcut(sequence, name, callback = null, immediate = false) {
    if (!this.m_shortcuts) {
      this.m_shortcuts = [];
      this.setDomEvent("keydown", (e) => this._handleKeydown(e));
    }
    if (!isArray(sequence)) {
      sequence = [sequence];
    }
    sequence.forEach((seq) => {
      let reseq = "";
      let shift = seq.match(/SHIFT/i);
      if (shift) {
        seq = seq.replace(/SHIFT/i, "");
        reseq += "shift+";
      }
      let ctrl = seq.match(/CTRL/i);
      if (ctrl) {
        seq = seq.replace(/CTRL/i, "");
        reseq += "ctrl+";
      }
      let cmd = seq.match(/CMD/i);
      if (cmd) {
        seq = seq.replace(/CMD/i, "");
        reseq += "cmd+";
      }
      let alt = seq.match(/ALT/i);
      if (alt) {
        seq = seq.replace(/ALT/i, "");
        reseq += "alt+";
      }
      reseq += seq.replace("+", "").toLowerCase();
      this.m_shortcuts.push({
        sequence: reseq,
        name,
        immediate,
        callback
      });
    });
  }
  /**
   * remove all shortcuts for a target
   */
  removeShortcuts() {
    if (this.m_shortcuts) {
      this.m_shortcuts = [];
    }
  }
  /** @ignore this function is binded */
  _handleKeydown(e) {
    if (!this.m_shortcuts) {
      return;
    }
    let seq = "";
    if (e.shiftKey) {
      seq += "shift+";
    }
    if (e.ctrlKey) {
      seq += "ctrl+";
    }
    if (e.metaKey) {
      seq += "cmd+";
    }
    if (e.altKey) {
      seq += "alt+";
    }
    seq += e.key.toLowerCase();
    this.m_shortcuts.some((sk) => {
      if (sk.sequence == seq) {
        if (sk.callback) {
          if (sk.immediate) {
            sk.callback(e);
          } else {
            asap(() => {
              sk.callback(e);
            });
          }
        } else {
          this.emit("shortcut", EvShortcut(sk.name));
        }
        e.preventDefault();
        e.stopPropagation();
        return true;
      }
    });
  }
};
__name(Container, "Container");

// src/settings.ts
var Settings = class {
  m_data;
  m_name;
  constructor(name) {
    this.m_data = null;
    this.m_name = name ?? "settings";
  }
  set(name, value) {
    this._load();
    this.m_data[name] = value;
    this._save();
  }
  get(name, defValue) {
    this._load();
    return this.m_data[name] ?? defValue;
  }
  _save() {
    let data2 = JSON.stringify(this.m_data);
    localStorage.setItem(this.m_name, data2);
  }
  _load() {
    if (this.m_data) {
      return;
    }
    this.m_data = {};
    let data2 = localStorage.getItem(this.m_name);
    if (data2 !== null) {
      data2 = JSON.parse(data2);
      if (data2) {
        this.m_data = data2;
      } else {
        console.info("There was an error attempting to read your settings.");
      }
    }
  }
};
__name(Settings, "Settings");

// src/router.ts
function parseRoute(str, loose = false) {
  if (str instanceof RegExp) {
    return {
      keys: null,
      pattern: str
    };
  }
  const arr = str.split("/");
  let keys = [];
  let pattern = "";
  if (arr[0] == "") {
    arr.shift();
  }
  for (const tmp of arr) {
    const c = tmp[0];
    if (c === "*") {
      keys.push("wild");
      pattern += "/(.*)";
    } else if (c === ":") {
      const o = tmp.indexOf("?", 1);
      const ext = tmp.indexOf(".", 1);
      keys.push(tmp.substring(1, o >= 0 ? o : ext >= 0 ? ext : tmp.length));
      pattern += o >= 0 && ext < 0 ? "(?:/([^/]+?))?" : "/([^/]+?)";
      if (ext >= 0) {
        pattern += (o >= 0 ? "?" : "") + "\\" + tmp.substring(ext);
      }
    } else {
      pattern += "/" + tmp;
    }
  }
  return {
    keys,
    pattern: new RegExp(`^${pattern}${loose ? "(?=$|/)" : "/?$"}`, "i")
  };
}
__name(parseRoute, "parseRoute");
var Router = class extends EventSource {
  m_routes;
  m_useHash;
  constructor(useHash = true) {
    super();
    this.m_routes = [];
    this.m_useHash = useHash;
    window.addEventListener("popstate", (event) => {
      const url = this._getLocation();
      const found = this._find(url);
      found.handlers.forEach((h) => {
        h(found.params, url);
      });
    });
  }
  get(uri, handler) {
    let { keys, pattern } = parseRoute(uri);
    this.m_routes.push({ keys, pattern, handler });
  }
  init() {
    this.navigate(this._getLocation());
  }
  _getLocation() {
    return this.m_useHash ? "/" + x4document.location.hash.substring(1) : x4document.location.pathname;
  }
  navigate(uri, notify = true, replace = false) {
    if (!uri.startsWith("/")) {
      uri = "/" + uri;
    }
    const found = this._find(uri);
    if (!found || found.handlers.length == 0) {
      console.log("route not found: " + uri);
      this.signal("error", EvError(404, "route not found"));
      return;
    }
    if (this.m_useHash) {
      while (uri.at(0) == "/") {
        uri = uri.substring(1);
      }
      uri = "#" + uri;
    }
    if (replace) {
      window.history.replaceState({}, "", uri);
    } else {
      window.history.pushState({}, "", uri);
    }
    if (notify) {
      found.handlers.forEach((h) => {
        h(found.params, uri);
      });
    }
  }
  _find(url) {
    let matches = [];
    let params = {};
    let handlers = [];
    for (const tmp of this.m_routes) {
      if (!tmp.keys) {
        matches = tmp.pattern.exec(url);
        if (!matches) {
          continue;
        }
        if (matches["groups"]) {
          for (const k in matches["groups"]) {
            params[k] = matches["groups"][k];
          }
        }
        handlers = [...handlers, tmp.handler];
      } else if (tmp.keys.length > 0) {
        matches = tmp.pattern.exec(url);
        if (matches === null) {
          continue;
        }
        for (let j = 0; j < tmp.keys.length; ) {
          params[tmp.keys[j]] = matches[++j];
        }
        handlers = [...handlers, tmp.handler];
      } else if (tmp.pattern.test(url)) {
        handlers = [...handlers, tmp.handler];
      }
    }
    return { params, handlers };
  }
};
__name(Router, "Router");

// src/application.ts
var _x4_touch_time = Symbol();
var _Application = class extends BaseComponent {
  /**
   * the application singleton
   */
  static instance() {
    return _Application.self;
  }
  m_mainView;
  m_app_name;
  m_app_version;
  m_app_uid;
  m_local_storage;
  m_user_data;
  m_touch_time;
  m_touch_count;
  m_router;
  constructor(props) {
    console.assert(_Application.self === null, "application is a singleton");
    super(props);
    this.m_app_name = props.app_name ?? "application";
    this.m_app_version = props.app_version ?? "1.0";
    this.m_app_uid = props.app_uid ?? "application";
    let settings_name = `${this.m_app_name}.${this.m_app_version}.settings`;
    this.m_local_storage = new Settings(settings_name);
    this.m_user_data = {};
    this.m_touch_time = 0;
    this.m_touch_count = 0;
    this.m_router = null;
    x4app = _Application.self = this;
    if ("onload" in globalThis) {
      globalThis.addEventListener("load", () => {
        this.ApplicationCreated();
      });
    } else {
      this.ApplicationCreated();
    }
  }
  ApplicationCreated() {
    this.setTitle("");
  }
  get router() {
    if (!this.m_router) {
      this.m_router = new Router();
    }
    return this.m_router;
  }
  get app_name() {
    return this.m_app_name;
  }
  get app_uid() {
    return this.m_app_uid;
  }
  get app_version() {
    return this.m_app_version;
  }
  get local_storage() {
    return this.m_local_storage;
  }
  get user_data() {
    return this.m_user_data;
  }
  get history() {
    debugger;
    return null;
  }
  /**
   * define the application root object (MainView)
   * @example ```ts
   * 
   * let myApp = new Application( ... );
   * let mainView = new VLayout( ... );
   * myApp.mainView = mainView;
   */
  setMainView(root, clearBefore) {
    const ddom = this.m_props.renderTo ?? x4document.body;
    const dest = flyWrap(ddom);
    if (!this.m_props.renderTo) {
      dest.setStyleValue("position", "absolute");
    }
    dest.addClass("x4-root-element");
    if (clearBefore) {
      dest._empty();
    }
    this.m_mainView = root;
    root.setStyleValue("position", "absolute");
    root._build();
    ddom.appendChild(root.dom);
  }
  set mainView(root) {
    this.setMainView(root, false);
  }
  get mainView() {
    return this.m_mainView;
  }
  setTitle(title) {
    x4document.title = this.m_app_name + (title ? " > " + title : "");
  }
  disableZoomWheel() {
    window.addEventListener("wheel", function(ev) {
      if (ev.ctrlKey) {
        ev.preventDefault();
      }
    }, { passive: false, capture: true });
  }
  enterModal(enter) {
  }
  enableTouchDblClick() {
    x4document.addEventListener("touchstart", (ev) => {
      let now = Date.now();
      if (now - this.m_touch_time > 700) {
        this.m_touch_count = 1;
      } else {
        this.m_touch_count++;
      }
      this.m_touch_time = now;
      if (this.m_touch_count == 2) {
        this.m_touch_count = 0;
        const tch = ev.touches[0];
        let fake = { type: "dblclick" };
        for (const n in tch) {
          fake[n] = tch[n];
        }
        Component._dispatchEvent(fake);
        ev.stopPropagation();
      }
    });
  }
};
var Application = _Application;
__name(Application, "Application");
__publicField(Application, "self", null);
var x4app;

// src/layout.ts
var AbsLayout = class extends Container {
};
__name(AbsLayout, "AbsLayout");
var HLayout = class extends Container {
};
__name(HLayout, "HLayout");
var VLayout = class extends Container {
};
__name(VLayout, "VLayout");
var AutoLayout = class extends Container {
  constructor(props) {
    super(props);
    this.setDomEvent("sizechange", () => this._updateLayout());
  }
  componentCreated() {
    super.componentCreated();
    this._updateLayout();
  }
  _updateLayout() {
    let horz = this.m_props.defaultLayout == "horizontal" ? true : false;
    if (this.m_props.switchSize <= 0 && window.screen.height > window.screen.width) {
      horz = !horz;
    } else {
      let rc = this.getBoundingRect();
      if (horz && rc.width < this.m_props.switchSize || !horz && rc.height < this.m_props.switchSize) {
        horz = !horz;
      }
    }
    if (horz) {
      this.removeClass("@vlayout");
      this.addClass("@hlayout");
    } else {
      this.addClass("@vlayout");
      this.removeClass("@hlayout");
    }
  }
};
__name(AutoLayout, "AutoLayout");
var GridLayout = class extends Container {
  constructor(props) {
    super(props);
  }
  /** @ignore */
  render() {
    if (this.m_props.colSizes) {
      this.setStyleValue("grid-template-columns", this.m_props.colSizes);
    }
    if (this.m_props.rowSizes) {
      this.setStyleValue("grid-template-rows", this.m_props.rowSizes);
    }
    if (this.m_props.colGap) {
      this.setStyleValue("grid-gap", this.m_props.colGap);
    }
    if (this.m_props.template) {
      this.setStyleValue("grid-template-areas", this.m_props.template.join("\n"));
    }
  }
};
__name(GridLayout, "GridLayout");
var TableLayout = class extends Container {
  m_cells;
  constructor(props) {
    super(props);
    this.setTag("table");
    this.m_cells = /* @__PURE__ */ new Map();
  }
  _getCell(row, col, create = true) {
    let idx = _mkid(row, col);
    return this.m_cells.get(idx) ?? (create ? { item: void 0 } : null);
  }
  _setCell(row, col, cell, update = false) {
    let idx = _mkid(row, col);
    this.m_cells.set(idx, cell);
    if (this.dom && cell.item && update) {
      if (cell.item instanceof Component) {
        cell.item.update();
      } else {
        this.enumChilds((c) => {
          let crow = c.getData("row");
          if (crow == row) {
            let ccol = c.getData("col");
            if (ccol == col) {
              c.setContent(cell.item);
              c.update();
              return true;
            }
          }
        });
      }
    }
  }
  setCell(row, col, item) {
    let cell = this._getCell(row, col);
    cell.item = item;
    this._setCell(row, col, cell, true);
  }
  setCellData(row, col, data2) {
    let cell = this._getCell(row, col);
    cell.data = data2;
    this._setCell(row, col, cell, true);
  }
  getCellData(row, col) {
    let cell = this._getCell(row, col, false);
    return cell?.data;
  }
  merge(row, col, rowCount, colCount) {
    let cell = this._getCell(row, col);
    cell.rowSpan = rowCount;
    cell.colSpan = colCount;
    this._setCell(row, col, cell);
  }
  setCellWidth(row, col, width) {
    let cell = this._getCell(row, col);
    cell.width = width;
    this._setCell(row, col, cell);
  }
  setCellHeight(row, col, height) {
    let cell = this._getCell(row, col);
    cell.height = height;
    this._setCell(row, col, cell);
  }
  setCellClass(row, col, cls) {
    let cell = this._getCell(row, col);
    cell.cls = cls;
    this._setCell(row, col, cell);
  }
  setColClass(col, cls) {
    let cell = this._getCell(-1, col);
    cell.cls = cls;
    this._setCell(-1, col, cell);
  }
  setRowClass(row, cls) {
    let cell = this._getCell(row, 999);
    cell.cls = cls;
    this._setCell(row, 999, cell);
  }
  getCell(row, col) {
    let cell = this._getCell(row, col);
    return cell?.item;
  }
  render() {
    let rows = [];
    let skip = [];
    for (let r = 0; r < this.m_props.rows; r++) {
      let cols = [];
      for (let c = 0; c < this.m_props.columns; c++) {
        let idx = _mkid(r, c);
        if (skip.indexOf(idx) >= 0) {
          continue;
        }
        let cell = this.m_cells.get(idx);
        let cdata = this.m_cells.get(_mkid(-1, c));
        let cls = "";
        if (cell && cell.cls) {
          cls = cell.cls;
        }
        if (cdata && cdata.cls) {
          cls += " " + cdata.cls;
        }
        let cc = new Component({
          tag: "td",
          content: cell?.item,
          width: cell?.width,
          height: cell?.height,
          data: { row: r, col: c },
          cls
        });
        if (cell) {
          let rs = cell.rowSpan ?? 0, cs = cell.colSpan ?? 0;
          if (rs > 0) {
            cc.setAttribute("rowspan", rs + 1);
          }
          if (cs > 0) {
            cc.setAttribute("colspan", cs + 1);
          }
          if (rs || cs) {
            for (let sr = 0; sr <= rs; sr++) {
              for (let sc = 0; sc <= cs; sc++) {
                skip.push(_mkid(sr + r, sc + c));
              }
            }
          }
        }
        cols.push(cc);
      }
      let rdata = this._getCell(r, 999, false);
      let rr = new Component({
        tag: "tr",
        data: { row: r },
        content: cols,
        cls: rdata?.cls
      });
      rows.push(rr);
    }
    this.setContent(rows);
  }
};
__name(TableLayout, "TableLayout");
function _mkid(row, col) {
  return row * 1e3 + col;
}
__name(_mkid, "_mkid");
var ScrollView = class extends Component {
  constructor(props) {
    super(props);
    this.setContent(props.content);
  }
  setContent(content) {
    if (!content) {
      super.setContent(null);
    } else {
      let container;
      if (isArray(content)) {
        container = new VLayout({ content });
      } else {
        container = content;
      }
      container.addClass("@scroll-container");
      super.setContent(container);
    }
  }
};
__name(ScrollView, "ScrollView");
var Masonry = class extends Container {
  constructor(props) {
    const items = props.items;
    props.items = void 0;
    super(props);
    this.setDomEvent("sizechange", () => {
      this.resizeAllItems();
    });
    if (items) {
      items.forEach((i) => {
        this.addItem(i);
      });
    }
  }
  resizeItem(item) {
    const style = this.getComputedStyle();
    const rowHeight = style.parse("grid-auto-rows");
    const rowGap = style.parse("grid-row-gap");
    let content = item.queryItem(".content");
    if (!content) {
      content = item;
    }
    if (content && rowHeight + rowGap) {
      const rc = content.getBoundingRect();
      const rowSpan = Math.ceil((rc.height + rowGap) / (rowHeight + rowGap));
      item.setStyleValue("gridRowEnd", "span " + rowSpan);
    }
  }
  resizeAllItems() {
    this.queryAll(".item", (itm) => {
      ;
      this.resizeItem(itm);
    });
  }
  addItem(itm) {
    itm.addClass("content");
    this.appendChild(new Container({
      cls: "item",
      content: itm
    }));
  }
};
__name(Masonry, "Masonry");

// src/popup.ts
function EvMove(pos) {
  return BasicEvent({ pos });
}
__name(EvMove, "EvMove");
var _Popup = class extends Container {
  m_ui_mask;
  m_hasMask = true;
  constructor(props) {
    super(props);
    this.addClass("@hidden");
  }
  enableMask(enable = true) {
    this.m_hasMask = enable;
  }
  /**
   * display the popup on screen
   */
  show(modal) {
    if (modal !== void 0) {
      this.m_hasMask = modal ? true : false;
    } else {
      modal = this.m_hasMask;
    }
    if (this.m_hasMask) {
      const focus = x4document.activeElement;
      if (focus) {
        focus.blur();
      }
      this.m_ui_mask = x4document.body.lastChild;
      while (this.m_ui_mask) {
        if (this.m_ui_mask.nodeType == 1) {
          let elUI = flyWrap(this.m_ui_mask);
          if (elUI.hasClass("@menu") || elUI.hasClass("@non-maskable")) {
          } else if (elUI.getStyleValue("display") == "none" || !elUI.isUserVisible()) {
          } else if (!elUI.hasClass("@comp")) {
          } else {
            break;
          }
        }
        this.m_ui_mask = this.m_ui_mask.previousSibling;
      }
      if (this.m_ui_mask) {
        flyWrap(this.m_ui_mask).addClass("@mask");
      }
    }
    if (modal) {
      Application.instance().enterModal(true);
    }
    this.setStyle({
      left: 0,
      top: 0
    });
    x4document.body.appendChild(this._build());
    this.removeClass("@hidden");
    this.centerOnScreen();
    if (modal) {
      let focus = x4document.activeElement;
      if (!this.dom.contains(focus)) {
        const autofocus = this.queryItem("[autofocus]");
        if (autofocus) {
          autofocus.focus();
        } else {
          let tabbable = this.queryAll("[tabindex]");
          if (tabbable) {
            tabbable = tabbable.filter((el) => el.offsetParent !== null);
            if (tabbable.length) {
              tabbable[0].focus();
            }
          }
        }
      }
      _Popup.modal_stack.push(this.dom);
    }
  }
  centerOnScreen() {
    let rc = this.getBoundingRect();
    const x = `max( 0px, 50vw - ${rc.width / 2}px )`;
    const y = `max( 0px, 50vh - ${rc.height / 2}px )`;
    this.setStyleValue("left", x);
    this.setStyleValue("top", y);
  }
  /**
  * display the popup at a specific position
  * @param x 
  * @param y 
  */
  displayAt(x, y, align = "top left", offset, modal = false) {
    this.show(modal);
    let halign = "l", valign = "t";
    if (align.indexOf("right") >= 0) {
      halign = "r";
    }
    if (align.indexOf("bottom") >= 0) {
      valign = "b";
    }
    let rc = x4document.body.getBoundingClientRect(), rm = this.getBoundingRect();
    if (halign == "r") {
      x -= rm.width;
    }
    if (valign == "b") {
      y -= rm.height;
    }
    if (offset) {
      x += offset.x;
      y += offset.y;
    }
    if (x < 4) {
      x = 4;
    }
    if (x + rm.width > rc.right - 4) {
      x = rc.right - 4 - rm.width;
      if (offset?.x < 0) {
        x += offset.x;
      }
    }
    if (y < 4) {
      y = 4;
    }
    if (y + rm.height > rc.bottom - 4) {
      y = rc.bottom - 4 - rm.height;
      if (offset?.y < 0) {
        y += offset.y;
      }
    }
    this.setStyle({ left: x, top: y });
  }
  /**
   * close the popup 
   */
  close() {
    this.hide();
    if (this.m_hasMask && this.m_ui_mask) {
      flyWrap(this.m_ui_mask).removeClass("@mask");
      const app = Application.instance();
      app.enterModal(false);
    }
    let index = _Popup.modal_stack.indexOf(this.dom);
    if (index >= 0) {
      _Popup.modal_stack.splice(index);
    }
    this.dispose();
  }
  componentCreated() {
    if (this.m_props.sizable) {
      this.addClass("@size-all");
      let els = ["top", "right", "bottom", "left", "topleft", "topright", "bottomleft", "bottomright"];
      for (let sens of els) {
        new SizerOverlay({
          target: this,
          sens,
          events: { rawresize: (e) => this._mouseResize(e) }
        });
      }
    }
  }
  /**
   * resize for 'all' resize attribute
   */
  _mouseResize(event) {
    event.preventDefault();
    let irc = this.getBoundingRect();
    let st = this.getComputedStyle();
    let ev = event.ui_event;
    let tm = st.parse("marginTop"), lm = st.parse("marginLeft"), rm = st.parse("marginRight"), bm = st.parse("marginBottom");
    let ix = 0, iy = 0;
    let mp = getMousePos(ev, true);
    switch (event.sens) {
      case "topright":
      case "bottomright":
      case "right":
        ix = irc.right - rm - mp.x;
        break;
      case "topleft":
      case "bottomleft":
      case "left":
        ix = irc.left - lm - mp.x;
        break;
    }
    switch (event.sens) {
      case "bottomleft":
      case "bottomright":
      case "bottom":
        iy = irc.bottom - bm - mp.y;
        break;
      case "topleft":
      case "topright":
      case "top":
        iy = irc.top - tm - mp.y;
        break;
    }
    irc.left -= lm;
    irc.top -= tm;
    let sens = event.sens;
    Component.setCapture(this, (ne) => {
      let __move = /* @__PURE__ */ __name((ex, ey) => {
        let left = irc.left, top = irc.top, width = irc.width, height = irc.height;
        let dx, dy;
        let px = ex + ix, py = ey + iy;
        if (px < 0) {
          px = 0;
        }
        if (py < 0) {
          py = 0;
        }
        switch (sens) {
          case "topright":
          case "bottomright":
          case "right":
            width = px - left;
            break;
          case "topleft":
          case "bottomleft":
          case "left":
            dx = left - px;
            width += dx;
            left -= dx;
            break;
        }
        switch (sens) {
          case "bottomleft":
          case "bottomright":
          case "bottom":
            height = py - top;
            break;
          case "topleft":
          case "topright":
          case "top":
            dy = top - py;
            height += dy;
            top -= dy;
            break;
        }
        let newsize = new Size(width, height);
        this.setStyle({ left, top, width: newsize.width, height: newsize.height });
        this.emit("size", EvSize(newsize));
      }, "__move");
      if (ne.type == "mouseup" || ne.type == "touchend") {
        Component.releaseCapture();
      } else if (ne.type == "mousemove") {
        let me = ne;
        __move(me.pageX, me.pageY);
      } else if (ne.type == "touchmove") {
        let tev = ne;
        __move(tev.touches[0].pageX, tev.touches[0].pageY);
      }
    });
  }
};
var Popup = _Popup;
__name(Popup, "Popup");
__publicField(Popup, "modal_stack", []);
function x4handleKeyDown(e) {
  if (e.key == "Tab" || e.key == "Enter") {
    const target = e.target;
    if (target.tagName == "TEXTAREA") {
      return;
    }
    const el = Component.getElement(target);
    if (el && (el.hasAttribute("wants-tab") || el.hasAttribute("wants-enter"))) {
      return;
    }
    let topStack = x4document.body;
    if (Popup.modal_stack.length) {
      topStack = Popup.modal_stack[Popup.modal_stack.length - 1];
    }
    _nextTab(topStack, e.target, e.shiftKey);
    e.stopPropagation();
    e.preventDefault();
  }
}
__name(x4handleKeyDown, "x4handleKeyDown");
function _nextTab(root, el, prev) {
  let focusEl = x4document.activeElement;
  if (!root.contains(focusEl)) {
    return;
  }
  let comp = Component.getElement(el);
  let tab_indexes = Array.from(root.querySelectorAll("[tabindex]"));
  tab_indexes = tab_indexes.filter((el2) => el2.offsetParent !== null);
  if (!tab_indexes.length) {
    return;
  }
  let ct = tab_indexes.indexOf(el);
  if (ct < 0) {
    ct = 0;
  } else {
    if (prev) {
      if (ct > 0) {
        ct--;
      } else {
        ct = tab_indexes.length - 1;
      }
    } else {
      if (ct < tab_indexes.length - 1) {
        ct++;
      } else {
        ct = 0;
      }
    }
  }
  tab_indexes[ct].focus();
}
__name(_nextTab, "_nextTab");
function installKBHandler() {
  x4document.body.addEventListener("keydown", x4handleKeyDown, true);
}
__name(installKBHandler, "installKBHandler");
x4document.body ? installKBHandler() : window.addEventListener("load", installKBHandler);

// src/action.ts
function EvAction(source) {
  return BasicEvent({ source });
}
__name(EvAction, "EvAction");
var Action = class extends BaseComponent {
  constructor(props) {
    super(props);
    this.mapPropEvents(props, "run");
  }
  get props() {
    return this.m_props;
  }
  set text(t) {
    this.m_props.text = t;
    this.emit("change", EvChange(this));
  }
  set icon(i) {
    this.m_props.icon = i;
    this.emit("change", EvChange(this));
  }
  fire() {
    this.emit("run", EvAction(this));
  }
};
__name(Action, "Action");

// src/icon.ts
function EvLoaded(url, svg, context = null) {
  return BasicEvent({ url, svg, context });
}
__name(EvLoaded, "EvLoaded");
function trimQuotes(str) {
  const l = str.length;
  if (str[0] == '"' && str[l - 1] == '"') {
    str = str.substring(1, l - 1);
    str = str.replaceAll('\\"', "'");
    return str;
  }
  if (str[0] == "'" && str[l - 1] == "'") {
    str = str.substring(1, l - 1);
    return str;
  }
  return str;
}
__name(trimQuotes, "trimQuotes");
var Loader = class extends EventSource {
  svgs;
  constructor() {
    super();
    this.svgs = /* @__PURE__ */ new Map();
  }
  load(url) {
    if (this.svgs.has(url)) {
      const svg = this.svgs.get(url);
      if (svg) {
        this.signal("loaded", EvLoaded(url, svg));
      }
    } else {
      this.svgs.set(url, null);
      const _load = /* @__PURE__ */ __name(async (url2) => {
        if (url2.substring(0, 24) == "data:image/svg+xml;utf8,") {
          const svg = url2.substring(24);
          this.svgs.set(url2, svg);
          this.signal("loaded", EvLoaded(url2, svg));
        } else {
          const r = await fetch(url2);
          if (r.ok) {
            const svg = await r.text();
            if (!svg.startsWith("<svg") && !svg.startsWith("<?xml")) {
              console.error("svg loading error: ", svg);
              this.signal("loaded", EvLoaded(url2, ""));
            } else {
              this.svgs.set(url2, svg);
              this.signal("loaded", EvLoaded(url2, svg));
            }
          }
        }
      }, "_load");
      _load(url);
    }
  }
};
__name(Loader, "Loader");
var svgLoader = new Loader();
var _Icon = class extends Component {
  m_icon;
  m_iconName;
  constructor(props) {
    if (isString(props)) {
      super({ icon: props });
    } else {
      super(props);
    }
    this._setIcon(this.m_props.icon, false);
    if (this.m_props.size) {
      this.setStyleValue("fontSize", this.m_props.size);
    }
  }
  _setIcon(icon, remove_old) {
    if (!icon) {
      this.m_iconName = "";
      return;
    }
    this.removeClass("@svg");
    let name, url;
    if (typeof icon === "number") {
      icon = icon.toString(16);
      name = icon;
      console.error("deprecation error: invalid icon name");
    } else {
      const reVar = /\s*var\s*\(\s*(.+)\s*\)\s*/gi;
      let match_var = reVar.exec(icon);
      while (match_var) {
        const varname = match_var[1].trim();
        icon = Stylesheet.getVar(varname).trim();
        if (icon == "" || icon === void 0) {
          console.error(`icon: unable to find variable named '${varname}'`);
          return;
        } else {
          icon = trimQuotes(icon);
        }
        match_var = reVar.exec(icon);
      }
      if (icon.startsWith("<svg")) {
        this._setSVG("data:image/svg+xml;utf8," + icon);
        return;
      }
      const reSvg = /\s*svg\s*\(\s*(.+)\s*\)\s*/gi;
      const reSvg2 = /(.*\.svg)$/gi;
      let match_svg = reSvg.exec(icon) || reSvg2.exec(icon);
      if (match_svg) {
        const url2 = match_svg[1].trim();
        this._setSVG(url2);
        return;
      }
      const reSvg4 = /^\s*(data\:image\/.+)\s*$/gi;
      let match_dta = reSvg4.exec(icon);
      if (match_dta) {
        this._setSVG(match_dta[1]);
        return;
      }
      const reCls = /\s*cls\s*\(\s*(.+)\s*\)\s*/gi;
      let match_cls = reCls.exec(icon);
      if (match_cls) {
        const classes = match_cls[1].trim();
        this.addClass(classes);
        return;
      }
      const reUrl = /\s*url\s*\(\s*(.+)\s*\)\s*/gi;
      let match_url = reUrl.exec(icon);
      if (match_url) {
        url = trimQuotes(match_url[1].trim());
        url = url.replaceAll("\\", "");
        this._setSVG(url);
        return;
      }
      const reChar = /\s*font-char\s*\(\s*(.+)\s*\)\s*/gi;
      let match_char = reChar.exec(icon);
      if (match_char) {
        this.removeClass("@svg-icon");
        this.setContent(match_char[1], false);
        return;
      } else {
        console.error("deprecation error: invalid icon name");
        name = icon;
        icon = Stylesheet.getVar("icon-" + icon);
        if (icon == "" || icon === void 0) {
          icon = "0";
        }
      }
    }
    this.m_iconName = name;
    if (this.m_icon === icon) {
      return;
    }
    let css = Component.getCss(), rulename;
    if (remove_old && this.m_icon) {
      rulename = "icon-" + name;
      this.removeClass(rulename);
    }
    rulename = "icon-" + name;
    if (_Icon.icon_cache[rulename] === void 0) {
      _Icon.icon_cache[rulename] = true;
      let rule;
      if (url) {
        rule = `display: block; content: ' '; background-image: url(${url}); background-size: contain; width: 100%; height: 100%; background-repeat: no-repeat; color: white;`;
      } else {
        rule = `content: "\\${icon}";`;
      }
      css.setRule(rulename, `.${rulename}::before {${rule}}`);
    }
    this.addClass(rulename);
    this.m_icon = icon;
  }
  /**
   * change the icon
   * @param icon - new icon
   */
  set icon(icon) {
    this._setIcon(icon, true);
  }
  get icon() {
    return this.m_iconName;
  }
  _setSVG(url) {
    const set = /* @__PURE__ */ __name((ev) => {
      if (ev.url == url) {
        this.addClass("@svg-icon");
        this.setContent(HtmlString.from(ev.svg), false);
        svgLoader.off("loaded", set);
      }
    }, "set");
    svgLoader.on("loaded", set);
    svgLoader.load(url);
  }
  /**
   * todo: try to extract viewbox
   */
  _setSVGPath(pth) {
    this.addClass("@svg-icon");
    this.setContent(HtmlString.from(`<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="${pth}/></svg>`), false);
  }
};
var Icon = _Icon;
__name(Icon, "Icon");
/**
 * 
 */
__publicField(Icon, "icon_cache", []);

// src/label.ts
var Label = class extends Component {
  constructor(param) {
    if (typeof param === "string" || param instanceof HtmlString) {
      super({ text: param });
    } else {
      super(param);
    }
  }
  /** @ignore */
  render(props) {
    let text = this.m_props.text;
    if (this.m_props.multiline && !(text instanceof HtmlString)) {
      text = new HtmlString(escapeHtml(text, true));
    }
    if (!props.icon) {
      this.setContent(text);
    } else {
      this.setTag("span");
      this.addClass("@hlayout");
      this.setContent([
        new Icon({ id: "l_icon", icon: props.icon }),
        new Component({ content: text, ref: "text" })
      ]);
    }
    this.addClass(props.align ?? "left");
  }
  /**
   * change the displayed text
   * @param text - new text
   */
  set text(txt) {
    let props = this.m_props;
    if (props.text !== txt) {
      props.text = txt;
      let text = this.m_props.text;
      if (this.m_props.multiline && !(text instanceof HtmlString)) {
        text = new HtmlString(escapeHtml(text, true));
      }
      if (this.dom) {
        let comp = this;
        if (this.m_props.icon) {
          comp = this.itemWithRef("text");
        }
        comp.setContent(text);
      }
    }
  }
  /**
   * 
   */
  get text() {
    return this.m_props.text;
  }
  /**
   * change the displayed icon
   * @param icon - new icon
   */
  set icon(icon) {
    this.m_props.icon = icon;
    let ico = this.itemWithRef("l_icon");
    if (ico) {
      ico.icon = icon;
    } else {
      this.update(0);
    }
  }
  /**
   * 
   */
  get icon() {
    let ico = this.itemWithRef("l_icon");
    return ico?.icon;
  }
};
__name(Label, "Label");

// src/menu.ts
var MenuSeparator = class extends Component {
};
__name(MenuSeparator, "MenuSeparator");
var MenuTitle = class extends Label {
};
__name(MenuTitle, "MenuTitle");
var _Menu = class extends Popup {
  m_subMenu;
  m_opener;
  m_virtual;
  m_lock;
  constructor(props, opener) {
    super(props);
    this.addClass("@shadow");
    this.m_opener = opener;
    this.m_virtual = false;
    this.m_lock = 0;
    this.enableMask(false);
  }
  lock(yes) {
    this.m_lock += yes ? 1 : -1;
  }
  setVirtual() {
    this.m_virtual = true;
  }
  setSubMenu(menu) {
    this.m_subMenu = menu;
  }
  hideSubMenu() {
    if (this.m_subMenu) {
      this.m_subMenu.m_opener._close();
      this.m_subMenu.hide();
      this.m_subMenu = null;
    }
  }
  /** @ignore */
  render(props) {
    this.setContent(props.items);
  }
  /**
  * 
  */
  show() {
    if (!this.m_virtual) {
      _Menu._addMenu(this);
    }
    super.show();
  }
  /**
   * 
  */
  close() {
    if (!this.dom && !this.m_virtual) {
      return;
    }
    if (this.m_opener) {
      this.m_opener._close();
    }
    if (this.m_subMenu) {
      this.m_subMenu.close();
      this.m_subMenu = null;
    }
    super.close();
    _Menu._removeMenu();
  }
  /**
   * 
   */
  clear() {
    this.m_props.items = [];
  }
  /**
  * @internal
  */
  static _addMenu(menu) {
    if (_Menu.watchCount == 0) {
      _Menu.rootMenu = menu;
      x4document.addEventListener("mousedown", _Menu._mouseWatcher);
    }
    _Menu.watchCount++;
  }
  static _removeMenu() {
    console.assert(_Menu.watchCount > 0);
    _Menu.watchCount--;
    if (_Menu.watchCount == 0) {
      x4document.removeEventListener("mousedown", _Menu._mouseWatcher);
    }
  }
  static _mouseWatcher(ev) {
    if (ev.defaultPrevented) {
      return;
    }
    let elOn = ev.target;
    while (elOn) {
      let mouseon = Component.getElement(elOn);
      if (mouseon && mouseon instanceof _Menu) {
        return;
      }
      elOn = elOn.parentElement;
    }
    _Menu._discardAll();
  }
  /**
  * hide all the visible menus
  */
  static _discardAll() {
    if (_Menu.rootMenu) {
      _Menu.rootMenu.close();
      _Menu.rootMenu = null;
    }
  }
  displayAt(...args) {
    if (!this.m_lock) {
      _Menu._discardAll();
    }
    let x, y, align, offset;
    if (args.length == 1) {
      ({ x, y } = getMousePos(args[0], true));
    } else {
      [x, y, align, offset] = args;
    }
    if (!align) {
      align = "top left";
    }
    super.displayAt(x, y, align, offset);
  }
};
var Menu = _Menu;
__name(Menu, "Menu");
__publicField(Menu, "watchCount", 0);
__publicField(Menu, "rootMenu", null);
var MenuItem = class extends Component {
  m_menu;
  m_isOpen;
  m_action;
  constructor(a, b) {
    if (a instanceof Action) {
      super({
        click: () => {
          a.fire();
        }
      });
      this.m_action = a;
    } else if (isString(a)) {
      super({
        text: a,
        click: b
      });
    } else {
      super(a);
    }
    this.mapPropEvents(this.m_props, "click");
    this.m_menu = null;
    this.m_isOpen = false;
    this.setDomEvent("mousedown", (e) => this._mousedown(e));
    this.setDomEvent("click", (e) => this._click(e));
  }
  /** @ignore */
  render(props) {
    let icon = props.icon ?? 0;
    let text = props.text;
    if (props.checked !== void 0) {
      icon = props.checked ? "var( --x4-icon-check )" : 0;
    }
    if (this.m_action) {
      if (!icon) {
        icon = this.m_action.props.icon;
      }
      if (text === void 0) {
        text = this.m_action.props.text;
      }
    }
    let popIco = null;
    if (this.isPopup) {
      this.addClass("@popup-menu-item");
      popIco = new Icon({ icon: "var( --x4-icon-chevron-right )", cls: "pop-mark" });
    }
    if (!text && !icon) {
      this.addClass("@separator");
    }
    if (props.cls) {
      this.addClass(props.cls);
    }
    this.setTag("a");
    this.setContent([
      icon ? null : new Icon({ icon }),
      new Label({ flex: 1, text }),
      popIco
    ]);
  }
  get id() {
    return this.m_props.itemId;
  }
  get text() {
    return this.m_props.text;
  }
  get isPopup() {
    return !!this.m_props.items;
  }
  _close() {
    this.removeClass("@opened");
    this.m_isOpen = false;
  }
  _click(ev) {
    if (!this.isPopup) {
      this.emit("click", EvClick());
      Menu._discardAll();
    }
  }
  _mousedown(ev) {
    if (this.isPopup) {
      if (!this.m_menu) {
        this.m_menu = new Menu({ items: this.m_props.items }, this);
      }
      let doClose = this.m_isOpen;
      let parent_menu = Component.getElement(this.dom, Menu);
      if (parent_menu) {
        parent_menu.hideSubMenu();
      }
      if (!doClose) {
        if (parent_menu) {
          parent_menu.setSubMenu(this.m_menu);
        }
        this.m_isOpen = true;
        let rc = this.getBoundingRect();
        this.m_menu.lock(true);
        if (parent_menu) {
          this.m_menu.displayAt(rc.right, rc.top);
        } else {
          this.m_menu.displayAt(rc.left, rc.bottom);
        }
        this.m_menu.lock(false);
        this.addClass("@opened");
      }
      ev.preventDefault();
    }
  }
};
__name(MenuItem, "MenuItem");
var MenuBar = class extends HLayout {
  m_items;
  constructor(props, opener) {
    super(props);
    console.assert(false, "not imp");
    this.addClass("@shadow");
    this.m_items = props.items;
  }
  /** @ignore */
  render() {
    this.setContent(this.m_items);
  }
};
__name(MenuBar, "MenuBar");

// src/listview.ts
var ListView = class extends VLayout {
  m_selection;
  m_defer_sel;
  m_container;
  m_view;
  m_topIndex;
  m_itemHeight;
  m_cache;
  // recycling elements
  constructor(props) {
    super(props);
    this.setDomEvent("keydown", (e) => this.handleKey(e));
    this.setDomEvent("click", (e) => this._handleClick(e));
    this.setDomEvent("dblclick", (e) => this._handleClick(e));
    this.setDomEvent("contextmenu", (e) => this._handleCtxMenu(e));
    this._setTabIndex(props.tabIndex, 0);
    this.mapPropEvents(props, "click", "dblClick", "contextMenu", "selectionChange", "cancel");
  }
  componentCreated() {
    if (this.m_props.virtual) {
      this._buildItems();
    } else if (this.m_props.populate) {
      this.items = this.m_props.populate(null);
    }
  }
  render(props) {
    props.items = props.items || [];
    props.gadgets = props.gadgets;
    props.renderItem = props.renderItem;
    props.virtual = props.virtual ?? false;
    this.m_topIndex = 0;
    if (props.virtual) {
      console.assert(props.itemHeight !== void 0);
      this.m_itemHeight = props.itemHeight;
      this.m_cache = /* @__PURE__ */ new Map();
      this.addClass("virtual");
    } else {
      this.m_itemHeight = void 0;
      this.m_cache = void 0;
    }
    this._buildContent();
  }
  /**
   * change the list of item displayed
   * @param items - new array of items
   * @deprecated
   */
  set items(items) {
    this.setItems(items);
  }
  get items() {
    return this.m_props.items;
  }
  /**
   * change the list of item displayed
   * @param items - new array of items
   */
  setItems(items, keepSel = true) {
    this.m_props.items = items;
    if (!keepSel) {
      this.m_selection = null;
    }
    if (!this.m_container) {
      this._buildContent();
    } else {
      this._buildItems();
    }
  }
  handleKey(ev) {
    let moveSel = /* @__PURE__ */ __name((sens) => {
      let items;
      if (isFunction(this.m_props.items)) {
        items = this.m_props.items();
        this.m_props.items = items;
      } else {
        items = this.m_props.items;
      }
      let newsel;
      if (!this.m_selection) {
        if (items) {
          newsel = items[0];
        }
      } else {
        let index = items.findIndex((item) => item === this.m_selection.item);
        if (sens > 0 && index < items.length - 1) {
          newsel = items[index + 1];
        } else if (sens < 0 && index > 0) {
          newsel = items[index - 1];
        } else {
          newsel = this.selection;
        }
      }
      let citem = this._findItemWithId(newsel?.id);
      this._selectItem(newsel, citem, true);
    }, "moveSel");
    switch (ev.key) {
      case "ArrowDown": {
        moveSel(1);
        ev.preventDefault();
        ev.stopPropagation();
        break;
      }
      case "ArrowUp": {
        moveSel(-1);
        ev.preventDefault();
        ev.stopPropagation();
        break;
      }
    }
  }
  /** @ignore */
  _buildContent() {
    let props = this.m_props;
    if (props.virtual) {
      this.m_container = new Container({
        cls: "@scroll-container",
        content: []
      });
      this.m_view = new Container({
        cls: "@scroll-view",
        flex: 1,
        content: this.m_container,
        dom_events: {
          sizechange: () => this._updateScroll(true),
          scroll: () => this._updateScroll(false)
        }
      });
      this.setContent(
        [
          this.m_view,
          props.gadgets ? new HLayout({
            cls: "gadgets",
            content: props.gadgets
          }) : null
        ]
      );
    } else {
      this.m_view = void 0;
      this.m_container = new VLayout({
        cls: "@scroll-container",
        content: []
      });
      this.addClass("@scroll-view");
      this.setContent(this.m_container, false);
    }
    if (props.virtual) {
      this.m_container.setStyleValue("height", props.items.length * this.m_itemHeight);
    }
    if (this.dom || !props.virtual) {
      this._buildItems();
    }
  }
  /**
   * 
   */
  _updateScroll(forceUpdate) {
    const update = /* @__PURE__ */ __name(() => {
      let newTop = Math.floor(this.m_view.dom.scrollTop / this.m_itemHeight);
      if (newTop != this.m_topIndex || forceUpdate) {
        this.m_topIndex = newTop;
        this._buildItems();
      }
    }, "update");
    if (forceUpdate) {
      this.startTimer("scroll", 10, false, update);
    } else {
      update();
    }
  }
  async _buildItems() {
    let props = this.m_props;
    let items = [];
    let list_items = props.items;
    if (isFunction(list_items)) {
      list_items = list_items();
    }
    let selId = this.m_selection?.item.id;
    let selFnd = false;
    if (props.virtual) {
      let rc = this.getBoundingRect();
      let limit = 100;
      let y = 0;
      let top = this.m_topIndex * this.m_itemHeight;
      let index = this.m_topIndex;
      let height = rc.height;
      let count = props.items.length;
      let newels = [];
      let cache = this.m_cache;
      this.m_cache = /* @__PURE__ */ new Map();
      while (y < height && index < count && --limit > 0) {
        let it = props.items[index];
        let itm;
        if (cache.has(it.id)) {
          itm = cache.get(it.id);
          cache.delete(it.id);
        } else {
          itm = this._renderItem(it);
          newels.push(itm);
        }
        if (selId == it.id) {
          itm.addClass("@selected");
          selFnd = true;
        }
        itm.setStyleValue("top", top + y);
        items.push(itm);
        this.m_cache.set(it.id, itm);
        y += this.m_itemHeight;
        index++;
      }
      cache.forEach((c) => {
        c.dispose();
      });
      this.m_container.appendChild(newels);
      this.m_container.setStyleValue("height", count * this.m_itemHeight);
      if (!selFnd) {
        if (!list_items.some((it) => selId == it.id)) {
          this.m_selection = null;
        }
      }
    } else {
      list_items.forEach((it) => {
        let itm = this._renderItem(it);
        if (selId == it.id) {
          itm.addClass("@selected");
          selFnd = true;
        }
        items.push(itm);
      });
      this.m_container.setContent(items, false);
      if (!selFnd) {
        this.m_selection = null;
      }
    }
    if (this.m_defer_sel) {
      let t = this.m_defer_sel;
      this.m_defer_sel = void 0;
      this.selection = t;
    }
  }
  /** @ignore 
   * default rendering of an item
   */
  _renderItem(item) {
    const newItem = this.onRenderItem(item);
    newItem.setAttribute("data-id", item.id);
    newItem.addClass("@list-item");
    newItem.setData("item-id", item.id);
    return newItem;
  }
  onRenderItem(item) {
    if (this.m_props.renderItem) {
      return this.m_props.renderItem(item);
    } else {
      return new HLayout({ content: item.text });
    }
  }
  /** @ignore */
  _handleClick(e) {
    e.stopImmediatePropagation();
    e.preventDefault();
    let dom = e.target, self = this.dom, list_items = this.m_props.items;
    while (dom && dom != self) {
      let itm = Component.getElement(dom), id = itm?.getData("item-id");
      if (id !== void 0) {
        let item = list_items.find((item2) => item2.id == id);
        if (item) {
          let event;
          if (e.type == "click") {
            event = EvClick(item);
            this.emit("click", event);
          } else {
            event = EvDblClick(item);
            this.emit("dblClick", event);
          }
          if (!event.defaultPrevented) {
            this._selectItem(item, itm);
          }
        } else {
          this._selectItem(null, null);
        }
        return;
      }
      dom = dom.parentElement;
    }
    this._selectItem(null, null);
  }
  /** @ignore */
  _handleCtxMenu(e) {
    e.preventDefault();
    let dom = e.target, self = this.dom, list_items = this.m_props.items;
    while (dom && dom != self) {
      let itm = Component.getElement(dom), id = itm?.getData("item-id");
      if (id) {
        let item = list_items.find((item2) => item2.id == id);
        if (item) {
          this._selectItem(item, itm);
          this.emit("contextMenu", EvContextMenu(e, item));
        }
        return;
      }
      dom = dom.parentElement;
    }
    this.emit("contextMenu", EvContextMenu(e, null));
  }
  /**
   * @ignore
   * called when an item is selected by mouse
   */
  _selectItem(item, citem, notify = true) {
    if (this.m_selection && this.m_selection.citem) {
      this.m_selection.citem.removeClass("@selected");
    }
    this.m_selection = item ? {
      item,
      citem
    } : null;
    if (this.m_selection && this.m_selection.citem) {
      this.m_selection.citem.addClass("@selected");
    }
    if (notify) {
      this.emit("selectionChange", EvSelectionChange(item));
    }
  }
  /**
   * return the current selection or null
   */
  get selection() {
    return this.m_selection ? this.m_selection.item : null;
  }
  set selection(id) {
    if (id === null || id === void 0) {
      this._selectItem(null, null);
    } else {
      if (isFunction(this.m_props.items)) {
        this.m_defer_sel = id;
      } else {
        let item = this.m_props.items.find((item2) => item2.id == id);
        let citem = this._findItemWithId(item.id);
        this._selectItem(item, citem, false);
      }
    }
  }
  _findItemWithId(id) {
    let citem = null;
    if (this.dom) {
      this.m_container.enumChilds((c) => {
        if (c.getData("item-id") == id) {
          c.scrollIntoView();
          citem = c;
          return true;
        }
      });
    }
    return citem;
  }
  /**
   * append or prepend a new item
   * @param item 
   * @param prepend 
   * @param select 
   */
  appendItem(item, prepend = false, select = true) {
    if (prepend) {
      this.m_props.items.unshift(item);
    } else {
      this.m_props.items.push(item);
    }
    if (select) {
      this.selection = null;
    }
    if (!this.m_container) {
      this._buildContent();
    } else {
      this._buildItems();
    }
    if (select) {
      this.selection = item.id;
    }
  }
  /**
   * update an item
   */
  updateItem(id, item) {
    const idx = this.m_props.items.findIndex((itm) => itm.id === id);
    if (idx < 0) {
      return;
    }
    let was_sel = false;
    if (this.m_selection && this.m_selection.item === this.m_props.items[idx]) {
      was_sel = true;
    }
    this.m_props.items[idx] = item;
    const oldDOM = this.queryItem(`[data-id="${item.id}"]`)?.dom;
    if (oldDOM) {
      const _new = this._renderItem(item);
      if (was_sel) {
        _new.addClass("@selected");
        this.m_selection.citem = _new;
        this.m_selection.item = item;
      }
      const newDOM = _new._build();
      this.m_container.dom.replaceChild(newDOM, oldDOM);
    }
  }
};
__name(ListView, "ListView");
function EvCancel(context = null) {
  return BasicEvent({ context });
}
__name(EvCancel, "EvCancel");
var PopupListView = class extends Popup {
  m_list;
  constructor(props) {
    super({ tabIndex: false });
    this.enableMask(false);
    this.addClass("@non-maskable");
    props.tabIndex = false;
    this.m_list = new ListView(props);
    this.setContent(this.m_list);
    this.mapPropEvents(props, "cancel");
  }
  set items(items) {
    this.m_list.items = items;
  }
  handleKey(ev) {
    this.m_list.handleKey(ev);
  }
  // todo: move into popup
  _handleClick = (e) => {
    if (!this.dom) {
      return;
    }
    let newfocus = e.target;
    if (this.dom.contains(newfocus)) {
      return;
    }
    let dest = Component.getElement(newfocus, MenuItem);
    if (dest) {
      return;
    }
    this.signal("cancel", EvCancel());
    this.close();
  };
  // todo: move into popup
  show(modal) {
    x4document.addEventListener("mousedown", this._handleClick);
    super.show(modal);
  }
  hide() {
    x4document.removeEventListener("mousedown", this._handleClick);
    super.hide();
  }
  // todo: move into popup
  close() {
    x4document.removeEventListener("mousedown", this._handleClick);
    super.close();
  }
  get selection() {
    return this.m_list.selection;
  }
  set selection(itemId) {
    this.m_list.selection = itemId;
  }
};
__name(PopupListView, "PopupListView");

// src/tooltips.ts
var tipTmo;
var tooltip;
var Tooltip = class extends Component {
  m_text;
  set text(text) {
    this.m_text.text = text;
  }
  /** @ignore */
  render() {
    this.setClass("@non-maskable", true);
    this.setContent([
      new Icon({ icon: "var( --x4-icon-tip )" }),
      this.m_text = new Label({ text: "help" })
    ]);
  }
  /**
  * display the menu at a specific position
  * @param x 
  * @param y 
  */
  displayAt(x, y, align = "top left") {
    this.show();
    let halign = "l", valign = "t";
    if (align.indexOf("right") >= 0) {
      halign = "r";
    }
    if (align.indexOf("bottom") >= 0) {
      valign = "b";
    }
    let rc = x4document.body.getBoundingClientRect(), rm = this.getBoundingRect();
    if (halign == "r") {
      x -= rm.width;
    }
    if (valign == "b") {
      y -= rm.height;
    }
    if (x + rm.width > rc.right) {
      x = rc.right - rm.width;
    }
    if (y + rm.height > rc.bottom) {
      y = rc.bottom - rm.height - 17;
    }
    this.setStyle({ left: x, top: y });
  }
};
__name(Tooltip, "Tooltip");
function initTooltips(cb) {
  if (isTouchDevice()) {
    return;
  }
  let tipTarget = {
    target: null,
    x: 0,
    y: 0
  };
  function handle_mpos(event) {
    tipTarget.x = event.pageX;
    tipTarget.y = event.pageY;
  }
  __name(handle_mpos, "handle_mpos");
  function handle_mouse(event) {
    let target = event.target;
    let tip = null;
    tipTarget.x = event.pageX + 10;
    tipTarget.y = event.pageY + 15;
    while (target) {
      tip = target.getAttribute("tip");
      if (tip) {
        break;
      }
      target = target.parentElement;
    }
    if (target == tipTarget.target || tooltip && target == tooltip.dom) {
      return;
    }
    if (!target || !tip) {
      tipTarget.target = null;
      if (cb) {
        cb(null);
      } else {
        _hideTip();
      }
      return;
    }
    tipTarget.target = target;
    if (cb) {
      cb(null);
    } else {
      _hideTip();
    }
    if (cb) {
      cb(tip);
    } else {
      tipTmo = setTimeout(() => {
        if (tooltip === void 0) {
          tooltip = new Tooltip({});
          x4document.body.appendChild(tooltip._build());
        }
        tooltip.text = tip;
        tooltip.displayAt(tipTarget.x + 17, tipTarget.y + 17, "top left");
      }, 700);
    }
  }
  __name(handle_mouse, "handle_mouse");
  function _hideTip() {
    if (tipTmo) {
      clearTimeout(tipTmo);
    }
    if (tooltip) {
      tooltip.hide();
    }
  }
  __name(_hideTip, "_hideTip");
  x4document.body.addEventListener("mouseover", handle_mouse);
  x4document.body.addEventListener("mouseout", handle_mouse);
  x4document.body.addEventListener("mousemove", handle_mpos);
}
__name(initTooltips, "initTooltips");

// src/input.ts
var Input = class extends Component {
  m_error_tip;
  constructor(props) {
    super(props);
  }
  componentDisposed() {
    if (this.m_error_tip) {
      this.m_error_tip.dispose();
    }
    super.componentDisposed();
  }
  /** @ignore */
  render(props) {
    this.setTag("input");
    this._setTabIndex(props.tabIndex);
    this.setAttributes({
      value: props.value,
      type: props.type || "text",
      name: props.name,
      placeholder: props.placeHolder,
      autofocus: props.autoFocus,
      readonly: props.readOnly,
      autocomplete: "off",
      // chrome ignore 'off' but not something else than 'on'
      tabIndex: props.tabIndex,
      spellcheck: props.spellcheck === false ? "false" : void 0,
      min: props.min,
      max: props.max,
      ...props.attrs
    });
    this.m_props.autosel = props.autosel ?? true;
    if (props.uppercase) {
      this.setStyleValue("textTransform", "uppercase");
    }
    if (this.m_props.autosel) {
      this.setDomEvent("focus", () => {
        this.selectAll();
      });
    }
  }
  showError(text) {
    if (!this.m_error_tip) {
      this.m_error_tip = new Tooltip({ cls: "error" });
      x4document.body.appendChild(this.m_error_tip._build());
    }
    let rc = this.getBoundingRect();
    this.m_error_tip.text = text;
    this.m_error_tip.displayAt(rc.right, rc.top - 8, "top right");
    this.addClass("@error");
  }
  clearError() {
    if (this.m_error_tip) {
      this.m_error_tip.hide();
      this.removeClass("@error");
    }
  }
  getType() {
    return this.m_props.type;
  }
  /**
      * return the current editor value
      */
  get value() {
    return this.getValue();
  }
  getValue() {
    const dom = this.dom;
    if (this.dom) {
      this.m_props.value = dom.value;
    }
    if (this.m_props.uppercase) {
      let upper = this.m_props.value.toUpperCase();
      if (dom && upper != this.m_props.value) {
        dom.value = upper;
      }
      this.m_props.value = upper;
    }
    return this.m_props.value;
  }
  /**
   * Change the editor value
   * @param value - new value to set
   */
  set value(value) {
    this.setValue(value);
  }
  setValue(value) {
    this.m_props.value = value;
    if (this.dom) {
      this.dom.value = value;
    }
  }
  getStoreValue() {
    if (this.m_props.value_hook) {
      return this.m_props.value_hook.get();
    } else {
      let type = this.getAttribute("type");
      if (type) {
        type = type.toLowerCase();
      }
      let value;
      const dom = this.dom;
      if (type === "file") {
        value = [];
        let files = dom.files;
        for (let file = 0; file < files.length; file++) {
          value.push(files[file].name);
        }
      } else if (type === "checkbox") {
        if (dom.checked) {
          value = 1;
        } else {
          value = 0;
        }
      } else if (type === "radio") {
        if (dom.checked) {
          value = this.value;
        }
      } else if (type === "date") {
        debugger;
      } else if (type == "number") {
        value = this.value;
        if (value.indexOf(",") >= 0) {
          value = value.replace(",", ".");
        }
      } else {
        value = this.value;
      }
      return value;
    }
  }
  setStoreValue(v) {
    this.clearError();
    if (this.m_props.value_hook) {
      return this.m_props.value_hook.set(v);
    } else {
      let type = this.getAttribute("type"), dom = this.dom;
      if (type) {
        type = type.toLowerCase();
      }
      if (type === "checkbox") {
        let newval = v !== null && v !== "0" && v !== 0 && v !== false;
        if (newval !== dom.checked) {
          dom.setAttribute("checked", "" + newval);
          dom.dispatchEvent(new Event("change"));
        }
      } else {
        this.value = v;
      }
    }
  }
  set readOnly(ro) {
    this.setAttribute("readonly", ro);
  }
  /**
   * select all the text
   */
  selectAll() {
    this.dom.select();
  }
  /**
   * select a part of the text
   * @param start 
   * @param length 
   */
  select(start, length = 9999) {
    this.dom.setSelectionRange(start, start + length);
  }
  /**
   * get the selection as { start, length }
   */
  getSelection() {
    let idom = this.dom;
    return {
      start: idom.selectionStart,
      length: idom.selectionEnd - idom.selectionStart
    };
  }
};
__name(Input, "Input");

// src/button.ts
var BaseButton = class extends Component {
  constructor(props) {
    super(props);
    this.setTag("button");
    this.setDomEvent("click", (e) => this._handleClick(e));
    this.setDomEvent("mousedown", () => {
      this._startAutoRep(true);
    });
    this.setDomEvent("mouseup", () => {
      this._startAutoRep(false);
    });
    this.setDomEvent("keydown", (e) => this._handleKeyDown(e));
    this.mapPropEvents(props, "click");
  }
  render(props) {
    const action = props.action;
    let icon = props.icon;
    let text = props.text;
    if (action) {
      if (!icon && action.props.icon) {
        icon = action.props.icon;
      }
      if (text === void 0 && action.props.text) {
        text = action.props.text;
      }
    }
    const ui_icon = icon ? new Icon({ icon, cls: "left", ref: "l_icon" }) : null;
    const ui_label = new Label({ flex: 1, text: text ?? "", align: props.align, ref: "label" });
    const ui_ricon = props.rightIcon ? new Icon({ icon: props.rightIcon, cls: "right", ref: "r_icon" }) : null;
    if (text === void 0) {
      ui_label.addClass("@hidden");
    }
    this.setContent([ui_icon, ui_label, ui_ricon]);
    this._setTabIndex(props.tabIndex);
  }
  /**
   * starts/stops the autorepeat
   */
  _startAutoRep(start) {
    if (!this.m_props.autoRepeat) {
      return;
    }
    if (start) {
      this.startTimer("repeat", 700, false, () => {
        this.startTimer("repeat", this.m_props.autoRepeat, true, this._sendClick);
      });
    } else {
      this.stopTimer("repeat");
    }
  }
  /**
   * 
   */
  _handleKeyDown(ev) {
    if (!ev.ctrlKey && !ev.shiftKey && !ev.altKey) {
      if (ev.key == "Enter" || ev.key == " ") {
        this._sendClick();
        ev.preventDefault();
        ev.stopPropagation();
      }
    }
  }
  /**
   * called by the system on click event
   */
  _handleClick(ev) {
    if (this.m_props.menu) {
      let menu = new Menu({
        items: isFunction(this.m_props.menu) ? this.m_props.menu() : this.m_props.menu
      });
      let rc = this.getBoundingRect();
      menu.displayAt(rc.left, rc.bottom, "tl");
    } else {
      this._sendClick();
    }
    ev.preventDefault();
    ev.stopPropagation();
  }
  /**
   * sends a click to the observers
   */
  _sendClick() {
    if (this.m_props.menu) {
      let menu = new Menu({
        items: isFunction(this.m_props.menu) ? this.m_props.menu() : this.m_props.menu
      });
      let rc = this.getBoundingRect();
      menu.displayAt(rc.left, rc.bottom, "tl");
    } else {
      this.emit("click", EvClick());
      if (this.m_props.action) {
        this.m_props.action.fire();
      }
    }
  }
  /**
   * change the button text
   * @example
   * ```ts
   * let btn = new Button( {
   * 	text: 'hello'
   * });
   * 
   * btn.text = 'world';
   * ```
   */
  set text(text) {
    this.m_props.text = text;
    let label = this.itemWithRef("label");
    if (label) {
      label.text = text;
      label.removeClass("@hidden");
    }
  }
  get text() {
    let label = this.itemWithRef("label");
    return label?.text;
  }
  /**
   * change the button icon
   * todo: do nothing if no icon defined at startup
   *
   * @example
   * ```ts
   * let btn = new Button( {
   * 	text: 'hello',
   *  icon: 'close'
   * });
   * btn.setIcon( 'open' );
   * ```
   */
  set icon(icon) {
    this.m_props.icon = icon;
    let ico = this.itemWithRef("l_icon");
    if (ico) {
      ico.icon = icon;
    } else {
      this.update();
    }
  }
  get icon() {
    let ico = this.itemWithRef("l_icon");
    return ico?.icon;
  }
  /**
   * change the button right icon
   * todo: do nothing if no icon defined at startup
   *
   * @example
   * ```ts
   * let btn = new Button( {
   * 	text: 'hello',
   *  icon: 'close'
   * });
   * btn.setIcon( 'open' );
   * ```
   */
  set rightIcon(icon) {
    this.m_props.rightIcon = icon;
    let ico = this.itemWithRef("r_icon");
    if (ico) {
      ico.icon = icon;
    }
  }
  get rightIcon() {
    let ico = this.itemWithRef("l_icon");
    return ico?.icon;
  }
  /**
   * 
   */
  set menu(items) {
    this.m_props.menu = items;
  }
};
__name(BaseButton, "BaseButton");
var Button = class extends BaseButton {
};
__name(Button, "Button");
var ToggleButton = class extends BaseButton {
  constructor(props) {
    super(props);
  }
  /**
   * 
   */
  render(props) {
    super.render(props);
    if (props.checked) {
      this.addClass("checked");
      this._updateIcon();
    }
  }
  /**
   * 
   */
  _sendClick() {
    super._sendClick();
    this.m_props.checked = !this.m_props.checked;
    this.setClass("checked", this.m_props.checked);
    this.emit("change", EvChange(this.m_props.checked));
    this._updateIcon();
  }
  _updateIcon() {
    if (this.m_props.checkedIcon) {
      const ic = this.m_props.checked ? this.m_props.checkedIcon : this.m_props.icon;
      let ico = this.itemWithRef("l_icon");
      if (ico) {
        ico.icon = ic;
      }
    }
  }
};
__name(ToggleButton, "ToggleButton");

// src/calendar.ts
var Calendar = class extends VLayout {
  m_date;
  constructor(props) {
    super(props);
    this.mapPropEvents(props, "change");
    this.m_date = props.date?.clone() ?? /* @__PURE__ */ new Date();
  }
  /** @ignore */
  render(props) {
    let month_start = date_clone(this.m_date);
    month_start.setDate(1);
    let day = month_start.getDay();
    if (day == 0) {
      day = 7;
    }
    month_start.setDate(-day + 1 + 1);
    let dte = date_clone(month_start);
    let today = this.m_date.hash();
    let month_end = date_clone(this.m_date);
    month_end.setDate(1);
    month_end.setMonth(month_end.getMonth() + 1);
    month_end.setDate(0);
    let end_of_month = date_hash(month_end);
    let rows = [];
    let header = new HLayout({
      cls: "month-sel",
      content: [
        new Label({
          cls: "month",
          text: formatIntlDate(this.m_date, "O"),
          dom_events: {
            click: () => this._choose("month")
          }
        }),
        new Label({
          cls: "year",
          text: formatIntlDate(this.m_date, "Y"),
          dom_events: {
            click: () => this._choose("year")
          }
        }),
        new Flex(),
        new Button({ text: "<", click: () => this._next(false) }),
        new Button({ text: ">", click: () => this._next(true) })
      ]
    });
    rows.push(header);
    let day_names = [];
    day_names.push(new HLayout({
      cls: "weeknum cell"
    }));
    for (let d = 0; d < 7; d++) {
      day_names.push(new Label({
        cls: "cell",
        flex: 1,
        text: _tr.global.day_short[(d + 1) % 7]
      }));
    }
    rows.push(new HLayout({
      cls: "week header",
      content: day_names
    }));
    let cmonth = this.m_date.getMonth();
    let first = true;
    while (date_hash(dte) <= end_of_month) {
      let days = [
        new HLayout({ cls: "weeknum cell", content: new Component({ tag: "span", content: formatIntlDate(dte, "w") }) })
      ];
      for (let d = 0; d < 7; d++) {
        let cls = "cell day";
        if (dte.hash() == today) {
          cls += " today";
        }
        if (dte.getMonth() != cmonth) {
          cls += " out";
        }
        const mkItem = /* @__PURE__ */ __name((dte2) => {
          return new HLayout({
            cls,
            flex: 1,
            content: new Component({
              tag: "span",
              content: formatIntlDate(dte2, "d")
            }),
            dom_events: {
              click: () => this.select(dte2)
            }
          });
        }, "mkItem");
        days.push(mkItem(dte.clone()));
        dte.setDate(dte.getDate() + 1);
        first = false;
      }
      rows.push(new HLayout({
        cls: "week",
        flex: 1,
        content: days
      }));
    }
    this.setContent(rows);
  }
  /**
   * select the given date
   * @param date 
   */
  select(date) {
    this.m_date = date;
    this.emit("change", EvChange(date));
    this.update();
  }
  /**
   * 
   */
  _next(n) {
    this.m_date.setMonth(this.m_date.getMonth() + (n ? 1 : -1));
    this.update();
  }
  /**
   * 
   */
  _choose(type) {
    let items = [];
    if (type == "month") {
      for (let m = 0; m < 12; m++) {
        items.push(new MenuItem({
          text: _tr.global.month_long[m],
          click: () => {
            this.m_date.setMonth(m);
            this.update();
          }
        }));
      }
    } else if (type == "year") {
      let min = this.m_props.minDate?.getFullYear() ?? 1900;
      let max = this.m_props.maxDate?.getFullYear() ?? 2037;
      for (let m = max; m >= min; m--) {
        items.push(new MenuItem({
          text: "" + m,
          click: () => {
            this.m_date.setFullYear(m);
            this.update();
          }
        }));
      }
    }
    let menu = new Menu({
      items
    });
    let rc = this.getBoundingRect();
    menu.displayAt(rc.left, rc.top);
  }
  get date() {
    return this.m_date;
  }
  set date(date) {
    this.m_date = date;
    this.update();
  }
};
__name(Calendar, "Calendar");
var PopupCalendar = class extends Popup {
  m_cal;
  constructor(props) {
    super({ tabIndex: 1 });
    this.enableMask(false);
    this.m_cal = new Calendar(props);
    this.m_cal.addClass("@fit");
    this.setContent(this.m_cal);
  }
  // binded
  _handleClick = (e) => {
    if (!this.dom) {
      return;
    }
    let newfocus = e.target;
    if (this.dom.contains(newfocus)) {
      return;
    }
    let dest = Component.getElement(newfocus, MenuItem);
    if (dest) {
      return;
    }
    this.close();
  };
  /** @ignore */
  show(modal, at) {
    x4document.addEventListener("mousedown", this._handleClick);
    if (at) {
      super.displayAt(at.x, at.y, "top left", void 0, modal);
    } else {
      super.show(modal);
    }
  }
  /** @ignore */
  close() {
    x4document.removeEventListener("mousedown", this._handleClick);
    super.close();
  }
};
__name(PopupCalendar, "PopupCalendar");

// src/textedit.ts
var reEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var TextEdit = class extends Component {
  m_cal_popup;
  m_ui_input;
  constructor(props) {
    super(props);
    this.addClass("@hlayout");
    this.mapPropEvents(props, "change", "click", "focus");
  }
  componentCreated() {
    super.componentCreated();
    if (this.m_props.autoFocus) {
      this.focus();
    }
  }
  focus() {
    this.m_ui_input.focus();
  }
  /** @ignore */
  render(props) {
    let eprops = {
      flex: 1,
      dom_events: {
        focus: () => this._focus(),
        focusout: () => this._blur(),
        input: () => this._change()
      },
      value: props.value,
      name: props.name,
      type: props.type,
      placeHolder: props.placeHolder,
      autoFocus: props.autoFocus,
      readOnly: props.readOnly,
      value_hook: props.value_hook,
      uppercase: props.uppercase,
      spellcheck: props.spellcheck,
      tabIndex: props.tabIndex === void 0 ? true : props.tabIndex,
      attrs: props.attrs,
      min: props.min,
      max: props.max,
      autosel: props.autosel
    };
    if (props.type == "date") {
      props.format = props.format ?? "Y-M-D";
      eprops.type = "text";
      let def_hook = {
        get: () => this._date_get_hook(),
        set: (e) => this._date_set_hook(e)
      };
      eprops.value_hook = props.value_hook ?? def_hook;
    }
    this.m_ui_input = new Input(eprops);
    let button = void 0;
    if (props.icon) {
      button = new Button({
        icon: props.icon,
        click: () => this._btnClick(),
        tabIndex: false
      });
    } else if (props.type == "date") {
      button = new Button({
        cls: "gadget",
        icon: "var( --x4-icon-calendar-days )",
        tabIndex: false,
        click: () => this._showDatePicker(button)
      });
      if (!props.validator) {
        props.validator = this._date_validator;
      }
    }
    let ag = props.gadgets ?? [];
    ag.forEach((b) => {
      b.addClass("gadget");
    });
    let gadgets = [button, ...ag];
    this.setClass("@required", props.required);
    if (props.gadgets && props.gadgets.length) {
      this.addClass("with-gadgets");
    }
    let width = void 0, flex = void 0, labelWidth = props.labelWidth;
    if (labelWidth > 0) {
      width = labelWidth;
    }
    if (labelWidth < 0) {
      flex = -labelWidth;
    }
    let label = void 0;
    let labelAlign = props.labelAlign;
    let top = false;
    if (props.label) {
      if (labelAlign == "top") {
        labelAlign = "left";
        top = true;
        flex = 1;
      }
      label = new Label({
        ref: "label",
        tag: "label",
        cls: "label1" + (props.label ? "" : " @hidden"),
        // todo: why 'label1' class name ?
        text: props.label ?? "",
        width,
        flex,
        align: labelAlign
      });
    }
    if (top) {
      this.removeClass("@hlayout");
      this.addClass("@vlayout vertical");
      this.setContent([
        label,
        new HLayout({ width, content: [this.m_ui_input, ...gadgets] })
      ]);
    } else {
      this.addClass("@hlayout");
      this.setContent([label, this.m_ui_input, ...gadgets]);
    }
  }
  enable(ena) {
    if (ena === true) {
      this.m_ui_input.enable();
    }
    super.enable(ena);
  }
  disable() {
    this.m_ui_input.disable();
    super.disable();
  }
  _btnClick() {
    this.emit("click", EvClick(this.value));
  }
  /**
   * select the value format for input/output on textedit of type date
   * cf. formatIntlDate / parseIntlDate
   * @param fmt 
   */
  setDateStoreFormat(fmt) {
    this.m_props.format = fmt;
  }
  setStoreValue(value) {
    this.m_ui_input.setStoreValue(value);
  }
  getStoreValue() {
    return this.m_ui_input.getStoreValue();
  }
  _date_get_hook() {
    let date = parseIntlDate(this.value);
    let props = this.m_props;
    if (props.format == "native") {
      return date;
    } else {
      return date ? formatIntlDate(date, props.format) : null;
    }
  }
  _date_set_hook(dte) {
    let props = this.m_props;
    if (props.format == "native") {
      this.value = formatIntlDate(dte);
    } else if (dte) {
      let date = parseIntlDate(dte, props.format);
      this.value = formatIntlDate(date);
    } else {
      this.value = "";
    }
  }
  showError(text) {
    this.m_ui_input.showError(text);
  }
  clearError() {
    this.m_ui_input.clearError();
  }
  get value() {
    return this.getValue();
  }
  getValue() {
    if (this.m_ui_input) {
      return this.m_ui_input.value;
    } else {
      return this.m_props.value;
    }
  }
  /**
   * 
   */
  set value(value) {
    this.setValue(value);
  }
  setValue(value) {
    if (this.m_ui_input) {
      this.m_ui_input.value = value;
    } else {
      this.m_props.value = value;
    }
  }
  /**
   * select all the text
   */
  selectAll() {
    this.m_ui_input.selectAll();
  }
  select(start, length = 9999) {
    this.m_ui_input.select(start, length);
  }
  getSelection() {
    return this.m_ui_input.getSelection();
  }
  set readOnly(ro) {
    this.m_ui_input.readOnly = ro;
  }
  get label() {
    return this.itemWithRef("label")?.text;
  }
  set label(text) {
    this.itemWithRef("label").text = text;
  }
  /**
   * content changed
   * todo: should move into Input
   */
  _change() {
    let value = this.m_ui_input.value;
    this.emit("change", EvChange(value));
  }
  /**
   * getting focus
   */
  _focus() {
    this.clearError();
    this.emit("focus", EvFocus(true));
  }
  /**
   * loosing focus
   * @param value 
   */
  _blur() {
    this._validate(this.m_ui_input.value);
    this.emit("focus", EvFocus(false));
  }
  /**
   * todo: should move into Input
   * @returns 
   */
  validate() {
    return this._validate(this.value);
  }
  _validate(value) {
    let props = this.m_props;
    let update = false;
    if (props.required && value.length == 0) {
      this.showError(_tr.global.required_field);
      return false;
    }
    if (value != "") {
      let pattern = this.getAttribute("pattern");
      if (pattern) {
        let re = new RegExp(pattern);
        if (re && !re.test(value)) {
          this.showError(_tr.global.invalid_format);
          return false;
        }
      }
      if (props.type == "email") {
        if (!reEmail.test(value.toLowerCase())) {
          this.showError(_tr.global.invalid_email);
          return false;
        }
      } else if (props.type == "number") {
        const v = parseFloat(value);
        if (isNaN(v)) {
          this.showError(_tr.global.invalid_number);
          return false;
        }
        let min = parseFloat(this.m_ui_input.getAttribute("min"));
        if (min !== void 0 && v < min) {
          value = "" + min;
          update = true;
        }
        let max = parseFloat(this.m_ui_input.getAttribute("max"));
        if (max !== void 0 && v > max) {
          value = "" + max;
          update = true;
        }
      }
    }
    if (props.validator) {
      try {
        this.value = props.validator(value);
      } catch (err) {
        this.showError(err instanceof Error ? err.message : err);
        return false;
      }
    } else if (update) {
      this.value = value;
    }
    return true;
  }
  _date_validator(value) {
    value = value.trim();
    if (value == "") {
      return "";
    }
    let date;
    if (value == "@") {
      date = /* @__PURE__ */ new Date();
    } else {
      date = parseIntlDate(value);
      if (!date) {
        throw sprintf(_tr.global.invalid_date, _tr.global.date_format);
      }
    }
    return formatIntlDate(date);
  }
  //onKeyDown( e ) {
  //    if( this.readOnly ) {
  //        if( this.type=='date' && (e.key==' ' || e.key=='Enter') ) {
  //            this.showDatePicker( );
  //            e.stopPropagation( );
  //            e.preventDefault( );
  //        }
  //    }
  //}
  //onClick( e ) {
  //    if( this.readOnly ) {
  //        if( this.type=='date' ) {
  //            this.showDatePicker( );
  //            e.stopPropagation( );
  //            e.preventDefault( );
  //        }
  //    }
  //}
  _showDatePicker(btn) {
    if (!this.m_cal_popup) {
      this.m_cal_popup = new PopupCalendar({
        change: (ev) => {
          this.value = formatIntlDate(ev.value);
          this.m_cal_popup.close();
        }
      });
    }
    let rc = this.m_ui_input.getBoundingRect();
    this.m_cal_popup.displayAt(rc.left, rc.bottom, "top left");
  }
  get input() {
    return this.m_ui_input;
  }
  get type() {
    return this.m_props.type;
  }
};
__name(TextEdit, "TextEdit");

// src/autocomplete.ts
var AutoComplete = class extends TextEdit {
  m_popup;
  m_popvis;
  m_needval;
  m_lockpop;
  constructor(props) {
    super(props);
    this.setDomEvent("input", () => this._onChange());
    this.setDomEvent("focusin", () => this._onFocus());
    this.startTimer("focus-check", 100, true, () => this._checkFocus());
    this.m_popvis = false;
    this.m_needval = false;
    this.m_lockpop = false;
    this.setDomEvent("keydown", (e) => this._onKey(e));
  }
  _onKey(e) {
    if (this.m_popvis) {
      if (e.key == "ArrowUp" || e.key == "ArrowDown") {
        this.m_lockpop = true;
        this.m_popup.handleKey(e);
        this.m_lockpop = false;
        e.preventDefault();
        e.stopPropagation();
      } else if (e.key == "Escape") {
        this._hidePopup();
        e.preventDefault();
        e.stopPropagation();
      }
    } else if (e.key == "ArrowDown") {
      this._onChange();
      e.preventDefault();
      e.stopPropagation();
    }
  }
  async _onChange() {
    let items = this.m_props.enumValues(this.value);
    if (items instanceof Promise) {
      items = await items;
    }
    if (items.length == 0) {
      this._hidePopup();
      return;
    }
    this._showPopup(items);
  }
  componentDisposed() {
    if (this.m_popup) {
      this._hidePopup();
    }
    super.componentDisposed();
  }
  showPopup(show = true) {
    if (show) {
      this._onChange();
    } else {
      this._hidePopup();
    }
  }
  /** 
   * display the popup 
   */
  _showPopup(items) {
    let props = this.m_props;
    if (props.readOnly || this.hasClass("@disable")) {
      return;
    }
    if (!this.m_popup) {
      let cstyle = this.getComputedStyle();
      let fontFamily = cstyle.value("fontFamily");
      let fontSize = cstyle.value("fontSize");
      this.m_popup = new PopupListView({
        cls: "@combo-popup",
        attrs: {
          tabindex: 0
        },
        selectionChange: (e) => {
          let value = e.selection.id;
          if (this.m_props.selectValue) {
            value = this.m_props.selectValue(value);
          }
          this.value = value;
          if (!this.m_lockpop) {
            this._hidePopup();
            this.focus();
          }
        },
        style: {
          fontFamily,
          fontSize
        },
        renderItem: props.renderItem
      });
    }
    if (items) {
      this.m_popup.items = items.map((c) => ({ id: c, text: c }));
    }
    let r1 = this.m_ui_input.getBoundingRect();
    this.m_popup.setStyle({
      minWidth: r1.width
    });
    this.m_popup.displayAt(r1.left, r1.bottom);
    this.m_popvis = true;
  }
  _validate(value) {
    return true;
  }
  validate() {
    return super._validate(this.value);
  }
  _checkFocus() {
    const focus = document.activeElement;
    if (this.dom && this.dom.contains(focus)) {
      return;
    }
    if (this.m_popup && this.m_popup.dom && this.m_popup.dom.contains(focus)) {
      return;
    }
    this._hidePopup();
  }
  _hidePopup() {
    if (this.m_popvis) {
      this.m_popup.close();
      this.m_popvis = false;
    }
    if (this.m_needval) {
      this.validate();
      this.m_needval = false;
    }
  }
  _onFocus() {
    if (this.value.length == 0) {
      this._onChange();
    }
    this.m_needval = true;
  }
  isPopupVisible() {
    return this.m_popvis;
  }
};
__name(AutoComplete, "AutoComplete");

// src/canvas.ts
function EvPaint(ctx) {
  return BasicEvent({ ctx });
}
__name(EvPaint, "EvPaint");
function mkPainter(c2d, w, h) {
  let cp = c2d;
  cp.width = w;
  cp.height = h;
  cp.smoothLine = smoothLine;
  cp.smoothLineEx = smoothLineEx;
  cp.line = line;
  cp.roundRect = roundRect;
  cp.calcTextSize = calcTextSize;
  cp.setFontSize = setFontSize;
  cp.circle = circle;
  return cp;
}
__name(mkPainter, "mkPainter");
function smoothLine(points, path = null, move = true) {
  if (points.length < 2) {
    return;
  }
  if (!path) {
    path = this;
  }
  if (points.length == 2) {
    if (move !== false) {
      path.moveTo(points[0].x, points[0].y);
    } else {
      path.lineTo(points[0].x, points[0].y);
    }
    path.lineTo(points[1].x, points[1].y);
    return;
  }
  function midPointBtw(p12, p22) {
    return {
      x: p12.x + (p22.x - p12.x) / 2,
      y: p12.y + (p22.y - p12.y) / 2
    };
  }
  __name(midPointBtw, "midPointBtw");
  function getQuadraticXY(t, sx, sy, cp1x, cp1y, ex, ey) {
    return {
      x: (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cp1x + t * t * ex,
      y: (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cp1y + t * t * ey
    };
  }
  __name(getQuadraticXY, "getQuadraticXY");
  let p1 = points[0], p2 = points[1], p3 = p1;
  path.moveTo(p1.x, p1.y);
  for (let i = 1, len = points.length; i < len; i++) {
    let midPoint = midPointBtw(p1, p2);
    for (let i2 = 0; i2 < 8; i2++) {
      let { x, y } = getQuadraticXY(i2 / 8, p3.x, p3.y, p1.x, p1.y, midPoint.x, midPoint.y);
      path.lineTo(x, y);
    }
    p1 = points[i];
    p2 = points[i + 1];
    p3 = midPoint;
  }
  path.lineTo(p1.x, p1.y);
}
__name(smoothLine, "smoothLine");
function smoothLineEx(_points, tension = 0.5, numOfSeg = 10, path = null, move = true, close = false) {
  let points = [];
  for (let p = 0, pc = _points.length; p < pc; p++) {
    points.push(_points[p].x);
    points.push(_points[p].y);
  }
  let pts, i = 1, l = points.length, rPos = 0, rLen = (l - 2) * numOfSeg + 2 + (close ? 2 * numOfSeg : 0), res = new Float32Array(rLen), cache = new Float32Array((numOfSeg + 2) * 4), cachePtr = 4;
  pts = points.slice(0);
  if (close) {
    pts.unshift(points[l - 1]);
    pts.unshift(points[l - 2]);
    pts.push(points[0], points[1]);
  } else {
    pts.unshift(points[1]);
    pts.unshift(points[0]);
    pts.push(points[l - 2], points[l - 1]);
  }
  cache[0] = 1;
  for (; i < numOfSeg; i++) {
    var st = i / numOfSeg, st2 = st * st, st3 = st2 * st, st23 = st3 * 2, st32 = st2 * 3;
    cache[cachePtr++] = st23 - st32 + 1;
    cache[cachePtr++] = st32 - st23;
    cache[cachePtr++] = st3 - 2 * st2 + st;
    cache[cachePtr++] = st3 - st2;
  }
  cache[cachePtr] = 1;
  parse(pts, cache, l);
  if (close) {
    pts = [];
    pts.push(points[l - 4], points[l - 3], points[l - 2], points[l - 1]);
    pts.push(points[0], points[1], points[2], points[3]);
    parse(pts, cache, 4);
  }
  function parse(pts2, cache2, l2) {
    for (var i2 = 2, t; i2 < l2; i2 += 2) {
      var pt1 = pts2[i2], pt2 = pts2[i2 + 1], pt3 = pts2[i2 + 2], pt4 = pts2[i2 + 3], t1x = (pt3 - pts2[i2 - 2]) * tension, t1y = (pt4 - pts2[i2 - 1]) * tension, t2x = (pts2[i2 + 4] - pt1) * tension, t2y = (pts2[i2 + 5] - pt2) * tension;
      for (t = 0; t < numOfSeg; t++) {
        var c = t << 2, c1 = cache2[c], c2 = cache2[c + 1], c3 = cache2[c + 2], c4 = cache2[c + 3];
        res[rPos++] = c1 * pt1 + c2 * pt3 + c3 * t1x + c4 * t2x;
        res[rPos++] = c1 * pt2 + c2 * pt4 + c3 * t1y + c4 * t2y;
      }
    }
  }
  __name(parse, "parse");
  l = close ? 0 : points.length - 2;
  res[rPos++] = points[l];
  res[rPos] = points[l + 1];
  if (!path) {
    path = this;
  }
  for (let i2 = 0, l2 = res.length; i2 < l2; i2 += 2) {
    if (i2 == 0 && move !== false) {
      path.moveTo(res[i2], res[i2 + 1]);
    } else {
      path.lineTo(res[i2], res[i2 + 1]);
    }
  }
}
__name(smoothLineEx, "smoothLineEx");
function line(x1, y1, x2, y2, color, lineWidth = 1) {
  this.save();
  this.beginPath();
  this.moveTo(x1, y1);
  this.lineTo(x2, y2);
  this.lineWidth = lineWidth;
  this.strokeStyle = color;
  this.stroke();
  this.restore();
}
__name(line, "line");
function roundRect(x, y, width, height, radius) {
  this.moveTo(x + radius, y);
  this.lineTo(x + width - radius, y);
  this.quadraticCurveTo(x + width, y, x + width, y + radius);
  this.lineTo(x + width, y + height - radius);
  this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  this.lineTo(x + radius, y + height);
  this.quadraticCurveTo(x, y + height, x, y + height - radius);
  this.lineTo(x, y + radius);
  this.quadraticCurveTo(x, y, x + radius, y);
  this.closePath();
}
__name(roundRect, "roundRect");
function calcTextSize(text, rounded = false) {
  let fh = this.measureText(text);
  let lh = fh.fontBoundingBoxAscent + fh.fontBoundingBoxDescent;
  if (rounded) {
    return { width: Math.round(fh.width), height: Math.round(lh) };
  } else {
    return { width: fh.width, height: lh };
  }
}
__name(calcTextSize, "calcTextSize");
function setFontSize(fs) {
  let fsize = Math.round(fs) + "px";
  this.font = this.font.replace(/\d+px/, fsize);
}
__name(setFontSize, "setFontSize");
function circle(x, y, radius) {
  this.moveTo(x + radius, y);
  this.arc(x, y, radius, 0, Math.PI * 2);
}
__name(circle, "circle");
var Canvas = class extends Component {
  m_iwidth = -1;
  m_iheight = -1;
  m_scale = 1;
  m_canvas;
  constructor(props) {
    super(props);
    this.setDomEvent("sizechange", () => {
      this._paint();
    });
    this.mapPropEvents(props, "paint");
  }
  /** @ignore */
  render() {
    this.m_iwidth = -1;
    this.m_iheight = -1;
    this.m_canvas = new Component({
      tag: "canvas"
    });
    this.setContent(this.m_canvas);
  }
  update(delay = 0) {
    this.m_iheight = this.m_iwidth = -1;
    super.update(delay);
  }
  /**
   * scale the whole canvas
   */
  scale(scale) {
    this.m_scale = scale;
    this.m_iwidth = -1;
    this.redraw();
  }
  /**
   * return the internal canvas
   */
  get canvas() {
    return this.m_canvas;
  }
  /**
   * redraw the canvas (force a paint)
   */
  $update_rep = 0;
  redraw(wait) {
    if (wait !== void 0) {
      if (++this.$update_rep >= 20) {
        this.stopTimer("update");
        this._paint();
      } else {
        this.startTimer("update", wait, false, () => this._paint());
      }
    } else {
      this.stopTimer("update");
      this._paint();
    }
  }
  /**
   * 
   */
  _paint() {
    this.$update_rep = 0;
    let dom = this.dom;
    if (!this.isUserVisible()) {
      return;
    }
    let canvas = this.m_canvas.dom, w = dom.clientWidth, h = dom.clientHeight;
    let ctx = canvas.getContext("2d");
    if (w != this.m_iwidth || h != this.m_iheight) {
      let devicePixelRatio = window.devicePixelRatio || 1;
      let backingStoreRatio = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;
      let canvas2 = this.canvas;
      if (devicePixelRatio !== backingStoreRatio || this.m_scale != 1) {
        let ratio = devicePixelRatio / backingStoreRatio, rw = w * ratio, rh = h * ratio;
        canvas2.setAttribute("width", "" + rw);
        canvas2.setAttribute("height", "" + rh);
        canvas2.setStyleValue("width", w);
        canvas2.setStyleValue("height", h);
        ratio *= this.m_scale;
        ctx.scale(ratio, ratio);
      } else {
        canvas2.setAttribute("width", "" + w);
        canvas2.setAttribute("height", "" + h);
        canvas2.setStyleValue("width", w);
        canvas2.setStyleValue("height", h);
        ctx.scale(1, 1);
      }
      this.m_iwidth = w;
      this.m_iheight = h;
    }
    if (w && h) {
      let cc = mkPainter(ctx, w, h);
      if (this.m_props.autoClear) {
        cc.clearRect(0, 0, w, h);
      }
      cc.save();
      cc.translate(-0.5, -0.5);
      this.paint(cc);
      cc.restore();
    }
  }
  paint(ctx) {
    try {
      if (this.m_props.painter) {
        this.m_props.painter(ctx);
      } else {
        this.emit("paint", EvPaint(ctx));
      }
    } catch (x) {
      console.assert(false, x);
    }
  }
};
__name(Canvas, "Canvas");

// src/cardview.ts
var CardView = class extends Component {
  m_cards;
  m_ipage;
  // initialy selected page
  m_cpage;
  // currently selected page
  constructor(props) {
    super(props);
    this.m_cards = [];
    this.m_ipage = props.active;
    this.m_cpage = null;
    this.singleShot(() => {
      this.setPages(props.pages);
    });
  }
  /** @ignore */
  render() {
    let pages = [];
    this.m_cards.forEach((p) => {
      if (p.page) {
        pages.push(p.page);
      }
    });
    this.setContent(pages);
  }
  /**
   * switch to a specific card
   * @param name - card name as define in constructor
   */
  switchTo(name) {
    if (this.m_cards.length == 0) {
      return;
    }
    if (name === void 0) {
      name = this.m_cards[0].name;
    }
    if (name === this.m_cpage?.name) {
      return;
    }
    if (this.m_cpage) {
      if (this.m_cpage.selector) {
        this.m_cpage.selector.removeClass("@active");
      }
      if (this.m_cpage.page && !(this.m_cpage.page instanceof Function)) {
        let page = this.m_cpage.page;
        page.removeClass("@active");
        page.addClass("@hidden");
      }
    }
    this.m_cpage = this.m_cards.find((card) => card.name == name);
    if (this.m_cpage) {
      if (this.m_cpage.page) {
        if (isFunction(this.m_cpage.page)) {
          this.m_cpage.page = this.m_cpage.page();
          console.assert(this.m_cpage.page != null, "You must return a valid component");
        }
        let page = this.m_cpage.page;
        page.addClass("@active");
        page.removeClass("@hidden");
        if (!page.dom) {
          this._preparePage(page);
        }
        if (this.m_cpage.selector) {
          this.m_cpage.selector.addClass("@active");
        }
      }
      this.emit("change", EvChange(this.m_cpage.name));
    }
  }
  /**
   * 
   */
  setPages(pages) {
    let active = this._initTabs(pages);
    if (active) {
      asap(() => {
        this.switchTo(active);
        this.update();
      });
    }
  }
  /**
   * 
   */
  _initTabs(pages) {
    if (!pages) {
      return;
    }
    let active = this.m_ipage;
    pages.forEach((p) => {
      if (!p) {
        return;
      }
      let card = { ...p };
      card.selector = this._prepareSelector(p);
      card.active = false;
      this.m_cards.push(card);
      if (!active) {
        active = p.name;
      }
      if (p.active) {
        active = p.name;
      }
    });
    return active;
  }
  _updateSelector() {
  }
  /**
   * prepare the cardinfo
   * can be used by derivations to create & set selectors
   */
  _prepareSelector(card) {
    return null;
  }
  /**
   * 
   */
  _preparePage(page) {
    page.setStyleValue("flex", 1);
    page.addClass("@tab-page");
  }
};
__name(CardView, "CardView");

// src/checkbox.ts
var CheckBox = class extends Component {
  constructor(props) {
    super(props);
    this.setDomEvent("focus", () => this._setFocus());
    this.mapPropEvents(props, "change");
    if (props.slider) {
      this.addClass("slider");
    }
  }
  /** @ignore */
  render(props) {
    let labelWidth = props.labelWidth ?? -1;
    let uid = "__cb_" + this.uid;
    this.setTag("label");
    this.addClass("@hlayout");
    this.addClass(props.align ?? "left");
    this.setContent([
      new Input({
        ref: "input",
        type: "checkbox",
        name: props.name,
        id: uid,
        tabIndex: props.tabIndex,
        value: props.value ?? "on",
        attrs: {
          checked: props.checked ? "" : void 0
        },
        dom_events: {
          change: this._change.bind(this)
        }
      }),
      props.slider ? new Component({ cls: "@slide-el" }) : null,
      new Label({
        text: props.text ?? "",
        width: labelWidth < 0 ? void 0 : labelWidth,
        flex: labelWidth < 0 ? -labelWidth : void 0,
        align: props.labelAlign ?? "left",
        style: {
          order: props.align == "right" ? -1 : 1
        },
        attrs: {
          "for": uid
        }
      })
    ]);
  }
  /**
   * check state changed
   */
  _change() {
    this.emit("change", EvChange(this.check));
  }
  /**
   * focus gained/loosed
   */
  _setFocus() {
    let input = this.itemWithRef("input");
    input.focus();
  }
  /**
   * @return the checked value
   */
  get check() {
    if (this.dom) {
      let input = this.itemWithRef("input");
      let dom = input.dom;
      return dom.checked;
    }
    return this.m_props.checked;
  }
  /**
   * change the checked value
   * @param {boolean} ck new checked value	
   */
  set check(ck) {
    if (this.dom) {
      let input = this.itemWithRef("input");
      const dom = input.dom;
      if (dom) {
        dom.checked = ck;
      }
    }
    this.m_props.checked = ck;
  }
  get text() {
    return this.itemWithRef("label").text;
  }
  set text(text) {
    this.itemWithRef("label").text = text;
  }
  /**
   * toggle the checkbox
   */
  toggle() {
    this.check = !this.check;
  }
};
__name(CheckBox, "CheckBox");

// src/color.ts
var colorValues = {
  "lightsalmon": 4294942842,
  "lightseagreen": 4280332970,
  "lightskyblue": 4287090426,
  "lightslategray": 4286023833,
  "lightsteelblue": 4289774814,
  "lightyellow": 4294967264,
  "lime": 4278255360,
  "limegreen": 4281519410,
  "linen": 4294635750,
  "magenta": 4294902015,
  "maroon": 4286578688,
  "mediumaquamarine": 4284927402,
  "mediumblue": 4278190285,
  "mediumorchid": 4290401747,
  "mediumpurple": 4287852763,
  "mediumseagreen": 4282168177,
  "mediumslateblue": 4286277870,
  "mediumspringgreen": 4278254234,
  "mediumturquoise": 4282962380,
  "mediumvioletred": 4291237253,
  "midnightblue": 4279834992,
  "mintcream": 4294311930,
  "mistyrose": 4294960353,
  "moccasin": 4294960309,
  "navajowhite": 4294958765,
  "navy": 4278190208,
  "oldlace": 4294833638,
  "olive": 4286611456,
  "olivedrab": 4285238819,
  "orange": 4294944e3,
  "orangered": 4294919424,
  "orchid": 4292505814,
  "palegoldenrod": 4293847210,
  "palegreen": 4288215960,
  "paleturquoise": 4289720046,
  "palevioletred": 4292571283,
  "papayawhip": 4294963157,
  "peachpuff": 4294957753,
  "peru": 4291659071,
  "pink": 4294951115,
  "plum": 4292714717,
  "powderblue": 4289781990,
  "purple": 4286578816,
  "red": 4294901760,
  "rosybrown": 4290547599,
  "royalblue": 4282477025,
  "saddlebrown": 4287317267,
  "salmon": 4294606962,
  "sandybrown": 4294616160,
  "seagreen": 4281240407,
  "seashell": 4294964718,
  "sienna": 4288696877,
  "silver": 4290822336,
  "skyblue": 4287090411,
  "slateblue": 4285160141,
  "slategray": 4285563024,
  "snow": 4294966010,
  "springgreen": 4278255487,
  "steelblue": 4282811060,
  "tan": 4291998860,
  "teal": 4278222976,
  "thistle": 4292394968,
  "tomato": 4294927175,
  "turquoise": 4282441936,
  "violet": 4293821166,
  "wheat": 4294303411,
  "white": 4294967295,
  "whitesmoke": 4294309365,
  "yellow": 4294967040,
  "yellowgreen": 4288335154,
  "aliceblue": 4293982463,
  "antiquewhite": 4294634455,
  "aqua": 4278255615,
  "aquamarine": 4286578644,
  "azure": 4293984255,
  "beige": 4294309340,
  "bisque": 4294960324,
  "black": 4278190080,
  "blanchedalmond": 4294962125,
  "blue": 4278190335,
  "blueviolet": 4287245282,
  "brown": 4289014314,
  "burlywood": 4292786311,
  "cadetblue": 4284456608,
  "chartreuse": 4286578432,
  "chocolate": 4291979550,
  "coral": 4294934352,
  "cornflowerblue": 4284782061,
  "cornsilk": 4294965468,
  "crimson": 4292613180,
  "cyan": 4278255615,
  "darkblue": 4278190219,
  "darkcyan": 4278225803,
  "darkgoldenrod": 4290283019,
  "darkgray": 4289309097,
  "darkgreen": 4278215680,
  "darkkhaki": 4290623339,
  "darkmagenta": 4287299723,
  "darkolivegreen": 4283788079,
  "darkorange": 4294937600,
  "darkorchid": 4288230092,
  "darkred": 4287299584,
  "darksalmon": 4293498490,
  "darkseagreen": 4287609999,
  "darkslateblue": 4282924427,
  "darkslategray": 4281290575,
  "darkturquoise": 4278243025,
  "darkviolet": 4287889619,
  "deeppink": 4294907027,
  "deepskyblue": 4278239231,
  "dimgray": 4285098345,
  "dodgerblue": 4280193279,
  "firebrick": 4289864226,
  "floralwhite": 4294966e3,
  "forestgreen": 4280453922,
  "fuchsia": 4294902015,
  "gainsboro": 4292664540,
  "ghostwhite": 4294506751,
  "gold": 4294956800,
  "goldenrod": 4292519200,
  "gray": 4286611584,
  "green": 4278222848,
  "greenyellow": 4289593135,
  "honeydew": 4293984240,
  "hotpink": 4294928820,
  "indianred": 4291648604,
  "indigo": 4283105410,
  "ivory": 4294967280,
  "khaki": 4293977740,
  "lavender": 4293322490,
  "lavenderblush": 4294963445,
  "lawngreen": 4286381056,
  "lemonchiffon": 4294965965,
  "lightblue": 4289583334,
  "lightcoral": 4293951616,
  "lightcyan": 4292935679,
  "lightgoldenrodyellow": 4294638290,
  "lightgreen": 4287688336,
  "lightgrey": 4292072403,
  "lightpink": 4294948545,
  "none": 0,
  "transparent": 0
};
var _Color = class {
  m_value;
  constructor(r, g, b, a) {
    let argc = arguments.length;
    let self = this;
    function _init() {
      if (!argc) {
        return 4278190080;
      }
      if (argc == 1) {
        if (Number.isSafeInteger(r)) {
          return 4278190080 | r & 16777215;
        }
        return self._getCustomColor(r);
      } else if (argc == 2) {
        let base, alpha = ((g * 255 | 0) & 255) << 24;
        if (Number.isSafeInteger(r)) {
          base = r;
        } else {
          base = self._getCustomColor(r);
        }
        return base & 16777215 | alpha;
      } else if (argc == 4 && a !== void 0 && a <= 1) {
        if (a <= 0) {
          return 0;
        }
        a = a * 255;
        a |= 0;
        return (a & 255) << 24 | (r & 255) << 16 | (g & 255) << 8 | b & 255;
      }
      return 4278190080 | (r & 255) << 16 | (g & 255) << 8 | b & 255;
    }
    __name(_init, "_init");
    this.m_value = _init();
  }
  /**
   * 
   */
  _shade(percent) {
    let t = percent < 0 ? 0 : 255, p = percent < 0 ? -percent : percent;
    let v = this._split();
    return new _Color(
      Math.round((t - v.r) * p) + v.r,
      Math.round((t - v.g) * p) + v.g,
      Math.round((t - v.b) * p) + v.b,
      v.a / 255
    );
  }
  /**
   * return a color darken by percent
   * @param percent 
   */
  darken(percent) {
    if (percent < 0)
      percent = 0;
    if (percent > 100)
      percent = 100;
    return this._shade(-percent / 100);
  }
  /**
   * return a color lighten by percent
   * @param percent 
   */
  lighten(percent) {
    if (percent < 0)
      percent = 0;
    if (percent > 100)
      percent = 100;
    return this._shade(percent / 100);
  }
  /**
   * mix 2 colors
   * @param {rgb} c1 - color 1
   * @param {rgb} c2 - color 2
   * @param {float} percent - 0.0 to 1.0
   * @example 
   * ```js
   * let clr = Color.mix( color1, color2, 0.5 );
   * ```
   */
  static mix(c1, c2, p) {
    let e1 = c1._split(), e2 = c2._split();
    let A = e1.a === e2.a ? e1.a : Math.round(e2.a * p + e1.a * (1 - p)), R = e1.r === e2.r ? e1.r : Math.round(e2.r * p + e1.r * (1 - p)), G = e1.g === e2.g ? e1.g : Math.round(e2.g * p + e1.g * (1 - p)), B = e1.b === e2.b ? e1.b : Math.round(e2.b * p + e1.b * (1 - p));
    return new _Color(R, G, B, A / 255);
  }
  /**
   * split the color into it's base element r,g,b & a (!a 1-255)
   */
  _split() {
    let f = this.m_value;
    return {
      a: f >> 24 & 255,
      r: f >> 16 & 255,
      g: f >> 8 & 255,
      b: f & 255
    };
  }
  /**
   * change the alpha value
   */
  fadeout(percent) {
    let el = this._split();
    el.a = el.a / 255;
    el.a = el.a - el.a * percent / 100;
    if (el.a > 1) {
      el.a = 1;
    } else if (el.a <= 0) {
      return _Color.NONE;
    }
    return new _Color(el.r, el.g, el.b, el.a);
  }
  /**
   * 
   */
  static fromHSV(h, s, v, a = 1) {
    let i = Math.min(5, Math.floor(h * 6)), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    let R, G, B;
    switch (i) {
      case 0:
        R = v;
        G = t;
        B = p;
        break;
      case 1:
        R = q;
        G = v;
        B = p;
        break;
      case 2:
        R = p;
        G = v;
        B = t;
        break;
      case 3:
        R = p;
        G = q;
        B = v;
        break;
      case 4:
        R = t;
        G = p;
        B = v;
        break;
      case 5:
        R = v;
        G = p;
        B = q;
        break;
    }
    return new _Color(R * 255, G * 255, B * 255, a);
  }
  /**
   * 
   */
  static toHSV(c) {
    let el = c._split();
    el.r /= 255;
    el.g /= 255;
    el.b /= 255;
    el.a /= 255;
    let max = Math.max(el.r, el.g, el.b), min = Math.min(el.r, el.g, el.b), delta = max - min, saturation = max === 0 ? 0 : delta / max, value = max;
    let hue;
    if (delta === 0) {
      hue = 0;
    } else {
      switch (max) {
        case el.r:
          hue = (el.g - el.b) / delta / 6 + (el.g < el.b ? 1 : 0);
          break;
        case el.g:
          hue = (el.b - el.r) / delta / 6 + 1 / 3;
          break;
        case el.b:
          hue = (el.r - el.g) / delta / 6 + 2 / 3;
          break;
      }
    }
    return { h: hue, s: saturation, v: value, a: el.a };
  }
  /**
   * 
   */
  static fromHLS(h, l, s) {
    let r, g, b;
    if (s == 0) {
      r = g = b = l;
    } else {
      let hue2rgb2 = function(p2, q2, t) {
        if (t < 0)
          t += 1;
        if (t > 1)
          t -= 1;
        if (t < 1 / 6)
          return p2 + (q2 - p2) * 6 * t;
        if (t < 1 / 2)
          return q2;
        if (t < 2 / 3)
          return p2 + (q2 - p2) * (2 / 3 - t) * 6;
        return p2;
      };
      var hue2rgb = hue2rgb2;
      __name(hue2rgb2, "hue2rgb");
      let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      let p = 2 * l - q;
      r = hue2rgb2(p, q, h + 1 / 3);
      g = hue2rgb2(p, q, h);
      b = hue2rgb2(p, q, h - 1 / 3);
    }
    r = (r * 255 | 0) & 255;
    g = (g * 255 | 0) & 255;
    b = (b * 255 | 0) & 255;
    return new _Color(r, g, b);
  }
  /**
   * 
   */
  static toHLS(color) {
    let f = color.m_value, r = (f >> 16 & 255) / 255, g = (f >> 8 & 255) / 255, b = (f & 255) / 255;
    let minval = r, maxval = r;
    if (g < minval) {
      minval = g;
    }
    if (b < minval) {
      minval = b;
    }
    if (g > maxval) {
      maxval = g;
    }
    if (b > maxval) {
      maxval = b;
    }
    let rnorm = 0, gnorm = 0, bnorm = 0;
    let mdiff = maxval - minval;
    let msum = maxval + minval;
    let light = 0.5 * msum;
    let satur, hue;
    if (maxval != minval) {
      rnorm = (maxval - r) / mdiff;
      gnorm = (maxval - g) / mdiff;
      bnorm = (maxval - b) / mdiff;
    } else {
      return { h: 0, l: light, s: 0 };
    }
    if (light < 0.5) {
      satur = mdiff / msum;
    } else {
      satur = mdiff / (2 - msum);
    }
    if (r == maxval) {
      hue = 60 * (6 + bnorm - gnorm);
    } else if (g == maxval) {
      hue = 60 * (2 + rnorm - bnorm);
    } else {
      hue = 60 * (4 + gnorm - rnorm);
    }
    if (hue > 360) {
      hue = hue - 360;
    }
    return { h: hue / 360, l: light, s: satur };
  }
  /**
   * get the red value of the color
   */
  red() {
    return this.m_value >> 16 & 255;
  }
  /**
   * get the green value of the color
   */
  green() {
    return this.m_value >> 8 & 255;
  }
  /**
   * get the blue value of the color
   */
  blue() {
    return this.m_value & 255;
  }
  /**
   * get the alpha value of the color
   */
  alpha() {
    return (this.m_value >> 24 & 255) / 255;
  }
  /**
   * 
   */
  value() {
    return this.m_value;
  }
  /**
   * convert the color into string value
   */
  toString() {
    let color = this.m_value;
    if (color === 0) {
      return "transparent";
    }
    let el = this._split();
    if (el.a === 255) {
      return `rgb(${el.r},${el.g},${el.b})`;
    } else {
      el.a /= 255;
      let alpha = el.a.toFixed(3);
      return `rgba(${el.r},${el.g},${el.b},${alpha})`;
    }
  }
  toHex(with_alpha = true) {
    let color = this.m_value;
    if (color === 0) {
      return "transparent";
    }
    let el = this._split();
    if (el.a === 255 || !with_alpha) {
      return `#${_hx(el.r)}${_hx(el.g)}${_hx(el.b)}`;
    } else {
      return `#${_hx(el.r)}${_hx(el.g)}${_hx(el.b)}${_hx(el.a)}`;
    }
  }
  static addCustomColor(name, value) {
    _Color.custom[name] = value;
  }
  static addCssColor(name) {
    let c = Stylesheet.getVar(name);
    _Color.custom["css:" + name] = _Color.parse(c.trim());
  }
  static parse(str) {
    let m;
    if (str[0] == "#") {
      const re1 = /#(?<r>[a-fA-F0-9]{2})(?<g>[a-fA-F0-9]{2})(?<b>[a-fA-F0-9]{2})(?<a>[a-fA-F0-9]{2})?/;
      if ((m = re1.exec(str)) !== null) {
        let g = m.groups;
        return new _Color(parseInt(g.r, 16), parseInt(g.g, 16), parseInt(g.b, 16), g.a !== void 0 ? parseInt(g.a, 16) / 255 : 1);
      }
      const re4 = /#(?<r>[a-fA-F0-9])(?<g>[a-fA-F0-9])(?<b>[a-fA-F0-9])/;
      if ((m = re4.exec(str)) !== null) {
        let gr = m.groups;
        const r = parseInt(gr.r, 16);
        const g = parseInt(gr.g, 16);
        const b = parseInt(gr.b, 16);
        return new _Color(r << 4 | r, g << 4 | g, b << 4 | b, 1);
      }
    }
    if (str[0] == "r") {
      const re2 = /rgb\(\s*(?<r>\d+)\s*\,\s*(?<g>\d+)\s*\,\s*(?<b>\d+)\s*\)/;
      if ((m = re2.exec(str)) !== null) {
        let g = m.groups;
        return new _Color(parseInt(g.r, 10), parseInt(g.g, 10), parseInt(g.b, 10), 1);
      }
      const re3 = /rgba\(\s*(?<r>\d+)\s*\,\s*(?<g>\d+)\s*\,\s*(?<b>\d+)\s*\,\s*(?<a>[0-9.]+)\s*\)/;
      if ((m = re3.exec(str)) !== null) {
        let g = m.groups;
        return new _Color(parseInt(g.r, 10), parseInt(g.g, 10), parseInt(g.b, 10), parseFloat(g.a));
      }
    }
    console.log("invalid color value: " + str);
    return new _Color(0);
  }
  _getCustomColor(name) {
    if (name === null) {
      return 0;
    }
    let std = colorValues[name];
    if (std !== void 0) {
      return std;
    }
    if (_Color.custom[name] !== void 0) {
      return _Color.custom[name].m_value;
    }
    if (name.substr(0, 4) == "css:") {
      _Color.addCssColor(name.substr(4));
      return _Color.custom[name].m_value;
    }
    return _Color.parse(name).m_value;
  }
  static contrastColor(color) {
    let el = color._split();
    let luma = (0.299 * el.r + 0.587 * el.g + 0.114 * el.b) / 255;
    return luma > 0.5 ? _Color.BLACK : _Color.WHITE;
  }
  static valueFromColorName(name) {
    let v = colorValues[name];
    if (v) {
      return new _Color(v);
    } else {
      return null;
    }
  }
  static fromCssVar(varName) {
    return new _Color(varName).toString();
  }
};
var Color = _Color;
__name(Color, "Color");
__publicField(Color, "custom", []);
/**
 * 
 */
__publicField(Color, "WHITE", new _Color(255, 255, 255));
/**
 * 
 */
__publicField(Color, "BLACK", new _Color(0, 0, 0));
/**
 * 
 */
__publicField(Color, "NONE", new _Color(0, 0, 0, 0));
function _hx(n) {
  return ("00" + n.toString(16)).substr(-2).toUpperCase();
}
__name(_hx, "_hx");

// src/request.ts
var DEFAULT_TIMEOUT = 1e4;
function ajaxRequest(cfg) {
  let params, url = cfg.url, method = cfg.method || "GET", formdata = false;
  if (cfg.params instanceof FormData) {
    params = cfg.params;
    formdata = true;
  } else if (method == "POST") {
    params = buildQuery(cfg.params, false);
  } else {
    url += buildQuery(cfg.params, true);
  }
  url = encodeURI(url);
  let xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.upload.addEventListener("progress", progress, false);
  xhr.addEventListener("timeout", failure);
  xhr.addEventListener("error", failure);
  xhr.addEventListener("load", success);
  if (!formdata) {
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
  }
  if (method != "POST") {
    xhr.responseType = cfg.responseType || "json";
    xhr.timeout = cfg.timeout || DEFAULT_TIMEOUT;
  }
  if (cfg.headers) {
    for (let h in cfg.headers) {
      xhr.setRequestHeader(h, cfg.headers[h]);
    }
  }
  function progress(ev) {
    console.log(ev);
    if (cfg.progress) {
      try {
        if (ev.lengthComputable) {
          let disp = humanSize(ev.loaded) + " / " + humanSize(ev.total);
          cfg.progress(ev.loaded, ev.total, disp);
        }
      } catch (e) {
        console.error("unhandled exception:", e);
      }
    }
  }
  __name(progress, "progress");
  function humanSize(bytes) {
    let unit, value;
    if (bytes >= 1e9) {
      unit = "Gb";
      value = bytes / 1e9;
    } else if (bytes >= 1e6) {
      unit = "Mb";
      value = bytes / 1e6;
    } else if (bytes >= 1e3) {
      unit = "Kb";
      value = bytes / 1e3;
    } else {
      unit = "bytes";
      value = bytes;
    }
    return value.toFixed(2) + unit;
  }
  __name(humanSize, "humanSize");
  function failure() {
    if (cfg.failure) {
      cfg.failure(xhr.status, xhr.statusText, cfg.userData);
    }
  }
  __name(failure, "failure");
  function success() {
    if (xhr.status >= 200 && xhr.status < 300) {
      if (cfg.success) {
        try {
          cfg.success(xhr.response, cfg.userData);
        } catch (e) {
          console.error("unhandled exception:", e);
        }
      }
    } else {
      failure();
    }
  }
  __name(success, "success");
  if (formdata || method == "POST") {
    xhr.send(params);
  } else {
    xhr.send();
  }
  return function() {
    xhr.abort();
  };
}
__name(ajaxRequest, "ajaxRequest");
function buildQuery(params, getMethod) {
  if (!params) {
    return "";
  }
  let query = [];
  for (let key in params) {
    let param = params[key];
    if (isArray(param)) {
      for (let i = 0, n = param.length; i < n; i++) {
        query.push(encodeURIComponent(key) + "[]=" + encodeURIComponent("" + param[i]));
      }
    } else {
      if (param === void 0) {
        param = "";
      }
      query.push(encodeURIComponent(key) + "=" + encodeURIComponent("" + param));
    }
  }
  let result = query.join("&");
  if (getMethod) {
    return "?" + result;
  } else {
    return result;
  }
}
__name(buildQuery, "buildQuery");
async function ajaxAsJSON(url, init) {
  let response = await ajax(url, init, "application/json");
  return response.json();
}
__name(ajaxAsJSON, "ajaxAsJSON");
async function ajaxAsText(url, init) {
  let response = await ajax(url, init, "text/plain");
  return response.text();
}
__name(ajaxAsText, "ajaxAsText");
async function ajax(url, init, type) {
  let options = {
    method: "GET",
    headers: {
      "X-Requested-With": "XMLHttpRequest"
    }
  };
  if (type) {
    options.headers["Content-Type"] = type;
  }
  if (init) {
    options = { ...options, ...init };
    if (init.body && !isString(init.body)) {
      let cvt = false;
      if (isLiteralObject(init.body)) {
        cvt = true;
      } else if (!(init.body instanceof Blob) && !(init.body instanceof ArrayBuffer) && !(init.body instanceof FormData) && !(init.body instanceof URLSearchParams) && !(init.body instanceof ReadableStream)) {
        cvt = true;
      }
      if (cvt) {
        options.body = JSON.stringify(init.body);
      } else {
        options.body = init.body;
      }
    }
  }
  let response = await fetch(url, options);
  if (init && init.noGenX) {
    return response;
  } else {
    if (!response.ok) {
      throw new NetworkError(response);
    }
    return response;
  }
}
__name(ajax, "ajax");

// src/datastore.ts
function EvDataChange(type, id) {
  return BasicEvent({ type, id });
}
__name(EvDataChange, "EvDataChange");
var MetaInfos = class {
  name;
  id;
  // field name holding 'id' record info
  fields;
  // field list
  constructor(name) {
    this.name = name;
    this.id = void 0;
    this.fields = [];
  }
};
__name(MetaInfos, "MetaInfos");
var metaFields = Symbol("metaField");
function _getMetas(obj, create = true) {
  let ctor = obj.constructor;
  let mfld = ctor.hasOwnProperty(metaFields) ? ctor[metaFields] : void 0;
  if (mfld === void 0) {
    if (!create) {
      console.assert(mfld !== void 0);
    }
    mfld = new MetaInfos(ctor.name);
    let pctor = Object.getPrototypeOf(ctor);
    if (pctor != Record) {
      let pmetas = pctor[metaFields];
      mfld.fields = [...pmetas.fields, ...mfld.fields];
      console.assert(mfld.id === void 0, "cannot define mutiple record id");
      if (!mfld.id) {
        mfld.id = pmetas.id;
      }
    }
    obj.constructor[metaFields] = mfld;
  }
  return mfld;
}
__name(_getMetas, "_getMetas");
var data;
((data2) => {
  function id() {
    return (ownerCls, fldName) => {
      let metas = _getMetas(ownerCls);
      metas.fields.push({
        name: fldName,
        type: "any",
        required: true
      });
      metas.id = fldName;
    };
  }
  data2.id = id;
  __name(id, "id");
  function field(data3) {
    return (ownerCls, fldName) => {
      let metas = _getMetas(ownerCls);
      metas.fields.push({
        name: fldName,
        ...data3
      });
    };
  }
  data2.field = field;
  __name(field, "field");
  function string(props) {
    return field({ ...props, type: "string" });
  }
  data2.string = string;
  __name(string, "string");
  function int(props) {
    return field({ ...props, type: "int" });
  }
  data2.int = int;
  __name(int, "int");
  function float(props) {
    return field({ ...props, type: "float" });
  }
  data2.float = float;
  __name(float, "float");
  function bool(props) {
    return field({ ...props, type: "bool" });
  }
  data2.bool = bool;
  __name(bool, "bool");
  function date(props) {
    return field({ ...props, type: "date" });
  }
  data2.date = date;
  __name(date, "date");
  function calc(props) {
    return field({ ...props, type: "calc" });
  }
  data2.calc = calc;
  __name(calc, "calc");
  function array(ctor, props) {
    return data2.field({ ...props, type: "array", model: ctor ? new ctor() : null });
  }
  data2.array = array;
  __name(array, "array");
})(data || (data = {}));
var Record = class {
  constructor(data2, id) {
    if (data2 !== void 0) {
      this.unSerialize(data2, id);
    }
  }
  clone(source) {
    let rec = new this.constructor();
    if (source) {
      rec.unSerialize(source);
    }
    return rec;
  }
  /**
   * get the record unique identifier
   * by default the return value is the first field
   * @return unique identifier
   */
  getID() {
    let metas = _getMetas(this, false);
    return this[metas.id];
  }
  /**
   * MUST IMPLEMENT
   * @returns fields descriptors
   */
  getFields() {
    let metas = _getMetas(this, false);
    return metas.fields;
  }
  /**
   * 
   */
  validate() {
    let errs = null;
    let fields = this.getFields();
    fields.forEach((fi) => {
      if (fi.required && !this.getField(fi.name)) {
        if (errs) {
          errs = [];
        }
        errs.push(new Error(`field ${fi.name} is required.`));
      }
    });
    return errs;
  }
  //mapAnyFields() {
  //	this.getFields = ( ) => {
  //		return Object.keys( this ).map( (name) => {
  //			return <FieldInfo>{ name };
  //		});			
  //	}
  //}
  getFieldIndex(name) {
    let fields = this.getFields();
    return fields.findIndex((fd) => fd.name == name);
  }
  /**
   * default serializer
   * @returns an object with known record values
   */
  serialize() {
    let rec = {};
    this.getFields().forEach((f) => {
      if (f.calc === void 0) {
        rec[f.name] = rec[f.name];
      }
    });
    return rec;
  }
  /**
   * default unserializer
   * @param data - input data 
   * @returns a new Record
   */
  unSerialize(data2, id) {
    let fields = this.getFields();
    fields.forEach((sf) => {
      let value = data2[sf.name];
      if (value !== void 0) {
        this[sf.name] = this._convertField(sf, value);
      }
    });
    if (id !== void 0) {
      this[fields[0].name] = id;
    } else {
      console.assert(this.getID() !== void 0);
    }
    return this;
  }
  /**
   * field conversion
   * @param field - field descriptor
   * @param input - value to convert
   * @returns the field value in it's original form
   */
  _convertField(field, input) {
    switch (field.type) {
      case "float": {
        let ffv = typeof input === "number" ? input : parseFloat(input);
        if (field.prec !== void 0) {
          let mul = Math.pow(10, field.prec);
          ffv = Math.round(ffv * mul) / mul;
        }
        return ffv;
      }
      case "int": {
        return typeof input === "number" ? input : parseInt(input);
      }
      case "date": {
        return isString(input) ? new Date(input) : input;
      }
      case "array": {
        let result = [];
        if (field.model) {
          input.forEach((v) => {
            result.push(field.model.clone(v));
          });
          return result;
        }
        break;
      }
    }
    return input;
  }
  /**
   * get raw value of a field
   * @param name - field name or field index
   */
  getRaw(name) {
    let idx;
    let fields = this.getFields();
    if (typeof name === "string") {
      idx = fields.findIndex((fi) => fi.name == name);
      if (idx < 0) {
        console.assert(false, "unknown field: " + name);
        return void 0;
      }
    } else if (name < fields.length) {
      if (name < 0) {
        return void 0;
      }
      idx = name;
    } else {
      console.assert(false, "bad field name: " + name);
      return void 0;
    }
    let fld = fields[idx];
    if (fld.calc !== void 0) {
      return fld.calc(this);
    }
    return this[fld.name];
  }
  /**
   * 
   * @param name 
   * @param data 
   */
  setRaw(name, data2) {
    this[name] = data2;
  }
  /**
   * get field value (as string)
   * @param name - field name
   * @example
   * let value = record.get('field1');
   */
  getField(name) {
    let v = this.getRaw(name);
    return v === void 0 || v === null ? "" : "" + v;
  }
  /**
   * set field value
   * @param name - field name
   * @param value - value to set
   * @example
   * record.set( 'field1', 7 );
   */
  setField(name, value) {
    let fields = this.getFields();
    let idx = fields.findIndex((fi) => fi.name == name);
    if (idx < 0) {
      console.assert(false, "unknown field: " + name);
      return;
    }
    let fld = fields[idx];
    if (fld.calc !== void 0) {
      console.assert(false, "cannot set calc field: " + name);
      return;
    }
    this.setRaw(fld.name, value);
  }
};
__name(Record, "Record");
var AutoRecord = class extends Record {
  m_data;
  m_fid;
  constructor(data2) {
    super();
    this.m_data = data2;
  }
  getID() {
    if (!this.m_fid) {
      let fnames = Object.keys(this.m_data);
      this.m_fid = fnames[0];
    }
    return this.m_data[this.m_fid];
  }
  getFields() {
    let fnames = Object.keys(this.m_data);
    let fields = fnames.map((n) => {
      return {
        name: n
      };
    });
    return fields;
  }
  getRaw(name) {
    return this.m_data[name];
  }
  setRaw(name, data2) {
    this.m_data[name] = data2;
  }
  clone(data2) {
    return new AutoRecord({ ...data2 });
  }
};
__name(AutoRecord, "AutoRecord");
var DataProxy = class extends BaseComponent {
  constructor(props) {
    super(props);
  }
  async load(url) {
    if (url) {
      this.m_props.url = url;
    } else {
      url = this.m_props.url;
    }
    if (this.m_props.params) {
      url += "?" + this.m_props.params.join("&");
    }
    const r = await fetch(url);
    if (r.ok) {
      const raw = await r.json();
      let json = raw;
      if (this.m_props.solver) {
        json = this.m_props.solver(json);
      }
      this.emit("change", EvChange(json, raw));
    }
  }
};
__name(DataProxy, "DataProxy");
var DataStore = class extends EventSource {
  m_model;
  m_fields;
  m_records;
  m_proxy;
  m_rec_index;
  constructor(props) {
    super();
    this.m_fields = void 0;
    this.m_records = [];
    this.m_rec_index = null;
    this.m_model = props.model;
    this.m_fields = props.model.getFields();
    if (props.data) {
      this.setRawData(props.data);
    } else if (props.url) {
      this.m_proxy = new DataProxy({
        url: props.url,
        solver: props.solver,
        events: { change: (ev) => {
          this.setData(ev.value);
        } }
      });
      if (props.autoload != false) {
        this.m_proxy.load();
      }
    }
  }
  /**
   * 
   * @param records 
   */
  async load(url) {
    return this.m_proxy.load(url);
  }
  async reload() {
    return this.m_proxy.load();
  }
  /**
   * convert raw objects to real records from model
   * @param records 
   */
  setData(records) {
    let realRecords = [];
    records.forEach((rec) => {
      realRecords.push(this.m_model.clone(rec));
    });
    this.setRawData(realRecords);
  }
  /**
   * just set the records
   * @param records - must be of the same type as model
   */
  setRawData(records) {
    this.m_records = records;
    this._rebuildIndex();
    this.emit("data_change", EvDataChange("change"));
  }
  _rebuildIndex() {
    this.m_rec_index = null;
    this.m_rec_index = this.createIndex(null);
    this.m_rec_index = this.sortIndex(this.m_rec_index, null);
  }
  /**
   * 
   */
  update(rec) {
    let id = rec.getID();
    let index = this.indexOfId(id);
    if (index < 0) {
      return false;
    }
    this.m_records[this.m_rec_index[index]] = rec;
    this.emit("data_change", EvDataChange("update", id));
    return true;
  }
  /**
   * 
   * @param data 
   */
  append(rec) {
    if (!(rec instanceof Record)) {
      let nrec = this.m_model.clone();
      rec = nrec.unSerialize(rec);
    }
    console.assert(rec.getID());
    this.m_records.push(rec);
    this._rebuildIndex();
    this.emit("data_change", EvDataChange("create", rec.getID()));
  }
  /**
   * 
   */
  getMaxId() {
    let maxID = void 0;
    this.m_records.forEach((r) => {
      let rid = r.getID();
      if (maxID === void 0 || maxID < rid) {
        maxID = rid;
      }
    });
    return maxID;
  }
  /**
   * 
   * @param id 
   */
  delete(id) {
    let idx = this.indexOfId(id);
    if (idx < 0) {
      return false;
    }
    idx = this.m_rec_index[idx];
    this.m_records.splice(idx, 1);
    this._rebuildIndex();
    this.emit("data_change", EvDataChange("delete", id));
    return true;
  }
  /**
   * return the number of records
   */
  get count() {
    return this.m_rec_index ? this.m_rec_index.length : this.m_records.length;
  }
  /**
   * return the fields
   */
  get fields() {
    return this.m_fields;
  }
  /**
   * find the index of the element with the given id
   */
  indexOfId(id) {
    for (let lim = this.count, base = 0; lim != 0; lim >>= 1) {
      let p = base + (lim >> 1);
      let idx = this.m_rec_index[p];
      let rid = this.m_records[idx].getID();
      if (rid == id) {
        return p;
      }
      if (rid < id) {
        base = p + 1;
        lim--;
      }
    }
    return -1;
  }
  /**
   * return the record by it's id 
   * @returns record or null
   */
  getById(id) {
    let idx = this.indexOfId(id);
    if (idx < 0) {
      return null;
    }
    idx = this.m_rec_index[idx];
    return this.m_records[idx];
  }
  /**
   * return a record by it's index
   * @returns record or null
   */
  getByIndex(index) {
    let idx = this.m_rec_index[index];
    return this._getRecord(idx);
  }
  _getRecord(index) {
    return this.m_records[index] ?? null;
  }
  moveTo(other) {
    other.setRawData(this.m_records);
  }
  /**
   * create a new view on the DataStore
   * @param opts 
   */
  createView(opts) {
    let eopts = { ...opts, store: this };
    return new DataView(eopts);
  }
  /**
   * 
   */
  createIndex(filter) {
    if (filter && filter.op === "empty-result") {
      return new Uint32Array(0);
    }
    let index = new Uint32Array(this.m_records.length);
    let iidx = 0;
    if (!filter) {
      this.forEach((rec, idx) => {
        index[iidx++] = idx;
      });
    } else {
      if (typeof filter.op === "function") {
        let fn = filter.op;
        this.forEach((rec, idx) => {
          if (!rec) {
            return;
          }
          if (fn(rec)) {
            index[iidx++] = idx;
          }
        });
      } else {
        let _lt2 = function(recval) {
          return recval < filterValue;
        }, _le2 = function(recval) {
          return recval <= filterValue;
        }, _eq2 = function(recval) {
          return recval == filterValue;
        }, _neq2 = function(recval) {
          return recval != filterValue;
        }, _ge2 = function(recval) {
          return recval >= filterValue;
        }, _gt2 = function(recval) {
          return recval > filterValue;
        }, _re2 = function(recval) {
          filterRe.lastIndex = -1;
          return filterRe.test(recval);
        };
        var _lt = _lt2, _le = _le2, _eq = _eq2, _neq = _neq2, _ge = _ge2, _gt = _gt2, _re = _re2;
        __name(_lt2, "_lt");
        __name(_le2, "_le");
        __name(_eq2, "_eq");
        __name(_neq2, "_neq");
        __name(_ge2, "_ge");
        __name(_gt2, "_gt");
        __name(_re2, "_re");
        let filterFld = this.m_model.getFieldIndex(filter.field);
        if (filterFld < 0) {
          console.assert(false, "unknown field name in filter");
          return new Uint32Array(0);
        }
        let filterValue = filter.value;
        if (isString(filterValue) && !filter.caseSensitive) {
          filterValue = filterValue.toUpperCase();
        }
        let filterFn;
        let filterRe;
        if (filterValue instanceof RegExp) {
          filterRe = filterValue;
          filterFn = _re2;
        } else {
          switch (filter.op) {
            case "<": {
              filterFn = _lt2;
              break;
            }
            case "<=": {
              filterFn = _le2;
              break;
            }
            case "=": {
              filterFn = _eq2;
              break;
            }
            case ">=": {
              filterFn = _ge2;
              break;
            }
            case ">": {
              filterFn = _gt2;
              break;
            }
            case "<>": {
              filterFn = _neq2;
              break;
            }
          }
        }
        this.forEach((rec, idx) => {
          if (!rec) {
            return;
          }
          let field = rec.getRaw(filterFld);
          if (field === null || field === void 0) {
            field = "";
          } else {
            field = "" + field;
            if (!filter.caseSensitive) {
              field = field.toUpperCase();
            }
          }
          let keep = filterFn(field);
          if (keep) {
            index[iidx++] = idx;
          }
          ;
        });
      }
    }
    return index.slice(0, iidx);
  }
  sortIndex(index, sort) {
    let bads = 0;
    let fidxs = [];
    if (sort === null) {
      fidxs.push({ fidx: 0, asc: true });
    } else {
      fidxs = sort.map((si) => {
        let fi = this.m_model.getFieldIndex(si.field);
        if (fi == -1) {
          console.assert(false, "unknown field name in sort");
          bads++;
        }
        return { fidx: fi, asc: si.ascending };
      });
    }
    if (bads || fidxs.length == 0) {
      return index;
    }
    if (fidxs.length == 1) {
      let field = fidxs[0].fidx;
      index.sort((ia, ib) => {
        let va = this.getByIndex(ia).getRaw(field) ?? "";
        let vb = this.getByIndex(ib).getRaw(field) ?? "";
        if (va > vb) {
          return 1;
        }
        if (va < vb) {
          return -1;
        }
        return 0;
      });
      if (!fidxs[0].asc) {
        index.reverse();
      }
    } else {
      index.sort((ia, ib) => {
        for (let fi = 0; fi < fidxs.length; fi++) {
          let fidx = fidxs[fi].fidx;
          let mul = fidxs[fi].asc ? 1 : -1;
          let va = this.getByIndex(ia).getRaw(fidx) ?? "";
          let vb = this.getByIndex(ib).getRaw(fidx) ?? "";
          if (va > vb) {
            return mul;
          }
          if (va < vb) {
            return -mul;
          }
        }
        return 0;
      });
    }
    return index;
  }
  /**
   * 
   */
  forEach(cb) {
    if (this.m_rec_index) {
      this.m_rec_index.some((ri, index) => {
        if (cb(this.m_records[ri], index)) {
          return index;
        }
      });
    } else {
      this.m_records.some((rec, index) => {
        if (rec) {
          if (cb(rec, index)) {
            return index;
          }
        }
      });
    }
  }
  export() {
    return this.m_records;
  }
  changed() {
    this.emit("data_change", EvDataChange("change"));
  }
};
__name(DataStore, "DataStore");
function EvViewChange(action) {
  return BasicEvent({ action });
}
__name(EvViewChange, "EvViewChange");
var DataView = class extends BaseComponent {
  m_index;
  m_store;
  m_sort;
  m_filter;
  constructor(props) {
    super(props);
    this.m_store = props.store;
    this.m_index = null;
    this.m_filter = null;
    this.m_sort = null;
    this.filter(props.filter);
    if (props.order) {
      if (isString(props.order)) {
        this.sort([{ field: props.order, ascending: true }]);
      } else if (isArray(props.order)) {
        this.sort(props.order);
      } else {
        this.sort([props.order]);
      }
    } else {
      this.sort(null);
    }
    this.m_store.on("data_change", (e) => this._storeChange(e));
  }
  _storeChange(ev) {
    this._filter(this.m_filter, ev.type != "change");
    this._sort(this.m_sort, ev.type != "change");
    this.emit("view_change", EvViewChange("change"));
  }
  /**
   * 
   * @param filter 
   */
  filter(filter) {
    this.m_index = null;
    return this._filter(filter, true);
  }
  _filter(filter, notify) {
    this.m_index = this.m_store.createIndex(filter);
    this.m_filter = filter;
    if (this.m_sort) {
      this.sort(this.m_sort);
    }
    if (notify) {
      this.emit("view_change", EvViewChange("filter"));
    }
    return this.m_index.length;
  }
  /**
   * 
   * @param columns 
   * @param ascending 
   */
  sort(props) {
    this._sort(props, true);
  }
  _sort(props, notify) {
    this.m_index = this.m_store.sortIndex(this.m_index, props);
    this.m_sort = props;
    if (notify) {
      this.emit("view_change", EvViewChange("sort"));
    }
  }
  /**
   * 
   */
  get store() {
    return this.m_store;
  }
  /**
   * 
   */
  get count() {
    return this.m_index.length;
  }
  /**
   * 
   * @param id 
   */
  indexOfId(id) {
    let ridx = this.m_store.indexOfId(id);
    return this.m_index.findIndex((rid) => rid === ridx);
  }
  /**
   * 
   * @param index 
   */
  getByIndex(index) {
    if (index >= 0 && index < this.m_index.length) {
      let rid = this.m_index[index];
      return this.m_store.getByIndex(rid);
    }
    return null;
  }
  /**
   * 
   * @param id 
   */
  getById(id) {
    return this.m_store.getById(id);
  }
  changed() {
    this.emit("view_change", EvViewChange("change"));
  }
  /**
   * 
   */
  forEach(cb) {
    this.m_index.some((index) => {
      let rec = this.m_store.getByIndex(index);
      if (rec) {
        if (cb(rec, index)) {
          return index;
        }
      }
    });
  }
};
__name(DataView, "DataView");

// src/combobox.ts
var ComboBox = class extends HLayout {
  m_ui_input;
  m_ui_button;
  m_popup;
  m_lockpop;
  m_lockchg;
  m_popvis;
  m_selection;
  constructor(props) {
    super(props);
    if (!props.editable) {
      this.setDomEvent("keypress", () => this.showPopup());
    }
    this.setDomEvent("click", () => {
      if (this.m_props.editable) {
        this.m_ui_input.focus();
      }
      this.showPopup();
    });
    this.setDomEvent("keydown", (e) => this._onKey(e));
    this.mapPropEvents(props, "selectionChange");
    this.m_popvis = false;
    this.m_lockpop = false;
    this.m_lockchg = false;
  }
  _onKey(e) {
    if (this.m_popvis) {
      if (e.key == "ArrowUp" || e.key == "ArrowDown") {
        this.m_lockpop = true;
        this.m_popup.handleKey(e);
        this.m_lockpop = false;
        e.preventDefault();
        e.stopPropagation();
      } else if (e.key == "Escape") {
        this._hidePopup();
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }
  set items(items) {
    this.m_props.items = items;
    if (this.m_popup) {
      this.m_popup.items = items;
    }
  }
  /** @ignore */
  render(props) {
    if (!props.renderer) {
      this.setClass("@required", props.required);
      const input = new Input({
        flex: 1,
        readOnly: this.m_props.editable ? false : true,
        tabIndex: 0,
        name: props.name,
        value_hook: {
          get: () => {
            return this.value;
          },
          set: (v) => {
            this.value = v;
          }
        },
        dom_events: {
          focus: () => {
            this.clearError();
            if (this.m_props.editable && input.value.length == 0) {
              this.showPopup();
            }
          },
          input: () => {
            if (this.m_lockchg) {
              return;
            }
            const text = input.value;
            this.m_selection = { id: void 0, text };
            let items = this.showPopup();
            if (items && items.length && items[0].text == text) {
              this.m_selection = { id: items[0].id, text };
            }
          }
        }
      });
      this.m_ui_input = input;
    } else {
      this.m_ui_input = new Component({
        flex: 1,
        cls: "@fake-input @hlayout",
        tabIndex: 1
      });
    }
    let width = void 0, flex = void 0;
    let labelWidth = props.labelWidth ?? 0;
    if (labelWidth > 0) {
      width = labelWidth;
    } else if (labelWidth < 0) {
      flex = -labelWidth;
    }
    this.setContent([
      // todo: why 'label1' class name
      new Label({
        cls: "label1" + (props.label ? "" : " @hidden"),
        text: props.label,
        width,
        flex,
        align: props.labelAlign
      }),
      new HLayout({
        flex: 1,
        content: [
          this.m_ui_input,
          this.m_ui_button = new Button({
            cls: "gadget",
            icon: "var( --x4-icon-angle-down )",
            tabIndex: false,
            click: () => {
              this.showPopup(false);
            },
            dom_events: {
              focus: () => {
                this.clearError();
                this.dom.focus();
              }
            }
          })
        ]
      })
    ]);
    if (props.value !== void 0) {
      this.value = props.value;
    }
  }
  componentDisposed() {
    if (this.m_popup) {
      this.m_popup.close();
    }
    super.componentDisposed();
  }
  /** 
   * display the popup 
   */
  showPopup(filter_items = true) {
    let props = this.m_props;
    if (props.readOnly || this.hasClass("@disable")) {
      return null;
    }
    let items = props.items;
    if (isFunction(items)) {
      const filter = filter_items ? this.m_ui_input.value : null;
      items = items(filter);
    }
    if (items.length == 0) {
      return null;
    }
    if (!this.m_popup) {
      let cstyle = this.getComputedStyle();
      let fontFamily = cstyle.value("fontFamily");
      let fontSize = cstyle.value("fontSize");
      this.m_popup = new PopupListView({
        cls: "@combo-popup",
        populate: props.populate,
        renderItem: this.m_props.renderer,
        selectionChange: (e) => {
          this._selectItem(e);
          if (!this.m_lockpop) {
            this._hidePopup();
            this.focus();
          }
        },
        cancel: (e) => this.signal("cancel", e),
        style: {
          fontFamily,
          fontSize
        }
      });
    }
    this.m_popup.items = items;
    let r1 = this.m_ui_button.getBoundingRect(), r2 = this.m_ui_input.getBoundingRect();
    this.m_popup.setStyle({
      minWidth: r1.right - r2.left
    });
    this.m_popup.displayAt(r2.left, r2.bottom);
    this.m_popvis = true;
    this.startTimer("focus-check", 100, true, () => this._checkFocus());
    if (this.value !== void 0) {
      this.m_popup.selection = this.value;
    }
    return items;
  }
  /**
   * 
   */
  validate() {
    if (this.m_props.required && !this.m_selection) {
      this.showError(_tr.global.required_field);
      return false;
    }
    return true;
  }
  showError(text) {
    this.m_ui_input.showError(text);
  }
  clearError() {
    this.m_ui_input.clearError();
  }
  /** @ignore
    */
  _selectItem(ev) {
    let item = ev.selection;
    if (!item) {
      return;
    }
    this.m_lockchg = true;
    this._setInput(item, true);
    this.m_lockchg = false;
    this.m_selection = {
      id: item.id,
      text: item.text
    };
    this.emit("selectionChange", EvSelectionChange(item));
    this.emit("change", EvChange(item.id));
  }
  /**
   * 
   */
  _setInput(item, fireEv = false) {
    if (item) {
      if (this.m_ui_input) {
        if (this.m_ui_input instanceof Input) {
          this.m_ui_input.value = item.text;
          if (fireEv) {
            this.m_ui_input.dom.dispatchEvent(new Event("input"));
          }
        } else {
          this.m_ui_input.setContent(this.m_props.renderer(item));
        }
      } else {
        this.m_props.value = item.id;
      }
    } else {
      if (this.m_ui_input && this.m_ui_input instanceof Input) {
        this.m_ui_input.value = "";
      }
    }
  }
  /**
   * 
   */
  get value() {
    return this.m_selection ? this.m_selection.id : void 0;
  }
  get valueText() {
    if (this.m_selection) {
      return this.m_selection.text;
    }
    if (this.m_props.editable) {
      return this.m_ui_input.value;
    }
    return "";
  }
  /**
   * 
   */
  set value(id) {
    let items = this.m_props.items;
    if (isFunction(items)) {
      items = items(null);
    }
    const found = items.some((v) => {
      if (v.id === id) {
        this._setInput(v);
        this.m_selection = v;
        return true;
      }
    });
    if (!found) {
      this._setInput(null);
      this.m_selection = null;
    }
  }
  get input() {
    return this.m_ui_input instanceof Input ? this.m_ui_input : null;
  }
  _checkFocus() {
    const focus = document.activeElement;
    if (this.dom && this.dom.contains(focus) || focus == document.body) {
      return;
    }
    if (this.m_popup && this.m_popup.dom && this.m_popup.dom.contains(focus)) {
      return;
    }
    this._hidePopup();
  }
  _hidePopup() {
    if (this.m_popvis) {
      this.m_popup.close();
      this.m_popvis = false;
      this.stopTimer("focus-check");
    }
  }
  static storeProxy(props) {
    let view = props.store instanceof DataStore ? props.store.createView() : props.store;
    return () => {
      let result = new Array(props.store.count);
      props.store.forEach((rec, index) => {
        result[index] = {
          id: rec.getID(),
          text: props.display(rec)
        };
      });
      return result;
    };
  }
  focus() {
    if (this.m_props.editable) {
      this.m_ui_input.focus();
    } else {
      super.focus();
    }
  }
};
__name(ComboBox, "ComboBox");

// src/form.ts
var Form = class extends VLayout {
  m_height;
  m_container;
  m_buttons;
  m_dirty;
  m_watchChanges;
  constructor(props) {
    let content = props.content;
    props.content = null;
    let height = props.height;
    props.height = void 0;
    super(props);
    this.setTag(props.disableSuggestions ? "section" : "form");
    this.mapPropEvents(props, "btnClick", "dirty");
    this.updateContent(content, props.buttons, height);
    this.m_dirty = false;
    this.m_watchChanges = false;
  }
  /**
   * returns the container object
   */
  get container() {
    return this.m_container;
  }
  /**
   * 
   */
  componentCreated() {
    super.componentCreated();
    if (this.m_watchChanges) {
      this.watchChanges();
    }
  }
  /**
   * 
   */
  updateContent(items, buttons, height = 0) {
    if (height) {
      this.m_height = height;
    }
    this._makeButtons(buttons);
    let content = [
      this.m_container = new VLayout({
        cls: "container",
        height: this.m_height,
        content: items
      }),
      this.m_buttons
    ];
    super.setContent(content);
  }
  /**
   * 
   * @param els 
   * @param refreshAll 
   */
  setContent(els, refreshAll = true) {
    this.m_container.setContent(els, refreshAll);
  }
  /**
   * 
   * @param buttons 
   */
  setButtons(buttons) {
    this._makeButtons(buttons);
  }
  /**
   * enable a button by it's name
   */
  enableButton(name, enable = true) {
    let button = this.getButton(name);
    if (button) {
      button.enable(enable);
    }
  }
  /**
   * return a button by it's name
   * @param name 
   */
  getButton(name) {
    let button = this.m_buttons?.itemWithRef("@" + name);
    return button;
  }
  /**
   * 
   */
  _makeButtons(buttons) {
    if (!this.m_buttons) {
      this.m_buttons = new HLayout({
        cls: "footer",
        ref: "buttons"
      });
    }
    let btns = [];
    if (buttons) {
      for (let b of buttons) {
        if (b instanceof Component) {
          btns.push(b);
        } else {
          switch (b) {
            case "ok": {
              btns.push(new Button({ ref: "@" + b, text: _tr.global.ok, click: () => {
                this._click(b);
              } }));
              break;
            }
            case "cancel": {
              btns.push(new Button({ ref: "@" + b, text: _tr.global.cancel, click: () => {
                this._click(b);
              } }));
              break;
            }
            case "ignore": {
              btns.push(new Button({ ref: "@" + b, text: _tr.global.ignore, click: () => {
                this._click(b);
              } }));
              break;
            }
            case "yes": {
              btns.push(new Button({ ref: "@" + b, text: _tr.global.yes, click: () => {
                this._click(b);
              } }));
              break;
            }
            case "no": {
              btns.push(new Button({ ref: "@" + b, text: _tr.global.no, click: () => {
                this._click(b);
              } }));
              break;
            }
            case "close": {
              btns.push(new Button({ ref: "@" + b, text: _tr.global.close, click: () => {
                this._click(b);
              } }));
              break;
            }
            case "save": {
              btns.push(new Button({ ref: "@" + b, text: _tr.global.save, click: () => {
                this._click(b);
              } }));
              break;
            }
            case "dontsave": {
              btns.push(new Button({ ref: "@" + b, text: _tr.global.dontsave, click: () => {
                this._click(b);
              } }));
              break;
            }
          }
        }
      }
    }
    if (btns.length == 1) {
      btns[0].setAttribute("autofocus", true);
    }
    this.m_buttons.setContent(btns);
  }
  /**
   * 
   */
  validate() {
    let inputs = this.queryAll("input"), result = true;
    for (let i = 0; i < inputs.length; i++) {
      const input = Component.getElement(inputs[i], TextEdit);
      if (input && !input.validate()) {
        result = false;
      } else {
        const combo = Component.getElement(inputs[i], ComboBox);
        if (combo && !combo.validate()) {
          result = false;
        }
      }
    }
    return result;
  }
  /**
   * 
   */
  _click(btn) {
    this.emit("btnClick", EvBtnClick(btn));
  }
  /**
   * replacement for HTMLFormElement.elements
   * as chrome shows suggestions on form elements even if we ask him (not to do that)
   * we removed <form> element.
   * so we have to get children by hand
   */
  _getElements() {
    console.assert(!!this.dom);
    const els = this.queryAll("[name]");
    return els;
  }
  /**
   * 
   */
  setValues(values) {
    let elements = this._getElements();
    for (let e = 0; e < elements.length; e++) {
      let input = elements[e];
      let item = Component.getElement(input);
      if (!item.hasAttribute("name")) {
        continue;
      }
      let name = item.getAttribute("name"), type = item.getAttribute("type");
      if (values[name] !== void 0) {
        item.setStoreValue(values[name]);
      }
    }
    this.setDirty(false);
  }
  /**
   * 
   */
  clearValues() {
    let elements = this._getElements();
    for (let e = 0; e < elements.length; e++) {
      let input = elements[e];
      let item = Component.getElement(input);
      if (!item.hasAttribute("name")) {
        continue;
      }
      item.setStoreValue(null);
    }
    this.setDirty(false);
  }
  /**
   * values are not escaped
   * checkbox set true when checked
   * radio set value when checked
   */
  getValues() {
    let elements = this._getElements();
    let result = {};
    for (let e = 0; e < elements.length; e++) {
      let el = elements[e];
      let item = Component.getElement(el);
      if (!item.hasAttribute("name")) {
        continue;
      }
      let name = item.getAttribute("name"), value = item.getStoreValue();
      if (value !== void 0) {
        result[name] = value;
      }
    }
    return result;
  }
  /**
   * send the query to the desired handler
   */
  submit(cfg, cbvalidation) {
    if (!this.validate()) {
      return false;
    }
    let values = this.getValues();
    if (cbvalidation) {
      if (!cbvalidation(values)) {
        return false;
      }
    }
    let form = new FormData();
    for (let n in values) {
      if (values.hasOwnProperty(n)) {
        form.append(n, values[n] === void 0 ? "" : values[n]);
      }
    }
    cfg.params = form;
    return ajaxRequest(cfg);
  }
  /**
   * to be abble to see the dirty flag, you need to call this method
   * cf. isDirty, setDirty
   */
  watchChanges() {
    if (this.dom) {
      const els = this.queryAll("input[name], textarea[name]");
      els.forEach((el) => {
        flyWrap(el).setDomEvent("input", () => {
          this.setDirty();
        });
      });
      this.m_watchChanges = false;
    } else {
      this.m_watchChanges = true;
    }
  }
  /**
   * cf. watchChanges
   */
  setDirty(set = true) {
    this.m_dirty = set;
    this.emit("dirty", { dirty: set });
  }
  /**
   * cf. watchChanges
   */
  isDirty() {
    return this.m_dirty;
  }
};
__name(Form, "Form");

// src/dialog.ts
function EvBtnClick(button) {
  return BasicEvent({ button });
}
__name(EvBtnClick, "EvBtnClick");
var Dialog = class extends Popup {
  m_icon;
  m_title;
  m_form;
  m_buttons;
  m_closable;
  m_movable;
  m_maximized;
  m_minimized;
  m_maximizable;
  m_minimizable;
  m_minFormSize;
  m_rc_max;
  m_rc_min;
  m_el_title;
  m_last_down;
  m_auto_close;
  m_ui_title;
  m_form_cb;
  constructor(props) {
    let content = props.content;
    props.content = null;
    let width = props.width;
    let height = props.height;
    props.width = void 0;
    props.height = void 0;
    super(props);
    this.m_minFormSize = { width, height };
    this.enableMask(true);
    if (props.form) {
      if (!isFunction(props.form)) {
        this.m_form = props.form;
        this.m_form.on("btnClick", (e) => this._handleClick(e));
      } else {
        this.m_form_cb = props.form;
      }
    } else {
      this.m_form = new Form({
        content,
        buttons: props.buttons,
        disableSuggestions: props.disableSuggestions,
        btnClick: (e) => this._handleClick(e)
      });
    }
    this.m_movable = props.movable;
    this.m_auto_close = props.autoClose ?? true;
    this.m_icon = props.icon;
    this.m_title = props.title;
    this.m_buttons = props.buttons ?? null;
    this.m_closable = props.closable ?? false;
    this.m_last_down = 0;
    this.on("size", (ev) => {
      this.addClass("@resized");
      this.m_form.setStyleValue("width", null);
      this.m_form.setStyleValue("height", null);
    });
    this.m_maximized = false;
    this.m_minimized = false;
    this.m_maximizable = false;
    this.m_minimizable = false;
    if (props.maximizable !== void 0) {
      this.m_maximizable = props.maximizable;
    }
    if (props.minimizable !== void 0) {
      this.m_minimizable = props.minimizable;
    }
    if (props.maximized == true) {
      this.m_maximizable = true;
    }
    if (props.btnClick) {
      this.on("btnClick", props.btnClick);
    }
  }
  /**
   * 
   */
  componentCreated() {
    super.componentCreated();
    if (this.m_minFormSize.width) {
      this.m_form.setStyle({
        minWidth: this.m_minFormSize.width,
        width: this.m_minFormSize.width
      });
    }
    if (this.m_minFormSize.height) {
      this.m_form.setStyle({
        minHeight: this.m_minFormSize.height,
        height: this.m_minFormSize.height
      });
    }
    const rc = this.getBoundingRect();
    this.setStyleValue("min-width", rc.width);
    this.setStyleValue("min-height", rc.height);
    this.setStyleValue("width", rc.width);
    this.setStyleValue("height", rc.height);
    if (this.m_props.dlgWidth) {
      this.setStyleValue("width", this.m_props.dlgWidth + "%");
    }
    if (this.m_props.dlgHeight) {
      this.setStyleValue("height", this.m_props.dlgHeight + "%");
    }
    this.addClass("@resized");
    if (this.m_el_title) {
      this.m_el_title.setStyleValue("width", "auto");
    }
    if (this.m_props.maximized) {
      this._maximize();
      this.emit("size", EvSize(null));
    } else {
      this.centerOnScreen();
    }
  }
  /**
   * 
   */
  _handleClick(ev) {
    this.emit("btnClick", ev);
    if (!ev.defaultPrevented) {
      this.close();
    }
  }
  /**
   * restore the geometry
   */
  setGeometry(geom) {
    if (geom.minimized && this.m_minimizable) {
      this._minimize(false);
      this.m_rc_min = new Rect(geom.left, geom.top, geom.width, geom.height);
      this.displayAt(geom.left, geom.top, "top-left");
    } else if (geom.maximized && this.m_maximizable) {
      this._maximize(false);
      this.m_rc_max = new Rect(geom.left, geom.top, geom.width, geom.height);
    } else {
      this.setSize(geom.width, geom.height);
      this.displayAt(geom.left, geom.top, "top-left");
    }
  }
  /**
   * return the geometry (usefull to save state)
   */
  getGeometry() {
    if (this.m_minimized) {
      return {
        left: this.m_rc_min.left,
        top: this.m_rc_min.top,
        width: this.m_rc_min.width,
        height: this.m_rc_min.height,
        minimized: true,
        maximized: false
      };
    } else if (this.m_maximized) {
      return {
        left: this.m_rc_max.left,
        top: this.m_rc_max.top,
        width: this.m_rc_max.width,
        height: this.m_rc_max.height,
        minimized: false,
        maximized: true
      };
    }
    let rc = this.getBoundingRect();
    return {
      left: rc.left,
      top: rc.top,
      width: rc.width,
      height: rc.height,
      minimized: false,
      maximized: false
    };
  }
  /**
   * resize the dialog
   * @param width 
   * @param height 
   */
  setSize(width, height) {
    this.setStyle({ width, height });
    this.emit("size", EvSize({ width, height }));
  }
  /** @ignore */
  render() {
    if (this.m_form_cb) {
      this.m_form = this.m_form_cb();
      this.m_form.on("btnClick", (e) => this._handleClick(e));
      this.m_form_cb = null;
    }
    let hasTitle = this.m_icon !== void 0 || this.m_closable || this.m_title !== void 0 || this.m_movable;
    this.m_el_title = null;
    if (hasTitle) {
      this.m_el_title = new HLayout({
        cls: "title",
        content: [
          this.m_icon ? new Icon({ icon: this.m_icon }) : null,
          this.m_ui_title = new Label({ flex: 1, text: this.m_title }),
          this.m_minimizable ? new Icon({ cls: "min-btn", icon: "var( --x4-icon-window-minimize )", dom_events: { click: () => this._toggleMin() } }) : null,
          this.m_maximizable ? new Icon({ cls: "max-btn", icon: "var( --x4-icon-window-maximize )", dom_events: { click: () => this._toggleMax() } }) : null,
          this.m_maximizable ? new Icon({ cls: "res-btn", icon: "var( --x4-icon-window-restore )", dom_events: { click: () => this._toggleMax() } }) : null,
          this.m_closable ? new Icon({ cls: "close-btn", icon: "var( --x4-icon-rectangle-times )", dom_events: { click: () => this.close() } }) : null
        ]
      });
      if (this.m_movable) {
        if (isTouchDevice()) {
          this.m_el_title.setDomEvent("touchstart", (e) => this._mouseDown(e));
        } else {
          this.m_el_title.setDomEvent("mousedown", (e) => this._mouseDown(e));
        }
      }
    }
    super.setContent([
      this.m_el_title,
      this.m_form
    ]);
  }
  /**
   * change the dialog content
   * @param els 
   * @param refreshAll 
   */
  setContent(els, refreshAll = true) {
    this.m_form.setContent(els, refreshAll);
  }
  /**
   * change the dialog buttons
   * @param buttons 
   */
  setButtons(buttons) {
    this.m_form.setButtons(buttons);
  }
  /**
   * return the dialog form
   */
  get form() {
    return this.m_form;
  }
  /**
   * close the dialog
   */
  close() {
    this.emit("close", {});
    super.close();
  }
  /**
   * 
   */
  _toggleMax() {
    if (!this.m_maximizable) {
      return;
    }
    if (this.m_maximized) {
      this.removeClass("maximized");
      this.setStyle({
        left: this.m_rc_max.left,
        top: this.m_rc_max.top,
        width: this.m_rc_max.width,
        height: this.m_rc_max.height
      });
      this.m_maximized = false;
      this.emit("size", EvSize(null, "restore"));
    } else {
      this._maximize();
      this.emit("size", EvSize(null, "maximize"));
    }
  }
  /**
   * 
   */
  _toggleMin() {
    if (!this.m_minimizable) {
      return;
    }
    if (this.m_minimized) {
      this.removeClass("minimized");
      this.setStyle({
        //left: 	this.m_rc_min.left,
        //top: 	this.m_rc_min.top,
        width: this.m_rc_min.width,
        height: this.m_rc_min.height
      });
      this.m_minimized = false;
      this.emit("size", EvSize(null, "restore"));
    } else {
      this._minimize();
      this.emit("size", EvSize(null, "minimize"));
    }
  }
  /**
   * 
   */
  _mouseDown(event) {
    let { x, y } = getMousePos(event, true);
    let wrc = flyWrap(x4document.body).getBoundingRect();
    let rc = this.getBoundingRect(true);
    let dx = x - rc.left, dy = y - rc.top;
    const now = Date.now();
    const delta = now - this.m_last_down;
    if (this.m_maximizable && delta < 700) {
      this._toggleMax();
      return;
    }
    this.m_last_down = now;
    if (this.m_maximized) {
      return;
    }
    let __move = /* @__PURE__ */ __name((ex, ey) => {
      if (ex > wrc.right) {
        ex = wrc.right;
      } else if (ex < wrc.left) {
        ex = wrc.left;
      }
      if (ey > wrc.bottom) {
        ey = wrc.bottom;
      } else if (ey < wrc.top) {
        ey = wrc.top;
      }
      let x2 = ex - dx, y2 = ey - dy;
      this.setStyle({
        left: x2,
        top: y2
      });
    }, "__move");
    Component.setCapture(this, (ev) => {
      if (ev.type == "mousemove") {
        let mev = ev;
        __move(mev.clientX, mev.clientY);
      } else if (ev.type == "touchmove") {
        let tev = ev;
        if (tev.touches.length == 1) {
          __move(tev.touches[0].clientX, tev.touches[0].clientY);
        }
      } else if (ev.type == "mouseup" || ev.type == "touchend") {
        Component.releaseCapture();
        this.emit("move", EvMove(null));
      } else if (ev.type == "mousedown" || ev.type == "touchstart") {
      }
    });
  }
  /**
   * maximize the dialog
   */
  maximize() {
    if (!this.m_maximizable || this.m_maximized) {
      return;
    }
    this._maximize();
    this.emit("size", EvSize(null));
  }
  /**
   * 
   */
  _maximize(saveRect = true) {
    if (saveRect) {
      this.m_rc_max = this.getBoundingRect(false);
    }
    this.addClass("maximized");
    this.m_maximized = true;
    this.setStyle({
      left: void 0,
      top: void 0,
      width: void 0,
      height: void 0
    });
  }
  /**
   * minimize the dialog
   */
  minimize() {
    if (!this.m_minimizable || this.m_minimized) {
      return;
    }
    this._minimize();
    this.emit("size", EvSize(null));
  }
  /**
   * 
   */
  _minimize(saveRect = true) {
    if (saveRect) {
      this.m_rc_min = this.getBoundingRect(false);
    }
    this.addClass("minimized");
    this.m_minimized = true;
    this.setStyle({
      //left: undefined,
      //top: undefined,
      width: void 0,
      height: void 0
    });
  }
  /**
   * change the dialog title
   */
  set title(title) {
    this.m_title = title;
    if (this.m_ui_title) {
      this.m_ui_title.text = title;
    }
  }
  itemWithName(name) {
    let result = this.dom.querySelector(`[name="${name}"]`);
    return result ? Component.getElement(result) : null;
  }
  getValues() {
    return this.m_form.getValues();
  }
  validate() {
    return this.m_form.validate();
  }
};
__name(Dialog, "Dialog");

// src/colorpicker.ts
var _ColorPicker = class extends Container {
  m_colorSel;
  m_colorHue;
  m_colorAlpha;
  m_sample;
  m_selMark;
  m_hueMark;
  m_alphaMark;
  m_baseHSV;
  m_baseColor;
  m_transpCk;
  m_colorEdit;
  m_palmode;
  constructor(props) {
    super(props);
    this.m_palmode = _ColorPicker.last_palmode;
    this.setDomEvent("contextmenu", (e) => this._showCtx(e));
  }
  _showCtx(e) {
    const menu = new Menu({
      items: [
        new MenuItem({
          text: "Palette",
          checked: this.m_palmode,
          click: () => {
            this.m_palmode = !this.m_palmode;
            _ColorPicker.last_palmode = this.m_palmode;
            this.update();
          }
        })
      ]
    });
    let pt = getMousePos(e, true);
    menu.displayAt(pt.x, pt.y);
  }
  render(props) {
    this.m_baseColor = props.color;
    this.m_baseHSV = Color.toHSV(this.m_baseColor);
    if (this.m_palmode) {
      let fillSubs2 = function(colors) {
        sub_sel = [];
        colors.forEach((mc) => {
          let clr = new Color(mc.hex);
          const selected = clr.value() == ccolor;
          let cls = classNames("hclr-box xbox", { selected });
          let el = new Component({
            cls,
            style: { backgroundColor: clr.toHex(), color: Color.contrastColor(clr).toHex() },
            data: { color: clr.value() },
            content: clr.toHex()
          });
          sub_sel.push(el);
          if (selected) {
            cur = el;
          }
        });
        if (selector) {
          selector.itemWithId("vsel").setContent(sub_sel);
        }
      };
      var fillSubs = fillSubs2;
      __name(fillSubs2, "fillSubs");
      this.addClass("pal-mode");
      let selector = null;
      let cur = null;
      let main_sel = [];
      let sub_sel = [];
      const ccolor = this.m_baseColor.value();
      materialColors.forEach((mc) => {
        const color = mc.variations[4].hex;
        let selected = color === ccolor;
        if (!selected) {
          selected = mc.variations.some((c) => {
            const cc = new Color(c.hex).value();
            if (cc === ccolor) {
              return true;
            }
          });
        }
        let cls = classNames("clr-box xbox", { selected });
        let el = new Component({
          cls,
          style: { backgroundColor: new Color(color).toHex() },
          data: { color, main: mc.variations }
        });
        if (selected) {
          fillSubs2(mc.variations);
        }
        main_sel.push(el);
      });
      selector = new VLayout({
        content: [
          new HLayout({
            id: "hsel",
            content: main_sel
          }),
          new VLayout({
            id: "vsel",
            flex: 1,
            content: sub_sel
          })
        ]
      });
      this.m_colorEdit = new TextEdit({
        cls: "hexv",
        value: "",
        attrs: {
          spellcheck: false
        },
        change: (ev) => {
          const clr = new Color(ev.value);
          if (clr) {
            this.m_baseColor = clr;
            this.m_baseHSV = Color.toHSV(clr);
            this._updateColor(false);
          }
        }
      });
      this.m_transpCk = new CheckBox({
        cls: "transp",
        text: "transparent",
        change: (ev) => {
          this.m_baseHSV.a = ev.value ? 0 : 1;
          this._updateColor();
        }
      });
      this.setContent([selector, this.m_transpCk, this.m_colorEdit]);
      selector.setDomEvent("click", (ev) => {
        if (cur) {
          cur.removeClass("selected");
          cur = null;
        }
        let cell = Component.getElement(ev.target, "xbox");
        if (cell) {
          const subs = cell.getData("main");
          if (subs) {
            fillSubs2(subs);
          } else {
            const clr = new Color(cell.getData("color"));
            this.m_baseColor = clr;
            this.m_baseHSV = Color.toHSV(clr);
            this._updateColor();
            cur = cell;
            cell.addClass("selected");
          }
        }
      });
    } else {
      this.removeClass("pal-mode");
      this.m_selMark = new Component({ cls: "marker" });
      this.m_colorSel = new Component({
        cls: "sel",
        content: [
          new Component({ cls: "@fit light" }),
          new Component({ cls: "@fit dark" }),
          this.m_selMark
        ]
      });
      this.m_hueMark = new Component({ cls: "marker" });
      this.m_colorHue = new Component({
        cls: "hue",
        content: [
          this.m_hueMark
        ]
      });
      this.m_sample = new Component({ cls: "sample" });
      if (props.hasAlpha) {
        this.addClass("with-alpha");
        this.m_alphaMark = new Component({ cls: "marker" });
        this.m_colorAlpha = new Component({
          cls: "alpha",
          content: [
            new Component({ cls: "bk @fit", ref: "color" }),
            this.m_alphaMark
          ]
        });
      } else {
        this.removeClass("with-alpha");
        this.m_transpCk = new CheckBox({
          cls: "transp",
          text: "transparent",
          change: (ev) => {
            this.m_baseHSV.a = ev.value ? 0 : 1;
            this._updateColor();
          }
        });
      }
      this.m_colorEdit = new TextEdit({
        cls: "hexv",
        value: "",
        attrs: {
          spellcheck: false
        },
        change: (ev) => {
          const clr = new Color(ev.value);
          if (clr) {
            this.m_baseColor = clr;
            this.m_baseHSV = Color.toHSV(clr);
            this._updateColor(false);
          }
        }
      });
      this.setContent([
        this.m_colorSel,
        this.m_colorHue,
        this.m_colorAlpha,
        this.m_transpCk,
        this.m_colorEdit,
        this.m_sample
      ]);
      this.m_colorSel.setDomEvent("mousedown", (ev) => {
        Component.setCapture(this, (e) => this._selChange(e));
      });
      this.m_colorHue.setDomEvent("mousedown", (ev) => {
        Component.setCapture(this, (e) => this._hueChange(e));
      });
      if (props.hasAlpha) {
        this.m_colorAlpha.setDomEvent("mousedown", (ev) => {
          Component.setCapture(this, (e) => this._alphaChange(e));
        });
      }
      this._updateColor();
    }
  }
  set color(clr) {
    this.m_baseColor = clr;
    this.m_baseHSV = Color.toHSV(this.m_baseColor);
    this._updateColor();
  }
  get color() {
    return this.m_baseColor;
  }
  _selChange(ev) {
    let pt = getMousePos(ev, true);
    console.log(pt);
    let rc = this.m_colorSel.getBoundingRect();
    if (!this.m_props.hasAlpha) {
      this.m_baseHSV.a = 1;
    }
    this.m_baseHSV.s = clamp((pt.x - rc.left) / rc.width, 0, 1);
    this.m_baseHSV.v = 1 - clamp((pt.y - rc.top) / rc.height, 0, 1);
    this._updateColor();
    if (ev.type == "mouseup" || ev.type == "touchend") {
      Component.releaseCapture();
    }
  }
  _hueChange(ev) {
    let pt = getMousePos(ev, true);
    let rc = this.m_colorHue.getBoundingRect();
    this.m_baseHSV.h = clamp((pt.y - rc.top) / rc.height, 0, 1);
    this._updateColor();
    if (ev.type == "mouseup" || ev.type == "touchend") {
      Component.releaseCapture();
    }
  }
  _alphaChange(ev) {
    let pt = getMousePos(ev, true);
    let rc = this.m_colorAlpha.getBoundingRect();
    this.m_baseHSV.a = clamp((pt.x - rc.left) / rc.width, 0, 1);
    this._updateColor();
    if (ev.type == "mouseup" || ev.type == "touchend") {
      Component.releaseCapture();
    }
  }
  _updateColor(edit = true) {
    let color;
    if (!this.m_palmode) {
      color = Color.fromHSV(this.m_baseHSV.h, 1, 1, 1);
      this.m_colorSel.setStyleValue("backgroundColor", color.toString());
      color = Color.fromHSV(this.m_baseHSV.h, this.m_baseHSV.s, this.m_baseHSV.v, 1);
      this.m_sample.setStyleValue("backgroundColor", color.toString());
      if (this.m_props.hasAlpha) {
        let gradient = `linear-gradient(to right, rgba(0,0,0,0) 0%, ${color.toString()} 100%)`;
        this.m_colorAlpha.itemWithRef("color").setStyleValue("backgroundImage", gradient);
      }
      this.m_selMark.setStyle({
        left: this.m_baseHSV.s * 100 + "%",
        top: 100 - this.m_baseHSV.v * 100 + "%"
      });
      this.m_hueMark.setStyle({
        top: this.m_baseHSV.h * 100 + "%"
      });
      if (this.m_props.hasAlpha) {
        this.m_alphaMark.setStyle({
          left: this.m_baseHSV.a * 100 + "%"
        });
      } else {
        this.m_transpCk.check = this.m_baseHSV.a == 0;
      }
    } else {
      this.m_transpCk.check = this.m_baseHSV.a == 0;
    }
    color = Color.fromHSV(this.m_baseHSV.h, this.m_baseHSV.s, this.m_baseHSV.v, this.m_baseHSV.a);
    this.m_baseColor = color;
    if (edit) {
      this.m_colorEdit.value = color.alpha() == 1 ? color.toHex() : color.toString();
    }
    this._change();
  }
  _change() {
    this.emit("change", EvChange(this.m_baseColor));
  }
};
var ColorPicker = _ColorPicker;
__name(ColorPicker, "ColorPicker");
__publicField(ColorPicker, "last_palmode", false);
var ColorPickerBox = class extends Dialog {
  m_picker;
  constructor(props) {
    props.icon = void 0;
    props.buttons = void 0;
    super(props);
    this.mapPropEvents(props, "change");
    this.m_picker = new ColorPicker({
      color: props.color,
      hasAlpha: props.hasAlpha,
      style: { padding: 8 },
      width: 250,
      height: 250
    });
    let customs = this._makeCustoms(props.cust_colors);
    this.form.updateContent([
      new VLayout({
        content: [
          this.m_picker,
          customs
        ]
      })
    ], ["ok", "cancel"]);
    this.on("btnClick", (ev) => {
      if (ev.button == "ok") {
        this.emit("change", EvChange(this.m_picker.color));
      }
    });
  }
  _makeCustoms(cc) {
    let custom = null;
    if (cc && cc.length > 0) {
      let els = [];
      for (let i = 0; i < cc.length; i += 8) {
        let lne = [];
        for (let j = 0; j < 8; j++) {
          let idx = i + j, clr = cc[idx];
          lne.push(new Label({
            cls: "cust-cc",
            text: "",
            flex: 1,
            style: {
              backgroundColor: clr ? clr.toString() : "transparent"
            },
            tooltip: clr ? clr.toString() : void 0,
            dom_events: {
              click: () => {
                if (clr) {
                  this.m_picker.color = clr;
                  this.emit("change", EvChange(clr));
                  this.close();
                }
              }
            }
          }));
        }
        els.push(new HLayout({ cls: "line", content: lne }));
      }
      custom = new VLayout({ cls: "customs", content: els });
    }
    return custom;
  }
  set color(clr) {
    this.m_picker.color = clr;
  }
  get color() {
    return this.m_picker.color;
  }
  /**
   * display a messagebox
   */
  static show(props) {
    let msg;
    if (isString(props)) {
      msg = new ColorPickerBox({ color: new Color(props) });
    } else {
      msg = new ColorPickerBox(props);
    }
    msg.show();
    return msg;
  }
};
__name(ColorPickerBox, "ColorPickerBox");
var ColorPickerEditor = class extends HLayout {
  constructor(props) {
    super(props);
    this.mapPropEvents(props, "change");
  }
  render(props) {
    let color = props.color;
    let tcolor;
    if (this._isTransp(color)) {
      color = Color.NONE;
      tcolor = "black";
    } else {
      tcolor = Color.contrastColor(color).toString();
    }
    this.setContent([
      props.label ? new Label({
        cls: "label",
        text: props.label,
        flex: props.labelWidth < 0 ? -props.labelWidth : void 0,
        width: props.labelWidth >= 0 ? props.labelWidth : void 0
      }) : null,
      new Component({
        flex: 1,
        content: [
          new Label({
            cls: "alpha @fit",
            text: ""
          }),
          new Label({
            cls: "value @fit",
            text: props.displayValue === false ? "" : color.toHex(),
            style: {
              backgroundColor: color.toString(),
              color: tcolor
            },
            dom_events: {
              click: () => this._showPicker()
            }
          })
        ]
      })
    ]);
    if (props.displayValue === false) {
      this.setStyleValue("background-image", "url( 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAEsmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS41LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iCiAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIKICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgZXhpZjpQaXhlbFhEaW1lbnNpb249IjEwIgogICBleGlmOlBpeGVsWURpbWVuc2lvbj0iMTAiCiAgIGV4aWY6Q29sb3JTcGFjZT0iMSIKICAgdGlmZjpJbWFnZVdpZHRoPSIxMCIKICAgdGlmZjpJbWFnZUxlbmd0aD0iMTAiCiAgIHRpZmY6UmVzb2x1dGlvblVuaXQ9IjIiCiAgIHRpZmY6WFJlc29sdXRpb249IjcyLjAiCiAgIHRpZmY6WVJlc29sdXRpb249IjcyLjAiCiAgIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiCiAgIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIKICAgeG1wOk1vZGlmeURhdGU9IjIwMjEtMDMtMjJUMTU6NTE6NDkrMDE6MDAiCiAgIHhtcDpNZXRhZGF0YURhdGU9IjIwMjEtMDMtMjJUMTU6NTE6NDkrMDE6MDAiPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJwcm9kdWNlZCIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWZmaW5pdHkgRGVzaWduZXIgMS45LjAiCiAgICAgIHN0RXZ0OndoZW49IjIwMjEtMDMtMjJUMTU6NTE6NDkrMDE6MDAiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogIDwvcmRmOkRlc2NyaXB0aW9uPgogPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KPD94cGFja2V0IGVuZD0iciI/Pn8+b7YAAAGCaUNDUHNSR0IgSUVDNjE5NjYtMi4xAAAokXWRy0tCQRSHv7Qwyh5gRIsWEtZKwwyiNi2UXlAt1CCrjV5fgdrlXiOibdBWKIja9FrUX1DboHUQFEUQ7YLWRW0qbueqoESe4cz55jdzDjNnwBLOKFm93gvZXF4LTvid85EFp+0FK5204sURVXR1JjQepqZ93lNnxluPWav2uX+tOZ7QFahrFB5VVC0vPCk8vZZXTd4R7lDS0bjwmbBbkwsK35l6rMSvJqdK/G2yFg4GwNIu7ExVcayKlbSWFZaX48pmVpXyfcyX2BO5uZDEHvFudIJM4MfJFGMEGGKAEZmH8OCjX1bUyPcW82dZkVxFZpV1NJZJkSaPW9RVqZ6QmBQ9ISPDutn/v33Vk4O+UnW7HxqeDeO9F2zb8FMwjK8jw/g5BusTXOYq+SuHMPwheqGiuQ6gbRPOrypabBcutqDrUY1q0aJkFbckk/B2Ci0RcNxA02KpZ+V9Th4gvCFfdQ17+9An59uWfgF7Hmfv4QYbGAAAAAlwSFlzAAALEwAACxMBAJqcGAAAACdJREFUGJVjbGhoYEAC9fX1yFwmBryAptKM////R+Y3NjbSzW4C0gAo9QeQBmhTIwAAAABJRU5ErkJggg=='");
    }
    this._setTabIndex(props.tabIndex);
  }
  set value(color) {
    this.m_props.color = color;
    this.update();
  }
  get value() {
    return this.m_props.color;
  }
  set custom_colors(v) {
    this.m_props.cust_colors = v;
  }
  _showPicker() {
    let dlg = new ColorPickerBox({
      color: this.m_props.color,
      cust_colors: this.m_props.cust_colors,
      hasAlpha: this.m_props.hasAlpha,
      events: {
        change: (e) => {
          this.m_props.color = e.value;
          this._change();
          this.update();
        }
      }
    });
    let rc = this.getBoundingRect();
    dlg.displayAt(rc.left, rc.bottom, "tl");
  }
  _change() {
    this.emit("change", EvChange(this.m_props.color));
  }
  _isTransp(color) {
    return !color.alpha();
  }
};
__name(ColorPickerEditor, "ColorPickerEditor");
var materialColors = [
  {
    color: "Red",
    variations: [
      {
        weight: 50,
        hex: 16772078
      },
      {
        weight: 100,
        hex: 16764370
      },
      {
        weight: 200,
        hex: 15702682
      },
      {
        weight: 300,
        hex: 15037299
      },
      {
        weight: 400,
        hex: 15684432
      },
      {
        weight: 500,
        hex: 16007990
      },
      {
        weight: 600,
        hex: 15022389
      },
      {
        weight: 700,
        hex: 13840175
      },
      {
        weight: 800,
        hex: 12986408
      },
      {
        weight: 900,
        hex: 12000284
      }
    ]
  },
  {
    color: "Pink",
    variations: [
      {
        weight: 50,
        hex: 16573676
      },
      {
        weight: 100,
        hex: 16301008
      },
      {
        weight: 200,
        hex: 16027569
      },
      {
        weight: 300,
        hex: 15753874
      },
      {
        weight: 400,
        hex: 15483002
      },
      {
        weight: 500,
        hex: 15277667
      },
      {
        weight: 600,
        hex: 14162784
      },
      {
        weight: 700,
        hex: 12720219
      },
      {
        weight: 800,
        hex: 11342935
      },
      {
        weight: 900,
        hex: 8916559
      }
    ]
  },
  {
    color: "Purple",
    variations: [
      {
        weight: 50,
        hex: 15984117
      },
      {
        weight: 100,
        hex: 14794471
      },
      {
        weight: 200,
        hex: 13538264
      },
      {
        weight: 300,
        hex: 12216520
      },
      {
        weight: 400,
        hex: 11225020
      },
      {
        weight: 500,
        hex: 10233776
      },
      {
        weight: 600,
        hex: 9315498
      },
      {
        weight: 700,
        hex: 8069026
      },
      {
        weight: 800,
        hex: 6953882
      },
      {
        weight: 900,
        hex: 4854924
      }
    ]
  },
  {
    color: "Deep Purple",
    variations: [
      {
        weight: 50,
        hex: 15591414
      },
      {
        weight: 100,
        hex: 13747433
      },
      {
        weight: 200,
        hex: 11771355
      },
      {
        weight: 300,
        hex: 9795021
      },
      {
        weight: 400,
        hex: 8280002
      },
      {
        weight: 500,
        hex: 6765239
      },
      {
        weight: 600,
        hex: 6174129
      },
      {
        weight: 700,
        hex: 5320104
      },
      {
        weight: 800,
        hex: 4532128
      },
      {
        weight: 900,
        hex: 3218322
      }
    ]
  },
  {
    color: "Indigo",
    variations: [
      {
        weight: 50,
        hex: 15264502
      },
      {
        weight: 100,
        hex: 12962537
      },
      {
        weight: 200,
        hex: 10463450
      },
      {
        weight: 300,
        hex: 7964363
      },
      {
        weight: 400,
        hex: 6056896
      },
      {
        weight: 500,
        hex: 4149685
      },
      {
        weight: 600,
        hex: 3754411
      },
      {
        weight: 700,
        hex: 3162015
      },
      {
        weight: 800,
        hex: 2635155
      },
      {
        weight: 900,
        hex: 1713022
      }
    ]
  },
  {
    color: "Blue",
    variations: [
      {
        weight: 50,
        hex: 14938877
      },
      {
        weight: 100,
        hex: 12312315
      },
      {
        weight: 200,
        hex: 9489145
      },
      {
        weight: 300,
        hex: 6600182
      },
      {
        weight: 400,
        hex: 4367861
      },
      {
        weight: 500,
        hex: 2201331
      },
      {
        weight: 600,
        hex: 2001125
      },
      {
        weight: 700,
        hex: 1668818
      },
      {
        weight: 800,
        hex: 1402304
      },
      {
        weight: 900,
        hex: 870305
      }
    ]
  },
  {
    color: "Light Blue",
    variations: [
      {
        weight: 50,
        hex: 14808574
      },
      {
        weight: 100,
        hex: 11789820
      },
      {
        weight: 200,
        hex: 8508666
      },
      {
        weight: 300,
        hex: 5227511
      },
      {
        weight: 400,
        hex: 2733814
      },
      {
        weight: 500,
        hex: 240116
      },
      {
        weight: 600,
        hex: 236517
      },
      {
        weight: 700,
        hex: 166097
      },
      {
        weight: 800,
        hex: 161725
      },
      {
        weight: 900,
        hex: 87963
      }
    ]
  },
  {
    color: "Cyan",
    variations: [
      {
        weight: 50,
        hex: 14743546
      },
      {
        weight: 100,
        hex: 11725810
      },
      {
        weight: 200,
        hex: 8445674
      },
      {
        weight: 300,
        hex: 5099745
      },
      {
        weight: 400,
        hex: 2541274
      },
      {
        weight: 500,
        hex: 48340
      },
      {
        weight: 600,
        hex: 44225
      },
      {
        weight: 700,
        hex: 38823
      },
      {
        weight: 800,
        hex: 33679
      },
      {
        weight: 900,
        hex: 24676
      }
    ]
  },
  {
    color: "Teal",
    variations: [
      {
        weight: 50,
        hex: 14742257
      },
      {
        weight: 100,
        hex: 11722715
      },
      {
        weight: 200,
        hex: 8440772
      },
      {
        weight: 300,
        hex: 5093036
      },
      {
        weight: 400,
        hex: 2533018
      },
      {
        weight: 500,
        hex: 38536
      },
      {
        weight: 600,
        hex: 35195
      },
      {
        weight: 700,
        hex: 31083
      },
      {
        weight: 800,
        hex: 26972
      },
      {
        weight: 900,
        hex: 19776
      }
    ]
  },
  {
    color: "Green",
    variations: [
      {
        weight: 50,
        hex: 15267305
      },
      {
        weight: 100,
        hex: 13166281
      },
      {
        weight: 200,
        hex: 10868391
      },
      {
        weight: 300,
        hex: 8505220
      },
      {
        weight: 400,
        hex: 6732650
      },
      {
        weight: 500,
        hex: 5025616
      },
      {
        weight: 600,
        hex: 4431943
      },
      {
        weight: 700,
        hex: 3706428
      },
      {
        weight: 800,
        hex: 3046706
      },
      {
        weight: 900,
        hex: 1793568
      }
    ]
  },
  {
    color: "Light Green",
    variations: [
      {
        weight: 50,
        hex: 15857897
      },
      {
        weight: 100,
        hex: 14478792
      },
      {
        weight: 200,
        hex: 12968357
      },
      {
        weight: 300,
        hex: 11457921
      },
      {
        weight: 400,
        hex: 10275941
      },
      {
        weight: 500,
        hex: 9159498
      },
      {
        weight: 600,
        hex: 8172354
      },
      {
        weight: 700,
        hex: 6856504
      },
      {
        weight: 800,
        hex: 5606191
      },
      {
        weight: 900,
        hex: 3369246
      }
    ]
  },
  {
    color: "Lime",
    variations: [
      {
        weight: 50,
        hex: 16382951
      },
      {
        weight: 100,
        hex: 15791299
      },
      {
        weight: 200,
        hex: 15134364
      },
      {
        weight: 300,
        hex: 14477173
      },
      {
        weight: 400,
        hex: 13951319
      },
      {
        weight: 500,
        hex: 13491257
      },
      {
        weight: 600,
        hex: 12634675
      },
      {
        weight: 700,
        hex: 11514923
      },
      {
        weight: 800,
        hex: 10394916
      },
      {
        weight: 900,
        hex: 8550167
      }
    ]
  },
  {
    color: "Yellow",
    variations: [
      {
        weight: 50,
        hex: 16776679
      },
      {
        weight: 100,
        hex: 16775620
      },
      {
        weight: 200,
        hex: 16774557
      },
      {
        weight: 300,
        hex: 16773494
      },
      {
        weight: 400,
        hex: 16772696
      },
      {
        weight: 500,
        hex: 16771899
      },
      {
        weight: 600,
        hex: 16635957
      },
      {
        weight: 700,
        hex: 16498733
      },
      {
        weight: 800,
        hex: 16361509
      },
      {
        weight: 900,
        hex: 16088855
      }
    ]
  },
  {
    color: "Amber",
    variations: [
      {
        weight: 50,
        hex: 16775393
      },
      {
        weight: 100,
        hex: 16772275
      },
      {
        weight: 200,
        hex: 16769154
      },
      {
        weight: 300,
        hex: 16766287
      },
      {
        weight: 400,
        hex: 16763432
      },
      {
        weight: 500,
        hex: 16761095
      },
      {
        weight: 600,
        hex: 16757504
      },
      {
        weight: 700,
        hex: 16752640
      },
      {
        weight: 800,
        hex: 16748288
      },
      {
        weight: 900,
        hex: 16740096
      }
    ]
  },
  {
    color: "Orange",
    variations: [
      {
        weight: 50,
        hex: 16774112
      },
      {
        weight: 100,
        hex: 16769202
      },
      {
        weight: 200,
        hex: 16764032
      },
      {
        weight: 300,
        hex: 16758605
      },
      {
        weight: 400,
        hex: 16754470
      },
      {
        weight: 500,
        hex: 16750592
      },
      {
        weight: 600,
        hex: 16485376
      },
      {
        weight: 700,
        hex: 16088064
      },
      {
        weight: 800,
        hex: 15690752
      },
      {
        weight: 900,
        hex: 15094016
      }
    ]
  },
  {
    color: "Deep Orange",
    variations: [
      {
        weight: 50,
        hex: 16509415
      },
      {
        weight: 100,
        hex: 16764092
      },
      {
        weight: 200,
        hex: 16755601
      },
      {
        weight: 300,
        hex: 16747109
      },
      {
        weight: 400,
        hex: 16740419
      },
      {
        weight: 500,
        hex: 16733986
      },
      {
        weight: 600,
        hex: 16011550
      },
      {
        weight: 700,
        hex: 15092249
      },
      {
        weight: 800,
        hex: 14172949
      },
      {
        weight: 900,
        hex: 12531212
      }
    ]
  },
  {
    color: "Brown",
    variations: [
      {
        weight: 50,
        hex: 15723497
      },
      {
        weight: 100,
        hex: 14142664
      },
      {
        weight: 200,
        hex: 12364452
      },
      {
        weight: 300,
        hex: 10586239
      },
      {
        weight: 400,
        hex: 9268835
      },
      {
        weight: 500,
        hex: 7951688
      },
      {
        weight: 600,
        hex: 7162945
      },
      {
        weight: 700,
        hex: 6111287
      },
      {
        weight: 800,
        hex: 5125166
      },
      {
        weight: 900,
        hex: 4073251
      }
    ]
  },
  {
    color: "Grey",
    variations: [
      {
        weight: 50,
        hex: 16448250
      },
      {
        weight: 100,
        hex: 16119285
      },
      {
        weight: 200,
        hex: 15658734
      },
      {
        weight: 300,
        hex: 14737632
      },
      {
        weight: 400,
        hex: 12434877
      },
      {
        weight: 500,
        hex: 10395294
      },
      {
        weight: 600,
        hex: 7697781
      },
      {
        weight: 700,
        hex: 6381921
      },
      {
        weight: 800,
        hex: 4342338
      },
      {
        weight: 900,
        hex: 2171169
      }
    ]
  },
  {
    color: "Blue Grey",
    variations: [
      {
        weight: 50,
        hex: 15527921
      },
      {
        weight: 100,
        hex: 13621468
      },
      {
        weight: 200,
        hex: 11583173
      },
      {
        weight: 300,
        hex: 9479342
      },
      {
        weight: 400,
        hex: 7901340
      },
      {
        weight: 500,
        hex: 6323595
      },
      {
        weight: 600,
        hex: 5533306
      },
      {
        weight: 700,
        hex: 4545124
      },
      {
        weight: 800,
        hex: 3622735
      },
      {
        weight: 900,
        hex: 2503224
      }
    ]
  },
  {
    color: "Grey",
    variations: [
      {
        weight: 50,
        hex: 16777215
      },
      {
        weight: 100,
        hex: 14737632
      },
      {
        weight: 200,
        hex: 12895428
      },
      {
        weight: 300,
        hex: 11053224
      },
      {
        weight: 400,
        hex: 9211020
      },
      {
        weight: 500,
        hex: 7368816
      },
      {
        weight: 600,
        hex: 5526612
      },
      {
        weight: 700,
        hex: 3684408
      },
      {
        weight: 800,
        hex: 1842204
      },
      {
        weight: 900,
        hex: 0
      }
    ]
  }
];

// src/drag_manager.ts
var x_drag_cb = Symbol("x-drag-cb");
var DragManager = class {
  dragSource;
  dragGhost;
  dropTarget;
  notified;
  timer;
  /**
   * 
   */
  registerDraggableElement(el) {
    el.setDomEvent("dragstart", (ev) => {
      this.dragSource = el;
      this.dragGhost = el.dom.cloneNode(true);
      this.dragGhost.classList.add("dragged");
      x4document.body.appendChild(this.dragGhost);
      el.addClass("dragging");
      ev.dataTransfer.setData("text/string", "1");
      ev.dataTransfer.setDragImage(new Image(), 0, 0);
      ev.stopPropagation();
    });
    el.setDomEvent("drag", (ev) => {
      this.dragGhost.style.left = ev.pageX + "px";
      this.dragGhost.style.top = ev.pageY + "px";
    });
    el.setDomEvent("dragend", (ev) => {
      el.removeClass("dragging");
      this.dragGhost.remove();
    });
    el.setAttribute("draggable", "true");
  }
  /**
   * 
   */
  registerDropTarget(el, cb, filterCB) {
    const dragEnter = /* @__PURE__ */ __name((ev) => {
      if (filterCB && !filterCB(this.dragSource)) {
        console.log("reject ", el);
        ev.dataTransfer.dropEffect = "none";
        return;
      }
      console.log("accepted ", el);
      ev.preventDefault();
      ev.dataTransfer.dropEffect = "copy";
    }, "dragEnter");
    const dragOver = /* @__PURE__ */ __name((ev) => {
      if (filterCB && !filterCB(this.dragSource)) {
        console.log("reject ", el);
        ev.dataTransfer.dropEffect = "none";
        return;
      }
      ev.preventDefault();
      if (this.dropTarget != el) {
        this.dropTarget = el;
        this._startCheck();
      }
      if (this.dropTarget) {
        const infos = {
          pt: new Point(ev.pageX, ev.pageY),
          data: ev.dataTransfer
        };
        cb("drag", this.dragSource, infos);
      }
      ev.dataTransfer.dropEffect = "copy";
    }, "dragOver");
    const dragLeave = /* @__PURE__ */ __name((ev) => {
      this.dropTarget = null;
      ev.preventDefault();
    }, "dragLeave");
    const drop = /* @__PURE__ */ __name((ev) => {
      const infos = {
        pt: new Point(ev.pageX, ev.pageY),
        data: ev.dataTransfer
      };
      cb("drop", this.dragSource, infos);
      this.dropTarget = null;
      el.removeClass("drop-over");
      ev.preventDefault();
    }, "drop");
    el.setDomEvent("dragenter", dragEnter);
    el.setDomEvent("dragover", dragOver);
    el.setDomEvent("dragleave", dragLeave);
    el.setDomEvent("drop", drop);
    el.setData(x_drag_cb, cb);
  }
  _startCheck() {
    if (this.timer) {
      clearInterval(this.timer);
      this._check();
    }
    this.timer = setInterval(() => this._check(), 300);
  }
  _check() {
    const leaving = /* @__PURE__ */ __name((x) => {
      x.removeClass("drop-over");
      const cb = x.getData(x_drag_cb);
      cb("leave", this.dragSource);
    }, "leaving");
    const entering = /* @__PURE__ */ __name((x) => {
      x.addClass("drop-over");
      const cb = x.getData(x_drag_cb);
      cb("enter", this.dragSource);
    }, "entering");
    if (this.dropTarget) {
      if (!this.notified || this.notified != this.dropTarget) {
        if (this.notified) {
          leaving(this.notified);
        }
        this.notified = this.dropTarget;
        entering(this.notified);
      }
    } else {
      if (this.notified) {
        leaving(this.notified);
        this.notified = null;
        clearInterval(this.timer);
      }
    }
  }
};
__name(DragManager, "DragManager");
var dragManager = new DragManager();

// src/drawtext.ts
var defStyle = {
  align: "center",
  vAlign: "middle",
  fontSize: 14,
  fontWeight: null,
  fontStyle: "",
  fontVariant: "",
  fontFamily: "Arial",
  lineHeight: 0,
  clip: true,
  columns: 1,
  columnGap: 0,
  lineBreak: true
};
function drawText(ctx, input_Text, rc, drawStyle) {
  if (rc.width <= 0 || rc.height <= 0) {
    return;
  }
  drawStyle = { ...defStyle, ...drawStyle };
  ctx.save();
  if (drawStyle.clip) {
    ctx.beginPath();
    ctx.rect(rc.left, rc.top, rc.width, rc.height);
    ctx.clip();
  }
  if (drawStyle.rotation) {
    const center = new Point(rc.left + rc.width / 2, rc.top + rc.height / 2);
    const rad = drawStyle.rotation / 180 * Math.PI;
    ctx.translate(center.x, center.y);
    ctx.rotate(rad);
    ctx.translate(-center.x, -center.y);
  }
  ctx.textBaseline = "bottom";
  let fontSize = roundTo(drawStyle.fontSize, 2) ?? 12;
  let style = "";
  if (drawStyle.fontStyle) {
    style += drawStyle.fontStyle + " ";
  }
  if (drawStyle.fontVariant) {
    style += drawStyle.fontVariant + " ";
  }
  if (drawStyle.fontWeight) {
    style += drawStyle.fontWeight + " ";
  }
  style += fontSize + "px ";
  let family = drawStyle.fontFamily ?? "sans-serif";
  if (family.indexOf(".") > 0) {
    family = '"' + family + '"';
  }
  style += family;
  ctx.font = style.trim();
  let textarray = [];
  let lines = input_Text.split("\n");
  const columns = drawStyle.columns < 1 ? 1 : drawStyle.columns;
  const gap = drawStyle.columnGap;
  let col_width = (rc.width - gap * (columns - 1)) / columns;
  let col_left = rc.left;
  let hlimit = col_width;
  if (!drawStyle.lineBreak) {
    hlimit = 99999999;
  }
  const spaceW = _measureText(ctx, " ");
  lines.forEach((text) => {
    let line2 = { width: 0, words: [], space: 0 };
    let lwidth = _measureText(ctx, text);
    if (lwidth < hlimit) {
      line2.width = lwidth;
      line2.words.push({ width: lwidth, text });
      textarray.push(line2);
    } else {
      let twords = text.split(/\s/).filter((w) => w !== "");
      let words = twords.map((w) => {
        const wwidth = _measureText(ctx, w);
        const word = {
          width: wwidth,
          text: w
        };
        return word;
      });
      let n = 0;
      let e = 0;
      while (n < words.length) {
        const word = words[n];
        let test = line2.width;
        if (test) {
          test += spaceW;
        }
        test += word.width;
        if (test > col_width && e > 0) {
          textarray.push(line2);
          e = 0;
          lwidth = 0;
          line2 = { width: 0, words: [], space: 0 };
        } else {
          line2.words.push(word);
          line2.width = test;
          n++;
          e++;
        }
      }
      if (e) {
        textarray.push(line2);
        line2.last = true;
      }
    }
  });
  const textSize = _calcTextHeight(ctx, "Ag");
  let lineHeight = (drawStyle.lineHeight ?? 1.3) * textSize;
  const nlines = textarray.length;
  let col_top = rc.top;
  if (columns == 1) {
    let fullHeight = lineHeight * nlines;
    if (nlines == 1) {
      lineHeight = textSize;
      fullHeight = textSize;
    }
    if (drawStyle.vAlign === "middle") {
      col_top = rc.top + rc.height / 2 - fullHeight / 2;
      col_top += lineHeight / 2;
      ctx.textBaseline = "middle";
    } else if (drawStyle.vAlign === "bottom") {
      if (fullHeight < rc.height) {
        col_top = rc.top + rc.height - fullHeight + lineHeight;
      }
    } else {
      col_top = rc.top;
      ctx.textBaseline = "top";
    }
  } else {
    col_top += textSize;
  }
  const justify = drawStyle.align == "justify";
  let column = columns;
  let y = col_top;
  let align = 0;
  switch (drawStyle.align) {
    case "right":
      align = 1;
      break;
    case "center":
      align = 2;
      break;
  }
  let maxw = 0;
  textarray.some((line2) => {
    line2.space = spaceW;
    if (justify && !line2.last) {
      _justify(line2, col_width, spaceW);
    }
    let x = col_left;
    let cw = 0;
    if (align == 1) {
      x += col_width - line2.width;
    } else if (align == 2) {
      x += col_width / 2 - line2.width / 2;
    }
    line2.words.forEach((w) => {
      ctx.fillText(w.text, x, y);
      x += w.width + line2.space;
      cw += w.width + line2.space;
    });
    y += lineHeight;
    if (maxw < cw) {
      maxw = cw;
    }
    if (y > rc.bottom + lineHeight) {
      y = col_top;
      col_left += col_width + gap;
      if (--column == 0) {
        return true;
      }
    }
  });
  ctx.restore();
  return { width: maxw, height: (textarray.length + 0.3) * lineHeight };
}
__name(drawText, "drawText");
function _calcTextHeight(ctx, text) {
  const size = ctx.measureText(text);
  return size.actualBoundingBoxAscent + size.actualBoundingBoxDescent;
}
__name(_calcTextHeight, "_calcTextHeight");
function _measureText(ctx, text) {
  return roundTo(ctx.measureText(text).width, 2);
}
__name(_measureText, "_measureText");
function _justify(line2, width, spaceW) {
  let delta = (width - line2.width) / (line2.words.length - 1) + spaceW;
  if (delta <= 0) {
    return;
  }
  line2.width = width;
  line2.space = delta;
}
__name(_justify, "_justify");

// src/image.ts
var emptyImageSrc = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
function _isStaticImage(src) {
  return src.substring(0, 5) == "data:";
}
__name(_isStaticImage, "_isStaticImage");
var _Image = class extends Component {
  m_created;
  m_lazysrc;
  // expected 
  m_img;
  constructor(props) {
    super(props);
    this.m_created = false;
    this.m_props.lazy = props.lazy === false ? false : true;
    this.m_props.alt = props.alt;
    if (props.lazy !== false) {
      this.m_lazysrc = props.src;
      props.src = emptyImageSrc;
    }
    this.setDomEvent("create", () => {
      if (props.lazy) {
        this.setImage(this.m_lazysrc, true);
      }
    });
  }
  /** @ignore */
  render() {
    let mp = this.m_props;
    this.m_img = new Component({
      tag: "img",
      attrs: {
        draggable: false,
        alt: mp.alt ?? "",
        decoding: mp.lazy ? "async" : void 0
      },
      style: {
        objectFit: mp.alignment ? mp.alignment : void 0
      }
    });
    if (mp.overlays) {
      mp.overlays.forEach((x) => x.addClass("@fit"));
      this.setContent([this.m_img, ...mp.overlays]);
    } else {
      this.setContent(this.m_img);
    }
  }
  /**
   * change the image
   * @param src - image path
   */
  setImage(src, force) {
    if (!src) {
      src = emptyImageSrc;
      this.addClass("empty");
    } else {
      this.removeClass("empty");
    }
    if (!this.m_props.lazy) {
      this.m_props.src = src;
      this.m_lazysrc = src;
      if (this.m_img.dom) {
        this.m_img.dom.setAttribute("src", src);
      }
    } else if (force || this.m_lazysrc != src) {
      if (_isStaticImage(src)) {
        this.m_props.src = src;
        this.m_lazysrc = src;
        if (this.m_img.dom) {
          this.m_img.dom.setAttribute("src", this.m_props.src);
        }
      } else {
        this.m_props.src = emptyImageSrc;
        if (this.m_img.dom) {
          this.m_img.dom.setAttribute("src", this.m_props.src);
        }
        this.m_lazysrc = src;
        if (this.dom) {
          this._update_image();
        }
      }
    }
  }
  _update_image() {
    console.assert(!!this.dom);
    if (this.m_lazysrc && !_isStaticImage(this.m_lazysrc)) {
      _Image.lazy_images_waiting.push({
        el: this,
        src: this.m_lazysrc
      });
      if (_Image.lazy_image_timer === void 0) {
        _Image.lazy_image_timer = setInterval(_Image.lazyWatch, 10);
      }
    }
  }
  static lazyWatch() {
    let newList = [];
    let done = 0;
    _Image.lazy_images_waiting.forEach((lazy) => {
      let dom = lazy.el.dom, src = lazy.src;
      if (!dom || dom.offsetParent === null) {
        return;
      }
      let rc = dom.getBoundingClientRect();
      if (!done && dom.offsetParent !== null && rc.bottom >= 0 && rc.right >= 0 && rc.top <= (window.innerHeight || x4document.documentElement.clientHeight) && rc.left <= (window.innerWidth || x4document.documentElement.clientWidth)) {
        let img = dom.firstChild;
        img.setAttribute("src", src);
        lazy.el.removeClass("empty");
        done++;
      } else {
        newList.push(lazy);
      }
    });
    _Image.lazy_images_waiting = newList;
    if (newList.length == 0) {
      clearInterval(_Image.lazy_image_timer);
      _Image.lazy_image_timer = void 0;
    }
  }
};
var Image2 = _Image;
__name(Image2, "Image");
__publicField(Image2, "lazy_images_waiting", []);
__publicField(Image2, "lazy_image_timer");

// src/fileupload.ts
var FileUpload = class extends HLayout {
  constructor(props) {
    super(props);
  }
  clear() {
    this.m_props.value = "";
  }
};
__name(FileUpload, "FileUpload");
var ImageUpload = class extends FileUpload {
  m_path;
  m_ui_img;
  m_ui_input;
  /** @ignore */
  render(props) {
    let ename = "up" + this.uid;
    this.setContent([
      new Component({
        tag: "label",
        attrs: { for: ename },
        content: [
          this.m_ui_img = new Image2({ src: this.m_props.value })
        ]
      }),
      this.m_ui_input = new Input({
        cls: "@hidden",
        id: ename,
        type: "file",
        name: this.m_props.name,
        value_hook: {
          get: () => {
            return this._get_value();
          },
          set: (v) => {
            this._set_value(v);
          }
        },
        attrs: {
          accept: "image/*"
        },
        dom_events: {
          change: (e) => {
            this._handleChange(e);
          }
        }
      })
    ]);
  }
  clear() {
    super.clear();
    this.m_ui_input.dom.value = "";
    this.m_ui_img.setImage(null, false);
  }
  _get_value() {
    return this.m_path;
  }
  _set_value(v) {
    debugger;
  }
  _handleChange(e) {
    let self = this;
    function createThumbnail(file) {
      let reader = new FileReader();
      reader.addEventListener("load", (e2) => {
        self.m_ui_img.setImage(reader.result.toString());
      });
      reader.readAsDataURL(file);
    }
    __name(createThumbnail, "createThumbnail");
    const allowedTypes = ["png", "jpg", "jpeg", "gif"];
    let files = e.target.files, filesLen = files.length;
    for (let i = 0; i < filesLen; i++) {
      let imgType = files[i].name.split(".");
      imgType = imgType[imgType.length - 1];
      imgType = imgType.toLowerCase();
      if (allowedTypes.indexOf(imgType) != -1) {
        createThumbnail(files[i]);
        this.m_path = files[i];
        break;
      }
    }
  }
};
__name(ImageUpload, "ImageUpload");
var g_file_input = null;
function _createFileInput() {
  if (!g_file_input) {
    g_file_input = new Component({
      tag: "input",
      style: {
        display: "none",
        id: "fileDialog"
      },
      attrs: {
        type: "file"
      }
    });
    x4document.body.appendChild(g_file_input._build());
  }
  g_file_input.clearDomEvent("change");
  return g_file_input;
}
__name(_createFileInput, "_createFileInput");
function openFileDialog(extensions, cb, multiple = false) {
  let fi = _createFileInput();
  fi.removeAttribute("nwsaveas");
  fi.setAttribute("accept", extensions);
  fi.setAttribute("multiple", multiple);
  fi.setDomEvent("change", (evt) => {
    let files = fi.dom.files;
    cb(files);
  });
  fi.dom.click();
}
__name(openFileDialog, "openFileDialog");
function saveFileDialog(defFileName, extensions, cb) {
  let fi = _createFileInput();
  fi.setAttribute("nwsaveas", defFileName);
  fi.setAttribute("accept", extensions);
  fi.setDomEvent("change", (evt) => {
    let files = fi.dom.files;
    cb(files[0]);
  });
  fi.dom.click();
}
__name(saveFileDialog, "saveFileDialog");

// src/formatters.ts
var locale;
var moneyFmt;
function setCurrencySymbol(symbol) {
  if (symbol) {
    moneyFmt = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: symbol
      /*, currencyDisplay: 'symbol'*/
    });
  } else {
    moneyFmt = new Intl.NumberFormat(locale, { style: "decimal", useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
__name(setCurrencySymbol, "setCurrencySymbol");
function sql_date_formatter(input) {
  if (input === null || input === void 0 || input === "") {
    return "";
  }
  let dte = new Date(Date.parse(input));
  const options = {
    /*weekday: 'short',*/
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  };
  return dte.toLocaleDateString(locale, options);
}
__name(sql_date_formatter, "sql_date_formatter");
function date_formatter(input) {
  if (input === null || input === void 0 || input === "") {
    return "";
  }
  let dte = typeof input == "string" ? new Date(Date.parse(input)) : input;
  return formatIntlDate(dte);
}
__name(date_formatter, "date_formatter");
function money_formatter(input) {
  if (input === null || input === void 0 || input === "") {
    return "";
  }
  let val = roundTo(typeof input == "string" ? parseFloat(input) : input, 2);
  if (Object.is(val, -0)) {
    val = 0;
  }
  let res = moneyFmt.format(val);
  return res;
}
__name(money_formatter, "money_formatter");
function money_formatter_nz(input) {
  if (input === null || input === void 0 || input === "") {
    return "";
  }
  let val = roundTo(typeof input == "string" ? parseFloat(input) : input, 2);
  if (!val) {
    return "";
  }
  let res = moneyFmt.format(val);
  return res;
}
__name(money_formatter_nz, "money_formatter_nz");
function bool_formatter(input) {
  return input ? "oui" : "-";
}
__name(bool_formatter, "bool_formatter");
setCurrencySymbol(null);

// src/gridview.ts
var T_UPDATE = Symbol("update");
function EvGridCheck(rec, chk) {
  return BasicEvent({ rec, chk });
}
__name(EvGridCheck, "EvGridCheck");
var ColHeader = class extends Component {
  m_sens;
  m_sorted;
  constructor(props, title) {
    super(props);
    this.m_sorted = false;
    this.m_sens = "dn";
    this.setContent([
      new Component({
        tag: "span",
        content: title
      }),
      new Icon({
        ref: "sorter",
        cls: "@hidden sort",
        icon: "var( --x4-icon-arrow-down )"
      })
    ]);
  }
  get sorted() {
    return this.m_sorted;
  }
  //set sorted( v ) {
  //	this.m_sorted = v;
  //	this.m_sens = 'dn';
  //	this.itemWithRef<Icon>( 'sorter' ).show( v );
  //}
  sort(v, sens) {
    this.m_sorted = v;
    this.m_sens = sens;
    const ic = this.itemWithRef("sorter");
    ic.icon = this.m_sens == "up" ? "var( --x4-icon-arrow-down )" : "var( --x4-icon-arrow-up )";
    ic.show(v);
  }
  get sens() {
    return this.m_sens;
  }
  toggleSens() {
    this.m_sens = this.m_sens == "up" ? "dn" : "up";
    this.itemWithRef("sorter").icon = this.m_sens == "up" ? "var( --x4-icon-arrow-down )" : "var( --x4-icon-arrow-up )";
  }
};
__name(ColHeader, "ColHeader");
var GridView = class extends VLayout {
  m_dataview;
  m_data_cx;
  m_columns;
  m_view_el;
  m_container;
  m_header;
  m_footer;
  m_empty_msg;
  m_empty_text;
  m_selection;
  m_itemHeight;
  m_topIndex;
  m_visible_rows;
  // shown elements
  m_hasMarks;
  m_marks;
  // checked elements
  m_recycler;
  m_rowClassifier;
  constructor(props) {
    super(props);
    this.m_columns = props.columns;
    this.m_hasMarks = props.hasMarks ?? false;
    this.m_marks = /* @__PURE__ */ new Set();
    if (this.m_hasMarks) {
      this.m_columns.unshift({
        id: "id",
        title: "",
        width: 30,
        renderer: (e) => this._renderCheck(e)
      });
    }
    this.setAttribute("tabindex", 0);
    this.m_topIndex = 0;
    this.m_itemHeight = 0;
    this.m_recycler = [];
    this.m_rowClassifier = props.calcRowClass;
    this.m_empty_text = props.empty_text ?? _tr.global.empty_list;
    this.setDomEvent("click", (e) => this._itemClick(e));
    this.setDomEvent("dblclick", (e) => this._itemDblClick(e));
    this.setDomEvent("contextmenu", (e) => this._itemMenu(e));
    this.setDomEvent("keydown", (e) => this._handleKey(e));
    this.setStore(props.store);
  }
  componentCreated() {
    this._updateScroll(true);
  }
  /**
   * 
   */
  _moveSel(sens, select = true) {
    let sel = this.m_selection;
    let scrolltype = null;
    if (sel === void 0) {
      sel = this.m_dataview.getByIndex(0).getID();
    } else {
      let index = this.m_dataview.indexOfId(this.m_selection);
      if (sens == 1) {
        index++;
      } else if (sens == -1) {
        index--;
      } else if (sens == 2) {
        index += this.m_visible_rows.length - 1;
      } else if (sens == -2) {
        index -= this.m_visible_rows.length - 1;
      }
      if (sens < 0) {
        scrolltype = "start";
      } else {
        scrolltype = "end";
      }
      if (index < 0) {
        index = 0;
      } else if (index >= this.m_dataview.count) {
        index = this.m_dataview.count - 1;
      }
      sel = this.m_dataview.getByIndex(index).getID();
    }
    if (this.m_selection != sel && select) {
      this._selectItem(sel, null, scrolltype);
    }
    return sel;
  }
  /**
   * 
   */
  _handleKey(event) {
    if (!this.m_dataview || this.m_dataview.count == 0) {
      return;
    }
    switch (event.key) {
      case "ArrowDown":
      case "Down": {
        this._moveSel(1);
        break;
      }
      case "ArrowUp":
      case "Up": {
        this._moveSel(-1);
        break;
      }
      case "PageUp": {
        this._moveSel(-2);
        break;
      }
      case "PageDown": {
        this._moveSel(2);
        break;
      }
    }
  }
  /**
   * 
   */
  getNextSel(sens) {
    return this._moveSel(sens, false);
  }
  _scrollIntoView(id, sens) {
    let itm = this._findItem(id);
    if (itm) {
      itm.scrollIntoView({
        block: "center"
        //<ScrollLogicalPosition>sens ?? 'nearest'
      });
    } else {
      this.m_topIndex = this.m_dataview.indexOfId(id);
      this.m_view_el.dom.scrollTop = this.m_topIndex * this.m_itemHeight;
      this._buildItems();
      this._scrollIntoView(id);
    }
  }
  /**
   * change the list of item displayed
   * @param items - new array of items
   */
  setStore(store) {
    this.m_selection = void 0;
    if (store instanceof DataStore) {
      this.m_dataview = store.createView();
    } else {
      this.m_dataview = store;
    }
    if (this.m_hasMarks) {
      this.clearMarks();
    }
    if (this.m_data_cx) {
      this.m_data_cx.dispose();
    }
    if (this.m_dataview) {
      this.m_data_cx = this.m_dataview.on("view_change", (ev) => {
        if (ev.action == "change") {
          this.m_selection = void 0;
        }
        this._updateScroll(true);
      });
      this._updateScroll(true);
    }
  }
  getView() {
    return this.m_dataview;
  }
  /**
   * return the current selection (row id) or null 
   */
  getSelection() {
    return this.m_selection;
  }
  getSelRec() {
    if (this.m_selection) {
      return this.m_dataview.getById(this.m_selection);
    }
    return null;
  }
  setSelection(recId) {
    this._selectItem(recId, null, "center");
  }
  /** @ignore */
  render() {
    this.m_recycler = [];
    this.m_container = new Component({
      cls: "content"
    });
    this.m_empty_msg = new Label({
      cls: "empty-msg",
      text: ""
    });
    this.m_view_el = new Component({
      cls: "@scroll-view",
      flex: 1,
      dom_events: {
        sizechange: () => this._updateScroll(true),
        scroll: () => this._updateScroll(false)
      },
      content: this.m_container
    });
    let flex = false;
    let cols = this.m_columns.map((col, index) => {
      let cls = "@cell";
      if (col.cls) {
        cls += " " + col.cls;
      }
      let comp = new ColHeader({
        cls,
        flex: col.flex,
        sizable: "right",
        style: {
          width: col.width
        },
        dom_events: {
          click: (ev) => {
            let t = flyWrap(ev.target);
            if (!t.hasClass("@sizer-overlay")) {
              this._sortCol(col);
              ev.preventDefault();
            }
          }
        }
      }, col.title);
      const resizeCol = /* @__PURE__ */ __name((ev) => {
        this._on_col_resize(index, ev.size.width);
        if (this.m_footer) {
          let col2 = Component.getElement(this.m_footer.dom.childNodes[index]);
          if (col2) {
            col2.setStyleValue("width", ev.size.width);
          }
        }
      }, "resizeCol");
      new SizerOverlay({
        target: comp,
        sens: "right",
        events: { resize: (e) => resizeCol(e) }
      });
      if (col.flex) {
        flex = true;
      }
      col.$hdr = comp;
      return comp;
    });
    cols.push(new Flex({
      ref: "flex",
      cls: flex ? "@hidden" : ""
    }));
    let full_width = 0;
    this.m_columns.forEach((col) => {
      full_width += col.width ?? 0;
    });
    this.m_header = new HLayout({
      cls: "@header",
      content: cols,
      style: {
        minWidth: full_width
      }
    });
    if (this.m_props.hasFooter) {
      let foots = this.m_columns.map((col, index) => {
        let cls = "@cell";
        if (col.align) {
          cls += " " + col.align;
        }
        if (col.cls) {
          cls += " " + col.cls;
        }
        let comp = new Component({
          cls,
          data: { col: index },
          flex: col.flex,
          style: {
            width: col.width
          }
        });
        col.$ftr = comp;
        return comp;
      });
      foots.push(new Flex({
        ref: "flex",
        cls: flex ? "@hidden" : ""
      }));
      this.m_footer = new HLayout({
        cls: "@footer",
        content: foots,
        style: {
          minWidth: full_width
        }
      });
    } else {
      this.m_footer = null;
    }
    this.setContent([
      this.m_header,
      this.m_view_el,
      this.m_footer,
      this.m_empty_msg
    ]);
  }
  _on_col_resize(col, width) {
    const _col = this.m_columns[col];
    let updateFlex = false;
    if (width >= 0) {
      _col.width = width;
      if (_col.flex) {
        _col.$hdr.removeClass("@flex");
        _col.$ftr?.removeClass("@flex");
        _col.flex = void 0;
        updateFlex = true;
      }
    } else if (width < 0 && !_col.flex) {
      _col.$hdr.addClass("@flex");
      _col.$ftr?.addClass("@flex");
      _col.flex = 1;
      updateFlex = true;
    }
    if (updateFlex) {
      let flex = false;
      this.m_columns.forEach((c) => {
        if (c.flex) {
          flex = true;
        }
      });
      this.m_header.itemWithRef("flex")?.show(flex ? false : true);
      if (this.m_footer) {
        this.m_footer.itemWithRef("flex")?.show(flex ? false : true);
      }
    }
    this._updateScroll(true);
  }
  /**
   * 
   */
  sortCol(name, asc = true) {
    const col = this.m_columns.find((c) => c.id == name);
    if (col === void 0) {
      console.assert(false, "unknown field " + name + " in grid.sortCol");
      return;
    }
    this._sortCol(col, asc ? "dn" : "up");
  }
  /**
   * 
   */
  _sortCol(col, sens = "up") {
    if (col.sortable === false) {
      return;
    }
    this.m_columns.forEach((c) => {
      if (c !== col) {
        c.$hdr.sort(false, "dn");
      }
    });
    const $hdr = col.$hdr;
    if ($hdr.sorted) {
      $hdr.toggleSens();
    } else {
      $hdr.sort(true, sens);
    }
    if (this.m_dataview) {
      this.m_dataview.sort([
        { field: col.id, ascending: $hdr.sens == "dn" ? false : true }
      ]);
    }
  }
  /**
   * 
   */
  _computeItemHeight() {
    let gr = x4document.createElement("div");
    gr.classList.add("x-row");
    let gv = x4document.createElement("div");
    gv.classList.add("x-grid-view");
    gv.style.position = "absolute";
    gv.style.top = "-1000px";
    gv.appendChild(gr);
    this.dom.appendChild(gv);
    let rc = gr.getBoundingClientRect();
    this.dom.removeChild(gv);
    this.m_itemHeight = rc.height;
  }
  _createRow(props) {
    let row;
    if (this.m_recycler.length) {
      row = this.m_recycler.pop();
      row.clearClasses();
      row.addClass(props.cls);
      row.setContent(props.content);
      row.setStyle(props.style);
      for (let n in props.data) {
        row.setData(n, props.data[n]);
      }
    } else {
      row = new HLayout(props);
    }
    if (!row.dom) {
      this.m_container.appendChild(row);
    }
    return row;
  }
  _buildItems(canOpt = true) {
    let rc = this.getBoundingRect();
    let rh = this.m_header.getBoundingRect();
    let height = rc.height - rh.height + this.m_itemHeight;
    if (this.m_itemHeight == 0) {
      this._computeItemHeight();
    }
    let top = this.m_topIndex * this.m_itemHeight;
    let y = 0;
    let cidx = 0;
    let index = this.m_topIndex;
    let count = this.m_dataview ? this.m_dataview.count : 0;
    let full_width = 0;
    let even = this.m_topIndex & 1 ? true : false;
    this.m_columns.forEach((col) => {
      full_width += col.width ?? 0;
    });
    if ((count + 1) * this.m_itemHeight >= height) {
      let w = Component.getScrollbarSize();
      this.m_header.setStyleValue("paddingRight", w);
      this.m_footer?.setStyleValue("paddingRight", w);
    } else {
      this.m_header.setStyleValue("paddingRight", 0);
      this.m_footer?.setStyleValue("paddingRight", 0);
    }
    if (this.m_visible_rows) {
      this.m_visible_rows.forEach((c) => {
        this.m_recycler.push(c);
      });
    }
    this.m_visible_rows = [];
    let limit = 100;
    while (y < height && index < count && --limit > 0) {
      let rec = this.m_dataview.getByIndex(index);
      let rowid = rec.getID();
      let crow = canOpt ? this.m_recycler.findIndex((r) => r.getData("row-id") == rowid) : -1;
      if (crow >= 0) {
        let rrow = this.m_recycler.splice(crow, 1)[0];
        rrow.setStyle({
          top: y + top,
          minWidth: full_width
        });
        if (this.m_hasMarks) {
          rrow.setClass("@marked", this.m_marks.has(rowid));
        }
        rrow.removeClass("@hidden");
        rrow.setClass("@selected", this.m_selection === rowid);
        this.m_visible_rows[cidx] = rrow;
      } else {
        let cols = this.m_columns.map((col) => {
          let cls2 = "@cell";
          if (col.align) {
            cls2 += " " + col.align;
          }
          if (col.cls) {
            cls2 += " " + col.cls;
          }
          let cell;
          if (col.renderer) {
            cell = col.renderer(rec);
            if (cell) {
              cell.addClass(cls2);
              cell.setStyleValue("width", col.width);
              if (col.flex !== void 0) {
                cell.addClass("@flex");
                cell.setStyleValue("flex", col.flex);
              }
            }
          } else {
            let fmt = col.formatter;
            let text;
            if (fmt && fmt instanceof Function) {
              text = fmt(rec.getRaw(col.id), rec);
            } else {
              text = rec.getField(col.id);
            }
            cell = new Component({
              cls: cls2,
              width: col.width,
              content: html`<span>${text}</span>`,
              flex: col.flex
            });
          }
          return cell;
        });
        let cls = "@row @hlayout center";
        if (this.m_hasMarks) {
          if (this.m_marks.has(rowid)) {
            cls += " @marked";
          }
        }
        if (this.m_selection === rowid) {
          cls += " @selected";
        }
        let row = this.m_visible_rows[cidx] = this._createRow({
          cls,
          content: cols,
          style: {
            top: y + top,
            minWidth: full_width
          },
          data: {
            "row-id": rowid,
            "row-idx": index
          }
        });
        row.addClass(even ? "even" : "odd");
        even = !even;
        if (this.m_rowClassifier) {
          this.m_rowClassifier(rec, row);
        }
      }
      y += this.m_itemHeight;
      index++;
      cidx++;
    }
    this.m_recycler.forEach((c) => {
      c.addClass("@hidden");
    });
    let show = !count;
    let msg = this.m_empty_text instanceof Function ? this.m_empty_text() : this.m_empty_text;
    this.m_empty_msg.text = msg;
    if (show && msg.length == 0) {
      show = false;
    }
    this.m_empty_msg.show(show);
    if (full_width < rc.width) {
      this.m_header.setStyleValue("width", null);
      this.m_footer?.setStyleValue("width", null);
      this.m_container.setStyle({
        height: count * this.m_itemHeight,
        width: null
      });
    } else {
      this.m_header.setStyleValue("width", full_width + 1e3);
      this.m_footer?.setStyleValue("width", full_width + 1e3);
      this.m_container.setStyle({
        height: count * this.m_itemHeight,
        width: full_width
      });
    }
  }
  /**
   * 
   */
  _updateScroll(forceUpdate) {
    if (!this.m_view_el || !this.m_view_el.dom) {
      return;
    }
    const update = /* @__PURE__ */ __name(() => {
      if (!this.dom) {
        return;
      }
      let newTop = Math.floor(this.m_view_el.dom.scrollTop / (this.m_itemHeight || 1));
      if (newTop != this.m_topIndex || forceUpdate) {
        this.m_topIndex = newTop;
        this._buildItems(!forceUpdate);
      }
      let newLeft = this.m_view_el.dom.scrollLeft;
      this.m_header.setStyleValue("left", -newLeft);
      this.m_footer?.setStyleValue("left", -newLeft);
    }, "update");
    if (forceUpdate) {
      this.singleShot(update, 10);
    } else {
      update();
    }
  }
  /** @ignore */
  _rowFromTarget(dom) {
    let self = this.dom;
    while (dom && dom != self) {
      let itm = Component.getElement(dom);
      if (itm) {
        let id = itm.getData("row-id");
        if (id !== void 0) {
          return { id, itm };
        }
      }
      dom = dom.parentElement;
    }
    return void 0;
  }
  _itemClick(e) {
    let hit = this._rowFromTarget(e.target);
    if (hit) {
      this._selectItem(hit.id, hit.itm);
    } else {
      this._selectItem(void 0, void 0);
    }
  }
  _itemDblClick(e) {
    let hit = this._rowFromTarget(e.target);
    if (hit) {
      this._selectItem(hit.id, hit.itm);
      let rec = this.m_dataview.getById(hit.id);
      this.emit("dblClick", EvDblClick(rec));
      if (this.m_hasMarks) {
        this._toggleMark(rec);
      }
    }
  }
  /** @ignore */
  _itemMenu(e) {
    let dom = e.target, self = this.dom;
    while (dom && dom != self) {
      let itm = Component.getElement(dom), id = itm?.getData("row-id");
      if (id !== void 0) {
        this._selectItem(id, itm);
        let idx = itm.getData("row-idx");
        let rec = this.m_dataview.getByIndex(idx);
        this._showItemContextMenu(e, rec);
        e.preventDefault();
        return;
      }
      dom = dom.parentElement;
    }
  }
  /**
   * 
   */
  _findItem(id) {
    for (let i = 0; i < this.m_visible_rows.length; i++) {
      let itm = this.m_visible_rows[i];
      if (itm.getData("row-id") === id) {
        return itm;
      }
    }
    return null;
  }
  /**
   * @ignore
   * called when an item is selected by mouse
   */
  _selectItem(item, dom_item, scrollIntoView) {
    if (this.m_selection !== void 0) {
      let old = this._findItem(this.m_selection);
      if (old) {
        old.removeClass("@selected");
      }
    }
    this.m_selection = item;
    if (item) {
      if (scrollIntoView) {
        this._scrollIntoView(item, scrollIntoView);
      }
      if (!dom_item) {
        dom_item = this._findItem(item);
      }
      if (dom_item) {
        dom_item.addClass("@selected");
      }
      let rec = this.m_dataview.getById(item);
      this.emit("selectionChange", EvSelectionChange(rec));
    } else {
      this.emit("selectionChange", EvSelectionChange(null));
    }
  }
  /**
   * 
   */
  _showItemContextMenu(event, item) {
    this.emit("contextMenu", EvContextMenu(event, item));
  }
  /**
   * 
   */
  clearSelection() {
    this._selectItem(null, null);
  }
  /**
   * todo: moveto datastore
   */
  exportData(filename) {
    let data2 = "";
    const fsep = "	";
    const lsep = "\r\n";
    let rec = "";
    this.m_columns.map((col) => {
      if (rec.length) {
        rec += fsep;
      }
      rec += col.title;
    });
    data2 += rec + lsep;
    let count = this.m_dataview.count;
    for (let i = 0; i < count; i++) {
      let record = this.m_dataview.getByIndex(i);
      rec = "";
      let cols = this.m_columns.map((col) => {
        let text = record.getField(col.id);
        let fmt = col.formatter;
        if (fmt && fmt instanceof Function) {
          text = fmt(text, record);
        }
        if (rec.length > 0) {
          rec += fsep;
        }
        rec += text;
      });
      data2 += rec + lsep;
    }
    data2 = data2.replace(/[àâä]/gm, "a");
    data2 = data2.replace(/[éèê]/gm, "e");
    data2 = data2.replace(/[îï]/gm, "i");
    data2 = data2.replace(/[ûüù]/gm, "u");
    data2 = data2.replace(/ /gm, " ");
    downloadData(data2, "text/csv", filename);
  }
  set empty_text(text) {
    this.m_empty_msg.text = text;
  }
  _renderCheck(rec) {
    let icon = "--x4-icon-square";
    if (this.m_marks.has(rec.getID())) {
      icon = "--x4-icon-square-check";
    }
    return new Icon({ icon: `var(${icon})` });
  }
  _toggleMark(rec) {
    let id = rec.getID();
    let chk = false;
    if (this.m_marks.has(id)) {
      this.m_marks.delete(id);
    } else {
      this.m_marks.add(id);
      chk = true;
    }
    this.emit("gridCheck", EvGridCheck(rec, chk));
    this._buildItems(false);
  }
  getMarks() {
    let ids = [];
    for (const v of this.m_marks.values()) {
      ids.push(v);
    }
    return ids;
  }
  clearMarks() {
    if (this.m_marks.size) {
      this.m_marks = /* @__PURE__ */ new Set();
      this._buildItems(false);
    }
  }
  setFooterData(rec) {
    if (!this.m_footer) {
      return;
    }
    this.m_footer.enumChilds((c) => {
      let cid = c.getData("col");
      if (cid) {
        let col = this.m_columns[cid];
        let value = rec[col.id];
        if (value !== void 0) {
          if (isFunction(value)) {
            value(c);
          } else {
            let text;
            const fmt = col.formatter;
            if (fmt && fmt instanceof Function) {
              text = fmt(value, rec);
            } else {
              text = value;
            }
            c.setContent(text, false);
          }
        }
      }
    });
  }
};
__name(GridView, "GridView");

// src/link.ts
var Link = class extends Component {
  constructor(props) {
    super(props);
    this.setDomEvent("click", () => this._handleClick());
    this.mapPropEvents(props, "click");
  }
  _handleClick() {
    this.emit("click", EvClick());
  }
  /** @ignore */
  render(props) {
    let text = props.text ?? "";
    let href = props.href ?? "#";
    this.setTag("a");
    this.setAttribute("tabindex", 0);
    this.setAttribute("href", href);
    this.setAttribute("target", props.target);
    if (text) {
      this.setContent(isHtmlString(text) ? text : html`<span>${text}</span>`);
    }
  }
  set text(text) {
    this.m_props.text = text;
    this.update();
  }
};
__name(Link, "Link");

// src/md5.ts
var _Md5 = class {
  static hashStr(str, raw = false) {
    return this.onePassHasher.start().appendStr(str).end(raw);
  }
  static hashAsciiStr(str, raw = false) {
    return this.onePassHasher.start().appendAsciiStr(str).end(raw);
  }
  static _hex(x) {
    const hc = _Md5.hexChars;
    const ho = _Md5.hexOut;
    let n;
    let offset;
    let j;
    let i;
    for (i = 0; i < 4; i += 1) {
      offset = i * 8;
      n = x[i];
      for (j = 0; j < 8; j += 2) {
        ho[offset + 1 + j] = hc.charAt(n & 15);
        n >>>= 4;
        ho[offset + 0 + j] = hc.charAt(n & 15);
        n >>>= 4;
      }
    }
    return ho.join("");
  }
  static _md5cycle(x, k) {
    let a = x[0];
    let b = x[1];
    let c = x[2];
    let d = x[3];
    a += (b & c | ~b & d) + k[0] - 680876936 | 0;
    a = (a << 7 | a >>> 25) + b | 0;
    d += (a & b | ~a & c) + k[1] - 389564586 | 0;
    d = (d << 12 | d >>> 20) + a | 0;
    c += (d & a | ~d & b) + k[2] + 606105819 | 0;
    c = (c << 17 | c >>> 15) + d | 0;
    b += (c & d | ~c & a) + k[3] - 1044525330 | 0;
    b = (b << 22 | b >>> 10) + c | 0;
    a += (b & c | ~b & d) + k[4] - 176418897 | 0;
    a = (a << 7 | a >>> 25) + b | 0;
    d += (a & b | ~a & c) + k[5] + 1200080426 | 0;
    d = (d << 12 | d >>> 20) + a | 0;
    c += (d & a | ~d & b) + k[6] - 1473231341 | 0;
    c = (c << 17 | c >>> 15) + d | 0;
    b += (c & d | ~c & a) + k[7] - 45705983 | 0;
    b = (b << 22 | b >>> 10) + c | 0;
    a += (b & c | ~b & d) + k[8] + 1770035416 | 0;
    a = (a << 7 | a >>> 25) + b | 0;
    d += (a & b | ~a & c) + k[9] - 1958414417 | 0;
    d = (d << 12 | d >>> 20) + a | 0;
    c += (d & a | ~d & b) + k[10] - 42063 | 0;
    c = (c << 17 | c >>> 15) + d | 0;
    b += (c & d | ~c & a) + k[11] - 1990404162 | 0;
    b = (b << 22 | b >>> 10) + c | 0;
    a += (b & c | ~b & d) + k[12] + 1804603682 | 0;
    a = (a << 7 | a >>> 25) + b | 0;
    d += (a & b | ~a & c) + k[13] - 40341101 | 0;
    d = (d << 12 | d >>> 20) + a | 0;
    c += (d & a | ~d & b) + k[14] - 1502002290 | 0;
    c = (c << 17 | c >>> 15) + d | 0;
    b += (c & d | ~c & a) + k[15] + 1236535329 | 0;
    b = (b << 22 | b >>> 10) + c | 0;
    a += (b & d | c & ~d) + k[1] - 165796510 | 0;
    a = (a << 5 | a >>> 27) + b | 0;
    d += (a & c | b & ~c) + k[6] - 1069501632 | 0;
    d = (d << 9 | d >>> 23) + a | 0;
    c += (d & b | a & ~b) + k[11] + 643717713 | 0;
    c = (c << 14 | c >>> 18) + d | 0;
    b += (c & a | d & ~a) + k[0] - 373897302 | 0;
    b = (b << 20 | b >>> 12) + c | 0;
    a += (b & d | c & ~d) + k[5] - 701558691 | 0;
    a = (a << 5 | a >>> 27) + b | 0;
    d += (a & c | b & ~c) + k[10] + 38016083 | 0;
    d = (d << 9 | d >>> 23) + a | 0;
    c += (d & b | a & ~b) + k[15] - 660478335 | 0;
    c = (c << 14 | c >>> 18) + d | 0;
    b += (c & a | d & ~a) + k[4] - 405537848 | 0;
    b = (b << 20 | b >>> 12) + c | 0;
    a += (b & d | c & ~d) + k[9] + 568446438 | 0;
    a = (a << 5 | a >>> 27) + b | 0;
    d += (a & c | b & ~c) + k[14] - 1019803690 | 0;
    d = (d << 9 | d >>> 23) + a | 0;
    c += (d & b | a & ~b) + k[3] - 187363961 | 0;
    c = (c << 14 | c >>> 18) + d | 0;
    b += (c & a | d & ~a) + k[8] + 1163531501 | 0;
    b = (b << 20 | b >>> 12) + c | 0;
    a += (b & d | c & ~d) + k[13] - 1444681467 | 0;
    a = (a << 5 | a >>> 27) + b | 0;
    d += (a & c | b & ~c) + k[2] - 51403784 | 0;
    d = (d << 9 | d >>> 23) + a | 0;
    c += (d & b | a & ~b) + k[7] + 1735328473 | 0;
    c = (c << 14 | c >>> 18) + d | 0;
    b += (c & a | d & ~a) + k[12] - 1926607734 | 0;
    b = (b << 20 | b >>> 12) + c | 0;
    a += (b ^ c ^ d) + k[5] - 378558 | 0;
    a = (a << 4 | a >>> 28) + b | 0;
    d += (a ^ b ^ c) + k[8] - 2022574463 | 0;
    d = (d << 11 | d >>> 21) + a | 0;
    c += (d ^ a ^ b) + k[11] + 1839030562 | 0;
    c = (c << 16 | c >>> 16) + d | 0;
    b += (c ^ d ^ a) + k[14] - 35309556 | 0;
    b = (b << 23 | b >>> 9) + c | 0;
    a += (b ^ c ^ d) + k[1] - 1530992060 | 0;
    a = (a << 4 | a >>> 28) + b | 0;
    d += (a ^ b ^ c) + k[4] + 1272893353 | 0;
    d = (d << 11 | d >>> 21) + a | 0;
    c += (d ^ a ^ b) + k[7] - 155497632 | 0;
    c = (c << 16 | c >>> 16) + d | 0;
    b += (c ^ d ^ a) + k[10] - 1094730640 | 0;
    b = (b << 23 | b >>> 9) + c | 0;
    a += (b ^ c ^ d) + k[13] + 681279174 | 0;
    a = (a << 4 | a >>> 28) + b | 0;
    d += (a ^ b ^ c) + k[0] - 358537222 | 0;
    d = (d << 11 | d >>> 21) + a | 0;
    c += (d ^ a ^ b) + k[3] - 722521979 | 0;
    c = (c << 16 | c >>> 16) + d | 0;
    b += (c ^ d ^ a) + k[6] + 76029189 | 0;
    b = (b << 23 | b >>> 9) + c | 0;
    a += (b ^ c ^ d) + k[9] - 640364487 | 0;
    a = (a << 4 | a >>> 28) + b | 0;
    d += (a ^ b ^ c) + k[12] - 421815835 | 0;
    d = (d << 11 | d >>> 21) + a | 0;
    c += (d ^ a ^ b) + k[15] + 530742520 | 0;
    c = (c << 16 | c >>> 16) + d | 0;
    b += (c ^ d ^ a) + k[2] - 995338651 | 0;
    b = (b << 23 | b >>> 9) + c | 0;
    a += (c ^ (b | ~d)) + k[0] - 198630844 | 0;
    a = (a << 6 | a >>> 26) + b | 0;
    d += (b ^ (a | ~c)) + k[7] + 1126891415 | 0;
    d = (d << 10 | d >>> 22) + a | 0;
    c += (a ^ (d | ~b)) + k[14] - 1416354905 | 0;
    c = (c << 15 | c >>> 17) + d | 0;
    b += (d ^ (c | ~a)) + k[5] - 57434055 | 0;
    b = (b << 21 | b >>> 11) + c | 0;
    a += (c ^ (b | ~d)) + k[12] + 1700485571 | 0;
    a = (a << 6 | a >>> 26) + b | 0;
    d += (b ^ (a | ~c)) + k[3] - 1894986606 | 0;
    d = (d << 10 | d >>> 22) + a | 0;
    c += (a ^ (d | ~b)) + k[10] - 1051523 | 0;
    c = (c << 15 | c >>> 17) + d | 0;
    b += (d ^ (c | ~a)) + k[1] - 2054922799 | 0;
    b = (b << 21 | b >>> 11) + c | 0;
    a += (c ^ (b | ~d)) + k[8] + 1873313359 | 0;
    a = (a << 6 | a >>> 26) + b | 0;
    d += (b ^ (a | ~c)) + k[15] - 30611744 | 0;
    d = (d << 10 | d >>> 22) + a | 0;
    c += (a ^ (d | ~b)) + k[6] - 1560198380 | 0;
    c = (c << 15 | c >>> 17) + d | 0;
    b += (d ^ (c | ~a)) + k[13] + 1309151649 | 0;
    b = (b << 21 | b >>> 11) + c | 0;
    a += (c ^ (b | ~d)) + k[4] - 145523070 | 0;
    a = (a << 6 | a >>> 26) + b | 0;
    d += (b ^ (a | ~c)) + k[11] - 1120210379 | 0;
    d = (d << 10 | d >>> 22) + a | 0;
    c += (a ^ (d | ~b)) + k[2] + 718787259 | 0;
    c = (c << 15 | c >>> 17) + d | 0;
    b += (d ^ (c | ~a)) + k[9] - 343485551 | 0;
    b = (b << 21 | b >>> 11) + c | 0;
    x[0] = a + x[0] | 0;
    x[1] = b + x[1] | 0;
    x[2] = c + x[2] | 0;
    x[3] = d + x[3] | 0;
  }
  _dataLength;
  _bufferLength;
  _state = new Int32Array(4);
  _buffer = new ArrayBuffer(68);
  _buffer8;
  _buffer32;
  constructor() {
    this._buffer8 = new Uint8Array(this._buffer, 0, 68);
    this._buffer32 = new Uint32Array(this._buffer, 0, 17);
    this.start();
  }
  start() {
    this._dataLength = 0;
    this._bufferLength = 0;
    this._state.set(_Md5.stateIdentity);
    return this;
  }
  // Char to code point to to array conversion:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
  // #Example.3A_Fixing_charCodeAt_to_handle_non-Basic-Multilingual-Plane_characters_if_their_presence_earlier_in_the_string_is_unknown
  appendStr(str) {
    const buf8 = this._buffer8;
    const buf32 = this._buffer32;
    let bufLen = this._bufferLength;
    let code;
    let i;
    for (i = 0; i < str.length; i += 1) {
      code = str.charCodeAt(i);
      if (code < 128) {
        buf8[bufLen++] = code;
      } else if (code < 2048) {
        buf8[bufLen++] = (code >>> 6) + 192;
        buf8[bufLen++] = code & 63 | 128;
      } else if (code < 55296 || code > 56319) {
        buf8[bufLen++] = (code >>> 12) + 224;
        buf8[bufLen++] = code >>> 6 & 63 | 128;
        buf8[bufLen++] = code & 63 | 128;
      } else {
        code = (code - 55296) * 1024 + (str.charCodeAt(++i) - 56320) + 65536;
        if (code > 1114111) {
          throw new Error("Unicode standard supports code points up to U+10FFFF");
        }
        buf8[bufLen++] = (code >>> 18) + 240;
        buf8[bufLen++] = code >>> 12 & 63 | 128;
        buf8[bufLen++] = code >>> 6 & 63 | 128;
        buf8[bufLen++] = code & 63 | 128;
      }
      if (bufLen >= 64) {
        this._dataLength += 64;
        _Md5._md5cycle(this._state, buf32);
        bufLen -= 64;
        buf32[0] = buf32[16];
      }
    }
    this._bufferLength = bufLen;
    return this;
  }
  appendAsciiStr(str) {
    const buf8 = this._buffer8;
    const buf32 = this._buffer32;
    let bufLen = this._bufferLength;
    let i;
    let j = 0;
    for (; ; ) {
      i = Math.min(str.length - j, 64 - bufLen);
      while (i--) {
        buf8[bufLen++] = str.charCodeAt(j++);
      }
      if (bufLen < 64) {
        break;
      }
      this._dataLength += 64;
      _Md5._md5cycle(this._state, buf32);
      bufLen = 0;
    }
    this._bufferLength = bufLen;
    return this;
  }
  appendByteArray(input) {
    const buf8 = this._buffer8;
    const buf32 = this._buffer32;
    let bufLen = this._bufferLength;
    let i;
    let j = 0;
    for (; ; ) {
      i = Math.min(input.length - j, 64 - bufLen);
      while (i--) {
        buf8[bufLen++] = input[j++];
      }
      if (bufLen < 64) {
        break;
      }
      this._dataLength += 64;
      _Md5._md5cycle(this._state, buf32);
      bufLen = 0;
    }
    this._bufferLength = bufLen;
    return this;
  }
  getState() {
    const self = this;
    const s = self._state;
    return {
      //@ts-ignore
      buffer: String.fromCharCode.apply(null, self._buffer8),
      buflen: self._bufferLength,
      length: self._dataLength,
      state: [s[0], s[1], s[2], s[3]]
    };
  }
  setState(state) {
    const buf = state.buffer;
    const x = state.state;
    const s = this._state;
    let i;
    this._dataLength = state.length;
    this._bufferLength = state.buflen;
    s[0] = x[0];
    s[1] = x[1];
    s[2] = x[2];
    s[3] = x[3];
    for (i = 0; i < buf.length; i += 1) {
      this._buffer8[i] = buf.charCodeAt(i);
    }
  }
  end(raw = false) {
    const bufLen = this._bufferLength;
    const buf8 = this._buffer8;
    const buf32 = this._buffer32;
    const i = (bufLen >> 2) + 1;
    let dataBitsLen;
    this._dataLength += bufLen;
    buf8[bufLen] = 128;
    buf8[bufLen + 1] = buf8[bufLen + 2] = buf8[bufLen + 3] = 0;
    buf32.set(_Md5.buffer32Identity.subarray(i), i);
    if (bufLen > 55) {
      _Md5._md5cycle(this._state, buf32);
      buf32.set(_Md5.buffer32Identity);
    }
    dataBitsLen = this._dataLength * 8;
    if (dataBitsLen <= 4294967295) {
      buf32[14] = dataBitsLen;
    } else {
      const matches = dataBitsLen.toString(16).match(/(.*?)(.{0,8})$/);
      if (matches === null) {
        return;
      }
      const lo = parseInt(matches[2], 16);
      const hi = parseInt(matches[1], 16) || 0;
      buf32[14] = lo;
      buf32[15] = hi;
    }
    _Md5._md5cycle(this._state, buf32);
    return raw ? this._state : _Md5._hex(this._state);
  }
};
var Md5 = _Md5;
__name(Md5, "Md5");
// Private Static Variables
__publicField(Md5, "stateIdentity", new Int32Array([1732584193, -271733879, -1732584194, 271733878]));
__publicField(Md5, "buffer32Identity", new Int32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
__publicField(Md5, "hexChars", "0123456789abcdef");
__publicField(Md5, "hexOut", []);
// Permanent instance is to use for one-call hashing
__publicField(Md5, "onePassHasher", new _Md5());

// src/messagebox.ts
var MessageBox = class extends Dialog {
  m_label;
  constructor(props) {
    let icon = props.icon ?? "var( --x4-icon-exclamation )";
    props.icon = void 0;
    let buttons = props.buttons === void 0 ? ["ok"] : props.buttons;
    props.buttons = void 0;
    super(props);
    let msg = props.message;
    this.form.updateContent(new HLayout({
      style: { padding: 8 },
      content: [
        icon ? new Icon({ cls: "icon", icon }) : null,
        this.m_label = new Label({ cls: "text", text: msg, multiline: true })
      ]
    }), buttons);
    this.on("btnClick", (ev) => {
      if (!this.m_props.click) {
        return;
      }
      asap(() => {
        this.m_props.click(ev.button);
      });
    });
  }
  set text(txt) {
    this.m_label.text = txt;
  }
  /**
   * display a messagebox
   */
  static show(props) {
    let msg;
    if (isString(props) || isHtmlString(props)) {
      msg = new MessageBox({ message: props, click: () => {
      } });
    } else {
      msg = new MessageBox(props);
    }
    msg.show();
    return msg;
  }
  static async showAsync(props) {
    return new Promise((resolve, reject) => {
      let _props;
      const cb = /* @__PURE__ */ __name((btn) => {
        resolve(btn);
      }, "cb");
      if (isString(props) || isHtmlString(props)) {
        _props = { message: props, click: cb };
      } else {
        _props = { ...props, click: cb };
      }
      const msg = new MessageBox(_props);
      msg.show();
    });
  }
  /**
   * display an alert message
   */
  static alert(text, title = null) {
    new MessageBox({
      cls: "warning",
      title,
      message: text,
      buttons: ["ok"],
      click: () => {
      }
    }).show();
  }
};
__name(MessageBox, "MessageBox");
var PromptDialogBox = class extends Dialog {
  m_edit;
  constructor(props) {
    props.buttons = void 0;
    props.width = props.width ?? 500;
    super(props);
    this.form.updateContent(
      new HLayout({
        cls: "panel",
        content: [
          //icon ? new Icon({
          //	cls: 'icon',
          //	icon: icon
          //}) : null,
          this.m_edit = new TextEdit({
            flex: 1,
            autoFocus: true,
            label: props.message,
            value: props.value
          })
        ]
      }),
      ["ok", "cancel"]
    );
    if (props.click) {
      this.on("btnClick", (ev) => {
        if (ev.button === "ok") {
          asap(() => {
            this.m_props.click(this.m_edit.value);
          });
        }
      });
    }
  }
  set text(txt) {
    this.m_edit.label = txt;
  }
  /**
   * display a messagebox
   */
  static show(props, inputCallback) {
    let msg;
    if (isString(props) || isHtmlString(props)) {
      msg = new PromptDialogBox({ message: props, click: inputCallback });
    } else {
      msg = new PromptDialogBox(props);
    }
    msg.show();
    return msg;
  }
};
__name(PromptDialogBox, "PromptDialogBox");

// src/panel.ts
var Panel = class extends VLayout {
  m_ui_title;
  m_ui_body;
  constructor(props) {
    super(props);
    const sens = props?.sens == "horizontal" ? "@hlayout" : "@vlayout";
    this.m_ui_title = new Label({ cls: "title", text: this.m_props.title });
    this.m_ui_body = new Component({ cls: "body " + sens, content: this.m_props.content, style: props.bodyStyle });
  }
  /** @ignore */
  render() {
    const gadgets = this.m_props.gadgets ?? [];
    const icon = this.m_props.icon ? new Icon({ icon: this.m_props.icon }) : null;
    super.setContent([
      new HLayout({
        cls: "title",
        content: [
          icon,
          this.m_ui_title,
          ...gadgets
        ]
      }),
      this.m_ui_body
    ]);
  }
  setContent(els) {
    this.m_ui_body.setContent(els);
  }
  set title(text) {
    this.m_ui_title.text = text;
  }
};
__name(Panel, "Panel");

// src/spreadsheet.ts
var CellData = class {
  text;
  cls;
};
__name(CellData, "CellData");
__publicField(CellData, "empty_cell", {
  text: ""
});
var Spreadsheet = class extends VLayout {
  m_columns;
  m_row_limit;
  m_cells_data;
  m_rows_data;
  m_view;
  m_container;
  m_header;
  m_itemHeight;
  m_topIndex;
  m_visible_cells;
  m_row_count;
  // visible row count
  m_selection;
  m_editor;
  m_autoedit;
  m_lockupdate;
  m_auto_row_count;
  m_recycler;
  m_used_cells;
  constructor(props) {
    super(props);
    this.m_columns = props.columns;
    this.m_autoedit = props.autoedit;
    this.m_lockupdate = 0;
    this.m_cells_data = /* @__PURE__ */ new Map();
    this.m_rows_data = /* @__PURE__ */ new Map();
    this.m_itemHeight = 0;
    this.m_selection = { row: 0, col: 0 };
    this.m_row_count = 0;
    this.m_auto_row_count = false;
    this.m_recycler = [];
    this.m_used_cells = [];
    if (props.maxrows === void 0) {
      this.m_row_limit = 0;
      this.m_auto_row_count = true;
    } else if (props.maxrows < 0) {
      this.m_row_limit = 0;
      this.m_auto_row_count = true;
    } else {
      this.m_row_limit = props.maxrows;
    }
    this.setAttribute("tabindex", 0);
    this.setDomEvent("click", (e) => this._itemClick(e));
    this.setDomEvent("dblclick", (e) => this._itemDblClick(e));
    this.setDomEvent("keydown", (e) => this._handleKey(e));
    this.setDomEvent("keypress", (e) => this._keyPress(e));
    this.setDomEvent("focus", () => this._focus(true));
    this.setDomEvent("focusout", () => this._focus(false));
    this.setDomEvent("contextmenu", (e) => this._ctxMenu(e));
    this.mapPropEvents(props, "dblClick", "selectionChange", "contextMenu", "change");
  }
  componentCreated() {
    super.componentCreated();
    this._updateScroll(true);
  }
  setColWidth(col, width) {
    this._on_col_resize(col, width);
    this.update(10);
  }
  getColWidth(col) {
    if (!this.m_columns[col]) {
      return;
    }
    return this.m_columns[col].width;
  }
  setColTitle(col, title) {
    console.assert(this.m_columns[col] !== void 0);
    this.m_columns[col].title = title;
    this.update(10);
  }
  /**
   * reset the spreadsheet
   * @param columns 
   */
  reset(columns) {
    if (columns) {
      this.m_columns = columns;
    }
    this.m_cells_data = /* @__PURE__ */ new Map();
    this.m_rows_data = /* @__PURE__ */ new Map();
    this.update(10);
  }
  /**
   * insert a row
   * @param before row number before wich insert the new row 
   */
  insertRow(before) {
    let new_cells_data = /* @__PURE__ */ new Map();
    this.m_cells_data.forEach((celldata, key) => {
      let { row, col } = _getid(key);
      if (row >= before) {
        new_cells_data.set(_mkid2(row + 1, col), celldata);
      } else {
        new_cells_data.set(key, celldata);
      }
    });
    let new_rows_data = /* @__PURE__ */ new Map();
    this.m_rows_data.forEach((rowdata, row) => {
      if (row >= before) {
        new_rows_data.set(row + 1, rowdata);
      } else {
        new_rows_data.set(row, rowdata);
      }
    });
    this.m_cells_data = new_cells_data;
    this.m_rows_data = new_rows_data;
    this._buildItems();
  }
  /**
   * remove a row
   * @param rowtodel row number to remove
   */
  deleteRow(rowtodel) {
    let new_cells_data = /* @__PURE__ */ new Map();
    let new_rows_data = /* @__PURE__ */ new Map();
    this.m_cells_data.forEach((celldata, key) => {
      let { row, col } = _getid(key);
      if (row > rowtodel) {
        new_cells_data.set(_mkid2(row - 1, col), celldata);
      } else if (row < rowtodel) {
        new_cells_data.set(key, celldata);
      }
    });
    this.m_rows_data.forEach((rowdata, row) => {
      if (row > rowtodel) {
        new_rows_data.set(row - 1, rowdata);
      } else if (row < rowtodel) {
        new_rows_data.set(row, rowdata);
      }
    });
    this.m_cells_data = new_cells_data;
    this.m_rows_data = new_rows_data;
    this._buildItems();
  }
  /**
   * insert a new column
   * @param before column index before to insert the new column or <0 to append
   */
  insertCol(before, column) {
    let inspos = before;
    if (inspos < 0) {
      inspos = this.m_columns.length + 1;
    }
    this.m_columns.splice(inspos, 0, column);
    if (before >= 0) {
      let new_cells_data = /* @__PURE__ */ new Map();
      this.m_cells_data.forEach((celldata, key) => {
        let { row, col } = _getid(key);
        if (col >= before) {
          new_cells_data.set(_mkid2(row, col + 1), celldata);
        } else {
          new_cells_data.set(key, celldata);
        }
      });
      this.m_cells_data = new_cells_data;
    }
    this.update();
  }
  /**
   * remove a column
   * @param coltodel 
   */
  deleteCol(coltodel) {
    this.m_columns.splice(coltodel, 1);
    let new_cells_data = /* @__PURE__ */ new Map();
    this.m_cells_data.forEach((celldata, key) => {
      let { row, col } = _getid(key);
      if (col > coltodel) {
        new_cells_data.set(_mkid2(row, col - 1), celldata);
      } else if (col < coltodel) {
        new_cells_data.set(key, celldata);
      }
    });
    this.m_cells_data = new_cells_data;
    this.update();
  }
  /**
   * 
   * @param row 
   * @param col 
   */
  _getCellData(row, col, raw = false) {
    let value = this.m_cells_data.get(_mkid2(row, col));
    if (value === void 0) {
      return raw ? null : CellData.empty_cell;
    }
    return value;
  }
  _focus(focus) {
    this.setClass("@focus", focus);
  }
  _ctxMenu(e) {
    let dom = e.target, self = this.dom;
    while (dom && dom != self) {
      let itm = Component.getElement(dom), row = itm.getData("row-id"), col = itm.getData("col-id");
      if (row !== void 0) {
        this._selectItem(row, col);
        this.emit("contextMenu", EvContextMenu(e, { row, col, item: itm }));
        e.preventDefault();
        return;
      }
      dom = dom.parentElement;
    }
  }
  /** @ignore */
  render() {
    this.m_recycler = [];
    this.m_container = new Component({
      cls: "content"
    });
    this.m_view = new Component({
      cls: "@scroll-view",
      flex: 1,
      dom_events: {
        sizechange: () => this._updateScroll(true),
        scroll: () => this._updateScroll(false)
      },
      content: this.m_container
    });
    let cols = this.m_columns.map((col, index) => {
      let comp = new Component({
        cls: "@cell c" + index,
        content: col.title ? col.title : "&nbsp",
        flex: col.width < 0 ? -col.width : void 0,
        attrs: {
          title: col.title
        },
        style: {
          width: col.width >= 0 ? col.width : void 0,
          minWidth: col.min_width
        }
      });
      new SizerOverlay({
        target: comp,
        sens: "right",
        resize: (ev) => {
          this._on_col_resize(index, ev.size.width);
        }
      });
      col.$col = comp;
      return comp;
    });
    this.m_header = new HLayout({
      cls: "@header",
      content: cols
    });
    this.setContent([
      this.m_header,
      this.m_view
    ]);
  }
  /**
   * 
   */
  _on_col_resize(col, width) {
    if (!this.m_columns[col]) {
      return;
    }
    if (width <= 0) {
      this.m_columns[col].width = -1;
    } else {
      this.m_columns[col].width = width;
    }
    this._updateScroll(true);
  }
  /**
   * compute misc dimensions
   * - item height
   * - scroll width
   */
  _computeItemHeight() {
    let g1 = x4document.createElement("div");
    g1.classList.add("x-spreadsheet");
    let g2 = x4document.createElement("div");
    g2.classList.add("content");
    let g3 = x4document.createElement("div");
    g3.classList.add("x-cell");
    g3.append("&nbsp;");
    g2.appendChild(g3);
    g1.appendChild(g2);
    this.dom.appendChild(g1);
    let rc = g3.getBoundingClientRect();
    this.dom.removeChild(g1);
    this.m_itemHeight = rc.height;
  }
  /**
   * compute columns widths 
   * use col.width for fixed size columns
   * if col.width < 0 that mean that this is a proportion of the remaining space
   */
  _calcColWidths(width) {
    let fullw = 0;
    let nwide = 0;
    let calcw = new Int32Array(this.m_columns.length);
    let calcz = new Int32Array(this.m_columns.length);
    let calcm = new Int32Array(this.m_columns.length);
    this.m_columns.forEach((col, colIdx) => {
      let minw = Math.max(10, col.min_width ?? 0);
      if (col.width > 0) {
        let cw = Math.max(col.width, minw);
        fullw += cw;
        calcw[colIdx] = cw;
      } else {
        let z = -col.width;
        calcz[colIdx] = z;
        nwide += z;
      }
      calcm[colIdx] = minw;
    });
    if (nwide) {
      let restw = width - fullw;
      for (let i = 0; i < this.m_columns.length && nwide; i++) {
        if (!calcw[i]) {
          let rest = Math.round(restw / nwide) * calcz[i];
          if (rest < calcm[i]) {
            rest = calcm[i];
          }
          calcw[i] = rest;
          restw -= rest;
          nwide -= calcz[i];
        }
      }
    }
    return calcw;
  }
  /**
   * create a cell (component)
   * and append it to the parent view
   * if a cell was reviously recyled, use it
   */
  _createCell() {
    let cell;
    if (this.m_recycler.length) {
      cell = this.m_recycler.pop();
      cell.clearClasses();
      cell.addClass("@comp");
    } else {
      cell = new Component({
        cls: "@cell"
      });
    }
    if (!cell.dom) {
      this.m_container.appendChild(cell);
    }
    return cell;
  }
  /**
   * build cells of the spreadsheet
   * cells are recycled when scrolling,
   * only visibles cells exists
   */
  _buildItems() {
    let rc = this.getBoundingRect();
    let rh = this.m_header.getBoundingRect();
    let height = rc.height - rh.height;
    if (this.m_itemHeight == 0) {
      this._computeItemHeight();
    }
    let top = this.m_topIndex * this.m_itemHeight;
    let y = 0;
    let cidx = 0;
    let rowIdx = this.m_topIndex;
    let count = this.m_row_limit;
    if (this.m_auto_row_count) {
      this.m_row_limit = count = this.getMaxRowCount();
    }
    let right_pos = 0;
    if (count * this.m_itemHeight > height) {
      let w = Component.getScrollbarSize();
      rc.width -= w;
      right_pos = w;
    }
    let even = this.m_topIndex & 1 ? true : false;
    this.m_visible_cells = /* @__PURE__ */ new Map();
    this.m_used_cells.forEach((c) => {
      this.m_recycler.push(c);
    });
    this.m_used_cells = [];
    let calcw = this._calcColWidths(rc.width);
    let full_width = 0;
    for (let i = 0; i < calcw.length; i++) {
      full_width += calcw[i];
    }
    if (full_width <= rc.width) {
      this.m_view.setStyleValue("overflow-x", "hidden");
      this.m_header.setStyleValue("width", rc.width);
      this.m_container.setStyleValue("width", rc.width);
      this.m_container.setStyle({
        height: count * this.m_itemHeight
      });
    } else {
      this.m_header.setStyleValue("width", full_width);
      this.m_container.setStyleValue("width", full_width);
      this.m_view.setStyleValue("overflow-x", "visible");
      this.m_container.setStyle({
        height: count * this.m_itemHeight,
        width: full_width
      });
    }
    this.m_view.addClass("@hidden");
    let limit = 100;
    while (y < height && rowIdx < count && --limit > 0) {
      let rowdata = this.m_rows_data.get(rowIdx);
      let x = 0;
      let cols = this.m_columns.map((col, colIdx) => {
        let cls = "@cell c" + colIdx;
        if (col.align) {
          cls += " " + col.align;
        }
        if (col.cls) {
          cls += " " + col.cls;
        }
        let cell;
        let celldata = this._getCellData(rowIdx, colIdx);
        let text = celldata.text;
        if (col.renderer && text.length) {
          text = col.renderer(text, { row: rowIdx, col: colIdx });
        }
        cls += even ? " even" : " odd";
        if (rowdata) {
          cls += " " + rowdata;
        }
        cell = this._createCell();
        this.m_used_cells.push(cell);
        cell.setContent(text);
        cell.addClass(cls);
        cell.setStyle({
          left: x,
          top: top + y,
          width: calcw[colIdx],
          height: this.m_itemHeight
        });
        if (this.m_selection.row == rowIdx && this.m_selection.col == colIdx) {
          cell.addClass("@selected");
        }
        cell.setData("row-id", rowIdx);
        cell.setData("col-id", colIdx);
        if (celldata.cls) {
          cell.addClass(celldata.cls);
        }
        this.m_visible_cells.set(_mkid2(rowIdx, colIdx), cell);
        x += calcw[colIdx];
        return cell;
      });
      even = !even;
      y += this.m_itemHeight;
      rowIdx++;
      cidx++;
    }
    this.m_recycler.forEach((c) => {
      c.addClass("@hidden");
    });
    this.m_row_count = cidx;
    this.m_view.removeClass("@hidden");
    this.setClass("empty", count == 0);
  }
  /** @ignore */
  _itemClick(e) {
    let dom = e.target;
    if (this.m_editor && this.m_editor.dom.contains(dom)) {
      return;
    }
    let itm = Component.getElement(dom, Component);
    if (!itm) {
      return;
    }
    let rowIdx = itm.getData("row-id"), colIdx = itm.getData("col-id");
    if (rowIdx === void 0 || colIdx === void 0) {
      return;
    }
    this._selectItem(rowIdx, colIdx);
  }
  _itemDblClick(e) {
    let dom = e.target;
    if (this.m_editor && this.m_editor.dom.contains(dom)) {
      return;
    }
    let itm = Component.getElement(dom), rowIdx = itm.getData("row-id"), colIdx = itm.getData("col-id");
    if (rowIdx === void 0 || colIdx === void 0) {
      return;
    }
    this.emit("dblClick", EvDblClick({ row: rowIdx, col: colIdx }));
    this.editCell(rowIdx, colIdx);
  }
  /**
   * 
   * @param rowIdx 
   * @param colIdx 
   * @param scrollIntoView 
   */
  _selectItem(rowIdx, colIdx, scrollIntoView) {
    if (rowIdx < 0) {
      rowIdx = 0;
    }
    if (rowIdx > this.m_row_limit - 1) {
      rowIdx = this.m_row_limit - 1;
    }
    if (colIdx < 0) {
      colIdx = 0;
    }
    let lastcol = this.m_columns.length - 1;
    if (colIdx > lastcol) {
      colIdx = lastcol;
    }
    if (this.m_selection.row == rowIdx && this.m_selection.col == colIdx) {
      return;
    }
    this.select(rowIdx, colIdx, scrollIntoView);
  }
  _scrollIntoView(row, col) {
    let doscroll = /* @__PURE__ */ __name((itm, mode = "nearest") => {
      itm.scrollIntoView({
        block: mode
        //<ScrollLogicalPosition>sens ?? 'nearest'
      });
    }, "doscroll");
    let last = this.m_topIndex + this.m_row_count - 1;
    if (row < this.m_topIndex) {
      this.m_topIndex = row;
      this.m_view.dom.scrollTop = this.m_topIndex * this.m_itemHeight;
      this._buildItems();
      doscroll(this._findItem(row, col), "start");
    } else if (row > last) {
      this.m_topIndex = row - this.m_row_count + 1;
      this.m_view.dom.scrollTop = this.m_topIndex * this.m_itemHeight;
      this._buildItems();
      doscroll(this._findItem(row, col), "end");
    } else {
      doscroll(this._findItem(row, col));
    }
  }
  /**
   * 
   * @param row 
   * @param col 
   */
  _findItem(row, col) {
    if (!this.m_visible_cells) {
      return null;
    }
    return this.m_visible_cells.get(_mkid2(row, col));
  }
  /**
   * 
   */
  _updateScroll(forceUpdate) {
    if (!this?.m_view?.dom) {
      return;
    }
    let newTop = Math.floor(this.m_view.dom.scrollTop / (this.m_itemHeight || 1));
    if (newTop != this.m_topIndex || forceUpdate) {
      this.m_topIndex = newTop;
      this._buildItems();
    }
    let newLeft = this.m_view.dom.scrollLeft;
    this.m_header.setStyleValue("left", -newLeft);
  }
  /**
   * 
   * @param event 
   * @param t 
   */
  _moveSel(sensy, sensx) {
    let sel = this.m_selection;
    let newRow = sel.row ?? 0;
    let newCol = sel.col ?? 0;
    if (sensy == 1) {
      newRow++;
    } else if (sensy == -1) {
      newRow--;
    } else if (sensy == 2) {
      newRow += this.m_row_count - 1;
    } else if (sensy == -2) {
      newRow -= this.m_row_count - 1;
    } else if (sensy == 3) {
      newRow = this.m_row_limit - 1;
    } else if (sensy == -3) {
      newRow = 0;
    }
    if (sensx == 1) {
      newCol++;
    } else if (sensx == -1) {
      newCol--;
    } else if (sensx == 2) {
      newCol = this.m_columns.length - 1;
    } else if (sensx == -2) {
      newCol = 0;
    } else if (sensx == 3) {
      newCol++;
      let lastcol = this.m_columns.length - 1;
      l1:
        for (let trys = 0; trys < 2; trys++) {
          while (newCol < lastcol) {
            if (this.m_columns[newCol].createEditor !== null) {
              break l1;
            }
            newCol++;
          }
          if (newCol > lastcol) {
            newRow++;
            newCol = 0;
          }
        }
    } else if (sensx == -3) {
      newCol--;
      let lastcol = this.m_columns.length - 1;
      l2:
        for (let trys = 0; trys < 2; trys++) {
          while (newCol >= 0) {
            if (this.m_columns[newCol].createEditor !== null) {
              break l2;
            }
            newCol--;
          }
          if (newCol < 0) {
            newRow--;
            newCol = lastcol;
          }
        }
    }
    this._selectItem(newRow, newCol, true);
  }
  _handleKey(event) {
    let dom = event.target;
    if (this.m_editor && this.m_editor.dom.contains(dom)) {
      return;
    }
    switch (event.key) {
      case "ArrowDown":
      case "Down": {
        this._moveSel(1, 0);
        break;
      }
      case "ArrowUp":
      case "Up": {
        this._moveSel(-1, 0);
        break;
      }
      case "PageUp": {
        this._moveSel(-2, 0);
        break;
      }
      case "PageDown": {
        this._moveSel(2, 0);
        break;
      }
      case "ArrowLeft":
      case "Left": {
        this._moveSel(0, -1);
        break;
      }
      case "ArrowRight":
      case "Right": {
        this._moveSel(0, 1);
        break;
      }
      case "Home": {
        if (event.ctrlKey) {
          this._moveSel(-3, 0);
        } else {
          this._moveSel(0, -2);
        }
        break;
      }
      case "End": {
        if (event.ctrlKey) {
          this._moveSel(3, 0);
        } else {
          this._moveSel(0, 2);
        }
        break;
      }
      case "Enter": {
        this.editCurCell();
        event.stopPropagation();
        event.preventDefault();
        break;
      }
      case "Delete": {
        this.clearCell(this.m_selection.row, this.m_selection.col);
        break;
      }
      default: {
        break;
      }
    }
  }
  _keyPress(event) {
    let dom = event.target;
    if (this.m_editor && this.m_editor.dom.contains(dom)) {
      return;
    }
    if (event.ctrlKey || event.altKey) {
      return;
    }
    this.editCurCell(event.key);
  }
  /**
   * return the selection
   * { row, col }
   */
  getSelection() {
    return this.m_selection;
  }
  select(row, col, scrollIntoView = true) {
    if (this.m_selection.row == row && this.m_selection.col == col) {
      return;
    }
    let oldSel = this._findItem(this.m_selection.row, this.m_selection.col);
    if (oldSel) {
      oldSel.removeClass("@selected");
    }
    this.m_selection = { row, col };
    if (scrollIntoView) {
      this._scrollIntoView(row, col);
    }
    let newSel = this._findItem(row, col);
    if (newSel) {
      newSel.addClass("@selected");
    }
    this.emit("selectionChange", EvSelectionChange({ row, col }));
  }
  /**
   * return the row count
   */
  rowCount() {
    return this.m_row_limit;
  }
  /**
   * return the maximum row index filled with something
   */
  getMaxRowCount() {
    let max_row = 0;
    this.m_cells_data.forEach((c, uid) => {
      let row = Math.round(uid / 1e3) + 1;
      if (max_row < row) {
        max_row = row;
      }
    });
    return max_row;
  }
  getColCount() {
    return this.m_columns.length;
  }
  setRowStyle(row, cls) {
    this.m_rows_data.set(row, cls);
    if (this.m_lockupdate == 0) {
      this._buildItems();
    }
  }
  getRowStyle(row) {
    return this.m_rows_data.get(row);
  }
  setCellStyle(row, col, cls) {
    let cell = this._getCellData(row, col, true);
    if (!cell) {
      cell = { text: "" };
      this.m_cells_data.set(_mkid2(row, col), cell);
    }
    cell.cls = cls;
    if (this.m_lockupdate == 0 && this.m_visible_cells) {
      let itm = this._findItem(row, col);
      if (itm) {
        itm.setClass(cls, true);
      } else {
        this._buildItems();
      }
    }
  }
  getCellText(row, col) {
    return this._getCellData(row, col).text;
  }
  getCellNumber(row, col) {
    let text = this._getCellData(row, col).text;
    return parseIntlFloat(text);
  }
  clearRow(row) {
    for (let c = 0; c < this.m_columns.length; c++) {
      this.clearCell(row, c);
    }
    this.update(10);
  }
  clearCell(row, col) {
    this.setCellText(row, col, null);
  }
  editCurCell(forceText) {
    this.editCell(this.m_selection.row, this.m_selection.col, forceText);
  }
  editCell(row, col, forcedText) {
    if (!this.m_autoedit) {
      return;
    }
    if (this.m_columns[col].createEditor === null) {
      return;
    }
    this._scrollIntoView(row, col);
    let item = this._findItem(row, col);
    let place = item.dom;
    let parent = place.parentElement;
    let rc = place.getBoundingClientRect();
    let prc = parent.getBoundingClientRect();
    let cell = this._getCellData(row, col, true);
    let edtBuilder = /* @__PURE__ */ __name((props, col2, row2) => {
      return new TextEdit(props);
    }, "edtBuilder");
    if (this.m_columns[col].createEditor) {
      edtBuilder = this.m_columns[col].createEditor;
    }
    let cellvalue = forcedText ? forcedText : cell ? cell.text : "";
    this.m_editor = edtBuilder({
      cls: "@editor",
      style: {
        left: rc.left - prc.left,
        top: rc.top - prc.top,
        width: rc.width - 1,
        height: rc.height - 1
      },
      tabIndex: false,
      value: cellvalue,
      data: {
        row,
        col
      }
    }, row, col);
    if (!this.m_editor) {
      return;
    }
    parent.appendChild(this.m_editor._build());
    this._setupEditor();
    this.m_editor.setData("old-value", cellvalue);
    this.m_editor.focus();
    if (this.m_editor instanceof TextEdit) {
      this.m_editor.selectAll();
    }
  }
  _setupEditor() {
    let movesel = /* @__PURE__ */ __name((sensy, sensx) => {
      deferCall(() => {
        this.killEditor(true);
        this._moveSel(sensy, sensx);
        this.editCurCell();
      });
    }, "movesel");
    if (this.m_editor instanceof TextEdit) {
      let editor = this.m_editor;
      let input = editor.input;
      input.setDomEvent("blur", () => {
        this.killEditor(true);
      });
      input.setDomEvent("keydown", (e) => {
        if (e.defaultPrevented) {
          return;
        }
        switch (e.key) {
          case "Escape": {
            this.killEditor(false);
            e.stopPropagation();
            e.preventDefault();
            break;
          }
          case "Enter":
          case "Tab": {
            let sens = 3;
            if (e.shiftKey) {
              sens = -3;
            }
            movesel(0, sens);
            e.stopPropagation();
            e.preventDefault();
            break;
          }
          case "ArrowUp":
          case "Up": {
            movesel(-1, 0);
            e.stopPropagation();
            e.preventDefault();
            break;
          }
          case "ArrowDown":
          case "Down": {
            movesel(1, 0);
            e.stopPropagation();
            e.preventDefault();
            break;
          }
        }
      });
    } else if (this.m_editor instanceof ComboBox) {
      let input = this.m_editor.input;
      input.setDomEvent("blur", () => {
        this.killEditor(true);
      });
      input.setDomEvent("keydown", (e) => {
        switch (e.key) {
          case "Escape": {
            this.killEditor(false);
            e.stopPropagation();
            e.preventDefault();
            break;
          }
          case "Enter":
          case "Tab": {
            let sens = 3;
            if (e.shiftKey) {
              sens = -3;
            }
            movesel(0, sens);
            e.stopPropagation();
            e.preventDefault();
            break;
          }
        }
      });
      this.m_editor.showPopup();
      this.m_editor.on("change", (ev) => {
        this.killEditor(true);
      });
      this.m_editor.on("cancel", (ev) => {
        this.killEditor(false);
      });
    }
  }
  killEditor(save) {
    if (this.m_editor) {
      if (save) {
        let text, id;
        if (this.m_editor instanceof TextEdit) {
          text = this.m_editor.value;
        } else if (this.m_editor instanceof ComboBox) {
          id = this.m_editor.value;
          text = this.m_editor.valueText;
        }
        let row = this.m_editor.getData("row");
        let col = this.m_editor.getData("col");
        let old = this.m_editor.getData("old-value");
        this.setCellText(row, col, text);
        const ev = EvChange(text, { row, col, oldValue: old, id });
        this.emit("change", ev);
        if (ev.defaultPrevented) {
          this.setCellText(row, col, old);
        }
      }
      let t = this.m_editor;
      asap(() => {
        t.dispose();
      });
      this.m_editor = null;
      this.focus();
    }
  }
  clearData() {
    this.m_cells_data = /* @__PURE__ */ new Map();
    this.m_rows_data = /* @__PURE__ */ new Map();
  }
  setCellText(row, col, value) {
    if (value == null || value.length == 0) {
      this.m_cells_data.delete(_mkid2(row, col));
      value = "";
    } else {
      let cell = this._getCellData(row, col, true);
      if (!cell) {
        cell = {};
      }
      cell.text = value;
      this.m_cells_data.set(_mkid2(row, col), cell);
    }
    if (this.m_lockupdate == 0 && this.m_visible_cells) {
      let itm = this._findItem(row, col);
      if (itm) {
        if (this.m_columns[col].renderer) {
          value = this.m_columns[col].renderer(value, { row, col });
        }
        itm.setContent(value);
      } else {
        this._buildItems();
      }
    }
  }
  lockUpdate(start) {
    if (start) {
      this.m_lockupdate++;
    } else {
      if (--this.m_lockupdate == 0) {
        this._updateScroll(true);
      }
    }
  }
};
__name(Spreadsheet, "Spreadsheet");
function _mkid2(row, col) {
  return row * 1e3 + col;
}
__name(_mkid2, "_mkid");
function _getid(key) {
  return {
    row: Math.floor(key / 1e3) | 0,
    col: key % 1e3 | 0
  };
}
__name(_getid, "_getid");

// src/property_editor.ts
var PropertyEditor = class extends Component {
  m_fields;
  m_record;
  m_sheet;
  m_label_w;
  constructor(props) {
    super(props);
    this.mapPropEvents(props, "change");
  }
  render(props) {
    this.m_record = props.record;
    this.m_fields = props.fields ?? [];
    this.m_label_w = props.labelWidth;
    this.m_sheet = new Spreadsheet({
      cls: "@fit",
      columns: [
        {
          title: _tr.global.property,
          width: this.m_label_w > 0 ? this.m_label_w : -1,
          cls: "property"
        },
        {
          title: _tr.global.value,
          width: -1,
          createEditor: (...a) => this._editCell(...a),
          renderer: (...a) => this._renderCell(...a)
        }
      ],
      autoedit: true,
      change: (e) => this._cellChange(e)
    });
    this._updateProperties();
    this.setContent(this.m_sheet);
  }
  setFields(fields) {
    if (fields) {
      this.m_fields = fields;
      this._updateProperties();
    } else {
      this.m_sheet.clearData();
    }
  }
  setRecord(record) {
    this.m_record = record;
    this._updateProperties();
  }
  _updateProperties() {
    this.m_sheet.lockUpdate(true);
    this.m_sheet.clearData();
    this.m_fields.forEach((fld, lno) => {
      this.m_sheet.setCellText(lno, 0, fld.title);
      if (this.m_record) {
        this.m_sheet.setCellText(lno, 1, this.m_record.getField(fld.id));
      } else {
        this.m_sheet.setCellText(lno, 1, fld.value);
      }
    });
    this.m_sheet.lockUpdate(false);
  }
  _cellChange(ev) {
    let ctx = ev.context;
    let text = ev.value;
    if (ctx.col != 1) {
      return;
    }
    let fld = this.m_fields[ctx.row];
    switch (fld.type) {
      default:
      case "string": {
        break;
      }
      case "number": {
        break;
      }
      case "password": {
        break;
      }
      case "boolean": {
        break;
      }
      case "choice": {
        break;
      }
    }
    if (this.m_record) {
      this.m_record.setField(fld.id, text);
    } else {
      fld.value = text;
    }
    this.emit("change", EvChange(text, fld));
  }
  _renderCell(text, rec) {
    let fld = this.m_fields[rec.row];
    switch (fld.type) {
      default:
      case "string": {
        break;
      }
      case "number": {
        break;
      }
      case "password": {
        text = "\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF";
        break;
      }
      case "boolean": {
        break;
      }
      case "choice": {
        break;
      }
    }
    return text;
  }
  _editCell(props, row, col) {
    let fld = this.m_fields[row];
    let editor;
    switch (fld.type) {
      default:
      case "string": {
        editor = new TextEdit(props);
        break;
      }
      case "number": {
        editor = new TextEdit(props);
        break;
      }
      case "password": {
        props.type = "password";
        props.value = this.m_record.getField(fld.id);
        editor = new Input(props);
        break;
      }
      case "boolean": {
        editor = new CheckBox(props);
        break;
      }
      case "choice": {
        break;
      }
    }
    return editor;
  }
  _choicesFromArray(values) {
    let choices = values.map((e) => {
      if (typeof e == "object") {
        return { id: e.id, text: e.value };
      } else {
        return { id: e, text: "" + e };
      }
    });
    return choices;
  }
  _choicesFromStore(view, field) {
    let choices = [];
    for (let i = 0, n = view.count; i < n; i++) {
      let rec = view.getByIndex(i);
      choices.push({ id: rec.getID(), text: rec.getField(field) });
    }
    return choices;
  }
};
__name(PropertyEditor, "PropertyEditor");

// src/radiobtn.ts
var RadioBtn = class extends Component {
  m_ui_input;
  // todo: remove that / use ref
  constructor(props) {
    super(props);
    this.mapPropEvents(props, "change");
  }
  /** @ignore */
  render(props) {
    let text = props.text ?? "";
    let name = props.name ?? props.group;
    let labelWidth = props.labelWidth ?? -1;
    let checked = props.checked ?? false;
    let align = props.align ?? "left";
    let value = props.value;
    let icon = props.icon;
    this.setTag("label");
    this.addClass("@hlayout");
    this.addClass(align);
    this._setTabIndex(props.tabIndex);
    if (checked) {
      this.addClass("checked");
    }
    this.setContent([
      this.m_ui_input = new Input({
        type: "radio",
        name,
        tabIndex: props.tabIndex,
        value,
        attrs: {
          checked: checked ? "" : void 0
        },
        dom_events: {
          change: () => this._change(),
          focus: () => this.m_ui_input.focus()
        }
      }),
      new Label({
        ref: "label",
        icon,
        text,
        width: labelWidth === "flex" ? void 0 : labelWidth,
        flex: labelWidth === "flex" ? 1 : void 0,
        style: {
          order: align == "right" ? -1 : void 0
        }
      })
    ]);
  }
  /**
   * check state changed
   */
  _change() {
    let props = this.m_props;
    let query = ".x-input[name=" + props.name + "]";
    let nlist = x4document.querySelectorAll(query);
    nlist.forEach((dom2) => {
      let radio = Component.getElement(dom2, RadioBtn);
      radio.removeClass("checked");
    });
    let dom = this.m_ui_input.dom;
    this.setClass("checked", dom.checked);
    this.emit("change", EvChange(true));
  }
  /**
      * @return the checked value
      */
  get check() {
    if (this.m_ui_input) {
      return this.m_ui_input.dom.checked;
    }
    return this.m_props.checked;
  }
  /**
   * change the checked value
   * @param {boolean} ck new checked value	
   */
  set check(ck) {
    let dom = this.m_ui_input.dom;
    if (ck) {
      if (dom) {
        dom.checked = true;
      }
      this.m_props.checked = true;
    } else {
      if (dom) {
        dom.checked = false;
      }
      this.m_props.checked = false;
    }
  }
  get text() {
    return this.itemWithRef("label").text;
  }
  set text(text) {
    this.itemWithRef("label").text = text;
  }
};
__name(RadioBtn, "RadioBtn");

// src/rating.ts
var Rating = class extends HLayout {
  m_els;
  m_input;
  constructor(props) {
    super(props);
    props.steps = props.steps ?? 5;
  }
  render(props) {
    let shape = props.shape ?? "star";
    let value = props.value ?? 0;
    this.m_input = new Input({
      cls: "@hidden",
      name: props.name,
      value: "" + value
    });
    this.addClass(shape);
    this.setDomEvent("click", (e) => this._onclick(e));
    this.m_els = [];
    for (let i = 0; i < props.steps; i++) {
      let cls = "item";
      if (i + 1 <= value) {
        cls += " checked";
      }
      let c = new Component({
        tag: "option",
        cls,
        data: { value: i + 1 }
      });
      this.m_els.push(c);
    }
    this.m_els.push(this.m_input);
    this.setContent(this.m_els);
  }
  getValue() {
    return this.m_props.value ?? 0;
  }
  set value(v) {
    this.m_props.value = v;
    for (let c = 0; c < this.m_props.steps; c++) {
      this.m_els[c].setClass("checked", this.m_els[c].getData("value") <= v);
    }
    this.m_input.value = "" + this.m_props.value;
  }
  set steps(n) {
    this.m_props.steps = n;
    this.update();
  }
  set shape(shape) {
    this.removeClass(this.m_props.shape);
    this.m_props.shape = shape;
    this.addClass(this.m_props.shape);
  }
  _onclick(ev) {
    let on = true;
    for (let el = this.dom.firstChild; el; el = el.nextSibling) {
      let comp = Component.getElement(el);
      comp.setClass("checked", on);
      if (el == ev.target) {
        this.m_input.value = comp.getData("value");
        on = false;
      }
    }
    this.emit("change", EvChange(this.m_props.value));
  }
};
__name(Rating, "Rating");

// src/sidebarview.ts
var SideBarView = class extends CardView {
  m_sidebar;
  m_content;
  constructor(props) {
    super(props);
    this.addClass("@hlayout");
    this.m_sidebar = new VLayout({
      cls: "@side-bar",
      width: props.bar_width ?? void 0
    });
    this.m_content = new HLayout({ flex: 1, cls: "@tab-container" });
  }
  /** @ignore */
  render() {
    let tabs = [];
    this.m_cards.forEach((p) => {
      tabs.push(p.selector);
    });
    this.m_sidebar.setContent(new VLayout({
      flex: 1,
      cls: "content",
      content: [
        this.m_props.logo,
        ...tabs
      ]
    }));
    this.setContent([
      this.m_sidebar,
      this.m_props.bar_sizable ? new Separator({ orientation: "horizontal", sizing: "before" }) : void 0,
      this.m_content
    ]);
  }
  _prepareSelector(card) {
    return new Button({
      text: card.title,
      icon: card.icon,
      tooltip: card.title,
      click: () => {
        this.switchTo(card.name);
      }
    });
  }
  _preparePage(page) {
    super._preparePage(page);
    if (!page.dom) {
      this.m_content.appendChild(page);
    }
  }
};
__name(SideBarView, "SideBarView");

// src/svgcomponent.ts
var reNumber2 = /^-?\d+(\.\d+)?$/;
function d2r(d) {
  return d * Math.PI / 180;
}
__name(d2r, "d2r");
function p2c(x, y, r, deg) {
  const rad = d2r(deg);
  return {
    x: x + r * Math.cos(rad),
    y: y + r * Math.sin(rad)
  };
}
__name(p2c, "p2c");
function num(x) {
  return Math.round(x * 1e3) / 1e3;
}
__name(num, "num");
function clean(a, ...b) {
  b = b.map((v) => {
    if (typeof v === "number" && isFinite(v)) {
      return num(v);
    }
    return v;
  });
  return String.raw(a, ...b);
}
__name(clean, "clean");
var SVGItem = class {
  m_tag;
  m_attrs;
  m_style;
  constructor(tag) {
    this.m_tag = tag;
    this.m_attrs = /* @__PURE__ */ new Map();
    this.m_style = /* @__PURE__ */ new Map();
  }
  /**
   * render the item
   * @returns 
   */
  render() {
    return `<${this.m_tag} ${this.renderAttrs()} ${this.renderStyle()}>${this.renderContent()}</${this.m_tag}>`;
  }
  /**
   * change the stroke color
   * @param color 
   */
  stroke(color, width) {
    this.attr("stroke", color);
    if (width !== void 0) {
      this.attr("stroke-width", width + "px");
    }
    return this;
  }
  /**
   * change the stroke width
   * @param width 
   */
  strokeWidth(width) {
    this.attr("stroke-width", width + "px");
    return this;
  }
  /**
   * change the fill color
   * @param color 
   */
  fill(color) {
    this.attr("fill", color);
    return this;
  }
  /**
   * define a new attribute
   * @param name attibute name
   * @param value attribute value
   * @returns this
   */
  attr(name, value) {
    this.m_attrs.set(name, value);
    return this;
  }
  style(name, value) {
    if (value === void 0 || value === "" || value === void 0) {
      this.m_style.delete(name);
      return this;
    }
    if (!_x4_unitless[name] && (isNumber(value) || reNumber2.test(value))) {
      value = value + "px";
    }
    this.m_style.set(name, "" + value);
    return this;
  }
  /**
   * add a class
   * @param name class name to add 
   */
  class(name) {
    let c = this.m_attrs.get("class");
    this.m_attrs.set("class", (c ?? " " + name).trim());
    return this;
  }
  /**
   * 
   */
  renderAttrs() {
    if (!this.m_attrs.size) {
      return "";
    }
    let result = "";
    this.m_attrs.forEach((v, k) => {
      result += ` ${k} = "${v}"`;
    });
    return result;
  }
  /**
   * 
   */
  renderStyle() {
    if (!this.m_style.size) {
      return "";
    }
    let result = 'style="';
    this.m_style.forEach((v, k) => {
      result += `${k}:${v};`;
    });
    return result + '"';
  }
  /**
   * 
   */
  renderContent() {
    return "";
  }
  /**
   * 
   */
  clip(id) {
    this.attr("clip-path", `url(#${id})`);
    return this;
  }
  /**
   * 
   */
  transform(tr) {
    this.attr("transform", tr);
    return this;
  }
  /**
   * 
   */
  rotate(deg, cx, cy) {
    this.transform(`rotate( ${deg} ${cx} ${cy} )`);
    return this;
  }
  translate(dx, dy) {
    this.transform(`translate( ${dx} ${dy} )`);
    return this;
  }
  scale(x) {
    this.transform(`scale( ${x} )`);
    return this;
  }
};
__name(SVGItem, "SVGItem");
var SVGPath = class extends SVGItem {
  m_path;
  constructor() {
    super("path");
    this.m_path = "";
  }
  renderAttrs() {
    this.attr("d", this.m_path);
    return super.renderAttrs();
  }
  /**
   * move the current pos
   * @param x new pos x
   * @param y new pos y
   * @returns this
   */
  moveTo(x, y) {
    this.m_path += clean`M${x},${y}`;
    return this;
  }
  /**
   * draw aline to the given point
   * @param x end x
   * @param y end y
   * @returns this
   */
  lineTo(x, y) {
    this.m_path += clean`L${x},${y}`;
    return this;
  }
  /**
   * close the currentPath
   */
  closePath() {
    this.m_path += "Z";
    return this;
  }
  /**
   * draw an arc
   * @param x center x
   * @param y center y
   * @param r radius
   * @param start angle start in degrees
   * @param end angle end in degrees
   * @returns this
   */
  arc(x, y, r, start, end) {
    const st = p2c(x, y, r, start - 90);
    const en2 = p2c(x, y, r, end - 90);
    const flag = end - start <= 180 ? "0" : "1";
    this.m_path += clean`M${st.x},${st.y}A${r},${r} 0 ${flag} 1 ${en2.x},${en2.y}`;
    return this;
  }
};
__name(SVGPath, "SVGPath");
var SVGText = class extends SVGItem {
  m_text;
  constructor(x, y, txt) {
    super("text");
    this.m_text = txt;
    this.attr("x", num(x) + "");
    this.attr("y", num(y) + "");
  }
  font(font) {
    this.attr("font-family", font);
    return this;
  }
  fontSize(size) {
    this.attr("font-size", size + "");
    return this;
  }
  fontWeight(weight) {
    this.attr("font-weight", weight);
    return this;
  }
  textAlign(align) {
    let al;
    switch (align) {
      case "left":
        al = "start";
        break;
      case "center":
        al = "middle";
        break;
      case "right":
        al = "end";
        break;
      default:
        return this;
    }
    this.attr("text-anchor", al);
    return this;
  }
  verticalAlign(align) {
    let al;
    switch (align) {
      case "top":
        al = "hanging";
        break;
      case "center":
        al = "middle";
        break;
      case "bottom":
        al = "baseline";
        break;
      default:
        return;
    }
    this.attr("alignment-baseline", al);
    return this;
  }
  renderContent() {
    return this.m_text;
  }
};
__name(SVGText, "SVGText");
var SVGShape = class extends SVGItem {
  constructor(tag) {
    super(tag);
  }
};
__name(SVGShape, "SVGShape");
var _SVGGradient = class extends SVGItem {
  m_id;
  m_stops;
  constructor(x1, y1, x2, y2) {
    super("linearGradient");
    this.m_id = "gx-" + _SVGGradient.g_id;
    this.attr("id", this.m_id);
    this.attr("x1", isString(x1) ? x1 : num(x1) + "");
    this.attr("x2", isString(x2) ? x2 : num(x2) + "");
    this.attr("y1", isString(y1) ? y1 : num(y1) + "");
    this.attr("y2", isString(y2) ? y2 : num(y2) + "");
    this.m_stops = [];
    _SVGGradient.g_id++;
  }
  get id() {
    return "url(#" + this.m_id + ")";
  }
  addStop(offset, color) {
    this.m_stops.push({ offset, color });
    return this;
  }
  renderContent() {
    const result = [];
    this.m_stops.forEach((s) => {
      result.push(`<stop offset="${s.offset}%" stop-color="${s.color}"></stop>`);
    });
    return result.join("\n");
  }
};
var SVGGradient = _SVGGradient;
__name(SVGGradient, "SVGGradient");
__publicField(SVGGradient, "g_id", 1);
var SVGGroup = class extends SVGItem {
  m_items;
  constructor(tag = "g") {
    super(tag);
    this.m_items = [];
  }
  path() {
    const path = new SVGPath();
    this.m_items.push(path);
    return path;
  }
  text(x, y, txt) {
    const text = new SVGText(x, y, txt);
    this.m_items.push(text);
    return text;
  }
  ellipse(x, y, r1, r2 = r1) {
    const shape = new SVGShape("ellipse");
    shape.attr("cx", num(x) + "");
    shape.attr("cy", num(y) + "");
    shape.attr("rx", num(r1) + "");
    shape.attr("ry", num(r2) + "");
    this.m_items.push(shape);
    return shape;
  }
  rect(x, y, w, h) {
    const shape = new SVGShape("rect");
    shape.attr("x", num(x) + "");
    shape.attr("y", num(y) + "");
    shape.attr("width", num(w) + "");
    shape.attr("height", num(h) + "");
    this.m_items.push(shape);
    return shape;
  }
  group() {
    const group = new SVGGroup();
    this.m_items.push(group);
    return group;
  }
  /**
   * 
   * example
   * ```ts
   * const g = c.linear_gradient( '0%', '0%', '0%', '100%' )
   * 				.addStop( 0, 'red' )
   * 				.addStop( 100, 'green' );
   * 
   * p.rect( 0, 0, 100, 100 )
   * 		.stroke( g.id );
   * 
   * ```
   */
  linear_gradient(x1, y1, x2, y2) {
    const grad = new SVGGradient(x1, y1, x2, y2);
    this.m_items.push(grad);
    return grad;
  }
  /**
   * clear 
   */
  clear() {
    this.m_items = [];
  }
  renderContent() {
    let result = [];
    this.m_items.forEach((i) => {
      result.push(i.render());
    });
    return result.join("\n");
  }
};
__name(SVGGroup, "SVGGroup");
var _SVGPathBuilder = class extends SVGGroup {
  constructor() {
    super("");
  }
  addClip(x, y, w, h) {
    const id = "c-" + _SVGPathBuilder.g_clip_id++;
    const clip = new SVGGroup("clipPath");
    clip.attr("id", id);
    clip.rect(x, y, w, h);
    this.m_items.push(clip);
    return id;
  }
  render() {
    let result = [];
    this.m_items.forEach((i) => {
      result.push(i.render());
    });
    return result.join("\n");
  }
};
var SVGPathBuilder = _SVGPathBuilder;
__name(SVGPathBuilder, "SVGPathBuilder");
__publicField(SVGPathBuilder, "g_clip_id", 1);
var SVGComponent = class extends Component {
  constructor(props) {
    super(props);
    this.setTag("svg", "http://www.w3.org/2000/svg");
    this.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    this.setAttributes({
      viewBox: props.viewBox
    });
    this.setContent(props.path);
  }
};
__name(SVGComponent, "SVGComponent");

// src/tabbar.ts
var TabBar = class extends Container {
  m_pages;
  m_curPage;
  constructor(props) {
    super(props);
    this.m_pages = [];
    this.m_curPage = null;
    this.mapPropEvents(props, "change");
    if (props.vertical) {
      this.addClass("@vlayout");
    } else {
      this.addClass("@hlayout");
    }
    this.m_props.pages?.forEach((p) => this.addPage(p));
  }
  componentCreated() {
    if (this.m_props.default) {
      this.select(this.m_props.default, true);
    }
  }
  addPage(page) {
    this.m_pages.push({ ...page });
    this._updateContent();
  }
  render() {
    let buttons = [];
    this.m_pages.forEach((p) => {
      p.btn = new Button({ cls: p === this.m_curPage ? "selected" : "", text: p.title, icon: p.icon, click: () => this._select(p, true) });
      buttons.push(p.btn);
    });
    this.setContent(buttons);
  }
  select(id, notify = false) {
    if (!id) {
      this._select(null, notify);
      return true;
    } else {
      let page = this.m_pages.find((x) => x.id === id);
      if (page) {
        this._select(page, notify);
        return true;
      }
      return false;
    }
  }
  _select(p, notify) {
    if (this.m_curPage == p) {
      return;
    }
    if (!this.dom) {
      this.m_props.default = p.id;
      return;
    }
    if (this.m_curPage) {
      this.m_curPage.btn.removeClass("selected");
      if (this.m_curPage.page) {
        this.m_curPage.page.hide();
      }
    }
    this.m_curPage = p;
    if (notify) {
      this.signal("change", EvChange(p ? p.id : null));
    }
    if (this.m_curPage) {
      this.m_curPage.btn.addClass("selected");
      if (this.m_curPage.page) {
        this.m_curPage.page.show();
      }
    }
  }
  get selection() {
    return this.m_curPage?.page;
  }
};
__name(TabBar, "TabBar");

// src/tabview.ts
var TabView = class extends CardView {
  m_tab_selector;
  m_menu;
  constructor(props) {
    super(props);
    this.m_tab_selector = props.tab_selector ? true : false;
    this.m_menu = props.menu;
    this.addClass("@vlayout");
  }
  /** @ignore */
  render() {
    let tabs = [];
    let pages = [];
    if (this.m_menu) {
      this.m_menu.addClass("@button @tab-btn");
      this.m_menu.removeClass("@menu-item");
      tabs.push(this.m_menu);
    }
    this.m_cards.forEach((p) => {
      tabs.push(p.selector);
      if (!(p.page instanceof Function)) {
        pages.push(p.page);
      }
    });
    if (this.m_tab_selector) {
      pages.unshift(new HLayout({
        cls: "@tab-switch",
        content: tabs
      }));
    }
    this.setContent(pages);
  }
  _updateSelector() {
  }
  _prepareSelector(card) {
    return new Button({
      cls: "@tab-btn",
      text: card.title,
      icon: card.icon,
      click: () => {
        this.switchTo(card.name);
      }
    });
  }
  _preparePage(page) {
    super._preparePage(page);
    if (!page.dom) {
      this.appendChild(page);
    }
  }
};
__name(TabView, "TabView");

// src/textarea.ts
var TextArea = class extends Component {
  constructor(props) {
    super(props);
    this.mapPropEvents(props, "change");
  }
  /** @ignore */
  render(props) {
    props.text = props.text ?? "";
    this.setAttribute("tabindex", props.tabIndex ?? 0);
    if (props.spellcheck === false) {
      this.setAttribute("spellcheck", "false");
    }
    if (props.readOnly !== void 0) {
      this.setAttribute("readonly", props.readOnly);
    }
    if (props.rows) {
      this.setAttribute("rows", props.rows);
    }
    if (props.placeHolder) {
      this.setAttribute("placeholder", props.placeHolder);
    }
    if (props.autoFocus) {
      this.setAttribute("autofocus", props.autoFocus);
    }
    if (props.name) {
      this.setAttribute("name", props.name);
    }
    if (props.autoGrow) {
      this.m_props.autoGrow = true;
      this.setAttribute("rows", this._calcHeight(props.text));
      this.setDomEvent("keydown", () => {
        asap(() => this._updateHeight());
      });
    }
    this.setDomEvent("keydown", (e) => {
      e.stopPropagation();
    });
    this.setTag("textarea");
    this.setDomEvent("input", () => this._change());
  }
  _change() {
    this.emit("change", EvChange(this.value));
  }
  componentCreated() {
    this.value = this.m_props.text;
  }
  get value() {
    if (this.dom) {
      return this.dom.value;
    }
    return this.m_props.text;
  }
  set value(t) {
    this.m_props.text = t ?? "";
    if (this.dom) {
      this.dom.value = this.m_props.text;
      if (this.m_props.autoGrow) {
        this.setAttribute("rows", this._calcHeight(this.m_props.text));
      }
    }
  }
  get text() {
    return this.value;
  }
  set text(text) {
    this.value = text;
  }
  _calcHeight(text) {
    return 1 + (text.match(/\n/g) || []).length;
  }
  _updateHeight() {
    const text = this.value;
    const lines = this._calcHeight(text);
    if (this.getData("lines") != lines) {
      this.setAttribute("rows", lines);
      this.setData("lines", lines);
    }
  }
  /**
   * @deprected use appendText
   * insert text at cursor position
   */
  insertText(text) {
    this.appendText(text);
  }
  /**
   * append the text
   */
  appendText(text) {
    if (this.dom) {
      let dom = this.dom;
      let end = dom.selectionEnd;
      dom.setRangeText(text, end, end, "end");
    }
  }
  replaceText(text) {
    if (this.dom) {
      let dom = this.dom;
      dom.setRangeText(text);
    }
  }
  getSelection() {
    if (this.dom) {
      let dom = this.dom;
      return { start: dom.selectionStart, end: dom.selectionEnd };
    } else {
      return { start: 0, end: 0 };
    }
  }
  setSelection(sel) {
    if (this.dom) {
      let dom = this.dom;
      if (sel.start !== void 0) {
        dom.selectionStart = sel.start;
      }
      if (sel.end !== void 0) {
        dom.selectionEnd = sel.end;
      }
    }
  }
  getStoreValue() {
    return this.value;
  }
  setStoreValue(value) {
    this.value = value;
  }
};
__name(TextArea, "TextArea");

// src/toaster.ts
var Toaster = class extends Popup {
  m_message;
  m_icon;
  constructor(props) {
    super(props);
    this.m_message = props.message;
    this.m_icon = props.icon;
    this.enableMask(false);
    this.addClass("@non-maskable");
  }
  /** @ignore */
  render() {
    this.addClass("@hlayout");
    this.setContent([
      new Label({ icon: this.m_icon, text: this.m_message })
    ]);
  }
  show() {
    this.show = super.show;
    this.displayAt(9999, 9999, "br", { x: 0, y: -24 });
    let opacity = 1;
    this.startTimer("fadeout", 2e3, false, () => {
      this.startTimer("opacity", 100, true, () => {
        this.setStyleValue("opacity", opacity);
        opacity -= 0.1;
        if (opacity < 0) {
          this.dispose();
        }
      });
    });
  }
};
__name(Toaster, "Toaster");

// src/treeview.ts
function EvExpand(node) {
  return BasicEvent({ node });
}
__name(EvExpand, "EvExpand");
var TreeView = class extends VLayout {
  m_view;
  m_container;
  m_selection;
  constructor(props) {
    super(props);
    props.root = props.root;
    props.indent = props.indent ?? 8;
    props.gadgets = props.gadgets;
    props.sort = props.sort ?? false;
    this.m_selection = null;
    this.m_container = new Container({ cls: "@scroll-container" });
    this.m_view = new Container({
      cls: "@scroll-view",
      flex: 1,
      content: this.m_container
    });
    this.setContent([
      this.m_view,
      props.gadgets ? new HLayout({
        cls: "gadgets",
        content: props.gadgets
      }) : null
    ]);
    this.setDomEvent("click", (e) => this._click(e));
    this.setDomEvent("dblclick", (e) => this._click(e));
    this.setDomEvent("contextmenu", (e) => this._handleCtxMenu(e));
    if (props.canDragItems) {
      this.setDomEvent("dragstart", (ev) => {
        let hit = Component.getElement(ev.target, Component);
        let node = hit?.getData("node");
        if (node) {
          ev.dataTransfer.effectAllowed = "move";
          ev.dataTransfer.items.add(JSON.stringify({
            type: "treeview",
            id: node.id
          }), "string");
        } else {
          ev.preventDefault();
          ev.stopPropagation();
        }
      });
      this.setDomEvent("dragover", (ev) => this._dragEnter(ev));
      this.setDomEvent("dragenter", (ev) => this._dragEnter(ev));
      this.setDomEvent("dragend", (ev) => this._dragLeave(ev));
      this.setDomEvent("dragleave", (ev) => this._dragLeave(ev));
      this.setDomEvent("drop", (ev) => this._dragLeave(ev));
      this.setDomEvent("drop", (ev) => this._drop(ev));
    }
    this.mapPropEvents(props, "dblclick", "drag", "selectionchange", "contextMenu");
  }
  _dragEnter(ev) {
    ev.preventDefault();
    let hit = Component.getElement(ev.target, Component);
    let node = hit?.getData("node");
    if (node) {
      hit.addClass("@drag-over");
      ev.dataTransfer.dropEffect = "move";
    }
  }
  _dragLeave(ev) {
    let hit = Component.getElement(ev.target, Component);
    let node = hit?.getData("node");
    if (node) {
      hit.removeClass("@drag-over");
    }
  }
  _drop(ev) {
    let hit = Component.getElement(ev.target, Component);
    let node = hit?.getData("node");
    if (!node) {
      node = this.m_props.root;
    }
    if (node) {
      let parent;
      if (node.children) {
        parent = node;
      } else {
        parent = hit.getData("parent");
      }
      for (let i = 0; i < ev.dataTransfer.items.length; i++) {
        ev.dataTransfer.items[0].getAsString((value) => {
          let data2 = JSON.parse(value);
          this.emit("drag", EvDrag(node, data2, parent));
        });
      }
    }
  }
  render() {
    this.__update();
  }
  __update() {
    if (this.m_props.root) {
      let items = [];
      this._buildBranch(this.m_props.root, -1, items, this.m_props.root);
      this.m_container.setContent(items);
    }
  }
  updateElement(id) {
    const { node: child, item } = this._getNode(id);
    if (child) {
      const pn = child.dom.parentNode;
      const newchild = this._makeNode(item, child.dom.classList.value, child.getData("icon"), child.getData("level"));
      const dm = newchild._build();
      pn.replaceChild(dm, child.dom);
      if (this.m_selection?.el === child) {
        this.m_selection.el = newchild;
      }
    }
  }
  set root(root) {
    this.m_props.root = root;
    this.update();
  }
  openAll(open = true) {
    this.forEach((node) => {
      if (node.children) {
        node.open = open;
      }
    });
    this.__update();
  }
  /**
   * same as root = xxx but keep elements open
   */
  refreshRoot(root) {
    let openList = [];
    this.forEach((node) => {
      if (node.open) {
        openList.push(node.id);
      }
      return false;
    });
    let oldSel = this.selection;
    if (root) {
      this.m_props.root = root;
    }
    this.forEach((node) => {
      if (openList.indexOf(node.id) >= 0) {
        node.open = true;
      }
      return false;
    });
    this.__update();
  }
  _buildBranch(node, level, items, parent) {
    let cls = "@tree-item";
    if (node.cls) {
      cls += " " + node.cls;
    }
    if (!node.open && node.children) {
      cls += " collapsed";
    }
    if (node.children) {
      cls += " folder";
      if (node.children.length == 0) {
        cls += " empty";
      }
    }
    let icon = node.icon;
    if (icon === void 0) {
      if (node.children) {
        if (node.open === true) {
          icon = "var(--x4-icon-chevron-down)";
        } else {
          icon = "var(--x4-icon-chevron-right)";
        }
      }
    }
    if (level >= 0) {
      const item = this._makeNode(node, cls, icon, level);
      if (this.m_selection?.id == node.id) {
        this.m_selection.el = item;
        item.addClass("selected");
      }
      items.push(item);
    }
    if (level == -1 || node.open) {
      if (node.children) {
        if (this.m_props.sort) {
          node.children = node.children.sort((a, b) => {
            let at = (a.children ? "0" + a.text : a.text)?.toLocaleLowerCase();
            let bt = (b.children ? "0" + b.text : b.text)?.toLocaleLowerCase();
            return at < bt ? -1 : at > bt ? 1 : 0;
          });
        }
        node.children.forEach((c) => {
          this._buildBranch(c, level + 1, items, node);
        });
      }
    }
  }
  _renderDef(node) {
    return new Label({ cls: "tree-label", flex: 1, text: node.text });
  }
  _makeNode(node, cls, icon, level) {
    const item = new HLayout({
      cls,
      content: [
        new Icon({ cls: "tree-icon", icon }),
        this.m_props.renderItem ? this.m_props.renderItem(node) : this._renderDef(node)
      ],
      data: {
        "node": node,
        "level": level,
        "icon": icon
      },
      style: {
        paddingLeft: 4 + level * this.m_props.indent
      },
      attrs: {
        draggable: this.m_props.canDragItems ? true : void 0
      }
    });
    return item;
  }
  /**
   * 
   */
  forEach(cb) {
    let found = null;
    function scan(node) {
      if (cb(node) == true) {
        return true;
      }
      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          if (scan(node.children[i])) {
            return true;
          }
        }
      }
    }
    __name(scan, "scan");
    if (this.m_props.root) {
      scan(this.m_props.root);
    }
    return found;
  }
  ensureVisible(id) {
    const { node } = this._getNode(id);
    if (node) {
      node.scrollIntoView();
    }
  }
  set selection(id) {
    this.select(id, false);
  }
  /**
   * care, component should have been created, to select an item at startup,
   * use something like 
   * componentCreated( ) {
   * 	mytree.select( id );
   * }
   */
  select(id, notify = true) {
    if (this.m_selection?.el) {
      this.m_selection.el.removeClass("selected");
    }
    this.m_selection = null;
    if (id !== void 0) {
      const { node: sel } = this._getNode(id);
      if (sel) {
        this.m_selection = {
          id,
          el: sel
        };
        sel.addClass("selected");
        sel.scrollIntoView();
        if (notify) {
          let nd = sel.getData("node");
          this.emit("selectionchange", EvSelectionChange(nd));
        }
      }
    } else {
      if (notify) {
        this.emit("selectionchange", EvSelectionChange(null));
      }
    }
  }
  _getNode(id) {
    let found = { node: null, item: null };
    this.m_container.enumChilds((c) => {
      let node = c.getData("node");
      if (node?.id == id) {
        found = { node: c, item: node };
        return true;
      }
    });
    return found;
  }
  get selection() {
    return this.m_selection?.id;
  }
  getNodeWithId(id) {
    return this.forEach((node) => node.id == id);
  }
  /**
   * 
   */
  _click(ev) {
    let dom = ev.target;
    let idom = dom;
    let onsub = false;
    if (dom.tabIndex !== -1) {
      onsub = true;
    }
    while (dom != this.dom) {
      let el = Component.getElement(dom);
      let nd = el?.getData("node");
      if (nd) {
        if (nd.children && !onsub) {
          if (el.hasClass("selected") || idom.classList.contains("tree-icon")) {
            nd.open = nd.open ? false : true;
          }
          this.m_selection = { id: nd.id, el: null };
          let offset = this.m_view?.dom?.scrollTop;
          this.update();
          if (offset) {
            this.m_view.dom.scrollTo(0, offset);
          }
          this.emit("expand", EvExpand(nd));
        } else {
          this.selection = nd.id;
          if (!onsub) {
            if (ev.type == "click") {
              this.emit("click", EvClick(nd));
            } else {
              this.emit("dblclick", EvDblClick(nd));
            }
          }
        }
        this.emit("selectionchange", EvSelectionChange(nd));
        return;
      }
      dom = dom.parentElement;
    }
    if (ev.type == "click") {
      this.m_selection = null;
      this.update();
      this.emit("selectionchange", EvSelectionChange(null));
    }
  }
  _handleCtxMenu(ev) {
    ev.preventDefault();
    let dom = ev.target;
    let idom = dom;
    while (dom != this.dom) {
      let el = Component.getElement(dom);
      let nd = el?.getData("node");
      if (nd) {
        if (nd.children) {
          if (idom.classList.contains("tree-icon")) {
            return;
          }
        }
        this.selection = nd.id;
        this.emit("click", EvClick(nd));
        this.emit("contextMenu", EvContextMenu(ev, nd));
        return;
      }
      dom = dom.parentElement;
    }
    this.selection = null;
    this.emit("contextMenu", EvContextMenu(ev, null));
  }
  /**
   * constructs a tree node from an array of strings
   * elements are organized like folders (separator = /)
   * @example
   * let root = TreeView.buildFromString( [
   * 	'this/is/a/final/file'
   *  'this/is/another/file'
   * ] );
   */
  static buildFromStrings(paths, separator = "/") {
    let root = {
      id: 0,
      text: "<root>",
      children: []
    };
    function insert(elements, path) {
      let pos = path.indexOf(separator);
      let main = path.substr(0, pos < 0 ? void 0 : pos);
      let elem;
      if (pos >= 0) {
        elem = elements.find((el) => {
          return el.text == main;
        });
      }
      if (!elem) {
        elem = {
          id: path,
          text: main
        };
        elements.push(elem);
      }
      if (pos >= 0) {
        if (!elem.children) {
          elem.children = [];
        }
        insert(elem.children, path.substr(pos + separator.length));
      }
    }
    __name(insert, "insert");
    paths.forEach((path) => {
      insert(root.children, path);
    });
    return root;
  }
  /**
   * constructs a tree node from an array of nodes like
   * node {
   * 	id: number,
   *  parent: number,
   *  name: string
   * }
   */
  static buildFromHierarchy(nodes, cb) {
    let root = {
      id: 0,
      text: "<root>",
      children: []
    };
    let tree_nodes = [];
    function insert(node) {
      let elem;
      let pelem;
      if (node.parent > 0) {
        pelem = tree_nodes.find((tnode) => tnode.id == node.parent);
        if (!pelem) {
          pelem = {
            id: node.parent,
            text: "",
            children: []
          };
          tree_nodes.push(pelem);
        }
        if (!pelem.children) {
          pelem.children = [];
        }
      } else {
        pelem = root;
      }
      elem = tree_nodes.find((tnode) => tnode.id == node.id);
      if (!elem) {
        elem = {
          id: node.id,
          text: node.name,
          parent: node.parent,
          cls: node.cls,
          icon: node.icon,
          data: node.data
        };
        if (!node.leaf) {
          elem.children = [];
        } else {
          elem.icon = null;
        }
      } else {
        elem.text = node.name;
        elem.parent = node.parent;
      }
      tree_nodes.push(elem);
      pelem.children.push(elem);
    }
    __name(insert, "insert");
    nodes.forEach(insert);
    if (cb) {
      tree_nodes.forEach(cb);
    }
    return root;
  }
};
__name(TreeView, "TreeView");

// src/x4react.ts
var createElement = /* @__PURE__ */ __name((clsOrTag, attrs, ...children) => {
  let comp;
  if (clsOrTag == createFragment || clsOrTag == Fragment) {
    return children;
  } else if (clsOrTag instanceof Function) {
    comp = new clsOrTag(attrs);
  } else {
    comp = new Component({
      tag: clsOrTag,
      ...attrs
    });
  }
  if (children && children.length) {
    comp.setContent(children);
  }
  return comp;
}, "createElement");
var Fragment = Symbol("fragment");
var createFragment = /* @__PURE__ */ __name(() => {
  return null;
}, "createFragment");
var React = {
  createElement,
  createFragment,
  Fragment
};
var TSXComponent = class extends Component {
  render(props) {
    const tsx = this.renderTSX(props);
    if (tsx) {
      this.setContent(tsx);
    }
  }
};
__name(TSXComponent, "TSXComponent");

// src/app_sockets.ts
var msg_sent = Symbol("msg_sent");
function setupWSMessaging(closeCB) {
  const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
  const sockets = new WebSocket(`${protocol}${window.location.hostname}:${window.location.port}`, "messaging");
  const app = Application.instance();
  app.on("global", (e) => {
    if (e[msg_sent]) {
      return;
    }
    sockets.send(JSON.stringify({
      msg: e.msg,
      params: e.params
    }));
  });
  sockets.onmessage = (e) => {
    if (e.data != "ping") {
      const message = JSON.parse(e.data);
      message[msg_sent] = true;
      app.signal("global", message);
    }
  };
  sockets.onclose = (ev) => {
    console.log("websocket closed:", ev);
    closeCB();
  };
  sockets.onerror = (ev) => {
    console.log("websocket error:", ev);
  };
}
__name(setupWSMessaging, "setupWSMessaging");

// src/version.ts
var x4js_version = "1.5.36";
export {
  AbsLayout,
  Application,
  AutoComplete,
  AutoLayout,
  AutoRecord,
  BaseButton,
  BaseComponent,
  BasicEvent,
  Button,
  CSSParser,
  Calendar,
  Canvas,
  CardView,
  CheckBox,
  Clipboard,
  Color,
  ColorPicker,
  ColorPickerBox,
  ColorPickerEditor,
  ComboBox,
  Component,
  ComputedStyle,
  Container,
  DataProxy,
  DataStore,
  DataView,
  Dialog,
  EvBtnClick,
  EvCancel,
  EvChange,
  EvClick,
  EvContextMenu,
  EvDataChange,
  EvDblClick,
  EvDrag,
  EvError,
  EvFocus,
  EvGridCheck,
  EvLoaded,
  EvMessage,
  EvMove,
  EvOverlayResize,
  EvSelectionChange,
  EvSize,
  EvTimer,
  EvViewChange,
  EventSource,
  FileUpload,
  Flex,
  Form,
  GridLayout,
  GridView,
  HLayout,
  HtmlString,
  Icon,
  Image2 as Image,
  ImageUpload,
  Input,
  Label,
  Link,
  ListView,
  Masonry,
  Md5,
  Menu,
  MenuBar,
  MenuItem,
  MenuSeparator,
  MenuTitle,
  MessageBox,
  NetworkError,
  Panel,
  Point,
  Popup,
  PopupCalendar,
  PopupListView,
  PromptDialogBox,
  PropertyEditor,
  RadioBtn,
  Rating,
  React,
  Record,
  Rect,
  Router,
  SVGComponent,
  SVGGradient,
  SVGGroup,
  SVGItem,
  SVGPath,
  SVGPathBuilder,
  SVGShape,
  SVGText,
  ScrollView,
  Separator,
  Settings,
  SideBarView,
  Size,
  SizerOverlay,
  Space,
  Spreadsheet,
  Stylesheet,
  TSXComponent,
  TabBar,
  TabView,
  TableLayout,
  TextArea,
  TextEdit,
  Toaster,
  ToggleButton,
  Tooltip,
  TreeView,
  VLayout,
  _date_set_locale,
  _tr,
  _x4_unitless,
  addTranslation,
  ajax,
  ajaxAsJSON,
  ajaxAsText,
  ajaxRequest,
  asap,
  bool_formatter,
  calcAge,
  camelCase,
  clamp,
  classNames,
  crc32,
  createLanguage,
  data,
  date_calc_weeknum,
  date_clone,
  date_diff,
  date_format,
  date_formatter,
  date_hash,
  date_sql_utc,
  date_to_sql,
  deferCall,
  downloadData,
  dragManager,
  drawText,
  escapeHtml,
  flyWrap,
  formatIntlDate,
  generatePassword,
  getAvailableLanguages,
  getCurrentLanguage,
  getMousePos,
  html,
  initTooltips,
  installHMR,
  isArray,
  isFunction,
  isHtmlString,
  isLanguage,
  isLiteralObject,
  isNumber,
  isString,
  isTouchDevice,
  markdownToHtml,
  mix,
  money_formatter,
  money_formatter_nz,
  openFileDialog,
  pad,
  parseIntlDate,
  parseIntlFloat,
  pascalCase,
  removeHtmlTags,
  roundTo,
  saveFileDialog,
  selectLanguage,
  setCurrencySymbol,
  setupWSMessaging,
  sprintf,
  sql_date_formatter,
  waitFontLoading,
  x4app,
  x4js_version
};
/**
*  ___   ___ __
*  \  \_/  /  / _
*   \     /  /_| |_
*   /  _  \____   _|  
*  /__/ \__\   |_|
*        
* @file md5.ts
* @author Etienne Cochard 
* @license
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
//# sourceMappingURL=index.mjs.map
