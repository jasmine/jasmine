jasmineRequire.DomContext = function(j$) {
  'use strict';

  //TODO maybe rename
  class DomContext {
    #createElement;

    constructor(options = {}) {
      this.#createElement =
        options.createElement || document.createElement.bind(document);
      this.createTextNode =
        options.createTextNode || document.createTextNode.bind(document);
    }

    create(type, attrs, childrenArrayOrVarArgs) {
      const el = this.#createElement(type);
      let children;

      if (j$.private.isArray(childrenArrayOrVarArgs)) {
        children = childrenArrayOrVarArgs;
      } else {
        children = [];

        for (let i = 2; i < arguments.length; i++) {
          children.push(arguments[i]);
        }
      }

      for (let i = 0; i < children.length; i++) {
        const child = children[i];

        if (typeof child === 'string') {
          el.appendChild(this.createTextNode(child));
        } else {
          if (child) {
            el.appendChild(child);
          }
        }
      }

      for (const attr in attrs) {
        if (attr === 'className') {
          el[attr] = attrs[attr];
        } else {
          el.setAttribute(attr, attrs[attr]);
        }
      }

      return el;
    }
  }

  return DomContext;
};
