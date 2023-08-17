'use strict';

(function(env) {
  function domHelpers() {
    let doc;

    if (typeof document !== 'undefined') {
      doc = document;
    } else {
      const JSDOM = require('jsdom').JSDOM;
      const dom = new JSDOM();
      doc = dom.window.document;
    }

    return {
      document: doc,
      createElementWithClassName: function(className) {
        const el = this.document.createElement('div');
        el.className = className;
        return el;
      }
    };
  }

  env.domHelpers = domHelpers;
})(jasmine.getEnv());
