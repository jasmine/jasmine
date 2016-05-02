getJasmineRequireObj().RunnableResourceRegistry = function(j$) {
  function RunnableResourceRegistry () {
    var _runnableResources = {};

    this.setDefaultResources = function (id, parentId) {
      _runnableResources[id] = buildDefaultsFor(id, parentId);
    };

    this.remove = function (id) {
      delete _runnableResources[id];
    };

    this.addCustomEqualityTester = function (id, tester) {
      _runnableResources[id].customEqualityTesters.push(tester);
    };

    this.getCustomEqualityTesters = function (id) {
      return _runnableResources[id].customEqualityTesters;
    };

    this.copyCustomMatchers = function (id, matchersObj) {
      var customMatchers = _runnableResources[id].customMatchers;
      for (var matcherName in matchersObj) {
        customMatchers[matcherName] = matchersObj[matcherName];
      }
    };

    this.getCustomMatchers = function (id) {
      return _runnableResources[id].customMatchers;
    };

    this.spies = function (id) {
      return _runnableResources[id].spies;
    };

    function buildDefaultsFor(id, parentId) {
      var resources = {spies: [], customEqualityTesters: [], customMatchers: {}};

      var parentRunnable = _runnableResources[parentId];

      if (parentRunnable){
        resources.customEqualityTesters = j$.util.clone(parentRunnable.customEqualityTesters);
        resources.customMatchers = j$.util.clone(parentRunnable.customMatchers);
      }

      return resources;
    }
  }

  return RunnableResourceRegistry;
};

