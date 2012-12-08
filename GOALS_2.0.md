# (Vague) Jasmine 2.0 Goals/(Guidelines)

1. No globals!
  * jasmine library is entirely inside `jasmine` namespace
  * globals required for backwards compatibility should be added in `boot.js` (EG, var describe = jasmine.getCurrentEnv().describe lives in boot.js)
1. Don't use properties as getters. Use methods.
  * Properties aren't encapsulated -- can be mutated, unsafe.
1. Reporters get data objects (no methods).
  * easier to refactor as needed
1. More unit tests - fewer nasty integration tests

## Remaining non-story-able work:
* Make a `TODO` list

### Hard
* Finish killing Globals
  * Guidlines: everything that isn't a CTOR should be closed inside `Env`, and everything that is a CTOR needs to be `new`ed inside the `Env`
  * Spies
  * jasmine.util should be util closure inside of env or something
* Suites need to be unit-tested
* Remove Queue from Suite in favor of queuerunner refactoring
* Remover Runner in favor of a top-level Suite
  * This means Env needs to `new` a `Suite` first thing
* get feature parity back on HTMLReporter

### Easy
 * Refactor `queuerunner` into a new object
 * xdescribe / xit make skipped specs instead of empty blocks
