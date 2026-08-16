describe('Version number', function() {
  it('is consistent between package.json and build output', function() {
    specHelpers.requiresNode();
    const packageJson = require('../../package.json');
    expect(jasmine.version).toEqual(packageJson.version);
  });
});
