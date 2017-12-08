describe("Falsy", function() {
    it("is true for an empty string", function() {
        var falsy = new jasmineUnderTest.Falsy();

        expect(falsy.asymmetricMatch("")).toBe(true);
        expect(falsy.asymmetricMatch('')).toBe(true);
        expect(falsy.asymmetricMatch('asdasdad')).toBe(false);
    });

    it("is false for a number that is 0", function() {
        var falsy = new jasmineUnderTest.Falsy(Number);

        expect(falsy.asymmetricMatch(1)).toBe(false);
        expect(falsy.asymmetricMatch(0)).toBe(true);
        expect(falsy.asymmetricMatch(-23)).toBe(false);
        expect(falsy.asymmetricMatch(-3.1)).toBe(false);
    });

    it("is true for a null or undefined", function() {
        var falsy = new jasmineUnderTest.Falsy(Function);

        expect(falsy.asymmetricMatch(null)).toBe(true);
        expect(falsy.asymmetricMatch(undefined )).toBe(true);
    });

    it("is true for NaN", function() {
        var falsy = new jasmineUnderTest.Falsy(Object);

        expect(falsy.asymmetricMatch(NaN)).toBe(true);
    });

    it("is true for a false Boolean", function() {
        var falsy = new jasmineUnderTest.Falsy(Boolean);

        expect(falsy.asymmetricMatch(false)).toBe(true);
        expect(falsy.asymmetricMatch(true)).toBe(false);
    });
});
