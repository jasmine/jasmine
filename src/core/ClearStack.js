getJasmineRequireObj().clearStack = function(j$) {
  var maxInlineCallCount = 10;

  function messageChannelImpl(global, setTimeout) {
    var channel = new global.MessageChannel(),
      head = {},
      tail = head;

    var taskRunning = false;
    channel.port1.onmessage = function() {
      head = head.next;
      var task = head.task;
      delete head.task;

      if (taskRunning) {
        global.setTimeout(task, 0);
      } else {
        try {
          taskRunning = true;
          task();
        } finally {
          taskRunning = false;
        }
      }
    };

    var currentCallCount = 0;
    return function clearStack(fn) {
      currentCallCount++;

      if (currentCallCount < maxInlineCallCount) {
        tail = tail.next = { task: fn };
        channel.port2.postMessage(0);
      } else {
        currentCallCount = 0;
        setTimeout(fn);
      }
    };
  }

  function ieSeleniumCompatImpl(global) {
    // When both IE and the JS selenium-webdriver are used, the driver's
    // executeScript() method tends to fail after the first few calls.
    // Doing a setTimeout with an actual delay every time fixes this, perhaps
    // by giving the JS injected by Selenium more chances to run. However,
    // it also slows things down significantly, especially on non-IE browsers.
    // So it's not the default.
    var realSetTimeout = global.setTimeout;

    return function clearStack(fn) {
      Function.prototype.apply.apply(realSetTimeout, [global, [fn, 25]]);
    };
  }

  function getClearStack(global, options) {
    var currentCallCount = 0;
    var realSetTimeout = global.setTimeout;
    var setTimeoutImpl = function clearStack(fn) {
      Function.prototype.apply.apply(realSetTimeout, [global, [fn, 0]]);
    };

    if (options && options.slowIeSeleniumCompat) {
      return ieSeleniumCompatImpl(global);
    } else if (j$.isFunction_(global.setImmediate)) {
      var realSetImmediate = global.setImmediate;
      return function(fn) {
        currentCallCount++;

        if (currentCallCount < maxInlineCallCount) {
          realSetImmediate(fn);
        } else {
          currentCallCount = 0;

          setTimeoutImpl(fn);
        }
      };
    } else if (!j$.util.isUndefined(global.MessageChannel)) {
      return messageChannelImpl(global, setTimeoutImpl);
    } else {
      return setTimeoutImpl;
    }
  }

  return getClearStack;
};
