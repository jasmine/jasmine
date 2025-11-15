jasmineRequire.PerformanceView = function(j$) {
  const createDom = j$.private.htmlReporterUtils.createDom;
  const MAX_SLOW_SPECS = 20;

  class PerformanceView {
    #tbody;

    constructor() {
      this.#tbody = document.createElement('tbody');
      this.rootEl = createDom(
        'div',
        { className: 'jasmine-performance-view' },
        createDom('h2', {}, 'Performance'),
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
      let specResults = [];
      getSpecResults(resultsTree, specResults);

      specResults.sort(function(a, b) {
        if (a.duration < b.duration) {
          return 1;
        } else if (a.duration > b.duration) {
          return -1;
        } else {
          return 0;
        }
      });
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
