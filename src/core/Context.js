/**
 * Internal representation of a Jasmine context.
 * 
 * @constructor
 * @param {jasmine.Env} env
 * @param {Object} dataDefinitions
 * @param {Function} contextFunction
 * @param {jasmine.Context} parentContext
 */
jasmine.Context = function(env, dataDefinitions, contextFunction, parentContext) {
  var self = this;
  self.env = env;
  self.dataDefinitions = dataDefinitions;
  self.contextFunction = contextFunction;
  self.parentContext = parentContext;
};

jasmine.Context.prototype.definitions = function() {
  parentDefs = this.parentContext ? this.parentContext.definitions() : {};
  return jasmine.util.merge(parentDefs, this.dataDefinitions);
};

jasmine.Context.prototype.evaluate = function() {
  var ctxt = {};
  var memoizer = function(func) {
    var memo = null,
      evaluator = function() {
        if (memo === null) {
	  memo = func(this);
	}
	return memo;
      };

    return evaluator;
  };  
  var expandContext = function(ctxt, source) {
    var name;
    for (name in source) {
      if (source.hasOwnProperty(name)) {
	ctxt[name] = memoizer(source[name]);
      }
    }
  };
  
  expandContext(ctxt, this.definitions());

  this.contextFunction(ctxt);
};
