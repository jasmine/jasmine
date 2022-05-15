getJasmineRequireObj().Exactly = function(j$) {
  class Exactly {
    constructor(expected) {
      this.expected_ = expected;
    }

    asymmetricMatch(actual) {
      return actual === this.expected_;
    }

    jasmineToString(pp) {
      return `<jasmine.exactly(${pp(this.expected_)})>`;
    }
  }

  return Exactly;
};
