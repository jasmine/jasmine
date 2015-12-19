module.exports = {
  beforeConcat: ['src/**/*.js'],
  afterConcat: [
    'lib/jasmine-core/jasmine-html.js',
    'lib/jasmine-core/jasmine.js'
  ],
  options: {
    jshintrc: '.jshintrc'
  },
  all: ['src/**/*.js']
};
