getJasmineRequireObj().MockDate = function() {
  function MockDate(global) {
    var self = this;
    var currentTime = 0;

    if (!global || !global.Date) {
      self.install = function() {};
      self.tick = function() {};
      self.reset = function() {};
      return self;
    }

    self.install = function(mockDate) {
      if (mockDate instanceof Date) {
        currentTime = mockDate.getTime();
      } else {
        currentTime = global.Date.now();
      }
    };

    self.tick = function(millis) {
      millis = millis || 0;
      currentTime = currentTime + millis;
    };

    self.reset = function() {
      currentTime = 0;
    };

    self.Date = FakeDate;

    createDateProperties();

    return self;

    function FakeDate() {
      if (arguments.length === 0) {
        return new global.Date(currentTime);
      } else {
        return global.Date.apply(this, arguments);
      }
	  }

    function createDateProperties() {
      FakeDate.prototype = global.Date.prototype;

      FakeDate.now = function() {
        return currentTime;
      }

      FakeDate.toSource = global.Date.toSource;
      FakeDate.toString = global.Date.toString;
      FakeDate.parse = global.Date.parse;
      FakeDate.UTC = global.Date.UTC;
    }
	}

  return MockDate;
};
