getJasmineRequireObj().SpyFactory = function(j$) {

  function SpyObject() {
    this.calls = new j$.CallTracker();
    this.methods = [];
    this.spies = [];
  }

  function SpyFactory(getCustomStrategies) {
    var self = this;
    var spyObj = new SpyObject();

    this.createSpy = function(name, originalFn) {
      var spy = j$.Spy(name, originalFn, getCustomStrategies(), spyObj);
      spyObj.methods.push(name);
      spyObj.spies.push(spy);
      return spy;
    };

    this.createSpyObj = function(baseName, methodNames) {
      var baseNameIsCollection = j$.isObject_(baseName) || j$.isArray_(baseName);

      if (baseNameIsCollection && j$.util.isUndefined(methodNames)) {
        methodNames = baseName;
        baseName = 'unknown';
      }

      var obj = {
        'spies': spyObj
      };
      var spiesWereSet = false;

      if (j$.isArray_(methodNames)) {
        for (var i = 0; i < methodNames.length; i++) {
          obj[methodNames[i]] = this.createSpy(baseName + '.' + methodNames[i]);
          spiesWereSet = true;
        }
      } else if (j$.isObject_(methodNames)) {
        for (var key in methodNames) {
          if (methodNames.hasOwnProperty(key)) {
            obj[key] = this.createSpy(baseName + '.' + key);
            obj[key].and.returnValue(methodNames[key]);
            spiesWereSet = true;
          }
        }
      }

      if (!spiesWereSet) {
        throw 'createSpyObj requires a non-empty array or object of method names to create spies for';
      }

      return obj;
    };
  }

  return SpyFactory;
};
