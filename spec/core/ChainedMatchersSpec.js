describe("Chained matchers", function() {
  var env, suite;

  beforeEach(function() {
    env = new jasmine.Env();
    env.updateInterval = 0;
    suite = env.describe("suite", function() {});
    env.currentSuite = suite;

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
});
