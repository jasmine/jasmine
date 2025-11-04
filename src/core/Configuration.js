getJasmineRequireObj().Configuration = function(j$) {
  /**
   * This represents the available options to configure Jasmine.
   * Options that are not provided will use their default values.
   * @see Env#configure
   * @interface Configuration
   * @since 3.3.0
   */
  const defaultConfig = {
    /**
     * Whether to randomize spec execution order
     * @name Configuration#random
     * @since 3.3.0
     * @type Boolean
     * @default true
     */
    random: true,
    /**
     * Seed to use as the basis of randomization.
     * Null causes the seed to be determined randomly at the start of execution.
     * @name Configuration#seed
     * @since 3.3.0
     * @type (number|string)
     * @default null
     */
    seed: null,
    /**
     * Whether to stop execution of the suite after the first spec failure
     *
     * <p>In parallel mode, `stopOnSpecFailure` works on a "best effort"
     * basis. Jasmine will stop execution as soon as practical after a failure
     * but it might not be immediate.</p>
     * @name Configuration#stopOnSpecFailure
     * @since 3.9.0
     * @type Boolean
     * @default false
     */
    stopOnSpecFailure: false,
    /**
     * Whether to fail the spec if it ran no expectations. By default
     * a spec that ran no expectations is reported as passed. Setting this
     * to true will report such spec as a failure.
     * @name Configuration#failSpecWithNoExpectations
     * @since 3.5.0
     * @type Boolean
     * @default false
     */
    failSpecWithNoExpectations: false,
    /**
     * Whether to cause specs to only have one expectation failure.
     * @name Configuration#stopSpecOnExpectationFailure
     * @since 3.3.0
     * @type Boolean
     * @default false
     */
    stopSpecOnExpectationFailure: false,
    /**
     * A function that takes a spec and returns true if it should be executed
     * or false if it should be skipped.
     * @callback SpecFilter
     * @param {Spec} spec - The spec that the filter is being applied to.
     * @return boolean
     */
    /**
     * Function to use to filter specs
     * @name Configuration#specFilter
     * @since 3.3.0
     * @type SpecFilter
     * @default A function that always returns true.
     */
    specFilter: function() {
      return true;
    },
    /**
     * Whether reporters should hide disabled specs from their output.
     * Currently only supported by Jasmine's HTMLReporter
     * @name Configuration#hideDisabled
     * @since 3.3.0
     * @type Boolean
     * @default false
     */
    hideDisabled: false,
    /**
     * Clean closures when a suite is done running (done by clearing the stored function reference).
     * This prevents memory leaks, but you won't be able to run jasmine multiple times.
     * @name Configuration#autoCleanClosures
     * @since 3.10.0
     * @type boolean
     * @default true
     */
    autoCleanClosures: true,
    /**
     * Whether to forbid duplicate spec or suite names. If set to true, using
     * the same name multiple times in the same immediate parent suite is an
     * error.
     * @name Configuration#forbidDuplicateNames
     * @type boolean
     * @default false
     */
    forbidDuplicateNames: false,
    /**
     * Whether to issue warnings for certain deprecated functionality
     * every time it's used. If not set or set to false, deprecation warnings
     * for methods that tend to be called frequently will be issued only once
     * or otherwise throttled to prevent the suite output from being flooded
     * with warnings.
     * @name Configuration#verboseDeprecations
     * @since 3.6.0
     * @type Boolean
     * @default false
     */
    verboseDeprecations: false,

    /**
     * Whether to detect late promise rejection handling during spec
     * execution. If this option is enabled, a promise rejection that triggers
     * the JavaScript runtime's unhandled rejection event will not be treated
     * as an error as long as it's handled before the spec finishes.
     *
     * This option is off by default because it imposes a performance penalty.
     * @name Configuration#detectLateRejectionHandling
     * @since 5.10.0
     * @type Boolean
     * @default false
     */
    detectLateRejectionHandling: false,

    /**
     * The number of extra stack frames inserted by a wrapper around {@link it}
     * or by some other local modification. Jasmine uses this to determine the
     * filename for {@link SpecStartedEvent} and {@link SpecDoneEvent}.
     * @name Configuration#extraItStackFrames
     * @since 5.13.0
     * @type number
     * @default 0
     */
    extraItStackFrames: 0,

    /**
     * The number of extra stack frames inserted by a wrapper around
     * {@link describe} or by some other local modification. Jasmine uses this
     * to determine the filename for {@link SpecStartedEvent} and
     * {@link SpecDoneEvent}.
     * @name Configuration#extraDescribeStackFrames
     * @since 5.13.0
     * @type number
     * @default 0
     */
    extraDescribeStackFrames: 0
  };
  Object.freeze(defaultConfig);

  class Configuration {
    #values;

    constructor() {
      this.#values = { ...defaultConfig };

      for (const k of Object.keys(defaultConfig)) {
        Object.defineProperty(this, k, {
          enumerable: true,
          get() {
            return this.#values[k];
          }
        });
      }
    }

    copy() {
      return { ...this.#values };
    }

    update(changes) {
      const booleanProps = [
        'random',
        'failSpecWithNoExpectations',
        'hideDisabled',
        'stopOnSpecFailure',
        'stopSpecOnExpectationFailure',
        'autoCleanClosures',
        'forbidDuplicateNames',
        'detectLateRejectionHandling'
      ];

      for (const k of booleanProps) {
        if (typeof changes[k] !== 'undefined') {
          this.#values[k] = changes[k];
        }
      }

      if (changes.specFilter) {
        this.#values.specFilter = changes.specFilter;
      }

      // 0 and null are valid values, so a truthiness check wouldn't work
      if (typeof changes.seed !== 'undefined') {
        this.#values.seed = changes.seed;
      }

      // TODO: in the next major release, make verboseDeprecations work like
      // other boolean properties.
      if (changes.hasOwnProperty('verboseDeprecations')) {
        this.#values.verboseDeprecations = changes.verboseDeprecations;
      }

      // 0 is a valid value for both of these, so a truthiness check wouldn't work
      if (typeof changes.extraItStackFrames !== 'undefined') {
        this.#values.extraItStackFrames = changes.extraItStackFrames;
      }

      if (typeof changes.extraDescribeStackFrames !== 'undefined') {
        this.#values.extraDescribeStackFrames =
          changes.extraDescribeStackFrames;
      }
    }
  }

  return Configuration;
};
