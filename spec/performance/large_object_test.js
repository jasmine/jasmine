describe('Printing a big object', function(){
  var bigObject;
  function rand(upper) {
    return Math.round(upper * Math.random());
  }

  function generateObject(level) {
    var object = {};

    for (var i = 0; i < 50; i++) {
      var decide = rand(2);
      switch (decide) {
        case 0:
          object["cycle" + i] = object;
        break;
        case 1:
          object["number" + i] = rand(100);
        break;
        case 2:
          if (level < 3) {
          object["nesting" + i] = generateObject(level + 1);
        }
        break;
      }

    }

    return object;
  }

  it('takes a resonable amount of time', function(){
    bigObject = generateObject(0);
    expect(j$.pp(bigObject)).toMatch(/cycle/);
  });
});

