getJasmineRequireObj().clearStack = function(j$) {
  const maxInlineCallCount = 10;
  const maxSetTimeoutWithoutClampingCallCount = 4;

  function browserQueueMicrotaskImpl(global) {
    const postMessage = postMessageImpl(global);
    const { setTimeout, queueMicrotask } = global;
    let currentCallCount = 0;
    let currentSetTimeoutCallCount = 0;
    return function clearStack(fn) {
      currentCallCount++;

      if (currentCallCount < maxInlineCallCount) {
        queueMicrotask(fn);
      } else {
        currentCallCount = 0;
        currentSetTimeoutCallCount++;

        if (
          currentSetTimeoutCallCount < maxSetTimeoutWithoutClampingCallCount
        ) {
          setTimeout(fn);
        } else {
          currentSetTimeoutCallCount = 0;
          setTimeout(function() {
            postMessage(fn);
          });
        }
      }
    };
  }

  function nodeQueueMicrotaskImpl(global) {
    const { queueMicrotask } = global;

    return function(fn) {
      queueMicrotask(fn);
    };
  }

  function postMessageImpl(global) {
    if (j$.util.isUndefined(global.MessageChannel)) {
      return function callDummy(fn) {
        fn();
      };
    }

    const { MessageChannel } = global;
    const channel = new MessageChannel();
    let head = {};
    let tail = head;

    let taskRunning = false;
    channel.port1.onmessage = function() {
      head = head.next;
      const task = head.task;
      delete head.task;

      if (taskRunning) {
        setTimeout(task);
      } else {
        try {
          taskRunning = true;
          task();
        } finally {
          taskRunning = false;
        }
      }
    };

    return function postMessage(fn) {
      tail = tail.next = { task: fn };
      channel.port2.postMessage(0);
    };
  }

  function getClearStack(global) {
    const NODE_JS =
      global.process &&
      global.process.versions &&
      typeof global.process.versions.node === 'string';

    if (NODE_JS) {
      // Unlike browsers, Node doesn't require us to do a periodic setTimeout
      // so we avoid the overhead.
      return nodeQueueMicrotaskImpl(global);
    } else {
      // queueMicrotask is potentially faster than MessageChannel. Caveats:
      // * It requires us to do a periodic setTimeout.
      // * Periodic setTimeout needs protection against 4 ms clamping.
      return browserQueueMicrotaskImpl(global);
    }
  }

  return getClearStack;
};
