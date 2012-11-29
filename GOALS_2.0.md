# (Vague) Jasmine 2.0 Goals/(Guidelines)

1. No globals!
  * jasmine library is entirely inside `jasmine` namespace
  * globals required for backwards compatibility should be added in `boot.js` (EG, var describe = jasmine.getCurrentEnv().describe lives in boot.js)
1. Don't use properties as getters. Use methods.
  * Properties aren't encapsulated -- can be mutated, unsafe.
1. Reporters get data objects (no methods).
  * easier to refactor as needed

