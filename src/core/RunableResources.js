getJasmineRequireObj().RunableResources = function(j$) {
  class RunableResources {
    constructor(options) {
      this.byRunableId_ = {};
      this.getCurrentRunableId_ = options.getCurrentRunableId;
      this.globalErrors_ = options.globalErrors;

      this.spyFactory = new j$.SpyFactory(
        () => {
          if (this.getCurrentRunableId_()) {
            return this.customSpyStrategies();
          } else {
            return {};
          }
        },
        () => this.defaultSpyStrategy(),
        () => this.makeMatchersUtil()
      );

      this.spyRegistry = new j$.SpyRegistry({
        currentSpies: () => this.spies(),
        createSpy: (name, originalFn) =>
          this.spyFactory.createSpy(name, originalFn)
      });
    }

    initForRunable(runableId, parentId) {
      const newRes = (this.byRunableId_[runableId] = {
        customEqualityTesters: [],
        customMatchers: {},
        customAsyncMatchers: {},
        customSpyStrategies: {},
        customObjectFormatters: [],
        defaultSpyStrategy: undefined,
        spies: []
      });

      const parentRes = this.byRunableId_[parentId];

      if (parentRes) {
        newRes.defaultSpyStrategy = parentRes.defaultSpyStrategy;
        const toClone = [
          'customEqualityTesters',
          'customMatchers',
          'customAsyncMatchers',
          'customObjectFormatters',
          'customSpyStrategies'
        ];

        for (const k of toClone) {
          newRes[k] = j$.util.clone(parentRes[k]);
        }
      }
    }

    clearForRunable(runableId) {
      this.globalErrors_.removeOverrideListener();
      this.spyRegistry.clearSpies();
      delete this.byRunableId_[runableId];
    }

    spies() {
      return this.forCurrentRunable_(
        'Spies must be created in a before function or a spec'
      ).spies;
    }

    defaultSpyStrategy() {
      if (!this.getCurrentRunableId_()) {
        return undefined;
      }

      return this.byRunableId_[this.getCurrentRunableId_()].defaultSpyStrategy;
    }

    setDefaultSpyStrategy(fn) {
      this.forCurrentRunable_(
        'Default spy strategy must be set in a before function or a spec'
      ).defaultSpyStrategy = fn;
    }

    customSpyStrategies() {
      return this.forCurrentRunable_(
        'Custom spy strategies must be added in a before function or a spec'
      ).customSpyStrategies;
    }

    customEqualityTesters() {
      return this.forCurrentRunable_(
        'Custom Equalities must be added in a before function or a spec'
      ).customEqualityTesters;
    }

    customMatchers() {
      return this.forCurrentRunable_(
        'Matchers must be added in a before function or a spec'
      ).customMatchers;
    }

    addCustomMatchers(matchersToAdd) {
      const matchers = this.customMatchers();

      for (const name in matchersToAdd) {
        matchers[name] = matchersToAdd[name];
      }
    }

    customAsyncMatchers() {
      return this.forCurrentRunable_(
        'Async Matchers must be added in a before function or a spec'
      ).customAsyncMatchers;
    }

    addCustomAsyncMatchers(matchersToAdd) {
      const matchers = this.customAsyncMatchers();

      for (const name in matchersToAdd) {
        matchers[name] = matchersToAdd[name];
      }
    }

    customObjectFormatters() {
      return this.forCurrentRunable_(
        'Custom object formatters must be added in a before function or a spec'
      ).customObjectFormatters;
    }

    makePrettyPrinter() {
      return j$.makePrettyPrinter(this.customObjectFormatters());
    }

    makeMatchersUtil() {
      if (this.getCurrentRunableId_()) {
        return new j$.MatchersUtil({
          customTesters: this.customEqualityTesters(),
          pp: this.makePrettyPrinter()
        });
      } else {
        return new j$.MatchersUtil({ pp: j$.basicPrettyPrinter_ });
      }
    }

    forCurrentRunable_(errorMsg) {
      const resources = this.byRunableId_[this.getCurrentRunableId_()];

      if (!resources && errorMsg) {
        throw new Error(errorMsg);
      }

      return resources;
    }
  }

  return RunableResources;
};
