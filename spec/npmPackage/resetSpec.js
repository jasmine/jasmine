const { exec } = require('child_process');

describe('reset', function() {
  it('replaces the current env', async function() {
    // Do the actual reset call in another process, to avoid clobbering the
    // global state of the jasmine we're running in.\
    const { exitCode, stdout, stderr } = await runNodeScript(
      './spec/fixtures/reset.js'
    );
    expect(exitCode).toEqual(0);
    expect(stdout)
      .withContext('stdout')
      .toEqual('ok\n');
    jasmine.debugLog('stderr: ' + stderr);
  });

  function runNodeScript(scriptPath) {
    return new Promise((resolve, reject) => {
      const cmd = `node "${scriptPath}"`;
      jasmine.debugLog('Command: ' + cmd);
      exec(cmd, function(err, stdout, stderr) {
        try {
          resolve({
            exitCode: err ? err.code : 0,
            stdout,
            stderr
          });
        } catch (e) {
          reject(e);
        }
      });
    });
  }
});
