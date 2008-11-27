// NOTE: we're using JSpec to test-drive Jasmine.  Any syntax
//       similarities should be ignored.  THIS FILE uses JSpec

with(JSpec('Jasmine expectation results')) {

  it('should compare actual and expected values that are equal', function(){
    var jasmine_result = expects(true).should_equal(true);

    expects_that(jasmine_result).should_equal(true).and_finish();
  });

  it('should compare actual and expected values that are NOT equal', function(){
    var jasmine_result = expects(false).should_equal(true);

    expects_that(jasmine_result).should_equal(false).and_finish();
  });

  it('should be able to store the results of assertions', function(){
    Jasmine = jasmine_init(); // re-clears out Jasmine

    expects(true).should_equal(true);
    expects(false).should_equal(true);

    expects_that(Jasmine.results.length).should_equal(2);
    expects_that(Jasmine.results[0].passed).should_equal(true);
    expects_that(Jasmine.results[1].passed).should_equal(false).and_finish();
  });

  it('should store a message with a failed expectation', function(){
    Jasmine = jasmine_init(); // re-clears out Jasmine

    expects(false).should_equal(true);

    var expected_message = 'Expected true but got false.';
    expects_that(Jasmine.results[0].message).should_equal(expected_message).and_finish();
  });

  it('should store a default message with a passed expectation', function(){
    Jasmine = jasmine_init();

    expects(true).should_equal(true);

    var expected_message = 'Passed.';
    expects_that(Jasmine.results[0].message).should_equal(expected_message).and_finish();
  });

}

with(JSpec('Jasmine specs')){

  it('can have a description', function(){
    Jasmine = jasmine_init();

    var a_spec = spec('new spec');
    expects_that(a_spec.description).should_equal('new spec').and_finish();
  });

  it('can execute some statements & expectations', function(){
    Jasmine = jasmine_init();

    var a_spec = spec('new spec', function() {
      var foo = 'bar';
      expects(foo).should_equal('bar');
    });

    a_spec.execute();

    expects_that(Jasmine.results.length).should_equal(1)
    expects_that(Jasmine.results[0].passed).should_equal(true).and_finish();
  });
}
//  it('should return true if all of its results are true', function(){
//  });

//  it('can have multiple assertions', function(){
//
//   var jasmine = Jasmine();
//   jasmine.expects_that(true).should_equal(true);
//
//   var expected_message = 'Passed.';
//   expects_that(jasmine.results[0].message).should_equal(expected_message).and_finish();
//
// });

//}


//with(JSpec('Test runner')) {
//
//  it('should run a test and collect a result', function(){
//
//
//
//
//  });
//
//  expects_that(actual).should_equal(expected)u;
//
//
//
//}