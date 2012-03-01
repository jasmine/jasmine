describe("Chained matchers", function() {
  var env, suite;

  beforeEach(function() {
    env = new jasmine.Env();
    env.updateInterval = 0;
    suite = env.describe("suite", function() {});
    env.currentSuite = suite;
  });

  it("works in real life", function() {
    this.addMatchers({
      'toHaveA': function(key) {
        this.valueToCompare = this.actual[key];
        return !!this.valueToCompare;
      },

      'toHaveA withA': function(key) {
        this.valueToCompare = this.valueToCompare[key];
        return !!this.valueToCompare;
      }
    });

    this.addMatchers(["toHaveA", "toHaveA withA"], {
      'ofExactly': function(value) {
        return this.valueToCompare === value;
      },

      'between': function(lowerBound) {
        return this.valueToCompare >= lowerBound;
      },

      'between and': function(upperBound) {
        return this.valueToCompare <= upperBound;
      }
    });

    expect({ height: 12 }).toHaveA("height");
    expect({ height: 12 }).not.toHaveA("width");
    expect({ height: 12 }).toHaveA("height").ofExactly(12);
    expect({ height: 12 }).not.toHaveA("height").ofExactly(20);
    expect({ height: 12 }).toHaveA("height").between(10).and(20);
    expect({ height: 12 }).not.toHaveA("height").between(1).and(10);

    expect({ triangle: { height: 12 } }).toHaveA("triangle").withA("height");
    expect({ triangle: { height: 12 } }).not.toHaveA("triangle").withA("width");
    expect({ triangle: { height: 12 } }).toHaveA("triangle").withA("height").ofExactly(12);
    expect({ triangle: { height: 12 } }).not.toHaveA("triangle").withA("height").ofExactly(24);
    expect({ triangle: { height: 12 } }).toHaveA("triangle").withA("height").between(10).and(20);
    expect({ triangle: { height: 12 } }).not.toHaveA("triangle").withA("height").between(1).and(10);
  });

  describe("ChainedMatchers.makeChainName(prefix, matcherName)", function() {
    describe("when there is no prefix", function() {
      it("returns the matcher name", function() {
        var chainName1 = jasmine.ChainedMatchers.makeChainName("", "toBeCool");
        var chainName2 = jasmine.ChainedMatchers.makeChainName(null, "toBeGrand");
        expect(chainName1).toBe("toBeCool");
        expect(chainName2).toBe("toBeGrand");
      });
    });

    describe("when there is a prefix", function() {
      it("adds the matcherName to the prefix, separated by a space", function() {
        var chainName1 = jasmine.ChainedMatchers.makeChainName("toBeBetween", "and");
        var chainName2 = jasmine.ChainedMatchers.makeChainName("toHaveA between", "and");
        expect(chainName1).toBe("toBeBetween and");
        expect(chainName2).toBe("toHaveA between and");
      });
    });
  });

  describe("ChainedMatchers.parseChainName(chainName)", function() {
    it("returns an object with 2 keys: 'prefix' and 'matcherName'", function() {
      var chain1 = jasmine.ChainedMatchers.parseChainName("toHaveA between and");
      var chain2 = jasmine.ChainedMatchers.parseChainName("toHaveA");

      expect(chain1).toEqual({ prefix: "toHaveA between", matcherName: "and" });
      expect(chain2).toEqual({ prefix: "", matcherName: "toHaveA" });
    });

    it("handles strings with matcher names separated by any number of non-word characters", function() {
      var chain1 = jasmine.ChainedMatchers.parseChainName("toHaveA    between   and");
      var chain2 = jasmine.ChainedMatchers.parseChainName("toHaveA.between.and");
      var chain3 = jasmine.ChainedMatchers.parseChainName("toHaveA/between/and");

      expect(chain1).toEqual({ prefix: "toHaveA between", matcherName: "and" });
      expect(chain2).toEqual({ prefix: "toHaveA between", matcherName: "and" });
      expect(chain3).toEqual({ prefix: "toHaveA between", matcherName: "and" });
    });
  });

  describe("calling #addMatchers with a matchers object whose keys contain multiple matcher names", function() {
    beforeEach(function() {
      env.beforeEach(function() {
        this.addMatchers({
          'toHaveA': function(key) {
            this.valueToCompare = this.actual[key];
            return !!this.valueToCompare;
          },

          'toHaveA ofExactly': function(value) {
            return this.valueToCompare === value;
          },

          'toHaveA between': function(lowerBound) {
            return this.valueToCompare >= lowerBound;
          },

          'toHaveA between and': function(upperBound) {
            return this.valueToCompare <= upperBound;
          }
        });
      });
    });

    itCreatesMatcherMethodsCorrectly();
  });

  describe("calling #addMatchers with a matcher name string and a matchers object", function() {
    beforeEach(function() {
      env.beforeEach(function() {
        this.addMatchers({
          toHaveA: function(key) {
            this.valueToCompare = this.actual[key];
            return !!this.valueToCompare;
          },
        });

        this.addMatchers('toHaveA', {
          ofExactly: function(value) {
            return this.valueToCompare === value;
          },

          between: function(lowerBound) {
            return this.valueToCompare >= lowerBound;
          }
        });

        this.addMatchers('toHaveA between', {
          and: function(upperBound) {
            return this.valueToCompare <= upperBound;
          }
        })
      });
    });

    itCreatesMatcherMethodsCorrectly();
  });

  describe("calling #addMatchers with an array of matcher name strings and a matchers object", function() {
    beforeEach(function() {
      env.beforeEach(function() {
        this.addMatchers({
          toHaveA: function(key) {
            this.valueToCompare = this.actual[key];
            return !!this.valueToCompare;
          },

          'toHaveA withA': function(key) {
            this.valueToCompare = this.valueToCompare[key];
            return !!this.valueToCompare;
          }
        });

        this.addMatchers(["toHaveA", "toHaveA withA"], {
          ofExactly: function(value) {
            return this.valueToCompare === value;
          },

          between: function(lowerBound) {
            return this.valueToCompare >= lowerBound;
          },

          'between and': function(upperBound) {
            return this.valueToCompare <= upperBound;
          }
        });
      });
    });

    itCreatesMatcherMethodsCorrectly();

    it("adds the given matchers to ALL of the named matcher classes", function() {
      var passingResults = resultsOfSpec(function() {
        this.expect({ triangle: { height: 12 } }).toHaveA("triangle");
        this.expect({ triangle: { height: 12 } }).not.toHaveA("square");
        this.expect({ triangle: { height: 12 } }).toHaveA("triangle").withA("height");
        this.expect({ triangle: { height: 12 } }).not.toHaveA("triangle").withA("width");
        this.expect({ triangle: { height: 12 } }).toHaveA("triangle").withA("height").ofExactly(12);
        this.expect({ triangle: { height: 12 } }).not.toHaveA("triangle").withA("height").ofExactly(24);
        this.expect({ triangle: { height: 12 } }).toHaveA("triangle").withA("height").between(10).and(20);
        this.expect({ triangle: { height: 12 } }).not.toHaveA("triangle").withA("height").between(1).and(10);
      });
      var passingItems = passingResults.getItems();

      expect(passingItems.length).toBe(8);
      expect(passingResults.passedCount).toBe(8);
      expect(passingResults.failedCount).toBe(0);

      expect(passingItems[0].passed()).toBeTruthy();
      expect(passingItems[1].passed()).toBeTruthy();
      expect(passingItems[2].passed()).toBeTruthy();
      expect(passingItems[3].passed()).toBeTruthy();
      expect(passingItems[4].passed()).toBeTruthy();
      expect(passingItems[5].passed()).toBeTruthy();
      expect(passingItems[6].passed()).toBeTruthy();
      expect(passingItems[7].passed()).toBeTruthy();

      var failingResults = resultsOfSpec(function() {
        this.expect({ triangle: { height: 12 } }).not.toHaveA("triangle");
        this.expect({ triangle: { height: 12 } }).toHaveA("square");
        this.expect({ triangle: { height: 12 } }).not.toHaveA("triangle").withA("height");
        this.expect({ triangle: { height: 12 } }).toHaveA("triangle").withA("width");
        this.expect({ triangle: { height: 12 } }).not.toHaveA("triangle").withA("height").ofExactly(12);
        this.expect({ triangle: { height: 12 } }).toHaveA("triangle").withA("height").ofExactly(24);
        this.expect({ triangle: { height: 12 } }).not.toHaveA("triangle").withA("height").between(10).and(20);
        this.expect({ triangle: { height: 12 } }).toHaveA("triangle").withA("height").between(1).and(10);
      });
      var failingItems = failingResults.getItems();

      expect(failingItems.length).toBe(8);
      expect(failingResults.passedCount).toBe(0);
      expect(failingResults.failedCount).toBe(8);

      expect(failingItems[0].message).toBe("Expected { triangle : { height : 12 } } not to have a 'triangle'.");
      expect(failingItems[1].message).toBe("Expected { triangle : { height : 12 } } to have a 'square'.");
      expect(failingItems[2].message).toBe("Expected { triangle : { height : 12 } } not to have a 'triangle' with a 'height'.");
      expect(failingItems[3].message).toBe("Expected { triangle : { height : 12 } } to have a 'triangle' with a 'width'.");
      expect(failingItems[4].message).toBe("Expected { triangle : { height : 12 } } not to have a 'triangle' with a 'height' of exactly 12.");
      expect(failingItems[5].message).toBe("Expected { triangle : { height : 12 } } to have a 'triangle' with a 'height' of exactly 24.");
      expect(failingItems[6].message).toBe("Expected { triangle : { height : 12 } } not to have a 'triangle' with a 'height' between 10 and 20.");
      expect(failingItems[7].message).toBe("Expected { triangle : { height : 12 } } to have a 'triangle' with a 'height' between 1 and 10.");
    });
  });

  describe("when some of the matchers define custom messages", function() {
    beforeEach(function() {
      env.beforeEach(function() {
        this.addMatchers({
          toHaveA: function(key) {
            this.valueToCompare = this.actual[key];
            return !!this.valueToCompare;
          },

          toHaveASpecial: function(key) {
            this.message = function() { return ["message for toHaveASpecial", "message for not toHaveASpecial"]; };
            this.valueToCompare = this.actual[key];
            return !!this.valueToCompare;
          }
        });

        this.addMatchers(["toHaveA", "toHaveASpecial"], {
          withA: function(key) {
            this.valueToCompare = this.valueToCompare[key];
            return !!this.valueToCompare;
          },

          withASpecial: function(key) {
            this.message = function() { return ["message for withASpecial", "message for not withASpecial"]; };
            this.valueToCompare = this.valueToCompare[key];
            return !!this.valueToCompare;
          }
        });

        this.addMatchers([ "toHaveA withA", "toHaveA withASpecial", "toHaveASpecial withA", "toHaveASpecial withASpecial" ], {
          thatIs: function(value) {
            return this.valueToCompare === value;
          },

          thatIsEspecially: function(value) {
            this.message = function() { return ["message for thatIsEspecially", "message for not thatIsEspecially"]; };
            return this.valueToCompare === value;
          }
        });
      });
    });

    describe("when the last matcher in a chain has a custom message", function() {
      it("uses the custom message", function() {
        var results = resultsOfSpec(function() {
          this.expect({ song: { melody: 'sad' } }).toHaveA("song").withASpecial('harmony');
          this.expect({ song: { melody: 'sad' } }).not.toHaveA("song").withASpecial('melody');
          this.expect({ song: { melody: 'sad' } }).toHaveA("song").withA('melody').thatIsEspecially('happy');
          this.expect({ song: { melody: 'sad' } }).not.toHaveA("song").withA('melody').thatIsEspecially('sad');
        });
        var items = results.getItems();

        expect(items.length).toBe(4);
        expect(results.passedCount).toBe(0);
        expect(results.failedCount).toBe(4);

        expect(items[0].message).toBe("message for withASpecial");
        expect(items[1].message).toBe("message for not withASpecial");
        expect(items[2].message).toBe("message for thatIsEspecially");
        expect(items[3].message).toBe("message for not thatIsEspecially");
      });
    });

    describe("when the last matcher in the chain does not have a custom message", function() {
      it("uses a message based on the chain of matcher names", function() {
        var results = resultsOfSpec(function() {
          this.expect({ song: { melody: 'sad' } }).toHaveASpecial("song").withA('harmony');
          this.expect({ song: { melody: 'sad' } }).not.toHaveASpecial("song").withA('melody');
          this.expect({ song: { melody: 'sad' } }).toHaveASpecial("song").withASpecial('melody').thatIs("happy");
          this.expect({ song: { melody: 'sad' } }).not.toHaveASpecial("song").withASpecial('melody').thatIs("sad");
        });
        var items = results.getItems();

        expect(items.length).toBe(4);
        expect(results.passedCount).toBe(0);
        expect(results.failedCount).toBe(4);

        expect(items.length).toBe(4);
        expect(items[0].message).toBe("Expected { song : { melody : 'sad' } } to have a special 'song' with a 'harmony'.");
        expect(items[1].message).toBe("Expected { song : { melody : 'sad' } } not to have a special 'song' with a 'melody'.");
        expect(items[2].message).toBe("Expected { song : { melody : 'sad' } } to have a special 'song' with a special 'melody' that is 'happy'.");
        expect(items[3].message).toBe("Expected { song : { melody : 'sad' } } not to have a special 'song' with a special 'melody' that is 'sad'.");
      });
    });
  });

  function itCreatesMatcherMethodsCorrectly() {
    describe("the return value of a matcher function", function() {
      describe("when no further chained matchers have been added", function() {
        var unchainableMatcherValue1, unchainableMatcherValue2, unchainableMatcherValue3;

        beforeEach(function() {
          env.it("spec", function() {
            unchainableMatcherValue1 = this.expect({ height: 12 }).toBeTruthy();
            unchainableMatcherValue2 = this.expect({ height: 12 }).toHaveA('height').ofExactly(10);
            unchainableMatcherValue3 = this.expect({ height: 12 }).toHaveA('height').between(10).and(20);
          });

          suite.execute();
        });

        it("is undefined", function() {
          expect(unchainableMatcherValue1).toBeUndefined();
          expect(unchainableMatcherValue2).toBeUndefined();
          expect(unchainableMatcherValue3).toBeUndefined();
        });
      });

      describe("when further chained matchers have been added", function() {
        var expectValue, chainableMatcherValue1, chainableMatcherValue2;

        beforeEach(function() {
          env.it("spec", function() {
            expectValue              = this.expect({ height: 12 });
            chainableMatcherValue1   = this.expect({ height: 12 }).toHaveA('height');
            chainableMatcherValue2   = this.expect({ height: 12 }).toHaveA('height').between(10);
          });

          suite.execute();
        });

        it("has methods for each of the chained matchers", function() {
          expect(typeof chainableMatcherValue1.ofExactly).toBe("function");
          expect(typeof chainableMatcherValue1.between).toBe("function");
          expect(typeof chainableMatcherValue2.and).toBe("function");
        });

        it("does not have the same methods as other matchers", function() {
          expect(chainableMatcherValue2.ofExactly).toBeUndefined();
          expect(chainableMatcherValue2.between).toBeUndefined();
        });

        it("does not have the normal top-level matcher methods", function() {
          expect(chainableMatcherValue1.toBe).toBeUndefined();
          expect(chainableMatcherValue2.toBe).toBeUndefined();
          expect(chainableMatcherValue1.toEqual).toBeUndefined();
          expect(chainableMatcherValue2.toEqual).toBeUndefined();
        });

        it("has the same env and spec as the parent matcher object", function() {
          expect(chainableMatcherValue1.env).toBe(expectValue.env);
          expect(chainableMatcherValue2.env).toBe(expectValue.env);
          expect(chainableMatcherValue1.spec).toBe(expectValue.spec);
          expect(chainableMatcherValue2.spec).toBe(expectValue.spec);
        });

        it("does NOT have a 'not' property (nots are only allowed at the beginning of a matcher chain)", function() {
          expect(chainableMatcherValue1['not']).toBeUndefined();
          expect(chainableMatcherValue2['not']).toBeUndefined();
        });

        it("keeps any properties that are set on 'this' by earlier matcher functions", function() {
          expect(chainableMatcherValue1.valueToCompare).toBe(12);
          expect(chainableMatcherValue1.valueToCompare).toBe(12);
        });
      });
    });

    describe("when matchers are chained without a 'not'", function() {
      var results, items;

      describe("when any of the matchers in the chain do *not* match", function() {
        beforeEach(function() {
          results = resultsOfSpec(function() {
            this.expect({ height: 3 }).toHaveA("width").ofExactly(3);
            this.expect({ height: 3 }).toHaveA("height").ofExactly(5);
            this.expect({ height: 3 }).toHaveA("height").between(1).and(2);
          });
          items = results.getItems();
        });

        it("adds one failure to the spec's results", function() {
          expect(items.length).toBe(3);
          expect(results.passedCount).toBe(0);
          expect(results.failedCount).toBe(3);

          expect(items[0].passed()).toBeFalsy();
          expect(items[1].passed()).toBeFalsy();
          expect(items[2].passed()).toBeFalsy();
        });

        it("builds a failure message from the complete chain of matchers", function() {
          expect(items[0].message).toBe("Expected { height : 3 } to have a 'width' of exactly 3.");
          expect(items[1].message).toBe("Expected { height : 3 } to have a 'height' of exactly 5.");
          expect(items[2].message).toBe("Expected { height : 3 } to have a 'height' between 1 and 2.");
        });

        it("builds a trace with the right message", function() {
          expect(items[0].trace instanceof Error).toBeTruthy();
          expect(items[1].trace instanceof Error).toBeTruthy();
          expect(items[2].trace instanceof Error).toBeTruthy();

          expect(items[0].trace.message).toBe(items[0].message);
          expect(items[1].trace.message).toBe(items[1].message);
          expect(items[2].trace.message).toBe(items[2].message);
        });
      });

      describe("when all of the matchers match", function() {
        it("adds one success to the spec's results", function() {
          results = resultsOfSpec(function() {
            this.expect({ height: 3 }).toHaveA("height").ofExactly(3);
            this.expect({ height: 3 }).toHaveA("height").between(2).and(5);
          });
          items = results.getItems();

          expect(items.length).toBe(2);
          expect(results.passedCount).toBe(2);
          expect(results.failedCount).toBe(0);

          expect(items[0].passed()).toBeTruthy();
          expect(items[1].passed()).toBeTruthy();
          expect(items[0].message).toBe("Passed.");
          expect(items[1].message).toBe("Passed.");
        });
      });
    });

    describe("when matchers are chained, starting with a 'not'", function() {
      var results, items;

      describe("when any of the matchers in the chain do *not* match", function() {
        it("adds a single success to the spec's results", function() {
          results = resultsOfSpec(function() {
            this.expect({ height: 3 }).not.toHaveA("width").ofExactly(3);
            this.expect({ height: 3 }).not.toHaveA("height").ofExactly(5);
            this.expect({ height: 3 }).not.toHaveA("height").between(5).and(10);
            this.expect({ height: 3 }).not.toHaveA("height").between(10).and(20);
          });
          items = results.getItems();

          expect(results.passedCount).toBe(4);
          expect(items.length).toBe(4);

          expect(items[0].passed()).toBeTruthy();
          expect(items[1].passed()).toBeTruthy();
          expect(items[2].passed()).toBeTruthy();
          expect(items[3].passed()).toBeTruthy();
          expect(items[0].message).toBe("Passed.");
          expect(items[1].message).toBe("Passed.");
          expect(items[2].message).toBe("Passed.");
          expect(items[3].message).toBe("Passed.");
        });
      });

      describe("when all of the matchers match", function() {
        beforeEach(function() {
          results = resultsOfSpec(function() {
            this.expect({ height: 3 }).not.toHaveA("height").ofExactly(3);
            this.expect({ height: 3 }).not.toHaveA("height").between(2).and(4);
          });
          items = results.getItems();
        });

        it("adds a single failure to the spec's results", function() {
          expect(items.length).toBe(2);
          expect(results.passedCount).toBe(0);
          expect(results.failedCount).toBe(2);

          expect(items[0].passed()).toBeFalsy();
          expect(items[1].passed()).toBeFalsy();
        });

        it("builds a failure message from the complete chain of matchers", function() {
          expect(items[0].message).toBe("Expected { height : 3 } not to have a 'height' of exactly 3.");
          expect(items[1].message).toBe("Expected { height : 3 } not to have a 'height' between 2 and 4.");
        });

        it("builds a trace with the right message", function() {
          expect(items[0].trace instanceof Error).toBeTruthy();
          expect(items[1].trace instanceof Error).toBeTruthy();

          expect(items[0].trace.message).toBe(items[0].message);
          expect(items[1].trace.message).toBe(items[1].message);
        });
      });
    });
  }

  function resultsOfSpec(specFunction) {
    var spec = env.it("spec", specFunction);
    suite.execute();
    return spec.results();
  }
});
