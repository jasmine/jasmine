describe("base.js", function () {
    describe("jasmine.MessageResult", function () {
        it("#toString should pretty-print and concatenate each part of the message", function () {
            var values = ["log", "message", 123, {key: "value"}, "FTW!"];
            var messageResult = new jasmine.MessageResult(values);
            expect(messageResult.toString()).toEqual("log message 123 { key : 'value' } FTW!");
        });
    });

    describe("jasmine.log", function () {
        it("should accept n arguments", function () {
            spyOn(jasmine.getEnv().currentSpec, 'log');
            jasmine.log(1, 2, 3);
            expect(jasmine.getEnv().currentSpec.log).toHaveBeenCalledWith(1, 2, 3);
        });
    });

    describe("jasmine.getGlobal", function () {
        it("should return the global object", function () {
            var globalObject = (function () {
                return this;
            })();

            expect(jasmine.getGlobal()).toBe(globalObject);
        });
    });

    describe("jasmine.ExpectationResult", function () {
        it("should build an expectation result based on params passed", function () {
            var paramsPassed = {
                    matcherName: 'matcherName',
                    passed: true,
                    expected: true,
                    actual: true,
                    message: 'message'
                },
                paramsFailed = {
                    matcherName: 'matcherName',
                    passed: false,
                    expected: true,
                    actual: false,
                    message: 'message',
                    trace: {
                        message: 'message',
                        stack: 'someLineNumber'
                    }
                },
                expectationResultPassed = new jasmine.ExpectationResult(paramsPassed),
                expectationResultFailed = new jasmine.ExpectationResult(paramsFailed);

            expect(expectationResultPassed.type).toBe('expect');
            expect(expectationResultPassed.passed_).toBe(true);
            expect(expectationResultPassed.expected).toBe(true);
            expect(expectationResultPassed.actual).toBe(true);
            expect(expectationResultPassed.message).toBe('Passed.');
            expect(expectationResultPassed.trace).toBe('');

            expect(expectationResultFailed.type).toBe('expect');
            expect(expectationResultFailed.passed_).toBe(false);
            expect(expectationResultFailed.expected).toBe(true);
            expect(expectationResultFailed.actual).toBe(false);
            expect(expectationResultFailed.message).toBe('message');
            expect(expectationResultFailed.trace).toEqual({
                message: 'message',
                stack: 'someLineNumber'
            });
        });
        it('should replace a failed test with missing trace with a new error object', function () {
            var paramsFailed = {
                    matcherName: 'matcherName',
                    passed: false,
                    expected: true,
                    actual: false,
                    message: 'message'
                },
                expectationResultFailed = new jasmine.ExpectationResult(paramsFailed);

            expect(expectationResultFailed.type).toBe('expect');
            expect(expectationResultFailed.passed_).toBe(false);
            expect(expectationResultFailed.expected).toBe(true);
            expect(expectationResultFailed.actual).toBe(false);
            expect(expectationResultFailed.message).toBe('message');
            expect(expectationResultFailed.trace.message).toBe('message');
            expect(expectationResultFailed.trace.stack).toBeTruthy();
        });
    });
});
