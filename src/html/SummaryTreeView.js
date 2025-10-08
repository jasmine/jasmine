jasmineRequire.SummaryTreeView = function(j$) {
  'use strict';

  const { createDom, noExpectations } = j$.private.htmlReporterUtils;

  class SummaryTreeView {
    #urlBuilder;
    #filterSpecs;

    constructor(urlBuilder, filterSpecs) {
      this.#urlBuilder = urlBuilder;
      this.#filterSpecs = filterSpecs;
      this.rootEl = createDom('div', {
        className: 'jasmine-summary'
      });
    }

    addResults(resultsTree) {
      this.#addResults(resultsTree, this.rootEl);
    }

    #addResults(resultsTree, domParent) {
      let specListNode;
      for (let i = 0; i < resultsTree.children.length; i++) {
        const resultNode = resultsTree.children[i];
        if (this.#filterSpecs && !hasActiveSpec(resultNode)) {
          continue;
        }
        if (resultNode.type === 'suite') {
          const suiteListNode = createDom(
            'ul',
            { className: 'jasmine-suite', id: 'suite-' + resultNode.result.id },
            createDom(
              'li',
              {
                className:
                  'jasmine-suite-detail jasmine-' + resultNode.result.status
              },
              createDom(
                'a',
                { href: this.#urlBuilder.specHref(resultNode.result) },
                resultNode.result.description
              )
            )
          );

          this.#addResults(resultNode, suiteListNode);
          domParent.appendChild(suiteListNode);
        }
        if (resultNode.type === 'spec') {
          if (domParent.getAttribute('class') !== 'jasmine-specs') {
            specListNode = createDom('ul', {
              className: 'jasmine-specs'
            });
            domParent.appendChild(specListNode);
          }
          let specDescription = resultNode.result.description;
          if (noExpectations(resultNode.result)) {
            specDescription = 'SPEC HAS NO EXPECTATIONS ' + specDescription;
          }
          if (resultNode.result.status === 'pending') {
            if (resultNode.result.pendingReason !== '') {
              specDescription +=
                ' PENDING WITH MESSAGE: ' + resultNode.result.pendingReason;
            } else {
              specDescription += ' PENDING';
            }
          }
          specListNode.appendChild(
            createDom(
              'li',
              {
                className: 'jasmine-' + resultNode.result.status,
                id: 'spec-' + resultNode.result.id
              },
              createDom(
                'a',
                { href: this.#urlBuilder.specHref(resultNode.result) },
                specDescription
              ),
              createDom(
                'span',
                { className: 'jasmine-spec-duration' },
                '(' + resultNode.result.duration + 'ms)'
              )
            )
          );
        }
      }
    }
  }

  function hasActiveSpec(resultNode) {
    if (resultNode.type === 'spec' && resultNode.result.status !== 'excluded') {
      return true;
    }

    if (resultNode.type === 'suite') {
      for (let i = 0, j = resultNode.children.length; i < j; i++) {
        if (hasActiveSpec(resultNode.children[i])) {
          return true;
        }
      }
    }
  }

  return SummaryTreeView;
};
