module.exports = {
  ignorePatterns: ['support/ci.js', 'support/jasmine-browser.js'],
  rules: {
    // Relax rules for now to allow for the quirks of the test suite
    // TODO: We should probably remove these & fix the resulting errors
    quotes: 'off',
    semi: 'off',
    'key-spacing': 'off',
    'space-before-blocks': 'off',
    'no-unused-vars': 'off',
    'no-trailing-spaces': 'off',
    'block-spacing': 'off'
  }
};
