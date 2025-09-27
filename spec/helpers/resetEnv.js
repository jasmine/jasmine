beforeEach(function() {
  // env is stateful. Ensure that it, and its global error event listeners,
  // do not leak between tests.
  if (privateUnderTest.currentEnv_) {
    privateUnderTest.currentEnv_.cleanup_();
    privateUnderTest.currentEnv_ = null;
  }
});
