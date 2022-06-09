getJasmineRequireObj().clearStack = function(j$) {
  const maxInlineCallCount = 10;

  function messageChannelImpl(global, setTimeout) {
    const channel = new global.MessageChannel();
    let head = {};
    let tail = head;

    let taskRunning = false;
    channel.port1.onmessage = function() {
      head = head.next;
      const task = head.task;
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

    let currentCallCount = 0;
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

  function getClearStack(global) {
    let currentCallCount = 0;
    const realSetTimeout = global.setTimeout;
    const setTimeoutImpl = function clearStack(fn) {
      Function.prototype.apply.apply(realSetTimeout, [global, [fn, 0]]);
    };

    if (j$.isFunction_(global.setImmediate)) {
      const realSetImmediate = global.setImmediate;
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
