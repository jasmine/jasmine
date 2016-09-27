(function(env) {
  function browserVersion(matchFn) {
    var userAgent = jasmine.getGlobal().navigator.userAgent;
    if (!userAgent) { return void 0; }

    var match = matchFn(userAgent);

    return match ? parseFloat(match[1]) : void 0;
  }

  env.ieVersion = browserVersion(function(userAgent) {
    return /MSIE ([0-9]{1,}[\.0-9]{0,})/.exec(userAgent);
  });

  env.safariVersion = browserVersion(function(userAgent) {
    return /Safari/.exec(userAgent) && /Version\/([0-9]{0,})/.exec(userAgent);
  });

  env.firefoxVersion = browserVersion(function(userAgent) {
    return /Firefox\/([0-9]{0,})/.exec(userAgent);
  });

  function hasFunctioningSets() {
    if (typeof Set !== 'undefined') { return false; }

    try {
      var s = new Set([4]);
      if (s.size !== 1) { return false; }
      if (s.values().next().value !== 4) { return false; }
      return true;
    } catch(e) {
      return false;
    }
  }

  env.requireFunctioningSets = function() {
    if (!hasFunctioningSets()) {
      pending("Browser has incomplete or missing support for Sets");
    }
  };

})(jasmine.getEnv());
