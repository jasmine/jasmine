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

// Give the wrapping test something to check for, to avoid a false pass if
// the reset process incorrectly installs global error handlers
// eslint-disable-next-line no-console
console.log('ok');
