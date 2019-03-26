const sass = require('node-sass');

module.exports = {
  options: {
    implementation: sass,
    outputStyle: 'compact',
    sourceComments: false
  },
  dist: {
    files: {
      "lib/jasmine-core/jasmine.css": "src/html/jasmine.scss"
    }
  }
};
