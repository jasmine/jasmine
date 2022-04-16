module.exports = {
  ignorePatterns: ['support/ci.js', 'support/jasmine-browser.js'],
  rules: {
    // Relax rules for now to allow for the quirks of the test suite
    // TODO: We should probably remove these & fix the resulting errors
    quotes: 'off',
    semi: 'off',
    'key-spacing': 'off',
    'space-before-blocks': 'off',
    'no-trailing-spaces': 'off',
    'block-spacing': 'off',

    // Additionally, check for unused fn args
    // TODO: consider doing this in src files as well as specs
    'no-unused-vars': ['error', { args: 'after-used' }],

    'no-var': 'error',

    // Since linting is done at the end of the process and doesn't stop us
    // from running tests, it makes sense to fail if debugger statements
    // or console references are present.
    'no-debugger': 'error',
    'no-console': 'error'
  }
};
