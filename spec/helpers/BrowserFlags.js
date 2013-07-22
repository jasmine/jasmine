function isIE(version) {
  var userAgent = jasmine.getGlobal().navigator.userAgent;
  if (!userAgent) { return; }

  var match = /MSIE ([0-9]{1,}[\.0-9]{0,})/.exec(userAgent);

  return match && version ? parseFloat(match[1]) === version : match;
}