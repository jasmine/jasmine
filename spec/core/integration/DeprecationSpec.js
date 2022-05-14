/* eslint no-console: 0 */
describe('Deprecation (integration)', function() {
  let env;

  beforeEach(function() {
    env = new jasmineUnderTest.Env();
  });

  afterEach(function() {
    env.cleanup_();
  });

  it('reports a deprecation on the top suite', async function() {
    const reporter = jasmine.createSpyObj('reporter', ['jasmineDone']);
    env.addReporter(reporter);
    spyOn(console, 'error');

    env.beforeAll(function() {
      env.deprecated('the message');
    });
    env.it('a spec', function() {});

    await env.execute();

    expect(reporter.jasmineDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        deprecationWarnings: [
          jasmine.objectContaining({
            message: jasmine.stringMatching(/^the message/)
          })
        ]
      })
    );
    expect(console.error).toHaveBeenCalledWith(
      jasmine.stringMatching(/^DEPRECATION: the message/)
    );
  });

  it('reports a deprecation on a descendent suite', async function() {
    const reporter = jasmine.createSpyObj('reporter', ['suiteDone']);
    env.addReporter(reporter);
    spyOn(console, 'error');

    env.describe('a suite', function() {
      env.beforeAll(function() {
        env.deprecated('the message');
      });
      env.it('a spec', function() {});
    });

    await env.execute();

    expect(reporter.suiteDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        deprecationWarnings: [
          jasmine.objectContaining({
            message: jasmine.stringMatching(/^the message/)
          })
        ]
      })
    );
    expect(console.error).toHaveBeenCalledWith(
      jasmine.stringMatching(/^DEPRECATION: the message \(in suite: a suite\)/)
    );
  });

  it('reports a deprecation on a spec', async function() {
    const reporter = jasmine.createSpyObj('reporter', ['specDone']);
    env.addReporter(reporter);
    spyOn(console, 'error');

    env.describe('a suite', function() {
      env.it('a spec', function() {
        env.deprecated('the message');
      });
    });

    await env.execute();

    expect(reporter.specDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        deprecationWarnings: [
          jasmine.objectContaining({
            message: jasmine.stringMatching(/^the message/)
          })
        ]
      })
    );
    expect(console.error).toHaveBeenCalledWith(
      jasmine.stringMatching(
        /^DEPRECATION: the message \(in spec: a suite a spec\)/
      )
    );
  });

  it('omits the suite or spec context when ignoreRunnable is true', async function() {
    const reporter = jasmine.createSpyObj('reporter', ['jasmineDone']);
    env.addReporter(reporter);
    spyOn(console, 'error');

    env.it('a spec', function() {
      env.deprecated('the message', { ignoreRunnable: true });
    });

    await env.execute();

    expect(reporter.jasmineDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        deprecationWarnings: [
          jasmine.objectContaining({
            message: jasmine.stringMatching(/^the message/)
          })
        ]
      })
    );
    expect(console.error).toHaveBeenCalledWith(
      jasmine.stringMatching(/the message/)
    );
    expect(console.error).not.toHaveBeenCalledWith(
      jasmine.stringMatching(/a spec/)
    );
  });

  it('includes the stack trace', async function() {
    const reporter = jasmine.createSpyObj('reporter', ['specDone']);
    env.addReporter(reporter);
    spyOn(console, 'error');

    env.describe('a suite', function() {
      env.it('a spec', function() {
        env.deprecated('the message');
      });
    });

    await env.execute();

    expect(reporter.specDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        deprecationWarnings: [
          jasmine.objectContaining({
            stack: jasmine.stringMatching(/DeprecationSpec.js/)
          })
        ]
      })
    );
    expect(console.error).toHaveBeenCalled();
    expect(console.error.calls.argsFor(0)[0].replace(/\n/g, 'NL')).toMatch(
      /^DEPRECATION: the message \(in spec: a suite a spec\)NL.*DeprecationSpec.js/
    );
  });

  it('excludes the stack trace when omitStackTrace is true', async function() {
    const reporter = jasmine.createSpyObj('reporter', ['specDone']);
    env.addReporter(reporter);
    spyOn(console, 'error');

    env.describe('a suite', function() {
      env.it('a spec', function() {
        env.deprecated('the message', { omitStackTrace: true });
      });
    });

    await env.execute();

    expect(reporter.specDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        deprecationWarnings: [
          jasmine.objectContaining({
            stack: jasmine.falsy()
          })
        ]
      })
    );
    expect(console.error).toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalledWith(
      jasmine.stringMatching(/DeprecationSpec.js/)
    );
  });

  it('emits a given deprecation only once', async function() {
    const reporter = jasmine.createSpyObj('reporter', [
      'specDone',
      'suiteDone'
    ]);
    env.addReporter(reporter);
    spyOn(console, 'error');

    env.describe('a suite', function() {
      env.beforeAll(function() {
        env.deprecated('the message');
        env.deprecated('the message');
      });

      env.it('a spec', function() {
        env.deprecated('the message');
        env.deprecated('a different message');
      });
    });

    await env.execute();

    expect(reporter.suiteDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        deprecationWarnings: [
          // only one
          jasmine.objectContaining({
            message: jasmine.stringMatching(/^the message/)
          })
        ]
      })
    );
    expect(reporter.specDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        deprecationWarnings: [
          // only the other one
          jasmine.objectContaining({
            message: jasmine.stringMatching(/^a different message/)
          })
        ]
      })
    );
    expect(console.error).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenCalledWith(
      jasmine.stringMatching(/^DEPRECATION: the message \(in suite: a suite\)/)
    );
    expect(console.error).toHaveBeenCalledWith(
      jasmine.stringMatching(
        /^DEPRECATION: a different message \(in spec: a suite a spec\)/
      )
    );
  });

  it('emits a given deprecation each time when config.verboseDeprecations is true', async function() {
    const reporter = jasmine.createSpyObj('reporter', [
      'specDone',
      'suiteDone'
    ]);
    env.addReporter(reporter);
    spyOn(console, 'error');

    env.configure({ verboseDeprecations: true });

    env.describe('a suite', function() {
      env.beforeAll(function() {
        env.deprecated('the message');
        env.deprecated('the message');
      });

      env.it('a spec', function() {
        env.deprecated('the message');
      });
    });

    await env.execute();

    expect(reporter.suiteDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        deprecationWarnings: [
          jasmine.objectContaining({
            message: jasmine.stringMatching(/^the message/)
          }),
          jasmine.objectContaining({
            message: jasmine.stringMatching(/^the message/)
          })
        ]
      })
    );
    expect(reporter.specDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        deprecationWarnings: [
          jasmine.objectContaining({
            message: jasmine.stringMatching(/^the message/)
          })
        ]
      })
    );
    expect(console.error).toHaveBeenCalledTimes(3);
    expect(console.error.calls.argsFor(0)[0]).toMatch(
      /^DEPRECATION: the message \(in suite: a suite\)/
    );
    expect(console.error.calls.argsFor(1)[0]).toMatch(
      /^DEPRECATION: the message \(in suite: a suite\)/
    );
    expect(console.error.calls.argsFor(2)[0]).toMatch(
      /^DEPRECATION: the message \(in spec: a suite a spec\)/
    );
    expect(console.error.calls.argsFor(2)[0]).toMatch(
      /^DEPRECATION: the message \(in spec: a suite a spec\)/
    );
  });

  it('handles deprecations that occur before execute() is called', async function() {
    const reporter = jasmine.createSpyObj('reporter', ['jasmineDone']);
    env.addReporter(reporter);
    spyOn(console, 'error');

    env.deprecated('the message');
    env.it('a spec', function() {});

    await env.execute();

    expect(reporter.jasmineDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        deprecationWarnings: [
          jasmine.objectContaining({
            message: jasmine.stringMatching(/^the message/)
          })
        ]
      })
    );
    expect(console.error).toHaveBeenCalledWith(
      jasmine.stringMatching(/^DEPRECATION: the message/)
    );
  });
});
