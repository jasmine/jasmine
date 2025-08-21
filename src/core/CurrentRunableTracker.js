getJasmineRequireObj().CurrentRunableTracker = function() {
  class CurrentRunableTracker {
    #currentSpec;
    #currentlyExecutingSuites;

    constructor() {
      this.#currentlyExecutingSuites = [];
    }

    currentRunable() {
      return this.currentSpec() || this.currentSuite();
    }

    currentSpec() {
      return this.#currentSpec;
    }

    setCurrentSpec(spec) {
      this.#currentSpec = spec;
    }

    currentSuite() {
      return this.#currentlyExecutingSuites[
        this.#currentlyExecutingSuites.length - 1
      ];
    }

    pushSuite(suite) {
      this.#currentlyExecutingSuites.push(suite);
    }

    popSuite() {
      this.#currentlyExecutingSuites.pop();
    }
  }

  return CurrentRunableTracker;
};
