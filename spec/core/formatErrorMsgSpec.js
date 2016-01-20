describe('formatErrorMsg', function () {

  it('should return a factory', function() {
    expect(typeof jasmineUnderTest.formatErrorMsg).toBe('function');
  });


  describe('Format an error with a domain', function() {

    var formator;

    beforeEach(function() {
      formator = jasmineUnderTest.formatErrorMsg('api');
    });

    it('should format the output', function() {
      expect(formator('message').trim()).toBe('api : message');
      expect(formator('message2').trim()).toBe('api : message2');
    });

  });


  describe('Format an error with a domain and usage', function() {

    var formator;

    beforeEach(function() {
      formator = jasmineUnderTest.formatErrorMsg('api', 'with a param');
    });

    it('should format the output', function() {
      expect(formator('message').trim()).toBe('api : message\nUsage: with a param');
      expect(formator('message2').trim()).toBe('api : message2\nUsage: with a param');
    });

  });

  describe('Format an error with a domain, usage, Tips', function() {

    var formator;

    beforeEach(function() {
      formator = jasmineUnderTest.formatErrorMsg('api', 'with a param', 'you can do it');
    });

    it('should format the output', function() {
      expect(formator('message').trim()).toBe('api : message\nUsage: with a param\nTips: you can do it');
      expect(formator('message2').trim()).toBe('api : message2\nUsage: with a param\nTips: you can do it');
    });

  });

  describe('Format an error with a domain no usage and Tips', function() {

    var formator;

    beforeEach(function() {
      formator = jasmineUnderTest.formatErrorMsg('api', null, 'you can do it');
    });

    it('should format the output', function() {
      expect(formator('message').trim()).toBe('api : message\nTips: you can do it');
      expect(formator('message2').trim()).toBe('api : message2\nTips: you can do it');
    });

  });

});
