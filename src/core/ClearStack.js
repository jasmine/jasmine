getJasmineRequireObj().clearStack = function(j$) {
  'use strict';

  const maxInlineCallCount = 10;

  function browserQueueMicrotaskImpl(global) {
    const { setTimeout, queueMicrotask } = global;
    let currentCallCount = 0;
    return function clearStack(fn) {
      currentCallCount++;

      if (currentCallCount < maxInlineCallCount) {
        queueMicrotask(fn);
      } else {
        currentCallCount = 0;
        setTimeout(fn);
      }
    };
  }

  function nodeQueueMicrotaskImpl(global) {
    const { queueMicrotask } = global;

    return function(fn) {
      queueMicrotask(fn);
    };
  }

  function messageChannelImpl(global) {
    const { MessageChannel, setTimeout } = global;
    const channel = new MessageChannel();
    let head = {};
    let tail = head;

    let taskRunning = false;
    channel.port1.onmessage = function() {
      head = head.next;
      const task = head.task;
      delete head.task;

      if (taskRunning) {
        setTimeout(task, 0);
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
    const NODE_JS =
      global.process &&
      global.process.versions &&
      typeof global.process.versions.node === 'string';

    const SAFARI =
      global.navigator &&
      /^((?!chrome|android).)*safari/i.test(global.navigator.userAgent);

    if (NODE_JS) {
      // Unlike browsers, Node doesn't require us to do a periodic setTimeout
      // so we avoid the overhead.
      return nodeQueueMicrotaskImpl(global);
    } else if (
      SAFARI ||
      j$.util.isUndefined(global.MessageChannel) /* tests */
    ) {
      // queueMicrotask is dramatically faster than MessageChannel in Safari,
      // at least through version 16.
      // Some of our own integration tests provide a mock queueMicrotask in all
      // environments because it's simpler to mock than MessageChannel.
      return browserQueueMicrotaskImpl(global);
    } else {
      // MessageChannel is faster than queueMicrotask in supported browsers
      // other than Safari.
      return messageChannelImpl(global);
    }
  }

  return getClearStack;
};
