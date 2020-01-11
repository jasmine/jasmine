describe("DiffBuilder", function() {
  it("records the actual and expected objects", function() {
    var diffBuilder = jasmineUnderTest.DiffBuilder();
    diffBuilder.record({x: 'actual'}, {x: 'expected'});

    expect(diffBuilder.getMessage()).toEqual("Expected Object({ x: 'actual' }) to equal Object({ x: 'expected' }).");
  });

  it("prints the path at which the difference was found", function() {
    var diffBuilder = jasmineUnderTest.DiffBuilder();

    diffBuilder.withPath('foo', function() {
      diffBuilder.record({x: 'actual'}, {x: 'expected'});
    });

    expect(diffBuilder.getMessage()).toEqual("Expected $.foo = Object({ x: 'actual' }) to equal Object({ x: 'expected' }).");
  });

  it("prints multiple messages, separated by newlines", function() {
    var diffBuilder = jasmineUnderTest.DiffBuilder();

    diffBuilder.withPath('foo', function() {
      diffBuilder.record(1, 2);
    });

    var message =
      "Expected $.foo = 1 to equal 2.\n" +
      "Expected 3 to equal 4.";

    diffBuilder.record(3, 4);
    expect(diffBuilder.getMessage()).toEqual(message);
  });

  it("allows customization of the message", function() {
    var diffBuilder = jasmineUnderTest.DiffBuilder();

    function darthVaderFormatter(actual, expected, path) {
      return "I find your lack of " + expected + " disturbing. (was " + actual + ", at " + path + ")"
    }

    diffBuilder.withPath('x', function() {
      diffBuilder.record('bar', 'foo', darthVaderFormatter);
    });

    expect(diffBuilder.getMessage()).toEqual("I find your lack of foo disturbing. (was bar, at $.x)");
  });

  it("uses the injected pretty-printer", function() {
    var prettyPrinter = function(val) {
        return '|' + val + '|';
      },
      diffBuilder = jasmineUnderTest.DiffBuilder({prettyPrinter: prettyPrinter});

    diffBuilder.withPath('foo', function() {
      diffBuilder.record('actual', 'expected');
    });

    expect(diffBuilder.getMessage()).toEqual("Expected $.foo = |actual| to equal |expected|.");
  });


  it("passes the injected pretty-printer to the diff formatter", function() {
    var diffFormatter = jasmine.createSpy('diffFormatter'),
      prettyPrinter = function() {},
      diffBuilder = jasmineUnderTest.DiffBuilder({prettyPrinter: prettyPrinter});

    diffBuilder.withPath('x', function() {
      diffBuilder.record('bar', 'foo', diffFormatter);
    });

    expect(diffFormatter).toHaveBeenCalledWith('bar', 'foo', jasmine.anything(), prettyPrinter);
  });
});
