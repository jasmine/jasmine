jasmine.PrettyPrinter = (function(){ 
	var _this = this /* @private scoped reference to "this".  (Avoids confusion/mistakes when scope of "this" changes due to events, apply, call, etc. */
		, _undefined_  = jasmine.___undefined___ /* @private scoped reference to "undefined" */
	;

	/**
	 * @private
	 */
	function _unimplementedMethod_() {
	  throw new Error("unimplemented method");
	};
	
	
	/**
	 * Base class for pretty printing for expectation results.
	 */
	function _PrettyPrinter () {
	  this.ppNestLevel_ = 0;
	};
	
	/**
	 * Formats a value in a nice, human-readable string.
	 *
	 * @param value
	 */
	_PrettyPrinter.prototype.format = function(value) {
	  if (this.ppNestLevel_ > 40) {
	    throw new Error('_PrettyPrinter: format() nested too deeply!');
	  }
	
	  this.ppNestLevel_++;
	  try {
	    if (value === _undefined_) {
	      this.emitScalar('undefined');
	    } else if (value === null) {
	      this.emitScalar('null');
	    } else if (value === jasmine.getGlobal()) {
	      this.emitScalar('<global>');
	    } else if (value instanceof jasmine.Matchers.Any) {
	      this.emitScalar(value.toString());
	    } else if (typeof value === 'string') {
	      this.emitString(value);
	    } else if (jasmine.isSpy(value)) {
	      this.emitScalar("spy on " + value.identity);
	    } else if (value instanceof RegExp) {
	      this.emitScalar(value.toString());
	    } else if (typeof value === 'function') {
	      this.emitScalar('Function');
	    } else if (typeof value.nodeType === 'number') {
	      this.emitScalar('HTMLNode');
	    } else if (value instanceof Date) {
	      this.emitScalar('Date(' + value + ')');
	    } else if (value.__Jasmine_been_here_before__) {
	      this.emitScalar('<circular reference: ' + (jasmine.isArray_(value) ? 'Array' : 'Object') + '>');
	    } else if (jasmine.isArray_(value) || typeof value == 'object') {
	      value.__Jasmine_been_here_before__ = true;
	      if (jasmine.isArray_(value)) {
	        this.emitArray(value);
	      } else {
	        this.emitObject(value);
	      }
	      delete value.__Jasmine_been_here_before__;
	    } else {
	      this.emitScalar(value.toString());
	    }
	  } finally {
	    this.ppNestLevel_--;
	  }
	};
	
	_PrettyPrinter.prototype.iterateObject = function(obj, fn) {
	  for (var property in obj) {
	    if (property == '__Jasmine_been_here_before__') continue;
	    fn(property, obj.__lookupGetter__ ? (obj.__lookupGetter__(property) != null) : false);
	  }
	};
	
	_PrettyPrinter.prototype.emitArray = _unimplementedMethod_;
	_PrettyPrinter.prototype.emitObject = _unimplementedMethod_;
	_PrettyPrinter.prototype.emitScalar = _unimplementedMethod_;
	_PrettyPrinter.prototype.emitString = _unimplementedMethod_;
	
	return _PrettyPrinter;
})();

jasmine.StringPrettyPrinter = function() {
  jasmine.PrettyPrinter.call(this);

  this.string = '';
};
jasmine.util.inherit(jasmine.StringPrettyPrinter, jasmine.PrettyPrinter);

jasmine.StringPrettyPrinter.prototype.emitScalar = function(value) {
  this.append(value);
};

jasmine.StringPrettyPrinter.prototype.emitString = function(value) {
  this.append("'" + value + "'");
};

jasmine.StringPrettyPrinter.prototype.emitArray = function(array) {
  this.append('[ ');
  for (var i = 0; i < array.length; i++) {
    if (i > 0) {
      this.append(', ');
    }
    this.format(array[i]);
  }
  this.append(' ]');
};

jasmine.StringPrettyPrinter.prototype.emitObject = function(obj) {
  var self = this;
  this.append('{ ');
  var first = true;

  this.iterateObject(obj, function(property, isGetter) {
    if (first) {
      first = false;
    } else {
      self.append(', ');
    }

    self.append(property);
    self.append(' : ');
    if (isGetter) {
      self.append('<getter>');
    } else {
      self.format(obj[property]);
    }
  });

  this.append(' }');
};

jasmine.StringPrettyPrinter.prototype.append = function(value) {
  this.string += value;
};
