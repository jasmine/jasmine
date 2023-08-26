(function() {
  function browserVersion(matchFn) {
    const userAgent = jasmine.getGlobal().navigator.userAgent;
    if (!userAgent) {
      return void 0;
    }

    const match = matchFn(userAgent);

    return match ? parseFloat(match[1]) : void 0;
  }

  specHelpers.firefoxVersion = browserVersion(function(userAgent) {
    return /Firefox\/([0-9]{0,})/.exec(userAgent);
  });
})();
