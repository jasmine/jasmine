getJasmineRequireObj().asymmetricEqualityTesterArgCompatShim = function(j$) {
  /*
    Older versions of Jasmine passed an array of custom equality testers as the
    second argument to each asymmetric equality tester's `asymmetricMatch`
    method. Newer versions will pass a `MatchersUtil` instance. The
    asymmetricEqualityTesterArgCompatShim allows for a graceful migration from
    the old interface to the new by "being" both an array of custom equality
    testers and a `MatchersUtil` at the same time.

    This code should be removed in the next major release.
   */

  var likelyArrayProps = [
    'concat',
    'constructor',
    'copyWithin',
    'entries',
    'every',
    'fill',
    'filter',
    'find',
    'findIndex',
    'flat',
    'flatMap',
    'forEach',
    'includes',
    'indexOf',
    'join',
    'keys',
    'lastIndexOf',
    'length',
    'map',
    'pop',
    'push',
    'reduce',
    'reduceRight',
    'reverse',
    'shift',
    'slice',
    'some',
    'sort',
    'splice',
    'toLocaleString',
    'toSource',
    'toString',
    'unshift',
    'values'
  ];

  function asymmetricEqualityTesterArgCompatShim(
    matchersUtil,
    customEqualityTesters
  ) {
    var self = Object.create(matchersUtil),
      props,
      i,
      k;

    copy(self, customEqualityTesters, 'length');

    for (i = 0; i < customEqualityTesters.length; i++) {
      copy(self, customEqualityTesters, i);
    }

    var props = arrayProps();

    for (i = 0; i < props.length; i++) {
      k = props[i];
      if (k !== 'length') {
        copy(self, Array.prototype, k);
      }
    }

    return self;
  }

  function copy(dest, src, propName) {
    Object.defineProperty(dest, propName, {
      get: function() {
        return src[propName];
      }
    });
  }

  function arrayProps() {
    var props, a, k;

    if (!Object.getOwnPropertyDescriptors) {
      return likelyArrayProps.filter(function(k) {
        return Array.prototype.hasOwnProperty(k);
      });
    }

    props = Object.getOwnPropertyDescriptors(Array.prototype); // eslint-disable-line compat/compat
    a = [];

    for (k in props) {
      a.push(k);
    }

    return a;
  }

  return asymmetricEqualityTesterArgCompatShim;
};
