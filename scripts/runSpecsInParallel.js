const ParallelRunner = require('jasmine/parallel');
const jasmineCore = require('../lib/jasmine-core.js');
let numWorkers = require('os').cpus().length;

if (process.env['CIRCLECI']) {
  // On Circle CI, the above gives the number of CPU cores on the host
  // computer, which is unrelated to the resources actually available
  // to the container. 2 workers gives peak performance with our current
  // configuration, but 4 might increase the odds of discovering any
  // parallel-specific bugs.
  numWorkers = 4;
}

const runner = new ParallelRunner({jasmineCore, numWorkers});

runner.loadConfigFile('./spec/support/jasmine.json')
  .then(() => {
    runner.exitOnCompletion = false;
    return runner.execute();
  })
  .then(
    jasmineDoneInfo => jasmineDoneInfo.overallStatus === 'passed',
    err => {
      console.error(err);
      return false;
    }
  )
  .then(ok => process.exit(ok ? 0 : 1));
