jasmineRequire.HtmlSpecFilter = function() {
  // Legacy HTML spec filter, preserved for backward compatibility with
  // boot files that predate HtmlExactSpecFilterV2
  function HtmlSpecFilter(options) {
    let filterString = (options && options.filterString()) || '';

    if (filterString.startsWith('[')) {
      // Convert an HtmlExactSpecFilterV2 string into something we can use
      filterString = JSON.parse(filterString).join(' ');
    }

    filterString = filterString.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

    const filterPattern = new RegExp(filterString);

    this.matches = function(specName) {
      return filterPattern.test(specName);
    };
  }

  return HtmlSpecFilter;
};
