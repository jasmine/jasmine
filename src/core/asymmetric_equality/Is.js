getJasmineRequireObj().Is = function(j$, private$) {
  'use strict';

  class Is {
    constructor(expected) {
      this.expected_ = expected;
    }

    asymmetricMatch(actual) {
      return actual === this.expected_;
    }

    jasmineToString(pp) {
      return `<jasmine.is(${pp(this.expected_)})>`;
    }
  }

  return Is;
};
