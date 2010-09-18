---
  layout: default
  title: Jasmine Matchers
---

### Expectation Matchers

Jasmine has several built-in matchers.  Here are a few:

>`expect(x).toEqual(y);` compares objects or primitives `x` and `y` and passes if they are equivalent
>
>`expect(x).toBe(y);` compares objects or primitives `x` and `y` and passes if they are the same object
>
>`expect(x).toMatch(pattern);` compares `x` to string or regular expression `pattern` and passes if they match
>
>`expect(x).toBeDefined();` passes if `x` is not `undefined`
>
>`expect(x).toBeNull();` passes if `x` is `null`
>
>`expect(x).toBeTruthy();` passes if `x` evaluates to true
>
>`expect(x).toBeFalsy();` passes if `x` evaluates to false
>
>`expect(x).toContain(y);` passes if array or string `x` contains `y`
>
>`expect(x).toBeLessThan(y);` passes if `x` is less than `y`
>
>`expect(x).toBeGreaterThan(y);` passes if `x` is greater than `y`
>
>`expect(fn).toThrow(e);` passes if function `fn` throws exception `e` when executed

<small>The old matchers `toNotEqual`, `toNotBe`, `toNotMatch`, and `toNotContain` have been deprecated and will be removed in a future release. Please change your specs to use `not.toEqual`, `not.toBe`, `not.toMatch`, and `not.toContain` respectively.</small>

Every matcher's criteria can be inverted by prepending `.not`:

>`expect(x).not.toEqual(y);` compares objects or primitives `x` and `y` and passes if they are *not* equivalent

#### Writing New Matchers

We've provided a small set of matchers that cover many common situations. However, we recommend that you write custom matchers when you want to assert a more specific sort of expectation. Custom matchers help to document the intent of your specs, and can help to remove code duplication in your specs.

It's extremely easy to create new matchers for your app. A matcher function receives the actual value as `this.actual`, and zero or more arguments may be passed in the function call. The function should return `true` if the actual value passes the matcher's requirements, and `false` if it does not.

Here's the definition of `toBeLessThan()`:

    toBeLessThan: function(expected) {
      return this.actual < expected;
    };

To add the matcher to your suite, call `this.addMatchers()` from within a `before` or `it` block. Call it with an object mapping matcher name to function:

    beforeEach(function() {
      this.addMatchers({
        toBeVisible: function() { return this.actual.isVisible(); }
      });
    });

