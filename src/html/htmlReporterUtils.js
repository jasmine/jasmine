jasmineRequire.htmlReporterUtils = function(j$) {
  'use strict';

  function createDom(type, attrs, childrenArrayOrVarArgs) {
    const el = document.createElement(type);
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
        el.appendChild(document.createTextNode(child));
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

  function noExpectations(result) {
    const allExpectations =
      result.failedExpectations.length + result.passedExpectations.length;

    return (
      allExpectations === 0 &&
      (result.status === 'passed' || result.status === 'failed')
    );
  }

  return { createDom, noExpectations };
};
