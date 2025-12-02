jasmineRequire.PerformanceView = function(j$) {
  const createDom = j$.private.htmlReporterUtils.createDom;
  const MAX_SLOW_SPECS = 20;

  class PerformanceView {
    #summary;
    #tbody;

    constructor() {
      this.#tbody = document.createElement('tbody');
      this.#summary = document.createElement('div');
      this.rootEl = createDom(
        'div',
        { className: 'jasmine-performance-view' },
        createDom('h2', {}, 'Performance'),
        this.#summary,
        createDom('h3', {}, 'Slowest Specs'),
        createDom(
          'table',
          {},
          createDom(
            'thead',
            {},
            createDom(
              'tr',
              {},
              createDom('th', {}, 'Duration'),
              createDom('th', {}, 'Spec Name')
            )
          ),
          this.#tbody
        )
      );
    }

    addResults(resultsTree) {
      const specResults = [];
      getSpecResults(resultsTree, specResults);

      if (specResults.length === 0) {
        return;
      }

      specResults.sort(function(a, b) {
        if (a.duration < b.duration) {
          return 1;
        } else if (a.duration > b.duration) {
          return -1;
        } else {
          return 0;
        }
      });

      this.#populateSumary(specResults);
      this.#populateTable(specResults);
    }

    #populateSumary(specResults) {
      const total = specResults.map(r => r.duration).reduce((a, b) => a + b, 0);
      const mean = total / specResults.length;
      const median = specResults[Math.floor(specResults.length / 2)].duration;
      this.#summary.appendChild(
        document.createTextNode(`Mean spec run time: ${mean.toFixed(0)}ms`)
      );
      this.#summary.appendChild(document.createElement('br'));
      this.#summary.appendChild(
        document.createTextNode(`Median spec run time: ${median}ms`)
      );
    }

    #populateTable(specResults) {
      specResults = specResults.slice(0, MAX_SLOW_SPECS);

      for (const r of specResults) {
        this.#tbody.appendChild(
          createDom(
            'tr',
            {},
            createDom('td', {}, `${r.duration}ms`),
            createDom('td', {}, r.fullName)
          )
        );
      }
    }
  }

  function getSpecResults(resultsTree, dest) {
    for (const node of resultsTree.children) {
      if (node.type === 'suite') {
        getSpecResults(node, dest);
      } else if (node.result.status !== 'excluded') {
        dest.push(node.result);
      }
    }
  }

  return PerformanceView;
};
