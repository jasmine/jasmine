(function() {
  let doc;

  if (typeof document !== 'undefined') {
    doc = document;
  } else {
    const JSDOM = require('jsdom').JSDOM;
    const dom = new JSDOM();
    doc = dom.window.document;
  }

  specHelpers.domHelpers = {
    document: doc,
    createElementWithClassName(className) {
      const el = this.document.createElement('div');
      el.className = className;
      return el;
    }
  };
})();
