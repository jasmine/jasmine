define([
  "amd/describe",
  "amd/it",
  "amd/expect",
  "amd/jasmine",
  "amd/env",
  "amd/xdescribe",
  "amd/xit",
  "amd/beforeEach",
  "amd/afterEach",
  "amd/spyOn",
  "amd/clock"
], function(describe, it, expect, jasmine, env, xdescribe, xit, beforeEach, afterEach, spyOn, clock) {
  "use strict";

  describe("jasmine", function() {
    it("should be loaded using AMD", function() {
      expect(jasmine).toBeDefined();
    });
  });

  describe("jasmine environment", function() {
    it("should be loaded using AMD", function() {
      expect(env).toBeDefined();
    });
  });

  describe("jasmine interface", function() {
    it("should be loaded using AMD", function() {
      expect(describe).toBeDefined();
      expect(it).toBeDefined();
      expect(expect).toBeDefined();
      expect(xdescribe).toBeDefined();
      expect(xit).toBeDefined();
      expect(beforeEach).toBeDefined();
      expect(afterEach).toBeDefined();
      expect(spyOn).toBeDefined();
      expect(clock).toBeDefined();
    });
  });
});
