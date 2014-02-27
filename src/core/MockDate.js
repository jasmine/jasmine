getJasmineRequireObj().MockDate = function() {
  function MockDate(global) {
    var self = this;
    var currentTime = 0;

    if (!global || !global.Date) {
      self.install = function() {};
      self.tick = function() {};
      self.uninstall = function() {};
      return self;
    }

    var GlobalDate = global.Date;

    self.install = function(mockDate) {
      if (mockDate instanceof Date) {
        currentTime = mockDate.getTime();
      } else {
        currentTime = GlobalDate.now();
      }

      global.Date = FakeDate;
    };

    self.tick = function(millis) {
      millis = millis || 0;
      currentTime = currentTime + millis;
    };

    self.uninstall = function() {
      currentTime = 0;
      global.Date = GlobalDate;
    };

    createDateProperties();

    return self;

    function FakeDate() {
      if (arguments.length === 0) {
        return new GlobalDate(currentTime);
      } else {
        return new GlobalDate(arguments[0], arguments[1], arguments[2],
          arguments[3], arguments[4], arguments[5], arguments[6]);
      }
    }

    function createDateProperties() {

      FakeDate.now = function() {
        return currentTime;
      };

      FakeDate.toSource = GlobalDate.toSource;
      FakeDate.toString = GlobalDate.toString;
      FakeDate.parse = GlobalDate.parse;
      FakeDate.UTC = GlobalDate.UTC;
    }
	}

  return MockDate;
};
