describe('one suite description', function () {
    it('should be a test', function() {
      runs(function () {
        this.expects_that(true).should_equal(true);
      });
    });
  });