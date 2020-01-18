beforeEach(function() {
  // env is stateful. Ensure that it does not leak between tests.
  jasmineUnderTest.currentEnv_ = null;
});
