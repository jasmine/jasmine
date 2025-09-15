beforeEach(function() {
  // env is stateful. Ensure that it, and its global error event listeners,
  // do not leak between tests.
  if (jasmineUnderTest.currentEnv_) {
    jasmineUnderTest.currentEnv_.cleanup_();
    jasmineUnderTest.currentEnv_ = null;
  }
});
