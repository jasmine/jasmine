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
  * Guidelines:
    * New objects can have constructors on `jasmine`
    * Top level functions can live on `jasmine`
    * Top level (i.e., any `jasmine` property) should only be referenced inside the `Env` constructor
  * Spies
  * isA functions:
    * isArray_ - used in matchers and spies
    * isString_
    * isDOMNode_
    * isA_
  * unimplementedMethod_, used by PrettyPrinter
  * jasmine.util should be util closure inside of env or something
    * argsToArray is used for Spies and matching
    * inherit is for how matchers are added/mixed in, reporters, and pretty printers
    * formatException is used only inside Env/spec
    * htmlEscape is for messages in matchers - should this be HTML at all? Is that * Matchers improvements
  * move AddMatchers to Env & global (away from spec)
  * make matchers unit-testable
  * write doc on how to make a matcher

### Easy

## Other Topics

* Build - can we, should we redo the build and release process AGAIN in order to make it less arcane
  * Want to add JSHint to build
  * Use a standard JS/Node based concat system instead of custom Ruby?
* Docs
  * JsDoc is a pain to host and RubyMine is pretty good at navigating. I say we kill it officially
  * Docco has gone over well. Should we annotate all the sources and then have Pages be more complex, having tutorials and annotated source like Backbone? Are we small enough?
