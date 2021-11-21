getJasmineRequireObj().RunnableResources = function(j$) {
  class RunnableResources {
    constructor(getCurrentRunnableId) {
      this.byRunnableId_ = {};
      this.getCurrentRunnableId_ = getCurrentRunnableId;

      this.spyFactory = new j$.SpyFactory(
        () => {
          if (this.getCurrentRunnableId_()) {
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

    initForRunnable(runnableId, parentId) {
      const newRes = (this.byRunnableId_[runnableId] = {
        customEqualityTesters: [],
        customMatchers: {},
        customAsyncMatchers: {},
        customSpyStrategies: {},
        customObjectFormatters: [],
        defaultSpyStrategy: undefined,
        spies: []
      });

      const parentRes = this.byRunnableId_[parentId];

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

    clearForRunnable(runnableId) {
      this.spyRegistry.clearSpies();
      delete this.byRunnableId_[runnableId];
    }

    spies() {
      return this.forCurrentRunnable_(
        'Spies must be created in a before function or a spec'
      ).spies;
    }

    defaultSpyStrategy() {
      if (!this.getCurrentRunnableId_()) {
        return undefined;
      }

      return this.byRunnableId_[this.getCurrentRunnableId_()]
        .defaultSpyStrategy;
    }

    setDefaultSpyStrategy(fn) {
      this.forCurrentRunnable_(
        'Default spy strategy must be set in a before function or a spec'
      ).defaultSpyStrategy = fn;
    }

    customSpyStrategies() {
      return this.forCurrentRunnable_(
        'Custom spy strategies must be added in a before function or a spec'
      ).customSpyStrategies;
    }

    customEqualityTesters() {
      return this.forCurrentRunnable_(
        'Custom Equalities must be added in a before function or a spec'
      ).customEqualityTesters;
    }

    customMatchers() {
      return this.forCurrentRunnable_(
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
      return this.forCurrentRunnable_(
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
      return this.forCurrentRunnable_(
        'Custom object formatters must be added in a before function or a spec'
      ).customObjectFormatters;
    }

    makePrettyPrinter() {
      return j$.makePrettyPrinter(this.customObjectFormatters());
    }

    makeMatchersUtil() {
      if (this.getCurrentRunnableId_()) {
        return new j$.MatchersUtil({
          customTesters: this.customEqualityTesters(),
          pp: this.makePrettyPrinter()
        });
      } else {
        return new j$.MatchersUtil({ pp: j$.basicPrettyPrinter_ });
      }
    }

    forCurrentRunnable_(errorMsg) {
      const resources = this.byRunnableId_[this.getCurrentRunnableId_()];

      if (!resources && errorMsg) {
        throw new Error(errorMsg);
      }

      return resources;
    }
  }

  return RunnableResources;
};
