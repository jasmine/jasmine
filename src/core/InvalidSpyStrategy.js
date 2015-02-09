getJasmineRequireObj().InvalidSpyStrategy = function() {
    var InvalidSpyStrategy = function () {
        var raiseImproperUsage = function () {
          throw new Error('and-style chaining cannot be used with createSpyObj, use createSpy instead');
        };

        return {
            identity: raiseImproperUsage,
            exec: raiseImproperUsage,
            callThrough: raiseImproperUsage,
            returnValue: raiseImproperUsage,
            returnValues: raiseImproperUsage,
            throwError: raiseImproperUsage,
            callFake: raiseImproperUsage,
            stub: raiseImproperUsage
        };
    };

    return InvalidSpyStrategy;
};
