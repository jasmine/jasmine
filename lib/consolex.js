/** Console X
  * http://github.com/deadlyicon/consolex.js
  *
  * prevents console errors and makes IE console objects true functions
  *
  */
(function() {
  window.console || (window.console = {});

  var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
  "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

  function emptyFunction(){}

  for (var i = 0; i < names.length; ++i){
    window.console[names[i]] || (window.console[names[i]] = emptyFunction);
    if (typeof window.console[names[i]] !== 'function')
      window.console[names[i]] = (function(method) {
          return function(){ return Function.prototype.apply.apply(method, [console,arguments]); };
        })(window.console[names[i]]);
  }
})();