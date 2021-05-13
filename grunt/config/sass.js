const sass = require('sass');

module.exports = {
  options: {
    implementation: sass,
    sourceComments: false
  },
  dist: {
    files: {
      "lib/jasmine-core/jasmine.css": "src/html/jasmine.scss"
    }
  }
};
