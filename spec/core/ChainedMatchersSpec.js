describe("Chained matchers", function() {

  describe(".makeChainName(prefix, matcherName)", function() {
    describe("when there is no prefix", function() {
      it("returns the matcher name", function() {
        var chainName1 = jasmine.ChainedMatchers.makeChainName("", "toBeCool");
        expect(chainName1).toBe("toBeCool");
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

  describe(".parseMatchers(matchersHash)", function() {
    var matchersHash, parsedMatchers;

    beforeEach(function() {
      matchersHash = {
        "toHaveA":                                function() {},
        "toHaveA ofExactly":                      function() {},
        "toHaveA withA":                          function() {},
        "toHaveA withA ofExactly":                function() {},
        "toHaveA withA ofAtLeast":                function() {},
        "toHaveBeenCalled after":                 function() {},
        "toHaveBeenCalled before":                function() {},
        "toHaveBeenCalled atLeast times":         function() {},
        "toHaveBeenCalled atLeast secondsBefore": function() {},
        "toHaveBeenCalled atLeast secondsAfter":  function() {}
      };

      parsedMatchers = jasmine.ChainedMatchers.parseMatchers(matchersHash);
    });

    it("has two keys: 'topLevel' and 'chained', both of which are objects", function() {
      expect(parsedMatchers).toEqual({
        topLevel: jasmine.any(Object),
        chained:  jasmine.any(Object)
      });
    });

    it("puts matchers with single-word keys into the 'topLevel' object", function() {
      expect(parsedMatchers.topLevel).toEqual({
        toHaveA: matchersHash.toHaveA,
        toHaveBeenCalled: matchersHash.toHaveBeenCalled,
      });
    });

    it("groups the remaining methods by their prefix, in the 'chained' object", function() {
      expect(parsedMatchers.chained).toEqual({
        "toHaveA": {
          ofExactly: matchersHash["toHaveA ofExactly"],
          withA:     matchersHash["toHaveA withA"]
        },

        "toHaveA withA": {
          ofExactly: matchersHash["toHaveA withA ofExactly"],
          ofAtLeast: matchersHash["toHaveA withA ofAtLeast"]
        },

        "toHaveBeenCalled": {
          after:  matchersHash["toHaveBeenCalled after"],
          before: matchersHash["toHaveBeenCalled before"]
        },

        "toHaveBeenCalled atLeast": {
          times:         matchersHash["toHaveBeenCalled atLeast times"],
          secondsAfter:  matchersHash["toHaveBeenCalled atLeast secondsAfter"],
          secondsBefore: matchersHash["toHaveBeenCalled atLeast secondsBefore"]
        }
      });
    });

    it("handles key names containing '$' and '_'", function() {
      matchersHash = {
        "to_be_in$ane": function() {},
        "to_be_in$ane and_awe$ome": function() {},
        "to_be_in$ane and_a$tounding": function() {},
        "to_be_in$ane and_a$tounding beyond_compare": function() {},
      };

      expect(jasmine.ChainedMatchers.parseMatchers(matchersHash)).toEqual({
        topLevel: {
          to_be_in$ane: matchersHash["to_be_in$ane"]
        },

        chained: {
          "to_be_in$ane": {
            and_awe$ome:    matchersHash["to_be_in$ane and_awe$ome"],
            and_a$tounding: matchersHash["to_be_in$ane and_a$tounding"]
          },

          "to_be_in$ane and_a$tounding": {
            beyond_compare: matchersHash["to_be_in$ane and_a$tounding beyond_compare"]
          }
        }
      });
    });
  });

  describe("Spec#addMatchers", function() {
    var env, suite;

    beforeEach(function() {
      env = new jasmine.Env();
      env.updateInterval = 0;
      suite = env.describe("suite", function() {});
      env.currentSuite = suite;
    });

    describe("with a matchers object whose keys contain multiple matcher names", function() {
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

    describe("with a matcher name string and a matchers object", function() {
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

    describe("with an array of matcher name strings and a matchers object", function() {
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
    }
  });
});
