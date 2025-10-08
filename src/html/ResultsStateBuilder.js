jasmineRequire.ResultsStateBuilder = function(j$) {
  'use strict';

  class ResultsStateBuilder {
    constructor() {
      this.topResults = new j$.private.ResultsNode({}, '', null);
      this.currentParent = this.topResults;
      this.totalSpecsDefined = 0;
      this.specsExecuted = 0;
      this.failureCount = 0;
      this.pendingSpecCount = 0;
      this.deprecationWarnings = [];
    }

    suiteStarted(result) {
      this.currentParent.addChild(result, 'suite');
      this.currentParent = this.currentParent.last();
    }

    suiteDone(result) {
      this.currentParent.updateResult(result);
      this.#addDeprecationWarnings(result, 'suite');

      if (this.currentParent !== this.topResults) {
        this.currentParent = this.currentParent.parent;
      }

      if (result.status === 'failed') {
        this.failureCount++;
      }
    }

    specDone(result) {
      this.currentParent.addChild(result, 'spec');
      this.#addDeprecationWarnings(result, 'spec');

      if (result.status !== 'excluded') {
        this.specsExecuted++;
      }

      if (result.status === 'failed') {
        this.failureCount++;
      }

      if (result.status == 'pending') {
        this.pendingSpecCount++;
      }
    }

    jasmineStarted(result) {
      this.totalSpecsDefined = result.totalSpecsDefined;
    }

    jasmineDone(result) {
      if (result.failedExpectations) {
        this.failureCount += result.failedExpectations.length;
      }

      this.#addDeprecationWarnings(result);
    }

    #addDeprecationWarnings(result, runnableType) {
      if (result.deprecationWarnings) {
        for (const dw of result.deprecationWarnings) {
          this.deprecationWarnings.push({
            message: dw.message,
            stack: dw.stack,
            runnableName: result.fullName,
            runnableType: runnableType
          });
        }
      }
    }
  }

  return ResultsStateBuilder;
};
