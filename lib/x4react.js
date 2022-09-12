"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.React = void 0;
const component_1 = require("./component");
const createElement = (clsOrTag, attrs, ...children) => {
    let comp;
    // fragment
    if (clsOrTag == createFragment || clsOrTag == Fragment) {
        return children;
    }
    // class constructor, yes : dirty
    else if (clsOrTag instanceof Function) {
        comp = new clsOrTag(attrs);
    }
    // basic tag
    else {
        comp = new component_1.Component({
            tag: clsOrTag,
            ...attrs,
        });
    }
    if (children && children.length) {
        comp.setContent(children);
    }
    return comp;
};
const Fragment = Symbol("fragment");
const createFragment = () => {
    return null;
};
exports.React = {
    createElement,
    createFragment,
    Fragment,
};
