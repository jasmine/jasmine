let jasmineCore;
verifyNoGlobals(() => { jasmineCore = require('../lib/jasmine-core.js'); });
jasmineCore.installGlobals();

const Jasmine = require('jasmine');
const runner = new Jasmine({jasmineCore});

runner.loadConfigFile('./spec/support/jasmine.json');
runner.exitOnCompletion = false;
runner.execute()
  .then(
    result => result.overallStatus === 'passed',
    err => {
      console.error(err);
      return false;
    }
  )
  .then(ok => process.exit(ok ? 0 : 1));

function verifyNoGlobals(fn) {
  const initialGlobals = Object.keys(global);
  fn();

  const extras = Object.keys(global).filter(k => !initialGlobals.includes(k));

  if (extras.length !== 0) {
    throw new Error('Globals were unexpectedly created: ' + extras.join(', '));
  }
}
