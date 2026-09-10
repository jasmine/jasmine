describe('long string failure diagnostics', function() {
  'use strict';

  let originalLimit;

  beforeEach(function() {
    originalLimit = jasmineUnderTest.MAX_PRETTY_PRINT_CHARS;
  });

  afterEach(function() {
    jasmineUnderTest.MAX_PRETTY_PRINT_CHARS = originalLimit;
  });

  function equalResult(actual, expected, pp) {
    const util = new privateUnderTest.MatchersUtil({
      pp: pp || privateUnderTest.makePrettyPrinter()
    });
    return privateUnderTest.matchers.toEqual(util).compare(actual, expected);
  }

  function strictMessage(actual, expected, pp, isNot) {
    const util = new privateUnderTest.MatchersUtil({
      pp: pp || privateUnderTest.makePrettyPrinter()
    });
    return util.buildFailureMessage('toBe', !!isNot, actual, expected);
  }

  function expectCompleteSurrogates(text) {
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code >= 0xd800 && code <= 0xdbff) {
        const next = text.charCodeAt(++i);
        expect(next >= 0xdc00 && next <= 0xdfff).toBeTrue();
      } else {
        expect(code < 0xdc00 || code > 0xdfff).toBeTrue();
      }
    }
  }

  for (const budget of [8, 16, 32, 80, 128, 1000, 2048]) {
    it(
      'shows the first hidden difference with a budget of ' + budget,
      function() {
        jasmineUnderTest.MAX_PRETTY_PRINT_CHARS = budget;
        const prefix = 'a'.repeat(5000);
        const suffix = 'b'.repeat(5000);
        const result = equalResult(
          prefix + 'Q' + suffix,
          prefix + 'Z' + suffix
        );

        expect(result.pass).toBeFalse();
        expect(result.message).toContain('Q');
        expect(result.message).toContain('Z');
        expect(result.message.length).toBeLessThanOrEqual(2 * budget + 20);
      }
    );
  }

  for (const difference of [74, 75]) {
    it('handles the visible boundary at index ' + difference, function() {
      jasmineUnderTest.MAX_PRETTY_PRINT_CHARS = 80;
      const actual = 'a'.repeat(difference) + 'Q' + 'b'.repeat(100);
      const expected = 'a'.repeat(difference) + 'Z' + 'b'.repeat(100);
      const pp = privateUnderTest.makePrettyPrinter();
      const message = equalResult(actual, expected).message;

      expect(message).toContain('Q');
      expect(message).toContain('Z');
      if (difference === 74) {
        expect(message).toEqual(
          'Expected ' + pp(actual) + ' to equal ' + pp(expected) + '.'
        );
      }
    });
  }

  it('shows an inserted suffix', function() {
    const prefix = 'a'.repeat(5000);
    expect(equalResult(prefix, prefix + 'Z').message).toContain('Z');
  });

  it('shows a deleted suffix', function() {
    const prefix = 'a'.repeat(5000);
    expect(equalResult(prefix + 'Q', prefix).message).toContain('Q');
  });

  it('preserves the nested path', function() {
    const prefix = 'a'.repeat(5000);
    const result = equalResult(
      { rows: [prefix + 'Q'] },
      { rows: [prefix + 'Z'] }
    );

    expect(result.message).toContain('Expected $.rows[0] = ');
    expect(result.message).toContain('Q');
    expect(result.message).toContain('Z');
  });

  it('supports strict equality failure messages', function() {
    const prefix = 'a'.repeat(5000);
    const message = strictMessage(prefix + 'Q', prefix + 'Z');

    expect(message).toContain('Q');
    expect(message).toContain('Z');
    expect(message).toContain(' to be ');
  });

  it('handles boxed strings without changing equality decisions', function() {
    const prefix = 'a'.repeat(5000);
    const result = equalResult(
      new String(prefix + 'Q'),
      new String(prefix + 'Z')
    );

    expect(result.pass).toBeFalse();
    expect(result.message).toContain('Q');
    expect(result.message).toContain('Z');
  });

  for (const budget of [8, 32, 33, 80, 1000]) {
    it('keeps surrogate pairs intact with a budget of ' + budget, function() {
      jasmineUnderTest.MAX_PRETTY_PRINT_CHARS = budget;
      const prefix = '😀'.repeat(3000);
      const suffix = '😀'.repeat(1000);
      const result = equalResult(
        prefix + '😃' + suffix,
        prefix + '😄' + suffix
      );

      expect(result.message).toContain('😃');
      expect(result.message).toContain('😄');
      expectCompleteSurrogates(result.message);
      expect(result.message.length).toBeLessThanOrEqual(2 * budget + 20);
    });
  }

  it('does not shorten values that fit the budget', function() {
    const actual = 'a'.repeat(900) + 'Q';
    const expected = 'a'.repeat(900) + 'Z';
    const pp = privateUnderTest.makePrettyPrinter();

    expect(equalResult(actual, expected).message).toEqual(
      'Expected ' + pp(actual) + ' to equal ' + pp(expected) + '.'
    );
  });

  it('preserves already-visible differences', function() {
    const actual = 'Q' + 'a'.repeat(5000);
    const expected = 'Z' + 'a'.repeat(5000);
    const pp = privateUnderTest.makePrettyPrinter();

    expect(equalResult(actual, expected).message).toEqual(
      'Expected ' + pp(actual) + ' to equal ' + pp(expected) + '.'
    );
  });

  it('preserves empty-string diagnostics', function() {
    const expected = 'a'.repeat(5000);
    const pp = privateUnderTest.makePrettyPrinter();
    expect(equalResult('', expected).message).toEqual(
      "Expected '' to equal " + pp(expected) + '.'
    );
  });

  it('does not invent a difference for equal strings', function() {
    const value = 'a'.repeat(5000);
    const pp = privateUnderTest.makePrettyPrinter();

    expect(equalResult(value, value).pass).toBeTrue();
    expect(strictMessage(value, value, pp, true)).toEqual(
      'Expected ' + pp(value) + ' not to be ' + pp(value) + '.'
    );
  });

  for (const budget of [0, 1, 4, 7, Infinity]) {
    it('preserves existing formatting for a budget of ' + budget, function() {
      jasmineUnderTest.MAX_PRETTY_PRINT_CHARS = budget;
      const actual = 'a'.repeat(5000) + 'Q';
      const expected = 'a'.repeat(5000) + 'Z';
      const pp = privateUnderTest.makePrettyPrinter();

      expect(equalResult(actual, expected).message).toEqual(
        'Expected ' + pp(actual) + ' to equal ' + pp(expected) + '.'
      );
    });
  }

  it('preserves injected pretty-printers and their argument lists', function() {
    const actual = 'a'.repeat(5000) + 'Q';
    const expected = 'a'.repeat(5000) + 'Z';
    const pp = jasmine
      .createSpy('pp')
      .and.returnValues('<actual>', '<expected>');
    pp.customFormat_ = function() {};

    expect(equalResult(actual, expected, pp).message).toEqual(
      'Expected <actual> to equal <expected>.'
    );
    expect(pp.calls.allArgs()).toEqual([[actual], [expected]]);
  });

  for (const matcher of ['toEqual', 'toBe']) {
    it('preserves one-sided custom formatting for ' + matcher, function() {
      const actual = 'a'.repeat(5000) + 'Q';
      const expected = 'a'.repeat(5000) + 'Z';
      const formatter = jasmine
        .createSpy('formatter')
        .and.callFake(function(value) {
          return value === actual ? '<actual>' : undefined;
        });
      const pp = privateUnderTest.makePrettyPrinter([formatter]);
      const ordinary = privateUnderTest.makePrettyPrinter();
      const message =
        matcher === 'toEqual'
          ? equalResult(actual, expected, pp).message
          : strictMessage(actual, expected, pp);

      expect(message).toEqual(
        'Expected <actual> to ' +
          (matcher === 'toEqual' ? 'equal' : 'be') +
          ' ' +
          ordinary(expected) +
          '.'
      );
      expect(formatter.calls.allArgs()).toEqual(
        matcher === 'toEqual'
          ? [[actual], [expected], [expected]]
          : [[actual], [expected]]
      );
    });

    it('honors custom formatting for ' + matcher, function() {
      const actual = 'a'.repeat(5000) + 'Q';
      const expected = 'a'.repeat(5000) + 'Z';
      const formatter = jasmine
        .createSpy('formatter')
        .and.callFake(function(value) {
          return value === actual ? '<actual>' : '<expected>';
        });
      const pp = privateUnderTest.makePrettyPrinter([formatter]);
      const message =
        matcher === 'toEqual'
          ? equalResult(actual, expected, pp).message
          : strictMessage(actual, expected, pp);

      expect(message).toEqual(
        'Expected <actual> to ' +
          (matcher === 'toEqual' ? 'equal' : 'be') +
          ' <expected>.'
      );
      expect(formatter.calls.allArgs()).toEqual([[actual], [expected]]);
    });

    it(
      'never passes shortened values to custom formatters for ' + matcher,
      function() {
        const actual = 'a'.repeat(5000) + 'Q';
        const expected = 'a'.repeat(5000) + 'Z';
        const formatter = jasmine
          .createSpy('formatter')
          .and.returnValue(undefined);
        const pp = privateUnderTest.makePrettyPrinter([formatter]);
        const message =
          matcher === 'toEqual'
            ? equalResult(actual, expected, pp).message
            : strictMessage(actual, expected, pp);

        expect(message).toContain('Q');
        expect(message).toContain('Z');
        expect(formatter.calls.allArgs()).toEqual(
          matcher === 'toEqual'
            ? [[actual], [expected], [actual], [expected]]
            : [[actual], [expected]]
        );
      }
    );
  }

  it('preserves jasmineToString hooks', function() {
    const actual = new String('a'.repeat(5000) + 'Q');
    const expected = new String('a'.repeat(5000) + 'Z');
    actual.jasmineToString = function() {
      return '<actual>';
    };
    expected.jasmineToString = function() {
      return '<expected>';
    };

    expect(equalResult(actual, expected).message).toEqual(
      'Expected <actual> to equal <expected>.'
    );
  });

  it('leaves other matcher predicates alone', function() {
    const actual = 'a'.repeat(5000) + 'Q';
    const expected = 'a'.repeat(5000) + 'Z';
    const util = new privateUnderTest.MatchersUtil();

    expect(
      util.buildFailureMessage('toContain', false, actual, expected)
    ).toEqual(
      'Expected ' + util.pp(actual) + ' to contain ' + util.pp(expected) + '.'
    );
  });
});
