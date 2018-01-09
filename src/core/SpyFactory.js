getJasmineRequireObj().SpyFactory = function(j$) {

  function SpyFactory() {
    var self = this;

    this.createSpy = function(name, originalFn) {
      return j$.Spy(name, originalFn);
    };
  
    this.createSpyObj = function(baseName, methodNames) {
      var baseNameIsCollection = j$.isObject_(baseName) || j$.isArray_(baseName);
  
      if (baseNameIsCollection && j$.util.isUndefined(methodNames)) {
        methodNames = baseName;
        baseName = 'unknown';
      }
   
      var obj = {};
      var spiesWereSet = false;
   
      if (j$.isArray_(methodNames)) {
        for (var i = 0; i < methodNames.length; i++) {
          obj[methodNames[i]] = self.createSpy(baseName + '.' + methodNames[i]);
          spiesWereSet = true;
        }
      } else if (j$.isObject_(methodNames)) {
        for (var key in methodNames) {
          if (methodNames.hasOwnProperty(key)) {
            obj[key] = self.createSpy(baseName + '.' + key);
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
