describe("toHaveBeenCalledBefore", function() {
  it("throws an exception when the actual is not a spy", function() {
    var matcher = jasmineUnderTest.matchers.toHaveBeenCalledBefore({
          pp: jasmineUnderTest.makePrettyPrinter()
        }),
        fn = function() {},
        secondSpy = new jasmineUnderTest.Env().createSpy('second spy');

    expect(function() { matcher.compare(fn, secondSpy) }).toThrowError(Error, /Expected a spy, but got Function./);
  });

  it("throws an exception when the expected is not a spy", function() {
    var matcher = jasmineUnderTest.matchers.toHaveBeenCalledBefore({
          pp: jasmineUnderTest.makePrettyPrinter()
        }),
        firstSpy = new jasmineUnderTest.Env().createSpy('first spy'),
        fn = function() {};

    expect(function() { matcher.compare(firstSpy, fn) }).toThrowError(Error, /Expected a spy, but got Function./);
  });

  it("fails when the actual was not called", function() {
    var matcher = jasmineUnderTest.matchers.toHaveBeenCalledBefore(),
        firstSpy = new jasmineUnderTest.Env().createSpy('first spy'),
        secondSpy = new jasmineUnderTest.Env().createSpy('second spy');

    secondSpy();

    result = matcher.compare(firstSpy, secondSpy);
    expect(result.pass).toBe(false);
    expect(result.message).toMatch(/Expected spy first spy to have been called./);
  });

  it("fails when the expected was not called", function() {
    var matcher = jasmineUnderTest.matchers.toHaveBeenCalledBefore(),
        firstSpy = new jasmineUnderTest.Env().createSpy('first spy'),
        secondSpy = new jasmineUnderTest.Env().createSpy('second spy');

    firstSpy();

    result = matcher.compare(firstSpy, secondSpy);
    expect(result.pass).toBe(false);
    expect(result.message).toMatch(/Expected spy second spy to have been called./);
  });

  it("fails when the actual is called after the expected", function() {
    var matcher = jasmineUnderTest.matchers.toHaveBeenCalledBefore(),
        firstSpy = new jasmineUnderTest.Env().createSpy('first spy'),
        secondSpy = new jasmineUnderTest.Env().createSpy('second spy'),
        result;

    secondSpy();
    firstSpy();

    result = matcher.compare(firstSpy, secondSpy);
    expect(result.pass).toBe(false);
    expect(result.message).toEqual('Expected spy first spy to have been called before spy second spy');
  });

	it("fails when the actual is called before and after the expected", function() {
    var matcher = jasmineUnderTest.matchers.toHaveBeenCalledBefore(),
        firstSpy = new jasmineUnderTest.Env().createSpy('first spy'),
        secondSpy = new jasmineUnderTest.Env().createSpy('second spy'),
        result;

    firstSpy();
    secondSpy();
    firstSpy();

    result = matcher.compare(firstSpy, secondSpy);
    expect(result.pass).toBe(false);
    expect(result.message).toEqual('Expected latest call to spy first spy to have been called before first call to spy second spy (no interleaved calls)');
  });

	it("fails when the expected is called before and after the actual", function() {
    var matcher = jasmineUnderTest.matchers.toHaveBeenCalledBefore(),
        firstSpy = new jasmineUnderTest.Env().createSpy('first spy'),
        secondSpy = new jasmineUnderTest.Env().createSpy('second spy'),
        result;

    secondSpy();
    firstSpy();
    secondSpy();

    result = matcher.compare(firstSpy, secondSpy);
    expect(result.pass).toBe(false);
    expect(result.message).toEqual('Expected first call to spy second spy to have been called after latest call to spy first spy (no interleaved calls)');
  });

  it("passes when the actual is called before the expected", function() {
    var matcher = jasmineUnderTest.matchers.toHaveBeenCalledBefore(),
        firstSpy = new jasmineUnderTest.Env().createSpy('first spy'),
        secondSpy = new jasmineUnderTest.Env().createSpy('second spy'),
        result;

    firstSpy();
    secondSpy();

    result = matcher.compare(firstSpy, secondSpy);
    expect(result.pass).toBe(true);
    expect(result.message).toEqual('Expected spy first spy to not have been called before spy second spy, but it was');
  });
});
