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
    var self = Object.create(matchersUtil);

    copyAndDeprecate(self, customEqualityTesters, 'length');

    for (i = 0; i < customEqualityTesters.length; i++) {
      copyAndDeprecate(self, customEqualityTesters, i);
    }

    // Avoid copying array props if we've previously done so,
    // to avoid triggering our own deprecation warnings.
    if (!self.isAsymmetricEqualityTesterArgCompatShim_) {
      copyAndDeprecateArrayMethods(self);
    }

    self.isAsymmetricEqualityTesterArgCompatShim_ = true;
    return self;
  }

  function copyAndDeprecateArrayMethods(dest) {
    var props = arrayProps(),
      i,
      k;

    for (i = 0; i < props.length; i++) {
      k = props[i];

      // Skip length (dealt with above), and anything that collides with
      // MatchesUtil e.g. an Array.prototype.contains method added by user code
      if (k !== 'length' && !dest[k]) {
        copyAndDeprecate(dest, Array.prototype, k);
      }
    }
  }

  function copyAndDeprecate(dest, src, propName) {
    Object.defineProperty(dest, propName, {
      get: function() {
        j$.getEnv().deprecated(
          'The second argument to asymmetricMatch is now a ' +
            'MatchersUtil. Using it as an array of custom equality testers is ' +
            'deprecated and will stop working in a future release. ' +
            'See <https://jasmine.github.io/tutorials/upgrading_to_Jasmine_4.0#asymmetricMatch-cet> for details.'
        );
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
