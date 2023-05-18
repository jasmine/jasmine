function isEnabled() {
  return true;
}

function isNotEnabled() {
  return false;
}

function setEnable(isEnable) {
  return isEnable;
}

function tenTimes() {
  return 10;
}

function nTimes(n) {
  return n;
}

function getDefaultArgs() {
  return [[2, 3], [4, 4]];
}

function getRandomArgs(d1) {
  let returnArray = [];
  for (let i = 0; i < d1; i++) {
    let a = Math.floor(Math.random() * 10) + 1;
    let b = Math.floor(Math.random() * 10) + 1;

    returnArray.push([a, b]);
  }

  return returnArray;
}

describe('option tests - ', () => {
  oit(
    'repeat 3',
    () => {
      let n = Math.random() * 10;
      if (n < 5) {
        expect(n).toBeLessThan(5);
      } else {
        expect(n).toBeGreaterThanOrEqual(5);
      }
    },
    {
      repeat: {
        value: 3
      }
    }
  );

  oit(
    'enable true',
    () => {
      expect(1).toBe(1);
    },
    {
      enableIf: {
        value: true
      }
    }
  );

  oit(
    'enable false',
    () => {
      expect(1).toBe(1);
    },
    {
      enableIf: {
        value: false
      }
    }
  );

  oit(
    'enable true with function without args',
    () => {
      expect(1).toBe(1);
    },
    {
      enableIf: {
        value: isEnabled
      }
    }
  );

  oit(
    'enable true with function with args',
    () => {
      expect(1).toBe(1);
    },
    {
      enableIf: {
        value: {
          fn: setEnable,
          args: [true]
        }
      }
    }
  );

  oit(
    'enable false with function without args',
    () => {
      expect(1).toBe(1);
    },
    {
      enableIf: {
        value: isNotEnabled
      }
    }
  );

  oit(
    'enable false with function with args',
    () => {
      expect(1).toBe(1);
    },
    {
      enableIf: {
        value: {
          fn: setEnable,
          args: [false]
        }
      }
    }
  );

  oit(
    'enable true and repeat 5',
    () => {
      let n = Math.random() * 10;
      if (n < 5) {
        expect(n).toBeLessThan(5);
      } else {
        expect(n).toBeGreaterThanOrEqual(5);
      }
    },
    {
      enableIf: {
        value: true
      },
      repeat: {
        value: 5
      }
    }
  );

  oit(
    'enable false and repeat 5',
    () => {
      let n = Math.random() * 10;
      if (n < 5) {
        expect(n).toBeLessThan(5);
      } else {
        expect(n).toBeGreaterThanOrEqual(5);
      }
    },
    {
      enableIf: {
        value: false
      },
      repeat: {
        value: 5
      }
    }
  );

  oit(
    'function with args',
    (a, b) => {
      if (a == b) {
        expect(a).toBe(b);
      } else {
        expect(a).not.toBe(b);
      }
    },
    {
      parametersValues: {
        value: [[1, 4], [2, 2], [4, 7]]
      }
    }
  );

  oit(
    'repeat with function without arguments',
    () => {
      expect(1).toBe(1);
    },
    {
      repeat: {
        value: tenTimes
      }
    }
  );

  oit(
    'repeat with functions with arguments',
    () => {
      expect(1).toBe(1);
    },
    {
      repeat: {
        value: {
          fn: nTimes,
          args: [10]
        }
      }
    }
  );

  oit(
    'parameters with function without args',
    (a, b) => {
      if (a != b) {
        expect(a).not.toBe(b);
      } else {
        expect(a).toBe(b);
      }
    },
    {
      parametersValues: {
        value: getDefaultArgs
      }
    }
  );

  oit(
    'parameters with function with args',
    (a, b) => {
      if (a != b) {
        expect(a).not.toBe(b);
      } else {
        expect(a).toBe(b);
      }
    },
    {
      parametersValues: {
        value: {
          fn: getRandomArgs,
          args: [10]
        }
      }
    }
  );

  oit(
    'enable false with repeat 5 and parameters',
    (a, b) => {
      if (a != b) {
        expect(a).not.toBe(b);
      } else {
        expect(a).toBe(b);
      }
    },
    {
      enableIf: {
        value: false
      },
      repeat: {
        value: {
          fn: nTimes,
          args: [5]
        }
      },
      parametersValues: {
        value: [[4, 5], [3, 3], [7, 4]]
      }
    }
  );

  oit(
    'repeat 5 as an unified test',
    () => {
      expect(5).toBe(5);
    },
    {
      repeat: {
        value: 5,
        args: {
          unifiedTest: true
        }
      }
    }
  );

  oit(
    'transpose parameters',
    (a, b) => {
      expect(a).toBe(b);
    },
    {
      parametersValues: {
        value: [[2, 3, 1], [2, 3, 1]],
        args: {
          transposed: true
        }
      }
    }
  );
});
