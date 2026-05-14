(function() {
  function hasUrlConstructor() {
    try {
      new URL('http://localhost/');
      return true;
    } catch {
      return false;
    }
  }

  specHelpers.requireUrls = function() {
    if (!hasUrlConstructor()) {
      pending('Environment does not support URLs');
    }
  };
})();
