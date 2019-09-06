(function(env) {
  function domHelpers() {
    var doc;

    if (typeof document !== 'undefined') {
      doc = document;
    } else {
      var JSDOM = require('jsdom').JSDOM;
      var dom = new JSDOM();
      doc = dom.window.document;
    }

    return {
      document: doc,
      createElementWithClassName: function(className) {
        var el = this.document.createElement('div');
        el.className = className;
        return el;
      }
    };
  }

  env.domHelpers = domHelpers;
})(jasmine.getEnv());
