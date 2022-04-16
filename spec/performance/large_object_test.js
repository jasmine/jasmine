describe('Printing a big object', function() {
  function rand(upper) {
    return Math.round(upper * Math.random());
  }

  function generateObject(level) {
    const object = {};

    for (let i = 0; i < 50; i++) {
      const decide = rand(2);
      switch (decide) {
        case 0:
          object['cycle' + i] = object;
          break;
        case 1:
          object['number' + i] = rand(100);
          break;
        case 2:
          if (level < 3) {
            object['nesting' + i] = generateObject(level + 1);
          }
          break;
      }
    }

    return object;
  }

  it('takes a reasonable amount of time', function() {
    const bigObject = generateObject(0);
    expect(jasmineUnderTest.pp(bigObject)).toMatch(/cycle/);
  });
});
