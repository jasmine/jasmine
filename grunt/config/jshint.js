module.exports = {
  options: {
    /* While it's possible that we could be considering unwanted prototype methods, mostly
     * we're doing this because the objects are being used as maps.
     */
    forin: false,

    /* We're fine with functions defined inside loops (setTimeout functions, etc) */
    loopfunc: true
  },
  all: ['src/**/*.js']
};