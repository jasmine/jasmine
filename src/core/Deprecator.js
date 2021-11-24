getJasmineRequireObj().Deprecator = function(j$) {
  function Deprecator(topSuite) {
    this.topSuite_ = topSuite;
    this.verbose_ = false;
    this.toSuppress_ = [];
  }

  var verboseNote =
    'Note: This message will be shown only once. Set the verboseDeprecations ' +
    'config property to true to see every occurrence.';

  Deprecator.prototype.verboseDeprecations = function(enabled) {
    this.verbose_ = enabled;
  };

  // runnable is a spec or a suite.
  // deprecation is a string or an Error.
  // See Env#deprecated for a description of the options argument.
  Deprecator.prototype.addDeprecationWarning = function(
    runnable,
    deprecation,
    options
  ) {
    options = options || {};

    if (!this.verbose_ && !j$.isError_(deprecation)) {
      if (this.toSuppress_.indexOf(deprecation) !== -1) {
        return;
      }
      this.toSuppress_.push(deprecation);
    }

    this.log_(runnable, deprecation, options);
    this.report_(runnable, deprecation, options);
  };

  Deprecator.prototype.log_ = function(runnable, deprecation, options) {
    var context;

    if (j$.isError_(deprecation)) {
      console.error(deprecation);
      return;
    }

    if (runnable === this.topSuite_ || options.ignoreRunnable) {
      context = '';
    } else if (runnable.children) {
      context = ' (in suite: ' + runnable.getFullName() + ')';
    } else {
      context = ' (in spec: ' + runnable.getFullName() + ')';
    }

    if (!options.omitStackTrace) {
      context += '\n' + this.stackTrace_();
    }

    if (!this.verbose_) {
      context += '\n' + verboseNote;
    }

    console.error('DEPRECATION: ' + deprecation + context);
  };

  Deprecator.prototype.stackTrace_ = function() {
    var formatter = new j$.ExceptionFormatter();
    return formatter.stack(j$.util.errorWithStack()).replace(/^Error\n/m, '');
  };

  Deprecator.prototype.report_ = function(runnable, deprecation, options) {
    if (options.ignoreRunnable) {
      runnable = this.topSuite_;
    }

    if (j$.isError_(deprecation)) {
      runnable.addDeprecationWarning(deprecation);
      return;
    }

    if (!this.verbose_) {
      deprecation += '\n' + verboseNote;
    }

    runnable.addDeprecationWarning({
      message: deprecation,
      omitStackTrace: options.omitStackTrace || false
    });
  };

  return Deprecator;
};
