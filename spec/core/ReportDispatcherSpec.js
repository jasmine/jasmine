describe("ReportDispatcher", function() {

  it("builds an interface of requested methods", function() {
    var dispatcher = new j$.ReportDispatcher(['foo', 'bar', 'baz']);

    expect(dispatcher.foo).toBeDefined();
    expect(dispatcher.bar).toBeDefined();
    expect(dispatcher.baz).toBeDefined();
  });

  it("dispatches requested methods to added reporters", function() {
    var dispatcher = new j$.ReportDispatcher(['foo', 'bar']),
      reporter = jasmine.createSpyObj('reporter', ['foo', 'bar']),
      anotherReporter = jasmine.createSpyObj('reporter', ['foo', 'bar']);

    dispatcher.addReporter(reporter);
    dispatcher.addReporter(anotherReporter);

    dispatcher.foo(123, 456);

    expect(reporter.foo).toHaveBeenCalledWith(123, 456);
    expect(anotherReporter.foo).toHaveBeenCalledWith(123, 456);

    dispatcher.bar('a', 'b');

    expect(reporter.bar).toHaveBeenCalledWith('a', 'b');
    expect(anotherReporter.bar).toHaveBeenCalledWith('a', 'b');
  });

  it("does not dispatch to a reporter if the reporter doesn't accept the method", function() {
    var dispatcher = new j$.ReportDispatcher(['foo']),
      reporter = jasmine.createSpyObj('reporter', ['baz']);

    dispatcher.addReporter(reporter);

    expect(function() {
      dispatcher.foo(123, 456);
    }).not.toThrow();
  });
});