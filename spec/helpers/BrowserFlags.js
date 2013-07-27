(function(env) {
  env.ieVersion = (function() {
    var userAgent = jasmine.getGlobal().navigator.userAgent;
    if (!userAgent) { return Number.MAX_VALUE; }

    var match = /MSIE ([0-9]{1,}[\.0-9]{0,})/.exec(userAgent);

    return match ? parseFloat(match[1]) : Number.MAX_VALUE;
  })();

  env.safariVersion = (function() {
    var userAgent = jasmine.getGlobal().navigator.userAgent;
    if (!userAgent) { return Number.MAX_VALUE; }

    var match = /Safari/.exec(userAgent) && /Version\/([0-9]{0,})/.exec(userAgent);

    return match ? parseFloat(match[1]) : Number.MAX_VALUE;
  })();
})(jasmine.getEnv());
