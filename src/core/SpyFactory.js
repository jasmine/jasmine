getJasmineRequireObj().SpyFactory = function(j$) {

    function SpyFactory(getCustomStrategies) {
        var self = this;

        this.createSpy = function(name, originalFn) {
            return j$.Spy(name, originalFn, getCustomStrategies());
        };

        this.createSpyObj = function(baseName, methodNames, propertyNames) {
            var baseNameOrMethodNamesAreCollections = j$.isObject_(baseName) || j$.isArray_(baseName) || j$.isObject_(propertyNames) || j$.isArray_(propertyNames);

            if (baseNameOrMethodNamesAreCollections && j$.util.isUndefined(propertyNames)) {
                propertyNames = methodNames;
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

            if (j$.isArray_(propertyNames)) {
                for (var j = 0; j< propertyNames.length; j++) {
                    obj[propertyNames[j]] = self.createSpy(baseName + '.' + propertyNames[j]);
                    spiesWereSet = true;
                }
            } else if (j$.isObject_(propertyNames)) {
                for (var key2 in propertyNames) {
                    if (propertyNames.hasOwnProperty(key2)) {
                        obj[key2] = self.createSpy(baseName + '.' + key2);
                        obj[key2].and.returnValue(propertyNames[key2]);
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
