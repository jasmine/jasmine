'use strict';

describe('PerformanceView', function() {
  it('shows specs ordered by execution time', function() {
    const stateBuilder = new privateUnderTest.ResultsStateBuilder();
    stateBuilder.suiteStarted({});
    stateBuilder.specDone({
      fullName: 'spec A',
      duration: 2
    });
    stateBuilder.suiteDone({});
    stateBuilder.specDone({
      fullName: 'spec B',
      duration: 1
    });
    stateBuilder.specDone({
      fullName: 'spec C',
      duration: 3
    });
    const subject = new privateUnderTest.PerformanceView();
    subject.addResults(stateBuilder.topResults);

    const rows = Array.from(subject.rootEl.querySelectorAll('tbody tr'));
    const durations = rows.map(r => r.querySelectorAll('td')[0].textContent);
    const names = rows.map(r => r.querySelectorAll('td')[1].textContent);
    expect(names).toEqual(['spec C', 'spec A', 'spec B']);
    expect(durations).toEqual(['3ms', '2ms', '1ms']);
  });

  it('shows at most 20 specs', function() {
    const stateBuilder = new privateUnderTest.ResultsStateBuilder();
    const subject = new privateUnderTest.PerformanceView();

    for (let i = 0; i < 21; i++) {
      stateBuilder.specDone({
        fullName: `spec ${i}`,
        duration: i
      });
    }

    subject.addResults(stateBuilder.topResults);

    expect(subject.rootEl.querySelectorAll('tbody tr').length).toEqual(20);
    expect(subject.textContent).not.toContain('spec 0');
  });

  it('shows mean and median run times for an odd number of specs', function() {
    const stateBuilder = new privateUnderTest.ResultsStateBuilder();
    const subject = new privateUnderTest.PerformanceView();

    stateBuilder.specDone({ duration: 1 });
    stateBuilder.specDone({ duration: 2 });
    stateBuilder.specDone({ duration: 5 });
    subject.addResults(stateBuilder.topResults);

    expect(subject.rootEl.textContent).toContain('Mean spec run time: 3ms');
    expect(subject.rootEl.textContent).toContain('Median spec run time: 2ms');
  });

  it('shows mean and median run times for an even number of specs', function() {
    const stateBuilder = new privateUnderTest.ResultsStateBuilder();
    const subject = new privateUnderTest.PerformanceView();

    stateBuilder.specDone({ duration: 1 });
    stateBuilder.specDone({ duration: 3 });
    stateBuilder.specDone({ duration: 10 });
    stateBuilder.specDone({ duration: 2 });
    subject.addResults(stateBuilder.topResults);

    expect(subject.rootEl.textContent).toContain('Mean spec run time: 4ms');
    expect(subject.rootEl.textContent).toContain('Median spec run time: 2ms');
  });

  it('copes with 0 specs', function() {
    const stateBuilder = new privateUnderTest.ResultsStateBuilder();
    const subject = new privateUnderTest.PerformanceView();

    expect(function() {
      subject.addResults(stateBuilder.topResults);
    }).not.toThrow();
  });

  it('filters out excluded specs', function() {
    const stateBuilder = new privateUnderTest.ResultsStateBuilder();
    stateBuilder.specDone({
      fullName: 'spec A',
      duration: 2
    });
    stateBuilder.specDone({
      fullName: 'spec B',
      duration: 1,
      status: 'excluded'
    });
    stateBuilder.specDone({
      fullName: 'spec C',
      duration: 3
    });
    const subject = new privateUnderTest.PerformanceView();
    subject.addResults(stateBuilder.topResults);

    const rows = Array.from(subject.rootEl.querySelectorAll('tbody tr'));
    const names = rows.map(r => r.querySelectorAll('td')[1].textContent);
    expect(names).toEqual(['spec C', 'spec A']);
    expect(subject.rootEl.textContent).toContain('Mean spec run time: 3ms');
    expect(subject.rootEl.textContent).toContain('Median spec run time: 2ms');
  });
});
