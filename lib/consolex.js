/** Console X
* http://github.com/deadlyicon/consolex.js
*
* By Jared Grippe <jared@jaredgrippe.com>
*
* Copyright (c) 2009 Jared Grippe
* Licensed under the MIT license.
*
* consolex avoids ever having to see javascript bugs in browsers that do not implement the entire
* firebug console suit
*
*/
(function(window) {
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
})(this);