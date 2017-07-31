# Release 1.0.1.1 — November 9, 2010

## Jasmine Gem

## Bugs fixed
*  Rails 3.0 and RSpec 2.0 are now supported.


## Known issues
*  Rails 3 generators are not yet implemented -- coming soon!


-----
# Release 1.0.1 — October 5, 2010
-----

## Jasmine Core

## Bugs fixed
*  Bug fixes for Internet Explorer (thanks fschwiet, fabiomcosta, and jfirebaugh).


## Jasmine Gem

## Bugs fixed
*  Bug fix for Windows (thanks jfirebaugh).


-----
# Release 1.0 — September 14, 2010
-----

## Jasmine Core

## Features
*  `waitsFor()` arguments can now be specified in any order. Timeout and message are optional.
*  The default `waitsFor()` timeout period is now specified in `env.defaultTimeoutInterval`; the default value is 5 seconds.
*  Added link to jasmine site from html runner.
*  Added license file to standalone distribution.
*  New friendly version number.


## Bugs fixed
*  `waitsFor()` hanged forever if latch function never returned true.
*  The `not.toThrow()` matcher threw an exception when used with no args.
*  The `toThrow()` matcher, when inverted, gave misleading failure messages.
*  Spy matchers, when inverted, gave misleading failure messages.


## Deprecations
*  Deprecated `waits()` block in favor of `waitsFor()`; `waits()` will be removed in a future release.
*  Deprecated `toNotBe()`, `toNotEqual()`, `toNotMatch()`, and `toNotContain()` matchers; they will be removed in a future release.
*  Console X was removed from the distribution as it was no longer used.
*  To give us some flexibility for future features, wrapped matcher functions now return `undefined` (they previously returned `true` or `false`, but this was undocumented).


## Jasmine Gem

## Features
*  Jasmine now supports JRuby.
*  Jasmine now supports Ruby 1.9.


## Bugs fixed
*  Various generator issues fixed.


## Known issues
*  Rails 3 and RSpec 2 are not yet fully supported.


-----
# Release 0.11.1 — June 25, 2010
-----

## Jasmine Core

### Features
*  Jasmine no longer logs "Jasmine Running…" messages to the log by default. This can be enabled in runner.html by adding 'trivialReporter.logRunningSpecs = true;'.
*  The `wasCalled()`, `wasCalledWith()`, `wasNotCalled()` and `wasNotCalledWith()` matchers have been deprecated. The new matchers `toHaveBeenCalled()` and `toHaveBeenCalledWith()` have been added. You can use the `not` prefix to achieve equivalent of the `wasNot…()` expectation (e.g. `not.toHaveBeenCalled()`).


## Notables
*  A barebones version of Jasmine is now available on <a href="http://pivotal.github.com/jasmine/">http://pivotal.github.com/jasmine/</a>.


-----
# Release 0.11.0 — June 23, 2010
-----
## Jasmine Core

## Features
*  The version number has been removed from the generated single-file /lib/jasmine.js. We're also now uploading this file, with the version number in the filename, to github's Downloads page.
*  Old-style matchers (those using this.report(), from before 0.10.x) are no longer supported. See the <span class="caps">README</span> for instructions on writing new-style matchers.
*  <strong>jasmine.log</strong> pretty-prints its parameters to the spec's output.
*  Jasmine no longer depends on 'window'.
*  <span class="caps">HTML</span> runner should show number of passes/fails by spec, not expectation.
*  Small modification to JsApiReporter data format.


## Bugs fixed:
*  If multiple beforeEach blocks were declared, they were executed in reverse order.
*  Specs with duplicate names confused TrivialReporter output.
*  Errors in describe functions caused later tests to be weirdly nested.
*  Nested specs weren't reported properly by the JsApiReporter.


## Known issues:
*  If you turn on the mock clock, you'll get a spurious log message at the end of your spec.

