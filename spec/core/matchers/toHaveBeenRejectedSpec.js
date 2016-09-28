describe("toHaveBeenRejected", function() {
    it("passes when the promise gets rejected", function() {
        var obj = {
            testPromise: function() {
                return new Promise(function (resolve, reject) {
                    reject();
                });
            }
        };

        obj.testPromise();

        var spyPromise = j$.getEnv().spyPromise(obj, 'testPromise');
        var matcher = j$.matchers.toHaveBeenRejected();
        var result;

        result = matcher.compare(spyPromise);
        expect(result.pass).toBe(true);
    });

    it("fails when the promise does not get rejected", function() {
        var obj = {
            testPromise: function() {
                return new Promise(function (resolve, reject) {});
            }
        };

        obj.testPromise();

        var spyPromise = j$.getEnv().spyPromise(obj, 'testPromise');
        var matcher = j$.matchers.toHaveBeenRejected();
        var result;

        result = matcher.compare(spyPromise);
        expect(result.pass).toBe(false);
    });

    it("fails when the promise gets resolved", function() {
        var obj = {
            testPromise: function() {
                return new Promise(function (resolve, reject) {
                    resolve();
                });
            }
        };

        obj.testPromise();

        var spyPromise = j$.getEnv().spyPromise(obj, 'testPromise');
        var matcher = j$.matchers.toHaveBeenRejected();
        var result;

        result = matcher.compare(spyPromise);
        expect(result.pass).toBe(false);
    });
});

function Promise(startFunction) {
    this.startFunction = startFunction;

    this.startFunction.call(this.startFunction, bind(resolver, this), bind(rejecter, this));

    function bind(func, thisp) {
        var args = Array.prototype.splice(arguments, 0, 2);

        return function() {
            return func.apply(thisp, args);
        };
    }

    function resolver() {
        this.isResolved = true;

        if (typeof this.nextStep === 'function') {
            this.nextStep.apply(this.startFunction, arguments);
        }
    }

    function rejecter() {
        this.isRejected = true;

        if (typeof this.catcher === 'function') {
            this.catcher.apply(this.startFunction, arguments);
        }
    }
}

Promise.prototype = {
    then: function (nextStep) {
        if (this.isResolved) {
            nextStep();
        }
        else {
            this.nextStep = nextStep;
        }
        return this;
    },

    catch: function (catcher) {
        if (this.isRejected) {
            catcher();
        }
        else {
            this.catcher = catcher;
        }
        return this;
    }
};