jasmine.HtmlSpecFilter = function(options) {
  var filterPattern = new RegExp(options && options.filterString());

  this.matches = function(specName) {
    return filterPattern.test(specName);
  };
};