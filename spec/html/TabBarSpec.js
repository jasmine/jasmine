describe('TabBar', function() {
  it('initially renders but hides the tabs', function() {
    const subject = new privateUnderTest.TabBar([
      { id: 'tab1', label: 'tab 1' }
    ]);
    const tabs = subject.rootEl.querySelectorAll('.jasmine-tab');
    expect(tabs.length).toEqual(1);
    expect(tabs[0].id).toEqual('tab1');
    expect(tabs[0]).toHaveClass('jasmine-hidden');
    const link = tabs[0].querySelector('a');
    expect(link).toBeTruthy();
    expect(link.textContent).toEqual('tab 1');
  });

  it('does not initially call the onSelect callback', function() {
    const onSelect = jasmine.createSpy('onSelect');
    new privateUnderTest.TabBar([{ id: 'tab1', label: '' }], onSelect);
    expect(onSelect).not.toHaveBeenCalled();
  });

  describe('#showTab', function() {
    it('shows the specified tab', function() {
      const subject = new privateUnderTest.TabBar([
        { id: 'tab1' },
        { id: 'tab2' }
      ]);

      subject.showTab('tab2');

      const tabs = subject.rootEl.querySelectorAll('.jasmine-tab');
      expect(tabs[0]).toHaveClass('jasmine-hidden');
      expect(tabs[1]).not.toHaveClass('jasmine-hidden');
    });

    it('does not hide previously shown tabs', function() {
      const subject = new privateUnderTest.TabBar([
        { id: 'tab1' },
        { id: 'tab2' }
      ]);

      subject.showTab('tab1');
      subject.showTab('tab2');

      const tabs = subject.rootEl.querySelectorAll('.jasmine-tab');
      expect(tabs[0]).not.toHaveClass('jasmine-hidden');
    });
  });

  describe("When a tab's link is clicked", function() {
    it("calls the onSelect callback with the tab's id", function() {
      const onSelect = jasmine.createSpy('onSelect');
      const subject = new privateUnderTest.TabBar(
        [{ id: 'tab1', label: '' }],
        onSelect
      );

      subject.rootEl.querySelector('.jasmine-tab a').click();

      expect(onSelect).toHaveBeenCalledWith('tab1');
    });

    it('shows links on all non-selected tabs only', function() {
      const subject = new privateUnderTest.TabBar(
        [
          { id: 'tab1', label: 'tab 1' },
          { id: 'tab2', label: 'tab 2' },
          { id: 'tab3', label: 'tab 3' }
        ],
        () => {}
      );

      subject.rootEl.querySelectorAll('.jasmine-tab a')[1].click();
      let tabs = subject.rootEl.querySelectorAll('.jasmine-tab');
      expect(tabs[0].querySelector('a'))
        .withContext('tab 1')
        .toBeTruthy();
      expect(tabs[1].querySelector('a'))
        .withContext('tab 1')
        .toBeFalsy();
      expect(tabs[2].querySelector('a'))
        .withContext('tab 1')
        .toBeTruthy();

      subject.rootEl.querySelectorAll('.jasmine-tab a')[0].click();
      tabs = subject.rootEl.querySelectorAll('.jasmine-tab');
      expect(tabs[0].querySelector('a'))
        .withContext('tab 1')
        .toBeFalsy();
      expect(tabs[1].querySelector('a'))
        .withContext('tab 1')
        .toBeTruthy();
      expect(tabs[2].querySelector('a'))
        .withContext('tab 1')
        .toBeTruthy();
    });
  });
});
