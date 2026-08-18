const jasmineCore = require('jasmine-core');

jasmineCore.installGlobals();
const oldEnv = jasmine.getEnv();

jasmineCore.reset();
const newEnv = jasmine.getEnv();

if (!newEnv) {
  throw new Error('no env after reset');
} else if (newEnv === oldEnv) {
  throw new Error('got old env after reset');
}

// Verify that at least a couple of globals have been correctly bound to the
// new env
describe('a suite', function() {
  it('a spec');
});

const topSuite = newEnv.topSuite();

if (topSuite.children.length !== 1) {
  throw new Error(`expected 1 suite but got ${topSuite.children.length}`);
} else if (topSuite.children[0].description !== 'a suite') {
  throw new Error(
    `expected suite name "a suite" but got "${
      topSuite.children[0].description
    }"`
  );
}

if (topSuite.children[0].children.length !== 1) {
  throw new Error(
    `expected 1 suite but got ${topSuite.children[0].children.length}`
  );
} else if (topSuite.children[0].children[0].description !== 'a spec') {
  throw new Error(
    `expected suite name "a spec" but got "${
      topSuite.children[0].children[0].description
    }"`
  );
}

// Give the wrapping test something to check for, to avoid a false pass if
// the reset process incorrectly installs global error handlers
// eslint-disable-next-line no-console
console.log('ok');
