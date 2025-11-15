jasmineRequire.TabBar = function(j$) {
  const createDom = j$.private.htmlReporterUtils.createDom;

  class TabBar {
    #tabs;
    #onSelectTab;

    // tabSpecs should be an array of {id, label}.
    // All tabs are initially not visible and not selected.
    constructor(tabSpecs, onSelectTab) {
      this.#onSelectTab = onSelectTab;
      this.#tabs = [];
      this.#tabs = tabSpecs.map(ts => new Tab(ts, () => this.selectTab(ts.id)));

      this.rootEl = createDom(
        'span',
        { className: 'jasmine-menu jasmine-bar' },
        this.#tabs.map(t => t.rootEl)
      );
    }

    showTab(id) {
      for (const tab of this.#tabs) {
        if (tab.rootEl.id === id) {
          tab.setVisibility(true);
        }
      }
    }

    selectTab(id) {
      for (const tab of this.#tabs) {
        tab.setSelected(tab.rootEl.id === id);
      }

      this.#onSelectTab(id);
    }
  }

  class Tab {
    #spec;
    #onClick;

    constructor(spec, onClick) {
      this.#spec = spec;
      this.#onClick = onClick;
      this.rootEl = createDom(
        'span',
        { id: spec.id, className: 'jasmine-tab jasmine-hidden' },
        this.#createLink()
      );
    }

    setVisibility(visible) {
      this.rootEl.classList.toggle('jasmine-hidden', !visible);
    }

    setSelected(selected) {
      if (selected) {
        this.rootEl.textContent = this.#spec.label;
      } else {
        this.rootEl.textContent = '';
        this.rootEl.appendChild(this.#createLink());
      }
    }

    #createLink() {
      const link = createDom('a', { href: '#' }, this.#spec.label);
      link.addEventListener('click', e => {
        e.preventDefault();
        this.#onClick();
      });
      return link;
    }
  }

  return TabBar;
};
